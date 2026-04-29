import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { EMRExpandedHistory } from "./EMRExpandedHistory";
import type { HistoryDx, HistoryRx } from "./chartTypes";

type PrescType = "주" | "물" | "방" | "검";

type VisitRecord = {
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
};

const visitHistory: VisitRecord[] = [
  {
    id: "26-03-12",
    date: "26-03-12",
    time: "11:47",
    visitType: "재진",
    insType: "일반",
    tags: ["검", "주"],
    prescTypes: ["검", "주"],
    amount: "₩83,000",
    imageCount: 3,
    symptom: "기침, 콧물, 발열 3일 전부터 지속. 목 통증 동반.",
    diagnoses: [
      { code: "J00", name: "급성비인두염" },
      { code: "J20.9", name: "급성 기관지염" },
    ],
    prescriptions: [
      { name: "도네페질정 5mg",          dose: "1", freq: "1", days: 3,  price: 2000, method: "경구" },
      { name: "암브록솔염산염시럽",        dose: "1", freq: "3", days: 5,  price: 1800, method: "경구" },
      { name: "아세트아미노펜정 500mg",    dose: "2", freq: "3", days: 5,  price: 300,  method: "경구" },
      { name: "클로르페니라민정 4mg",      dose: "1", freq: "3", days: 5,  price: 400,  method: "경구" },
      { name: "덱시부프로펜정 300mg",      dose: "1", freq: "3", days: 5,  price: 600,  method: "경구" },
      { name: "포비돈요오드 가글액",        dose: "1", freq: "4", days: 5,  price: 500,  method: "외용" },
      { name: "전혈구검사(CBC)",           dose: "1", freq: "1", days: 1,  price: 9000,  method: "-" },
      { name: "CRP",                     dose: "1", freq: "1", days: 1,  price: 3500,  method: "-" },
      { name: "흉부 X-ray",               dose: "1", freq: "1", days: 1,  price: 18500, method: "-" },
    ],
    note: "가루약으로 나가주세요.",
  },
  {
    id: "26-02-28",
    date: "26-02-28",
    time: "09:30",
    visitType: "재진",
    insType: "일반",
    tags: ["주", "약"],
    prescTypes: ["주"],
    amount: "₩42,000",
    symptom: "혈압 약 처방 요청. 두통 간헐적 발생.",
    diagnoses: [{ code: "I10", name: "본태성 고혈압" }],
    prescriptions: [
      { name: "텔미사르탄정 40mg",         dose: "1", freq: "1", days: 28, price: 1200, method: "경구" },
      { name: "암로디핀베실산염정 5mg",     dose: "1", freq: "1", days: 28, price: 900,  method: "경구" },
      { name: "아스피린장용정 100mg",       dose: "1", freq: "1", days: 28, price: 300,  method: "경구" },
      { name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
      { name: "히드로클로로티아지드정 12.5mg", dose: "1", freq: "1", days: 28, price: 250, method: "경구" },
    ],
  },
  {
    id: "26-02-14",
    date: "26-02-14",
    time: "14:15",
    visitType: "재진",
    insType: "일반",
    tags: ["주"],
    prescTypes: ["주", "물"],
    amount: "₩55,000",
    symptom: "혈압·당뇨 정기 관리. 어지러움 호소.",
    diagnoses: [
      { code: "I10",   name: "본태성 고혈압" },
      { code: "E11.9", name: "제2형 당뇨병" },
    ],
    prescriptions: [
      { name: "메트포르민염산염정 500mg",   dose: "1", freq: "2", days: 28, price: 600,  method: "경구" },
      { name: "라미프릴정 5mg",            dose: "1", freq: "1", days: 28, price: 1100, method: "경구" },
      { name: "텔미사르탄정 40mg",         dose: "1", freq: "1", days: 28, price: 1200, method: "경구" },
      { name: "글리메피리드정 2mg",         dose: "1", freq: "1", days: 28, price: 800,  method: "경구" },
      { name: "아스피린장용정 100mg",       dose: "1", freq: "1", days: 28, price: 300,  method: "경구" },
      { name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
      { name: "알파리포산정 300mg",         dose: "1", freq: "2", days: 28, price: 950,  method: "경구" },
    ],
  },
  {
    id: "26-01-05",
    date: "26-01-05",
    time: "10:22",
    visitType: "재진",
    insType: "일반",
    tags: [],
    prescTypes: ["방"],
    amount: "₩28,000",
    symptom: "두통, 목 뻣뻣함 호소. 스트레스성으로 판단.",
    diagnoses: [{ code: "R51", name: "두통" }],
    prescriptions: [
      { name: "아세트아미노펜정 500mg",     dose: "2", freq: "3", days: 3,  price: 300,  method: "경구" },
      { name: "이부프로펜정 400mg",         dose: "1", freq: "3", days: 3,  price: 500,  method: "경구" },
      { name: "에티졸람정 0.5mg",           dose: "1", freq: "1", days: 7,  price: 1200, method: "경구" },
      { name: "티자니딘염산염정 2mg",        dose: "1", freq: "2", days: 5,  price: 700,  method: "경구" },
    ],
  },
  {
    id: "25-11-01",
    date: "25-11-01",
    time: "11:00",
    visitType: "재진",
    insType: "일반",
    special: "임산부",
    tags: ["주"],
    prescTypes: ["주"],
    amount: "₩38,000",
    imageCount: 2,
    symptom: "두통, 부종. 임산부 특례 적용.",
    diagnoses: [
      { code: "R51", name: "두통" },
      { code: "I10", name: "본태성 고혈압" },
    ],
    prescriptions: [
      { name: "아세트아미노펜정 500mg",     dose: "1", freq: "3", days: 5,  price: 300,  method: "경구" },
      { name: "마그네슘산화물정 500mg",      dose: "1", freq: "1", days: 30, price: 400,  method: "경구" },
      { name: "폴산정 5mg",                dose: "1", freq: "1", days: 30, price: 200,  method: "경구" },
      { name: "라베탈롤정 100mg",           dose: "1", freq: "2", days: 28, price: 1800, method: "경구" },
    ],
  },
  {
    id: "25-09-20",
    date: "25-09-20",
    time: "09:45",
    visitType: "재진",
    insType: "건보",
    tags: ["검"],
    prescTypes: ["검"],
    amount: "₩19,400",
    imageCount: 1,
    symptom: "알러지 검사 위해 내원. 페니실린·조영제 알러지 기왕력.",
    diagnoses: [{ code: "Z01.1", name: "알러지 검사" }],
    prescriptions: [
      { name: "페니실린 IgE",     dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { name: "조영제 IgE",       dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { name: "집먼지진드기 IgE", dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { name: "꽃가루 IgE",       dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
    ],
    note: "결과 3~4주 소요 예정. 확인 후 연락.",
  },
  {
    id: "25-07-31",
    date: "25-07-31",
    time: "15:30",
    visitType: "재진",
    insType: "일반",
    tags: ["약"],
    prescTypes: [],
    amount: "₩25,000",
    imageCount: 4,
    symptom: "기침, 콧물, 발열 2일. 여름감기.",
    diagnoses: [
      { code: "J00",   name: "급성비인두염" },
      { code: "E78.5", name: "고지혈증" },
    ],
    prescriptions: [
      { name: "클로르페니라민정 4mg",       dose: "1", freq: "3", days: 3,  price: 400,  method: "경구" },
      { name: "아세트아미노펜정 500mg",     dose: "2", freq: "3", days: 3,  price: 300,  method: "경구" },
      { name: "암브록솔염산염정 30mg",      dose: "1", freq: "3", days: 3,  price: 600,  method: "경구" },
      { name: "페니레프린 코드롭 0.25%",    dose: "2", freq: "2", days: 5,  price: 800,  method: "점비" },
      { name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
    ],
  },
  {
    id: "25-06-20",
    date: "25-06-20",
    time: "10:10",
    visitType: "재진",
    insType: "일반",
    tags: [],
    prescTypes: ["방"],
    amount: "₩18,000",
    symptom: "두통 반복, 어지러움 동반. 편두통 추정.",
    diagnoses: [
      { code: "G43.9", name: "편두통" },
      { code: "E78.5", name: "고지혈증" },
    ],
    prescriptions: [
      { name: "수마트립탄정 50mg",          dose: "1", freq: "필요시", days: 10, price: 2800, method: "경구" },
      { name: "메토클로프라미드정 10mg",     dose: "1", freq: "필요시", days: 10, price: 300,  method: "경구" },
      { name: "프로프라놀롤정 20mg",         dose: "1", freq: "2",    days: 28, price: 400,  method: "경구" },
      { name: "나프록센나트륨정 275mg",      dose: "2", freq: "2",    days: 5,  price: 650,  method: "경구" },
    ],
  },
  {
    id: "25-04-02",
    date: "25-04-02",
    time: "09:00",
    visitType: "초진",
    insType: "일반",
    tags: [],
    prescTypes: [],
    amount: "₩32,000",
    symptom: "발열 38.5도, 인후통. 처음 내원.",
    diagnoses: [
      { code: "J02.9", name: "급성인두염" },
      { code: "J30.9", name: "알레르기성 비염" },
    ],
    prescriptions: [
      { name: "아목시실린캡슐 500mg",       dose: "1", freq: "3", days: 5,  price: 800,  method: "경구" },
      { name: "이부프로펜정 400mg",         dose: "1", freq: "3", days: 5,  price: 500,  method: "경구" },
      { name: "베클로메타손 비강 스프레이",  dose: "2", freq: "2", days: 7,  price: 4500, method: "흡입" },
      { name: "클라리트로마이신정 500mg",    dose: "1", freq: "2", days: 7,  price: 2800, method: "경구" },
      { name: "세티리진염산염정 10mg",       dose: "1", freq: "1", days: 7,  price: 350,  method: "경구" },
    ],
  },
  {
    id: "25-01-15",
    date: "25-01-15",
    time: "14:00",
    visitType: "재진",
    insType: "건보",
    tags: ["검"],
    prescTypes: ["검"],
    amount: "₩62,000",
    symptom: "연간 건강검진.",
    diagnoses: [
      { code: "Z00.0", name: "일반 건강검진" },
      { code: "E11.9", name: "제2형 당뇨병" },
    ],
    prescriptions: [
      { name: "HbA1c",          dose: "1", freq: "1", days: 1, price: 12000, method: "-" },
      { name: "LDL 콜레스테롤",  dose: "1", freq: "1", days: 1, price: 8000,  method: "-" },
      { name: "eGFR",           dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { name: "공복혈당",         dose: "1", freq: "1", days: 1, price: 4000,  method: "-" },
      { name: "총콜레스테롤",     dose: "1", freq: "1", days: 1, price: 5000,  method: "-" },
      { name: "요침사검사",       dose: "1", freq: "1", days: 1, price: 3500,  method: "-" },
      { name: "심전도검사",       dose: "1", freq: "1", days: 1, price: 8500,  method: "-" },
    ],
  },
  {
    id: "24-11-03",
    date: "24-11-03",
    time: "10:30",
    visitType: "재진",
    insType: "건보",
    tags: ["주"],
    prescTypes: ["주"],
    amount: "₩8,500",
    symptom: "독감 예방접종.",
    diagnoses: [
      { code: "Z23",   name: "독감 예방접종" },
      { code: "K21.0", name: "역류성 식도염" },
    ],
    prescriptions: [
      { name: "오메프라졸캡슐 20mg",        dose: "1", freq: "1", days: 28, price: 650,  method: "경구" },
      { name: "모사프리드정 5mg",           dose: "1", freq: "3", days: 28, price: 420,  method: "경구" },
    ],
  },
];

const diagnosisOptions = [
  { code: "I10",   name: "본태성(원발성) 고혈압",  count: 8 },
  { code: "E11.9", name: "제2형 당뇨병",           count: 6 },
  { code: "J00",   name: "급성비인두염",            count: 5 },
  { code: "R51",   name: "상세불명의 두통",          count: 4 },
  { code: "J20.9", name: "급성 기관지염",            count: 3 },
  { code: "E78.5", name: "고지혈증",                count: 3 },
  { code: "J30.9", name: "알레르기성 비염",          count: 2 },
  { code: "K21.0", name: "역류성 식도염",            count: 2 },
];

const prescTypeConfig: Record<PrescType, { label: string; desc: string; active: string; inactive: string }> = {
  주: { label: "주", desc: "주사",     active: "bg-[#FF4242] text-white border-[#FF4242]",    inactive: "bg-[#FEECEC] text-[#FF4242] border-[#FFAAAA]" },
  물: { label: "물", desc: "물리치료", active: "bg-[#6541F2] text-white border-[#6541F2]",    inactive: "bg-[#F1EDFF] text-[#6541F2] border-[#C9B8FF]" },
  방: { label: "방", desc: "방사선",   active: "bg-[#FF7B2E] text-white border-[#FF7B2E]",    inactive: "bg-[#FFF1E0] text-[#FF7B2E] border-[#FFCFA0]" },
  검: { label: "검", desc: "검사",     active: "bg-[#4EAD0A] text-white border-[#4EAD0A]",    inactive: "bg-[#EDF8EF] text-[#4EAD0A] border-[#A8DEB0]"  },
};

export function PanelC({
  onRepeatDx,
  onRepeatRx,
  onRepeatAll,
  onAddSymptom,
}: {
  onRepeatDx: (items: HistoryDx[]) => void;
  onRepeatRx: (items: HistoryRx[]) => void;
  onRepeatAll: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  onAddSymptom: (text: string) => void;
}) {
  const [activeDate, setActiveDate] = useState("26-03-12");
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expand state
  const [isExpanded, setIsExpanded] = useState(false);

  const openExpanded = () => setIsExpanded(true);

  // ─ Filter state ────────────────��─────────────────────────
  const [starredDates, setStarredDates] = useState<Set<string>>(
    new Set(["26-03-12", "25-09-20"])
  );
  const [filterFavorite,   setFilterFavorite]   = useState(false);
  const [filterPrescTypes, setFilterPrescTypes] = useState<Set<PrescType>>(new Set());
  const [filterDiagnoses,  setFilterDiagnoses]  = useState<Set<string>>(new Set());
  const [filterVisitType,  setFilterVisitType]  = useState<"" | "초진" | "재진">("");
  const [filterClaimType,  setFilterClaimType]  = useState<string>("");
  const [filterInsType,    setFilterInsType]    = useState<string>("");

  // Diagnosis popover
  const [diagPopoverOpen, setDiagPopoverOpen] = useState(false);
  const [pendingDiag,     setPendingDiag]     = useState<Set<string>>(new Set());
  const [diagSearch,      setDiagSearch]      = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!diagPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setDiagPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [diagPopoverOpen]);

  // ── Helpers ──────────────────────────────────────────────
  const toggleStar = (id: string) => {
    setStarredDates(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePrescType = (t: PrescType) => {
    setFilterPrescTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };


  const openDiagPopover = () => {
    setPendingDiag(new Set(filterDiagnoses));
    setDiagSearch("");
    setDiagPopoverOpen(true);
  };

  const applyDiag = () => {
    setFilterDiagnoses(new Set(pendingDiag));
    setDiagPopoverOpen(false);
  };

  const toggleDiagnosis = (code: string) => {
    setFilterDiagnoses(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const resetFilters = () => {
    setFilterFavorite(false);
    setFilterPrescTypes(new Set());
    setFilterDiagnoses(new Set());
    setFilterVisitType("");
    setFilterClaimType("");
    setFilterInsType("");
    setPendingDiag(new Set());
    setDiagPopoverOpen(false);
  };

  const hasActiveFilters =
    filterFavorite
    || filterPrescTypes.size > 0
    || filterDiagnoses.size > 0
    || !!filterVisitType
    || !!filterClaimType
    || !!filterInsType;

  // ── Filtered visits ──────────────────────────────────────
  const filteredVisits = visitHistory.filter(v => {
    if (filterFavorite && !starredDates.has(v.id)) return false;
    if (filterPrescTypes.size > 0 && !v.prescTypes.some(t => filterPrescTypes.has(t))) return false;
    if (filterDiagnoses.size > 0 && !v.diagnoses.some(d => filterDiagnoses.has(d.code))) return false;
    if (filterVisitType && v.visitType !== filterVisitType) return false;
    if (filterInsType && v.insType !== filterInsType) return false;
    return true;
  });

  // ── Scroll sync ──────────────────────────────────────────
  const handleDateClick = (id: string) => {
    setActiveDate(id);
    const el = blockRefs.current[id];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const containerTop = scrollRef.current.getBoundingClientRect().top;
    let closest = filteredVisits[0]?.id ?? "";
    let minDist = Infinity;
    for (const v of filteredVisits) {
      const el = blockRefs.current[v.id];
      if (el) {
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (dist < minDist) { minDist = dist; closest = v.id; }
      }
    }
    setActiveDate(closest);
  };

  // Filtered diag options for search
  const filteredDiagOptions = diagnosisOptions.filter(d =>
    d.name.includes(diagSearch) || d.code.toLowerCase().includes(diagSearch.toLowerCase())
  );

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden">
      {/* Visit History Widget — no overflow-hidden so popover floats */}
      <div className="flex-1 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#DBDCDF] flex-shrink-0">
          <span className="text-[13px] font-bold text-[#292A2D] flex-shrink-0">내원이력</span>
          <div className="flex items-center gap-1 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-6 flex-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-[#989BA2] truncate">기록 검색 (상병/처방/의사)</span>
          </div>
          {/* 펼쳐보기 trigger */}
          <button
            onClick={openExpanded}
            className="flex items-center gap-1 text-[10px] text-[#453EDC] border border-[#453EDC]/40 bg-[#ECEEFF] rounded-[5px] px-1.5 h-6 whitespace-nowrap flex-shrink-0 hover:bg-[#E0DFFF]"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="#453EDC" strokeWidth="1.3"/>
            </svg>
            펼쳐보기
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex-shrink-0 border-b border-[#DBDCDF]">
          {/* Row 1 : 즐겨찾기 + 처방 타입 칩 */}
          <div className="flex items-center gap-1 px-3 pt-1.5 pb-1 flex-wrap">
            {/* 즐겨찾기 토글 */}
            <button
              onClick={() => setFilterFavorite(p => !p)}
              className={`flex items-center gap-1 text-[10px] rounded-[4px] px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                filterFavorite
                  ? "bg-[#FFF7E6] text-[#E08A00] border-[#FFD98A] font-bold"
                  : "bg-[#F7F7F8] text-[#70737C] border-[#DBDCDF]"
              }`}
            >
              {filterFavorite ? "★" : "☆"} 즐겨찾기
            </button>

            {/* 주 / 물 / 방 / 검 처방 타입 칩 */}
            {(["주", "물", "방", "검"] as PrescType[]).map(t => {
              const cfg = prescTypeConfig[t];
              const active = filterPrescTypes.has(t);
              return (
                <button
                  key={t}
                  onClick={() => togglePrescType(t)}
                  title={cfg.desc}
                  className={`w-7 h-[22px] text-[10px] font-bold rounded-[4px] border transition-colors flex-shrink-0 ${active ? cfg.active : cfg.inactive}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Row 2 : 초재진 / 청구구분 / 보험 (단일선택 드롭다운) */}
          <div className="px-3 pb-1.5 flex items-center gap-2 flex-wrap">
            {([
              { label: "초재진",   value: filterVisitType, setter: (v: string) => setFilterVisitType(v as "" | "초진" | "재진"), options: ["초진", "재진"] },
              { label: "청구구분", value: filterClaimType, setter: setFilterClaimType,                                              options: ["급여", "비급여", "본인부담"] },
              { label: "보험",     value: filterInsType,   setter: setFilterInsType,                                                options: ["건보", "일반", "자보", "산재"] },
            ]).map(({ label, value, setter, options }) => {
              const active = !!value;
              return (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-[10px] text-[#989BA2] flex-shrink-0">{label}</span>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className={`text-[10px] rounded-[4px] border px-1 py-0.5 cursor-pointer transition-colors focus:outline-none focus:border-[#453EDC] ${
                      active
                        ? "bg-[#453EDC] text-white border-[#453EDC]"
                        : "bg-[#F7F7F8] text-[#70737C] border-[#DBDCDF]"
                    }`}
                  >
                    <option value="">전체</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              );
            })}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-[#FF4242] ml-auto whitespace-nowrap"
              >
                ⟳ 초기화
              </button>
            )}
          </div>
        </div>

        {/* Body: left date chips + right records */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: Date Chips */}
          <div className="w-[70px] border-r border-[#DBDCDF] overflow-y-auto flex-shrink-0">
            {filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 px-2">
                <span className="text-[9px] text-[#989BA2] text-center">조건에 맞는 내원이력 없음</span>
              </div>
            ) : (
              filteredVisits.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleDateClick(v.id)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 cursor-pointer border-b border-[#DBDCDF] ${
                    activeDate === v.id ? "bg-white" : "bg-[#F7F7F8]"
                  }`}
                >
                  {activeDate === v.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#453EDC] rounded-r-sm" />
                  )}
                  {/* Star icon top-right */}
                  <button
                    className="absolute top-0.5 right-0.5 leading-none transition-colors"
                    style={{ fontSize: "9px", lineHeight: 1 }}
                    onClick={e => { e.stopPropagation(); toggleStar(v.id); }}
                  >
                    <span style={{ color: starredDates.has(v.id) ? "#FF7B2E" : "#C2C4C8" }}>
                      {starredDates.has(v.id) ? "★" : "☆"}
                    </span>
                  </button>
                  <span className={`text-[10px] font-medium leading-tight mt-1 ${activeDate === v.id ? "text-[#292A2D]" : "text-[#989BA2]"}`}>
                    {v.date}
                  </span>
                  <span
                    className={`text-[8px] mt-0.5 rounded-[2px] px-1 py-0.5 ${
                      v.visitType === "재진" ? "bg-[#FFF1D1] text-[#A67300]" : "bg-[#EAF2FE] text-[#3385FF]"
                    }`}
                  >
                    {v.visitType}
                  </span>
                  {/* prescType dots */}
                  {v.prescTypes.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {v.prescTypes.map(pt => (
                        <span
                          key={pt}
                          className={`text-[7px] font-bold rounded-sm px-0.5 leading-[12px] ${
                            pt === "주" ? "bg-[#FEECEC] text-[#FF4242]"
                            : pt === "물" ? "bg-[#F1EDFF] text-[#6541F2]"
                            : pt === "방" ? "bg-[#FFF1E0] text-[#FF7B2E]"
                            : "bg-[#EDF8EF] text-[#4EAD0A]"
                          }`}
                        >{pt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right: Visit Records */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            {filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <span className="text-[28px] opacity-30">🔍</span>
                <span className="text-[11px] text-[#989BA2]">필터 조건에 맞는 내원이력이 없습니다</span>
                <button onClick={resetFilters} className="text-[10px] text-[#453EDC] underline">필터 초기화</button>
              </div>
            ) : (
              filteredVisits.map(v => (
                <div
                  key={v.id}
                  ref={el => { blockRefs.current[v.id] = el; }}
                  className={`border-b border-[#DBDCDF] ${activeDate === v.id ? "bg-white" : "bg-[#F4F5F9]"}`}
                >
                  {/* ── Visit Summary Header (클릭 → 전체 리피트) ── */}
                  <div
                    className={`flex items-center gap-1 flex-wrap px-2 py-1.5 border-b cursor-pointer group ${
                      activeDate === v.id
                        ? "border-[#DBDCDF] bg-[#F7F8FC] hover:bg-[#EDFFF4]"
                        : "border-[#E8E9EE] bg-[#ECEEF4] hover:bg-[#E4F5E8]"
                    }`}
                    onClick={() => onRepeatAll(v.diagnoses, v.prescriptions)}
                    title="전체 리피트 (진단 + 처방)"
                  >
                    <span className={`text-[11px] font-bold ${activeDate === v.id ? "text-[#292A2D]" : "text-[#989BA2]"}`}>{v.date}</span>
                    {v.time && <span className={`text-[10px] ${activeDate === v.id ? "text-[#70737C]" : "text-[#C2C4C8]"}`}>{v.time}</span>}
                    <span className={`text-[9px] rounded-[2px] px-1 py-0.5 ${v.visitType === "재진" ? "bg-[#FFF1D1] text-[#A67300]" : "bg-[#EAF2FE] text-[#3385FF]"}`}>{v.visitType}</span>
                    <span className="text-[9px] bg-[#F7F7F8] text-[#70737C] rounded-[2px] px-1 py-0.5">{v.insType}</span>
                    {v.special && <span className="text-[9px] bg-[#EDF8EF] text-[#2EA652] rounded-[2px] px-1 py-0.5">{v.special}</span>}
                    {v.prescTypes.map(pt => (
                      <span key={pt} className={`text-[8px] font-bold rounded-[2px] px-1 py-0.5 ${
                        pt === "주" ? "bg-[#FEECEC] text-[#FF4242]"
                        : pt === "물" ? "bg-[#F1EDFF] text-[#6541F2]"
                        : pt === "방" ? "bg-[#FFF1E0] text-[#FF7B2E]"
                        : "bg-[#EDF8EF] text-[#4EAD0A]"
                      }`}>{prescTypeConfig[pt].desc}</span>
                    ))}
                    {v.imageCount && v.imageCount > 0 ? (
                      <span className="flex items-center gap-0.5 bg-[#F0F2F8] border border-[#D0D4E8] rounded-[3px] px-1 py-0.5">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="#6B7BB0" strokeWidth="1.2"/>
                          <circle cx="4.5" cy="5.5" r="1" fill="#6B7BB0"/>
                          <path d="M1.5 10L4.5 7L6.5 9L9 6.5L12.5 10" stroke="#6B7BB0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[9px] font-medium text-[#6B7BB0]">{v.imageCount}</span>
                      </span>
                    ) : null}
                    {starredDates.has(v.id) && <span className="text-[10px]" style={{ color: "#FF7B2E" }}>★</span>}
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-[9px] text-[#2EA652] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 whitespace-nowrap">↩ 전체 리피트</span>
                      {v.amount && <span className={`text-[10px] font-medium ${activeDate === v.id ? "text-[#292A2D]" : "text-[#C2C4C8]"}`}>{v.amount}</span>}
                    </div>
                  </div>

                  {/* ── Symptom + Diagnoses ── */}
                  <div className="px-2 pt-1.5 pb-1">
                    {/* Symptom */}
                    <div className={`text-[10px] mb-1.5 leading-[15px] line-clamp-2 ${activeDate === v.id ? "text-[#46474C]" : "text-[#989BA2]"}`}>
                      <span className="font-medium">증상: </span>{v.symptom}
                    </div>
                    {/* Diagnoses */}
                    {v.diagnoses.length > 0 && (
                      <>
                        {/* 진단 section header — 클릭 → 진단 전체 리피트 */}
                        <div
                          className="flex items-center justify-between mb-0.5 cursor-pointer group/dxhdr hover:bg-[#F0FFF4] rounded-sm px-0.5 -mx-0.5"
                          onClick={e => { e.stopPropagation(); onRepeatDx(v.diagnoses); }}
                          title="진단 전체 리피트"
                        >
                          <span className="text-[9px] font-medium text-[#989BA2]">진단</span>
                          <span className="text-[9px] text-[#2EA652] opacity-0 group-hover/dxhdr:opacity-100">↩ 진단</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {v.diagnoses.map(d => (
                            <div
                              key={d.code}
                              className="flex gap-1 text-[10px] cursor-pointer hover:bg-[#F0FFF4] rounded-sm px-0.5 group/dxrow"
                              onClick={e => { e.stopPropagation(); onRepeatDx([d]); }}
                              title={`${d.code} 리피트`}
                            >
                              <span className={`font-medium flex-shrink-0 ${activeDate === v.id ? "text-[#453EDC]" : "text-[#C2C4C8]"}`}>{d.code}</span>
                              <span className={`truncate max-w-[110px] ${activeDate === v.id ? "text-[#292A2D]" : "text-[#989BA2]"}`}>{d.name}</span>
                              <span className="text-[#2EA652] opacity-0 group-hover/dxrow:opacity-100 flex-shrink-0">↩</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── Prescription Table ── */}
                  {v.prescriptions.length > 0 && (
                    <div className={`border-t ${activeDate === v.id ? "border-[#DBDCDF]" : "border-[#E4E5EB]"}`}>
                      {/* 처방 section header — 클릭 → 처방 전체 리피트 */}
                      <div
                        className={`flex items-center justify-between px-2 py-0.5 cursor-pointer group/rxhdr ${
                          activeDate === v.id ? "bg-[#F3F4F9] hover:bg-[#EDFFF4]" : "bg-[#EAEBF0] hover:bg-[#E4F5E8]"
                        }`}
                        onClick={e => { e.stopPropagation(); onRepeatRx(v.prescriptions); }}
                        title="처방 전체 리피트"
                      >
                        <span className="text-[9px] font-medium text-[#989BA2]">처방</span>
                        <span className="text-[9px] text-[#2EA652] opacity-0 group-hover/rxhdr:opacity-100">↩ 처방</span>
                      </div>
                      {/* Table Column Header */}
                      <div
                        className={`grid px-2 py-1 border-b ${activeDate === v.id ? "bg-[#F3F4F9] border-[#DBDCDF]" : "bg-[#EAEBF0] border-[#E0E1E7]"}`}
                        style={{ gridTemplateColumns: "1fr 22px 20px 22px 30px 40px" }}
                      >
                        {[["처방명","left"],["용량","center"],["일투","center"],["일수","center"],["용법","center"],["단가","right"]].map(([label, align]) => (
                          <span key={label} className={`text-[9px] font-medium text-[#989BA2] text-${align}`}>{label}</span>
                        ))}
                      </div>
                      {/* Rows — 클릭 → 개별 리피트 */}
                      {v.prescriptions.map((p, i) => (
                        <div
                          key={p.name + i}
                          className={`grid items-center px-2 py-1 border-b relative cursor-pointer group/rxrow ${
                            activeDate === v.id
                              ? "border-[#F0F0F4] bg-white hover:bg-[#F0FFF4]"
                              : "border-[#E4E5EB] bg-[#F4F5F9] hover:bg-[#E8F5EC]"
                          }`}
                          style={{ gridTemplateColumns: "1fr 22px 20px 22px 30px 40px" }}
                          onClick={e => { e.stopPropagation(); onRepeatRx([p]); }}
                          title={`${p.name} 리피트`}
                        >
                          <span className={`text-[10px] truncate ${activeDate === v.id ? "text-[#292A2D]" : "text-[#989BA2]"}`}>{p.name}</span>
                          <span className={`text-[10px] text-center ${activeDate === v.id ? "text-[#46474C]" : "text-[#C2C4C8]"}`}>{p.dose}</span>
                          <span className={`text-[10px] text-center ${activeDate === v.id ? "text-[#46474C]" : "text-[#C2C4C8]"}`}>{p.freq}</span>
                          <span className={`text-[10px] text-center ${activeDate === v.id ? "text-[#46474C]" : "text-[#C2C4C8]"}`}>{p.days}</span>
                          <span className={`text-[9px] text-center ${activeDate === v.id ? "text-[#70737C]" : "text-[#C2C4C8]"}`}>{p.method ?? "경구"}</span>
                          <span className={`text-[10px] text-right ${activeDate === v.id ? "text-[#292A2D]" : "text-[#C2C4C8]"}`}>{p.price.toLocaleString()}</span>
                          {/* hover ↩ overlay */}
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[#2EA652] opacity-0 group-hover/rxrow:opacity-100 pointer-events-none">↩</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Note ── */}
                  {v.note && (
                    <div className={`text-[10px] italic px-2 py-1.5 ${activeDate === v.id ? "text-[#70737C]" : "text-[#C2C4C8]"}`}>
                      · {v.note}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* 내원이력 펼쳐보기 — portal로 #emr-left-panels에 렌더링 */}
      {isExpanded && (() => {
        const target = document.getElementById("emr-left-panels");
        if (!target) return null;
        return createPortal(
          <EMRExpandedHistory
            filteredVisits={filteredVisits}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            starredDates={starredDates}
            onToggleStar={toggleStar}
            filterFavorite={filterFavorite}
            setFilterFavorite={setFilterFavorite}
            filterPrescTypes={filterPrescTypes}
            togglePrescType={togglePrescType}
            filterDiagnoses={filterDiagnoses}
            applyDiagnoses={setFilterDiagnoses}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            onClose={() => setIsExpanded(false)}
            onRepeatDx={onRepeatDx}
            onRepeatRx={onRepeatRx}
            onRepeatAll={onRepeatAll}
            onAddSymptom={onAddSymptom}
          />,
          target
        );
      })()}
    </div>
  );
}