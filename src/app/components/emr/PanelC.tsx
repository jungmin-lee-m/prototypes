import { useState, useRef, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { EMRExpandedHistory } from "./EMRExpandedHistory";
import type { HistoryDx, HistoryRx } from "./chartTypes";
import { PatientOverrideContext } from "./PanelB";
import { getMockPatientChart } from "./patientSearch";

// 내원이력 처방 분류 — PanelA 검사 동선과 일관성 유지.
//   주 = 주사
//   영 = 영상 (X선·CT·MRI)
//   초 = 초음파
//   내 = 내시경
//   혈 = 검체 (혈액·소변)
//   기 = 기능검사 (EKG·폐기능·골밀도)
// 물리치료는 타겟 범위 밖이라 제거됨.
type PrescType = "주" | "영" | "초" | "내" | "혈" | "기";

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
    prescTypes: ["혈", "주"],
    amount: "₩83,000",
    imageCount: 3,
    symptom: "기침, 콧물, 발열 3일 전부터 지속. 목 통증 동반.",
    diagnoses: [
      { code: "J00", name: "급성비인두염" },
      { code: "J20.9", name: "급성 기관지염" },
    ],
    prescriptions: [
      { code: "done5",   name: "도네페질정 5mg",          dose: "1", freq: "1", days: 3,  price: 2000, method: "경구" },
      { code: "ambro",   name: "암브록솔염산염시럽",        dose: "1", freq: "3", days: 5,  price: 1800, method: "경구" },
      { code: "acet500", name: "아세트아미노펜정 500mg",    dose: "2", freq: "3", days: 5,  price: 300,  method: "경구" },
      { code: "chlor4",  name: "클로르페니라민정 4mg",      dose: "1", freq: "3", days: 5,  price: 400,  method: "경구" },
      { code: "dexi300", name: "덱시부프로펜정 300mg",      dose: "1", freq: "3", days: 5,  price: 600,  method: "경구" },
      { code: "pvg",     name: "포비돈요오드 가글액",        dose: "1", freq: "4", days: 5,  price: 500,  method: "외용" },
      { code: "cbc",     name: "전혈구검사(CBC)",           dose: "1", freq: "1", days: 1,  price: 9000,  method: "-" },
      { code: "crp",     name: "CRP",                     dose: "1", freq: "1", days: 1,  price: 3500,  method: "-" },
      { code: "xchest",  name: "흉부 X-ray",               dose: "1", freq: "1", days: 1,  price: 18500, method: "-" },
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
      { code: "telmi40", name: "텔미사르탄정 40mg",         dose: "1", freq: "1", days: 28, price: 1200, method: "경구" },
      { code: "amlo5",   name: "암로디핀베실산염정 5mg",     dose: "1", freq: "1", days: 28, price: 900,  method: "경구" },
      { code: "asp100",  name: "아스피린장용정 100mg",       dose: "1", freq: "1", days: 28, price: 300,  method: "경구" },
      { code: "rosu10",  name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
      { code: "hctz12",  name: "히드로클로로티아지드정 12.5mg", dose: "1", freq: "1", days: 28, price: 250, method: "경구" },
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
    prescTypes: ["주", "기"],
    amount: "₩55,000",
    symptom: "혈압·당뇨 정기 관리. 어지러움 호소.",
    diagnoses: [
      { code: "I10",   name: "본태성 고혈압" },
      { code: "E11.9", name: "제2형 당뇨병" },
    ],
    prescriptions: [
      { code: "metf500", name: "메트포르민염산염정 500mg",   dose: "1", freq: "2", days: 28, price: 600,  method: "경구" },
      { code: "rami5",   name: "라미프릴정 5mg",            dose: "1", freq: "1", days: 28, price: 1100, method: "경구" },
      { code: "telmi40", name: "텔미사르탄정 40mg",         dose: "1", freq: "1", days: 28, price: 1200, method: "경구" },
      { code: "glime2",  name: "글리메피리드정 2mg",         dose: "1", freq: "1", days: 28, price: 800,  method: "경구" },
      { code: "asp100",  name: "아스피린장용정 100mg",       dose: "1", freq: "1", days: 28, price: 300,  method: "경구" },
      { code: "rosu10",  name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
      { code: "ala300",  name: "알파리포산정 300mg",         dose: "1", freq: "2", days: 28, price: 950,  method: "경구" },
    ],
  },
  {
    id: "26-01-05",
    date: "26-01-05",
    time: "10:22",
    visitType: "재진",
    insType: "일반",
    tags: [],
    prescTypes: ["영"],
    amount: "₩28,000",
    symptom: "두통, 목 뻣뻣함 호소. 스트레스성으로 판단.",
    diagnoses: [{ code: "R51", name: "두통" }],
    prescriptions: [
      { code: "acet500", name: "아세트아미노펜정 500mg",     dose: "2", freq: "3", days: 3,  price: 300,  method: "경구" },
      { code: "ibu400",  name: "이부프로펜정 400mg",         dose: "1", freq: "3", days: 3,  price: 500,  method: "경구" },
      { code: "eti05",   name: "에티졸람정 0.5mg",           dose: "1", freq: "1", days: 7,  price: 1200, method: "경구" },
      { code: "tiza2",   name: "티자니딘염산염정 2mg",        dose: "1", freq: "2", days: 5,  price: 700,  method: "경구" },
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
      { code: "acet500", name: "아세트아미노펜정 500mg",     dose: "1", freq: "3", days: 5,  price: 300,  method: "경구" },
      { code: "mgox500", name: "마그네슘산화물정 500mg",      dose: "1", freq: "1", days: 30, price: 400,  method: "경구" },
      { code: "fol5",    name: "폴산정 5mg",                dose: "1", freq: "1", days: 30, price: 200,  method: "경구" },
      { code: "labe100", name: "라베탈롤정 100mg",           dose: "1", freq: "2", days: 28, price: 1800, method: "경구" },
    ],
  },
  {
    id: "25-09-20",
    date: "25-09-20",
    time: "09:45",
    visitType: "재진",
    insType: "건보",
    tags: ["검"],
    prescTypes: ["혈"],
    amount: "₩19,400",
    imageCount: 1,
    symptom: "알러지 검사 위해 내원. 페니실린·조영제 알러지 기왕력.",
    diagnoses: [{ code: "Z01.1", name: "알러지 검사" }],
    prescriptions: [
      { code: "ige-pen", name: "페니실린 IgE",     dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { code: "ige-con", name: "조영제 IgE",       dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { code: "ige-hdm", name: "집먼지진드기 IgE", dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { code: "ige-pol", name: "꽃가루 IgE",       dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
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
      { code: "chlor4",  name: "클로르페니라민정 4mg",       dose: "1", freq: "3", days: 3,  price: 400,  method: "경구" },
      { code: "acet500", name: "아세트아미노펜정 500mg",     dose: "2", freq: "3", days: 3,  price: 300,  method: "경구" },
      { code: "ambro30", name: "암브록솔염산염정 30mg",      dose: "1", freq: "3", days: 3,  price: 600,  method: "경구" },
      { code: "phen-d",  name: "페니레프린 코드롭 0.25%",    dose: "2", freq: "2", days: 5,  price: 800,  method: "점비" },
      { code: "rosu10",  name: "로수바스타틴정 10mg",        dose: "1", freq: "1", days: 28, price: 1500, method: "경구" },
    ],
  },
  {
    id: "25-06-20",
    date: "25-06-20",
    time: "10:10",
    visitType: "재진",
    insType: "일반",
    tags: [],
    prescTypes: ["영"],
    amount: "₩18,000",
    symptom: "두통 반복, 어지러움 동반. 편두통 추정.",
    diagnoses: [
      { code: "G43.9", name: "편두통" },
      { code: "E78.5", name: "고지혈증" },
    ],
    prescriptions: [
      { code: "suma50",  name: "수마트립탄정 50mg",          dose: "1", freq: "필요시", days: 10, price: 2800, method: "경구" },
      { code: "meto10",  name: "메토클로프라미드정 10mg",     dose: "1", freq: "필요시", days: 10, price: 300,  method: "경구" },
      { code: "prop20",  name: "프로프라놀롤정 20mg",         dose: "1", freq: "2",    days: 28, price: 400,  method: "경구" },
      { code: "napro275",name: "나프록센나트륨정 275mg",      dose: "2", freq: "2",    days: 5,  price: 650,  method: "경구" },
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
      { code: "amox500", name: "아목시실린캡슐 500mg",       dose: "1", freq: "3", days: 5,  price: 800,  method: "경구" },
      { code: "ibu400",  name: "이부프로펜정 400mg",         dose: "1", freq: "3", days: 5,  price: 500,  method: "경구" },
      { code: "beclo-n", name: "베클로메타손 비강 스프레이",  dose: "2", freq: "2", days: 7,  price: 4500, method: "흡입" },
      { code: "clari500",name: "클라리트로마이신정 500mg",    dose: "1", freq: "2", days: 7,  price: 2800, method: "경구" },
      { code: "ceti10",  name: "세티리진염산염정 10mg",       dose: "1", freq: "1", days: 7,  price: 350,  method: "경구" },
    ],
  },
  {
    id: "25-01-15",
    date: "25-01-15",
    time: "14:00",
    visitType: "재진",
    insType: "건보",
    tags: ["검"],
    prescTypes: ["혈"],
    amount: "₩62,000",
    symptom: "연간 건강검진.",
    diagnoses: [
      { code: "Z00.0", name: "일반 건강검진" },
      { code: "E11.9", name: "제2형 당뇨병" },
    ],
    prescriptions: [
      { code: "hba1c",   name: "HbA1c",          dose: "1", freq: "1", days: 1, price: 12000, method: "-" },
      { code: "ldlc",    name: "LDL 콜레스테롤",  dose: "1", freq: "1", days: 1, price: 8000,  method: "-" },
      { code: "egfr",    name: "eGFR",           dose: "1", freq: "1", days: 1, price: 6000,  method: "-" },
      { code: "glu",     name: "공복혈당",         dose: "1", freq: "1", days: 1, price: 4000,  method: "-" },
      { code: "tchol",   name: "총콜레스테롤",     dose: "1", freq: "1", days: 1, price: 5000,  method: "-" },
      { code: "u-sed",   name: "요침사검사",       dose: "1", freq: "1", days: 1, price: 3500,  method: "-" },
      { code: "ekg12",   name: "심전도검사",       dose: "1", freq: "1", days: 1, price: 8500,  method: "-" },
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
      { code: "omep20",  name: "오메프라졸캡슐 20mg",        dose: "1", freq: "1", days: 28, price: 650,  method: "경구" },
      { code: "mosa5",   name: "모사프리드정 5mg",           dose: "1", freq: "3", days: 28, price: 420,  method: "경구" },
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
  주: { label: "주", desc: "주사",       active: "bg-[var(--red-500)] text-white border-[var(--red-500)]",                    inactive: "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border-[var(--red-200)]" },
  영: { label: "영", desc: "영상",       active: "bg-[var(--orange-500)] text-white border-[var(--orange-500)]",              inactive: "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-200)]" },
  초: { label: "초", desc: "초음파",     active: "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]",        inactive: "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--blue-200)]" },
  내: { label: "내", desc: "내시경",     active: "bg-[var(--violet-500)] text-white border-[var(--violet-500)]",              inactive: "bg-[var(--violet-050)] text-[var(--violet-500)] border-[var(--violet-200)]" },
  혈: { label: "혈", desc: "검체",       active: "bg-[var(--red-700)] text-white border-[var(--red-700)]",                    inactive: "bg-[var(--status-error-bg-subtle)] text-[var(--red-700)] border-[var(--red-200)]" },
  기: { label: "기", desc: "기능검사",   active: "bg-[var(--green-500)] text-white border-[var(--green-500)]",                inactive: "bg-[var(--status-success-bg-subtle)] text-[var(--green-700)] border-[var(--green-200)]" },
};

// 내원이력 결과 컬럼 helpers — historyResult.ts 로 분리 (PanelC ↔ EMRExpandedHistory 순환 import 회피).
import { isProcedure, isLabRx, isImagingLab, labResultFor, rxSignalFor } from "./historyResult";

// ── Dock 레이아웃 전용 펼쳐보기 overlay ───────────────────────────
// DX_RX (진단 및 처방) 패널의 boundingRect 를 측정해 그 영역을 회피한 fixed positioning.
// DX_RX 가 패널 우측에 있는 일반적인 상황: overlay 는 viewport 좌측 ~ DX_RX.left 까지 확장.
// DX_RX 가 좌측에 있으면: overlay 는 DX_RX.right ~ viewport 우측 까지.
// DX_RX 가 마운트 안 됐거나 못 찾으면: viewport 전체로 폴백.
function DockExpandedHistoryOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  // overlay 영역 — viewport 기준 (fixed). DX_RX 위치 따라 동적 계산.
  const [box, setBox] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);

  useEffect(() => {
    const compute = () => {
      // dx-rx slice 패널 wrapper 의 rect 사용 — rc-dock 의 tab content 안쪽이므로 패널 영역과 일치.
      const dxRxEl = document.querySelector<HTMLElement>('[data-emr-dock-slice="dx-rx"]');
      const dxRect = dxRxEl?.getBoundingClientRect();
      // TopBar 아래부터 시작 (TopBar 가 sticky 상단). data-topbar 가 없으면 0.
      const topBarEl = document.querySelector<HTMLElement>('[data-emr-topbar]');
      const topOffset = topBarEl ? topBarEl.getBoundingClientRect().bottom : 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!dxRect) {
        setBox({ top: topOffset, left: 0, right: vw, bottom: vh });
        return;
      }
      // DX_RX 위치 판정 — 중심점이 viewport 좌측인지 우측인지로 결정.
      const dxCenterX = (dxRect.left + dxRect.right) / 2;
      if (dxCenterX > vw / 2) {
        // DX_RX 가 우측 → overlay 는 좌측 ~ DX_RX.left
        setBox({ top: topOffset, left: 0, right: dxRect.left, bottom: vh });
      } else {
        // DX_RX 가 좌측 → overlay 는 DX_RX.right ~ 우측
        setBox({ top: topOffset, left: dxRect.right, right: vw, bottom: vh });
      }
    };
    compute();
    window.addEventListener("resize", compute);
    // rc-dock layout 변화 — DockLayout 의 dock change 는 별도 이벤트가 아니라 DOM 변화로만 감지.
    // 가볍게 MutationObserver 로 dock root 의 자식 변화를 모니터링.
    const root = document.querySelector(".dock-layout") ?? document.body;
    const mo = new MutationObserver(compute);
    mo.observe(root, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener("resize", compute);
      mo.disconnect();
    };
  }, []);

  // Esc 닫기.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!box) return null;
  const width = Math.max(360, box.right - box.left);
  const height = Math.max(240, box.bottom - box.top);
  return (
    <div
      className="fixed bg-white shadow-2xl border border-[var(--line-default)] rounded-md overflow-hidden"
      style={{
        top: box.top,
        left: box.left,
        width,
        height,
        zIndex: 9000,
      }}
    >
      {/* EMRExpandedHistory 는 absolute inset-0 사용 — 이 wrapper 가 relative 컨테이너 역할.
          하지만 position:fixed 도 containing block 이 되므로 자연스럽게 inset-0 가 wrapper 에 맞춰진다. */}
      {children}
    </div>
  );
}

export function PanelC({
  onRepeatDx,
  onRepeatRx,
  onRepeatAll,
  onAddSymptom,
  onOpenLabViewer,
  onOpenPACS,
  embedded = false,
  dockMode = false,
  pastChartDate,
  pastChartEditing = false,
}: {
  onRepeatDx: (items: HistoryDx[]) => void;
  onRepeatRx: (items: HistoryRx[]) => void;
  onRepeatAll: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  onAddSymptom: (text: string) => void;
  // 검사 처방 행 액션 — 수치 검사 수치 클릭·소견검사 결과보기 → LabViewer 팝업 (자동 필터링).
  onOpenLabViewer?: (entry?: { date?: string; testName?: string }) => void;
  // 영상검사 (X-ray·CT·MRI·초음파·내시경) 결과보기 → PACS 뷰어 팝업.
  onOpenPACS?: (entry: { date: string; testName: string }) => void;
  // dock 레이아웃에서 탭 라벨로 식별되는 경우 헤더 숨김.
  embedded?: boolean;
  // dock 레이아웃 — 펼쳐보기 시 DX_RX 패널 회피 floating overlay 사용.
  dockMode?: boolean;
  // 직전차트 보기 모드 — 해당 날짜의 행을 강조. pastChartEditing 에 따라 "선택됨" 또는 "편집중".
  pastChartDate?: string;
  pastChartEditing?: boolean;
}) {
  const [activeDate, setActiveDate] = useState("26-03-12");
  // 직전차트 모드가 켜지면 해당 날짜로 activeDate 동기화.
  // activeDate 동기화는 effective 값으로 (context fallback 포함).
  // 단, isPastSelected/filteredVisits/배지 분기는 effective 값을 사용해야 dock 에서도 작동.
  // (effective 변수는 아래 useContext 직후에 선언되므로, 동기화 effect 는 거기서 처리)
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expand state
  const [isExpanded, setIsExpanded] = useState(false);

  // 의사가 직접 입력한 검사결과 저장소 — key: "${rx.code or name}@${visitDate}".
  // labResultFor 에서 pending 으로 분류된 검사를 의사가 입력하면 이 맵에 저장됨.
  // 입력된 값은 결과 컬럼에 인라인 텍스트로 표시됨 (수치형처럼).
  const [enteredResults, setEnteredResults] = useState<Record<string, string>>({});
  // 결과 입력 모달 — 어떤 검사·어떤 진료일에 입력할지 컨텍스트 보관.
  const [resultInput, setResultInput] = useState<{
    key: string;
    testName: string;
    visitDate: string;
  } | null>(null);
  const openResultInput = (key: string, testName: string, visitDate: string) =>
    setResultInput({ key, testName, visitDate });
  const closeResultInput = () => setResultInput(null);
  const saveEnteredResult = (key: string, value: string) => {
    if (!value.trim()) return;
    setEnteredResults(prev => ({ ...prev, [key]: value.trim() }));
    closeResultInput();
  };

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

  // ── 좌측 날짜칩 컬럼 폭 (드래그 리사이즈) ─────────────────────────
  // 기본 84px. 사용자가 분할 핸들을 끌어 78~180px 범위에서 조정 가능.
  // min 은 날짜(26-05-08) + 별표(☆/★) 가 한 줄에 겹치지 않고 들어갈 수 있는 최소 폭.
  const DATE_COL_MIN = 78;
  const DATE_COL_MAX = 180;
  const [dateColWidth, setDateColWidth] = useState(84);
  const [resizingDateCol, setResizingDateCol] = useState(false);
  // 드래그 시작 시점의 마우스 X 와 시작 width 를 기록 — mousemove 동안 delta 만 적용.
  const resizeStartRef = useRef<{ x: number; w: number } | null>(null);

  useEffect(() => {
    if (!resizingDateCol) return;
    const handleMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const dx = e.clientX - resizeStartRef.current.x;
      const next = Math.min(DATE_COL_MAX, Math.max(DATE_COL_MIN, resizeStartRef.current.w + dx));
      setDateColWidth(next);
    };
    const handleUp = () => setResizingDateCol(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [resizingDateCol]);

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

  // ── 환자별 visit dataset 선택 ───────────────────────────────
  // 기본 환자(황미진) → 내장 visitHistory. 검색에서 선택된 다른 환자 → getMockPatientChart(chartNo).
  // mock 이 없는 환자 → 빈 배열 (신환 느낌, "내원 이력 없음").
  const overridePatient = useContext(PatientOverrideContext);
  const activeVisitHistory: VisitRecord[] = (() => {
    if (!overridePatient) return visitHistory;
    const mock = getMockPatientChart(overridePatient.chartNo);
    if (!mock) return [];
    return mock.visits as VisitRecord[];
  })();
  // dock 레이아웃: prop 이 stale 일 수 있으므로 context fallback 으로 pastChart 정보 사용.
  const effectivePastChartDate = pastChartDate ?? overridePatient?.pastChart?.date;
  const effectivePastChartEditing = pastChartEditing || (overridePatient?.pastChart?.editing ?? false);
  // activeDate 동기화 — effective 값에 따라.
  useEffect(() => {
    if (effectivePastChartDate) setActiveDate(effectivePastChartDate);
  }, [effectivePastChartDate]);
  // 매칭 visit 행을 "선택됨" 또는 "편집중" 으로 강조.
  const isPastSelected = (visitId: string) => !!effectivePastChartDate && visitId === effectivePastChartDate;

  // ── Filtered visits ──────────────────────────────────────
  // 과거 내원 — 필터 적용
  const filteredPastVisits = activeVisitHistory.filter(v => {
    if (filterFavorite && !starredDates.has(v.id)) return false;
    if (filterPrescTypes.size > 0 && !v.prescTypes.some(t => filterPrescTypes.has(t))) return false;
    if (filterDiagnoses.size > 0 && !v.diagnoses.some(d => filterDiagnoses.has(d.code))) return false;
    if (filterVisitType && v.visitType !== filterVisitType) return false;
    if (filterInsType && v.insType !== filterInsType) return false;
    return true;
  });
  // 오늘 편집중인 차트는 일반적으로 최상단 노출.
  // pastChartDate 가 set 되면 (= 직전차트 보기 모드) draft 를 숨김 — 오늘 새로 시작한 편집은 없고,
  // 과거 차트만 선택된 상태이기 때문.
  const filteredVisits = effectivePastChartDate
    ? filteredPastVisits
    : [todayDraftVisit, ...filteredPastVisits];

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
        {/* Header — 컴팩트화 (py-2 → py-0.5, text-lg font-bold → text-sm font-medium).
            embedded 면 dock 탭 라벨로 식별되므로 타이틀 span 만 숨기고 search/펼쳐보기 는 유지. */}
        <div className="flex items-center gap-2 px-2 py-0.5 border-b border-[var(--line-default)] flex-shrink-0">
          {!embedded && (
            <span className="text-sm font-medium text-[var(--text-main)] flex-shrink-0">내원이력</span>
          )}
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-6 flex-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[var(--text-tertiary)] truncate">기록 검색 (상병/처방/의사)</span>
          </div>
          {/* 펼쳐보기 trigger */}
          <button
            onClick={openExpanded}
            className="flex items-center gap-1 text-xs text-[var(--brand-primary)] border border-[var(--brand-primary)]/40 bg-[var(--bg-primary-subtle)] rounded-[5px] px-1.5 h-6 whitespace-nowrap flex-shrink-0 hover:bg-[var(--blue-100)]"
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
            {/* 즐겨찾기 토글 — 별 아이콘만 (텍스트 라벨 생략, title 로 의미 보조) */}
            <button
              onClick={() => setFilterFavorite(p => !p)}
              title={filterFavorite ? "즐겨찾기 필터 끄기" : "즐겨찾기만 보기"}
              className={`w-5 h-5 text-xs rounded-[4px] border whitespace-nowrap transition-colors flex items-center justify-center ${
                filterFavorite
                  ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-200)] font-bold"
                  : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-default)]"
              }`}
            >
              {filterFavorite ? "★" : "☆"}
            </button>

            {/* 주 / 물 / 방 / 검 처방 타입 칩 — 상하좌우 dimension 축소 (28x22 → 22x18) */}
            <div className="flex items-center gap-0.5">
              {(["주", "영", "초", "내", "혈", "기"] as PrescType[]).map(t => {
                const cfg = prescTypeConfig[t];
                const active = filterPrescTypes.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => togglePrescType(t)}
                    title={cfg.desc}
                    className={`w-[22px] h-[18px] text-micro font-bold rounded-[3px] border transition-colors flex-shrink-0 flex items-center justify-center leading-none ${active ? cfg.active : cfg.inactive}`}
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
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{label}</span>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className={`text-xs rounded-[4px] border px-1 py-0.5 cursor-pointer transition-colors focus:outline-none focus:border-[var(--brand-primary)] ${
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
                className="text-xs text-[var(--red-500)] ml-auto whitespace-nowrap"
              >
                ⟳ 초기화
              </button>
            )}
          </div>
        </div>

        {/* Body: left date chips + right records — 사이의 핸들로 좌측 폭 드래그 조정 가능. */}
        <div className={`flex flex-1 overflow-hidden min-h-0 ${resizingDateCol ? "select-none cursor-col-resize" : ""}`}>
          {/* Left: Date Chips — 컴팩트 (재 검 주 한줄). 폭은 state(dateColWidth) 로 관리. */}
          <div
            style={{ width: dateColWidth }}
            className="overflow-y-auto flex-shrink-0"
          >
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
                  {/* Date + Star — 한 줄. 별표는 날짜 바로 오른쪽에 인라인 배치 (날짜와 겹침 방지) */}
                  <div className="flex items-center gap-1 leading-none whitespace-nowrap">
                    <span className={`text-xs font-bold ${v.isDraft ? "text-[var(--brand-primary)]" : "text-[var(--text-main)]"}`}>{v.date}</span>
                    {!v.isDraft && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleStar(v.id); }}
                        className="text-micro leading-none flex-shrink-0"
                      >
                        <span style={{ color: starredDates.has(v.id) ? "var(--orange-500)" : "var(--text-disabled)" }}>
                          {starredDates.has(v.id) ? "★" : "☆"}
                        </span>
                      </button>
                    )}
                  </div>
                  {/* visitType (재/초) + prescTypes 한 줄 — 과거차트는 모두 수행 완료 → 회색.
                      오늘 차트(draft) 만 컬러로 표시 (수행해야 할 처방). */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-micro font-bold rounded-[2px] px-1 leading-[13px] bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-[var(--line-default)]">{v.visitType[0]}</span>
                    {v.prescTypes.map(pt => (
                      <span
                        key={pt}
                        title={`${prescTypeConfig[pt].desc} — ${v.isDraft ? "수행 예정" : "수행 완료"}`}
                        className={`text-micro font-bold rounded-[2px] px-1 leading-[13px] ${
                          v.isDraft
                            ? prescTypeConfig[pt].inactive
                            : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]"
                        }`}
                      >{pt}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* ── 좌·우 폭 조절 핸들 ──
              4px 두께의 세로 strip — 호버/드래그 시 brand-primary 30%/50% 로 시각 단서.
              마우스다운 시점에 시작 마우스X·시작 width 를 기록 → mousemove 로 delta 적용.
              cursor-col-resize 로 어포던스. */}
          <div
            onMouseDown={(e) => {
              resizeStartRef.current = { x: e.clientX, w: dateColWidth };
              setResizingDateCol(true);
              e.preventDefault();
            }}
            title="좌측 날짜칩 컬럼 폭 조정"
            className={`w-1 flex-shrink-0 border-r border-[var(--line-default)] cursor-col-resize transition-colors ${
              resizingDateCol
                ? "bg-[var(--brand-primary)]/50"
                : "hover:bg-[var(--brand-primary)]/30"
            }`}
          />

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
                  // ring (outset box-shadow) 사용 — inset shadow 는 자식의 배경 (visit summary header,
                  // diagnoses/prescriptions sticky header) 에 가려져서 안 보임. ring 은 요소 바깥에 그려져
                  // 자식과 무관하게 항상 노출됨. rounded-md 와 함께 자연스럽게 둥근 모서리 따라감.
                  className={`bg-white relative ${
                    v.isDraft
                      ? "rounded-md ring-2 ring-[var(--brand-primary)] mb-2"
                      : isPastSelected(v.id)
                        ? "rounded-md ring-2 ring-[var(--brand-primary)] mb-2"
                        : "border-b-[3px] border-[var(--bg-neutral)]"
                  }`}
                >
                  {activeDate === v.id && !v.isDraft && !isPastSelected(v.id) && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-primary)] z-10" />
                  )}
                  {/* ── Visit Summary Header (클릭 → 전체 리피트, 우클릭 → 컨텍스트 메뉴) ── */}
                  <div
                    className={`flex items-center gap-1 flex-wrap px-2 py-1.5 group ${
                      v.isDraft
                        ? "bg-[var(--bg-primary-subtle)] cursor-default"
                        : isPastSelected(v.id)
                          ? "bg-[var(--bg-primary-subtle)] cursor-default"
                          : "border-b border-[var(--line-default)] bg-[var(--bg-subtle)] cursor-pointer hover:bg-[var(--status-success-bg-subtle)]"
                    }`}
                    onClick={v.isDraft || isPastSelected(v.id) ? undefined : () => onRepeatAll(v.diagnoses, v.prescriptions)}
                    onContextMenu={v.isDraft || isPastSelected(v.id) ? undefined : e => {
                      e.preventDefault();
                      setVisitContextMenu({ x: e.clientX, y: e.clientY, visitId: v.id });
                    }}
                    title={
                      v.isDraft ? "오늘 편집중인 차트 (저장 전)"
                      : isPastSelected(v.id) ? "직전차트 — 환자 검색에서 선택됨. 증상·진단/처방 클릭 시 편집 여부 확인."
                      : "클릭: 전체 리피트 / 우클릭: 차트 액션"
                    }
                  >
                    {/* 편집중 배지 — draft 또는 직전차트가 편집중 상태일 때 노출. */}
                    {(v.isDraft || (isPastSelected(v.id) && effectivePastChartEditing)) && (
                      <span className="text-micro font-bold rounded-[3px] px-1.5 py-0.5 bg-[var(--brand-primary)] text-white whitespace-nowrap mr-0.5">
                        편집중
                      </span>
                    )}
                    {/* 선택됨 배지 — 직전차트가 read-only (편집 전) 상태일 때만 노출. */}
                    {!v.isDraft && isPastSelected(v.id) && !effectivePastChartEditing && (
                      <span className="text-micro font-bold rounded-[3px] px-1.5 py-0.5 bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)] whitespace-nowrap mr-0.5">
                        선택됨
                      </span>
                    )}
                    <span className={`text-sm font-bold ${v.isDraft ? "text-[var(--brand-primary)]" : "text-[var(--text-main)]"}`}>{v.date}</span>
                    {v.time && <span className="text-xs text-[var(--text-sub)]">{v.time}</span>}
                    <span className="text-micro rounded-[2px] px-1 py-0.5 bg-white text-[var(--text-sub)] border border-[var(--line-default)]">{v.visitType[0]}</span>
                    <span className="text-micro bg-white text-[var(--text-sub)] border border-[var(--line-default)] rounded-[2px] px-1 py-0.5">{v.insType}</span>
                    {v.special && <span className="text-micro bg-[var(--status-success-bg-subtle)] text-[var(--green-500)] rounded-[2px] px-1 py-0.5">{v.special}</span>}
                    {v.prescTypes.map(pt => (
                      <span
                        key={pt}
                        title={`${prescTypeConfig[pt].desc} — ${v.isDraft ? "수행 예정" : "수행 완료"}`}
                        className={`text-micro font-bold rounded-[2px] px-1 py-0.5 ${
                          v.isDraft
                            ? prescTypeConfig[pt].inactive
                            : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]"
                        }`}>{pt}</span>
                    ))}
                    {v.imageCount && v.imageCount > 0 ? (
                      <span className="flex items-center gap-0.5 bg-[var(--blue-050)] border border-[var(--blue-200)] rounded-[3px] px-1 py-0.5">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="var(--blue-700)" strokeWidth="1.2"/>
                          <circle cx="4.5" cy="5.5" r="1" fill="var(--blue-700)"/>
                          <path d="M1.5 10L4.5 7L6.5 9L9 6.5L12.5 10" stroke="var(--blue-700)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-micro font-medium text-[var(--blue-700)]">{v.imageCount}</span>
                      </span>
                    ) : null}
                    {/* 검사결과보기 — 해당 내원일에 수치·소견 검사 (PACS 영상 제외) 가 1개 이상이면 노출.
                        클릭 시 LabViewer 팝업이 해당일 date 로 필터링된 채 열림.
                        영상 검사는 행의 [결과보기] 버튼 → PACS 로 분리되어 있음. */}
                    {!v.isDraft && v.prescriptions.some(rx => isLabRx(rx) && !isImagingLab(rx)) && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const fullDate = v.date.length === 8
                            ? `20${v.date}`.replace(/-/g, ".")
                            : v.date.replace(/-/g, ".");
                          onOpenLabViewer?.({ date: fullDate });
                        }}
                        title={`${v.date} 일자의 전체 검사결과 보기`}
                        className="h-5 px-1.5 text-micro font-bold rounded border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white hover:bg-[var(--bg-primary-subtle)] inline-flex items-center gap-0.5"
                      >
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        검사결과
                      </button>
                    )}
                    {starredDates.has(v.id) && <span className="text-xs" style={{ color: "var(--orange-500)" }}>★</span>}
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
                          className="flex items-center gap-0.5 text-micro font-bold bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border border-[var(--red-200)] rounded-[3px] px-1 py-0.5 hover:bg-[var(--red-100)]"
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
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                      {!v.isDraft && (
                        <span className="text-micro text-[var(--green-500)] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 whitespace-nowrap">↩ 전체 리피트</span>
                      )}
                      {v.amount && <span className="text-xs font-medium text-[var(--text-main)]">{v.amount}</span>}
                    </div>
                  </div>

                  {/* draft (편집중) 차트는 헤더만 노출 — 아래 body는 저장 후 채워짐 */}
                  {!v.isDraft && (
                  <>
                  {/* ── Symptom (라벨 없이 본문만) ── */}
                  <div className="px-2 py-1.5 text-xs leading-[15px] text-[var(--text-sub)] line-clamp-2 border-b border-[var(--line-subtle)]">
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
                          <span key={label} className={`text-micro font-medium text-[var(--text-tertiary)] text-${align}`}>{label}</span>
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
                          <span className="text-xs font-medium text-[var(--text-main)]">{d.code}</span>
                          <span className="text-xs text-[var(--text-main)] truncate">{d.name}</span>
                          {/* 의증 / 배제 / 좌 / 우 — 빈 체크박스 */}
                          {["의증","배제","좌","우"].map(col => (
                            <div key={col} className="flex justify-center">
                              <div className="w-3 h-3 border border-[var(--line-default)] rounded-[2px]" />
                            </div>
                          ))}
                          <span className="text-xs text-[var(--text-sub)]">내과</span>
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-micro text-[var(--green-500)] opacity-0 group-hover/dxrow:opacity-100 pointer-events-none">↩</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Prescription Table (섹션 헤더 없이) ── */}
                  {v.prescriptions.length > 0 && (
                    <div>
                      {/* 컬럼 헤더 — 사용자코드 60px / 명칭 minmax(80px, 1fr) /
                          수량(용량·일투·일수) 22px / 용법 26 / 특정 28 / 청구 16 / 결과 64 (수납방법 컬럼 대체). */}
                      <div
                        className="grid px-2 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] gap-0.5"
                        style={{ gridTemplateColumns: "46px minmax(60px,1fr) 22px 22px 22px 26px 28px 16px 64px" }}
                      >
                        {[["코드","left"],["명칭","left"],["용량","center"],["일투","center"],["일수","center"],["용법","center"],["특정","left"],["청","center"],["결과","left"]].map(([label, align]) => (
                          <span key={label} className={`text-micro font-medium text-[var(--text-tertiary)] text-${align} truncate`}>{label}</span>
                        ))}
                      </div>
                      {/* 행 */}
                      {v.prescriptions.map((p, i) => {
                        const labResult = labResultFor(p, v.date);
                        // 결과 입력 키 — 같은 약/검사여도 진료일별로 별도 저장
                        const resultKey = `${p.code ?? p.name}@${v.date}`;
                        const enteredVal = enteredResults[resultKey];
                        // 약·처치 신호 (검사 아닐 때만)
                        const rxSig = labResult ? null : rxSignalFor(p, v.date);
                        return (
                          <div
                            key={p.name + i}
                            className="grid items-center px-2 py-1 border-b border-[var(--line-subtle)] cursor-pointer hover:bg-[var(--status-success-bg-subtle)] relative group/rxrow gap-0.5"
                            style={{ gridTemplateColumns: "46px minmax(60px,1fr) 22px 22px 22px 26px 28px 16px 64px" }}
                            onClick={e => { e.stopPropagation(); onRepeatRx([p]); }}
                            title={`${p.name} 리피트`}
                          >
                            <span className="text-xs font-mono text-[var(--text-sub)] truncate" title={p.code ?? ""}>{p.code ?? ""}</span>
                            <span className="text-xs truncate text-[var(--text-main)]" title={p.name}>{p.name}</span>
                            <span className="text-xs text-center text-[var(--text-sub)] tabular-nums">{p.dose}</span>
                            <span className="text-xs text-center text-[var(--text-sub)] tabular-nums">{p.freq}</span>
                            <span className="text-xs text-center text-[var(--text-sub)] tabular-nums">{p.days}</span>
                            <span className="text-micro text-center text-[var(--text-sub)] truncate">{p.method ?? "경구"}</span>
                            <span className="text-micro text-[var(--orange-700)] truncate">{p.special ?? ""}</span>
                            <span className="text-xs text-center text-[var(--text-sub)]">{p.claim === false ? "" : "✓"}</span>

                            {/* 결과 컬럼 — 다목적 슬롯. 검사결과 정책 (2026-06):
                                  검사:
                                    numeric  → 수치 텍스트 (호버하면 전체 결과값 툴팁, 클릭 불가)
                                    finding  → 결과 요약 텍스트 (호버하면 전체 소견 툴팁, 클릭 불가)
                                    imaging  → 결과보기 버튼 → PACS 뷰어 (그대로)
                                    pending  → 결과 입력 (입력 모달)
                                  내원이력 행에서는 LabViewer 진입점 제거 — 대신 visit 헤더의 [검사결과보기] 버튼으로 통합.
                                  약·처치:
                                    dur      → ⚠ 칩 (병용/임부/연령 금기)
                                    new      → 🆕 신약/신처치 칩
                                    changed  → ↑/↓ 변경 칩
                                    procRound→ N회차 칩
                                  특이사항 없음 → 빈 셀 */}
                            {(() => {
                              // 검사 결과 분기
                              if (labResult) {
                                // v.date "26-05-08" → "2026.05.08" 변환 (LabViewer DATES 형식)
                                const fullDate = v.date.length === 8
                                  ? `20${v.date}`.replace(/-/g, ".")
                                  : v.date.replace(/-/g, ".");
                                // 의사가 직접 입력한 결과가 있으면 우선 표시 (pending 이었어도).
                                // 호버로 전체 값 노출, 클릭 불가 (read-only 텍스트).
                                if (enteredVal) {
                                  return (
                                    <span
                                      title={`${enteredVal} (직접 입력)`}
                                      className="text-xs text-[var(--text-main)] tabular-nums truncate w-full inline-flex items-center gap-0.5">
                                      <span className="w-1 h-1 rounded-full bg-[var(--green-500)] flex-shrink-0" title="직접 입력 표시" />
                                      {enteredVal}
                                    </span>
                                  );
                                }
                                if (labResult.kind === "numeric") {
                                  // 수치값 — 호버하면 풀 텍스트 (정상 범위 등) tooltip. 클릭 불가.
                                  return (
                                    <span
                                      title={labResult.display}
                                      className="text-xs text-[var(--text-main)] tabular-nums truncate w-full inline-block">
                                      {labResult.display}
                                    </span>
                                  );
                                }
                                if (labResult.kind === "finding") {
                                  // 소견 — 호버하면 전체 소견 tooltip. 클릭 불가.
                                  // labResult.display 가 "정상" / "이상소견 있음" 등 요약. tooltip 에 전체 텍스트.
                                  return (
                                    <span
                                      title={labResult.display}
                                      className="text-xs text-[var(--text-main)] truncate w-full inline-block">
                                      {labResult.display}
                                    </span>
                                  );
                                }
                                if (labResult.kind === "imaging") {
                                  return (
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        onOpenPACS?.({ date: fullDate, testName: p.name });
                                      }}
                                      title={`${p.name} PACS 뷰어 열기`}
                                      className="h-5 px-1.5 text-micro font-bold rounded border border-[var(--violet-500)] text-[var(--violet-500)] bg-white hover:bg-[var(--violet-050)] inline-flex items-center gap-0.5 justify-center whitespace-nowrap">
                                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                        <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                                        <path d="M3 6.5l1.5-1.5 1.5 1L8 4l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      결과보기
                                    </button>
                                  );
                                }
                                // pending — 의사가 직접 입력
                                return (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      openResultInput(resultKey, p.name, v.date);
                                    }}
                                    title={`${p.name} 결과 미입력 — 클릭하여 직접 입력`}
                                    className="h-5 px-1.5 text-micro font-bold rounded border border-[var(--orange-500)] text-[var(--orange-700)] bg-[var(--status-warning-bg-subtle)] hover:bg-[var(--orange-100)] inline-flex items-center gap-0.5 justify-center whitespace-nowrap">
                                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 10 L4 8 L8.5 3.5 L10.5 5.5 L6 10 L2 10 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                                    </svg>
                                    결과 입력
                                  </button>
                                );
                              }
                              // 약·처치 신호 분기 — 배경 없이 텍스트+컬러만 (시각 노이즈 최소화)
                              if (rxSig?.kind === "dur") {
                                return (
                                  <span
                                    title={`DUR ${rxSig.flavor} 금기`}
                                    className="text-micro font-bold text-[var(--red-700)] inline-flex items-center gap-0.5 whitespace-nowrap">
                                    <span>⚠</span>
                                    <span>{rxSig.flavor}</span>
                                  </span>
                                );
                              }
                              if (rxSig?.kind === "new") {
                                const isProc = isProcedure(p);
                                return (
                                  <span
                                    title={isProc ? "이 환자에게 처음 진행하는 시술 (이전 내원 이력 없음)" : "이 환자에게 처음 처방하는 약 (이전 내원 이력 없음)"}
                                    className="text-micro font-medium text-[var(--text-sub)] whitespace-nowrap">
                                    {isProc ? "첫 시술" : "첫 처방"}
                                  </span>
                                );
                              }
                              if (rxSig?.kind === "changed") {
                                return (
                                  <span
                                    title={`이전 처방 대비 변경: ${rxSig.label}`}
                                    className="text-micro font-bold text-[var(--orange-700)] inline-flex items-center whitespace-nowrap truncate">
                                    {rxSig.label}
                                  </span>
                                );
                              }
                              if (rxSig?.kind === "procRound") {
                                return (
                                  <span
                                    title={`이 시술의 누적 ${rxSig.round}회차`}
                                    className="text-micro font-bold text-[var(--brand-primary)] inline-flex items-center whitespace-nowrap">
                                    {rxSig.round}회차
                                  </span>
                                );
                              }
                              return <span />;
                            })()}

                            {/* 리피트 시각 단서 — 검사 결과·약 신호가 노출되지 않을 때만 호버 시 ↩ 노출 */}
                            {!labResult && !rxSig && (
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-micro text-[var(--green-500)] opacity-0 group-hover/rxrow:opacity-100 pointer-events-none">↩</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Note ── */}
                  {v.note && (
                    <div className="text-xs italic px-2 py-1.5 text-[var(--text-sub)]">
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
                <span className="text-sm text-[var(--text-tertiary)]">필터 조건에 맞는 과거 내원이력이 없습니다</span>
                <button onClick={resetFilters} className="text-xs text-[var(--brand-primary)] underline">필터 초기화</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 내원이력 펼쳐보기.
          - dockMode=false (Layout 1/1-a/2/3): portal → #emr-left-panels 컨테이너 내부 absolute inset-0.
          - dockMode=true: document.body 에 fixed floating overlay 로 렌더링.
            DX_RX (진단 및 처방) 탭의 boundingRect 를 측정해 해당 영역을 회피한다.
            예: DX_RX 가 우측에 있으면 overlay 는 left=0, right=DX_RX.left 로 좌측을 풀로 차지. */}
      {isExpanded && !dockMode && (() => {
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
            onOpenLabViewer={onOpenLabViewer}
            onOpenPACS={onOpenPACS}
            enteredResults={enteredResults}
            onOpenResultInput={openResultInput}
          />,
          target
        );
      })()}
      {isExpanded && dockMode && createPortal(
        <DockExpandedHistoryOverlay onClose={() => setIsExpanded(false)}>
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
            onOpenLabViewer={onOpenLabViewer}
            onOpenPACS={onOpenPACS}
            enteredResults={enteredResults}
            onOpenResultInput={openResultInput}
          />
        </DockExpandedHistoryOverlay>,
        document.body
      )}

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
            className="w-full px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)] text-left"
          >
            차트 열기
          </button>

          <div className="h-px bg-[var(--line-default)] my-1" />

          {/* 2. 출력/조회 액션 */}
          {["차트 출력", "처방전 보기", "진료기록부 출력"].map(label => (
            <button
              key={label}
              onClick={() => setVisitContextMenu(null)}
              className="w-full px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)] text-left"
            >
              {label}
            </button>
          ))}

          <div className="h-px bg-[var(--line-default)] my-1" />

          {/* 3. 차트 삭제 — 파괴적 액션 (red) */}
          <button
            onClick={() => setVisitContextMenu(null)}
            className="w-full px-3 py-1.5 text-md text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)] text-left"
          >
            차트 삭제
          </button>
        </div>,
        document.body
      )}

      {/* 검사결과 직접 입력 모달 — pending 검사의 "결과 입력" 버튼 클릭 시 오픈.
          저장 시 enteredResults 맵에 기록되어 그 행이 즉시 입력값으로 갱신됨. */}
      {resultInput && (
        <ResultInputModal
          key={resultInput.key}
          testName={resultInput.testName}
          visitDate={resultInput.visitDate}
          onCancel={closeResultInput}
          onSave={value => saveEnteredResult(resultInput.key, value)}
        />
      )}
    </div>
  );
}

// 검사결과 직접 입력 모달 — pending 검사 행에서 "결과 입력" 버튼으로 진입.
// 간단한 입력 — 텍스트 1줄 + 비고 textarea. backdrop 클릭 또는 취소로 닫힘.
function ResultInputModal({
  testName,
  visitDate,
  onCancel,
  onSave,
}: {
  testName: string;
  visitDate: string;
  onCancel: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const canSave = value.trim().length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={onCancel}>
      <div
        onMouseDown={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[92vw] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">검사결과 입력</span>
            <span className="w-px h-3 bg-[var(--line-default)] flex-shrink-0" />
            <span className="text-xs text-[var(--text-sub)] truncate">{testName}</span>
          </div>
          <button
            onClick={onCancel}
            className="w-6 h-6 inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded"
            aria-label="취소">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs text-[var(--text-sub)]">
            <span>진료일</span>
            <span className="font-medium text-[var(--text-main)] tabular-nums">{visitDate}</span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-sub)]">결과 *</span>
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && canSave) onSave(value);
                if (e.key === "Escape") onCancel();
              }}
              placeholder="수치 + 단위 (예: 142 mg/dL) 또는 소견 입력"
              className="h-8 px-2.5 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)]" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-sub)]">비고 (선택)</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="추가 메모 (선택)"
              rows={2}
              className="px-2.5 py-1.5 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] resize-none" />
          </label>
          <p className="text-micro text-[var(--text-tertiary)] -mt-1">
            저장된 결과는 표에서 ● 표시와 함께 노출됩니다.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-1.5 px-4 h-11 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button
            onClick={onCancel}
            className="h-7 px-3 text-sm text-[var(--text-sub)] border border-[var(--line-default)] rounded bg-white hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button
            onClick={() => canSave && onSave(value)}
            disabled={!canSave}
            className={`h-7 px-3 text-sm font-bold rounded transition-colors ${
              canSave
                ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                : "bg-[var(--text-disabled)] text-white cursor-not-allowed"
            }`}>
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}