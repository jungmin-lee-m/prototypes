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
  /** 삭감 기록 (있을 때만) */
  deduction?: {
    reason: string;       // 삭감 사유 한 줄
    amount?: number;      // 삭감 금액
    details: string;      // 2-3줄 상세 (\n 줄바꿈 포함)
  };
  /** 오늘 편집중인 차트 — 저장 전 임시 상태. 내원이력 최상단에 노출. */
  isDraft?: boolean;
};

// 오늘 편집중인 차트 — 내원이력 최상단에 노출. 저장 전이라 헤더 정보만 표시.
const todayDraftVisit: VisitRecord = {
  id: "draft-today",
  date: "26-05-08",
  visitType: "재진",
  insType: "직장",
  tags: [],
  prescTypes: [],
  symptom: "",
  diagnoses: [],
  prescriptions: [],
  isDraft: true,
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
    deduction: {
      reason: "병용금기 약물 처방",
      amount: 4500,
      details: "아스피린·히드로클로로티아지드 병용 시 신독성 위험 — 처방 사유 미기재로 삭감.\n재청구 시 임상소견 첨부 필요.",
    },
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
    deduction: {
      reason: "검사 빈도 초과",
      amount: 12000,
      details: "동일 알러젠 IgE 검사 6개월 내 중복 — 사전심사 기준 초과로 2건 삭감.\n환자 요청 검사 사유서 보완 필요.",
    },
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
  주: { label: "주", desc: "주사",     active: "bg-[var(--red-500)] text-white border-[var(--red-500)]",    inactive: "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border-[var(--red-200)]" },
  물: { label: "물", desc: "물리치료", active: "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]",    inactive: "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--blue-200)]" },
  방: { label: "방", desc: "방사선",   active: "bg-[var(--orange-500)] text-white border-[var(--orange-500)]",    inactive: "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-500)] border-[var(--orange-200)]" },
  검: { label: "검", desc: "검사",     active: "bg-[var(--green-500)] text-white border-[var(--green-500)]",    inactive: "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)] border-[var(--green-200)]"  },
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
  const [deductionPopoverId, setDeductionPopoverId] = useState<string | null>(null);

  // 내원일 우클릭 컨텍스트 메뉴 — 현재 차트의 삼점메뉴와 동일 액션 노출
  const [visitContextMenu, setVisitContextMenu] = useState<{ x: number; y: number; visitId: string } | null>(null);

  // 외부 클릭 / Esc / 스크롤 시 우클릭 메뉴 닫기
  useEffect(() => {
    if (!visitContextMenu) return;
    const close = () => setVisitContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [visitContextMenu]);

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

  // Close 삭감 popover on outside click
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
  // 과거 내원 — 필터 적용
  const filteredPastVisits = visitHistory.filter(v => {
    if (filterFavorite && !starredDates.has(v.id)) return false;
    if (filterPrescTypes.size > 0 && !v.prescTypes.some(t => filterPrescTypes.has(t))) return false;
    if (filterDiagnoses.size > 0 && !v.diagnoses.some(d => filterDiagnoses.has(d.code))) return false;
    if (filterVisitType && v.visitType !== filterVisitType) return false;
    if (filterInsType && v.insType !== filterInsType) return false;
    return true;
  });
  // 오늘 편집중인 차트는 항상 최상단에 노출 (필터링 대상 아님)
  const filteredVisits = [todayDraftVisit, ...filteredPastVisits];

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
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-[13px] font-bold text-[var(--text-main)] flex-shrink-0">내원이력</span>
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-6 flex-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-[var(--text-tertiary)] truncate">기록 검색 (상병/처방/의사)</span>
          </div>
          {/* 펼쳐보기 trigger */}
          <button
            onClick={openExpanded}
            className="flex items-center gap-1 text-[10px] text-[var(--brand-primary)] border border-[var(--brand-primary)]/40 bg-[var(--bg-primary-subtle)] rounded-[5px] px-1.5 h-6 whitespace-nowrap flex-shrink-0 hover:bg-[var(--blue-100)]"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="var(--brand-primary)" strokeWidth="1.3"/>
            </svg>
            펼쳐보기
          </button>
        </div>

        {/* ── Filter Bar — 한 줄 (즐겨찾기 + 주물방검 + 초재진/청구구분/보험 + 초기화) ── */}
        <div className="flex-shrink-0 border-b border-[var(--line-default)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 flex-wrap">
            {/* 즐겨찾기 토글 */}
            <button
              onClick={() => setFilterFavorite(p => !p)}
              className={`flex items-center gap-1 text-[10px] rounded-[4px] px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                filterFavorite
                  ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-200)] font-bold"
                  : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-default)]"
              }`}
            >
              {filterFavorite ? "★" : "☆"} 즐겨찾기
            </button>

            {/* 주 / 물 / 방 / 검 처방 타입 칩 */}
            <div className="flex items-center gap-1">
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

            {/* 구분선 */}
            <div className="h-4 w-px bg-[var(--line-default)] flex-shrink-0" />

            {/* 초재진 / 청구구분 / 보험 (단일선택 드롭다운) */}
            {([
              { label: "초재진",   value: filterVisitType, setter: (v: string) => setFilterVisitType(v as "" | "초진" | "재진"), options: ["초진", "재진"] },
              { label: "청구구분", value: filterClaimType, setter: setFilterClaimType,                                              options: ["급여", "비급여", "본인부담"] },
              { label: "보험",     value: filterInsType,   setter: setFilterInsType,                                                options: ["건보", "일반", "자보", "산재"] },
            ]).map(({ label, value, setter, options }) => {
              const active = !!value;
              return (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0">{label}</span>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className={`text-[10px] rounded-[4px] border px-1 py-0.5 cursor-pointer transition-colors focus:outline-none focus:border-[var(--brand-primary)] ${
                      active
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-default)]"
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
                className="text-[10px] text-[var(--red-500)] ml-auto whitespace-nowrap"
              >
                ⟳ 초기화
              </button>
            )}
          </div>
        </div>

        {/* Body: left date chips + right records */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: Date Chips — 컴팩트 (재 검 주 한줄) */}
          <div className="w-[60px] border-r border-[var(--line-default)] overflow-y-auto flex-shrink-0">
            {filteredVisits.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleDateClick(v.id)}
                  className={`relative px-1 py-1 cursor-pointer border-b border-[var(--line-default)] ${
                    v.isDraft
                      ? "bg-[var(--bg-primary-subtle)] border-l-[3px] border-l-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)]"
                      : "bg-white hover:bg-[var(--bg-subtle)]"
                  }`}
                  title={v.isDraft ? "오늘 편집중인 차트" : undefined}
                >
                  {activeDate === v.id && !v.isDraft && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)]" />
                  )}
                  {/* Star — absolute top-right (날짜 줄바꿈 방지). draft 는 별 미노출 */}
                  {!v.isDraft && (
                    <button
                      onClick={e => { e.stopPropagation(); toggleStar(v.id); }}
                      className="absolute top-0 right-0 leading-none text-[8px] p-0.5"
                    >
                      <span style={{ color: starredDates.has(v.id) ? "var(--orange-500)" : "var(--text-disabled)" }}>
                        {starredDates.has(v.id) ? "★" : "☆"}
                      </span>
                    </button>
                  )}
                  {/* Date — 한 줄 강제 */}
                  <span className={`block text-[10px] font-bold leading-none whitespace-nowrap pr-3 ${v.isDraft ? "text-[var(--brand-primary)]" : "text-[var(--text-main)]"}`}>{v.date}</span>
                  {/* visitType (재/초) + prescTypes 한 줄 */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-[8px] font-bold rounded-[2px] px-1 leading-[13px] bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-[var(--line-default)]">{v.visitType[0]}</span>
                    {v.prescTypes.map(pt => (
                      <span
                        key={pt}
                        className={`text-[8px] font-bold rounded-[2px] px-1 leading-[13px] ${
                          pt === "주" ? "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)]"
                          : pt === "물" ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]"
                          : pt === "방" ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-500)]"
                          : "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)]"
                        }`}
                      >{pt}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Right: Visit Records */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            {filteredVisits.map(v => (
                <div
                  key={v.id}
                  ref={el => { blockRefs.current[v.id] = el; }}
                  className={`bg-white relative ${
                    v.isDraft
                      ? "rounded-md shadow-[inset_0_0_0_2px_var(--brand-primary)] mb-2"
                      : "border-b-[3px] border-[var(--bg-neutral)]"
                  }`}
                >
                  {activeDate === v.id && !v.isDraft && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] z-10" />
                  )}
                  {/* ── Visit Summary Header (클릭 → 전체 리피트, 우클릭 → 컨텍스트 메뉴) ── */}
                  <div
                    className={`flex items-center gap-1 flex-wrap px-2 py-1.5 group ${
                      v.isDraft
                        ? "bg-[var(--bg-primary-subtle)] cursor-default"
                        : "border-b border-[var(--line-default)] bg-[var(--bg-subtle)] cursor-pointer hover:bg-[var(--status-success-bg-subtle)]"
                    }`}
                    onClick={v.isDraft ? undefined : () => onRepeatAll(v.diagnoses, v.prescriptions)}
                    onContextMenu={v.isDraft ? undefined : e => {
                      e.preventDefault();
                      setVisitContextMenu({ x: e.clientX, y: e.clientY, visitId: v.id });
                    }}
                    title={v.isDraft ? "오늘 편집중인 차트 (저장 전)" : "클릭: 전체 리피트 / 우클릭: 차트 액션"}
                  >
                    {/* 편집중 배지 — draft일 때만 노출 */}
                    {v.isDraft && (
                      <span className="text-[9px] font-bold rounded-[3px] px-1.5 py-0.5 bg-[var(--brand-primary)] text-white whitespace-nowrap mr-0.5">
                        편집중
                      </span>
                    )}
                    <span className={`text-[11px] font-bold ${v.isDraft ? "text-[var(--brand-primary)]" : "text-[var(--text-main)]"}`}>{v.date}</span>
                    {v.time && <span className="text-[10px] text-[var(--text-sub)]">{v.time}</span>}
                    <span className="text-[9px] rounded-[2px] px-1 py-0.5 bg-white text-[var(--text-sub)] border border-[var(--line-default)]">{v.visitType[0]}</span>
                    <span className="text-[9px] bg-white text-[var(--text-sub)] border border-[var(--line-default)] rounded-[2px] px-1 py-0.5">{v.insType}</span>
                    {v.special && <span className="text-[9px] bg-[var(--status-success-bg-subtle)] text-[var(--green-500)] rounded-[2px] px-1 py-0.5">{v.special}</span>}
                    {v.prescTypes.map(pt => (
                      <span key={pt} className={`text-[8px] font-bold rounded-[2px] px-1 py-0.5 ${
                        pt === "주" ? "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)]"
                        : pt === "물" ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]"
                        : pt === "방" ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-500)]"
                        : "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)]"
                      }`}>{pt}</span>
                    ))}
                    {v.imageCount && v.imageCount > 0 ? (
                      <span className="flex items-center gap-0.5 bg-[var(--blue-050)] border border-[var(--blue-200)] rounded-[3px] px-1 py-0.5">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="var(--blue-700)" strokeWidth="1.2"/>
                          <circle cx="4.5" cy="5.5" r="1" fill="var(--blue-700)"/>
                          <path d="M1.5 10L4.5 7L6.5 9L9 6.5L12.5 10" stroke="var(--blue-700)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[9px] font-medium text-[var(--blue-700)]">{v.imageCount}</span>
                      </span>
                    ) : null}
                    {starredDates.has(v.id) && <span className="text-[10px]" style={{ color: "var(--orange-500)" }}>★</span>}
                    {/* 삭감 기록 인디케이터 */}
                    {v.deduction && (
                      <div className="relative">
                        <button
                          data-deduction-trigger
                          onClick={e => {
                            e.stopPropagation();
                            setDeductionPopoverId(prev => prev === v.id ? null : v.id);
                          }}
                          title="삭감 기록 보기"
                          className="flex items-center gap-0.5 text-[9px] font-bold bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border border-[var(--red-200)] rounded-[3px] px-1 py-0.5 hover:bg-[var(--red-100)]"
                        >
                          <span className="leading-none">⚠</span>
                          <span>삭감</span>
                        </button>
                        {deductionPopoverId === v.id && (
                          <div
                            data-deduction-popover
                            onClick={e => e.stopPropagation()}
                            className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-[var(--red-200)] rounded-md shadow-lg p-2.5 z-50"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-[var(--red-700)]">⚠ 삭감 기록{typeof v.deduction.amount === "number" && ` — ${v.deduction.amount.toLocaleString()}원`}</span>
                              <button
                                onClick={e => { e.stopPropagation(); setDeductionPopoverId(null); }}
                                className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-main)]"
                              >✕</button>
                            </div>
                            <div className="text-[10px] font-medium text-[var(--text-main)] mb-1">{v.deduction.reason}</div>
                            <div className="text-[10px] text-[var(--text-sub)] leading-[15px] whitespace-pre-line">{v.deduction.details}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                      {!v.isDraft && (
                        <span className="text-[9px] text-[var(--green-500)] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 whitespace-nowrap">↩ 전체 리피트</span>
                      )}
                      {v.amount && <span className="text-[10px] font-medium text-[var(--text-main)]">{v.amount}</span>}
                    </div>
                  </div>

                  {/* draft (편집중) 차트는 헤더만 노출 — 아래 body는 저장 후 채워짐 */}
                  {!v.isDraft && (
                  <>
                  {/* ── Symptom (라벨 없이 본문만) ── */}
                  <div className="px-2 py-1.5 text-[10px] leading-[15px] text-[var(--text-sub)] line-clamp-2 border-b border-[var(--line-subtle)]">
                    {v.symptom}
                  </div>

                  {/* ── Diagnosis Table ── */}
                  {v.diagnoses.length > 0 && (
                    <div>
                      {/* 컬럼 헤더 */}
                      <div
                        className="grid px-2 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] gap-1"
                        style={{ gridTemplateColumns: "56px 1fr 28px 28px 22px 22px 50px" }}
                      >
                        {[["상병코드","left"],["명칭","left"],["의증","center"],["배제","center"],["좌","center"],["우","center"],["진료과","left"]].map(([label, align]) => (
                          <span key={label} className={`text-[9px] font-medium text-[var(--text-tertiary)] text-${align}`}>{label}</span>
                        ))}
                      </div>
                      {/* 행 */}
                      {v.diagnoses.map(d => (
                        <div
                          key={d.code}
                          className="grid items-center px-2 py-1 border-b border-[var(--line-subtle)] cursor-pointer hover:bg-[var(--status-success-bg-subtle)] relative group/dxrow gap-1"
                          style={{ gridTemplateColumns: "56px 1fr 28px 28px 22px 22px 50px" }}
                          onClick={e => { e.stopPropagation(); onRepeatDx([d]); }}
                          title={`${d.code} 리피트`}
                        >
                          <span className="text-[10px] font-medium text-[var(--text-main)]">{d.code}</span>
                          <span className="text-[10px] text-[var(--text-main)] truncate">{d.name}</span>
                          {/* 의증 / 배제 / 좌 / 우 — 빈 체크박스 */}
                          {["의증","배제","좌","우"].map(col => (
                            <div key={col} className="flex justify-center">
                              <div className="w-3 h-3 border border-[var(--line-default)] rounded-[2px]" />
                            </div>
                          ))}
                          <span className="text-[10px] text-[var(--text-sub)]">내과</span>
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--green-500)] opacity-0 group-hover/dxrow:opacity-100 pointer-events-none">↩</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Prescription Table (섹션 헤더 없이) ── */}
                  {v.prescriptions.length > 0 && (
                    <div>
                      {/* 컬럼 헤더 — 사용자코드/명칭/용량/일투/일수/용법/특정내역/청구/수납방법 */}
                      <div
                        className="grid px-2 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] gap-1"
                        style={{ gridTemplateColumns: "44px 1fr 22px 20px 22px 28px 40px 24px 56px" }}
                      >
                        {[["사용자코드","left"],["명칭","left"],["용량","center"],["일투","center"],["일수","center"],["용법","center"],["특정내역","left"],["청구","center"],["수납방법","left"]].map(([label, align]) => (
                          <span key={label} className={`text-[9px] font-medium text-[var(--text-tertiary)] text-${align} truncate`}>{label}</span>
                        ))}
                      </div>
                      {/* 행 */}
                      {v.prescriptions.map((p, i) => (
                        <div
                          key={p.name + i}
                          className="grid items-center px-2 py-1 border-b border-[var(--line-subtle)] cursor-pointer hover:bg-[var(--status-success-bg-subtle)] relative group/rxrow gap-1"
                          style={{ gridTemplateColumns: "44px 1fr 22px 20px 22px 28px 40px 24px 56px" }}
                          onClick={e => { e.stopPropagation(); onRepeatRx([p]); }}
                          title={`${p.name} 리피트`}
                        >
                          <span className="text-[10px] text-[var(--text-tertiary)] truncate">{p.code ?? ""}</span>
                          <span className="text-[10px] truncate text-[var(--text-main)]">{p.name}</span>
                          <span className="text-[10px] text-center text-[var(--text-sub)]">{p.dose}</span>
                          <span className="text-[10px] text-center text-[var(--text-sub)]">{p.freq}</span>
                          <span className="text-[10px] text-center text-[var(--text-sub)]">{p.days}</span>
                          <span className="text-[9px] text-center text-[var(--text-sub)]">{p.method ?? "경구"}</span>
                          <span className="text-[9px] text-[var(--orange-700)] truncate">{p.special ?? ""}</span>
                          <span className="text-[10px] text-center text-[var(--text-sub)]">{p.claim === false ? "" : "✓"}</span>
                          <span className="text-[9px] text-[var(--text-sub)] truncate">{p.payMethod ?? "보험가"}</span>
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--green-500)] opacity-0 group-hover/rxrow:opacity-100 pointer-events-none">↩</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Note ── */}
                  {v.note && (
                    <div className="text-[10px] italic px-2 py-1.5 text-[var(--text-sub)]">
                      · {v.note}
                    </div>
                  )}
                  </>
                  )}
                </div>
              ))}
            {/* 과거 내원이력 비어있을 때 — 필터 활성 시 안내, 비활성 시 안내 없음 (draft만 노출) */}
            {filteredPastVisits.length === 0 && hasActiveFilters && (
              <div className="flex flex-col items-center justify-center h-24 gap-1.5 mt-2">
                <span className="text-[20px] opacity-30">🔍</span>
                <span className="text-[11px] text-[var(--text-tertiary)]">필터 조건에 맞는 과거 내원이력이 없습니다</span>
                <button onClick={resetFilters} className="text-[10px] text-[var(--brand-primary)] underline">필터 초기화</button>
              </div>
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

      {/* ── 내원일 우클릭 컨텍스트 메뉴 (portal — 패널 클리핑 회피) ── */}
      {visitContextMenu && createPortal(
        <div
          className="fixed bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 min-w-[140px]"
          style={{
            top: visitContextMenu.y,
            left: visitContextMenu.x,
            zIndex: 9999,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* 1. 차트 열기 — 과거 차트 조회 (primary action) */}
          <button
            onClick={() => setVisitContextMenu(null)}
            className="w-full px-3 py-1.5 text-[12px] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] text-left"
          >
            차트 열기
          </button>

          <div className="h-px bg-[var(--line-default)] my-1" />

          {/* 2. 출력/조회 액션 */}
          {["차트 출력", "처방전 보기", "진료기록부 출력"].map(label => (
            <button
              key={label}
              onClick={() => setVisitContextMenu(null)}
              className="w-full px-3 py-1.5 text-[12px] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] text-left"
            >
              {label}
            </button>
          ))}

          <div className="h-px bg-[var(--line-default)] my-1" />

          {/* 3. 차트 삭제 — 파괴적 액션 (red) */}
          <button
            onClick={() => setVisitContextMenu(null)}
            className="w-full px-3 py-1.5 text-[12px] text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)] text-left"
          >
            차트 삭제
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}