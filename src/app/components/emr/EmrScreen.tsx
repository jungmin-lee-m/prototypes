// 진료실 메인 화면 (App.tsx에서 분리, 라우팅 적용)
import { useState, useRef, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { LNB, type LNBItem } from "./LNB";
import { TopBar } from "./TopBar";
import { DashboardScreen } from "./DashboardScreen";
import { EndOfDayReport } from "./EndOfDayReport";
import { PatientDetailModal, type PatientDetailTab } from "./PatientDetailModal";
import { PanelA } from "./PanelA";
import { PanelB, PatientInfoCard, AISummaryCard, RecentVitalsPanel, SharedMemoCard, PatientOverrideContext } from "./PanelB";
import { PanelC } from "./PanelC";
import { PanelD, DEFAULT_BANNED_DRUGS, type BannedDrug } from "./PanelD";
import { ClinicalNoteCard } from "./ClinicalNoteCard";
import { PanelE } from "./PanelE";
import {
  EmrScreenDock,
  ALL_PANELS,
  DEFAULT_LAYOUT,
  SaveLayoutModal,
  togglePanelOnDock,
  loadSavedLayouts,
  persistSavedLayouts,
  type SavedLayoutEntry,
} from "./EmrScreenDock";
import type { DockLayout } from "rc-dock";
import type { LayoutBase } from "rc-dock";
import { LabViewer } from "./LabViewer";
import { PACSViewer } from "./PACSViewer";
import { BannedDrugsModal } from "./PanelD";
import { AIAssistant } from "./AIAssistant";
import type { TodayDiagnosis, TodayPrescription, HistoryDx, HistoryRx } from "./chartTypes";
import { getMockPatientChart } from "./patientSearch";

const INIT_DX: TodayDiagnosis[] = [
  { code: "J00",   name: "급성비인두염[코감기]",         isMain: true },
  { code: "J20.9", name: "상세불명의 급성 기관지염" },
  { code: "I10",   name: "본태성(원발성) 고혈압" },
  { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
  // 사전점검 — 불완전상병 예시 (J06.9: 상세불명의 급성 상기도감염)
  { code: "J06.9", name: "상세불명의 급성 상기도감염",
    pcId: "pc-dx-incomplete-1",
    preCheck: { type: "incompleteDx", options: [
      { code: "J00",   name: "급성 비인두염[코감기]" },
      { code: "J02.9", name: "상세불명의 급성 인두염" },
      { code: "J03.9", name: "상세불명의 급성 편도염" },
      { code: "J04.0", name: "급성 후두염" },
      { code: "J04.1", name: "급성 기관염" },
      { code: "J05.0", name: "급성 폐쇄성 후두염[크룹]" },
    ] },
  },
];

const INIT_RX: TodayPrescription[] = [
  // 예약처방 → 원무 접수 시 미리 처방됨 (노란색 배경 + 시계 아이콘)
  { kind: "lab", code: "Bct03332", name: "폐활량검사", dose: "1", freq: 1, days: 1, method: "1일1회", exception: "18", claim: true, pay: true, price: 2500, billCode: "MM123", isInternal: false, fromReservation: true },

  // 검사 (lab tests) — 외부 수탁
  { kind: "lab", code: "glu",    name: "당검사[화학반응-장비측정][정량]",       dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 1550, billCode: "D3022", isInternal: false },
  { kind: "lab", code: "a1c",    name: "헤모글로빈A1C-[정밀면역검사]",          dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 8550, billCode: "D3063", isInternal: false },
  { kind: "lab", code: "tg",     name: "지질[화학반응-장비측정]-트리글리세라이드", dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 4410, billCode: "D2263", isInternal: false },
  { kind: "lab", code: "ldl",    name: "콜레스테롤-LDL콜레스테롤[화학반응-장비측정]", dose: "1", freq: 1, days: 1, method: "",  claim: true,  pay: true,  price: 7500, billCode: "D2614", isInternal: false },
  { kind: "lab", code: "rbc",    name: "일반혈액검사(CBC)-[혈구세포-장비측정]_적혈구수", dose: "1", freq: 1, days: 1, method: "", claim: true, pay: true, price: 1220, billCode: "D000201", isInternal: false },
  { kind: "lab", code: "alt",    name: "ALT (SGPT)[Serum]",                  dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 2180, billCode: "D1850", isInternal: false },
  { kind: "lab", code: "cr",     name: "크레아티닌[화학반응-장비측정]",        dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 1960, billCode: "D2280", isInternal: false },

  // 약품 (drugs) — 원내
  { code: "tnjam",  name: "트라젠타정 5mg",             dose: "1", freq: 1, days: 20, method: "경구",  claim: true,  pay: true,  price: 161245,
    billCode: "642101", unit: "1 정", isInternal: false,
    isDur: true, durType: "prohibited", conflictCode: "gv022", durExtra: "가브스메트정 50/850mg",
    // 기초자료에서 "특정내역 필요" 로 설정된 처방 (병용금기 약제 처방사유) — 회색 알림 아이콘 노출
    requiresSpecial: true },
  { code: "gv022",  name: "가브스메트정 50/850mg",       dose: "1", freq: 1, days: 28, method: "경구",  claim: true,  pay: true,  price: 2000,
    billCode: "640002", unit: "1 정", isInternal: false,
    isDur: true, durType: "prohibited", conflictCode: "tnjam",  durExtra: "트라젠타정 5mg" },
  { code: "zm003",  name: "접종",                        dose: "1", freq: 1, days: 1,  method: "근육",  claim: true,  pay: false, payMethod: "수납없음", price: 3600, isInternal: true },
  { code: "000145", name: "물리치료",                    dose: "1", freq: 1, days: 1,  method: "—",     claim: true,  pay: true,  price: 3600, isInternal: true },
  { code: "000165", name: "푸르설타민주(마늘주사)",      dose: "1", freq: 1, days: 1,  method: "정맥",  claim: false, pay: true,  price: 1000, unit: "1 mL", isInternal: true },
  { code: "A0015",  name: "텔미사르탄·암로디핀베실산염", dose: "1", freq: 1, days: 14, method: "경구",  exception: "90", claim: true, pay: true, price: 2500, billCode: "650148", unit: "1 정", isInternal: false },
  { code: "aspirin100", name: "아스피린장용정 100mg",   dose: "1", freq: 1, days: 30, method: "경구",  claim: true,  pay: true,  price: 480, billCode: "651034", unit: "1 정", isInternal: false,
    isDur: true, durType: "diagnosis", durExtra: "관상동맥질환 [I25.1]" },
  { code: "C0012",  name: "클로르페니라민말레산염·슈도에페드린", dose: "1", freq: 1, days: 5,  method: "경구",  claim: true,  pay: true,  price: 800, billCode: "655401", unit: "1 정", isInternal: false, isPowder: true },
  { code: "B7502",  name: "비라토비캡슐 75mg",          dose: "1", freq: 1, days: 7,  method: "경구",  claim: true,  pay: true,  price: 3200, billCode: "642205", unit: "1 캡슐", isInternal: false },
  { code: "L4400",  name: "레비라정 500mg",              dose: "2", freq: 2, days: 7,  method: "경구",  claim: true,  pay: true,  price: 1800, billCode: "640187", unit: "1 정", isInternal: false },
  { code: "cn000",  name: "클렌부테롤·아크라이드정(암브록솔염산염)", dose: "0", freq: 1, days: 5, method: "경구", claim: true, pay: false, payMethod: "수납없음", price: 2500, unit: "1 정", isInternal: false,
    // 사전점검 — 용량 0 처방
    pcId: "pc-rx-zerodose-1",
    preCheck: { type: "zeroDose", suggested: "1" } },

  // 사전점검 — 마취과 전문의 초빙료 (전문의 정보 미입력)
  { code: "L0044", name: "마취과 전문의 초빙료(필요시 정맥내마취)", dose: "1", freq: 1, days: 1, method: "—", claim: true, pay: true, price: 75100, billCode: "L0044", isInternal: true,
    pcId: "pc-rx-anesthesiologist-1",
    preCheck: { type: "anesthesiologist", candidates: [
      { id: "as001", name: "김화타", license: "94871", rrn: "850904-2958374" },
      { id: "as002", name: "이마취", license: "73210", rrn: "780112-1429568" },
      { id: "as003", name: "박전문", license: "65488", rrn: "820627-2876511" },
    ] } },
];

function toTodayRx(r: HistoryRx): TodayPrescription {
  return {
    code: "",
    name: r.name,
    dose: r.dose,
    freq: parseInt(String(r.freq)) || 1,
    days: r.days,
    method: r.method || "경구",
    claim: true,
    pay: true,
    price: r.price,
    isNew: true,
  };
}

const INIT_SYMPTOM = "당뇨, 고혈압 정기 관리 중 (메트포르민·라미프릴). 이번 주 기침·콧물·발열 시작. 목 통증 동반. 9/20일자 알러지 검사 약 3~4주 소요, 결과 확인 필요. 복약 순응도 양호.";

const INIT_CLINICAL_NOTE = "다음 방문 시 HbA1c 재검 요청. 혈압 관리 강조. 금연 상담 필요. 체중 감량 목표 설정 (현재 72kg → 목표 68kg). 식이 조절 교육 완료.";

// 시연용 SOAP 스트림 청크 — 녹음 시작 후 1.5초 간격으로 차례대로 추가됨
const SOAP_STREAM_CHUNKS: { field: "S" | "O" | "A" | "P"; text: string }[] = [
  // S — 환자 호소 (주관적)
  { field: "S", text: "당뇨, 고혈압으로 정기 관리 중인 45세 여성. " },
  { field: "S", text: "지난 화요일부터 기침과 콧물 시작. " },
  { field: "S", text: "어제 저녁부터 미열(37.5도)과 목 통증 동반. " },
  { field: "S", text: "복용 중인 메트포르민, 텔미사르탄 순응도 양호. " },
  { field: "S", text: "9/20 시행한 알러지 검사 결과 아직 미확인 상태." },
  // O — 진찰 소견 (객관적)
  { field: "O", text: "BP 142/89 mmHg, HR 78, BT 37.6°C. " },
  { field: "O", text: "인후부 발적 관찰, 편도 비대 없음. " },
  { field: "O", text: "경부 림프절 비대 없음. " },
  { field: "O", text: "최근 HbA1c 7.2% (3개월 전), 공복혈당 128 mg/dL." },
  // A — 진단 (평가)
  { field: "A", text: "급성 비인두염 의증 (J00). " },
  { field: "A", text: "본태성 고혈압(I10) 안정. " },
  { field: "A", text: "제2형 당뇨(E11.9) 약간 조절 미흡 — HbA1c 추적. " },
  { field: "A", text: "알러지 검사 결과 추적 필요." },
  // P — 계획
  { field: "P", text: "대증치료 5일분 처방 (해열·진통·기침). " },
  { field: "P", text: "기존 만성질환 약 처방 유지. " },
  { field: "P", text: "1주일 내 알러지 결과 확인 후 후속 진료. " },
  { field: "P", text: "증상 악화 시 즉시 내원 안내." },
];

export type SoapDraft = { S: string; O: string; A: string; P: string };
const EMPTY_SOAP: SoapDraft = { S: "", O: "", A: "", P: "" };

// MOCK_SOAP — SOAP_STREAM_CHUNKS 를 모두 합친 최종 변환 결과. 녹음 종료 후 변환 단계에서 일괄 채워짐.
const MOCK_SOAP: SoapDraft = SOAP_STREAM_CHUNKS.reduce<SoapDraft>(
  (acc, c) => ({ ...acc, [c.field]: acc[c.field] + c.text }),
  EMPTY_SOAP,
);

// MOCK_TRANSCRIPT — 진료 녹음의 음성 전사문 (의사·환자 대화). 음성기록 탭에 표시.
const MOCK_TRANSCRIPT = `[진료실 1 · 김의사 · 2026-03-17 14:32 녹음]

의사: 안녕하세요. 어디가 불편하셔서 오셨어요?
환자: 지난 화요일부터 기침이랑 콧물이 시작됐는데, 어제 저녁부터는 미열이 나고 목도 좀 아파요.
의사: 열은 얼마나 났어요?
환자: 37도 5분 정도 됐어요.
의사: 평소에 드시는 약은 그대로 잘 챙기고 계시죠? 메트포르민이랑 텔미사르탄.
환자: 네, 잘 챙겨 먹고 있어요.
의사: 9월 20일에 했던 알러지 검사 결과는 보통 3주에서 4주 정도 걸리니까 다음 주 정도에 나올 거예요.
환자: 네, 알겠습니다.

의사: 혈압 한 번 재볼게요. … 142에 89네요. 맥박은 78. 체온은 37도 6분.
의사: 인후부에 발적이 좀 보이고, 편도는 부어있진 않아요. 림프절도 안 만져지네요.
의사: 최근 HbA1c가 7.2%였는데, 당뇨 조절이 약간 미흡한 편이라 다음 검사 때 다시 확인할게요.

의사: 일단 급성 비인두염으로 보고, 대증치료 5일분 처방 드릴게요. 만성질환 약은 그대로 유지하시고요.
환자: 네.
의사: 1주일 내로 알러지 검사 결과 확인하시고, 그때 후속 진료 받으시면 됩니다. 증상 악화되면 바로 오세요.
환자: 감사합니다.`;

// SOAP 처리 상태 머신.
//   idle      — 아무 상태 아님 (초기 또는 SOAP 소비 후)
//   recording — 녹음 진행 중 (timer 작동, transcript/soap 비어있음)
//   converting— 녹음 종료 직후 변환 대기 (1.5초 simulated delay)
//   ready     — transcript + soap 채워짐 (증상 탭에 "변환 완료" 뱃지 노출)
export type SoapStatus = "idle" | "recording" | "converting" | "ready";

// ── 멀티 차트 (Layout 1-a) 인프라 ─────────────────────────────────────
// 같은 환자에 대해 차트 여러 개 (다른 보험·초재진·주야간) 를 동시에 띄울 수 있게 함.
// 기본은 1개 차트. Layout "1-a" 에서만 "차트 추가" 가능 (최대 2개).
//
// 모든 차트는 같은 환자(황미진)를 가리키지만 각자 자체의 dx/rx/symptom 을 가짐.
// 임상메모·SOAP 녹음 등은 chart 와 무관한 환자/세션 수준 데이터로 공유.
export type ChartMeta = {
  insuranceType: "직장보험" | "건강보험" | "자보" | "산재" | "의료보호" | "일반";
  visitType: "초진" | "재진";
  dayNight: "주간" | "야간" | "공휴";
};
export type Chart = {
  id: string;
  meta: ChartMeta;
  dx: TodayDiagnosis[];
  rx: TodayPrescription[];
  symptom: string;
};
const CHART_1_META: ChartMeta = { insuranceType: "직장보험", visitType: "재진", dayNight: "주간" };

export function EmrScreen() {
  // 차트 배열 + 활성 차트 인덱스 — 1개 차트(현재)는 차트 1, 추가 시 2번째 차트 push.
  const [charts, setCharts] = useState<Chart[]>([{
    id: "chart-1",
    meta: CHART_1_META,
    dx: INIT_DX,
    rx: INIT_RX,
    symptom: INIT_SYMPTOM,
  }]);
  const [activeChartIdx, setActiveChartIdx] = useState(0);
  const activeChart = charts[activeChartIdx];

  // 기존 API 호환용 setter — 활성 차트의 dx/rx/symptom 만 업데이트.
  type Updater<T> = T | ((prev: T) => T);
  const setTodayDx = (next: Updater<TodayDiagnosis[]>) => {
    setCharts(prev => prev.map((c, i) => i !== activeChartIdx
      ? c
      : { ...c, dx: typeof next === "function" ? (next as (p: TodayDiagnosis[]) => TodayDiagnosis[])(c.dx) : next }));
  };
  const setTodayRx = (next: Updater<TodayPrescription[]>) => {
    setCharts(prev => prev.map((c, i) => i !== activeChartIdx
      ? c
      : { ...c, rx: typeof next === "function" ? (next as (p: TodayPrescription[]) => TodayPrescription[])(c.rx) : next }));
  };
  const setTodaySymptom = (next: Updater<string>) => {
    setCharts(prev => prev.map((c, i) => i !== activeChartIdx
      ? c
      : { ...c, symptom: typeof next === "function" ? (next as (p: string) => string)(c.symptom) : next }));
  };
  const todayDx = activeChart.dx;
  const todayRx = activeChart.rx;
  const todaySymptom = activeChart.symptom;

  // 차트 추가 — 최대 2개까지. 추가 후 새 차트로 활성 전환.
  const addChart = (meta: ChartMeta) => {
    if (charts.length >= 2) {
      showToast("차트는 최대 2개까지 동시에 띄울 수 있습니다");
      return;
    }
    const newChart: Chart = {
      id: `chart-${Date.now()}`,
      meta,
      dx: [],
      rx: [],
      symptom: "",
    };
    setCharts(prev => [...prev, newChart]);
    setActiveChartIdx(charts.length);
    showToast(`차트 추가됨 — ${meta.insuranceType} · ${meta.visitType}`);
  };
  const switchChart = (idx: number) => {
    if (idx >= 0 && idx < charts.length) setActiveChartIdx(idx);
  };
  // 차트 추가 모달 가시 상태 — PanelD 의 ⋮ 메뉴에서 열림.
  const [addChartModalOpen, setAddChartModalOpen] = useState(false);

  const [todayClinicalNote, setTodayClinicalNote] = useState<string>(INIT_CLINICAL_NOTE);
  const [layout, setLayout] = useState<1 | "1-a" | 2 | 3 | "dock">("dock");

  // ── dock 레이아웃 상태 — TopBar 의 패널/레이아웃 메뉴와 EmrScreenDock 가 공유 ─
  const dockRef = useRef<DockLayout | null>(null);
  const [dockVisibleTabIds, setDockVisibleTabIds] = useState<Set<string>>(new Set());
  const [dockSavedLayouts, setDockSavedLayouts] = useState<SavedLayoutEntry[]>(() => loadSavedLayouts());
  useEffect(() => { persistSavedLayouts(dockSavedLayouts); }, [dockSavedLayouts]);
  const [dockCurrentLayoutId, setDockCurrentLayoutId] = useState<string>("default");
  const [dockSaveModalOpen, setDockSaveModalOpen] = useState(false);

  const onDockTogglePanel = (tabId: string) => {
    togglePanelOnDock(dockRef.current, tabId, dockVisibleTabIds);
  };
  const onDockSaveLayout = (name: string) => {
    if (!dockRef.current) return;
    const lay: LayoutBase = dockRef.current.saveLayout();
    const entry: SavedLayoutEntry = {
      id: `lay-${(dockSavedLayouts.length + 1).toString(36)}-${name.slice(0, 8)}`,
      name: name.trim() || `레이아웃 ${dockSavedLayouts.length + 1}`,
      layout: lay,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDockSavedLayouts(prev => [...prev, entry]);
    setDockCurrentLayoutId(entry.id);
  };
  const onDockLoadSaved = (entry: SavedLayoutEntry) => {
    if (!dockRef.current) return;
    dockRef.current.loadLayout(entry.layout);
    setDockCurrentLayoutId(entry.id);
  };
  const onDockLoadDefault = () => {
    if (!dockRef.current) return;
    dockRef.current.loadLayout(DEFAULT_LAYOUT as unknown as LayoutBase);
    setDockCurrentLayoutId("default");
  };
  const onDockDeleteSaved = (id: string) => {
    setDockSavedLayouts(prev => prev.filter(e => e.id !== id));
    if (dockCurrentLayoutId === id) setDockCurrentLayoutId("default");
  };
  // autoSaveId 용 — 레이아웃 식별 키. "1" | "1-a" | "2" | "3".
  // 각 PanelGroup 에 layout-aware autoSaveId 를 부여하여 레이아웃별로 패널 사이즈를 localStorage 에 영구 저장.
  const layoutKey = String(layout);
  const [lnbActive, setLnbActive] = useState<LNBItem>("진료");
  // 오늘 내원 현황 — 별도 브라우저 창(window.open) 으로 띄움. 모달 아님 — 뒤 차팅 화면과 별도 윈도우 인터렉션.
  // 진료실에서만 노출. 상단 TopBar 의 버튼으로만 열림.
  const reportPopupRef = useRef<Window | null>(null);
  const reportRootRef  = useRef<Root | null>(null);
  const openReport = () => {
    if (lnbActive !== "진료") return;
    // 이미 열린 popup 이 있으면 focus 만
    if (reportPopupRef.current && !reportPopupRef.current.closed) {
      reportPopupRef.current.focus();
      return;
    }
    const popup = window.open("", "nextemrTodayReport", "width=1440,height=900,scrollbars=yes,resizable=yes");
    if (!popup) {
      alert("팝업이 차단됐어요. 브라우저의 팝업 차단을 해제한 뒤 다시 시도해주세요.");
      return;
    }
    // 새 창의 head — viewport meta + 부모창 stylesheet 복사 (Tailwind / CSS variables 그대로 적용).
    popup.document.title = "내원 현황 — NextEMR";
    const viewport = popup.document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    popup.document.head.appendChild(viewport);
    Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach(el => {
      popup.document.head.appendChild(el.cloneNode(true));
    });
    // 부모창의 html className (dark 모드 등) 동기화
    popup.document.documentElement.className = document.documentElement.className;
    popup.document.body.className = "h-screen overflow-hidden antialiased bg-[var(--bg-base)] text-[var(--text-main)]";

    const container = popup.document.createElement("div");
    container.className = "h-screen flex flex-col";
    popup.document.body.appendChild(container);

    const root = createRoot(container);
    reportRootRef.current  = root;
    reportPopupRef.current = popup;
    root.render(<EndOfDayReport onClose={() => popup.close()} />);

    popup.addEventListener("beforeunload", () => {
      reportRootRef.current?.unmount();
      reportRootRef.current  = null;
      reportPopupRef.current = null;
    });
  };

  // 진료실 외 메뉴로 이동하거나 EmrScreen 자체가 unmount 되면 popup 도 정리.
  useEffect(() => {
    if (lnbActive !== "진료" && reportPopupRef.current && !reportPopupRef.current.closed) {
      reportPopupRef.current.close();
    }
  }, [lnbActive]);
  useEffect(() => {
    return () => {
      if (reportPopupRef.current && !reportPopupRef.current.closed) {
        reportPopupRef.current.close();
      }
      reportRootRef.current?.unmount();
    };
  }, []);

  // ── 현재 차트 환자 / 직전차트 보기 모드 ─────────────────────────
  //   기본 환자는 황미진(PanelB 의 PATIENT_PROFILE) — undefined 일 때 PanelB 가 default 사용.
  //   TopBar 환자검색에서 Enter/행 클릭 → 해당 환자로 currentPatient 갱신 + pastChartMode 활성.
  //   - PanelB(환자정보): patientOverride 로 헤더 정보 갱신
  //   - PanelC(내원이력): pastChartDate 가 set 되면 해당 날짜 행이 "선택됨"
  //   - PanelD(증상·진단처방): 클릭 시 confirm 알럿 — "예" → 편집중 모드 (모드 해제)
  type CurrentPatientOverride = {
    chartNo: string;
    name: string;
    age: number;
    gender: "남" | "여";
    birth: string;
    rrnBackFirst: string;
    phone: string;
    chartInfo?: { visitDate: string; intakeMemo: string };
    sharedMemoNotice?: string;
  };
  const [currentPatient, setCurrentPatient] = useState<CurrentPatientOverride | undefined>(undefined);
  // pastChartMode.isEditing: false → "선택됨" (read-only, 클릭 시 confirm), true → "편집중" (편집 가능).
  const [pastChartMode, setPastChartMode] = useState<{ date: string; patientName: string; isEditing: boolean } | null>(null);
  const openPastChart = (p: { chartNo: string; name: string; age: number; sex: "남" | "여"; birth: string; rrnBackFirst: string; phone: string }) => {
    const mock = getMockPatientChart(p.chartNo);
    setCurrentPatient({
      chartNo: p.chartNo,
      name: p.name,
      age: p.age,
      gender: p.sex,
      birth: p.birth,
      rrnBackFirst: p.rrnBackFirst,
      phone: p.phone,
      chartInfo: mock?.chartInfo,
      sharedMemoNotice: mock?.sharedMemo,
    });
    // 환자별 mock 차트 데이터 로드 — 직전 visit (가장 최근) 의 dx/rx/symptom 을 PanelD 에 채움.
    // mock 없는 환자는 빈 상태 (신환 느낌).
    const pastVisit = mock?.visits[0];
    if (pastVisit) {
      setTodayDx(pastVisit.diagnoses.map(d => ({ code: d.code, name: d.name, isMain: false })));
      setTodayRx(pastVisit.prescriptions.map(rx => ({
        code: rx.code,
        name: rx.name,
        dose: rx.dose,
        freq: Number(rx.freq) || 1,
        days: rx.days,
        method: rx.method,
        claim: true,
        pay: true,
        price: rx.price,
        isInternal: false,
      })));
      setTodaySymptom(pastVisit.symptom);
    } else {
      // mock 없는 환자 (예: 김민호) — 신환 상태로 빈 차트.
      setTodayDx([]);
      setTodayRx([]);
      setTodaySymptom("");
    }
    setPastChartMode({ date: pastVisit?.id ?? "26-03-12", patientName: p.name, isEditing: false });
  };
  const convertPastToEditing = () => {
    // "선택됨" → "편집중" 전환. pastChartMode 는 유지하되 isEditing 만 true 로.
    // 내원이력에서 해당 행이 "편집중" 배지로 표시되고, 증상/진단처방 클릭이 자유로워짐.
    setPastChartMode(prev => prev ? { ...prev, isEditing: true } : null);
  };
  const closePastChart = () => {
    setPastChartMode(null);
    setCurrentPatient(undefined);
    // 기본 환자(황미진) 복원 — INIT defaults.
    setTodayDx(INIT_DX);
    setTodayRx(INIT_RX);
    setTodaySymptom(INIT_SYMPTOM);
  };

  // 환자 자세히보기 모달 — 진입점에 따라 첫 탭이 달라짐 (initialTab).
  //   - PanelA 환자명 클릭 → "기본정보"
  //   - 내원이력 자세히보기 → "내원이력"
  //   - PanelB 편집 아이콘 → "기본정보" + 인적사항 자동 편집 모드 (personalEdit=true)
  const [detailPatient, setDetailPatient] = useState<{
    id: string;
    initialTab: PatientDetailTab;
    personalEdit?: boolean;
  } | null>(null);
  const openPatientDetail = (
    id: string,
    initialTab: PatientDetailTab = "기본정보",
    options?: { personalEdit?: boolean },
  ) => {
    setDetailPatient({ id, initialTab, personalEdit: options?.personalEdit });
  };
  const closePatientDetail = () => setDetailPatient(null);

  // Layout 2 의 PatientInfoCard 가 담긴 Panel ref — 카드 본문 collapse 상태에 따라 크기 자동 조절.
  const layout2PatientPanelRef = useRef<ImperativePanelHandle>(null);
  const handleLayout2CardCollapsedChange = (collapsed: boolean) => {
    const panel = layout2PatientPanelRef.current;
    if (!panel) return;
    if (collapsed) panel.collapse();
    else panel.expand();
  };

  // 처방금지 약품 — 환자정보 카드(PanelB 칩) + 차트(PanelD 하단바·처방 우클릭) 셋이 공유하는 데이터.
  // EmrScreen 에 lift up 해서 두 패널 모두 동일 상태 참조.
  const [bannedDrugs, setBannedDrugs] = useState<BannedDrug[]>(DEFAULT_BANNED_DRUGS);
  // 처방금지 약품 통합 모달 — 모든 진입점(환자정보 아이콘, 처방 우클릭, 차트 하단바)이 공유.
  const [bannedDrugsModal, setBannedDrugsModal] = useState<{ initialSearch?: string } | null>(null);
  const openBannedDrugsModal = (initialSearch = "") => setBannedDrugsModal({ initialSearch });
  const addBannedDrug = (data: Omit<BannedDrug, "id">) => {
    setBannedDrugs(prev => [...prev, { ...data, id: `ban-${Date.now()}` }]);
  };
  const updateBannedDrug = (id: string, patch: Partial<BannedDrug>) => {
    setBannedDrugs(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  };
  const deleteBannedDrug = (id: string) => {
    setBannedDrugs(prev => prev.filter(b => b.id !== id));
  };

  // ── 진료 녹음 → STT 음성기록 → SOAP 변환 플로우 ────────────────
  // 상태 머신: idle → recording → converting → ready → (consume) → idle
  //   녹음 중에는 transcript/soap 채워지지 않음 (현실적인 동작)
  //   녹음 종료 후 1.5초 simulated 변환 → transcript + soap 동시에 채워짐
  //   ready 상태에서 증상 탭의 "변환 완료" 뱃지 클릭하면 SOAP 이 증상란에 펼쳐짐
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec,   setRecordSec]   = useState(0);
  const [soap,        setSoap]        = useState<SoapDraft>(EMPTY_SOAP);
  const [transcript,  setTranscript]  = useState<string>("");
  const [soapStatus,  setSoapStatus]  = useState<SoapStatus>("idle");
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const convertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRecordTimers = () => {
    if (recordTimer.current) { clearInterval(recordTimer.current); recordTimer.current = null; }
    if (convertTimer.current) { clearTimeout(convertTimer.current); convertTimer.current = null; }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // 녹음 종료 → 변환 단계.
      if (recordTimer.current) { clearInterval(recordTimer.current); recordTimer.current = null; }
      setIsRecording(false);
      setSoapStatus("converting");
      showToast("녹음 종료 — STT·SOAP 변환 중...");
      // 1.5초 후 transcript + soap 일괄 채움
      convertTimer.current = setTimeout(() => {
        setTranscript(MOCK_TRANSCRIPT);
        setSoap(MOCK_SOAP);
        setSoapStatus("ready");
        convertTimer.current = null;
        showToast("변환 완료 — 증상 탭의 '변환 완료' 뱃지로 펼치기");
      }, 1500);
      return;
    }
    // 새 녹음 시작 — 이전 transcript/SOAP 모두 초기화
    clearRecordTimers();
    setIsRecording(true);
    setRecordSec(0);
    setSoap(EMPTY_SOAP);
    setTranscript("");
    setSoapStatus("recording");
    recordTimer.current = setInterval(() => setRecordSec(s => s + 1), 1000);
    showToast("녹음 중 — 진료 음성을 녹음하고 있습니다");
  };

  // 컴포넌트 unmount 시 정리
  useEffect(() => () => clearRecordTimers(), []);

  // 변환된 SOAP 을 증상란에 펼침 — "S. ..." 형식. 펼친 후 status=idle (뱃지 사라짐).
  // 의사가 증상 textarea 에서 직접 수정 가능.
  const consumeSoap = () => {
    if (soapStatus !== "ready") return;
    const lines: string[] = [];
    if (soap.S.trim()) lines.push(`S. ${soap.S.trim()}`);
    if (soap.O.trim()) lines.push(`O. ${soap.O.trim()}`);
    if (soap.A.trim()) lines.push(`A. ${soap.A.trim()}`);
    if (soap.P.trim()) lines.push(`P. ${soap.P.trim()}`);
    if (lines.length === 0) return;
    const formatted = lines.join("\n\n");
    setTodaySymptom(prev => prev ? `${prev}\n\n${formatted}` : formatted);
    setSoapStatus("idle");
    showToast("SOAP 을 증상란에 펼쳤습니다 — 자유롭게 수정 가능");
  };
  const [toast,   setToast]   = useState<string | null>(null);
  const [showLabViewer, setShowLabViewer] = useState(false);
  // LabViewer 진입 컨텍스트 — 내원이력의 "결과보기" 버튼 등에서 그 날짜 + 그 검사로 자동 필터링.
  // undefined → 일반 진입 (전체 보기).
  const [labViewerEntry, setLabViewerEntry] = useState<{ date?: string; testName?: string } | undefined>(undefined);
  const openLabViewer = (entry?: { date?: string; testName?: string }) => {
    setLabViewerEntry(entry);
    setShowLabViewer(true);
  };
  // PACS 뷰어 — 영상검사 (X-ray·CT·MRI·초음파·내시경) 결과보기 진입점.
  // 내원이력의 영상검사 행 클릭 시 오픈. date·testName 필수.
  const [pacsEntry, setPacsEntry] = useState<{ date: string; testName: string } | null>(null);
  const openPACS = (entry: { date: string; testName: string }) => setPacsEntry(entry);
  const closePACS = () => setPacsEntry(null);
  const [showAI, setShowAI] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const clearNew = () => {
    setTimeout(() => {
      setTodayDx(prev => prev.map(d => ({ ...d, isNew: false })));
      setTodayRx(prev => prev.map(r => ({ ...r, isNew: false })));
    }, 3000);
  };

  const repeatDx = (items: HistoryDx[]) => {
    const existing = new Set(todayDx.map(d => d.code));
    const toAdd = items.filter(d => !existing.has(d.code));
    if (toAdd.length === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    setTodayDx(prev => [...prev, ...toAdd.map(d => ({ ...d, isNew: true }))]);
    showToast(`진단 ${toAdd.length}건 추가됨`);
    clearNew();
  };

  const repeatRx = (items: HistoryRx[]) => {
    const existing = new Set(todayRx.map(r => r.name));
    const toAdd = items.filter(r => !existing.has(r.name));
    if (toAdd.length === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    setTodayRx(prev => [...prev, ...toAdd.map(toTodayRx)]);
    showToast(`처방 ${toAdd.length}건 추가됨`);
    clearNew();
  };

  const addSymptom = (text: string) => {
    if (!text.trim()) return;
    setTodaySymptom(prev => prev ? `${prev}\n${text}` : text);
    showToast("증상 추가됨");
  };

  const repeatAll = (dxItems: HistoryDx[], rxItems: HistoryRx[]) => {
    const exDx = new Set(todayDx.map(d => d.code));
    const exRx = new Set(todayRx.map(r => r.name));
    const addDx = dxItems.filter(d => !exDx.has(d.code));
    const addRx = rxItems.filter(r => !exRx.has(r.name));
    const total = addDx.length + addRx.length;
    if (total === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    if (addDx.length > 0) setTodayDx(prev => [...prev, ...addDx.map(d => ({ ...d, isNew: true }))]);
    if (addRx.length > 0) setTodayRx(prev => [...prev, ...addRx.map(toTodayRx)]);
    showToast(`${total}건 오늘 차트에 추가됨`);
    clearNew();
  };

  // Context value — currentPatient + pastChart 결합. dock 레이아웃 cached tab 도
  // 이 값 변경에 React 가 자동으로 consumer re-render 시켜줌 (prop drilling 우회).
  const patientContextValue = currentPatient
    ? {
        ...currentPatient,
        pastChart: pastChartMode
          ? {
              date: pastChartMode.date,
              editing: pastChartMode.isEditing,
              onConfirmEdit: convertPastToEditing,
            }
          : undefined,
      }
    : undefined;

  return (
    // PatientOverrideContext — dock 레이아웃의 cached tab 도 currentPatient/pastChart 변경에 반응.
    <PatientOverrideContext.Provider value={patientContextValue}>
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-subtle)]">
      <LNB active={lnbActive} onChange={setLnbActive} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar는 진료실 등 차트 메뉴에서만 노출. 대시보드는 LNB만 노출. */}
        {lnbActive !== "대시보드" && (
          <TopBar
            onOpenLabViewer={entry => openLabViewer(entry)}
            onOpenReport={openReport}
            isRecording={isRecording}
            recordSec={recordSec}
            onToggleRecording={toggleRecording}
            layout={layout}
            onChangeLayout={setLayout}
            onToggleAI={() => setShowAI(o => !o)}
            aiOpen={showAI}
            // 환자검색 — 기본 액션은 직전차트 열기, [상세정보] 버튼이 환자 모달, [접수] 가 접수 액션.
            onSelectPatient={p => openPastChart(p)}
            onOpenPatientDetail={p => openPatientDetail(p.chartNo, "기본정보")}
            onRegisterPatient={p => alert(`[추후 구현] 접수: ${p.name} (${p.chartNo})`)}
            onNewPatient={() => alert("[추후 구현] 신환접수 모달")}
            onAdvancedSearch={() => alert("[추후 구현] 상세검색 팝업")}
            // dock 레이아웃 — 패널 토글, 저장된 레이아웃 통합 dropdown.
            dockVisibleTabIds={dockVisibleTabIds}
            dockSavedLayouts={dockSavedLayouts}
            dockCurrentLayoutId={dockCurrentLayoutId}
            onDockTogglePanel={onDockTogglePanel}
            onDockLoadSaved={onDockLoadSaved}
            onDockLoadDefault={onDockLoadDefault}
            onDockDeleteSaved={onDockDeleteSaved}
            onDockOpenSaveModal={() => setDockSaveModalOpen(true)}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          {lnbActive === "대시보드" ? (
            <DashboardScreen />
          ) : (
          <>
          {/* Main Area — 리사이저블 레이아웃. Layout 3 는 4-컬럼 구조로 완전히 다름.
              "dock" — rc-dock 기반 자유 도킹 (PoC). */}
          <div className="flex flex-1 overflow-hidden bg-[var(--bg-neutral)] relative">
          {layout === "dock" ? (
            <EmrScreenDock
              todayDx={todayDx}
              todayRx={todayRx}
              todaySymptom={todaySymptom}
              setTodaySymptom={setTodaySymptom}
              todayClinicalNote={todayClinicalNote}
              setTodayClinicalNote={setTodayClinicalNote}
              isRecording={isRecording}
              soap={soap}
              soapStatus={soapStatus}
              transcript={transcript}
              recordSec={recordSec}
              consumeSoap={consumeSoap}
              bannedDrugs={bannedDrugs}
              addBannedDrug={addBannedDrug}
              updateBannedDrug={updateBannedDrug}
              deleteBannedDrug={deleteBannedDrug}
              openBannedDrugsModal={openBannedDrugsModal}
              openPatientDetail={openPatientDetail}
              openLabViewer={openLabViewer}
              openPACS={openPACS}
              repeatDx={repeatDx}
              repeatRx={repeatRx}
              repeatAll={repeatAll}
              addSymptom={addSymptom}
              onDockReady={dock => { dockRef.current = dock; }}
              onVisibleTabsChange={setDockVisibleTabIds}
              pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
              onConfirmEditPastChart={convertPastToEditing}
              patientOverride={currentPatient}
            />
          ) : layout === 3 ? (
            /* Layout 3 — 4-column horizontal:
                 1) PanelD (오늘 차트, 좌측 메인 작업 영역)
                 2) 사이드 스택 (환자정보·바이탈·AI·임상메모·공유메모 vertical)
                 3) 달력+대기리스트 top / 내원이력 bottom (vertical split)
                 4) PanelE (묶음, 전체 높이) */
            <PanelGroup direction="horizontal" className="flex-1" autoSaveId="emr-l3-outer">
              {/* Col 1: PanelD — 오늘 차트 (메인 작업 영역). 캡쳐 기준 ~36%. */}
              <Panel defaultSize={36} minSize={22}>
                <div className="py-1 pl-1 h-full">
                  <div className="h-full rounded-md overflow-hidden shadow-sm"
                    style={{ border: "1px solid var(--blue-200)" }}>
                    <PanelD
                      key={activeChart.id}
                      diagnoses={todayDx}
                      prescriptions={todayRx}
                      symptom={todaySymptom}
                      onChangeSymptom={setTodaySymptom}
                      isRecording={isRecording}
                      soap={soap}
                      soapStatus={soapStatus}
                      transcript={transcript}
                      recordSec={recordSec}
                      onConsumeSoap={consumeSoap}
                      bannedDrugs={bannedDrugs}
                      onAddBannedDrug={addBannedDrug}
                      onUpdateBannedDrug={updateBannedDrug}
                      onDeleteBannedDrug={deleteBannedDrug}
                      onOpenBannedDrugsModal={openBannedDrugsModal}
                      multiChart={layout === "1-a"}
                      charts={charts}
                      activeChartIdx={activeChartIdx}
                      onSwitchChart={switchChart}
                      onOpenAddChart={() => setAddChartModalOpen(true)}
                      pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
                      onConfirmEditPastChart={convertPastToEditing}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* 중간 영역 (Col 2 + Col 3) — 내원이력 펼쳐보기 시 EMRExpandedHistory portal 이 이 영역만 덮음.
                  PanelD(차트) 와 PanelE(묶음) 는 펼쳐보기와 무관하게 항상 보임.
                  outer Panel size = Col 2(15) + Col 3(22) = 37. 내부 가로 split 으로 15/22 비율 유지. */}
              <Panel defaultSize={37} minSize={30}>
                <div id="emr-left-panels" className="relative h-full overflow-hidden">
                  <PanelGroup direction="horizontal" className="w-full h-full" autoSaveId="emr-l3-mid">
                    {/* Col 2: 사이드 스택 — 환자정보 / 임상메모 / 공유메모.
                        세로 비율 (캡쳐 기준): 환자정보 15% / 임상메모 35% / 공유메모 50%.
                        outer 37 중 약 40.5% 차지 (= 15/37). */}
                    <Panel defaultSize={40.5} minSize={25}>
                      <div className="py-1 h-full">
                        <PanelGroup direction="vertical" className="w-full h-full" autoSaveId="emr-l3-side-stack">
                          <Panel
                            ref={layout2PatientPanelRef}
                            defaultSize={15}
                            minSize={4}
                            collapsible
                            collapsedSize={4}
                          >
                            <PatientInfoCard
                              onPatientNameClick={(id, tab, opts) => openPatientDetail(id, tab ?? "기본정보", opts)}
                              bannedDrugs={bannedDrugs}
                              onOpenBannedDrugsModal={openBannedDrugsModal}
                              onContentCollapsedChange={handleLayout2CardCollapsedChange}
                              patientOverride={currentPatient}
                            />
                          </Panel>
                          <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                          <Panel defaultSize={35} minSize={12}>
                            <div className="h-full pt-0.5">
                              <ClinicalNoteCard clinicalNote={todayClinicalNote} onChangeClinicalNote={setTodayClinicalNote} />
                            </div>
                          </Panel>
                          <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                          <Panel defaultSize={50} minSize={12}>
                            <div className="h-full pt-0.5"><SharedMemoCard /></div>
                          </Panel>
                        </PanelGroup>
                      </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

                    {/* Col 3: vertical split — AI 진료이력 요약 + 바이탈 top / 내원이력 bottom.
                        outer 37 중 약 59.5% 차지 (= 22/37). 상단 20% / 하단 80%. */}
                    <Panel defaultSize={59.5} minSize={35}>
                      <div className="py-1 h-full">
                        <PanelGroup direction="vertical" className="w-full h-full" autoSaveId="emr-l3-col3">
                          {/* 상단: AI 진료이력 요약 + 바이탈. AI 45 / 바이탈 55. */}
                          <Panel defaultSize={20} minSize={14}>
                            <div className="h-full">
                              <PanelGroup direction="vertical" className="w-full h-full" autoSaveId="emr-l3-ai-vitals">
                                <Panel defaultSize={45} minSize={20}>
                                  <div className="h-full"><AISummaryCard /></div>
                                </Panel>
                                <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                                <Panel defaultSize={55} minSize={20}>
                                  <div className="h-full pt-0.5">
                                    <RecentVitalsPanel onOpenDetail={() => openPatientDetail("100236", "바이탈")} />
                                  </div>
                                </Panel>
                              </PanelGroup>
                            </div>
                          </Panel>
                          <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                          {/* 하단: 내원이력 (PanelC). ~80%. */}
                          <Panel defaultSize={80} minSize={30}>
                            <div className="h-full pt-0.5">
                              <PanelC
                                onRepeatDx={repeatDx}
                                onRepeatRx={repeatRx}
                                onRepeatAll={repeatAll}
                                onAddSymptom={addSymptom}
                                onOpenLabViewer={entry => openLabViewer(entry)}
                                onOpenPACS={entry => openPACS(entry)}
                                pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
                              />
                            </div>
                          </Panel>
                        </PanelGroup>
                      </div>
                    </Panel>
                  </PanelGroup>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* Col 4: vertical split — 달력+대기리스트 top / 묶음+빠른메뉴 bottom.
                  캡쳐 기준 ~27% 폭. 상단 20% / 하단 80%. */}
              <Panel defaultSize={27} minSize={18}>
                <div className="py-1 pr-1 h-full">
                  <PanelGroup direction="vertical" className="w-full h-full" autoSaveId="emr-l3-col4">
                    {/* 상단: 달력 + 대기리스트 grid 가로 split. ~20%. */}
                    <Panel defaultSize={20} minSize={14}>
                      <div className="h-full">
                        <PanelGroup direction="horizontal" className="w-full h-full" autoSaveId="emr-l3-col4-top">
                          {/* 달력 — PanelA hideList. ~40%. */}
                          <Panel defaultSize={40} minSize={25}>
                            <PanelA
                              onPatientNameClick={id => openPatientDetail(id, "기본정보")}
                              hideList
                              fullWidth
                            />
                          </Panel>
                          <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                          {/* 대기리스트 grid — PanelA hideCalendar + grid. ~60%. */}
                          <Panel defaultSize={60} minSize={30}>
                            <div className="h-full bg-white rounded-md overflow-hidden shadow-sm">
                              <PanelA
                                onPatientNameClick={id => openPatientDetail(id, "기본정보")}
                                hideCalendar
                                viewMode="grid"
                                fullWidth
                              />
                            </div>
                          </Panel>
                        </PanelGroup>
                      </div>
                    </Panel>
                    <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                    {/* 하단: 묶음 + 빠른메뉴 (PanelE 내부). ~80%. */}
                    <Panel defaultSize={80} minSize={25}>
                      <div className="h-full pt-0.5"><PanelE layout={layout} /></div>
                    </Panel>
                  </PanelGroup>
                </div>
              </Panel>
            </PanelGroup>
          ) : (
            // outer PanelGroup — Layout 1/1-a/2 공유. autoSaveId 에 layoutKey 포함하여 레이아웃별 사이즈 보존.
            <PanelGroup direction="horizontal" className="flex-1" autoSaveId={`emr-outer-${layoutKey}`}>
              {/* LEFT: A(리사이즈 가능) + B + C — id로 펼쳐보기 portal 타깃.
                  PanelA 도 다른 패널처럼 리사이즈 가능하게 감싸여 있음.
                  Panel 의 기본 overflow:hidden 유지 — 내부 div 가 portal 타깃이므로 외부 Panel 의 overflow 는 불필요. */}
              <Panel defaultSize={38} minSize={26}>
                <div id="emr-left-panels" className="relative h-full overflow-hidden">
                  <PanelGroup direction="horizontal" className="w-full h-full" autoSaveId={`emr-left-${layoutKey}`}>
                    {/* PanelA — 대기리스트 + 캘린더. 사용자가 width 조절 가능. */}
                    <Panel defaultSize={30} minSize={16} maxSize={50}>
                      <PanelA
                        onPatientNameClick={id => openPatientDetail(id, "기본정보")}
                        fullWidth
                      />
                    </Panel>
                    <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                    {/* 나머지 (B + C) — layout 별로 다른 내부 구조 */}
                    <Panel defaultSize={70} minSize={40}>
                      {(layout === 1 || layout === "1-a") ? (
                        /* Layout 1 / 1-a: B 세로 스택 | C 내원이력.
                           1-a 는 시각적으로 1 과 동일하되 차트 영역에 멀티 차트 탭이 추가됨.
                           key="l1" — Layout 2 와 Panel 개수·방향이 달라 React 가 DOM 재사용 시
                           react-resizable-panels 내부 state 가 stale 상태로 남는 문제 방지. */
                        <div key="l1" className="h-full overflow-hidden">
                          <PanelGroup direction="horizontal" className="w-full h-full" autoSaveId={`emr-l1-inner-${layoutKey}`}>
                            <Panel defaultSize={45} minSize={18}>
                              <div className="py-1 pl-1 h-full">
                                <PanelB
                                  clinicalNote={todayClinicalNote}
                                  onChangeClinicalNote={setTodayClinicalNote}
                                  onPatientNameClick={(id, tab, opts) => openPatientDetail(id, tab ?? "기본정보", opts)}
                                  bannedDrugs={bannedDrugs}
                                  onOpenBannedDrugsModal={openBannedDrugsModal}
                                  patientOverride={currentPatient}
                                />
                              </div>
                            </Panel>
                            <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                            <Panel defaultSize={55} minSize={32}>
                              <div className="py-1 h-full">
                                <PanelC
                                  onRepeatDx={repeatDx}
                                  onRepeatRx={repeatRx}
                                  onRepeatAll={repeatAll}
                                  onAddSymptom={addSymptom}
                                  onOpenLabViewer={entry => openLabViewer(entry)}
                                  onOpenPACS={entry => openPACS(entry)}
                                  pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
                                />
                              </div>
                            </Panel>
                          </PanelGroup>
                        </div>
                      ) : (
                        /* Layout 2: 환자정보(전체폭) / 바이탈 / AI·임상메모(좌우) / 내원이력.
                           key="l2" — Layout 1 과 Panel 구조가 달라 fresh mount 강제. */
                        <div key="l2" className="h-full py-1 pl-1 min-w-0 min-h-0 overflow-hidden">
                          <PanelGroup direction="vertical" className="w-full h-full" autoSaveId="emr-l2-inner">
                            <Panel
                              ref={layout2PatientPanelRef}
                              defaultSize={18}
                              minSize={4}
                              collapsible
                              collapsedSize={4}
                            >
                              <PatientInfoCard
                                onPatientNameClick={(id, tab, opts) => openPatientDetail(id, tab ?? "기본정보", opts)}
                                bannedDrugs={bannedDrugs}
                                onOpenBannedDrugsModal={openBannedDrugsModal}
                                onContentCollapsedChange={handleLayout2CardCollapsedChange}
                                patientOverride={currentPatient}
                              />
                            </Panel>
                            <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                            <Panel defaultSize={14} minSize={8}>
                              <div className="h-full pt-0.5">
                                <RecentVitalsPanel onOpenDetail={() => openPatientDetail("100236", "바이탈")} />
                              </div>
                            </Panel>
                            <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                            <Panel defaultSize={20} minSize={12}>
                              <PanelGroup direction="horizontal" autoSaveId="emr-l2-ai-note">
                                <Panel defaultSize={40} minSize={25}>
                                  <div className="h-full pr-0.5 pt-0.5"><AISummaryCard /></div>
                                </Panel>
                                <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                                <Panel defaultSize={60} minSize={35}>
                                  <div className="h-full pl-0.5 pt-0.5">
                                    <ClinicalNoteCard clinicalNote={todayClinicalNote} onChangeClinicalNote={setTodayClinicalNote} />
                                  </div>
                                </Panel>
                              </PanelGroup>
                            </Panel>
                            <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                            <Panel defaultSize={60} minSize={28}>
                              <div className="h-full pt-0.5">
                                <PanelC
                                  onRepeatDx={repeatDx}
                                  onRepeatRx={repeatRx}
                                  onRepeatAll={repeatAll}
                                  onAddSymptom={addSymptom}
                                  onOpenLabViewer={entry => openLabViewer(entry)}
                                  onOpenPACS={entry => openPACS(entry)}
                                  pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
                                />
                              </div>
                            </Panel>
                          </PanelGroup>
                        </div>
                      )}
                    </Panel>
                  </PanelGroup>
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* D: 오늘의 차트 — 채도 낮은 얇은 outline 으로 영역만 시사 (강조 X).
                  좌우 padding 제거 (py-1 만) — C·E 와의 간격은 resize handle 1px 만으로. */}
              <Panel defaultSize={42} minSize={26}>
                <div className="py-1 h-full">
                  <div className="h-full rounded-md overflow-hidden shadow-sm"
                    style={{ border: "1px solid var(--blue-200)" }}>
                    <PanelD
                      key={activeChart.id}
                      diagnoses={todayDx}
                      prescriptions={todayRx}
                      symptom={todaySymptom}
                      onChangeSymptom={setTodaySymptom}
                      isRecording={isRecording}
                      soap={soap}
                      soapStatus={soapStatus}
                      transcript={transcript}
                      recordSec={recordSec}
                      onConsumeSoap={consumeSoap}
                      bannedDrugs={bannedDrugs}
                      onAddBannedDrug={addBannedDrug}
                      onUpdateBannedDrug={updateBannedDrug}
                      onDeleteBannedDrug={deleteBannedDrug}
                      onOpenBannedDrugsModal={openBannedDrugsModal}
                      multiChart={layout === "1-a"}
                      charts={charts}
                      activeChartIdx={activeChartIdx}
                      onSwitchChart={switchChart}
                      onOpenAddChart={() => setAddChartModalOpen(true)}
                      pastChartDate={pastChartMode?.date}
              pastChartEditing={pastChartMode?.isEditing}
                      onConfirmEditPastChart={convertPastToEditing}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* E: 도구모음 (세트처방 + 빠른메뉴) — D 와의 간격 최소화. 우측 화면 가장자리 패딩은 유지(pr-1). */}
              <Panel defaultSize={20} minSize={12}>
                <div className="py-1 pr-1 h-full"><PanelE layout={layout} /></div>
              </Panel>
            </PanelGroup>
          )}
          </div>
          </>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[var(--bg-inverse)] text-white px-4 py-2.5 rounded-xl shadow-2xl pointer-events-none select-none">
          <span className="text-[var(--green-500)] text-xl">↩</span>
          <span className="text-md font-medium">{toast}</span>
        </div>
      )}

      {/* 검사결과 뷰어 — 팝업. 외곽 backdrop 클릭 또는 ✕ 로 닫힘.
          labViewerEntry — 내원이력 결과보기 등으로 진입 시 해당 날짜·검사로 자동 필터링.
          key={...} → 새 진입마다 LabViewer 재마운트하여 initial* props 가 재적용되도록 함. */}
      {showLabViewer && (
        <div
          className="fixed inset-0 z-[9990] bg-black/40 flex items-center justify-center p-4"
          onMouseDown={() => setShowLabViewer(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] h-full max-h-[92vh] overflow-hidden flex flex-col"
            onMouseDown={e => e.stopPropagation()}
          >
            <LabViewer
              key={`${labViewerEntry?.date ?? ""}-${labViewerEntry?.testName ?? ""}`}
              onClose={() => setShowLabViewer(false)}
              initialDate={labViewerEntry?.date}
              initialTestId={labViewerEntry?.testName}
            />
          </div>
        </div>
      )}

      {/* PACS 뷰어 — 영상검사 (X-ray·CT·MRI·초음파·내시경) 결과보기.
          내원이력의 영상검사 행에서 진입. backdrop 클릭 또는 ✕ 로 닫힘.
          key={...} → 새 검사 진입마다 PACSViewer 재마운트. */}
      {pacsEntry && (
        <div
          className="fixed inset-0 z-[9991] bg-black/40 flex items-center justify-center p-4"
          onMouseDown={closePACS}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] h-full max-h-[92vh] overflow-hidden flex flex-col"
            onMouseDown={e => e.stopPropagation()}
          >
            <PACSViewer
              key={`${pacsEntry.date}-${pacsEntry.testName}`}
              date={pacsEntry.date}
              testName={pacsEntry.testName}
              onClose={closePACS}
            />
          </div>
        </div>
      )}

      {/* 처방금지 약품 통합 모달 — PanelB·PanelD 우클릭·PanelD 하단바 모두 공통 */}
      {bannedDrugsModal && (
        <BannedDrugsModal
          drugs={bannedDrugs}
          initialSearch={bannedDrugsModal.initialSearch}
          onClose={() => setBannedDrugsModal(null)}
          onAdd={entry => addBannedDrug({
            registeredAt: new Date().toISOString().slice(0, 10),
            ...entry,
          })}
          onDelete={deleteBannedDrug}
          onUpdate={updateBannedDrug}
        />
      )}

      {/* AI 어시스턴트 패널 — TopBar 의 ✦ AI 버튼으로 토글.
          항상 mount 상태로 유지 → 채팅·step·입력값 등 내부 state 가 닫혀도 보존됨.
          외부 클릭 시 onClose 가 호출되어 자동 닫힘. */}
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />

      {/* 오늘의 리포트 — 별도 브라우저 창(window.open) 으로 띄움. 본문 트리에 모달이 mount 되지 않음. */}

      {/* dock 레이아웃 저장 모달 — TopBar 의 "새 레이아웃 저장" 클릭 시. */}
      {dockSaveModalOpen && (
        <SaveLayoutModal
          existingNames={dockSavedLayouts.map(e => e.name)}
          onSave={name => { onDockSaveLayout(name); setDockSaveModalOpen(false); }}
          onClose={() => setDockSaveModalOpen(false)}
        />
      )}
      {/* 하단 플로팅 "오늘 내원 현황" 버튼 제거 — 상단 TopBar 의 동일 액션 버튼만 유지 */}

      {/* 환자 자세히보기 모달 — 진입점에 따라 initialTab 결정.
          key={detailPatient.id} 로 환자 변경 시 모달이 remount 되어 activeTab 등 state 가 초기화됨.
          repeatRx/Dx/All 주입 — 가족 환자(예: 김허나)의 내원이력에서 행 클릭 시
          현재 차트(황미진)의 todayRx/Dx 에 추가. PanelC 의 내원이력과 동일한 동작.
          currentChartName/No — 모달의 환자가 현재 차트와 다를 때 안내 배너용. */}
      {detailPatient && (
        <PatientDetailModal
          key={detailPatient.id}
          patientId={detailPatient.id}
          initialTab={detailPatient.initialTab}
          onClose={closePatientDetail}
          onJumpToPatient={(id, tab) => openPatientDetail(id, tab)}
          onRepeatRx={repeatRx}
          onRepeatDx={repeatDx}
          onRepeatAll={repeatAll}
          currentChartName="황미진"
          currentChartNo="100236"
          initialPersonalEdit={detailPatient.personalEdit}
        />
      )}

      {/* 차트 추가 모달 — Layout 1-a 에서 PanelD 의 ⋮ → "차트 추가" 클릭 시 오픈.
          보험 / 초재진 / 주야간 선택 후 추가 → 새 차트 push + 활성 전환. */}
      {addChartModalOpen && (
        <AddChartModal
          onClose={() => setAddChartModalOpen(false)}
          onAdd={meta => {
            addChart(meta);
            setAddChartModalOpen(false);
          }}
        />
      )}
    </div>
    </PatientOverrideContext.Provider>
  );
}

// ── 차트 추가 모달 ─────────────────────────────────────────────────────
// 같은 환자에 두 번째 차트를 추가할 때 차트 정보(보험·초재진·주야간) 선택.
function AddChartModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (meta: ChartMeta) => void;
}) {
  const [insuranceType, setInsuranceType] = useState<ChartMeta["insuranceType"]>("일반");
  const [visitType, setVisitType] = useState<ChartMeta["visitType"]>("재진");
  const [dayNight, setDayNight] = useState<ChartMeta["dayNight"]>("주간");
  const INS_OPTIONS: ChartMeta["insuranceType"][] = ["일반", "건강보험", "직장보험", "자보", "산재", "의료보호"];
  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[440px] max-w-[92vw] overflow-hidden flex flex-col"
        onMouseDown={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] bg-white">
          <span className="text-md font-bold text-[var(--text-main)]">차트 추가</span>
          {/* 우상단 ✕ — 팝업 정책 필수. */}
          <button onClick={onClose}
            className="w-6 h-6 inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded"
            aria-label="닫기"
            title="닫기">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="text-xs text-[var(--text-sub)]">
            같은 환자에 추가 차트를 생성합니다. 보험·초재진·주야간을 설정하세요.
          </div>
          {/* 보험 선택 — chip group */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--text-sub)]">보험</span>
            <div className="flex flex-wrap gap-1">
              {INS_OPTIONS.map(ins => {
                const active = insuranceType === ins;
                return (
                  <button
                    key={ins}
                    onClick={() => setInsuranceType(ins)}
                    className={`h-7 px-2.5 text-xs rounded border transition-colors whitespace-nowrap ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                        : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)]"
                    }`}>
                    {ins}
                  </button>
                );
              })}
            </div>
            <button className="text-micro text-[var(--brand-primary)] hover:underline self-start mt-0.5"
              onClick={() => alert("[추후 구현] 건강보험공단 자격 조회")}>
              보험정보 조회…
            </button>
          </div>
          {/* 초/재진 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--text-sub)]">초재진</span>
            <div className="flex gap-1">
              {(["초진", "재진"] as const).map(t => {
                const active = visitType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setVisitType(t)}
                    className={`h-7 px-3 text-xs rounded border transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                        : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)]"
                    }`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          {/* 주야간 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--text-sub)]">주야간</span>
            <div className="flex gap-1">
              {(["주간", "야간", "공휴"] as const).map(t => {
                const active = dayNight === t;
                return (
                  <button
                    key={t}
                    onClick={() => setDayNight(t)}
                    className={`h-7 px-3 text-xs rounded border transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                        : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:border-[var(--brand-primary)]"
                    }`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Footer — CTA 만 (정책 §4: [취소] 사용 안 함, 닫기는 우상단 ✕). */}
        <div className="flex items-center justify-end gap-1.5 px-4 h-11 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button onClick={() => onAdd({ insuranceType, visitType, dayNight })}
            className="h-7 px-3 text-sm font-bold rounded bg-[var(--brand-primary)] text-white hover:opacity-90">
            추가
          </button>
        </div>
      </div>
    </div>
  );
}