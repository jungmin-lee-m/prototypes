import { useState, useRef, useEffect, useCallback } from "react";
import type { HistoryDx, HistoryRx } from "./chartTypes";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PrescType = "주" | "물" | "방" | "검";

export interface VisitRecord {
  id: string;
  date: string;
  time?: string;
  visitType: "재진" | "초진";
  insType: string;
  tags: string[];
  prescTypes: PrescType[];
  amount?: string;
  symptom: string;
  diagnoses: { code: string; name: string }[];
  prescriptions: { name: string; dose: string; freq: string; days: number; price: number; method?: string }[];
  note?: string;
  special?: string;
  imageCount?: number;
}

// ── Lab results lookup ────────────────────────────────────────────────────────
type LabResult = { value: string; unit: string; range: string; status: "N" | "H" | "L" };
const LAB_BY_PRESC: Record<string, Record<string, LabResult>> = {
  "26-03-12": {
    "전혈구검사(CBC)": { value: "정상", unit: "", range: "-", status: "N" },
    "CRP":            { value: "3.2",  unit: "mg/L", range: "0.0~5.0", status: "N" },
    "흉부 X-ray":     { value: "정상", unit: "", range: "-", status: "N" },
  },
  "25-09-20": {
    "페니실린 IgE":     { value: "2.8",  unit: "kU/L", range: "<0.35", status: "H" },
    "조영제 IgE":       { value: "1.4",  unit: "kU/L", range: "<0.35", status: "H" },
    "집먼지진드기 IgE": { value: "12.4", unit: "kU/L", range: "<0.35", status: "H" },
    "꽃가루 IgE":       { value: "0.18", unit: "kU/L", range: "<0.35", status: "N" },
  },
  "25-01-15": {
    "HbA1c":       { value: "7.2",  unit: "%",      range: "4.0~6.0", status: "H" },
    "LDL 콜레스테롤": { value: "145", unit: "mg/dL", range: "<130",   status: "H" },
    "eGFR":        { value: "68",   unit: "mL/min", range: ">90",     status: "L" },
    "공복혈당":     { value: "128",  unit: "mg/dL",  range: "70~99",   status: "H" },
    "총콜레스테롤": { value: "218",  unit: "mg/dL",  range: "<200",    status: "H" },
    "요침사검사":   { value: "0~3",  unit: "HPF",    range: "0~3 HPF", status: "N" },
    "심전도검사":   { value: "정상", unit: "",        range: "-",       status: "N" },
  },
};

const DX_SPECIAL: Record<string, Record<string, string>> = {
  "26-02-14": { "I10": "V193", "E11.9": "U002" },
  "26-02-28": { "I10": "V193" },
  "25-11-01": { "I10": "V193" },
  "25-01-15": { "E11.9": "U002" },
  "25-06-20": { "E78.5": "U157" },
};

const visitImageLabels: Record<string, string[]> = {
  "26-03-12": ["흉부 X-ray", "인후 내시경", "편도 촬영"],
  "25-11-01": ["하지 부종", "혈압 모니터"],
  "25-09-20": ["피부반응 검사"],
  "25-07-31": ["흉부 X-ray", "인후 내시경", "편도 촬영", "비강 내시경"],
};

// ── Prescription type chips ───────────────────────────────────────────────────
interface PrescTagCfg { name: string; bg: string; text: string; activeBg: string; activeText: string }
const PRESC_TAGS: PrescTagCfg[] = [
  { name: "주사",     bg: "#FEECEC", text: "#FF4242", activeBg: "#FF4242", activeText: "#fff" },
  { name: "물리치료", bg: "#F1EDFF", text: "#6541F2", activeBg: "#6541F2", activeText: "#fff" },
  { name: "방사선",   bg: "#FFF1E0", text: "#FF7B2E", activeBg: "#FF7B2E", activeText: "#fff" },
  { name: "초음파",   bg: "#EAF2FE", text: "#0066FF", activeBg: "#0066FF", activeText: "#fff" },
  { name: "혈액검사", bg: "#EDF8EF", text: "#4EAD0A", activeBg: "#4EAD0A", activeText: "#fff" },
  { name: "소변검사", bg: "#F6FADF", text: "#7CB342", activeBg: "#7CB342", activeText: "#fff" },
  { name: "심전도",   bg: "#E8F5E9", text: "#2E7D32", activeBg: "#2E7D32", activeText: "#fff" },
  { name: "내시경",   bg: "#E0F7FA", text: "#00838F", activeBg: "#00838F", activeText: "#fff" },
  { name: "처치",     bg: "#FCE4EC", text: "#C2185B", activeBg: "#C2185B", activeText: "#fff" },
  { name: "투약",     bg: "#FFF8E1", text: "#F57C00", activeBg: "#F57C00", activeText: "#fff" },
];

const prescTagMatches = (v: VisitRecord, tag: string): boolean => {
  switch (tag) {
    case "주사":     return v.prescTypes.includes("주");
    case "물리치료": return v.prescTypes.includes("물");
    case "방사선":   return v.prescTypes.includes("방");
    case "혈액검사":
    case "소변검사":
    case "심전도":
    case "내시경":
    case "초음파":   return v.prescTypes.includes("검");
    case "투약":     return v.prescriptions.some(p => p.method !== "-");
    case "처치":     return v.tags.includes("처치");
    default:         return false;
  }
};

// ── 다빈도 상병 options ───────────────────────────────────────────────────────
const DX_OPTIONS = [
  { code: "I10",   name: "본태성(원발성) 고혈압", count: 8 },
  { code: "E11.9", name: "제2형 당뇨병",          count: 6 },
  { code: "J00",   name: "급성비인두염",           count: 5 },
  { code: "R51",   name: "상세불명의 두통",         count: 4 },
  { code: "J20.9", name: "급성 기관지염",           count: 3 },
  { code: "E78.5", name: "고지혈증",               count: 3 },
  { code: "J30.9", name: "알레르기성 비염",         count: 2 },
  { code: "K21.0", name: "역류성 식도염",           count: 2 },
];

const PT_BADGE: Record<PrescType, { label: string; cls: string }> = {
  주: { label: "주사",     cls: "bg-[#FEECEC] text-[#FF4242]" },
  물: { label: "물리치료", cls: "bg-[#F1EDFF] text-[#6541F2]" },
  방: { label: "방사선",   cls: "bg-[#FFF1E0] text-[#FF7B2E]" },
  검: { label: "검사",     cls: "bg-[#EDF8EF] text-[#4EAD0A]" },
};

const TODAY_DX = [
  { code: "J00",   name: "급성비인두염[코감기]",     isMain: true },
  { code: "J20.9", name: "상세불명의 급성 기관지염" },
  { code: "I10",   name: "본태성(원발성) 고혈압" },
  { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
];
const TODAY_RX = [
  { name: "트라젠타정 5mg",               days: 20, method: "경구" },
  { name: "가브스메트정 50/850mg",         days: 28, method: "경구" },
  { name: "텔미사르탄·암로디핀베실산염복합", days: 14, method: "경구" },
  { name: "클로르페니라민말레산염",         days: 5,  method: "경구" },
  { name: "비라토비캡슐 75mg",             days: 7,  method: "경구" },
];

const sColor = (s: "N" | "H" | "L") =>
  s === "H" ? "text-[#E03333]" : s === "L" ? "text-[#1D7CF2]" : "text-[#292A2D]";
const sArrow = (s: "N" | "H" | "L") =>
  s === "H" ? " ↑" : s === "L" ? " ↓" : "";

const PRESC_COLS = "1fr 20px 18px 20px 28px 44px 52px";
const DX_COLS    = "18px 60px 1fr 52px";

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, active, onClick, activeCls = "bg-[#453EDC] text-white border-[#453EDC]", inactiveCls = "bg-white text-[#70737C] border-[#DBDCDF]" }: {
  label: string; active: boolean; onClick: () => void; activeCls?: string; inactiveCls?: string;
}) {
  return (
    <button onClick={onClick}
      className={`text-[11px] rounded-[5px] border px-[8px] py-[2px] whitespace-nowrap transition-colors ${active ? activeCls : inactiveCls}`}>
      {label}
    </button>
  );
}

// ── MiniChart ─────────────────────────────────────────────────────────────────
function MiniChart({ minimized, onToggle }: { minimized: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden border-l border-[#DBDCDF] bg-[#FAFBFF] flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#DBDCDF] bg-[#F4F4F8] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px]">🗒</span>
          <span className="text-[11px] font-bold text-[#292A2D]">오늘 차트</span>
          <span className="text-[10px] text-[#989BA2]">2026-03-17</span>
        </div>
        <button onClick={onToggle} className="text-[10px] text-[#70737C] border border-[#DBDCDF] rounded-[4px] px-1.5 py-0.5 bg-white">
          {minimized ? "▲ 확장" : "▼ 최소화"}
        </button>
      </div>
      {!minimized && (
        <div className="flex flex-col overflow-y-auto flex-1">
          <div className="border-b border-[#DBDCDF]">
            <div className="flex items-center justify-between px-3 py-1 bg-[#F9F9FC]">
              <span className="text-[10px] font-medium text-[#989BA2]">진단</span>
            </div>
            {TODAY_DX.map(d => (
              <div key={d.code} className="flex items-center gap-2 px-3 py-1 border-b border-[#F5F5F5] last:border-b-0">
                {d.isMain && <span className="text-[8px] bg-[#FF7B2E] text-white rounded-[2px] px-0.5 flex-shrink-0">주</span>}
                <span className="text-[10px] font-medium text-[#453EDC] flex-shrink-0">{d.code}</span>
                <span className="text-[10px] text-[#292A2D] truncate flex-1">{d.name}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between px-3 py-1 bg-[#F9F9FC]">
              <span className="text-[10px] font-medium text-[#989BA2]">처방</span>
            </div>
            {TODAY_RX.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1 border-b border-[#F5F5F5] last:border-b-0">
                <span className="text-[10px] text-[#292A2D] flex-1 truncate">{p.name}</span>
                <span className="text-[9px] text-[#989BA2] flex-shrink-0 ml-2">{p.days}일 · {p.method}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  filteredVisits: VisitRecord[];
  activeDate: string;
  setActiveDate: (id: string) => void;
  starredDates: Set<string>;
  onToggleStar: (id: string) => void;
  filterFavorite: boolean;
  setFilterFavorite: (v: boolean) => void;
  filterPrescTypes: Set<PrescType>;
  togglePrescType: (t: PrescType) => void;
  filterDiagnoses: Set<string>;
  applyDiagnoses: (s: Set<string>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onClose: () => void;
  onRepeatDx: (items: HistoryDx[]) => void;
  onRepeatRx: (items: HistoryRx[]) => void;
  onRepeatAll: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function EMRExpandedHistory({
  filteredVisits, activeDate, setActiveDate,
  starredDates, onToggleStar, filterFavorite, setFilterFavorite,
  filterPrescTypes, togglePrescType, filterDiagnoses, applyDiagnoses,
  resetFilters, hasActiveFilters, onClose,
  onRepeatDx, onRepeatRx, onRepeatAll,
}: Props) {
  const [show,         setShow]         = useState(false);
  const [miniMin,      setMiniMin]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterTags,    setFilterTags]    = useState<Set<string>>(new Set());
  const [filterVisType, setFilterVisType] = useState<"전체" | "초진" | "재진">("전체");
  const [filterClaim,   setFilterClaim]   = useState<"전체" | "청구" | "비청구">("전체");
  const [filterIns,     setFilterIns]     = useState<Set<string>>(new Set());

  const gridRef  = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { const t = setTimeout(() => setShow(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => {
    dateRefs.current[activeDate]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeDate]);

  const toggleDx = (code: string) => {
    const n = new Set(filterDiagnoses);
    n.has(code) ? n.delete(code) : n.add(code);
    applyDiagnoses(n);
  };

  const toggleIns = (val: string) => {
    if (val === "전체") { setFilterIns(new Set()); return; }
    setFilterIns(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });
  };

  const localFiltered = filteredVisits.filter(v => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!v.symptom.toLowerCase().includes(q) &&
          !v.diagnoses.some(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) &&
          !v.prescriptions.some(p => p.name.toLowerCase().includes(q))) return false;
    }
    if (filterVisType !== "전체" && v.visitType !== filterVisType) return false;
    if (filterIns.size > 0 && !filterIns.has(v.insType)) return false;
    if (filterTags.size > 0 && ![...filterTags].some(t => prescTagMatches(v, t))) return false;
    return true;
  });

  const handleDateClick = (id: string) => {
    setActiveDate(id);
    const el = cardRefs.current[id];
    if (el && gridRef.current) gridRef.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
  };

  const handleGridScroll = useCallback(() => {
    if (!gridRef.current) return;
    const containerTop = gridRef.current.getBoundingClientRect().top;
    let bestId = localFiltered[0]?.id ?? "";
    let bestDist = Infinity;
    for (const v of localFiltered) {
      const el = cardRefs.current[v.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < containerTop) continue;
        const dist = Math.abs(rect.top - containerTop - 60);
        if (dist < bestDist) { bestDist = dist; bestId = v.id; }
      }
    }
    if (bestId !== activeDate) setActiveDate(bestId);
  }, [localFiltered, activeDate, setActiveDate]);

  const allFiltersActive = hasActiveFilters || filterTags.size > 0 || filterVisType !== "전체" || filterClaim !== "전체" || filterIns.size > 0;
  const clearAll = () => { resetFilters(); setFilterTags(new Set()); setFilterVisType("전체"); setFilterClaim("전체"); setFilterIns(new Set()); setSearch(""); };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col bg-white overflow-hidden transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0"}`}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#DBDCDF] flex-shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
          </svg>
          <span className="text-[13px] font-bold text-[#292A2D]">내원이력 펼쳐보기</span>
          <span className="text-[11px] text-[#989BA2]">황미진 · {localFiltered.length}건 표시 중</span>
          {allFiltersActive && (
            <span className="text-[10px] bg-[#ECEEFF] text-[#453EDC] border border-[#453EDC]/30 rounded-full px-2 py-0.5">필터 적용 중</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onClose} className="flex items-center gap-1 text-[11px] text-[#46474C] border border-[#DBDCDF] rounded-[6px] px-2.5 h-7 bg-white hover:bg-[#F7F7F8]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="#46474C" strokeWidth="1.3"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="#46474C" strokeWidth="1.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="#46474C" strokeWidth="1.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="#46474C" strokeWidth="1.3"/>
            </svg>
            축소
          </button>
          
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ══ Left Sidebar ══ */}
        <div className="w-[200px] flex-shrink-0 border-r border-[#DBDCDF] flex flex-col bg-[#F9F9FC] overflow-hidden">

          {/* Filters — scrollable, max 58% */}
          <div className="overflow-y-auto flex-shrink-0" style={{ maxHeight: "58%" }}>
            <div className="px-2.5 pt-2 pb-1 flex flex-col gap-1.5">

              {/* Search */}
              <div className="flex items-center gap-1 bg-white border border-[#DBDCDF] rounded-[6px] px-2 h-7">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
                  <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input className="flex-1 bg-transparent text-[11px] outline-none placeholder-[#989BA2] text-[#292A2D]"
                  placeholder="기록 검색..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch("")} className="text-[#989BA2] text-[11px]">✕</button>}
              </div>

              {/* 즐겨찾기 */}
              <button
                onClick={() => setFilterFavorite(!filterFavorite)}
                className={`flex items-center gap-1.5 text-[11px] rounded-[5px] px-2 py-1 border w-full justify-start transition-colors ${
                  filterFavorite ? "bg-[#FFF7E6] text-[#E08A00] border-[#FFD98A] font-bold" : "bg-white text-[#70737C] border-[#DBDCDF]"
                }`}
              >
                <span style={{ color: filterFavorite ? "#FF7B2E" : "#C2C4C8" }}>{filterFavorite ? "★" : "☆"}</span>
                즐겨찾기만 보기
              </button>

              {/* 처방 타입 */}
              <div>
                <div className="text-[10px] font-medium text-[#70737C] mb-1">처방 타입</div>
                <div className="flex flex-wrap gap-1">
                  {PRESC_TAGS.map(tag => {
                    const active = filterTags.has(tag.name);
                    return (
                      <button key={tag.name}
                        onClick={() => setFilterTags(prev => { const n = new Set(prev); n.has(tag.name) ? n.delete(tag.name) : n.add(tag.name); return n; })}
                        className="text-[10px] rounded-[4px] border px-[6px] py-[2px] whitespace-nowrap transition-colors"
                        style={active
                          ? { background: tag.activeBg, color: tag.activeText, borderColor: tag.activeBg }
                          : { background: tag.bg, color: tag.text, borderColor: "transparent" }}>
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 다빈도 상병 — 토글 버튼 */}
              <div>
                <div className="text-[10px] font-medium text-[#70737C] mb-1">다빈도 상병</div>
                <div className="flex flex-wrap gap-1">
                  {DX_OPTIONS.map(d => {
                    const active = filterDiagnoses.has(d.code);
                    return (
                      <button key={d.code} onClick={() => toggleDx(d.code)} title={d.name}
                        className={`text-[10px] rounded-[4px] border px-[6px] py-[2px] whitespace-nowrap transition-colors ${
                          active ? "bg-[#453EDC] text-white border-[#453EDC]" : "bg-white text-[#70737C] border-[#DBDCDF]"
                        }`}>
                        {d.code}<span className={`ml-0.5 text-[9px] ${active ? "opacity-70" : "text-[#C2C4C8]"}`}>{d.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 초재진 */}
              <div>
                <div className="text-[10px] font-medium text-[#70737C] mb-1">초재진</div>
                <div className="flex gap-1">
                  {(["전체","초진","재진"] as const).map(v => (
                    <Chip key={v} label={v} active={filterVisType === v} onClick={() => setFilterVisType(v)}/>
                  ))}
                </div>
              </div>

              {/* 청구구분 */}
              <div>
                <div className="text-[10px] font-medium text-[#70737C] mb-1">청구구분</div>
                <div className="flex gap-1">
                  {(["전체","청구","비청구"] as const).map(v => (
                    <Chip key={v} label={v} active={filterClaim === v} onClick={() => setFilterClaim(v)}/>
                  ))}
                </div>
              </div>

              {/* 보험 */}
              <div>
                <div className="text-[10px] font-medium text-[#70737C] mb-1">보험</div>
                <div className="flex gap-1 flex-wrap">
                  {["전체","건보","자보","산재","의보","일반"].map(v => (
                    <Chip key={v} label={v}
                      active={v === "전체" ? filterIns.size === 0 : filterIns.has(v)}
                      onClick={() => toggleIns(v)}/>
                  ))}
                </div>
              </div>

              {allFiltersActive && (
                <button onClick={clearAll} className="text-[10px] text-[#FF4242] bg-[#FEECEC] border border-[#FF9999] rounded-[4px] px-2 py-1 w-full">
                  ⟳ 전체 필터 초기화
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#DBDCDF] flex-shrink-0" />

          {/* Date list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between px-2.5 py-1.5 sticky top-0 bg-[#F9F9FC] border-b border-[#DBDCDF] z-10">
              <span className="text-[10px] font-bold text-[#70737C]">내원일 ({localFiltered.length}건)</span>
            </div>
            {localFiltered.length === 0 ? (
              <div className="flex items-center justify-center h-16">
                <span className="text-[11px] text-[#989BA2]">조건에 맞는 내원이력 없음</span>
              </div>
            ) : localFiltered.map(v => {
              const isAct = activeDate === v.id;
              return (
                <div key={v.id} ref={el => { dateRefs.current[v.id] = el; }}
                  onClick={() => handleDateClick(v.id)}
                  className={`relative px-2.5 py-1.5 cursor-pointer border-b border-[#ECEDF1] transition-colors ${isAct ? "bg-white" : "hover:bg-white/70"}`}>
                  {isAct && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#453EDC] rounded-r-sm"/>}
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[11px] font-bold ${isAct ? "text-[#292A2D]" : "text-[#70737C]"}`}>{v.date}</span>
                    <div className="flex items-center gap-1">
                      {v.amount && <span className={`text-[10px] ${isAct ? "text-[#292A2D] font-medium" : "text-[#989BA2]"}`}>{v.amount}</span>}
                      <button style={{ color: starredDates.has(v.id) ? "#FF7B2E" : "#D0D1D6", fontSize: 11 }}
                        onClick={e => { e.stopPropagation(); onToggleStar(v.id); }}>
                        {starredDates.has(v.id) ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[9px] rounded-[2px] px-1 py-0.5 ${v.visitType === "재진" ? "bg-[#FFF1D1] text-[#A67300]" : "bg-[#EAF2FE] text-[#3385FF]"}`}>{v.visitType}</span>
                    {v.prescTypes.map(pt => (
                      <span key={pt} className={`text-[8px] font-bold rounded-[2px] px-1 ${
                        pt === "주" ? "bg-[#FEECEC] text-[#FF4242]"
                        : pt === "물" ? "bg-[#F1EDFF] text-[#6541F2]"
                        : pt === "방" ? "bg-[#FFF1E0] text-[#FF7B2E]"
                        : "bg-[#EDF8EF] text-[#4EAD0A]"
                      }`}>{pt}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ Main Visit Grid (2-col) ══ */}
        <div ref={gridRef} className="flex-1 overflow-y-auto bg-[#F3F4F8]" onScroll={handleGridScroll}>
          {localFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-[40px] opacity-20">🔍</span>
              <span className="text-[12px] text-[#989BA2]">필터 조건에 맞는 내원이력이 없습니다</span>
              <button onClick={clearAll} className="text-[11px] text-[#453EDC] underline">필터 초기화</button>
            </div>
          ) : (
            <div className="grid gap-2 p-2 bg-[#F3F4F8]" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {localFiltered.map(v => {
                const isActive  = activeDate === v.id;
                const labs      = LAB_BY_PRESC[v.id] ?? {};
                const dxSpecial = DX_SPECIAL[v.id] ?? {};

                return (
                  <div key={v.id} ref={el => { cardRefs.current[v.id] = el; }}
                    className="flex flex-col bg-white rounded-[10px] overflow-hidden shadow-sm border border-[#E8E8EC]"
                    onClick={() => setActiveDate(v.id)}>

                    {/* Card Header */}
                    <div className={`flex items-center pl-3 pr-2 gap-1 h-9 border-b flex-shrink-0 relative overflow-hidden ${
                      isActive ? "bg-[#F7F8FD] border-[#E5E6F2]" : "bg-[#F5F5F8] border-[#EBEBEE]"
                    }`}>
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#453EDC]" />}
                      <span className="text-[10px] font-bold text-[#292A2D] flex-shrink-0">{v.date}</span>
                      {v.time && <span className="text-[9px] text-[#989BA2] flex-shrink-0">{v.time}</span>}
                      <span className={`text-[9px] rounded-[3px] px-1 py-0.5 flex-shrink-0 ${v.visitType === "재진" ? "bg-[#FFF1D1] text-[#A67300]" : "bg-[#EAF2FE] text-[#3385FF]"}`}>{v.visitType}</span>
                      <span className="text-[9px] bg-[#F0F0F2] text-[#70737C] rounded-[3px] px-1 py-0.5 flex-shrink-0">{v.insType}</span>
                      {v.special && <span className="text-[9px] bg-[#EDF8EF] text-[#2EA652] rounded-[3px] px-1 py-0.5 flex-shrink-0">{v.special}</span>}
                      {v.prescTypes.map(pt => (
                        <span key={pt} className={`text-[8px] font-bold rounded-[2px] px-1 py-0.5 flex-shrink-0 ${PT_BADGE[pt].cls}`}>{PT_BADGE[pt].label[0]}</span>
                      ))}
                      {v.imageCount && v.imageCount > 0 ? (
                        <span className="text-[9px] text-[#6B7BB0] bg-[#F0F2F8] border border-[#D0D4E8] rounded-[3px] px-1 py-0.5 flex-shrink-0">📷 {v.imageCount}</span>
                      ) : null}
                      <div className="flex-1 min-w-0" />
                      {v.amount && <span className="text-[9px] text-[#292A2D] flex-shrink-0">{v.amount}</span>}
                      <button style={{ color: starredDates.has(v.id) ? "#FF7B2E" : "#D0D1D6", fontSize: 13 }}
                        onClick={e => { e.stopPropagation(); onToggleStar(v.id); }}>
                        {starredDates.has(v.id) ? "★" : "☆"}
                      </button>
                    </div>

                    {/* Symptom */}
                    <div className="px-3 py-1.5 border-b border-[#F2F2F4]">
                      <p className="text-[11px] text-[#46474C] leading-[16px]">{v.symptom}</p>
                    </div>

                    {/* Diagnosis */}
                    <div className="border-b border-[#F0F0F2]">
                      <div className="grid bg-[#F7F7F8] border-b border-[#EBEBEE] px-2 py-[3px]"
                        style={{ gridTemplateColumns: DX_COLS }}>
                        {["","코드","상병명","진료과"].map((h, i) => (
                          <span key={i} className="text-[9px] font-medium text-[#989BA2]">{h}</span>
                        ))}
                      </div>
                      {v.diagnoses.map((d, i) => (
                        <div key={d.code + i}
                          className="grid items-center px-2 py-[3px] border-b border-[#F2F2F4] hover:bg-[#F0FFF4] cursor-pointer group/dxrow"
                          style={{ gridTemplateColumns: DX_COLS }}
                          onClick={e => { e.stopPropagation(); onRepeatDx([d]); }}>
                          <span className="text-[9px] text-[#2EA652] opacity-0 group-hover/dxrow:opacity-100">↩</span>
                          <span className="text-[10px] font-medium text-[#453EDC]">{d.code}</span>
                          <div className="flex items-center gap-1">
                            {dxSpecial[d.code] && <span className="text-[8px] bg-[#FEECEC] text-[#FF4242] border border-[#FFAAAA] rounded-[2px] px-0.5 flex-shrink-0">{dxSpecial[d.code]}</span>}
                            <span className="text-[10px] text-[#292A2D] truncate">{d.name}</span>
                          </div>
                          <span className="text-[9px] text-[#70737C]">내과</span>
                        </div>
                      ))}
                    </div>

                    {/* Prescriptions */}
                    {v.prescriptions.length > 0 && (
                      <div className="border-b border-[#F0F0F2]">
                        <div className="grid bg-[#F7F7F8] border-b border-[#EBEBEE] px-2 py-[3px]"
                          style={{ gridTemplateColumns: PRESC_COLS, columnGap: "2px" }}>
                          {["처방명","용량","일투","일수","용법","단가","결과"].map((h, i) => (
                            <span key={i} className={`text-[9px] font-medium text-[#989BA2] ${i === 0 ? "" : i === 6 ? "text-right" : "text-center"}`}>{h}</span>
                          ))}
                        </div>
                        {v.prescriptions.map((p, i) => {
                          const lab = labs[p.name];
                          return (
                            <div key={p.name + i}
                              className="grid items-center px-2 py-[3px] border-b border-[#F2F2F4] last:border-b-0 hover:bg-[#F0FFF4] cursor-pointer relative group/rxrow"
                              style={{ gridTemplateColumns: PRESC_COLS, columnGap: "2px" }}
                              onClick={e => { e.stopPropagation(); onRepeatRx([p]); }}>
                              <span className="text-[10px] text-[#292A2D] truncate pr-1">{p.name}</span>
                              <span className="text-[9px] text-[#46474C] text-center">{p.dose}</span>
                              <span className="text-[9px] text-[#46474C] text-center">{p.freq}</span>
                              <span className="text-[9px] text-[#46474C] text-center">{p.days}</span>
                              <span className="text-[9px] text-[#70737C] text-center truncate">{p.method ?? "경구"}</span>
                              <span className="text-[9px] text-[#292A2D] text-right">{p.price.toLocaleString()}</span>
                              {lab ? (
                                <span className={`text-[9px] font-semibold text-right truncate ${sColor(lab.status)}`}>
                                  {lab.value}{sArrow(lab.status)}
                                </span>
                              ) : (
                                <span className="text-[9px] text-[#2EA652] text-right opacity-0 group-hover/rxrow:opacity-100">↩</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Note */}
                    {v.note && (
                      <div className="flex items-start gap-1 px-3 py-1.5">
                        <span className="text-[10px]">📝</span>
                        <span className="text-[10px] text-[#453EDC] leading-[15px]">{v.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}