// 검사결과 뷰어 — 앱 내 전체화면 오버레이로 열림
import { useState, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ReferenceArea, ResponsiveContainer,
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

// ─── 컬럼 폭 ─────────────────────────────────────────────────────────────────
const W_FAV  = 32;
const W_CAT  = 76;
const W_NAME = 210;
const W_REF  = 104;
const W_DATE = 86;                  // 기본 데이터 셀 폭 (수치·정성)
const W_DATE_FINDING = 180;         // 소견검사만 보기 모드 — 텍스트가 잘 읽히도록 확대
const W_STICKY = W_FAV + W_CAT + W_NAME + W_REF;

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
    decimals:2, isCalc:true, calcFormula:"공복혈당 × 공복인슐린 ÷ 405\n→ 공복혈당(h1) + 공복인슐린(c8) 기반" },

  // ─ 진단혈액·기본 혈구 ─
  { id:"h3",  category:"진단혈액", name:"혈색소 (Hgb)", refRange:"12.0~16.0 g/dL",
    refMin:12, refMax:16, values:[13.5,null,null,13.2,null,12.8,null,12.5,null,12.2,12.0,11.8], decimals:1 },
  { id:"h4",  category:"진단혈액", name:"혈소판 (PLT)", refRange:"150~400 ×10³/μL",
    refMin:150, refMax:400, values:[280,null,null,265,null,258,null,245,null,240,235,230] },
  { id:"h5",  category:"진단혈액", name:"백혈구 (WBC)", refRange:"4.0~10.0 ×10³/μL",
    refMin:4.0, refMax:10.0, values:[6.2,null,null,6.5,null,7.2,null,6.8,null,7.5,7.2,8.1], decimals:1 },

  // ─ 진단혈액·간기능 (AST + ALT + γ-GTP + FIB-4 + AST/ALT ratio 인접) ─
  { id:"h6",  category:"진단혈액", name:"AST (SGOT)", refRange:"0~40 U/L",
    refMin:0, refMax:40, values:[28,null,null,32,null,42,null,38,null,45,41,48], defaultFav:true },
  { id:"h7",  category:"진단혈액", name:"ALT (SGPT)", refRange:"0~35 U/L",
    refMin:0, refMax:35, values:[22,null,null,25,null,38,null,42,null,48,45,52], defaultFav:true },
  { id:"h8",  category:"진단혈액", name:"γ-GTP", refRange:"8~35 U/L",
    refMin:8, refMax:35, values:[22,null,null,25,null,38,null,41,null,48,52,58] },
  { id:"calc1", category:"자동계산", name:"FIB-4 (간섬유화도)", refRange:"<1.30",
    refMin:0, refMax:1.30, values:[1.11,null,null,1.15,null,1.28,null,1.35,null,1.48,1.45,1.51],
    decimals:2, isCalc:true, calcFormula:"(나이 × AST) ÷ (PLT × √ALT)\n→ AST(h6) + ALT(h7) + PLT(h4) 기반", defaultFav:true },
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
    refMin:0, refMax:149, values:[142,null,null,168,null,182,null,195,null,188,201,195], defaultFav:true },
  { id:"c2",  category:"임상화학", name:"총콜레스테롤 (TC)", refRange:"0~199 mg/dL",
    refMin:0, refMax:199, values:[195,null,null,202,null,208,null,215,null,218,212,220], defaultFav:true },
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
export function LabViewer({ onClose }: { onClose?: () => void }) {
  useEffect(() => { document.title = "검사결과 뷰어 — 김지영 (100236)"; }, []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [selCats,   setSelCats]   = useState<Set<string>>(new Set(DATA_CATS));
  const [selDates,  setSelDates]  = useState<Set<string>>(new Set(DATES));
  const [favs,      setFavs]      = useState<Set<string>>(new Set(LAB.filter(r => r.defaultFav).map(r => r.id)));
  const [abnOnly,   setAbnOnly]   = useState(false);
  const [favOnly,   setFavOnly]   = useState(false);
  // 소견검사만 보기 — image 타입(PACS 연동) 검사만 노출하고, 셀에 📷 대신 텍스트 전문 표시.
  // 의사가 영상·내시경 소견 흐름만 빠르게 살펴볼 때 유용.
  const [findingOnly, setFindingOnly] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [search,    setSearch]    = useState("");
  const [graphRows, setGraphRows] = useState<Set<string>>(new Set(["h1","h6","c2","calc3"]));
  const [presetOpen, setPresetOpen] = useState(false);
  const [miniOpen,   setMiniOpen]   = useState(false);
  const [tooltip, setTooltip] = useState<{row:LabRow; di:number; x:number; y:number} | null>(null);
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
      return true;
    });
  }, [selCats, search, favOnly, favs, abnOnly, findingOnly, visibleDateIdxs]);

  const graphData = useMemo(() => {
    return visibleDates.map(date => {
      const di = DATES.indexOf(date);
      const pt: Record<string, number | string | null> = { date: date.slice(5) };
      graphRows.forEach(id => {
        const r = LAB.find(x => x.id === id);
        if (r) {
          const v = r.values[di];
          // 그래프는 수치 값만 plot — 텍스트(finding/image) 는 null 처리
          pt[id] = typeof v === "number" ? v : null;
        }
      });
      return pt;
    });
  }, [visibleDates, graphRows]);

  const graphRowList = LAB.filter(r => graphRows.has(r.id));

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleCat  = (c: string) => setSelCats(p  => { const n = new Set(p);  n.has(c)  ? n.delete(c)  : n.add(c);  return n; });
  const toggleDate = (d: string) => setSelDates(p => { const n = new Set(p);  if (n.has(d) && n.size > 1) n.delete(d); else n.add(d); return n; });
  const toggleFav  = (id: string) => setFavs(p   => { const n = new Set(p);  n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleGRow = (id: string) => {
    if (!showGraph) return;
    const row = LAB.find(r => r.id === id);
    // 수치 결과만 그래프 가능 — finding/image 는 그래프에 의미 없음
    if (!row || row.isHeader || row.resultType === "finding" || row.resultType === "image") return;
    setGraphRows(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  // 카운트 기반 (기존) — 최신 N건
  const applyDatePreset = (cnt: number) => setSelDates(new Set(cnt >= DATES.length ? DATES : DATES.slice(-cnt)));
  // 기간 기반 (신규) — 마지막 검사일 기준 최근 N개월. null=전체.
  const applyDatePeriod = (months: number | null) => {
    if (months === null) { setSelDates(new Set(DATES)); return; }
    const cutoff = periodCutoffFromLatest(months);
    const next = DATES.filter(d => d >= cutoff);
    setSelDates(new Set(next.length > 0 ? next : [DATES[DATES.length - 1]]));
  };
  const applyRowPreset  = (ids: string[]) => { setGraphRows(new Set(ids)); setShowGraph(true); setPresetOpen(false); };

  // ── Group rows ─────────────────────────────────────────────────────────────
  let prevCat = "";
  const rows = filteredRows.map(row => {
    const firstInGroup = row.category !== prevCat;
    prevCat = row.category;
    return { ...row, firstInGroup };
  });

  // 데이터 셀 동적 폭 — 소견검사만 보기 모드일 땐 텍스트 wrap 공간 확보를 위해 확대
  const dateColW = findingOnly ? W_DATE_FINDING : W_DATE;

  // ── Sticky cell shared styles ──────────────────────────────────────────────
  const stickyTd = (left: number, bg: string, border: boolean): CSSProperties => ({
    position: "sticky", left, zIndex: 10, backgroundColor: bg,
    borderRight: border ? "2px solid var(--text-disabled)" : "1px solid var(--line-default)",
    verticalAlign: "middle",
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* ① 환자 정보 바 (40px, 다크) */}
      <div className="flex items-center px-4 gap-2 flex-shrink-0" style={{ height: 40, backgroundColor: "var(--text-main)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-white font-bold" style={{ fontSize: 13 }}>김지영</span>
          <span className="text-[var(--text-sub)] text-sm">|</span>
          <span className="text-[var(--text-placeholder)] text-sm">차트번호 100236</span>
          <span className="text-[var(--text-sub)] text-sm">|</span>
          <span className="text-[var(--text-placeholder)] text-sm">1974.03.12</span>
          <span className="text-[var(--text-sub)] text-sm">|</span>
          <span className="text-[var(--text-placeholder)] text-sm tabular-nums">여/52</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["PACS 연동","알림톡 발송","인쇄","Excel 내보내기"].map(lbl => (
            <button key={lbl} className="h-7 px-2.5 rounded text-xs text-[var(--text-placeholder)] border border-[var(--text-main)] hover:border-[#666] hover:text-white transition-colors whitespace-nowrap">
              {lbl}
            </button>
          ))}
          <button onClick={() => onClose?.()}
            className="h-7 px-2.5 rounded text-xs text-white bg-[var(--text-main)] hover:bg-[#555] ml-1 whitespace-nowrap">
            ✕ 닫기
          </button>
        </div>
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

      {/* ③ 툴바 (36px) — 보기 필터 4종 한 그룹 (좌측), 검색 (우측) */}
      <div className="flex items-center px-4 gap-2 flex-shrink-0 border-b border-[var(--line-default)]"
        style={{ height: 36, backgroundColor: "var(--bg-subtle)" }}>
        {/* 보기 필터 그룹 — 이상치/즐겨찾기/그래프/모아보기 한 줄에 모임 */}
        <div className="flex items-center gap-1.5" ref={presetRef}>
          <span className="text-xs text-[var(--text-tertiary)] mr-1 hidden sm:inline">보기:</span>
          {[
            { label:"이상치만",  active:abnOnly,    fn:()=>setAbnOnly(v=>!v),   activeCls:"bg-[var(--status-warning-bg-subtle)] text-[var(--orange-500)] border-[var(--orange-500)]" },
            { label:"즐겨찾기만",active:favOnly,    fn:()=>setFavOnly(v=>!v),   activeCls:"bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-700)]" },
            { label:"소견검사만",active:findingOnly, fn:()=>setFindingOnly(v=>!v),activeCls:"bg-[var(--bg-primary-subtle)] text-[var(--blue-700)] border-[var(--blue-700)]" },
            { label:"그래프",    active:showGraph,   fn:()=>setShowGraph(v=>!v), activeCls:"bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]" },
          ].map(({ label, active, fn, activeCls }) => (
            <button key={label} onClick={fn}
              className={`h-6 px-3 text-sm rounded border transition-colors whitespace-nowrap ${
                active ? activeCls : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--text-tertiary)]"
              }`}>
              {label}
            </button>
          ))}
          {/* 모아보기 세트 — 그래프 보기와 의미상 연결되므로 인접 배치. 활성 시 brand-primary 톤. */}
          <div className="relative">
            <button onClick={() => setPresetOpen(v => !v)}
              className={`h-6 px-3 text-sm rounded border transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                presetOpen
                  ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
                  : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--text-tertiary)]"
              }`}>
              모아보기 세트
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" className={`transition-transform ${presetOpen ? "rotate-180" : ""}`}>
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {presetOpen && (
              <div className="absolute top-7 left-0 bg-white border border-[var(--line-default)] rounded-lg shadow-xl w-44 z-50 py-1 overflow-hidden">
                {PRESETS.map(ps => (
                  <button key={ps.name} onClick={() => applyRowPreset(ps.rows)}
                    className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
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
        <div className="flex-1" />
        {/* 우측 — 검색 */}
        <div className="flex items-center gap-1.5 bg-white border border-[var(--line-default)] rounded px-2 h-6 w-40">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.5"/>
            <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검사명 검색..."
            className="text-sm flex-1 outline-none placeholder:text-[var(--text-placeholder)] bg-transparent" />
        </div>
      </div>

      {/* ④ 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측 날짜 네비 (120px) — 기록 범위 배너 + 기간 기반 프리셋 */}
        <div className="flex flex-col flex-shrink-0 border-r border-[var(--line-default)] overflow-hidden"
          style={{ width: 120, backgroundColor: "var(--bg-subtle)" }}>
          {/* 검사 기록 범위 배너 — "전체" 의 기준을 명시 (언제부터 언제까지, 총 N건) */}
          <div className="px-2 pt-2 pb-1.5 flex-shrink-0 border-b border-[var(--line-default)]">
            <div className="text-micro text-[var(--text-tertiary)]">검사 기록 범위</div>
            <div className="text-xs font-medium text-[var(--text-main)] tabular-nums leading-tight mt-0.5">
              {DATE_RANGE.first.slice(2).replace(/\./g, ".")}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] tabular-nums leading-tight">~ {DATE_RANGE.last.slice(2).replace(/\./g, ".")}</div>
            <div className="text-micro text-[var(--text-tertiary)] mt-0.5">
              총 <span className="tabular-nums font-bold text-[var(--text-main)]">{DATES.length}</span>건
              · 선택 <span className="tabular-nums font-bold text-[var(--brand-primary)]">{selDates.size}</span>건
              {findingOnly && visibleDates.length !== selDates.size && (
                <span> · 표시 <span className="tabular-nums font-bold text-[var(--blue-700)]">{visibleDates.length}</span></span>
              )}
            </div>
          </div>
          {/* 기간 프리셋 — 마지막 검사일 기준 최근 N개월. 빈 결과면 최신 1건만 선택. */}
          <div className="px-1.5 pt-1.5 pb-1.5 flex-shrink-0 border-b border-[var(--line-default)]">
            <div className="text-micro text-[var(--text-tertiary)] px-1 mb-1">기간 필터</div>
            <div className="grid grid-cols-2 gap-0.5">
              {[
                { label:"3개월", months:3 },
                { label:"1년",   months:12 },
                { label:"3년",   months:36 },
                { label:"5년",   months:60 },
              ].map(({ label, months }) => (
                <button key={label} onClick={() => applyDatePeriod(months)}
                  className="text-micro text-[var(--text-sub)] bg-white border border-[var(--line-default)] rounded py-0.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
                  {label}
                </button>
              ))}
              <button onClick={() => applyDatePeriod(null)}
                className="col-span-2 text-micro text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)] rounded py-0.5 hover:bg-[var(--brand-primary)] hover:text-white transition-colors">
                전체 ({DATES.length}건)
              </button>
            </div>
          </div>
          {/* 카운트 프리셋 (보조) */}
          <div className="px-1.5 pt-1.5 pb-1.5 flex-shrink-0 border-b border-[var(--line-default)]">
            <div className="text-micro text-[var(--text-tertiary)] px-1 mb-1">최근 N건</div>
            <div className="grid grid-cols-2 gap-0.5">
              {[
                { label:"3건", n:3 },{ label:"6건", n:6 },
              ].map(({ label, n }) => (
                <button key={label} onClick={() => applyDatePreset(n)}
                  className="text-micro text-[var(--text-sub)] bg-white border border-[var(--line-default)] rounded py-0.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* 날짜 리스트 (역순, 최신이 위) */}
          <div className="flex-1 overflow-y-auto">
            {[...DATES].reverse().map(date => {
              const active = selDates.has(date);
              return (
                <div key={date} onClick={() => toggleDate(date)}
                  className="flex items-center cursor-pointer hover:bg-white transition-colors"
                  style={{ height: 28, borderLeft: active ? "3px solid var(--brand-primary)" : "3px solid transparent", backgroundColor: active ? "white" : "transparent", paddingLeft: 6 }}>
                  <span className={`text-xs leading-none tabular-nums ${active ? "text-[var(--text-main)] font-bold" : "text-[var(--text-tertiary)]"}`}>
                    {date.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 테이블 + 그래프 영역 */}
        <div className="flex flex-1 overflow-hidden">

          {/* 검사결과 테이블 */}
          <div ref={tableRef} onMouseLeave={() => setTooltip(null)}
            className={`overflow-auto ${showGraph ? "" : "flex-1"}`}
            style={showGraph ? { width: "50%", flexShrink: 0 } : {}}>
            <table style={{ borderCollapse:"collapse", minWidth: W_STICKY + visibleDates.length * dateColW, tableLayout: "fixed" }} className="text-sm">
              {/* 고정 헤더 */}
              <thead>
                <tr style={{ backgroundColor: "var(--bg-subtle)" }}>
                  <th style={{ position:"sticky", top:0, left:0, zIndex:30, width:W_FAV, minWidth:W_FAV, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"1px solid var(--line-default)", height:32, textAlign:"center", fontSize:10, fontWeight:600, color:"var(--text-tertiary)" }}>★</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV, zIndex:30, width:W_CAT, minWidth:W_CAT, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"1px solid var(--line-default)", textAlign:"left", padding:"0 8px", fontSize:10, fontWeight:600, color:"var(--text-tertiary)" }}>검사종류</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV+W_CAT, zIndex:30, width:W_NAME, minWidth:W_NAME, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"1px solid var(--line-default)", textAlign:"left", padding:"0 8px", fontSize:10, fontWeight:600, color:"var(--text-tertiary)" }}>검사명</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV+W_CAT+W_NAME, zIndex:30, width:W_REF, minWidth:W_REF, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"2px solid var(--text-disabled)", textAlign:"center", padding:"0 6px", fontSize:10, fontWeight:600, color:"var(--text-tertiary)" }}>참조치</th>
                  {visibleDates.map(date => (
                    <th key={date} style={{ position:"sticky", top:0, zIndex:20, width:dateColW, minWidth:dateColW, backgroundColor:"var(--bg-subtle)", borderBottom:"2px solid var(--text-disabled)", borderRight:"1px solid var(--line-default)", textAlign:"center", fontSize:10, fontWeight:600, color:"var(--text-main)", whiteSpace:"nowrap", padding:"0 4px" }}>
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isFav    = favs.has(row.id);
                  const isGRow   = graphRows.has(row.id) && showGraph;
                  const isLast   = idx === rows.length - 1 || rows[idx+1]?.category !== row.category;
                  const rowBg    = row.isHeader ? "var(--bg-subtle)"
                                 : isFav        ? "var(--status-warning-bg-subtle)"
                                 : isGRow       ? "var(--bg-primary-subtle)"
                                 : "white";
                  const botBd    = isLast ? "2px solid var(--text-disabled)" : "1px solid var(--line-subtle)";

                  return (
                    <tr key={row.id}
                      onClick={() => !row.isHeader && toggleGRow(row.id)}
                      style={{ backgroundColor: rowBg, cursor: showGraph && !row.isHeader ? "pointer" : "default" }}
                      className="group hover:brightness-[0.97]">

                      {/* ★ 즐겨찾기 */}
                      <td style={{ ...stickyTd(0, rowBg, false), width:W_FAV, height: row.isHeader ? 24 : 27, borderBottom: botBd, textAlign:"center" }}
                        className="group-hover:brightness-[0.97]">
                        {!row.isHeader && (
                          <button onClick={e => { e.stopPropagation(); toggleFav(row.id); }}
                            className={`text-md leading-none transition-all ${isFav ? "text-[var(--orange-700)]" : "text-[var(--text-disabled)] hover:text-[var(--orange-700)]"}`}>
                            {isFav ? "★" : "☆"}
                          </button>
                        )}
                      </td>

                      {/* 검사종류 */}
                      <td style={{ ...stickyTd(W_FAV, rowBg, false), width:W_CAT, borderBottom: botBd, padding:"0 6px 0 8px", fontSize:10, color:"var(--text-sub)", overflow:"hidden", whiteSpace:"nowrap" }}
                        className="group-hover:brightness-[0.97]">
                        {row.firstInGroup ? row.category : ""}
                      </td>

                      {/* 검사명 */}
                      <td style={{ ...stickyTd(W_FAV+W_CAT, rowBg, false), width:W_NAME, borderBottom: botBd, padding:"0 8px", overflow:"hidden", whiteSpace:"nowrap" }}
                        className="group-hover:brightness-[0.97]">
                        <div className="flex items-center gap-1">
                          {row.isCalc && (
                            <span title={`계산식: ${row.calcFormula}`} className="cursor-help text-xs flex-shrink-0">🤖</span>
                          )}
                          {isGRow && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GCOLS[Array.from(graphRows).indexOf(row.id) % GCOLS.length] }} />
                          )}
                          <span className={`text-sm truncate ${row.isHeader ? "font-semibold text-[var(--text-main)]" : "text-[var(--text-main)]"}`}>
                            {row.name}
                          </span>
                        </div>
                      </td>

                      {/* 참조치 */}
                      <td style={{ ...stickyTd(W_FAV+W_CAT+W_NAME, rowBg, true), width:W_REF, borderBottom: botBd, padding:"0 6px", textAlign:"center", fontSize:10, color:"var(--text-tertiary)", whiteSpace:"nowrap", overflow:"hidden" }}
                        className="group-hover:brightness-[0.97]">
                        {row.refRange}
                      </td>

                      {/* 날짜별 데이터 셀 — 우클릭 시 "특정내역으로 보내기" 메뉴 */}
                      {visibleDates.map(date => {
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
                            onMouseEnter={e => {
                              if (!row.isHeader && val !== null) {
                                const r = e.currentTarget.getBoundingClientRect();
                                setTooltip({ row, di, x: r.left + r.width / 2, y: r.bottom + 6 });
                              }
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            style={{
                              position: "relative",
                              width: dateColW, minWidth: dateColW, maxWidth: dateColW,
                              textAlign: isText ? "left" : "center",
                              padding: isText ? "3px 4px" : "0 4px",
                              verticalAlign: isText ? "top" : "middle", fontSize:11,
                              borderBottom: botBd, borderRight:"1px solid var(--line-subtle)",
                              color: col,
                              cursor: val !== null && !row.isHeader ? "help" : "default",
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

          {/* 그래프 패널 */}
          {showGraph && (
            <div className="flex flex-col border-l border-[var(--line-default)] overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
              {/* 그래프 헤더 */}
              <div className="flex items-center gap-2 px-3 border-b border-[var(--line-default)] flex-shrink-0 flex-wrap"
                style={{ minHeight: 36, backgroundColor: "var(--bg-subtle)", padding: "6px 12px" }}>
                <span className="text-sm font-medium text-[var(--text-main)]">시계열 그래프</span>
                <span className="text-xs text-[var(--text-tertiary)]">행 클릭으로 추가/제거</span>
                {graphRowList.map((r, ci) => (
                  <span key={r.id} onClick={() => toggleGRow(r.id)}
                    className="flex items-center gap-1 text-xs rounded cursor-pointer px-1.5 py-0.5 border"
                    style={{ color: GCOLS[ci % GCOLS.length], borderColor: GCOLS[ci % GCOLS.length] + "60", backgroundColor: GCOLS[ci % GCOLS.length] + "15" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GCOLS[ci % GCOLS.length] }} />
                    {r.name}
                    <span className="ml-0.5 opacity-50">✕</span>
                  </span>
                ))}
              </div>

              {/* 그래프 영역 */}
              <div className="flex-1 p-2 min-h-0">
                {graphRowList.length === 0
                  ? <div className="h-full flex items-center justify-center text-md text-[var(--text-tertiary)]">
                      테이블에서 검사 항목을 클릭하면 그래프가 표시됩니다
                    </div>
                  : <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData} margin={{ top:8, right:20, bottom:8, left:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line-subtle)" />
                        <XAxis dataKey="date" tick={{ fontSize:9, fill:"var(--text-tertiary)" }} />
                        <YAxis tick={{ fontSize:9, fill:"var(--text-tertiary)" }} width={38} />
                        <ChartTooltip
                          contentStyle={{ fontSize:11, border:"1px solid var(--line-default)", borderRadius:6, padding:"6px 10px" }}
                          labelStyle={{ fontWeight:600, marginBottom:4 }} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize:10, paddingTop:4 }} />
                        {/* Reference areas (참조 범위 배경) */}
                        {graphRowList.map((r, ci) => {
                          if (r.refMin === undefined || r.refMax === undefined || r.refMax >= 999) return null;
                          return (
                            <ReferenceArea key={`ra-${r.id}`} y1={r.refMin} y2={r.refMax}
                              fill={GCOLS[ci % GCOLS.length]} fillOpacity={0.05} strokeOpacity={0} />
                          );
                        })}
                        {/* Lines */}
                        {graphRowList.map((r, ci) => (
                          <Line key={r.id} type="monotone" dataKey={r.id} name={r.name}
                            stroke={GCOLS[ci % GCOLS.length]} strokeWidth={2}
                            dot={{ r:3, fill:GCOLS[ci % GCOLS.length] }}
                            activeDot={{ r:5 }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                }
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

      {/* ⑤ 셀 호버 툴팁 — 이미지·소견·다중수치·PDF 결과 상세 노출 */}
      {tooltip && (
        <div style={{
            position:"fixed", left: tooltip.x, top: tooltip.y, transform:"translateX(-50%)",
            zIndex:9999, pointerEvents:"none", maxWidth: 320, maxHeight: 360, overflowY: "auto",
          }}
          className="bg-[var(--bg-inverse)] text-white rounded-lg shadow-2xl px-3 py-2">
          <div className="text-sm font-medium mb-1 text-white">{tooltip.row.name}</div>
          {/* 이미지 결과 — 소견 텍스트 (긴 경우 스크롤). whitespace-pre-line 으로 줄바꿈 유지. */}
          {tooltip.row.resultType === "image" && typeof tooltip.row.values[tooltip.di] === "string" && (
            <div className="text-sm text-white mb-1 leading-snug border-b border-[var(--text-main)] pb-1 flex items-start gap-1 whitespace-pre-line">
              <span className="flex-shrink-0">📷</span>
              <span>{tooltip.row.values[tooltip.di] as string}</span>
            </div>
          )}
          {/* 다중 수치 — 전체 라벨/값 breakdown */}
          {tooltip.row.resultType === "multi-numeric" && tooltip.row.multiValues?.[tooltip.di] && (
            <div className="mb-1 border-b border-[var(--text-main)] pb-1">
              {tooltip.row.multiValues[tooltip.di]!.map((mv, i) => (
                <div key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="text-[var(--text-placeholder)] w-12 flex-shrink-0">{mv.label}</span>
                  <span className="text-white tabular-nums">{mv.value}</span>
                </div>
              ))}
            </div>
          )}
          {/* PDF — 파일명 + 보기 안내 */}
          {tooltip.row.resultType === "pdf" && typeof tooltip.row.values[tooltip.di] === "string" && (
            <div className="text-sm text-white mb-1 border-b border-[var(--text-main)] pb-1 flex items-start gap-1.5">
              <span className="flex-shrink-0">📄</span>
              <div className="flex flex-col">
                <span className="break-all">{tooltip.row.values[tooltip.di] as string}</span>
                <span className="text-xs text-[var(--text-placeholder)] mt-0.5">클릭하여 PDF 뷰어 열기</span>
              </div>
            </div>
          )}
          <div className="text-xs text-[var(--text-placeholder)] space-y-0.5">
            <div>날짜: {DATES[tooltip.di]}</div>
            <div>참조치: {tooltip.row.refRange}</div>
            {(() => {
              const val = tooltip.row.values[tooltip.di];
              const st  = vStatus(tooltip.row, val);
              const isText = typeof val === "string";
              if (st !== "empty" && st !== "normal") {
                const msg = isText ? "이상 소견" : (st === "high" ? "참조치 초과" : "참조치 미만");
                return <div style={{ color: st === "high" ? "var(--red-200)" : "var(--blue-300)" }}>{msg}</div>;
              }
            })()}
            {tooltip.row.isCalc && (
              <div className="text-[var(--blue-300)] mt-1 border-t border-[var(--text-main)] pt-1 whitespace-pre-line">
                {tooltip.row.calcFormula}
              </div>
            )}
            {/* 특정내역으로 전송된 셀이면 추가 안내 */}
            {sentCells.has(`${tooltip.row.id}:${tooltip.di}`) && (
              <div className="text-[var(--green-300)] mt-1 border-t border-[var(--text-main)] pt-1 flex items-center gap-1">
                <span>📋</span><span>특정내역으로 전송됨</span>
              </div>
            )}
          </div>
        </div>
      )}

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