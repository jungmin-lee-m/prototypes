// 검사결과 뷰어 — 앱 내 전체화면 오버레이로 열림
import { useState, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ReferenceArea, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
// resultType:
//   "numeric"        — 단일 수치 (대다수). refMin/refMax 로 high/low 판정.
//   "qualitative"    — 수치 base + displayFn 으로 Pos/Neg·Trace/+1 등 정성 표기.
//   "multi-numeric"  — 여러 라벨된 수치 (예: HbA1c → NGSP/IFCC/eAG). 셀엔 주값 + ⋯, 호버에 전체.
//   "image"          — PACS 연동 영상·내시경·EKG. 셀엔 📷, 호버에 텍스트 소견 (짧/긴 모두).
//   "pdf"            — PDF 문서 (종합검진·MRI 판독 등). 셀엔 📄, 클릭 시 뷰어.
interface LabRow {
  id: string;
  category: string;
  name: string;
  refRange: string;
  refMin?: number;
  refMax?: number;
  decimals?: number;
  // values 는 결과 타입에 따라 다음 값을 가짐:
  //   numeric/qualitative: number | null
  //   multi-numeric:       number | null (주값 — 셀에 표시. 부가 라벨된 값은 multiValues 에)
  //   image:               string | null (소견 텍스트)
  //   pdf:                 string | null (파일명)
  values: (number | string | null)[];
  // multi-numeric 전용 — 각 날짜별 라벨/값 쌍 (주값을 포함한 전체 항목).
  // null = 해당 날짜 미시행 (values 와 동일하게 null 유지).
  multiValues?: ({ label: string; value: string }[] | null)[];
  displayFn?: (v: number) => string;
  isHeader?: boolean;
  isCalc?: boolean;
  calcFormula?: string;
  defaultFav?: boolean;
  resultType?: "numeric" | "qualitative" | "multi-numeric" | "image" | "pdf";
}
type VStatus = "normal" | "high" | "low" | "empty";

// ─── 날짜 (12 내원일) ────────────────────────────────────────────────────────
const DATES = [
  "2022.06.08","2022.07.01","2022.07.26","2022.08.10",
  "2022.11.15","2023.02.20","2023.06.14","2023.11.08",
  "2024.03.19","2024.09.25","2025.04.10","2026.01.15",
];

// ─── 컬럼 정의 ──────────────────────────────────────────────────────────────
// sticky 좌측 컬럼은 사용자 설정으로 표시/숨김 가능. 핵심(★/검사명) 만 강제 노출.
type ColumnId = "fav" | "category" | "userCode" | "vendorCode" | "name" | "vendorName" | "refRange";
interface ColumnDef {
  id: ColumnId;
  label: string;
  width: number;
  defaultVisible: boolean;
  alwaysOn?: boolean;     // true → 설정에서 끌 수 없음 (핵심 컬럼)
}
const COLUMN_DEFS: ColumnDef[] = [
  { id: "fav",        label: "★",            width: 32,  defaultVisible: true,  alwaysOn: true },
  { id: "category",   label: "검사종류",     width: 80,  defaultVisible: true  },
  { id: "userCode",   label: "사용자코드",   width: 76,  defaultVisible: false },
  { id: "vendorCode", label: "수탁사코드",   width: 96,  defaultVisible: false },
  // 검사명 / 수탁사 검사명 — 둘 중 하나는 반드시 노출 (toggleColumn 에서 pair 제약 강제).
  // 어느 하나가 마지막이면 그 자체는 끌 수 없고, 둘 다 켜진 상태에서는 자유롭게 끄기 가능.
  { id: "name",       label: "검사명",       width: 200, defaultVisible: true  },
  { id: "vendorName", label: "수탁사 검사명", width: 150, defaultVisible: false },
  { id: "refRange",   label: "참고치",       width: 110, defaultVisible: true  },
];
const DEFAULT_VISIBLE_COLS = new Set<ColumnId>(COLUMN_DEFS.filter(c => c.defaultVisible).map(c => c.id));

// 사용자코드 / 수탁사코드 / 수탁사 검사명 (영문) — id 키 기반 lookup.
// 캡처 화면의 GC Labs 형식 참고 (D{number}HZ 패턴).
const LAB_VENDOR_INFO: Record<string, { userCode?: string; vendorCode?: string; vendorName?: string }> = {
  h1:    { userCode: "GLU",  vendorCode: "D302200HZ", vendorName: "Glucose(S)" },
  h2:    { userCode: "HBA",  vendorCode: "D206300HZ", vendorName: "HbA1c" },
  h3:    { userCode: "HGB",  vendorCode: "D100200HZ", vendorName: "Hemoglobin" },
  h4:    { userCode: "PLT",  vendorCode: "D100400HZ", vendorName: "Platelet" },
  h5:    { userCode: "WBC",  vendorCode: "D100100HZ", vendorName: "WBC count" },
  h6:    { userCode: "AST",  vendorCode: "D188000HZ", vendorName: "AST(SGOT)" },
  h7:    { userCode: "ALT",  vendorCode: "D185000HZ", vendorName: "ALT(SGPT)" },
  h8:    { userCode: "GGT",  vendorCode: "D189000HZ", vendorName: "γ-GT" },
  h9:    { userCode: "CRE",  vendorCode: "D158000HZ", vendorName: "Creatinine(S)" },
  h10:   { userCode: "UA",   vendorCode: "D162000HZ", vendorName: "Uric acid" },
  c1:    { userCode: "TG",   vendorCode: "D263000HZ", vendorName: "Triglyceride" },
  c2:    { userCode: "TC",   vendorCode: "D261100HZ", vendorName: "Cholesterol,total" },
  c3:    { userCode: "HDL",  vendorCode: "D261300HZ", vendorName: "HDL Cholesterol" },
  c4:    { userCode: "LDL",  vendorCode: "D261400HZ", vendorName: "LDL Cholesterol" },
  c5:    { userCode: "HBS",  vendorCode: "D470100HZ", vendorName: "HBsAg" },
  c6:    { userCode: "HBA",  vendorCode: "D470200HZ", vendorName: "HBsAb" },
  c8:    { userCode: "INS",  vendorCode: "D304100HZ", vendorName: "Insulin,fasting" },
  u0:    { userCode: "UA-G", vendorCode: "D710000HZ", vendorName: "Urinalysis,general" },
  u1:    { userCode: "U-PR", vendorCode: "D710100HZ", vendorName: "U-Protein" },
  u2:    { userCode: "U-GL", vendorCode: "D710200HZ", vendorName: "U-Glucose" },
  u3:    { userCode: "U-BL", vendorCode: "D710300HZ", vendorName: "U-Blood" },
  u4:    { userCode: "U-PH", vendorCode: "D710400HZ", vendorName: "U-pH" },
  u5:    { userCode: "U-SG", vendorCode: "D710500HZ", vendorName: "U-Specific gravity" },
  u6:    { userCode: "U-WB", vendorCode: "D710600HZ", vendorName: "U-WBC,micro" },
  calc1: { userCode: "FIB4", vendorCode: "—",         vendorName: "FIB-4 index" },
  calc2: { userCode: "GFR",  vendorCode: "—",         vendorName: "eGFR (CKD-EPI)" },
  calc3: { userCode: "ASC",  vendorCode: "—",         vendorName: "ASCVD risk" },
  calc4: { userCode: "HOM",  vendorCode: "—",         vendorName: "HOMA-IR" },
  calc5: { userCode: "A/A",  vendorCode: "—",         vendorName: "AST/ALT ratio" },
  calc6: { userCode: "LDF",  vendorCode: "—",         vendorName: "LDL-C (Friedewald)" },
  calc7: { userCode: "NHC",  vendorCode: "—",         vendorName: "non-HDL Cholesterol" },
  calc8: { userCode: "TCH",  vendorCode: "—",         vendorName: "TC/HDL ratio" },
};
// 누락된 id 에 대한 fallback — userCode 는 id 대문자, vendorCode 는 "—", vendorName 은 한글명 그대로
const vendorInfo = (row: LabRow) => ({
  userCode:   LAB_VENDOR_INFO[row.id]?.userCode   ?? row.id.toUpperCase(),
  vendorCode: LAB_VENDOR_INFO[row.id]?.vendorCode ?? "—",
  vendorName: LAB_VENDOR_INFO[row.id]?.vendorName ?? row.name,
});

const W_DATE = 86;                  // 기본 데이터 셀 폭 (수치·정성)
const W_DATE_FINDING = 180;         // 소견검사만 보기 모드 — 텍스트가 잘 읽히도록 확대

// ─── 그래프 색상 팔레트 ──────────────────────────────────────────────────────
const GCOLS = ["var(--brand-primary)","var(--orange-500)","var(--green-500)","var(--red-500)","var(--violet-500)","var(--orange-500)","var(--green-500)","var(--brand-primary)"];

// ─── 정성 결과 표시 함수 ─────────────────────────────────────────────────────
const uSemi = (v: number) => v===0?"Neg":v===0.5?"Trace":v===1?"+1":v===2?"+2":String(v);
const negPos = (v: number) => v >= 1 ? "Pos" : "Neg";
const nilm   = (v: number) => v >= 1 ? "ASCUS" : "NILM";

// ─── 더미 검사 데이터 ─────────────────────────────────────────────────────────
// d0=2022.06.08 … d11=2026.01.15 (총 12개 날짜)
// 자동계산 행(isCalc=true) 은 카테고리 "자동계산" 으로 별도 표시되되,
// 데이터 배열 순서상 기반 검사값 바로 다음에 위치 → 의미 있는 시각적 인접.
const LAB: LabRow[] = [
  // 소변 ─────────────────────────────────────────────────────────────────────
  { id:"u0",  category:"소변", name:"요 일반검사 [화학반응·육안]", refRange:"—",
    values:[0,null,0,0,null,0,null,0,null,0,0,0], isHeader:true },
  { id:"u1",  category:"소변", name:"Protein", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,0,0,null,0.5,null,0,null,0,0,0], displayFn:uSemi, resultType:"qualitative" },
  { id:"u2",  category:"소변", name:"Glucose", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,0,0,null,0,null,0,null,1,0,0], displayFn:uSemi, resultType:"qualitative" },
  { id:"u3",  category:"소변", name:"Blood", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,1,0,null,0,null,0,null,0,0,0], displayFn:uSemi, resultType:"qualitative" },
  { id:"u4",  category:"소변", name:"pH", refRange:"4.5~8.0",
    refMin:4.5, refMax:8.0, values:[7.2,null,6.5,7.0,null,6.0,null,6.5,null,7.0,6.5,7.0], decimals:1 },
  { id:"u5",  category:"소변", name:"비중 (Sp. Gr.)", refRange:"1.005~1.030",
    refMin:1.005, refMax:1.030, values:[1.020,null,1.018,1.022,null,1.010,null,1.015,null,1.012,1.018,1.020], decimals:3 },
  { id:"u6",  category:"소변", name:"WBC (현미경)", refRange:"0~5 /HPF",
    refMin:0, refMax:5, values:[2,null,3,2,null,6,null,3,null,2,3,2] },

  // ─ 진단혈액·당대사 (공복혈당 + HbA1c + HOMA-IR 인접) ─
  { id:"h1",  category:"진단혈액", name:"공복혈당", refRange:"70~99 mg/dL",
    refMin:70, refMax:99, values:[92,null,null,95,null,101,null,108,null,112,115,118], defaultFav:true },
  // HbA1c — 다중 수치 결과. 셀엔 NGSP(주값)만 표시, 호버 시 IFCC/eAG 포함 전체 노출.
  // NGSP→IFCC: IFCC = (NGSP - 2.15) × 10.929
  // NGSP→eAG:  eAG (mg/dL) = (NGSP × 28.7) - 46.7
  { id:"h2",  category:"진단혈액", name:"HbA1c", refRange:"NGSP <5.7%",
    refMin:0, refMax:5.6, values:[null,null,null,5.5,null,5.8,null,6.1,null,6.3,6.4,6.5], decimals:1, defaultFav:true,
    resultType:"multi-numeric",
    multiValues:[null,null,null,
      [{label:"NGSP",value:"5.5%"},{label:"IFCC",value:"37 mmol/mol"},{label:"eAG",value:"111 mg/dL"}],
      null,
      [{label:"NGSP",value:"5.8%"},{label:"IFCC",value:"40 mmol/mol"},{label:"eAG",value:"119 mg/dL"}],
      null,
      [{label:"NGSP",value:"6.1%"},{label:"IFCC",value:"43 mmol/mol"},{label:"eAG",value:"128 mg/dL"}],
      null,
      [{label:"NGSP",value:"6.3%"},{label:"IFCC",value:"45 mmol/mol"},{label:"eAG",value:"134 mg/dL"}],
      [{label:"NGSP",value:"6.4%"},{label:"IFCC",value:"46 mmol/mol"},{label:"eAG",value:"137 mg/dL"}],
      [{label:"NGSP",value:"6.5%"},{label:"IFCC",value:"48 mmol/mol"},{label:"eAG",value:"140 mg/dL"}],
    ],
  },
  { id:"c8",  category:"임상화학", name:"공복인슐린", refRange:"2.6~24.9 μIU/mL",
    refMin:2.6, refMax:24.9, values:[8.2,null,null,null,null,9.5,null,null,null,11.2,null,13.8], decimals:1 },
  { id:"calc4", category:"자동계산", name:"HOMA-IR (인슐린 저항성)", refRange:"<2.5",
    refMin:0, refMax:2.5, values:[1.9,null,null,2.0,null,2.4,null,2.5,null,3.1,3.3,4.0],
    decimals:2, isCalc:true, calcFormula:"공복혈당 × 공복인슐린 ÷ 405\n→ 공복혈당(h1) + 공복인슐린(c8) 기반", defaultFav:true },

  // ─ 진단혈액·기본 혈구 ─
  { id:"h3",  category:"진단혈액", name:"혈색소 (Hgb)", refRange:"12.0~16.0 g/dL",
    refMin:12, refMax:16, values:[13.5,null,null,13.2,null,12.8,null,12.5,null,12.2,12.0,11.8], decimals:1 },
  { id:"h4",  category:"진단혈액", name:"혈소판 (PLT)", refRange:"150~400 ×10³/μL",
    refMin:150, refMax:400, values:[280,null,null,265,null,258,null,245,null,240,235,230] },
  { id:"h5",  category:"진단혈액", name:"백혈구 (WBC)", refRange:"4.0~10.0 ×10³/μL",
    refMin:4.0, refMax:10.0, values:[6.2,null,null,6.5,null,7.2,null,6.8,null,7.5,7.2,8.1], decimals:1 },

  // ─ 진단혈액·간기능 (AST + ALT + γ-GTP + FIB-4 + AST/ALT ratio 인접) ─
  { id:"h6",  category:"진단혈액", name:"AST (SGOT)", refRange:"0~40 U/L",
    refMin:0, refMax:40, values:[28,null,null,32,null,42,null,38,null,45,41,48] },
  { id:"h7",  category:"진단혈액", name:"ALT (SGPT)", refRange:"0~35 U/L",
    refMin:0, refMax:35, values:[22,null,null,25,null,38,null,42,null,48,45,52] },
  { id:"h8",  category:"진단혈액", name:"γ-GTP", refRange:"8~35 U/L",
    refMin:8, refMax:35, values:[22,null,null,25,null,38,null,41,null,48,52,58] },
  { id:"calc1", category:"자동계산", name:"FIB-4 (간섬유화도)", refRange:"<1.30",
    refMin:0, refMax:1.30, values:[1.11,null,null,1.15,null,1.28,null,1.35,null,1.48,1.45,1.51],
    decimals:2, isCalc:true, calcFormula:"(나이 × AST) ÷ (PLT × √ALT)\n→ AST(h6) + ALT(h7) + PLT(h4) 기반" },
  { id:"calc5", category:"자동계산", name:"AST/ALT 비", refRange:"<1.5",
    refMin:0, refMax:1.5, values:[1.27,null,null,1.28,null,1.11,null,0.90,null,0.94,0.91,0.92],
    decimals:2, isCalc:true, calcFormula:"AST ÷ ALT\n→ 알코올성 간질환 평가 시 >2 의미 있음" },

  // ─ 진단혈액·신기능 (크레아티닌 + 요산 + eGFR 인접) ─
  { id:"h9",  category:"진단혈액", name:"혈청 크레아티닌", refRange:"0.5~1.1 mg/dL",
    refMin:0.5, refMax:1.1, values:[0.85,null,null,0.88,null,0.90,null,0.92,null,0.98,1.02,1.05], decimals:2 },
  { id:"h10", category:"진단혈액", name:"요산 (Uric acid)", refRange:"2.4~6.0 mg/dL",
    refMin:2.4, refMax:6.0, values:[4.2,null,null,4.5,null,4.8,null,5.1,null,5.5,5.8,6.2], decimals:1 },
  { id:"calc2", category:"자동계산", name:"eGFR (CKD-EPI)", refRange:">60 mL/min",
    refMin:60, refMax:999, values:[78,null,null,76,null,74,null,72,null,68,65,62],
    isCalc:true, calcFormula:"CKD-EPI 공식\n→ 혈청 크레아티닌(h9)·나이·성별 기반 신기능 추정" },

  // ─ 임상화학·지질 (TC + HDL + LDL + TG + non-HDL + TC/HDL + LDL-F + ASCVD 인접) ─
  { id:"c1",  category:"임상화학", name:"트리글리세라이드", refRange:"0~149 mg/dL",
    refMin:0, refMax:149, values:[142,null,null,168,null,182,null,195,null,188,201,195] },
  { id:"c2",  category:"임상화학", name:"총콜레스테롤 (TC)", refRange:"0~199 mg/dL",
    refMin:0, refMax:199, values:[195,null,null,202,null,208,null,215,null,218,212,220] },
  { id:"c3",  category:"임상화학", name:"HDL콜레스테롤", refRange:">60 mg/dL",
    refMin:60, refMax:999, values:[58,null,null,55,null,52,null,51,null,50,48,47] },
  { id:"c4",  category:"임상화학", name:"LDL콜레스테롤 (직접)", refRange:"0~129 mg/dL",
    refMin:0, refMax:129, values:[118,null,null,128,null,132,null,138,null,142,145,148] },
  { id:"calc6", category:"자동계산", name:"LDL-C (Friedewald)", refRange:"0~129 mg/dL",
    refMin:0, refMax:129, values:[108.6,null,null,113.4,null,119.6,null,125.0,null,130.4,123.8,134.0],
    decimals:1, isCalc:true, calcFormula:"TC − HDL − TG/5\n→ TG<400 일 때만 유효. 직접측정 LDL(c4) 과 비교용" },
  { id:"calc7", category:"자동계산", name:"non-HDL-C", refRange:"<130 mg/dL",
    refMin:0, refMax:130, values:[137,null,null,147,null,156,null,164,null,168,164,173],
    isCalc:true, calcFormula:"TC − HDL\n→ 동맥경화성 지질 총량 (LDL+VLDL+others)" },
  { id:"calc8", category:"자동계산", name:"TC/HDL 비", refRange:"<5.0",
    refMin:0, refMax:5.0, values:[3.36,null,null,3.67,null,4.00,null,4.22,null,4.36,4.42,4.68],
    decimals:2, isCalc:true, calcFormula:"TC ÷ HDL\n→ 심혈관 위험도 간이 지표" },
  { id:"calc3", category:"자동계산", name:"ASCVD 10년 위험도 (%)", refRange:"<7.5%",
    refMin:0, refMax:7.5, values:[6.2,null,null,6.8,null,7.5,null,8.2,null,9.1,9.8,10.5],
    decimals:1, isCalc:true, calcFormula:"Pooled Cohort Eq.\n→ TC·HDL·혈압·흡연·당뇨 기반", defaultFav:true },

  // ─ 임상화학·간염 ─
  { id:"c5",  category:"임상화학", name:"B형간염표면항원 (HBsAg)", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:negPos, resultType:"qualitative" },
  { id:"c6",  category:"임상화학", name:"B형간염표면항체 (HBsAb)", refRange:"Pos",
    refMin:1, refMax:999, values:[1,null,null,null,null,1,null,null,null,1,null,1], displayFn:negPos, resultType:"qualitative" },
  { id:"c7",  category:"임상화학", name:"AFP (혈청알파태아단백)", refRange:"0~7.0 ng/mL",
    refMin:0, refMax:7.0, values:[1.8,null,null,null,null,2.1,null,null,null,2.5,null,2.8], decimals:1 },

  // ─ 임상화학·갑상선 ─
  { id:"c9",  category:"임상화학", name:"TSH (갑상선자극호르몬)", refRange:"0.27~4.20 μIU/mL",
    refMin:0.27, refMax:4.20, values:[1.82,null,null,null,null,2.10,null,null,null,2.35,null,2.61], decimals:2 },

  // 분변 ─────────────────────────────────────────────────────────────────────
  { id:"s1",  category:"분변", name:"분변잠혈검사 (FOBT)", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:negPos, resultType:"qualitative" },

  // 미생물 ───────────────────────────────────────────────────────────────────
  { id:"m1",  category:"미생물", name:"자궁경부세포검사 (Pap)", refRange:"NILM",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:nilm, resultType:"qualitative" },
  { id:"m2",  category:"미생물", name:"HPV DNA 검사", refRange:"Neg",
    refMin:0, refMax:0.4, values:[null,null,null,null,null,0,null,null,null,0,null,null], displayFn:negPos, resultType:"qualitative" },

  // ─ PACS 연동 이미지·소견 결과 ─ (모두 image 타입으로 통일)
  // 셀엔 📷 아이콘만 표시되고, 소견 텍스트는 호버 시 툴팁에 노출됨.
  // 위내시경·심전도도 PACS 에 사진/트레이스가 있으므로 동일하게 image 로 처리.
  { id:"img1", category:"X-ray", name:"흉부 X-ray (P-A)", refRange:"—",
    values:[null,null,null,"정상",null,null,null,"경미한 폐문 비대",null,null,null,"정상"], resultType:"image" },
  { id:"img2", category:"SONO", name:"복부 초음파", refRange:"—",
    values:[null,null,null,null,null,"지방간 (경도)",null,null,null,"지방간 (중등도)",null,"지방간 (중등도)"], resultType:"image" },
  { id:"img5", category:"내시경", name:"위 내시경", refRange:"—",
    values:[null,null,null,null,null,"만성 위염",null,null,null,"만성 위염, 위용종 1개",null,null], resultType:"image" },
  { id:"img3", category:"BMD", name:"골밀도 (요추 T-score)", refRange:">−1.0",
    refMin:-1.0, refMax:99, values:[null,null,null,null,null,-0.5,null,null,null,-1.2,null,-1.4],
    decimals:1, resultType:"numeric" },
  { id:"img4", category:"EKG", name:"심전도", refRange:"정상동율동",
    values:[null,null,null,"정상동율동",null,null,null,"정상동율동",null,null,null,"정상동율동"], resultType:"image" },

  // 긴 소견 예시 — 4줄 이상의 상세 판독문. 셀엔 📷, 호버 시 스크롤 가능한 툴팁에서 전체 텍스트 노출.
  { id:"img6", category:"CT", name:"복부 CT (조영증강)", refRange:"—",
    values:[null,null,null,null,null,null,null,null,null,
      "Liver: 균질한 음영 감소 — 중등도 지방간 소견.\nGallbladder: 정상 크기·형태, 결석 음영 없음.\nPancreas: 정상 음영·크기.\nKidney: 양측 정상.\nSpleen: 정상.\nAdrenal gland: 정상.\nAbdominal LN: 의미 있는 비대 소견 없음.\n결론: 중등도 지방간 외 특이 소견 없음.",
      null,null], resultType:"image" },

  // PDF 결과 예시 — 종합검진 보고서·MRI 판독 등 다페이지 문서.
  // 셀엔 📄 아이콘, 호버 시 파일명 안내, 클릭 시 뷰어 (prototype: placeholder).
  { id:"pdf1", category:"기초검사", name:"종합검진 결과", refRange:"—",
    values:[null,null,null,null,null,"종합검진_2023-02-20.pdf",null,null,null,"종합검진_2024-09-25.pdf",null,null], resultType:"pdf" },
  { id:"pdf2", category:"MRI", name:"뇌 MRI 판독지", refRange:"—",
    values:[null,null,null,null,null,null,null,null,null,"BrainMRI_2024-09-25.pdf",null,null], resultType:"pdf" },
];

// ─── 카테고리 칩 목록 (가나다순 정렬) ─────────────────────────────────────────
// 한글·영문 혼재 — localeCompare("ko") 로 한글 가나다 우선, 영문은 뒤로 배치.
const ALL_CATS = [
  "기초검사","주사","예방주사","SONO","CT","X-ray","MAMMO","EKG","PFT","BMD","MRI",
  "진단혈액","임상화학","진단면역","외래목록","미생물","소변","조직","효소면역","분변",
  "핵의학","진단의학(기타)","내시경","조영","발달치료","언어치료","물리치료","운동치료",
  "통증치료","작업치료","도수치료","수술/처치","자동계산",
].sort((a, b) => a.localeCompare(b, "ko"));
const DATA_CATS = new Set(LAB.map(r => r.category));

// ─── 모아보기 프리셋 ──────────────────────────────────────────────────────────
const PRESETS = [
  { name:"당뇨 추적 세트",   rows:["h1","h2","calc4","calc3"] },
  { name:"간기능 세트",      rows:["h6","h7","h8","calc1"] },
  { name:"이상지혈증 세트",  rows:["c1","c2","c3","c4"] },
  { name:"신기능 세트",      rows:["h9","calc2"] },
  { name:"종합 심혈관 세트", rows:["c2","c3","c4","calc3","h1"] },
];

// ─── 값 처리 헬퍼 ─────────────────────────────────────────────────────────────
// 이상소견 키워드 — finding/image 텍스트 결과에서 비정상 여부 판단.
// 매칭되면 vStatus="high" → 빨강 강조.
const ABNORMAL_KEYWORDS = /이상|발견|의심|비대|용종|병변|섬유화|지방간|결절|위염|협착|폴립|종괴|mass|nodule/i;
function isAbnormalText(s: string): boolean {
  return ABNORMAL_KEYWORDS.test(s);
}

function vStatus(row: LabRow, val: number | string | null): VStatus {
  if (val === null) return "empty";
  if (typeof val === "string") {
    // 텍스트 결과 (finding/image) — 키워드 매칭으로 abnormal 판정.
    // "정상" 등 정상 결과는 키워드가 없어 normal 로 처리.
    return isAbnormalText(val) ? "high" : "normal";
  }
  if (row.refMin === undefined || row.refMax === undefined) return "normal";
  if (val > row.refMax) return "high";
  if (val < row.refMin) return "low";
  return "normal";
}

function dispVal(row: LabRow, val: number | string | null): string {
  if (val === null) return "—";
  if (typeof val === "string") return val;
  if (row.displayFn) return row.displayFn(val);
  if (row.decimals !== undefined) return val.toFixed(row.decimals);
  if (Number.isInteger(val)) return String(val);
  const s = val.toString();
  return s;
}

function vColor(s: VStatus): string {
  if (s === "high") return "var(--red-500)";
  if (s === "low")  return "var(--brand-primary)";
  return "var(--text-sub)";
}
// 이상수치 표시는 색상(빨강/파랑) 으로만 — ↑/↓ 화살표 제거됨.
// (vArrow 함수는 호환을 위해 빈 문자열을 반환하도록 유지)
function vArrow(_s: VStatus, _val: number | string | null): string {
  return "";
}
function hasAbnormal(row: LabRow, idxs: Set<number>): boolean {
  return row.values.some((v, i) => idxs.has(i) && (vStatus(row, v) === "high" || vStatus(row, v) === "low"));
}

// 날짜 메타 — 검사 기록 범위 표시·기간 필터에 사용
const DATE_RANGE = { first: DATES[0], last: DATES[DATES.length - 1] };
// "최근 N개월" 컷오프 계산 — 가장 최신 검사일 기준 (today 가 아닌 마지막 검사일 기준).
// 이렇게 하면 데이터의 의미 있는 슬라이스를 보장.
function periodCutoffFromLatest(months: number): string {
  const [y, m, d] = DATE_RANGE.last.split(".").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() - months);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

// ─── 미니 차트 더미 처방 (플로팅 패널용) ────────────────────────────────────
const MINI_RX = [
  { name:"트라젠태정 5mg",          dose:"1", freq:1 },
  { name:"아스피린장용정 100mg",    dose:"1", freq:1 },
  { name:"텔미사르탄·암로디핀",     dose:"1", freq:1 },
  { name:"메트포르민염산염정 500mg", dose:"2", freq:2 },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
// LAB row.id 또는 검사명(부분 일치) 으로 LAB 행을 찾는 helper.
// 외부 진입 (내원이력 결과보기) 시 처방명·코드를 그대로 받아도 fuzzy 매칭 동작.
function resolveLabRowKey(key?: string): string | null {
  if (!key) return null;
  // 1) id exact match
  const byId = LAB.find(r => r.id === key);
  if (byId) return byId.id;
  // 2) name partial match (대소문자·공백 무시)
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const k = norm(key);
  const byName = LAB.find(r => {
    const n = norm(r.name);
    return n.includes(k) || k.includes(n);
  });
  return byName ? byName.id : null;
}

export function LabViewer({
  onClose,
  // 외부 진입점에서 자동 필터링 — 내원이력의 "결과보기" 클릭 시 사용.
  //   initialDate: "YYYY.MM.DD" 형식. 해당 날짜로만 selDates 필터링.
  //   initialTestId: LAB row.id 또는 검사명. resolveLabRowKey 로 fuzzy 매칭됨.
  initialDate,
  initialTestId,
}: {
  onClose?: () => void;
  initialDate?: string;
  initialTestId?: string;
}) {
  useEffect(() => { document.title = "검사결과 뷰어 — 김지영 (100236)"; }, []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [selCats,   setSelCats]   = useState<Set<string>>(new Set(DATA_CATS));
  // selDates — 표·그래프에 표시할 검사일.
  //   initialDate 가 있으면 그 날짜로만 필터, 없으면 전체.
  const [selDates,  setSelDates]  = useState<Set<string>>(() =>
    initialDate ? new Set([initialDate]) : new Set(DATES)
  );
  // 외부 진입 시 hightlight 할 row id — initialTestId 가 LAB id 가 아니면 name fuzzy match 로 변환.
  const [entryHighlightId, setEntryHighlightId] = useState<string | null>(() => resolveLabRowKey(initialTestId));
  const [favs,      setFavs]      = useState<Set<string>>(new Set(LAB.filter(r => r.defaultFav).map(r => r.id)));
  // ── 보기 모드 — 단일 선택 (segmented control 패턴) ──
  // 이상치만 / 즐겨찾기만 / 수치만 / 소견만 / 모아보기 세트 가 모두 상호 배타.
  // "전체" 가 디폴트 미선택 상태. 추후 abnOnly/favOnly 등 derive 로 사용.
  type ViewMode = "all" | "abn" | "fav" | "numeric" | "finding" | "preset";
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  // viewMode === "preset" 일 때 선택된 프리셋 index
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(null);
  // derive
  const abnOnly     = viewMode === "abn";
  const favOnly     = viewMode === "fav" || viewMode === "preset";
  const numericOnly = viewMode === "numeric";
  const findingOnly = viewMode === "finding";
  // 그래프는 독립 토글 — "그래프 같이보기" 형태. 표 보기 모드와 무관. 기본 OFF (표만 노출).
  const [showGraph, setShowGraph] = useState(false);

  // 차트별 ref — 좌측 행 클릭 시 해당 차트로 스크롤하기 위한 매핑. row.id → 차트 카드 element.
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // 표 행 ref — 외부 진입 (내원이력 결과보기) 시 해당 행으로 스크롤하기 위한 매핑.
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  // 스크롤 직후 잠깐 강조 표시할 chart id (1.5초 후 해제).
  const [highlightedChartId, setHighlightedChartId] = useState<string | null>(null);
  useEffect(() => {
    if (!highlightedChartId) return;
    const t = setTimeout(() => setHighlightedChartId(null), 1500);
    return () => clearTimeout(t);
  }, [highlightedChartId]);
  // 좌측 행 클릭 → 우측 그래프로 스크롤 + 잠깐 ring 강조.
  const scrollToChart = (rowId: string) => {
    const el = chartRefs.current[rowId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setHighlightedChartId(rowId);
  };
  // 외부 진입 (initialTestId) → 마운트 후 해당 표 행으로 스크롤 + 강조.
  useEffect(() => {
    if (!initialTestId) return;
    const t = setTimeout(() => {
      const row = rowRefs.current[initialTestId];
      if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(t);
  }, [initialTestId]);
  // 표시 컬럼 — 사용자가 표시 / 숨김 설정 가능. fav, name 은 항상 노출.
  const [visibleCols, setVisibleCols] = useState<Set<ColumnId>>(new Set(DEFAULT_VISIBLE_COLS));
  const [colSettingsOpen, setColSettingsOpen] = useState(false);
  const colSettingsRef = useRef<HTMLDivElement>(null);
  // 기간 설정 — 시작일/종료일 범위. quick 버튼으로 빠르게 설정.
  // 형식 "YYYY-MM-DD". 빈 문자열 → 미설정 (전체 사용).
  // 기본값: "전체" — periodFrom/To 모두 빈값 + selDates 가 모든 DATES 를 포함하면 isPeriodAllActive=true.
  // initialDate (외부 진입) 가 있으면 단일 날짜 모드로 시작 (periodFrom == periodTo == initialDate).
  const initialDateISO = initialDate ? initialDate.replace(/\./g, "-") : "";
  const [periodFrom, setPeriodFrom] = useState<string>(initialDateISO);
  const [periodTo,   setPeriodTo]   = useState<string>(initialDateISO);
  // 검색어 초기값 — 외부 진입 시 그 검사명 미리 채움 (initialTestId 가 LAB id 면 name 으로 변환).
  //   사용자는 × 클릭으로 해제 가능, 직접 타이핑하면 드롭다운 자동완성으로 다른 검사 검색.
  const [search,    setSearch]    = useState<string>(() => {
    const resolved = resolveLabRowKey(initialTestId);
    if (resolved) return LAB.find(r => r.id === resolved)?.name ?? initialTestId ?? "";
    return initialTestId ?? "";
  });
  const [searchFocused, setSearchFocused] = useState(false);
  // 환자 처방 이력 — 이 환자가 과거 처방받은 검사 이름 set. LAB 의 non-header 행이 곧 처방 이력.
  // 검색 드롭다운 자동완성 source — 처방한 적 없는 검사는 노출 안됨.
  const PATIENT_PRESCRIBED_TESTS: string[] = useMemo(
    () => Array.from(new Set(LAB.filter(r => !r.isHeader).map(r => r.name))),
    []
  );
  // 검색어 매칭 — 부분 일치 (대소문자 무시).
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PATIENT_PRESCRIBED_TESTS.slice(0, 20);
    return PATIENT_PRESCRIBED_TESTS.filter(n => n.toLowerCase().includes(q)).slice(0, 20);
  }, [search, PATIENT_PRESCRIBED_TESTS]);
  const [presetOpen, setPresetOpen] = useState(false);
  const [miniOpen,   setMiniOpen]   = useState(false);
  // 데이터 셀 hover 툴팁은 제거됨 — 셀 자체가 충분히 표현. 참조치만 길어질 때 native title 로 노출.
  // 특정내역으로 보낸 셀 — 키 형식: "${row.id}:${di}". 우클릭 메뉴 → "특정내역으로 보내기" 시 추가.
  // 보낸 셀은 시각 아이콘(📋)으로 표시되어 데이터 연동 여부 즉시 인지 가능.
  const [sentCells, setSentCells] = useState<Set<string>>(new Set());
  // 셀 우클릭 컨텍스트 메뉴 위치·대상
  const [cellMenu, setCellMenu] = useState<{ row: LabRow; di: number; x: number; y: number } | null>(null);
  // "특정내역으로 보내기" 토스트
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  const presetRef = useRef<HTMLDivElement>(null);
  const tableRef  = useRef<HTMLDivElement>(null);

  // 셀 메뉴 외부 클릭/ESC 닫기
  useEffect(() => {
    if (!cellMenu) return;
    const close = () => setCellMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", close);
      document.addEventListener("keydown", onKey);
      window.addEventListener("scroll", close, true);
    }, 30);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [cellMenu]);

  // 특정내역으로 보내기 — 셀 데이터 → 특정내역 입력 영역 (prototype: state 만 기록).
  // 실 구현 시 PanelD 의 specialDetailInput state 와 postMessage/이벤트로 연결.
  const sendToSpecialDetail = (row: LabRow, di: number) => {
    const val = row.values[di];
    if (val === null) return;
    const key = `${row.id}:${di}`;
    setSentCells(prev => new Set(prev).add(key));
    const valStr = dispVal(row, val);
    showToast(`특정내역으로 전송: ${row.name} ${valStr} (${DATES[di]})`);
    setCellMenu(null);
  };

  useEffect(() => {
    if (!presetOpen) return;
    const h = (e: MouseEvent) => { if (!presetRef.current?.contains(e.target as Node)) setPresetOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [presetOpen]);
  // 컬럼 설정 dropdown outside click 닫기
  useEffect(() => {
    if (!colSettingsOpen) return;
    const h = (e: MouseEvent) => { if (!colSettingsRef.current?.contains(e.target as Node)) setColSettingsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [colSettingsOpen]);

  // 검사명 ↔ 수탁사 검사명 pair — 둘 중 하나가 마지막 visible 일 때 그 자체는 끌 수 없음.
  const isNamePairLastVisible = (id: ColumnId, prev: Set<ColumnId>) => {
    if (id !== "name" && id !== "vendorName") return false;
    if (!prev.has(id)) return false;
    const other: ColumnId = id === "name" ? "vendorName" : "name";
    return !prev.has(other);  // 짝이 꺼져있고 본인이 켜져있으면 = 마지막 → off 불가
  };
  const toggleColumn = (id: ColumnId) => {
    const def = COLUMN_DEFS.find(c => c.id === id);
    if (def?.alwaysOn) return;  // 핵심 컬럼은 끌 수 없음
    setVisibleCols(prev => {
      if (isNamePairLastVisible(id, prev)) return prev;  // 검사명/수탁사검사명 pair 마지막 → 무시
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  // 소견검사(image/pdf/qualitative) 가 1건 이상 있는 날짜의 인덱스 집합 — findingOnly 모드에서 dates 필터링용.
  const findingDateIdxs = useMemo(() => {
    const idxs = new Set<number>();
    LAB.forEach(r => {
      if (r.resultType !== "image" && r.resultType !== "pdf" && r.resultType !== "qualitative") return;
      r.values.forEach((v, i) => { if (v !== null) idxs.add(i); });
    });
    return idxs;
  }, []);
  // findingOnly 모드 — 소견검사가 있는 날짜만 컬럼 노출 (다른 날짜는 표에서 숨김).
  const visibleDates = useMemo(() => {
    return DATES.filter((d, i) => {
      if (!selDates.has(d)) return false;
      if (findingOnly && !findingDateIdxs.has(i)) return false;
      return true;
    });
  }, [selDates, findingOnly, findingDateIdxs]);
  const visibleDateIdxs = useMemo(() => new Set(DATES.map((d, i) => visibleDates.includes(d) ? i : -1).filter(i => i >= 0)), [visibleDates]);

  // 표 헤더·본문에 표시할 컬럼 순서 — 최신 검사일이 왼쪽 첫 컬럼이 되도록 역순.
  // graph 는 시계열(과거→현재 X축) 유지를 위해 visibleDates(chronological) 그대로 사용.
  const displayDates = useMemo(() => [...visibleDates].reverse(), [visibleDates]);

  // 행 단위 "결과값 → 특정내역" 빠른 복사 helper —
  // visibleDates 중 가장 최근의 non-null 값 인덱스 반환. 없으면 -1.
  // 행에 붙는 작은 아이콘 버튼이 사용 — 원클릭으로 최신 결과를 JX999 (특정내역) 으로 전송.
  const latestValueIdx = (row: LabRow): number => {
    for (let i = visibleDates.length - 1; i >= 0; i--) {
      const di = DATES.indexOf(visibleDates[i]);
      if (di === -1) continue;
      const val = row.values[di];
      if (val !== null && val !== undefined) return di;
    }
    return -1;
  };

  const filteredRows = useMemo(() => {
    return LAB.filter(row => {
      if (!selCats.has(row.category)) return false;
      if (search && !row.isHeader && !row.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (favOnly && !row.isHeader && !favs.has(row.id)) return false;
      if (abnOnly && !row.isHeader && !hasAbnormal(row, visibleDateIdxs)) return false;
      // 소견검사만 보기 — 다음 타입 모두 노출 (헤더는 숨김):
      //   image       — PACS 영상·내시경·EKG (소견 텍스트)
      //   pdf         — 판독지·검진 문서
      //   qualitative — Neg/Trace/+1·Pos/NILM 등 정성 결과 (의미상 소견 성격)
      if (findingOnly && (row.isHeader || (
        row.resultType !== "image" && row.resultType !== "pdf" && row.resultType !== "qualitative"
      ))) return false;
      // 수치검사만 보기 — numeric / multi-numeric 만 노출.
      // resultType 미지정도 numeric 으로 간주 (defaultFav 등 기존 행이 누락되지 않도록).
      if (numericOnly && !row.isHeader) {
        const isNumeric = row.resultType === "numeric" || row.resultType === "multi-numeric" || row.resultType === undefined;
        if (!isNumeric) return false;
      }
      return true;
    });
  }, [selCats, search, favOnly, favs, abnOnly, findingOnly, numericOnly, visibleDateIdxs]);

  // 그래프 대상 행 — 좌측 표(filteredRows) 중 수치성 결과만 자동 추출.
  // 사용자가 별도 그래프 행 관리 안 함 → 즐겨찾기·필터·검색만으로 표·그래프 동시 변경.
  const graphRowList = useMemo(() => filteredRows.filter(r => {
    if (r.isHeader) return false;
    // 텍스트성·문서성 결과는 그래프에 plot 불가
    if (r.resultType === "image" || r.resultType === "pdf" || r.resultType === "qualitative") return false;
    // 적어도 한 visible 날짜에 수치가 있어야 함
    return r.values.some((v, i) => visibleDateIdxs.has(i) && typeof v === "number");
  }), [filteredRows, visibleDateIdxs]);

  // 그래프 색상 인덱스 매핑 — 행 → 색상 (표의 dot 표시에도 사용)
  const graphColorIndex = useMemo(() => {
    const m = new Map<string, number>();
    graphRowList.forEach((r, i) => m.set(r.id, i));
    return m;
  }, [graphRowList]);

  // (graphData useMemo 제거됨 — 검사별 개별 차트로 전환 후 통합 dataset 불필요.
  //  각 LineChart 가 자체 data 를 inline 으로 생성함.)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleCat  = (c: string) => setSelCats(p  => { const n = new Set(p);  n.has(c)  ? n.delete(c)  : n.add(c);  return n; });
  const toggleDate = (d: string) => setSelDates(p => { const n = new Set(p);  if (n.has(d) && n.size > 1) n.delete(d); else n.add(d); return n; });
  const toggleFav  = (id: string) => setFavs(p   => { const n = new Set(p);  n.has(id) ? n.delete(id) : n.add(id); return n; });
  // 카운트 기반 (기존) — 최신 N건
  const applyDatePreset = (cnt: number) => setSelDates(new Set(cnt >= DATES.length ? DATES : DATES.slice(-cnt)));
  // 기간 기반 (신규) — 마지막 검사일 기준 최근 N개월. null=전체.
  const applyDatePeriod = (months: number | null) => {
    if (months === null) { setSelDates(new Set(DATES)); return; }
    const cutoff = periodCutoffFromLatest(months);
    const next = DATES.filter(d => d >= cutoff);
    setSelDates(new Set(next.length > 0 ? next : [DATES[DATES.length - 1]]));
  };
  // 모아보기 세트 — 선택 시 favs 를 preset 행들로 설정 + viewMode="preset" + 그래프 ON
  // viewMode 가 "preset" 으로 들어가면서 다른 단일 선택 항목과 mutex 가 됨.
  const applyRowPreset = (idx: number) => {
    const preset = PRESETS[idx];
    setFavs(new Set(preset.rows));
    setSelectedPresetIdx(idx);
    setViewMode("preset");
    setShowGraph(true);
    setPresetOpen(false);
  };

  // ── Group rows ─────────────────────────────────────────────────────────────
  let prevCat = "";
  const rows = filteredRows.map(row => {
    const firstInGroup = row.category !== prevCat;
    prevCat = row.category;
    return { ...row, firstInGroup };
  });

  // 데이터 셀 동적 폭 — 소견검사만 보기 모드일 땐 텍스트 wrap 공간 확보를 위해 확대
  const dateColW = findingOnly ? W_DATE_FINDING : W_DATE;

  // 보이는 sticky 컬럼들 — order 유지, 각 컬럼의 누적 left offset 계산.
  const stickyColumns = useMemo(() => {
    let acc = 0;
    return COLUMN_DEFS.filter(c => visibleCols.has(c.id)).map(c => {
      const left = acc;
      acc += c.width;
      return { ...c, left };
    });
  }, [visibleCols]);
  const W_STICKY_TOTAL = stickyColumns.reduce((s, c) => s + c.width, 0);

  // 카테고리별 rowSpan — 정렬된 rows 안에서 동일 category 가 연속된 만큼 그룹화.
  // 셀 병합 효과 — 첫 행에서만 td 를 rowSpan 으로 렌더, 나머지는 td 자체 skip.
  // 행 정렬은 카테고리 단위로 이미 grouping 되어 있어 단순 연속 카운팅으로 충분.
  const categoryRowSpans = useMemo(() => {
    const spans: Record<number, number> = {}; // row idx → rowSpan (1 이상 = 시작 행, 0 = 병합으로 skip)
    let i = 0;
    while (i < rows.length) {
      let j = i + 1;
      while (j < rows.length && rows[j].category === rows[i].category) j++;
      spans[i] = j - i;
      for (let k = i + 1; k < j; k++) spans[k] = 0;
      i = j;
    }
    return spans;
  }, [rows]);

  // ── 기간 quick 버튼 — 마지막 검사일 기준 최근 N개월 ──────────────────────────
  // applyDatePeriod 와 동일 로직 + periodFrom/To input 값까지 동기화.
  const applyPeriodMonths = (months: number) => {
    const cutoff = periodCutoffFromLatest(months);              // "YYYY.MM.DD"
    const cutoffISO = cutoff.replace(/\./g, "-");
    const lastISO = DATE_RANGE.last.replace(/\./g, "-");
    setPeriodFrom(cutoffISO);
    setPeriodTo(lastISO);
    const next = DATES.filter(d => d >= cutoff);
    setSelDates(new Set(next.length > 0 ? next : [DATES[DATES.length - 1]]));
  };
  // "전체" — periodFrom/To 클리어 + 모든 날짜 선택
  const applyPeriodAll = () => {
    setPeriodFrom("");
    setPeriodTo("");
    setSelDates(new Set(DATES));
  };
  // "최근 N건" — 가장 최신 N개 검사일만 선택. periodFrom/To 는 비워서 "건수 모드" 인지 시각 구분.
  const applyRecentN = (n: number) => {
    setPeriodFrom("");
    setPeriodTo("");
    setSelDates(new Set(n >= DATES.length ? DATES : DATES.slice(-n)));
  };
  // 날짜 input 변경 시 — periodFrom/To 갱신 + selDates 즉시 동기화.
  // 단일 날짜: 둘 다 같은 값 or 한쪽만 입력 → 그 날짜만 필터링
  // 기간: 둘 다 입력 + 서로 다르면 → 그 범위 내 검사일 모두 선택
  // 둘 다 비어있으면 전체.
  const applyDateRange = (newFrom: string, newTo: string) => {
    setPeriodFrom(newFrom);
    setPeriodTo(newTo);
    const fromDot = newFrom ? newFrom.replace(/-/g, ".") : null;
    const toDot   = newTo   ? newTo.replace(/-/g, ".")   : null;
    if (!fromDot && !toDot) {
      setSelDates(new Set(DATES));
      return;
    }
    if (fromDot && !toDot) { setSelDates(new Set([fromDot])); return; }
    if (!fromDot && toDot) { setSelDates(new Set([toDot]));   return; }
    // 둘 다 입력 — 범위 (혹은 같은 날짜)
    const lo = fromDot! <= toDot! ? fromDot! : toDot!;
    const hi = fromDot! <= toDot! ? toDot!   : fromDot!;
    if (lo === hi) {
      setSelDates(new Set([lo]));
    } else {
      setSelDates(new Set(DATES.filter(d => d >= lo && d <= hi)));
    }
  };
  // ── Quick 버튼 활성 상태 derive ──
  // periodFrom/To 가 N개월 cutoff 와 일치하면 그 버튼이 활성.
  // 사용자가 직접 date input 을 바꾸면 quick 버튼은 모두 비활성 (자유 범위).
  const lastISO = DATE_RANGE.last.replace(/\./g, "-");
  const isPeriodMonthsActive = (months: number): boolean => {
    const expected = periodCutoffFromLatest(months).replace(/\./g, "-");
    return periodFrom === expected && periodTo === lastISO;
  };
  const isPeriodAllActive = !periodFrom && !periodTo && selDates.size === DATES.length;
  const isRecentNActive = (n: number): boolean => {
    if (periodFrom || periodTo) return false;
    const expected = n >= DATES.length ? DATES : DATES.slice(-n);
    return selDates.size === expected.length && expected.every(d => selDates.has(d));
  };

  // ── Sticky cell shared styles ──────────────────────────────────────────────
  const stickyTd = (left: number, bg: string, border: boolean): CSSProperties => ({
    position: "sticky", left, zIndex: 10, backgroundColor: bg,
    borderRight: border ? "2px solid var(--text-disabled)" : "1px solid var(--line-default)",
    verticalAlign: "middle",
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden rounded-xl">

      {/* ① 헤더 (44px, light) — 타 팝업(처방금지·방사선 등) 과 동일한 디자인 패턴.
          좌: "검사결과" 타이틀 + 환자 정보 (이름·차트#·생년·성별·최초검사일).
          우: 인쇄·Excel 액션 + 닫기 (아이콘만). PACS·알림톡 발송 제거됨. */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">검사결과</span>
          <span className="w-px h-3.5 bg-[var(--line-default)] flex-shrink-0" />
          {/* 환자정보 — 환자정보패널(PanelB) 과 동일한 차트번호 뱃지 + 순서:
              차트번호 뱃지 → 이름 → 성별/나이 → 생년월일 */}
          <span className="text-sm font-medium rounded-[3px] border border-[var(--line-default)] text-[var(--text-sub)] tabular-nums px-1.5 py-0 leading-snug flex-shrink-0">
            100236
          </span>
          <span className="text-sm font-bold text-[var(--text-main)] flex-shrink-0">김지영</span>
          <span className="text-xs text-[var(--text-sub)] tabular-nums flex-shrink-0">여/52</span>
          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">·</span>
          <span className="text-xs text-[var(--text-sub)] tabular-nums flex-shrink-0">1974.03.12</span>
          <span className="w-px h-3 bg-[var(--line-subtle)] flex-shrink-0 ml-1" />
          <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap flex-shrink-0 ml-0.5">
            최초 검사일 <span className="text-[var(--text-main)] tabular-nums font-medium">{DATE_RANGE.first}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["인쇄","Excel 내보내기"].map(lbl => (
            <button key={lbl} className="h-7 px-2.5 rounded text-xs text-[var(--text-sub)] border border-[var(--line-default)] bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap">
              {lbl}
            </button>
          ))}
          <button onClick={() => onClose?.()}
            className="w-6 h-6 ml-1 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
            aria-label="닫기">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ②-pre. 기간 설정 바 — from/to 두 날짜 입력 + 빠른 범위 버튼.
          단일 날짜: from·to 둘 다 같은 날짜 또는 한쪽만 입력 → 그 날짜로 필터링.
          기간: from·to 둘 다 다른 날짜 → 범위 필터링. 즉시 적용. */}
      <div className="flex items-center px-4 gap-2 flex-shrink-0 border-b border-[var(--line-default)]"
        style={{ height: 36, backgroundColor: "white" }}>
        <span className="text-xs font-medium text-[var(--text-sub)] mr-1">기간</span>
        <input
          type="date"
          value={periodFrom}
          onChange={e => applyDateRange(e.target.value, periodTo)}
          title="시작일 (단일 날짜로 조회 시 종료일은 비워두거나 같은 날짜로 설정)"
          className="h-6 px-1.5 text-xs tabular-nums border border-[var(--line-default)] rounded bg-white outline-none focus:border-[var(--brand-primary)]"
          style={{ width: 130 }}
        />
        <span className="text-xs text-[var(--text-tertiary)]">~</span>
        <input
          type="date"
          value={periodTo}
          onChange={e => applyDateRange(periodFrom, e.target.value)}
          title="종료일 (단일 날짜로 조회 시 시작일과 같이 설정)"
          className="h-6 px-1.5 text-xs tabular-nums border border-[var(--line-default)] rounded bg-white outline-none focus:border-[var(--brand-primary)]"
          style={{ width: 130 }}
        />
        {/* 기간 quick 버튼 — 월 단위. 활성 상태는 brand-primary 채움 톤으로 시각 강조. */}
        <div className="flex items-center gap-1 ml-1">
          {[
            { label: "1개월", months: 1 },
            { label: "3개월", months: 3 },
            { label: "6개월", months: 6 },
            { label: "1년",   months: 12 },
            { label: "3년",   months: 36 },
            { label: "5년",   months: 60 },
          ].map(({ label, months }) => {
            const active = isPeriodMonthsActive(months);
            return (
              <button key={label}
                onClick={() => applyPeriodMonths(months)}
                className={`h-6 px-2 text-xs rounded border transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                    : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                }`}>
                {label}
              </button>
            );
          })}
          <button
            onClick={applyPeriodAll}
            className={`h-6 px-2 text-xs rounded border transition-colors whitespace-nowrap ${
              isPeriodAllActive
                ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            }`}>
            전체
          </button>
        </div>
        {/* 구분선 */}
        <div className="w-px h-4 bg-[var(--line-default)] mx-1" />
        {/* 최근 N건 — 건수 기반 빠른 선택. 활성 상태 동일 스타일. */}
        <span className="text-xs text-[var(--text-tertiary)] mr-0.5">최근</span>
        <div className="flex items-center gap-1">
          {[3, 6].map(n => {
            const active = isRecentNActive(n);
            return (
              <button key={n}
                onClick={() => applyRecentN(n)}
                className={`h-6 px-2 text-xs rounded border transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                    : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                }`}>
                {n}건
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
      </div>

      {/* ② 오더분류 칩 바 */}
      <div className="flex-shrink-0 border-b border-[var(--line-default)]" style={{ backgroundColor: "var(--bg-subtle)", padding: "8px 16px" }}>
        <div className="flex flex-wrap gap-1 items-center">
          {ALL_CATS.map(cat => {
            const hasData = DATA_CATS.has(cat);
            const isSel   = selCats.has(cat);
            return (
              <button key={cat} onClick={() => hasData && toggleCat(cat)} disabled={!hasData}
                className={`flex items-center gap-0.5 text-sm rounded border whitespace-nowrap transition-colors ${
                  isSel && hasData
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                    : hasData
                      ? "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      : "bg-white text-[var(--text-disabled)] border-[var(--line-default)] cursor-not-allowed"
                }`} style={{ padding: "4px 10px" }}>
                {isSel && hasData && <span className="text-xs mr-0.5">✓</span>}
                {cat}
              </button>
            );
          })}
          <div className="flex items-center gap-3 ml-auto pl-3 flex-shrink-0">
            <button onClick={() => setSelCats(new Set(DATA_CATS))} className="text-sm text-[var(--brand-primary)] hover:underline whitespace-nowrap">전체선택</button>
            <button onClick={() => setSelCats(new Set())}          className="text-sm text-[var(--text-tertiary)] hover:underline whitespace-nowrap">선택해제</button>
          </div>
        </div>
      </div>

      {/* ③ 툴바 (36px) — 보기 필터 단일 선택 그룹 + 그래프 토글(별도) + 검색 */}
      <div className="flex items-center px-4 gap-3 flex-shrink-0 border-b border-[var(--line-default)]"
        style={{ height: 36, backgroundColor: "var(--bg-subtle)" }}>
        {/* 보기 모드 — 단일 선택 segmented control. 모아보기 세트도 같은 그룹에 포함. */}
        <div className="inline-flex items-center bg-white border border-[var(--line-default)] rounded p-0.5" ref={presetRef}>
          {[
            { v: "all" as const,     label: "전체",       tone: null },
            { v: "abn" as const,     label: "이상치만",   tone: "warning" },
            { v: "fav" as const,     label: "즐겨찾기만", tone: "warning" },
            { v: "numeric" as const, label: "수치검사만", tone: "primary" },
            { v: "finding" as const, label: "소견검사만", tone: "blue" },
          ].map(({ v, label, tone }) => {
            const isActive = viewMode === v;
            const activeCls =
              tone === "warning" ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)]" :
              tone === "primary" ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]" :
              tone === "blue"    ? "bg-[var(--bg-primary-subtle)] text-[var(--blue-700)]" :
                                   "bg-[var(--bg-subtle)] text-[var(--text-main)]"; // 전체
            return (
              <button key={v}
                onClick={() => { setViewMode(v); setSelectedPresetIdx(null); }}
                className={`h-5 px-2.5 text-xs rounded-sm transition-colors whitespace-nowrap ${
                  isActive ? `${activeCls} font-bold` : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}>
                {label}
              </button>
            );
          })}
          {/* 구분선 — 모아보기 세트 dropdown 은 segmented 그룹 내 분리된 슬롯 */}
          <div className="w-px h-3.5 bg-[var(--line-default)] mx-0.5" />
          <div className="relative">
            <button
              onClick={() => setPresetOpen(v => !v)}
              className={`h-5 px-2.5 text-xs rounded-sm transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                viewMode === "preset"
                  ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                  : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
              }`}>
              {viewMode === "preset" && selectedPresetIdx !== null ? PRESETS[selectedPresetIdx].name : "모아보기 세트"}
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className={`transition-transform ${presetOpen ? "rotate-180" : ""}`}>
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {presetOpen && (
              <div className="absolute top-6 left-0 bg-white border border-[var(--line-default)] rounded-lg shadow-xl w-44 z-50 py-1 overflow-hidden">
                {PRESETS.map((ps, idx) => (
                  <button key={ps.name} onClick={() => applyRowPreset(idx)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-subtle)] ${
                      viewMode === "preset" && selectedPresetIdx === idx
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                        : "text-[var(--text-main)]"
                    }`}>
                    {ps.name}
                  </button>
                ))}
                <div className="border-t border-[var(--line-default)] mt-1">
                  <button className="w-full text-left px-3 py-1.5 text-sm text-[var(--brand-primary)] hover:bg-[var(--bg-subtle)]">
                    + 세트 저장...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 그래프는 별도 토글 — "그래프와 같이보기" */}
        <button
          onClick={() => setShowGraph(v => !v)}
          title={showGraph ? "그래프 영역 숨기기" : "그래프 영역 보이기"}
          className={`h-6 px-2.5 text-xs rounded border transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
            showGraph
              ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
              : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--text-tertiary)]"
          }`}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M2 12L6 8L9 10L14 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="8" r="1" fill="currentColor" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="14" cy="4" r="1" fill="currentColor" />
          </svg>
          그래프 같이보기
        </button>

        <div className="flex-1" />
        {/* 우측 — 검색 + 컬럼 설정.
            검색 input: 외부 진입 시 그 검사명 사전 채움. × 로 해제 가능.
            포커스되면 하단 드롭다운으로 자동완성 — 환자에게 처방 이력이 있는 검사만 노출. */}
        <div className="relative" data-lab-search>
          <div
            className={`flex items-center gap-1.5 bg-white border rounded px-2 h-6 w-48 transition-colors ${
              searchFocused
                ? "border-[var(--brand-primary)]"
                : "border-[var(--line-default)]"
            }`}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.5"/>
              <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="검사명 검색..."
              className="text-sm flex-1 outline-none placeholder:text-[var(--text-placeholder)] bg-transparent min-w-0" />
            {search && (
              <button
                onMouseDown={e => { e.preventDefault(); setSearch(""); }}
                title="검색어 해제"
                aria-label="검색어 해제"
                className="flex-shrink-0 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          {/* 자동완성 드롭다운 — 환자 처방 이력 기반.
              검색 결과 없음 = 이 환자에게 처방한 적 없는 검사 → 안내 메시지. */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--line-default)] rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchSuggestions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[var(--text-tertiary)] text-center">
                  처방한 적 없는 검사입니다
                </div>
              ) : (
                <>
                  {!search.trim() && (
                    <div className="px-3 py-1 text-micro text-[var(--text-tertiary)] border-b border-[var(--line-subtle)] bg-[var(--bg-subtle)]">
                      이 환자 처방 이력 ({PATIENT_PRESCRIBED_TESTS.length}건)
                    </div>
                  )}
                  {searchSuggestions.map(name => {
                    // 검색어 부분 highlight
                    const q = search.trim();
                    let display: React.ReactNode = name;
                    if (q) {
                      const lc = name.toLowerCase();
                      const qlc = q.toLowerCase();
                      const idx = lc.indexOf(qlc);
                      if (idx >= 0) {
                        display = (
                          <>
                            {name.slice(0, idx)}
                            <mark className="bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold rounded-sm">
                              {name.slice(idx, idx + q.length)}
                            </mark>
                            {name.slice(idx + q.length)}
                          </>
                        );
                      }
                    }
                    return (
                      <button
                        key={name}
                        onMouseDown={e => {
                          e.preventDefault();
                          setSearch(name);
                          setSearchFocused(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-primary-subtle)] transition-colors block whitespace-nowrap overflow-hidden text-ellipsis">
                        {display}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* 컬럼 설정 dropdown — 표시할 sticky 컬럼 토글 */}
        <div className="relative" ref={colSettingsRef}>
          <button
            onClick={() => setColSettingsOpen(o => !o)}
            title="표시 컬럼 설정"
            aria-label="표시 컬럼 설정"
            className={`h-6 w-6 inline-flex items-center justify-center rounded border transition-colors ${
              colSettingsOpen
                ? "bg-[var(--bg-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "bg-white border-[var(--line-default)] text-[var(--text-sub)] hover:border-[var(--text-tertiary)]"
            }`}>
            {/* 컬럼 아이콘 — 세로 3분할 막대 */}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2"  y="3" width="3" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="6.5" y="3" width="3" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="11" y="3" width="3" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
          {colSettingsOpen && (
            <div className="absolute right-0 top-7 bg-white border border-[var(--line-default)] rounded-lg shadow-xl w-52 z-50 py-1 overflow-hidden">
              <div className="px-3 py-1.5 text-micro text-[var(--text-tertiary)] border-b border-[var(--line-subtle)] flex items-center justify-between">
                <span>표시할 컬럼</span>
                <button
                  onClick={() => setVisibleCols(new Set(DEFAULT_VISIBLE_COLS))}
                  className="text-micro text-[var(--brand-primary)] hover:underline">
                  기본값
                </button>
              </div>
              {COLUMN_DEFS.map(c => {
                const isPairLast = isNamePairLastVisible(c.id, visibleCols);
                const locked = c.alwaysOn || isPairLast;
                return (
                  <label key={c.id}
                    title={isPairLast ? "검사명 / 수탁사 검사명 중 하나는 반드시 표시되어야 합니다" : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--bg-subtle)] ${
                      locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer text-[var(--text-main)]"
                    }`}>
                    <input
                      type="checkbox"
                      checked={visibleCols.has(c.id)}
                      disabled={locked}
                      onChange={() => toggleColumn(c.id)}
                      className="accent-[var(--brand-primary)]" />
                    <span className="flex-1">{c.label}</span>
                    {c.alwaysOn ? (
                      <span className="text-micro text-[var(--text-tertiary)]">필수</span>
                    ) : isPairLast ? (
                      <span className="text-micro text-[var(--text-tertiary)]">짝 필수</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ④ 메인 영역 — 좌측 날짜 네비 제거됨. 기간/건수 컨트롤은 상단 기간 설정 바로 통합. */}
      <div className="flex flex-1 overflow-hidden">

        {/* 테이블 + 그래프 영역 */}
        <div className="flex flex-1 overflow-hidden">

          {/* 검사결과 테이블 */}
          <div ref={tableRef}
            className={`overflow-auto ${showGraph ? "" : "flex-1"}`}
            style={showGraph ? { width: "50%", flexShrink: 0 } : {}}>
            <table style={{ borderCollapse:"collapse", minWidth: W_STICKY_TOTAL + visibleDates.length * dateColW, tableLayout: "fixed" }} className="text-sm">
              {/* 고정 헤더 — 표시 컬럼 설정에 따라 동적 렌더 */}
              <thead>
                <tr style={{ backgroundColor: "var(--bg-subtle)" }}>
                  {stickyColumns.map((c, idx) => {
                    const isLast = idx === stickyColumns.length - 1;
                    const align = (c.id === "fav" || c.id === "refRange") ? "center" : "left";
                    return (
                      <th key={c.id}
                        style={{
                          position: "sticky", top: 0, left: c.left, zIndex: 30,
                          width: c.width, minWidth: c.width,
                          backgroundColor: "var(--bg-subtle)",
                          borderBottom: "2px solid var(--text-disabled)",
                          borderRight: isLast ? "2px solid var(--text-disabled)" : "1px solid var(--line-default)",
                          height: 32, textAlign: align as "center" | "left",
                          padding: align === "left" ? "0 8px" : "0 6px",
                          fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)",
                          whiteSpace: "nowrap",
                        }}>
                        {c.label}
                      </th>
                    );
                  })}
                  {displayDates.map(date => (
                    <th key={date} style={{ position:"sticky", top:0, zIndex:20, width:dateColW, minWidth:dateColW, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"1px solid var(--line-default)", textAlign:"center", fontSize:10, fontWeight:600, color:"var(--text-main)", whiteSpace:"nowrap", padding:"0 4px" }}>
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isFav    = favs.has(row.id);
                  // isGRow — 이 행이 그래프에 plot 되고 있는지 (즐겨찾기 토글·필터 자동 sync). 클릭 토글 제거됨.
                  const isGRow   = showGraph && graphColorIndex.has(row.id);
                  const isLast   = idx === rows.length - 1 || rows[idx+1]?.category !== row.category;
                  const rowBg    = row.isHeader ? "var(--bg-subtle)"
                                 : isFav        ? "var(--status-warning-bg-subtle)"
                                 : isGRow       ? "var(--bg-primary-subtle)"
                                 : "white";
                  const botBd    = isLast ? "2px solid var(--text-disabled)" : "1px solid var(--line-subtle)";

                  const isEntry = entryHighlightId === row.id;
                  return (
                    <tr key={row.id}
                      ref={el => { rowRefs.current[row.id] = el; }}
                      onClick={() => { if (isGRow) scrollToChart(row.id); }}
                      title={isGRow ? "클릭하여 우측 그래프로 이동" : undefined}
                      style={{
                        backgroundColor: isEntry ? "var(--bg-primary-subtle)" : rowBg,
                        cursor: isGRow ? "pointer" : "default",
                        boxShadow: isEntry ? "inset 3px 0 0 var(--brand-primary)" : undefined,
                      }}
                      className="group hover:brightness-[0.97]">

                      {/* 좌측 sticky 컬럼들 — 표시 설정에 따라 동적 렌더. 검사종류는 rowSpan 으로 셀 병합. */}
                      {stickyColumns.map((c, ci) => {
                        const isLastSticky = ci === stickyColumns.length - 1;
                        const base: CSSProperties = {
                          ...stickyTd(c.left, rowBg, isLastSticky),
                          width: c.width, borderBottom: botBd,
                        };
                        const vi = vendorInfo(row);

                        // 검사종류 — 연속된 같은 카테고리 행을 rowSpan 으로 병합. 첫 행에서만 td 렌더.
                        if (c.id === "category") {
                          if (categoryRowSpans[idx] === 0) return null;
                          // 병합 그룹의 마지막 행 borderBottom 적용 — 그룹 시작 ~ 끝 인덱스 계산
                          const groupEndIdx = idx + categoryRowSpans[idx] - 1;
                          const groupIsLast = groupEndIdx === rows.length - 1
                            || rows[groupEndIdx + 1]?.category !== row.category;
                          const groupBotBd = groupIsLast
                            ? "2px solid var(--text-disabled)"
                            : "1px solid var(--line-subtle)";
                          return (
                            <td key={c.id} rowSpan={categoryRowSpans[idx]}
                              style={{
                                ...base,
                                borderBottom: groupBotBd,
                                padding: "4px 6px 4px 8px",
                                fontSize: 10, color: "var(--text-sub)",
                                fontWeight: 600,
                                verticalAlign: "middle",
                                whiteSpace: "nowrap", overflow: "hidden",
                                textOverflow: "ellipsis",
                                backgroundColor: "var(--bg-base)",
                              }}
                              className="group-hover:brightness-[0.97]">
                              {row.category}
                            </td>
                          );
                        }

                        // ★ 즐겨찾기
                        if (c.id === "fav") {
                          return (
                            <td key={c.id}
                              style={{ ...base, height: row.isHeader ? 24 : 27, textAlign: "center" }}
                              className="group-hover:brightness-[0.97]">
                              {!row.isHeader && (
                                <button onClick={e => { e.stopPropagation(); toggleFav(row.id); }}
                                  className={`text-md leading-none transition-all ${isFav ? "text-[var(--orange-700)]" : "text-[var(--text-disabled)] hover:text-[var(--orange-700)]"}`}>
                                  {isFav ? "★" : "☆"}
                                </button>
                              )}
                            </td>
                          );
                        }

                        // 사용자코드 (mono, sub color)
                        if (c.id === "userCode") {
                          return (
                            <td key={c.id}
                              style={{ ...base, padding: "0 8px", fontSize: 10, color: "var(--text-sub)",
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              className="group-hover:brightness-[0.97]">
                              {!row.isHeader && vi.userCode}
                            </td>
                          );
                        }

                        // 수탁사코드 (mono, tertiary color)
                        if (c.id === "vendorCode") {
                          return (
                            <td key={c.id}
                              style={{ ...base, padding: "0 8px", fontSize: 10, color: "var(--text-tertiary)",
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              className="group-hover:brightness-[0.97]">
                              {!row.isHeader && vi.vendorCode}
                            </td>
                          );
                        }

                        // 검사명 + 빠른 복사 아이콘
                        if (c.id === "name") {
                          return (
                            <td key={c.id}
                              style={{ ...base, padding: "0 8px", overflow: "hidden", whiteSpace: "nowrap" }}
                              className="group-hover:brightness-[0.97]">
                              <div className="flex items-center gap-1 w-full">
                                {row.isCalc && (
                                  <span title={`계산식: ${row.calcFormula}`} className="cursor-help text-xs flex-shrink-0">🤖</span>
                                )}
                                {isGRow && (
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GCOLS[(graphColorIndex.get(row.id) ?? 0) % GCOLS.length] }} />
                                )}
                                <span className={`text-sm truncate min-w-0 flex-1 ${row.isHeader ? "font-semibold text-[var(--text-main)]" : "text-[var(--text-main)]"}`}>
                                  {row.name}
                                </span>
                                {!row.isHeader && (() => {
                                  const di = latestValueIdx(row);
                                  if (di < 0) return null;
                                  const alreadySent = sentCells.has(`${row.id}:${di}`);
                                  return (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); sendToSpecialDetail(row, di); }}
                                      title={alreadySent
                                        ? `✓ 최신값 (${DATES[di]}) 이미 특정내역(JX999)에 전송됨 — 다시 클릭하여 재전송`
                                        : `최신 결과값 (${DATES[di]}) → 특정내역(JX999) 으로 복사`}
                                      className={`flex-shrink-0 w-4 h-4 inline-flex items-center justify-center rounded transition-all ${
                                        alreadySent
                                          ? "text-[var(--brand-primary)] opacity-90 hover:opacity-100"
                                          : "text-[var(--text-tertiary)] opacity-25 group-hover:opacity-80 hover:!text-[var(--brand-primary)] hover:!opacity-100"
                                      }`}>
                                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                        <path d="M5 1.6H9C9.5 1.6 9.8 2 9.8 2.5V3.5H4.2V2.5C4.2 2 4.5 1.6 5 1.6Z" fill="currentColor"/>
                                        <rect x="2.5" y="3.2" width="9" height="9.4" rx="1.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                                        <path d="M5 7.8L6.5 9.3L9 6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  );
                                })()}
                              </div>
                            </td>
                          );
                        }

                        // 수탁사 검사명 (영문)
                        if (c.id === "vendorName") {
                          return (
                            <td key={c.id}
                              style={{ ...base, padding: "0 8px", fontSize: 11, color: "var(--text-sub)",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              className="group-hover:brightness-[0.97]">
                              {!row.isHeader && vi.vendorName}
                            </td>
                          );
                        }

                        // 참고치
                        if (c.id === "refRange") {
                          return (
                            <td key={c.id}
                              title={row.refRange.length > 14 ? row.refRange : undefined}
                              style={{ ...base, padding: "2px 6px", textAlign: "center",
                                fontSize: 10, color: "var(--text-tertiary)",
                                whiteSpace: "normal", overflow: "hidden",
                                lineHeight: 1.25, wordBreak: "keep-all" }}
                              className="group-hover:brightness-[0.97]">
                              {row.refRange}
                            </td>
                          );
                        }

                        return null;
                      })}

                      {/* 날짜별 데이터 셀 — displayDates 순서(최신 좌측) 로 렌더. 우클릭 시 "특정내역으로 보내기" 메뉴 */}
                      {displayDates.map(date => {
                        const di  = DATES.indexOf(date);
                        const val = row.values[di];
                        const st  = row.isHeader ? "empty" : vStatus(row, val);
                        const dv  = row.isHeader
                          ? (val !== null ? "O" : "—")
                          : dispVal(row, val);
                        const col = row.isHeader
                          ? (val !== null ? "var(--green-500)" : "var(--text-placeholder)")
                          : vColor(st);
                        const isImage   = row.resultType === "image" && typeof val === "string";
                        const isPdf     = row.resultType === "pdf"   && typeof val === "string";
                        const isMulti   = row.resultType === "multi-numeric" && typeof val === "number";
                        // 이미지 결과는 기본적으로 📷 아이콘만 (소견은 호버 툴팁).
                        // 단, "소견검사만 보기" 활성 시엔 텍스트 전문 표시 (셀 폭 유지하면서 높이로 wrap).
                        const showImageText = isImage && findingOnly;
                        const isText        = typeof val === "string" && !isPdf && (!isImage || showImageText);
                        const cellKey   = `${row.id}:${di}`;
                        const isSent    = sentCells.has(cellKey);
                        const canSend   = !row.isHeader && val !== null;
                        return (
                          <td key={date}
                            onContextMenu={e => {
                              if (!canSend) return;
                              e.preventDefault();
                              setCellMenu({ row, di, x: e.clientX, y: e.clientY });
                            }}
                            // image·multi·pdf 의 추가 정보는 셀 내부 표시 또는 클릭으로 처리. hover 툴팁 제거됨.
                            // 단, image 텍스트가 셀에 안 보일 때만 native title 로 보조 안내.
                            title={isImage && !showImageText && typeof val === "string" ? (val as string) : undefined}
                            style={{
                              position: "relative",
                              width: dateColW, minWidth: dateColW, maxWidth: dateColW,
                              textAlign: isText ? "left" : "center",
                              padding: isText ? "3px 4px" : "0 4px",
                              verticalAlign: isText ? "top" : "middle", fontSize:11,
                              borderBottom: botBd, borderRight:"1px solid var(--line-subtle)",
                              color: col,
                              cursor: "default",
                              fontWeight: (st === "high" || st === "low") ? 600 : 400,
                              whiteSpace: isText ? "normal" : "nowrap",
                              lineHeight: isText ? 1.3 : undefined,
                              wordBreak: isText ? "keep-all" : undefined,
                              overflowWrap: isText ? "break-word" : undefined,
                            }}>
                            {isPdf ? (
                              // PDF 결과: 📄 아이콘만. 클릭 시 뷰어 (prototype: alert).
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); showToast(`PDF 뷰어 열기: ${val}`); }}
                                title={String(val)}
                                style={{ fontSize: 14, cursor: "pointer" }}
                                className="hover:opacity-70 transition-opacity"
                              >📄</button>
                            ) : isImage && !showImageText ? (
                              // 일반 모드: 📷 아이콘만. abnormal 이면 빨강, 아니면 회색.
                              <span style={{ fontSize: 14 }}>📷</span>
                            ) : isImage && showImageText ? (
                              // 소견검사만 보기 모드: 📷 + 텍스트 전문 (셀 폭 유지, 높이로 wrap).
                              <span className="flex items-start gap-1 text-left" style={{ width: "100%" }}>
                                <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>📷</span>
                                <span style={{ fontSize: 11, whiteSpace: "pre-line", wordBreak: "keep-all", overflowWrap: "break-word", minWidth: 0, flex: 1 }}>
                                  {dv}
                                </span>
                              </span>
                            ) : isMulti ? (
                              // 다중 수치: 주값 + 작은 ⋯ 표식 — 호버 시 IFCC/eAG 등 전체 표시
                              <span className="inline-flex items-baseline gap-0.5">
                                <span>{vArrow(st, val)}{dv}</span>
                                <span style={{ fontSize: 8, color: "var(--text-tertiary)", verticalAlign: "super" }} title="여러 값 — 호버 확인">⋯</span>
                              </span>
                            ) : (
                              <>{vArrow(st, val)}{dv}</>
                            )}
                            {/* 특정내역으로 전송된 셀 — 우상단 작은 📋 표시 */}
                            {isSent && (
                              <span
                                title="특정내역으로 전송됨"
                                style={{
                                  position: "absolute",
                                  top: 1,
                                  right: 1,
                                  fontSize: 9,
                                  lineHeight: 1,
                                  color: "var(--brand-primary)",
                                  pointerEvents: "none",
                                }}
                              >📋</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 그래프 패널 — 검사별 개별 차트. 검사 多 시 세로 스크롤. */}
          {showGraph && (
            <div className="flex flex-col border-l border-[var(--line-default)] overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
              {/* 그래프 헤더 — 좌측 표에 보이는 numeric 검사가 자동 plot. */}
              <div className="flex items-center gap-2 px-3 border-b border-[var(--line-default)] flex-shrink-0"
                style={{ minHeight: 36, backgroundColor: "var(--bg-subtle)", padding: "6px 12px" }}>
                <span className="text-sm font-medium text-[var(--text-main)]">시계열 그래프</span>
                <span className="text-xs text-[var(--text-tertiary)]">검사별 개별 차트 · 좌측 표 필터(★·이상치·검색)로 자동 조정</span>
                <span className="ml-auto text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">
                  {graphRowList.length}건
                </span>
              </div>

              {/* 그래프 영역 — 검사별 1개씩 개별 LineChart. overflow-y-auto 로 多 검사 시 스크롤. */}
              <div className="flex-1 overflow-y-auto p-2 min-h-0">
                {graphRowList.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-md text-[var(--text-tertiary)] text-center px-6">
                    좌측 표에 표시된 수치 검사가 없습니다.<br/>★ 즐겨찾기를 추가하거나 표시 필터를 조정해보세요.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {graphRowList.map((r, ci) => {
                      const color = GCOLS[ci % GCOLS.length];
                      // 행별 데이터 — visibleDates 순으로 (date, value) 쌍
                      const data = visibleDates.map(date => {
                        const di = DATES.indexOf(date);
                        const v = r.values[di];
                        return { date: date.slice(5), value: typeof v === "number" ? v : null };
                      });
                      const hasRef = r.refMin !== undefined && r.refMax !== undefined && r.refMax < 999;
                      const isHighlighted = highlightedChartId === r.id;
                      return (
                        <div
                          key={r.id}
                          ref={el => { chartRefs.current[r.id] = el; }}
                          className={`border rounded-md overflow-hidden bg-white flex-shrink-0 transition-all ${
                            isHighlighted
                              ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)] ring-offset-1"
                              : "border-[var(--line-default)]"
                          }`}>
                          {/* 차트별 헤더 — 검사명 + 참조범위 */}
                          <div className="flex items-center gap-1.5 px-2 py-1 border-b border-[var(--line-subtle)] bg-[var(--bg-subtle)]">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium text-[var(--text-main)] truncate flex-1 min-w-0">{r.name}</span>
                            {hasRef && (
                              <span className="text-micro text-[var(--text-tertiary)] tabular-nums flex-shrink-0">
                                참조 {r.refMin}~{r.refMax}{r.unit ? ` ${r.unit}` : ""}
                              </span>
                            )}
                          </div>
                          {/* 차트 — 고정 높이 160px */}
                          <div style={{ height: 160 }} className="p-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line-subtle)" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-tertiary)" }} />
                                <YAxis tick={{ fontSize: 9, fill: "var(--text-tertiary)" }} width={38} />
                                <ChartTooltip
                                  contentStyle={{ fontSize: 11, border: "1px solid var(--line-default)", borderRadius: 6, padding: "6px 10px" }}
                                  labelStyle={{ fontWeight: 600, marginBottom: 4 }} />
                                {hasRef && (
                                  <ReferenceArea y1={r.refMin} y2={r.refMax}
                                    fill={color} fillOpacity={0.08} strokeOpacity={0} />
                                )}
                                <Line type="monotone" dataKey="value" name={r.name}
                                  stroke={color} strokeWidth={2}
                                  dot={{ r: 3, fill: color }}
                                  activeDot={{ r: 5 }} connectNulls />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⑤-pre. 셀 우클릭 컨텍스트 메뉴 — "특정내역으로 보내기" 등 액션 */}
      {cellMenu && (() => {
        const v = cellMenu.row.values[cellMenu.di];
        const valStr = dispVal(cellMenu.row, v);
        // 메뉴가 화면 우측을 벗어나지 않도록 좌표 클램프
        const menuW = 200;
        const left = Math.min(cellMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - menuW - 8);
        const top = cellMenu.y + 2;
        return (
          <div
            style={{ position: "fixed", left, top, width: menuW, zIndex: 10010 }}
            onMouseDown={e => e.stopPropagation()}
            className="bg-white border border-[var(--line-default)] rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border-b border-[var(--line-subtle)]">
              <div className="text-xs font-medium text-[var(--text-main)] truncate">{cellMenu.row.name}</div>
              <div className="text-micro text-[var(--text-tertiary)] tabular-nums">{DATES[cellMenu.di]} · {valStr}</div>
            </div>
            <button
              onClick={() => sendToSpecialDetail(cellMenu.row, cellMenu.di)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-primary-subtle)] transition-colors text-left"
            >
              <span className="text-md">📋</span>
              <span>특정내역으로 보내기</span>
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText(`${cellMenu.row.name} ${valStr} (${DATES[cellMenu.di]})`); showToast("클립보드에 복사됨"); setCellMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors text-left border-t border-[var(--line-subtle)]"
            >
              <span className="text-md">📄</span>
              <span>복사</span>
            </button>
          </div>
        );
      })()}

      {/* ⑤-post. 토스트 — 특정내역 보내기 등 액션 결과 안내 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10020] bg-[var(--text-main)] text-white px-4 py-2 rounded-lg shadow-2xl pointer-events-none">
          <span className="text-sm">{toast}</span>
        </div>
      )}

      {/* ⑤ (제거됨) 셀 호버 툴팁 — 셀 자체가 정보를 표현. image text 는 native title 또는 소견검사만 보기 모드에서 확인. */}

      {/* ⑥ 플로팅 미니 차트 (우측 하단) */}
      <div className="fixed bottom-4 right-4 z-[9990]" style={{ width: miniOpen ? 340 : "auto" }}>
        {miniOpen && (
          <div className="bg-white rounded-xl shadow-2xl border border-[var(--line-default)] overflow-hidden mb-2"
            style={{ width: 340, maxHeight: 420 }}>
            {/* 헤더 */}
            <div className="flex items-center px-3 border-b border-[var(--line-default)]" style={{ height: 36, backgroundColor:"var(--bg-subtle)" }}>
              <span className="text-sm font-semibold text-[var(--text-main)] flex-1">오늘 차트 — 김지영</span>
              <span className="text-xs text-[var(--text-tertiary)]">2026.03.17</span>
              <button onClick={() => setMiniOpen(false)} className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-lg">✕</button>
            </div>
            {/* 진단 */}
            <div className="px-3 py-2 border-b border-[var(--line-subtle)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">진단</p>
              {[
                { code:"J00",   name:"급성비인두염[코감기]" },
                { code:"I10",   name:"본태성(원발성) 고혈압" },
                { code:"E11.9", name:"제2형 당뇨병, 합병증 없음" },
              ].map(d => (
                <div key={d.code} className="flex items-center gap-2 py-0.5">
                  <span className="text-micro text-[var(--text-tertiary)] w-12 flex-shrink-0">{d.code}</span>
                  <span className="text-xs text-[var(--text-main)] truncate">{d.name}</span>
                </div>
              ))}
            </div>
            {/* 처방 */}
            <div className="px-3 py-2 border-b border-[var(--line-subtle)] max-h-48 overflow-y-auto">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">오늘 처방</p>
              {MINI_RX.map(rx => (
                <div key={rx.name} className="flex items-center gap-2 py-0.5">
                  <span className="text-xs text-[var(--text-main)] flex-1 truncate">{rx.name}</span>
                  <span className="text-micro text-[var(--text-tertiary)] flex-shrink-0">1일 {rx.freq}회</span>
                </div>
              ))}
            </div>
            {/* 처방 추가 버튼 */}
            <div className="px-3 py-2 bg-[var(--bg-subtle)]">
              <button
                onClick={() => { alert("메인 창 차트에 처방이 추가되었습니다.\n(실제 구현 시 postMessage로 메인 창과 통신)"); }}
                className="w-full h-7 text-sm rounded text-white transition-colors"
                style={{ backgroundColor: "var(--brand-primary)" }}>
                + 처방 추가 (메인 창으로 전송)
              </button>
            </div>
          </div>
        )}
        {/* 토글 버튼 */}
        <button onClick={() => setMiniOpen(v => !v)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl shadow-xl text-white text-sm font-medium transition-all"
          style={{ backgroundColor: miniOpen ? "var(--text-main)" : "var(--brand-primary)" }}>
          {miniOpen ? "▼ 오늘 차트 접기" : "▲ 오늘 차트 보기"}
        </button>
      </div>
    </div>
  );
}