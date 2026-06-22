// rc-dock 기반 자유 도킹 레이아웃.
// 패널 토글 / 레이아웃 저장·로드·삭제 UI 는 부모(EmrScreen → TopBar) 가 책임.
// 이 파일은 DockLayout 렌더 + dockRef 노출 + visible tab 변경 통지만 담당.

import "rc-dock/dist/rc-dock.css";
import { DockLayout } from "rc-dock";
import type { LayoutData, LayoutBase, TabData, PanelData } from "rc-dock";
import { useEffect, useRef, useState } from "react";

import { PanelA } from "./PanelA";
import { PatientInfoCard, AISummaryCard, RecentVitalsPanel, SharedMemoCard } from "./PanelB";
import { PanelC } from "./PanelC";
import { PanelD, type BannedDrug, type PanelDSlice } from "./PanelD";
import { ClinicalNoteCard } from "./ClinicalNoteCard";
import { PanelE } from "./PanelE";
import type { TodayDiagnosis, TodayPrescription, HistoryDx, HistoryRx } from "./chartTypes";
import type { PatientDetailTab } from "./PatientDetailModal";
import type { SoapStatus } from "./EmrScreen";

// ── 외부에서 import 해서 쓰는 공용 정의 ─────────────────────────

// 탭 ID 상수.
export const TAB_IDS = {
  CALENDAR:       "calendar",
  WAIT_LIST:      "wait-list",
  PATIENT_INFO:   "patient-info",
  AI_SUMMARY:     "ai-summary",
  VITALS:         "vitals",
  CLINICAL_NOTE:  "clinical-note",
  SHARED_MEMO:    "shared-memo",
  HISTORY:        "history",
  CHART_INFO:     "chart-info",
  SYMPTOM:        "symptom",
  VOICE_RECORD:   "voice-record",
  IMAGE:          "image",
  DX_RX:          "dx-rx",
  SPECIAL:        "special",
  CHART_FULL:     "chart-full",
  BUNDLE:         "bundle",
  QUICK_MENU:     "quick-menu",
} as const;

export type TabId = typeof TAB_IDS[keyof typeof TAB_IDS];

// 진료실 전체 패널 목록 — 패널 토글 메뉴에서 노출. 카테고리별 그룹화.
export const ALL_PANELS: { group: string; items: { id: TabId; label: string }[] }[] = [
  {
    group: "대기 / 환자",
    items: [
      { id: TAB_IDS.CALENDAR, label: "달력" },
      { id: TAB_IDS.WAIT_LIST, label: "대기리스트" },
      { id: TAB_IDS.PATIENT_INFO, label: "환자정보" },
    ],
  },
  {
    group: "AI / 메모",
    items: [
      { id: TAB_IDS.AI_SUMMARY, label: "AI 진료이력 요약" },
      { id: TAB_IDS.VITALS, label: "바이탈" },
      { id: TAB_IDS.CLINICAL_NOTE, label: "임상메모" },
      { id: TAB_IDS.SHARED_MEMO, label: "공유메모" },
    ],
  },
  {
    group: "내원이력",
    items: [
      { id: TAB_IDS.HISTORY, label: "내원이력" },
    ],
  },
  {
    group: "차트",
    items: [
      { id: TAB_IDS.CHART_INFO, label: "차트정보" },
      { id: TAB_IDS.SYMPTOM, label: "증상" },
      { id: TAB_IDS.VOICE_RECORD, label: "음성기록" },
      { id: TAB_IDS.IMAGE, label: "이미지" },
      { id: TAB_IDS.DX_RX, label: "진단 및 처방" },
      { id: TAB_IDS.SPECIAL, label: "특정내역" },
    ],
  },
  {
    group: "묶음 / 빠른메뉴",
    items: [
      { id: TAB_IDS.BUNDLE, label: "묶음" },
      { id: TAB_IDS.QUICK_MENU, label: "빠른메뉴" },
    ],
  },
];

export const ALL_PANELS_FLAT = ALL_PANELS.flatMap(g => g.items);
export const PANEL_LABEL_BY_ID = new Map<string, string>(
  ALL_PANELS_FLAT.map(i => [i.id, i.label] as [string, string])
);

// ── 저장된 레이아웃 영구 보존 ───────────────────────────────────
export const SAVED_LAYOUTS_KEY = "emr-dock:saved-layouts";

export type SavedLayoutEntry = {
  id: string;
  name: string;
  layout: LayoutBase;
  createdAt: string;
};

export function loadSavedLayouts(): SavedLayoutEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_LAYOUTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedLayoutEntry[];
  } catch {
    return [];
  }
}

export function persistSavedLayouts(layouts: SavedLayoutEntry[]) {
  try {
    localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(layouts));
  } catch {
    /* localStorage 불가 환경 무시 */
  }
}

// ── 트리 walker ─────────────────────────────────
export function collectTabIds(node: unknown): string[] {
  if (!node || typeof node !== "object") return [];
  const n = node as Record<string, unknown>;
  if (Array.isArray(n.tabs)) {
    return (n.tabs as Array<{ id?: string }>).map(t => t.id).filter((x): x is string => !!x);
  }
  if (Array.isArray(n.children)) {
    return (n.children as unknown[]).flatMap(collectTabIds);
  }
  if (n.dockbox) {
    return collectTabIds(n.dockbox);
  }
  return [];
}

export function findAnchorPanelId(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const n = node as Record<string, unknown>;
  if (Array.isArray(n.tabs) && (n.tabs as Array<{ id?: string }>).length > 0 && typeof n.id === "string") {
    return n.id;
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children as unknown[]) {
      const found = findAnchorPanelId(child);
      if (found) return found;
    }
  }
  if (n.dockbox) return findAnchorPanelId(n.dockbox);
  return null;
}

// ── 기본 레이아웃 — 내원이력 중심 ─────────────────────────────────
// 의사가 환자의 과거 이력을 한눈에 보면서 진료하는 워크플로를 중심으로 구성.
// 내원이력이 가장 큰 컬럼이며, 좌측에 환자 정보·대기 / 우측에 오늘 차트·묶음 배치.
//   ┌─대기/환자정보─┬─────내원이력 (메인)─────┬─차트─┬─묶음─┐
//   │   180         │           640            │  380  │ 180  │
export const DEFAULT_LAYOUT: LayoutData = {
  dockbox: {
    mode: "horizontal",
    children: [
      // 좌측: 달력 + 대기리스트 + 환자정보 (vertical stack). 컴팩트 width.
      {
        mode: "vertical" as const,
        size: 180,
        children: [
          { tabs: [{ id: TAB_IDS.CALENDAR } as TabData], size: 200 },
          { tabs: [{ id: TAB_IDS.WAIT_LIST } as TabData], size: 360 },
          {
            tabs: [
              { id: TAB_IDS.PATIENT_INFO } as TabData,
              { id: TAB_IDS.AI_SUMMARY } as TabData,
              { id: TAB_IDS.VITALS } as TabData,
            ],
            size: 320,
          },
        ],
      },
      // 중앙(메인): 내원이력 — 가장 큰 폭. 임상메모는 그 아래 stack.
      {
        mode: "vertical" as const,
        size: 640,
        children: [
          { tabs: [{ id: TAB_IDS.HISTORY } as TabData], size: 700 },
          { tabs: [{ id: TAB_IDS.CLINICAL_NOTE } as TabData], size: 200 },
        ],
      },
      // 중앙 우: 오늘 차트 sub-sections. 내원이력 대비 작게.
      {
        mode: "vertical" as const,
        size: 380,
        children: [
          { tabs: [{ id: TAB_IDS.CHART_INFO } as TabData], size: 60 },
          { tabs: [{ id: TAB_IDS.SYMPTOM } as TabData, { id: TAB_IDS.VOICE_RECORD } as TabData], size: 160 },
          { tabs: [{ id: TAB_IDS.DX_RX } as TabData], size: 480 },
          { tabs: [{ id: TAB_IDS.SPECIAL } as TabData, { id: TAB_IDS.IMAGE } as TabData], size: 100 },
        ],
      },
      // 우측: 묶음 + 빠른메뉴 + 공유메모.
      {
        mode: "vertical" as const,
        size: 200,
        children: [
          { tabs: [{ id: TAB_IDS.BUNDLE } as TabData], size: 380 },
          { tabs: [{ id: TAB_IDS.QUICK_MENU } as TabData], size: 240 },
          { tabs: [{ id: TAB_IDS.SHARED_MEMO } as TabData], size: 240 },
        ],
      },
    ],
  },
};

type Props = {
  todayDx: TodayDiagnosis[];
  todayRx: TodayPrescription[];
  todaySymptom: string;
  setTodaySymptom: (s: string | ((p: string) => string)) => void;
  todayClinicalNote: string;
  setTodayClinicalNote: (s: string) => void;
  isRecording: boolean;
  soap: { S: string; O: string; A: string; P: string };
  soapStatus: SoapStatus;
  transcript: string;
  recordSec: number;
  consumeSoap: () => void;
  bannedDrugs: BannedDrug[];
  addBannedDrug: (data: Omit<BannedDrug, "id">) => void;
  updateBannedDrug: (id: string, patch: Partial<BannedDrug>) => void;
  deleteBannedDrug: (id: string) => void;
  openBannedDrugsModal: (initialSearch?: string) => void;
  openPatientDetail: (id: string, tab?: PatientDetailTab, options?: { personalEdit?: boolean }) => void;
  openLabViewer: (entry?: { date?: string; testName?: string }) => void;
  openPACS: (entry: { date: string; testName: string }) => void;
  repeatDx: (items: HistoryDx[]) => void;
  repeatRx: (items: HistoryRx[]) => void;
  repeatAll: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  addSymptom: (text: string) => void;
  // dock 제어용 — 부모(EmrScreen)에서 TopBar 와 공유.
  onDockReady?: (dock: DockLayout | null) => void;
  onVisibleTabsChange?: (ids: Set<string>) => void;
  // 직전차트 보기 모드 — PanelC/PanelD 에 전파.
  pastChartDate?: string;
  pastChartEditing?: boolean;
  onConfirmEditPastChart?: () => void;
  // 환자 검색에서 선택된 환자 — PatientInfoCard 헤더 갱신용.
  patientOverride?: {
    chartNo: string;
    name: string;
    age: number;
    gender: "남" | "여";
    birth: string;
    rrnBackFirst: string;
    phone: string;
  };
};

// dock sub-section 탭용 PanelD 래퍼.
function PanelDSliceTab({
  slice,
  initialSymptomTab,
  ...props
}: Props & { slice: PanelDSlice; initialSymptomTab?: "증상" | "음성기록" }) {
  return (
    <div data-emr-dock-slice={slice} className="h-full rounded-md overflow-hidden">
      <PanelD
        slice={slice}
        initialSymptomTab={initialSymptomTab}
        diagnoses={props.todayDx}
        prescriptions={props.todayRx}
        symptom={props.todaySymptom}
        onChangeSymptom={props.setTodaySymptom}
        isRecording={props.isRecording}
        soap={props.soap}
        soapStatus={props.soapStatus}
        transcript={props.transcript}
        recordSec={props.recordSec}
        onConsumeSoap={props.consumeSoap}
        bannedDrugs={props.bannedDrugs}
        onAddBannedDrug={props.addBannedDrug}
        onUpdateBannedDrug={props.updateBannedDrug}
        onDeleteBannedDrug={props.deleteBannedDrug}
        onOpenBannedDrugsModal={props.openBannedDrugsModal}
        pastChartDate={props.pastChartDate}
        pastChartEditing={props.pastChartEditing}
        onConfirmEditPastChart={props.onConfirmEditPastChart}
      />
    </div>
  );
}

export function EmrScreenDock(props: Props) {
  const dockRef = useRef<DockLayout | null>(null);
  const { onDockReady, onVisibleTabsChange } = props;

  // dockRef 가 mount 되면 부모에 통지.
  const setDockRef = (r: DockLayout | null) => {
    dockRef.current = r;
    onDockReady?.(r);
  };

  // 초기 visible tab 통지.
  useEffect(() => {
    onVisibleTabsChange?.(new Set(collectTabIds(DEFAULT_LAYOUT)));
  }, [onVisibleTabsChange]);

  const onLayoutChange = (newLayout: LayoutBase) => {
    onVisibleTabsChange?.(new Set(collectTabIds(newLayout)));
  };

  const loadTab = (data: TabData): TabData => {
    const id = data.id as string;
    const base: Partial<TabData> = {
      closable: true,
      cached: true,
      title: PANEL_LABEL_BY_ID.get(id) ?? id,
    };
    switch (id) {
      case TAB_IDS.CALENDAR:
        return { ...base, ...data, title: "달력",
          content: <PanelA onPatientNameClick={pid => props.openPatientDetail(pid, "기본정보")} hideList fullWidth /> };
      case TAB_IDS.WAIT_LIST:
        return { ...base, ...data, title: "대기리스트",
          content: <PanelA onPatientNameClick={pid => props.openPatientDetail(pid, "기본정보")} hideCalendar fullWidth /> };
      case TAB_IDS.PATIENT_INFO:
        return { ...base, ...data, title: "환자정보",
          content: <PatientInfoCard
            onPatientNameClick={(pid, tab, opts) => props.openPatientDetail(pid, tab ?? "기본정보", opts)}
            bannedDrugs={props.bannedDrugs}
            onOpenBannedDrugsModal={props.openBannedDrugsModal}
            patientOverride={props.patientOverride} /> };
      case TAB_IDS.AI_SUMMARY:
        return { ...base, ...data, title: "AI 진료이력 요약", content: <AISummaryCard embedded /> };
      case TAB_IDS.VITALS:
        return { ...base, ...data, title: "바이탈",
          content: <RecentVitalsPanel embedded onOpenDetail={() => props.openPatientDetail("100236", "바이탈")} /> };
      case TAB_IDS.CLINICAL_NOTE:
        return { ...base, ...data, title: "임상메모",
          content: <ClinicalNoteCard embedded clinicalNote={props.todayClinicalNote} onChangeClinicalNote={props.setTodayClinicalNote} /> };
      case TAB_IDS.SHARED_MEMO:
        return { ...base, ...data, title: "공유메모", content: <SharedMemoCard embedded /> };
      case TAB_IDS.HISTORY:
        return { ...base, ...data, title: "내원이력",
          content: <PanelC
            embedded
            dockMode
            onRepeatDx={props.repeatDx}
            onRepeatRx={props.repeatRx}
            onRepeatAll={props.repeatAll}
            onAddSymptom={props.addSymptom}
            onOpenLabViewer={entry => props.openLabViewer(entry)}
            onOpenPACS={entry => props.openPACS(entry)}
            pastChartDate={props.pastChartDate}
            pastChartEditing={props.pastChartEditing} /> };
      case TAB_IDS.CHART_INFO:
        return { ...base, ...data, title: "차트정보",
          content: <PanelDSliceTab slice="chart-info" {...props} /> };
      case TAB_IDS.SYMPTOM:
        return { ...base, ...data, title: "증상",
          content: <PanelDSliceTab slice="symptom" {...props} /> };
      case TAB_IDS.VOICE_RECORD:
        return { ...base, ...data, title: "음성기록",
          content: <PanelDSliceTab slice="symptom" initialSymptomTab="음성기록" {...props} /> };
      case TAB_IDS.IMAGE:
        return { ...base, ...data, title: "이미지",
          content: <PanelDSliceTab slice="image" {...props} /> };
      case TAB_IDS.DX_RX:
        return { ...base, ...data, title: "진단 및 처방",
          content: <PanelDSliceTab slice="dx-rx" {...props} /> };
      case TAB_IDS.SPECIAL:
        return { ...base, ...data, title: "특정내역",
          content: <PanelDSliceTab slice="special" {...props} /> };
      case TAB_IDS.CHART_FULL:
        return { ...base, ...data, title: "오늘 차트 (통합)",
          content: <div className="h-full rounded-md overflow-hidden" style={{ border: "1px solid var(--blue-200)" }}>
            <PanelD
              diagnoses={props.todayDx}
              prescriptions={props.todayRx}
              symptom={props.todaySymptom}
              onChangeSymptom={props.setTodaySymptom}
              isRecording={props.isRecording}
              soap={props.soap}
              soapStatus={props.soapStatus}
              transcript={props.transcript}
              recordSec={props.recordSec}
              onConsumeSoap={props.consumeSoap}
              bannedDrugs={props.bannedDrugs}
              onAddBannedDrug={props.addBannedDrug}
              onUpdateBannedDrug={props.updateBannedDrug}
              onDeleteBannedDrug={props.deleteBannedDrug}
              onOpenBannedDrugsModal={props.openBannedDrugsModal}
            />
          </div> };
      case TAB_IDS.BUNDLE:
        return { ...base, ...data, title: "묶음",
          content: <PanelE layout="dock" embedded view="bundle" /> };
      case TAB_IDS.QUICK_MENU:
        return { ...base, ...data, title: "빠른메뉴",
          content: <PanelE layout="dock" embedded view="quick-menu" /> };
      default:
        return { ...base, ...data, title: id, content: <div className="p-3 text-xs">알 수 없는 탭: {id}</div> };
    }
  };

  return (
    <div className="flex-1 overflow-hidden" style={{ position: "relative" }}>
      <DockLayout
        ref={setDockRef}
        defaultLayout={DEFAULT_LAYOUT}
        loadTab={loadTab}
        onLayoutChange={onLayoutChange}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}

// ── dock 제어 helper: TopBar 에서 import 해서 dockRef 액션 수행 ──────────
export function togglePanelOnDock(dock: DockLayout | null, tabId: string, visibleTabIds: Set<string>) {
  if (!dock) return;
  const isVisible = visibleTabIds.has(tabId);
  if (isVisible) {
    const found = dock.find(tabId);
    if (found) dock.dockMove(found as TabData, null, "remove");
  } else {
    const saved = dock.saveLayout();
    const anchorId = findAnchorPanelId(saved);
    const target = anchorId ? dock.find(anchorId) : null;
    if (target) {
      dock.dockMove({ id: tabId } as TabData, target as PanelData, "middle");
    }
  }
}

// ── 저장 팝업 (입력/선택 팝업) ─────────────────────────────────
// 정책 §4 팝업 규칙: 우상단 ✕ 필수, [취소] 사용 안 함, 우하단 CTA 만.
// ESC = ✕ 동일 동작 (수정사항 없으면 즉시 닫기, 있으면 미저장 이탈 — 여기선 항상 닫기).
export function SaveLayoutModal({
  existingNames,
  onSave,
  onClose,
}: {
  existingNames: string[];
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // ESC = ✕ 동일 (정책 §4.5).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const duplicate = existingNames.some(n => n === name.trim());
  const submit = () => {
    if (!name.trim() || duplicate) return;
    onSave(name.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ zIndex: 9500 }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-md shadow-2xl w-[360px] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* 우상단 ✕ — 팝업 정책 필수. 입력 폐기 후 닫기. */}
        <button
          onClick={onClose}
          aria-label="닫기"
          title="닫기"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="p-4 pr-9">
          <h3 className="text-md font-bold text-[var(--text-main)] mb-1">현재 레이아웃 저장</h3>
          <p className="text-xs text-[var(--text-sub)] mb-3 leading-tight">
            현재 패널 배치와 크기를 이름 붙여 저장합니다. 다음에 같은 배치로 빠르게 되돌아갈 수 있어요.
          </p>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1">레이아웃 이름</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            placeholder="예: 외래 진료용, 검사 우선 보기, 야간 당직..."
            maxLength={32}
            className={`w-full h-8 px-2 text-sm bg-[var(--bg-subtle)] border rounded outline-none focus:bg-white ${
              duplicate ? "border-[var(--red-500)]" : "border-[var(--line-default)] focus:border-[var(--brand-primary)]"
            }`}
          />
          {duplicate && (
            <p className="text-micro text-[var(--red-500)] mt-1">이미 같은 이름의 레이아웃이 있어요.</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          {/* CTA 만 — [취소] 사용 안 함 (정책 §4). 닫으려면 우상단 ✕ 또는 ESC. */}
          <button
            onClick={submit}
            disabled={!name.trim() || duplicate}
            className="h-7 px-3 text-xs font-bold bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
