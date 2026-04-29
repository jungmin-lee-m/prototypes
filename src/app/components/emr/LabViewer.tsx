// 검사결과 뷰어 — 앱 내 전체화면 오버레이로 열림
import { useState, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ReferenceArea, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LabRow {
  id: string;
  category: string;
  name: string;
  refRange: string;
  refMin?: number;
  refMax?: number;
  decimals?: number;
  values: (number | null)[];
  displayFn?: (v: number) => string;
  isHeader?: boolean;
  isCalc?: boolean;
  calcFormula?: string;
  defaultFav?: boolean;
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
const W_DATE = 86;
const W_STICKY = W_FAV + W_CAT + W_NAME + W_REF;

// ─── 그래프 색상 팔레트 ──────────────────────────────────────────────────────
const GCOLS = ["#453EDC","#FF7B2E","#2EA652","#FF4242","#9B59B6","#E67E22","#1ABC9C","#0066FF"];

// ─── 정성 결과 표시 함수 ─────────────────────────────────────────────────────
const uSemi = (v: number) => v===0?"Neg":v===0.5?"Trace":v===1?"+1":v===2?"+2":String(v);
const negPos = (v: number) => v >= 1 ? "Pos" : "Neg";
const nilm   = (v: number) => v >= 1 ? "ASCUS" : "NILM";

// ─── 더미 검사 데이터 ─────────────────────────────────────────────────────────
// d0=2022.06.08 … d11=2026.01.15 (총 12개 날짜)
const LAB: LabRow[] = [
  // 소변 ─────────────────────────────────────────────────────────────────────
  { id:"u0",  category:"소변", name:"요 일반검사 [화학반응·육안]", refRange:"—",
    values:[0,null,0,0,null,0,null,0,null,0,0,0], isHeader:true },
  { id:"u1",  category:"소변", name:"Protein", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,0,0,null,0.5,null,0,null,0,0,0], displayFn:uSemi },
  { id:"u2",  category:"소변", name:"Glucose", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,0,0,null,0,null,0,null,1,0,0], displayFn:uSemi },
  { id:"u3",  category:"소변", name:"Blood", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,1,0,null,0,null,0,null,0,0,0], displayFn:uSemi },
  { id:"u4",  category:"소변", name:"pH", refRange:"4.5~8.0",
    refMin:4.5, refMax:8.0, values:[7.2,null,6.5,7.0,null,6.0,null,6.5,null,7.0,6.5,7.0], decimals:1 },
  { id:"u5",  category:"소변", name:"비중 (Sp. Gr.)", refRange:"1.005~1.030",
    refMin:1.005, refMax:1.030, values:[1.020,null,1.018,1.022,null,1.010,null,1.015,null,1.012,1.018,1.020], decimals:3 },
  { id:"u6",  category:"소변", name:"WBC (현미경)", refRange:"0~5 /HPF",
    refMin:0, refMax:5, values:[2,null,3,2,null,6,null,3,null,2,3,2] },

  // 진단혈액 ──────────────────────────────────────────────────────────────────
  { id:"h1",  category:"진단혈액", name:"공복혈당", refRange:"70~99 mg/dL",
    refMin:70, refMax:99, values:[92,null,null,95,null,101,null,108,null,112,115,118], defaultFav:true },
  { id:"h2",  category:"진단혈액", name:"HbA1c", refRange:"<5.7%",
    refMin:0, refMax:5.6, values:[null,null,null,5.5,null,5.8,null,6.1,null,6.3,6.4,6.5], decimals:1, defaultFav:true },
  { id:"h3",  category:"진단혈액", name:"혈색소 (Hgb)", refRange:"12.0~16.0 g/dL",
    refMin:12, refMax:16, values:[13.5,null,null,13.2,null,12.8,null,12.5,null,12.2,12.0,11.8], decimals:1 },
  { id:"h4",  category:"진단혈액", name:"혈소판 (PLT)", refRange:"150~400 ×10³/μL",
    refMin:150, refMax:400, values:[280,null,null,265,null,258,null,245,null,240,235,230] },
  { id:"h5",  category:"진단혈액", name:"백혈구 (WBC)", refRange:"4.0~10.0 ×10³/μL",
    refMin:4.0, refMax:10.0, values:[6.2,null,null,6.5,null,7.2,null,6.8,null,7.5,7.2,8.1], decimals:1 },
  { id:"h6",  category:"진단혈액", name:"AST (SGOT)", refRange:"0~40 U/L",
    refMin:0, refMax:40, values:[28,null,null,32,null,42,null,38,null,45,41,48], defaultFav:true },
  { id:"h7",  category:"진단혈액", name:"ALT (SGPT)", refRange:"0~35 U/L",
    refMin:0, refMax:35, values:[22,null,null,25,null,38,null,42,null,48,45,52], defaultFav:true },
  { id:"h8",  category:"진단혈액", name:"γ-GTP", refRange:"8~35 U/L",
    refMin:8, refMax:35, values:[22,null,null,25,null,38,null,41,null,48,52,58] },
  { id:"h9",  category:"진단혈액", name:"혈청 크레아티닌", refRange:"0.5~1.1 mg/dL",
    refMin:0.5, refMax:1.1, values:[0.85,null,null,0.88,null,0.90,null,0.92,null,0.98,1.02,1.05], decimals:2 },
  { id:"h10", category:"진단혈액", name:"요산 (Uric acid)", refRange:"2.4~6.0 mg/dL",
    refMin:2.4, refMax:6.0, values:[4.2,null,null,4.5,null,4.8,null,5.1,null,5.5,5.8,6.2], decimals:1 },

  // 임상화학 ──────────────────────────────────────────────────────────────────
  { id:"c1",  category:"임상화학", name:"트리글리세라이드", refRange:"0~149 mg/dL",
    refMin:0, refMax:149, values:[142,null,null,168,null,182,null,195,null,188,201,195], defaultFav:true },
  { id:"c2",  category:"임상화학", name:"총콜레스테롤", refRange:"0~199 mg/dL",
    refMin:0, refMax:199, values:[195,null,null,202,null,208,null,215,null,218,212,220], defaultFav:true },
  { id:"c3",  category:"임상화학", name:"HDL콜레스테롤", refRange:">60 mg/dL",
    refMin:60, refMax:999, values:[58,null,null,55,null,52,null,51,null,50,48,47] },
  { id:"c4",  category:"임상화학", name:"LDL콜레스테롤", refRange:"0~129 mg/dL",
    refMin:0, refMax:129, values:[118,null,null,128,null,132,null,138,null,142,145,148] },
  { id:"c5",  category:"임상화학", name:"B형간염표면항원 (HBsAg)", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:negPos },
  { id:"c6",  category:"임상화학", name:"B형간염표면항체 (HBsAb)", refRange:"Pos",
    refMin:1, refMax:999, values:[1,null,null,null,null,1,null,null,null,1,null,1], displayFn:negPos },
  { id:"c7",  category:"임상화학", name:"AFP (혈청알파태아단백)", refRange:"0~7.0 ng/mL",
    refMin:0, refMax:7.0, values:[1.8,null,null,null,null,2.1,null,null,null,2.5,null,2.8], decimals:1 },
  { id:"c8",  category:"임상화학", name:"공복인슐린", refRange:"2.6~24.9 μIU/mL",
    refMin:2.6, refMax:24.9, values:[8.2,null,null,null,null,9.5,null,null,null,11.2,null,13.8], decimals:1 },
  { id:"c9",  category:"임상화학", name:"TSH (갑상선자극호르몬)", refRange:"0.27~4.20 μIU/mL",
    refMin:0.27, refMax:4.20, values:[1.82,null,null,null,null,2.10,null,null,null,2.35,null,2.61], decimals:2 },

  // 분변 ─────────────────────────────────────────────────────────────────────
  { id:"s1",  category:"분변", name:"분변잠혈검사 (FOBT)", refRange:"Neg",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:negPos },

  // 미생물 ───────────────────────────────────────────────────────────────────
  { id:"m1",  category:"미생물", name:"자궁경부세포검사 (Pap)", refRange:"NILM",
    refMin:0, refMax:0.4, values:[0,null,null,null,null,0,null,null,null,0,null,0], displayFn:nilm },
  { id:"m2",  category:"미생물", name:"HPV DNA 검사", refRange:"Neg",
    refMin:0, refMax:0.4, values:[null,null,null,null,null,0,null,null,null,0,null,null], displayFn:negPos },

  // 자동계산 ──────────────────────────────────────────────────────────────────
  { id:"calc1", category:"자동계산", name:"FIB-4 (간섬유화도)", refRange:"<1.30",
    refMin:0, refMax:1.30,
    values:[1.11,null,null,1.15,null,1.28,null,1.35,null,1.48,1.45,1.51],
    decimals:2, isCalc:true, calcFormula:"(나이 × AST) ÷ (PLT × √ALT)", defaultFav:true },
  { id:"calc2", category:"자동계산", name:"eGFR (CKD-EPI)", refRange:">60 mL/min",
    refMin:60, refMax:999,
    values:[78,null,null,76,null,74,null,72,null,68,65,62],
    isCalc:true, calcFormula:"크레아티닌·나이·성별 기반 신기능 추정 (CKD-EPI 공식)" },
  { id:"calc3", category:"자동계산", name:"ASCVD 10년 위험도 (%)", refRange:"<7.5%",
    refMin:0, refMax:7.5,
    values:[6.2,null,null,6.8,null,7.5,null,8.2,null,9.1,9.8,10.5],
    decimals:1, isCalc:true, calcFormula:"Pooled Cohort Eq. (TC·HDL·혈압·흡연·당뇨)", defaultFav:true },
  { id:"calc4", category:"자동계산", name:"HOMA-IR (인슐린 저항성)", refRange:"<2.5",
    refMin:0, refMax:2.5,
    values:[1.9,null,null,2.0,null,2.4,null,2.5,null,3.1,3.3,4.0],
    decimals:2, isCalc:true, calcFormula:"(공복혈당 × 공복인슐린) ÷ 405" },
];

// ─── 카테고리 칩 목록 ─────────────────────────────────────────────────────────
const ALL_CATS = [
  "기초검사","주사","예방주사","SONO","CT","X-ray","MAMMO","EKG","PFT","BMD","MRI",
  "진단혈액","임상화학","진단면역","외래목록","미생물","소변","조직","효소면역","분변",
  "핵의학","진단의학(기타)","내시경","조영","발달치료","언어치료","물리치료","운동치료",
  "통증치료","작업치료","도수치료","수술/처치","자동계산",
];
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
function vStatus(row: LabRow, val: number | null): VStatus {
  if (val === null) return "empty";
  if (row.refMin === undefined || row.refMax === undefined) return "normal";
  if (val > row.refMax) return "high";
  if (val < row.refMin) return "low";
  return "normal";
}

function dispVal(row: LabRow, val: number | null): string {
  if (val === null) return "—";
  if (row.displayFn) return row.displayFn(val);
  if (row.decimals !== undefined) return val.toFixed(row.decimals);
  if (Number.isInteger(val)) return String(val);
  const s = val.toString();
  return s;
}

function vColor(s: VStatus): string {
  if (s === "high") return "#FF4242";
  if (s === "low")  return "#0066FF";
  return "#46474C";
}
function vArrow(s: VStatus): string {
  if (s === "high") return "↑ ";
  if (s === "low")  return "↓ ";
  return "";
}
function hasAbnormal(row: LabRow, idxs: Set<number>): boolean {
  return row.values.some((v, i) => idxs.has(i) && (vStatus(row, v) === "high" || vStatus(row, v) === "low"));
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
  const [showGraph, setShowGraph] = useState(false);
  const [search,    setSearch]    = useState("");
  const [graphRows, setGraphRows] = useState<Set<string>>(new Set(["h1","h6","c2","calc3"]));
  const [presetOpen, setPresetOpen] = useState(false);
  const [miniOpen,   setMiniOpen]   = useState(false);
  const [tooltip, setTooltip] = useState<{row:LabRow; di:number; x:number; y:number} | null>(null);
  const presetRef = useRef<HTMLDivElement>(null);
  const tableRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!presetOpen) return;
    const h = (e: MouseEvent) => { if (!presetRef.current?.contains(e.target as Node)) setPresetOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [presetOpen]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const visibleDates    = DATES.filter(d => selDates.has(d));
  const visibleDateIdxs = useMemo(() => new Set(DATES.map((d, i) => selDates.has(d) ? i : -1).filter(i => i >= 0)), [selDates]);

  const filteredRows = useMemo(() => {
    return LAB.filter(row => {
      if (!selCats.has(row.category)) return false;
      if (search && !row.isHeader && !row.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (favOnly && !row.isHeader && !favs.has(row.id)) return false;
      if (abnOnly && !row.isHeader && !hasAbnormal(row, visibleDateIdxs)) return false;
      return true;
    });
  }, [selCats, search, favOnly, favs, abnOnly, visibleDateIdxs]);

  const graphData = useMemo(() => {
    return visibleDates.map(date => {
      const di = DATES.indexOf(date);
      const pt: Record<string, number | string | null> = { date: date.slice(5) };
      graphRows.forEach(id => { const r = LAB.find(x => x.id === id); if (r) pt[id] = r.values[di]; });
      return pt;
    });
  }, [visibleDates, graphRows]);

  const graphRowList = LAB.filter(r => graphRows.has(r.id));

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleCat  = (c: string) => setSelCats(p  => { const n = new Set(p);  n.has(c)  ? n.delete(c)  : n.add(c);  return n; });
  const toggleDate = (d: string) => setSelDates(p => { const n = new Set(p);  if (n.has(d) && n.size > 1) n.delete(d); else n.add(d); return n; });
  const toggleFav  = (id: string) => setFavs(p   => { const n = new Set(p);  n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleGRow = (id: string) => { if (!showGraph) return; setGraphRows(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const applyDatePreset = (cnt: number) => setSelDates(new Set(cnt >= DATES.length ? DATES : DATES.slice(-cnt)));
  const applyRowPreset  = (ids: string[]) => { setGraphRows(new Set(ids)); setShowGraph(true); setPresetOpen(false); };

  // ── Group rows ─────────────────────────────────────────────────────────────
  let prevCat = "";
  const rows = filteredRows.map(row => {
    const firstInGroup = row.category !== prevCat;
    prevCat = row.category;
    return { ...row, firstInGroup };
  });

  // ── Sticky cell shared styles ──────────────────────────────────────────────
  const stickyTd = (left: number, bg: string, border: boolean): CSSProperties => ({
    position: "sticky", left, zIndex: 10, backgroundColor: bg,
    borderRight: border ? "2px solid #C2C4C8" : "1px solid #DBDCDF",
    verticalAlign: "middle",
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* ① 환자 정보 바 (40px, 다크) */}
      <div className="flex items-center px-4 gap-2 flex-shrink-0" style={{ height: 40, backgroundColor: "#171719" }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-white font-bold" style={{ fontSize: 13 }}>김지영</span>
          <span className="text-[#5A5A5F] text-[11px]">|</span>
          <span className="text-[#BABBBE] text-[11px]">차트번호 100236</span>
          <span className="text-[#5A5A5F] text-[11px]">|</span>
          <span className="text-[#BABBBE] text-[11px]">1974.03.12</span>
          <span className="text-[#5A5A5F] text-[11px]">|</span>
          <span className="text-[#BABBBE] text-[11px]">52세</span>
          <span className="text-[#5A5A5F] text-[11px]">|</span>
          <span className="text-[#BABBBE] text-[11px]">여</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["PACS 연동","알림톡 발송","인쇄","Excel 내보내기"].map(lbl => (
            <button key={lbl} className="h-7 px-2.5 rounded text-[10px] text-[#BABBBE] border border-[#3A3A3D] hover:border-[#666] hover:text-white transition-colors whitespace-nowrap">
              {lbl}
            </button>
          ))}
          <button onClick={() => onClose?.()}
            className="h-7 px-2.5 rounded text-[10px] text-white bg-[#3A3A3D] hover:bg-[#555] ml-1 whitespace-nowrap">
            ✕ 닫기
          </button>
        </div>
      </div>

      {/* ② 오더분류 칩 바 */}
      <div className="flex-shrink-0 border-b border-[#DBDCDF]" style={{ backgroundColor: "#F7F7F8", padding: "8px 16px" }}>
        <div className="flex flex-wrap gap-1 items-center">
          {ALL_CATS.map(cat => {
            const hasData = DATA_CATS.has(cat);
            const isSel   = selCats.has(cat);
            return (
              <button key={cat} onClick={() => hasData && toggleCat(cat)} disabled={!hasData}
                className={`flex items-center gap-0.5 text-[11px] rounded border whitespace-nowrap transition-colors ${
                  isSel && hasData
                    ? "bg-[#453EDC] text-white border-[#453EDC]"
                    : hasData
                      ? "bg-white text-[#46474C] border-[#DBDCDF] hover:border-[#453EDC] hover:text-[#453EDC]"
                      : "bg-white text-[#C2C4C8] border-[#DBDCDF] cursor-not-allowed"
                }`} style={{ padding: "4px 10px" }}>
                {isSel && hasData && <span className="text-[10px] mr-0.5">✓</span>}
                {cat}
              </button>
            );
          })}
          <div className="flex items-center gap-3 ml-auto pl-3 flex-shrink-0">
            <button onClick={() => setSelCats(new Set(DATA_CATS))} className="text-[11px] text-[#453EDC] hover:underline whitespace-nowrap">전체선택</button>
            <button onClick={() => setSelCats(new Set())}          className="text-[11px] text-[#989BA2] hover:underline whitespace-nowrap">선택해제</button>
          </div>
        </div>
      </div>

      {/* ③ 툴바 (36px) */}
      <div className="flex items-center px-4 gap-2 flex-shrink-0 border-b border-[#DBDCDF]"
        style={{ height: 36, backgroundColor: "#FAFAFA" }}>
        {/* 좌측 토글 */}
        {[
          { label:"이상치만 보기",  active:abnOnly,   fn:()=>setAbnOnly(v=>!v),   activeCls:"bg-[#FFF1E0] text-[#FF7B2E] border-[#FF7B2E]" },
          { label:"즐겨찾기만 보기",active:favOnly,   fn:()=>setFavOnly(v=>!v),   activeCls:"bg-[#FFF8E1] text-[#E08A00] border-[#E08A00]" },
          { label:"그래프 보기",    active:showGraph,  fn:()=>setShowGraph(v=>!v), activeCls:"bg-[#EEF4FF] text-[#0066FF] border-[#0066FF]" },
        ].map(({ label, active, fn, activeCls }) => (
          <button key={label} onClick={fn}
            className={`h-6 px-3 text-[11px] rounded border transition-colors whitespace-nowrap ${
              active ? activeCls : "bg-white text-[#46474C] border-[#DBDCDF] hover:border-[#989BA2]"
            }`}>
            {label}
          </button>
        ))}
        <div className="flex-1" />
        {/* 우측 */}
        <div className="flex items-center gap-2" ref={presetRef}>
          <div className="relative">
            <button onClick={() => setPresetOpen(v => !v)}
              className="h-6 px-3 text-[11px] bg-white border border-[#DBDCDF] rounded text-[#46474C] hover:border-[#989BA2] whitespace-nowrap">
              모아보기 세트 ▾
            </button>
            {presetOpen && (
              <div className="absolute top-7 right-0 bg-white border border-[#DBDCDF] rounded-lg shadow-xl w-44 z-50 py-1 overflow-hidden">
                {PRESETS.map(ps => (
                  <button key={ps.name} onClick={() => applyRowPreset(ps.rows)}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-[#292A2D] hover:bg-[#F7F7F8]">
                    {ps.name}
                  </button>
                ))}
                <div className="border-t border-[#DBDCDF] mt-1">
                  <button className="w-full text-left px-3 py-1.5 text-[11px] text-[#453EDC] hover:bg-[#F7F7F8]">
                    + 세트 저장...
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#DBDCDF] rounded px-2 h-6 w-40">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.5"/>
              <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검사명 검색..."
              className="text-[11px] flex-1 outline-none placeholder:text-[#BABBBE] bg-transparent" />
          </div>
        </div>
      </div>

      {/* ④ 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측 날짜 네비 (88px) */}
        <div className="flex flex-col flex-shrink-0 border-r border-[#DBDCDF] overflow-hidden"
          style={{ width: 88, backgroundColor: "#F7F7F8" }}>
          <div className="px-2 pt-2 pb-1 flex-shrink-0">
            <span className="text-[10px] text-[#989BA2]">내원일</span>
          </div>
          {/* 프리셋 버튼 */}
          <div className="grid grid-cols-2 gap-0.5 px-1.5 pb-1.5 flex-shrink-0">
            {[
              { label:"최근 3건", n:3 },{ label:"최근 6건", n:6 },
              { label:"최근 1년", n:12 },{ label:"전체", n:99 },
            ].map(({ label, n }) => (
              <button key={label} onClick={() => applyDatePreset(n)}
                className="text-[9px] text-[#46474C] bg-white border border-[#DBDCDF] rounded py-0.5 hover:border-[#453EDC] hover:text-[#453EDC] transition-colors">
                {label}
              </button>
            ))}
          </div>
          {/* 날짜 리스트 (역순, 최신이 위) */}
          <div className="flex-1 overflow-y-auto">
            {[...DATES].reverse().map(date => {
              const active = selDates.has(date);
              return (
                <div key={date} onClick={() => toggleDate(date)}
                  className="flex items-center cursor-pointer hover:bg-white transition-colors"
                  style={{ height: 32, borderLeft: active ? "3px solid #453EDC" : "3px solid transparent", backgroundColor: active ? "white" : "transparent", paddingLeft: 6 }}>
                  <span className={`text-[10px] leading-none ${active ? "text-[#292A2D] font-bold" : "text-[#989BA2]"}`}>
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
            <table style={{ borderCollapse:"collapse", minWidth: W_STICKY + visibleDates.length * W_DATE }} className="text-[11px]">
              {/* 고정 헤더 */}
              <thead>
                <tr style={{ backgroundColor: "#F7F7F8" }}>
                  <th style={{ position:"sticky", top:0, left:0, zIndex:30, width:W_FAV, minWidth:W_FAV, backgroundColor:"#F7F7F8", borderBottom:"2px solid #C2C4C8", borderRight:"1px solid #DBDCDF", height:32, textAlign:"center", fontSize:10, fontWeight:600, color:"#989BA2" }}>★</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV, zIndex:30, width:W_CAT, minWidth:W_CAT, backgroundColor:"#F7F7F8", borderBottom:"2px solid #C2C4C8", borderRight:"1px solid #DBDCDF", textAlign:"left", padding:"0 8px", fontSize:10, fontWeight:600, color:"#989BA2" }}>검사종류</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV+W_CAT, zIndex:30, width:W_NAME, minWidth:W_NAME, backgroundColor:"#F7F7F8", borderBottom:"2px solid #C2C4C8", borderRight:"1px solid #DBDCDF", textAlign:"left", padding:"0 8px", fontSize:10, fontWeight:600, color:"#989BA2" }}>검사명</th>
                  <th style={{ position:"sticky", top:0, left:W_FAV+W_CAT+W_NAME, zIndex:30, width:W_REF, minWidth:W_REF, backgroundColor:"#F7F7F8", borderBottom:"2px solid #C2C4C8", borderRight:"2px solid #C2C4C8", textAlign:"center", padding:"0 6px", fontSize:10, fontWeight:600, color:"#989BA2" }}>참조치</th>
                  {visibleDates.map(date => (
                    <th key={date} style={{ position:"sticky", top:0, zIndex:20, width:W_DATE, minWidth:W_DATE, backgroundColor:"#F7F7F8", borderBottom:"2px solid #C2C4C8", borderRight:"1px solid #E8E8EA", textAlign:"center", fontSize:10, fontWeight:600, color:"#292A2D", whiteSpace:"nowrap", padding:"0 4px" }}>
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
                  const rowBg    = row.isHeader ? "#F9F9FB"
                                 : isFav        ? "#FFFBEB"
                                 : isGRow       ? "#EEF4FF"
                                 : "white";
                  const botBd    = isLast ? "2px solid #C2C4C8" : "1px solid #F0F0F2";

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
                            className={`text-[12px] leading-none transition-all ${isFav ? "text-[#E08A00]" : "text-[#C2C4C8] hover:text-[#E08A00]"}`}>
                            {isFav ? "★" : "☆"}
                          </button>
                        )}
                      </td>

                      {/* 검사종류 */}
                      <td style={{ ...stickyTd(W_FAV, rowBg, false), width:W_CAT, borderBottom: botBd, padding:"0 6px 0 8px", fontSize:10, color:"#70737C", overflow:"hidden", whiteSpace:"nowrap" }}
                        className="group-hover:brightness-[0.97]">
                        {row.firstInGroup ? row.category : ""}
                      </td>

                      {/* 검사명 */}
                      <td style={{ ...stickyTd(W_FAV+W_CAT, rowBg, false), width:W_NAME, borderBottom: botBd, padding:"0 8px", overflow:"hidden", whiteSpace:"nowrap" }}
                        className="group-hover:brightness-[0.97]">
                        <div className="flex items-center gap-1">
                          {row.isCalc && (
                            <span title={`계산식: ${row.calcFormula}`} className="cursor-help text-[10px] flex-shrink-0">🤖</span>
                          )}
                          {isGRow && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GCOLS[Array.from(graphRows).indexOf(row.id) % GCOLS.length] }} />
                          )}
                          <span className={`text-[11px] truncate ${row.isHeader ? "font-semibold text-[#292A2D]" : "text-[#292A2D]"}`}>
                            {row.name}
                          </span>
                        </div>
                      </td>

                      {/* 참조치 */}
                      <td style={{ ...stickyTd(W_FAV+W_CAT+W_NAME, rowBg, true), width:W_REF, borderBottom: botBd, padding:"0 6px", textAlign:"center", fontSize:10, color:"#989BA2", whiteSpace:"nowrap", overflow:"hidden" }}
                        className="group-hover:brightness-[0.97]">
                        {row.refRange}
                      </td>

                      {/* 날짜별 데이터 셀 */}
                      {visibleDates.map(date => {
                        const di  = DATES.indexOf(date);
                        const val = row.values[di];
                        const st  = row.isHeader ? "empty" : vStatus(row, val);
                        const dv  = row.isHeader
                          ? (val !== null ? "O" : "—")
                          : dispVal(row, val);
                        const col = row.isHeader
                          ? (val !== null ? "#2EA652" : "#BABBBE")
                          : vColor(st);
                        return (
                          <td key={date}
                            onMouseEnter={e => {
                              if (!row.isHeader && val !== null) {
                                const r = e.currentTarget.getBoundingClientRect();
                                setTooltip({ row, di, x: r.left + r.width / 2, y: r.bottom + 6 });
                              }
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            style={{
                              width: W_DATE, textAlign:"center", padding:"0 4px",
                              verticalAlign:"middle", fontSize:11,
                              borderBottom: botBd, borderRight:"1px solid #F0F0F2",
                              color: col,
                              cursor: val !== null && !row.isHeader ? "help" : "default",
                              fontWeight: (st === "high" || st === "low") ? 600 : 400,
                            }}>
                            {vArrow(st)}{dv}
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
            <div className="flex flex-col border-l border-[#DBDCDF] overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
              {/* 그래프 헤더 */}
              <div className="flex items-center gap-2 px-3 border-b border-[#DBDCDF] flex-shrink-0 flex-wrap"
                style={{ minHeight: 36, backgroundColor: "#F7F7F8", padding: "6px 12px" }}>
                <span className="text-[11px] font-medium text-[#292A2D]">시계열 그래프</span>
                <span className="text-[10px] text-[#989BA2]">행 클릭으로 추가/제거</span>
                {graphRowList.map((r, ci) => (
                  <span key={r.id} onClick={() => toggleGRow(r.id)}
                    className="flex items-center gap-1 text-[10px] rounded cursor-pointer px-1.5 py-0.5 border"
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
                  ? <div className="h-full flex items-center justify-center text-[12px] text-[#989BA2]">
                      테이블에서 검사 항목을 클릭하면 그래프가 표시됩니다
                    </div>
                  : <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData} margin={{ top:8, right:20, bottom:8, left:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" />
                        <XAxis dataKey="date" tick={{ fontSize:9, fill:"#989BA2" }} />
                        <YAxis tick={{ fontSize:9, fill:"#989BA2" }} width={38} />
                        <ChartTooltip
                          contentStyle={{ fontSize:11, border:"1px solid #DBDCDF", borderRadius:6, padding:"6px 10px" }}
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

      {/* ⑤ 셀 호버 툴팁 */}
      {tooltip && (
        <div style={{ position:"fixed", left: tooltip.x, top: tooltip.y, transform:"translateX(-50%)", zIndex:9999, pointerEvents:"none" }}
          className="bg-[#1E1F22] text-white rounded-lg shadow-2xl px-3 py-2">
          <div className="text-[11px] font-medium mb-1 text-white">{tooltip.row.name}</div>
          <div className="text-[10px] text-[#BABBBE] space-y-0.5">
            <div>날짜: {DATES[tooltip.di]}</div>
            <div>참조치: {tooltip.row.refRange}</div>
            {(() => {
              const val = tooltip.row.values[tooltip.di];
              const st  = vStatus(tooltip.row, val);
              if (st !== "empty" && st !== "normal")
                return <div style={{ color: st === "high" ? "#FF8080" : "#80AAFF" }}>
                  {st === "high" ? "참조치 초과" : "참조치 미만"}
                </div>;
            })()}
            {tooltip.row.isCalc && (
              <div className="text-[#9B8AFF] mt-1 border-t border-[#3A3A3D] pt-1">
                계산식: {tooltip.row.calcFormula}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⑥ 플로팅 미니 차트 (우측 하단) */}
      <div className="fixed bottom-4 right-4 z-[9990]" style={{ width: miniOpen ? 340 : "auto" }}>
        {miniOpen && (
          <div className="bg-white rounded-xl shadow-2xl border border-[#DBDCDF] overflow-hidden mb-2"
            style={{ width: 340, maxHeight: 420 }}>
            {/* 헤더 */}
            <div className="flex items-center px-3 border-b border-[#DBDCDF]" style={{ height: 36, backgroundColor:"#F7F7F8" }}>
              <span className="text-[11px] font-semibold text-[#292A2D] flex-1">오늘 차트 — 김지영</span>
              <span className="text-[10px] text-[#989BA2]">2026.03.17</span>
              <button onClick={() => setMiniOpen(false)} className="ml-2 text-[#989BA2] hover:text-[#292A2D] text-[13px]">✕</button>
            </div>
            {/* 진단 */}
            <div className="px-3 py-2 border-b border-[#F0F0F2]">
              <p className="text-[10px] text-[#989BA2] mb-1">진단</p>
              {[
                { code:"J00",   name:"급성비인두염[코감기]" },
                { code:"I10",   name:"본태성(원발성) 고혈압" },
                { code:"E11.9", name:"제2형 당뇨병, 합병증 없음" },
              ].map(d => (
                <div key={d.code} className="flex items-center gap-2 py-0.5">
                  <span className="text-[9px] text-[#989BA2] w-12 flex-shrink-0">{d.code}</span>
                  <span className="text-[10px] text-[#292A2D] truncate">{d.name}</span>
                </div>
              ))}
            </div>
            {/* 처방 */}
            <div className="px-3 py-2 border-b border-[#F0F0F2] max-h-48 overflow-y-auto">
              <p className="text-[10px] text-[#989BA2] mb-1">오늘 처방</p>
              {MINI_RX.map(rx => (
                <div key={rx.name} className="flex items-center gap-2 py-0.5">
                  <span className="text-[10px] text-[#292A2D] flex-1 truncate">{rx.name}</span>
                  <span className="text-[9px] text-[#989BA2] flex-shrink-0">1일 {rx.freq}회</span>
                </div>
              ))}
            </div>
            {/* 처방 추가 버튼 */}
            <div className="px-3 py-2 bg-[#F7F7F8]">
              <button
                onClick={() => { alert("메인 창 차트에 처방이 추가되었습니다.\n(실제 구현 시 postMessage로 메인 창과 통신)"); }}
                className="w-full h-7 text-[11px] rounded text-white transition-colors"
                style={{ backgroundColor: "#453EDC" }}>
                + 처방 추가 (메인 창으로 전송)
              </button>
            </div>
          </div>
        )}
        {/* 토글 버튼 */}
        <button onClick={() => setMiniOpen(v => !v)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl shadow-xl text-white text-[11px] font-medium transition-all"
          style={{ backgroundColor: miniOpen ? "#292A2D" : "#453EDC" }}>
          {miniOpen ? "▼ 오늘 차트 접기" : "▲ 오늘 차트 보기"}
        </button>
      </div>
    </div>
  );
}