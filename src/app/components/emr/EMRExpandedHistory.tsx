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
  prescriptions: { code?: string; name: string; dose: string; freq: string; days: number; price: number; method?: string; special?: string; payMethod?: string; claim?: boolean }[];
  note?: string;
  special?: string;
  imageCount?: number;
  /** 삭감 기록 (있을 때만) */
  deduction?: {
    reason: string;
    amount?: number;
    details: string;
  };
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
  "26-02-14": { "E11.9": "U002" },
  "26-02-28": {},
  "25-11-01": {},
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
  { name: "주사",     bg: "var(--status-error-bg-subtle)", text: "var(--red-500)", activeBg: "var(--red-500)", activeText: "#fff" },
  { name: "물리치료", bg: "var(--bg-primary-subtle)", text: "var(--brand-primary)", activeBg: "var(--brand-primary)", activeText: "#fff" },
  { name: "방사선",   bg: "var(--status-warning-bg-subtle)", text: "var(--orange-500)", activeBg: "var(--orange-500)", activeText: "#fff" },
  { name: "초음파",   bg: "var(--bg-primary-subtle)", text: "var(--brand-primary)", activeBg: "var(--brand-primary)", activeText: "#fff" },
  { name: "혈액검사", bg: "var(--status-success-bg-subtle)", text: "var(--green-500)", activeBg: "var(--green-500)", activeText: "#fff" },
  { name: "소변검사", bg: "var(--green-050)", text: "var(--green-500)", activeBg: "var(--green-500)", activeText: "#fff" },
  { name: "심전도",   bg: "var(--status-success-bg-subtle)", text: "var(--green-700)", activeBg: "var(--green-700)", activeText: "#fff" },
  { name: "내시경",   bg: "var(--bg-primary-subtle)", text: "var(--blue-700)", activeBg: "var(--blue-700)", activeText: "#fff" },
  { name: "처치",     bg: "var(--red-050)", text: "var(--red-500)", activeBg: "var(--red-500)", activeText: "#fff" },
  { name: "투약",     bg: "var(--status-warning-bg-subtle)", text: "var(--orange-500)", activeBg: "var(--orange-500)", activeText: "#fff" },
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
  주: { label: "주사",     cls: "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)]" },
  물: { label: "물리치료", cls: "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]" },
  방: { label: "방사선",   cls: "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-500)]" },
  검: { label: "검사",     cls: "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)]" },
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
  s === "H" ? "text-[var(--red-500)]" : s === "L" ? "text-[var(--blue-500)]" : "text-[var(--text-main)]";
const sArrow = (s: "N" | "H" | "L") =>
  s === "H" ? " ↑" : s === "L" ? " ↓" : "";

// 처방 컬럼 (펼쳐보기 — 컴팩트): 사용자코드 / 명칭 / 용량 / 일투 / 일수
const PRESC_COLS = "44px 1fr 28px 24px 28px";
// 진단 컬럼 (펼쳐보기 — 컴팩트): 상병코드 / 명칭
const DX_COLS    = "52px 1fr";

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, active, onClick, activeCls = "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]", inactiveCls = "bg-white text-[var(--text-sub)] border-[var(--line-default)]" }: {
  label: string; active: boolean; onClick: () => void; activeCls?: string; inactiveCls?: string;
}) {
  return (
    <button onClick={onClick}
      className={`text-sm rounded-[5px] border px-[8px] py-[2px] whitespace-nowrap transition-colors ${active ? activeCls : inactiveCls}`}>
      {label}
    </button>
  );
}

// ── MiniChart ─────────────────────────────────────────────────────────────────
function MiniChart({ minimized, onToggle }: { minimized: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden border-l border-[var(--line-default)] bg-[var(--bg-primary-subtle)] flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line-default)] bg-[var(--bg-subtle)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-md">🗒</span>
          <span className="text-sm font-bold text-[var(--text-main)]">오늘 차트</span>
          <span className="text-xs text-[var(--text-tertiary)]">2026-03-17</span>
        </div>
        <button onClick={onToggle} className="text-xs text-[var(--text-sub)] border border-[var(--line-default)] rounded-[4px] px-1.5 py-0.5 bg-white">
          {minimized ? "▲ 확장" : "▼ 최소화"}
        </button>
      </div>
      {!minimized && (
        <div className="flex flex-col overflow-y-auto flex-1">
          <div className="border-b border-[var(--line-default)]">
            <div className="flex items-center justify-between px-3 py-1 bg-[var(--bg-subtle)]">
              <span className="text-xs font-medium text-[var(--text-tertiary)]">진단</span>
            </div>
            {TODAY_DX.map(d => (
              <div key={d.code} className="flex items-center gap-2 px-3 py-1 border-b border-[var(--bg-subtle)] last:border-b-0">
                {d.isMain && <span className="text-micro bg-[var(--orange-500)] text-white rounded-[2px] px-0.5 flex-shrink-0">주</span>}
                <span className="text-xs font-medium text-[var(--brand-primary)] flex-shrink-0">{d.code}</span>
                <span className="text-xs text-[var(--text-main)] truncate flex-1">{d.name}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between px-3 py-1 bg-[var(--bg-subtle)]">
              <span className="text-xs font-medium text-[var(--text-tertiary)]">처방</span>
            </div>
            {TODAY_RX.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1 border-b border-[var(--bg-subtle)] last:border-b-0">
                <span className="text-xs text-[var(--text-main)] flex-1 truncate">{p.name}</span>
                <span className="text-micro text-[var(--text-tertiary)] flex-shrink-0 ml-2">{p.days}일 · {p.method}</span>
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
  onAddSymptom: (text: string) => void;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function EMRExpandedHistory({
  filteredVisits, activeDate, setActiveDate,
  starredDates, onToggleStar, filterFavorite, setFilterFavorite,
  filterPrescTypes, togglePrescType, filterDiagnoses, applyDiagnoses,
  resetFilters, hasActiveFilters, onClose,
  onRepeatDx, onRepeatRx, onRepeatAll, onAddSymptom,
}: Props) {
  const [show,         setShow]         = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterTags,    setFilterTags]    = useState<Set<string>>(new Set());
  const [filterVisType, setFilterVisType] = useState<"전체" | "초진" | "재진">("전체");
  const [filterClaim,   setFilterClaim]   = useState<"전체" | "청구" | "비청구">("전체");
  const [filterIns,     setFilterIns]     = useState<Set<string>>(new Set());

  // View modes — 내원일 카드 내부 어떤 섹션을 보여줄지 (다중선택)
  const VIEW_KEYS = ["증상", "진단", "처방", "이미지", "메모"] as const;
  type ViewKey = typeof VIEW_KEYS[number];
  const [viewModes, setViewModes] = useState<Set<ViewKey>>(new Set(VIEW_KEYS));
  const toggleViewMode = (k: ViewKey) => setViewModes(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });
  const allViewsActive = VIEW_KEYS.every(k => viewModes.has(k));

  // 그리드 단수 (2단 / 3단)
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  // 삭감 popover state
  const [deductionPopoverId, setDeductionPopoverId] = useState<string | null>(null);
  useEffect(() => {
    if (!deductionPopoverId) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-deduction-popover]") && !t.closest("[data-deduction-trigger]")) {
        setDeductionPopoverId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [deductionPopoverId]);

  // ── Filter Presets (저장된 필터 조합) ──────────────────────
  type FilterSnapshot = {
    search: string;
    favorite: boolean;
    tags: string[];
    diagnoses: string[];
    visitType: "전체" | "초진" | "재진";
    claim: "전체" | "청구" | "비청구";
    insType: string[];
  };
  type FilterPreset = { id: string; name: string; filters: FilterSnapshot };

  const DEFAULT_PRESETS: FilterPreset[] = [
    { id: "all",  name: "전체", filters: { search: "", favorite: false, tags: [], diagnoses: [], visitType: "전체", claim: "전체", insType: [] } },
    { id: "fav",  name: "★ 즐겨찾기", filters: { search: "", favorite: true, tags: [], diagnoses: [], visitType: "전체", claim: "전체", insType: [] } },
    { id: "dm",   name: "당뇨", filters: { search: "", favorite: false, tags: [], diagnoses: ["E11.9"], visitType: "전체", claim: "전체", insType: [] } },
    { id: "htn",  name: "고혈압", filters: { search: "", favorite: false, tags: [], diagnoses: ["I10"], visitType: "전체", claim: "전체", insType: [] } },
    { id: "lab",  name: "검사", filters: { search: "", favorite: false, tags: ["검"], diagnoses: [], visitType: "전체", claim: "전체", insType: [] } },
  ];

  const PRESETS_STORAGE_KEY = "nextemr.charting.history.presets";

  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PRESETS;
    try {
      const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!raw) return DEFAULT_PRESETS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRESETS;
    } catch { return DEFAULT_PRESETS; }
  });
  const [activePresetId, setActivePresetId] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets)); } catch {}
  }, [presets]);

  const captureSnapshot = (): FilterSnapshot => ({
    search,
    favorite: filterFavorite,
    tags: [...filterTags],
    diagnoses: [...filterDiagnoses],
    visitType: filterVisType,
    claim: filterClaim,
    insType: [...filterIns],
  });

  const applyPreset = (preset: FilterPreset) => {
    setSearch(preset.filters.search);
    setFilterFavorite(preset.filters.favorite);
    setFilterTags(new Set(preset.filters.tags));
    applyDiagnoses(new Set(preset.filters.diagnoses));
    setFilterVisType(preset.filters.visitType);
    setFilterClaim(preset.filters.claim);
    setFilterIns(new Set(preset.filters.insType));
    setActivePresetId(preset.id);
  };

  const savePreset = () => {
    const name = window.prompt("새 필터 프리셋 이름");
    if (!name?.trim()) return;
    const id = `user-${Date.now()}`;
    const preset: FilterPreset = { id, name: name.trim(), filters: captureSnapshot() };
    setPresets(prev => [...prev, preset]);
    setActivePresetId(id);
  };

  const deletePreset = (id: string) => {
    if (!window.confirm("이 프리셋을 삭제하시겠습니까?")) return;
    setPresets(prev => prev.filter(p => p.id !== id));
    if (activePresetId === id) setActivePresetId("all");
  };

  // 사용자가 필터를 직접 변경하면 활성 프리셋과 mismatch 표시
  const isPresetDirty = (() => {
    const active = presets.find(p => p.id === activePresetId);
    if (!active) return true;
    const cur = captureSnapshot();
    return (
      cur.search !== active.filters.search ||
      cur.favorite !== active.filters.favorite ||
      JSON.stringify([...cur.tags].sort()) !== JSON.stringify([...active.filters.tags].sort()) ||
      JSON.stringify([...cur.diagnoses].sort()) !== JSON.stringify([...active.filters.diagnoses].sort()) ||
      cur.visitType !== active.filters.visitType ||
      cur.claim !== active.filters.claim ||
      JSON.stringify([...cur.insType].sort()) !== JSON.stringify([...active.filters.insType].sort())
    );
  })();

  const gridRef  = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dateStripRef = useRef<HTMLDivElement>(null);
  const [visibleDates, setVisibleDates] = useState<Set<string>>(new Set());

  // 마우스 휠로 가로 스크롤
  useEffect(() => {
    const el = dateStripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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
    const containerRect = gridRef.current.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    let bestId = localFiltered[0]?.id ?? "";
    let bestDist = Infinity;
    const visible = new Set<string>();
    const COLS = gridCols;
    // 행 단위로 묶어서 가시성 계산 — 행의 TOP이 뷰포트 안에 있을 때만 그 행 전체를 visible로 처리
    for (let i = 0; i < localFiltered.length; i += COLS) {
      const row = localFiltered.slice(i, i + COLS);
      let rowTop: number | null = null;
      for (const v of row) {
        const el = cardRefs.current[v.id];
        if (el) { rowTop = el.getBoundingClientRect().top; break; }
      }
      if (rowTop === null) continue;
      if (rowTop >= containerTop && rowTop < containerBottom) {
        row.forEach(v => visible.add(v.id));
      }
    }
    // activeDate(스크롤 sync용)는 기존 로직 유지
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
    setVisibleDates(prev => {
      if (prev.size === visible.size && [...visible].every(id => prev.has(id))) return prev;
      return visible;
    });
  }, [localFiltered, activeDate, setActiveDate, gridCols]);

  // 초기 렌더 후 visible 계산
  useEffect(() => {
    handleGridScroll();
  }, [handleGridScroll]);

  const allFiltersActive = hasActiveFilters || filterTags.size > 0 || filterVisType !== "전체" || filterClaim !== "전체" || filterIns.size > 0;
  const clearAll = () => { resetFilters(); setFilterTags(new Set()); setFilterVisType("전체"); setFilterClaim("전체"); setFilterIns(new Set()); setSearch(""); };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col bg-white overflow-hidden transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0"}`}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--line-default)] flex-shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
          </svg>
          <span className="text-lg font-bold text-[var(--text-main)]">내원이력 펼쳐보기</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-[var(--text-tertiary)]">100236</span>
            <span className="text-lg font-bold text-[var(--text-main)]">황미진</span>
            <span className="text-sm text-[var(--text-sub)] tabular-nums">여/45</span>
          </div>
          {allFiltersActive && (
            <span className="text-xs bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 rounded-full px-2 py-0.5">필터 적용 중</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-[var(--text-sub)] border border-[var(--line-default)] rounded-[6px] px-2.5 h-7 bg-white hover:bg-[var(--bg-subtle)]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="var(--text-sub)" strokeWidth="1.3"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="var(--text-sub)" strokeWidth="1.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="var(--text-sub)" strokeWidth="1.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="var(--text-sub)" strokeWidth="1.3"/>
            </svg>
            축소
          </button>

        </div>
      </div>

      {/* ── 보기 + 필터 바 (한 줄, collapsible) ── */}
      <div className="flex flex-col flex-shrink-0 border-b border-[var(--line-default)] bg-[var(--bg-base)]">
        {/* 보기 + 필터 한 줄 */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* 보기 */}
          <span className="text-xs font-medium text-[var(--text-tertiary)] flex-shrink-0">보기</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setViewModes(new Set(VIEW_KEYS))}
              className={`text-xs rounded-[4px] px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                allViewsActive
                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                  : "bg-white text-[var(--text-sub)] border-[var(--line-default)]"
              }`}
            >전체</button>
            {VIEW_KEYS.map(k => {
              const active = viewModes.has(k);
              return (
                <button key={k} onClick={() => toggleViewMode(k)}
                  className={`text-xs rounded-[4px] px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                    active ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]" : "bg-white text-[var(--text-sub)] border-[var(--line-default)]"
                  }`}
                >{active ? "✓" : ""} {k}</button>
              );
            })}
          </div>

          {/* 구분선 */}
          <div className="h-4 w-px bg-[var(--line-default)] flex-shrink-0" />

          {/* 단수 — 2단 / 3단 그리드 선택 */}
          <span className="text-xs font-medium text-[var(--text-tertiary)] flex-shrink-0">단수</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {([2, 3] as const).map(n => (
              <button key={n} onClick={() => setGridCols(n)}
                className={`text-xs rounded-[4px] px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                  gridCols === n
                    ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
                    : "bg-white text-[var(--text-sub)] border-[var(--line-default)]"
                }`}
              >{n}단</button>
            ))}
          </div>

          {/* 구분선 */}
          <div className="h-4 w-px bg-[var(--line-default)] flex-shrink-0" />

          {/* 필터 */}
          <span className="text-xs font-medium text-[var(--text-tertiary)] flex-shrink-0">필터</span>
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            {presets.map(p => {
              const isActive = activePresetId === p.id;
              const isUserPreset = p.id.startsWith("user-");
              return (
                <span key={p.id}
                  className={`inline-flex items-center rounded-[4px] border whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                      : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <button onClick={() => applyPreset(p)} className="text-xs px-1.5 py-0.5 leading-none">{p.name}</button>
                  {isUserPreset && (
                    <button onClick={() => deletePreset(p.id)} title="프리셋 삭제"
                      className={`text-xs px-1 py-0.5 leading-none border-l ${isActive ? "border-white/30 hover:bg-white/10" : "border-[var(--line-default)] hover:bg-[var(--line-subtle)]"}`}
                    >×</button>
                  )}
                </span>
              );
            })}
            {isPresetDirty && activePresetId !== "all" && (
              <span className="text-xs text-[var(--orange-700)] ml-1">*수정됨</span>
            )}
          </div>
          <button
            onClick={() => setFiltersExpanded(e => !e)}
            className="text-xs text-[var(--text-sub)] border border-[var(--line-default)] rounded-[4px] px-1.5 py-0.5 hover:bg-[var(--bg-subtle)] flex-shrink-0 whitespace-nowrap leading-none"
          >
            {filtersExpanded ? "▲ 접기" : "▼ 자세히"}
          </button>
        </div>

        {/* 필터 상세 — expanded */}
        {filtersExpanded && (
          <div className="px-3 py-2 border-t border-[var(--line-subtle)] bg-white flex flex-col gap-2">
            {/* Search */}
            <div className="flex items-center gap-1 bg-white border border-[var(--line-default)] rounded-[6px] px-2 h-7">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input className="flex-1 bg-transparent text-sm outline-none placeholder-[var(--text-tertiary)] text-[var(--text-main)]"
                placeholder="기록 검색..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="text-[var(--text-tertiary)] text-sm">✕</button>}
            </div>

            {/* 즐겨찾기 + 처방타입 */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterFavorite(!filterFavorite)}
                className={`flex items-center gap-1 text-xs rounded-[5px] px-2 py-1 border whitespace-nowrap transition-colors ${
                  filterFavorite ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-200)] font-bold" : "bg-white text-[var(--text-sub)] border-[var(--line-default)]"
                }`}
              >
                <span style={{ color: filterFavorite ? "var(--orange-500)" : "var(--text-disabled)" }}>{filterFavorite ? "★" : "☆"}</span>
                즐겨찾기만
              </button>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-[var(--text-sub)] mr-0.5">처방</span>
                {PRESC_TAGS.map(tag => {
                  const active = filterTags.has(tag.name);
                  return (
                    <button key={tag.name}
                      onClick={() => setFilterTags(prev => { const n = new Set(prev); n.has(tag.name) ? n.delete(tag.name) : n.add(tag.name); return n; })}
                      className="text-xs rounded-[4px] border px-[6px] py-[2px] whitespace-nowrap transition-colors"
                      style={active
                        ? { background: tag.activeBg, color: tag.activeText, borderColor: tag.activeBg }
                        : { background: tag.bg, color: tag.text, borderColor: "transparent" }}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 다빈도 상병 */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-medium text-[var(--text-sub)] mr-1">상병</span>
              {DX_OPTIONS.map(d => {
                const active = filterDiagnoses.has(d.code);
                return (
                  <button key={d.code} onClick={() => toggleDx(d.code)} title={d.name}
                    className={`text-xs rounded-[4px] border px-[6px] py-[2px] whitespace-nowrap transition-colors ${
                      active ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "bg-white text-[var(--text-sub)] border-[var(--line-default)]"
                    }`}>
                    {d.code}<span className={`ml-0.5 text-micro ${active ? "opacity-70" : "text-[var(--text-disabled)]"}`}>{d.count}</span>
                  </button>
                );
              })}
            </div>

            {/* 초재진 / 청구구분 / 보험 */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-medium text-[var(--text-sub)] mr-1">초재진</span>
              {(["전체","초진","재진"] as const).map(v => (
                <Chip key={v} label={v} active={filterVisType === v} onClick={() => setFilterVisType(v)}/>
              ))}
              <span className="text-xs font-medium text-[var(--text-sub)] mr-1 ml-2">청구구분</span>
              {(["전체","청구","비청구"] as const).map(v => (
                <Chip key={v} label={v} active={filterClaim === v} onClick={() => setFilterClaim(v)}/>
              ))}
              <span className="text-xs font-medium text-[var(--text-sub)] mr-1 ml-2">보험</span>
              {["전체","건보","자보","산재","의보","일반"].map(v => (
                <Chip key={v} label={v}
                  active={v === "전체" ? filterIns.size === 0 : filterIns.has(v)}
                  onClick={() => toggleIns(v)}/>
              ))}
            </div>

            {/* Save / Reset */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--line-subtle)]">
              <button onClick={savePreset}
                className="text-xs text-[var(--brand-primary)] border border-[var(--brand-primary)] bg-white rounded-[4px] px-2 py-1 hover:bg-[var(--bg-primary-subtle)]">
                ＋ 현재 필터를 프리셋으로 저장
              </button>
              {allFiltersActive && (
                <button onClick={clearAll} className="text-xs text-[var(--red-500)] bg-[var(--status-error-bg-subtle)] border border-[var(--red-200)] rounded-[4px] px-2 py-1">
                  ⟳ 필터 초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 날짜 스트립 (가로, 날짜만) ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-[var(--line-default)] flex-shrink-0">
        <span className="text-xs font-bold text-[var(--text-sub)] flex-shrink-0">내원일</span>
        <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{localFiltered.length}건</span>
        <div className="h-4 w-px bg-[var(--line-default)] flex-shrink-0" />
        <div ref={dateStripRef} className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          {localFiltered.length === 0 ? (
            <span className="text-sm text-[var(--text-tertiary)]">조건에 맞는 내원이력 없음</span>
          ) : localFiltered.map(v => {
            const isVisible = visibleDates.has(v.id);
            return (
              <button key={v.id} ref={el => { dateRefs.current[v.id] = el; }}
                onClick={() => handleDateClick(v.id)}
                className={`text-sm rounded-[4px] border px-2 py-0.5 whitespace-nowrap transition-colors flex-shrink-0 ${
                  isVisible
                    ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--blue-200)]"
                    : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                }`}>
                {v.date}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ══ Main Visit Grid (3-col) ══ */}
        <div ref={gridRef} className="flex-1 overflow-y-auto bg-[var(--bg-subtle)]" onScroll={handleGridScroll}>
          {localFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-[40px] opacity-20">🔍</span>
              <span className="text-md text-[var(--text-tertiary)]">필터 조건에 맞는 내원이력이 없습니다</span>
              <button onClick={clearAll} className="text-sm text-[var(--brand-primary)] underline">필터 초기화</button>
            </div>
          ) : (
            <div className="p-2 bg-[var(--bg-subtle)]">
              <div className="grid gap-2 items-start" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
              {localFiltered.map(v => {
                const isActive  = activeDate === v.id;
                const labs      = LAB_BY_PRESC[v.id] ?? {};
                const dxSpecial = DX_SPECIAL[v.id] ?? {};

                return (
                  <div key={v.id} ref={el => { cardRefs.current[v.id] = el; }}
                    className="relative flex flex-col bg-white rounded-[10px] overflow-hidden shadow-sm border border-[var(--line-default)]"
                    onClick={() => setActiveDate(v.id)}>

                    {/* Card Header — 클릭 시 전체 내원 추가 (증상+진단+처방) */}
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setActiveDate(v.id);
                        onAddSymptom(v.symptom);
                        onRepeatAll(v.diagnoses, v.prescriptions);
                      }}
                      title="클릭하면 이 내원의 증상·진단·처방을 모두 추가"
                      className={`flex items-center pl-3 pr-2 gap-1 h-9 border-b flex-shrink-0 relative overflow-hidden cursor-pointer hover:brightness-95 ${
                        isActive ? "bg-[var(--bg-primary-subtle)] border-[var(--line-subtle)]" : "bg-[var(--bg-subtle)] border-[var(--line-subtle)]"
                      }`}>
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--brand-primary)]" />}
                      <span className="text-xs font-bold text-[var(--text-main)] flex-shrink-0">{v.date}</span>
                      {v.time && <span className="text-micro text-[var(--text-tertiary)] flex-shrink-0">{v.time}</span>}
                      <span className="text-micro rounded-[3px] px-1 py-0.5 flex-shrink-0 bg-white border border-[var(--line-default)] text-[var(--text-sub)]">{v.visitType[0]}</span>
                      <span className="text-micro bg-[var(--line-subtle)] text-[var(--text-sub)] rounded-[3px] px-1 py-0.5 flex-shrink-0">{v.insType}</span>
                      {v.special && <span className="text-micro bg-[var(--status-success-bg-subtle)] text-[var(--green-500)] rounded-[3px] px-1 py-0.5 flex-shrink-0">{v.special}</span>}
                      {v.prescTypes.map(pt => (
                        <span key={pt} className={`text-micro font-bold rounded-[2px] px-1 py-0.5 flex-shrink-0 ${PT_BADGE[pt].cls}`}>{PT_BADGE[pt].label[0]}</span>
                      ))}
                      {viewModes.has("이미지") && v.imageCount && v.imageCount > 0 ? (
                        <span className="text-micro text-[var(--blue-700)] bg-[var(--blue-050)] border border-[var(--blue-200)] rounded-[3px] px-1 py-0.5 flex-shrink-0">📷 {v.imageCount}</span>
                      ) : null}
                      {/* 삭감 인디케이터 */}
                      {v.deduction && (
                        <button
                          data-deduction-trigger
                          onClick={e => {
                            e.stopPropagation();
                            setDeductionPopoverId(prev => prev === v.id ? null : v.id);
                          }}
                          title="삭감 기록 보기"
                          className="flex items-center gap-0.5 text-micro font-bold bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border border-[var(--red-200)] rounded-[3px] px-1 py-0.5 hover:bg-[var(--red-100)] flex-shrink-0"
                        >
                          <span className="leading-none">⚠</span>
                          <span>삭감</span>
                        </button>
                      )}
                      <div className="flex-1 min-w-0" />
                      {v.amount && <span className="text-micro text-[var(--text-main)] flex-shrink-0">{v.amount}</span>}
                      <button style={{ color: starredDates.has(v.id) ? "var(--orange-500)" : "var(--text-disabled)", fontSize: 13 }}
                        onClick={e => { e.stopPropagation(); onToggleStar(v.id); }}>
                        {starredDates.has(v.id) ? "★" : "☆"}
                      </button>
                    </div>

                    {/* 삭감 popover — 카드 내부 오버레이 (헤더 아래) */}
                    {v.deduction && deductionPopoverId === v.id && (
                      <div
                        data-deduction-popover
                        onClick={e => e.stopPropagation()}
                        className="absolute top-9 left-2 right-2 bg-white border border-[var(--red-200)] rounded-md shadow-lg p-2.5 z-50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-[var(--red-700)]">⚠ 삭감 기록{typeof v.deduction.amount === "number" && ` — ${v.deduction.amount.toLocaleString()}원`}</span>
                          <button
                            onClick={e => { e.stopPropagation(); setDeductionPopoverId(null); }}
                            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)]"
                          >✕</button>
                        </div>
                        <div className="text-xs font-medium text-[var(--text-main)] mb-1">{v.deduction.reason}</div>
                        <div className="text-xs text-[var(--text-sub)] leading-[15px] whitespace-pre-line">{v.deduction.details}</div>
                      </div>
                    )}

                    {/* Symptom — 클릭 시 증상 텍스트 추가 */}
                    {viewModes.has("증상") && (
                      <div
                        onClick={e => { e.stopPropagation(); onAddSymptom(v.symptom); }}
                        title="클릭하면 증상에 추가"
                        className="px-3 py-1.5 border-b border-[var(--line-subtle)] hover:bg-[var(--status-success-bg-subtle)] cursor-pointer"
                      >
                        <p className="text-sm text-[var(--text-sub)] leading-[16px]">{v.symptom}</p>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {viewModes.has("진단") && (
                    <div className="border-b border-[var(--line-subtle)]">
                      <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-subtle)] px-2 py-[3px] gap-1"
                        style={{ gridTemplateColumns: DX_COLS }}>
                        {[["상병코드","left"],["명칭","left"]].map(([label, align]) => (
                          <span key={label} className={`text-micro font-medium text-[var(--text-tertiary)] text-${align} truncate`}>{label}</span>
                        ))}
                      </div>
                      {v.diagnoses.map((d, i) => (
                        <div key={d.code + i}
                          className="grid items-center px-2 py-[3px] border-b border-[var(--line-subtle)] hover:bg-[var(--status-success-bg-subtle)] cursor-pointer group/dxrow gap-1"
                          style={{ gridTemplateColumns: DX_COLS }}
                          onClick={e => { e.stopPropagation(); onRepeatDx([d]); }}>
                          <span className="text-xs font-medium text-[var(--text-main)]">{d.code}</span>
                          <div className="flex items-center gap-1 min-w-0">
                            {dxSpecial[d.code] && <span className="text-micro bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border border-[var(--red-200)] rounded-[2px] px-0.5 flex-shrink-0">{dxSpecial[d.code]}</span>}
                            <span className="text-xs text-[var(--text-main)] truncate">{d.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}

                    {/* Prescriptions */}
                    {viewModes.has("처방") && v.prescriptions.length > 0 && (
                      <div className="border-b border-[var(--line-subtle)]">
                        <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-subtle)] px-2 py-[3px] gap-1"
                          style={{ gridTemplateColumns: PRESC_COLS }}>
                          {[["사용자코드","left"],["명칭","left"],["용량","center"],["일투","center"],["일수","center"]].map(([label, align]) => (
                            <span key={label} className={`text-micro font-medium text-[var(--text-tertiary)] text-${align} truncate`}>{label}</span>
                          ))}
                        </div>
                        {v.prescriptions.map((p, i) => (
                          <div key={p.name + i}
                            className="grid items-center px-2 py-[3px] border-b border-[var(--line-subtle)] last:border-b-0 hover:bg-[var(--status-success-bg-subtle)] cursor-pointer relative group/rxrow gap-1"
                            style={{ gridTemplateColumns: PRESC_COLS }}
                            onClick={e => { e.stopPropagation(); onRepeatRx([p]); }}>
                            <span className="text-micro text-[var(--text-tertiary)] truncate">{p.code ?? ""}</span>
                            <span className="text-xs text-[var(--text-main)] truncate">{p.name}</span>
                            <span className="text-micro text-[var(--text-sub)] text-center">{p.dose}</span>
                            <span className="text-micro text-[var(--text-sub)] text-center">{p.freq}</span>
                            <span className="text-micro text-[var(--text-sub)] text-center">{p.days}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Note */}
                    {viewModes.has("메모") && v.note && (
                      <div className="flex items-start gap-1 px-3 py-1.5">
                        <span className="text-xs">📝</span>
                        <span className="text-xs text-[var(--brand-primary)] leading-[15px]">{v.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}