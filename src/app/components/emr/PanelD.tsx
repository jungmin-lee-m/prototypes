// Panel D: 차트 영역 (Main Chart Area)
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { TodayDiagnosis, TodayPrescription } from "./chartTypes";
import {
  getDurCfg, DurWarningBar, DurBatchBar, SettingsPopover,
  type DurItemState, type AlternativeDrug,
} from "./DurWarning";

// 더보기(점 3개) 아이콘 SVG path (인라인) — imports 폴더 의존성 제거
const MORE_DOTS_ICON_PATH = "M0 1.09375C0 1.38383 0.115234 1.66203 0.320352 1.86715C0.52547 2.07227 0.803669 2.1875 1.09375 2.1875C1.38383 2.1875 1.66203 2.07227 1.86715 1.86715C2.07227 1.66203 2.1875 1.38383 2.1875 1.09375C2.1875 0.803669 2.07227 0.52547 1.86715 0.320352C1.66203 0.115234 1.38383 0 1.09375 0C0.803669 0 0.52547 0.115234 0.320352 0.320352C0.115234 0.52547 0 0.803669 0 1.09375ZM0 6.5625C0 6.85258 0.115234 7.13078 0.320352 7.3359C0.52547 7.54102 0.803669 7.65625 1.09375 7.65625C1.38383 7.65625 1.66203 7.54102 1.86715 7.3359C2.07227 7.13078 2.1875 6.85258 2.1875 6.5625C2.1875 6.27242 2.07227 5.99422 1.86715 5.7891C1.66203 5.58398 1.38383 5.46875 1.09375 5.46875C0.803669 5.46875 0.52547 5.58398 0.320352 5.7891C0.115234 5.99422 0 6.27242 0 6.5625ZM0 12.0312C0 12.3213 0.115234 12.5995 0.320352 12.8046C0.52547 13.0098 0.803669 13.125 1.09375 13.125C1.38383 13.125 1.66203 13.0098 1.86715 12.8046C2.07227 12.5995 2.1875 12.3213 2.1875 12.0312C2.1875 11.7412 2.07227 11.463 1.86715 11.2579C1.66203 11.0527 1.38383 10.9375 1.09375 10.9375C0.803669 10.9375 0.52547 11.0527 0.320352 11.2579C0.115234 11.463 0 11.7412 0 12.0312Z";

type Diagnosis = TodayDiagnosis;
type Prescription = TodayPrescription;

const medicalImages = [
  { label: "흉부X-ray 1", url: "https://images.unsplash.com/photo-1616012480717-fd9867059ca0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzdCUyMHhyYXklMjBtZWRpY2FsJTIwc2NhbnxlbnwxfHx8fDE3NzY4NDc0ODR8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { label: "흉부X-ray 2", url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx4cmF5JTIwYm9uZSUyMHJhZGlvbG9neSUyMGhvc3BpdGFsfGVufDF8fHx8MTc3Njg0ODA1NHww&ixlib=rb-4.1.0&q=80&w=400" },
  { label: "바이탈",     url: "https://images.unsplash.com/photo-1682706841281-f723c5bfcd83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFydCUyMHJhdGUlMjB2aXRhbHMlMjBtb25pdG9yJTIwZ3JhcGglMjB3YXZlZm9ybXxlbnwxfHx8fDE3NzY4NDgwNDJ8MA&ixlib=rb-4.1.0&q=80&w=400" },
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center transition-colors ${
      checked ? "bg-[#E8E7F9] border border-[#9B97DC]" : "border border-[#DBDCDF]"
    }`}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="#6B67C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function DiagSearchRow() {
  return (
    <div className="grid items-center px-2 py-1.5 border-b border-[#DBDCDF] bg-[#FAFBFF] cursor-text"
      style={{ gridTemplateColumns: "16px 40px 1fr 36px 28px 28px 36px 60px 24px" }}>
      <div />
      <div className="col-span-8 flex items-center gap-1.5">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
          <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] text-[#BABBBE]">상병 검색 — 코드 또는 명칭 입력...</span>
      </div>
    </div>
  );
}

function PrescSearchRow() {
  return (
    <div className="grid items-center px-2 py-1.5 border-b border-[#DBDCDF] bg-[#FAFBFF] cursor-text"
      style={{ gridTemplateColumns: "50px 1fr 40px 36px 36px 50px 40px 30px 30px 70px 24px" }}>
      <div />
      <div className="col-span-10 flex items-center gap-1.5">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
          <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] text-[#BABBBE]">처방 검색 — 코드 또는 명칭 입력...</span>
      </div>
    </div>
  );
}

export function PanelD({
  diagnoses: initDiagnoses,
  prescriptions: initPrescriptions,
  symptom,
}: {
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  symptom: string;
}) {
  // ── Local state (PanelD owns a working copy of chart data) ──────────────────
  const [localRx, setLocalRx] = useState<Prescription[]>(initPrescriptions);
  const [localDx, setLocalDx] = useState<Diagnosis[]>(initDiagnoses);

  // 외부(내원이력 클릭)에서 prop이 갱신되면 local에 새 항목만 머지 + 스크롤 + 반짝 효과
  useEffect(() => {
    setLocalDx(prev => {
      const codes = new Set(prev.map(d => d.code));
      const additions = initDiagnoses.filter(d => !codes.has(d.code));
      if (additions.length === 0) return prev;
      const addedCodes = new Set(additions.map(a => a.code));
      setTimeout(() => {
        diagScrollRef.current?.scrollTo({
          top: diagScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
      setTimeout(() => {
        setLocalDx(p => p.map(d => addedCodes.has(d.code) ? { ...d, isNew: false } : d));
      }, 1000);
      return [...prev, ...additions.map(d => ({ ...d, isNew: true }))];
    });
  }, [initDiagnoses]);
  useEffect(() => {
    setLocalRx(prev => {
      const names = new Set(prev.map(r => r.name));
      const additions = initPrescriptions.filter(r => !names.has(r.name));
      if (additions.length === 0) return prev;
      const addedNames = new Set(additions.map(a => a.name));
      setTimeout(() => {
        prescScrollRef.current?.scrollTo({
          top: prescScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
      setTimeout(() => {
        setLocalRx(p => p.map(r => addedNames.has(r.name) ? { ...r, isNew: false } : r));
      }, 1000);
      return [...prev, ...additions.map(r => ({ ...r, isNew: true }))];
    });
  }, [initPrescriptions]);
  const [durStates, setDurStates] = useState<Record<string, DurItemState>>({});
  const [durChecked, setDurChecked] = useState(false);
  const [hoveredConflict, setHoveredConflict] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [settingsRect, setSettingsRect] = useState<DOMRect | null>(null);
  const [chartMenuRect, setChartMenuRect] = useState<DOMRect | null>(null);
  const chartMenuBtnRef = useRef<HTMLButtonElement>(null);

  // D2 sub-panel system — 어떤 서브패널을 노출할지 설정
  const D2_SUB_PANELS = ["증상", "이미지", "임상메모"] as const;
  type D2Sub = typeof D2_SUB_PANELS[number];
  const [d2Active, setD2Active] = useState<Set<D2Sub>>(new Set(D2_SUB_PANELS));
  const [d2SettingsRect, setD2SettingsRect] = useState<DOMRect | null>(null);
  const d2SettingsBtnRef = useRef<HTMLButtonElement>(null);

  // close D2 settings popover on outside click
  useEffect(() => {
    if (!d2SettingsRect) return;
    const handler = (e: MouseEvent) => {
      const popup = document.getElementById("d2-settings-popover");
      if (
        d2SettingsBtnRef.current && !d2SettingsBtnRef.current.contains(e.target as Node) &&
        (!popup || !popup.contains(e.target as Node))
      ) {
        setD2SettingsRect(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [d2SettingsRect]);

  // close chart menu on outside click
  useEffect(() => {
    if (!chartMenuRect) return;
    const handler = (e: MouseEvent) => {
      if (chartMenuBtnRef.current && !chartMenuBtnRef.current.contains(e.target as Node)) {
        const popup = document.getElementById("chart-context-menu");
        if (!popup || !popup.contains(e.target as Node)) {
          setChartMenuRect(null);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [chartMenuRect]);

  // Refs
  const rowRefs   = useRef<Record<string, HTMLDivElement | null>>({});
  const diagScrollRef  = useRef<HTMLDivElement>(null);
  const prescScrollRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SVG conflict lines state
  const [svgLines, setSvgLines] = useState<Array<{ y1: number; y2: number; color: string }>>([]);
  const [svgH, setSvgH] = useState(0);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── DUR state helpers ────────────────────────────────────────────────────────
  const setDurState = useCallback((code: string, state: DurItemState) =>
    setDurStates(prev => ({ ...prev, [code]: state })), []);

  const deleteRx = useCallback((code: string) => {
    const snapshot = localRx;
    setLocalRx(prev => {
      const item = prev.find(p => p.code === code);
      if (item?.conflictCode) {
        setDurStates(ds => ({ ...ds, [item.conflictCode!]: { status: "resolved" } }));
      }
      return prev.filter(p => p.code !== code);
    });
    showToast("처방 삭제됨", () => setLocalRx(snapshot));
  }, [localRx, showToast]);

  const replaceRx = useCallback((code: string, drug: AlternativeDrug) => {
    setLocalRx(prev => prev.map(p =>
      p.code === code ? { ...p, name: drug.name, dose: drug.dose, price: drug.price, isDur: false } : p
    ));
  }, []);

  const adjustDose = useCallback((code: string, dose: string) =>
    setLocalRx(prev => prev.map(p => p.code === code ? { ...p, dose } : p)), []);

  const addDx = useCallback((dx: { code: string; name: string }) =>
    setLocalDx(prev => prev.some(d => d.code === dx.code) ? prev : [...prev, dx]), []);

  const deleteDx = useCallback((code: string) => {
    const snapshot = localDx;
    setLocalDx(prev => prev.filter(d => d.code !== code));
    showToast("진단 삭제됨", () => setLocalDx(snapshot));
  }, [localDx, showToast]);

  const bulkDismiss = useCallback(() => {
    const updates: Record<string, DurItemState> = {};
    localRx.filter(p => p.isDur && (!durStates[p.code] || durStates[p.code].status === "pending"))
      .forEach(p => { updates[p.code] = { status: "dismissed" }; });
    setDurStates(prev => ({ ...prev, ...updates }));
    showToast(`${Object.keys(updates).length}건 모두 무시됨`);
  }, [localRx, durStates, showToast]);

  const bulkReason = useCallback((reason: string) => {
    const updates: Record<string, DurItemState> = {};
    localRx.filter(p => p.isDur && (!durStates[p.code] || durStates[p.code].status === "pending"))
      .forEach(p => { updates[p.code] = { status: "reasonEntered", reason }; });
    setDurStates(prev => ({ ...prev, ...updates }));
  }, [localRx, durStates]);

  const scrollToFirstDur = useCallback(() => {
    const first = localRx.find(p => p.isDur && (!durStates[p.code] || durStates[p.code].status === "pending"));
    if (first) rowRefs.current[first.code]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [localRx, durStates]);

  // ── Conflict SVG lines ────────────────────────────────────────────────────────
  const recalcLines = useCallback(() => {
    const container = prescScrollRef.current;
    if (!container) return;
    setSvgH(container.scrollHeight);
    const containerRect = container.getBoundingClientRect();
    const done = new Set<string>();
    const lines: typeof svgLines = [];
    for (const p of localRx) {
      if (!p.isDur || !p.conflictCode) continue;
      const key = [p.code, p.conflictCode].sort().join("|");
      if (done.has(key)) continue;
      done.add(key);
      const aEl = rowRefs.current[p.code];
      const bEl = rowRefs.current[p.conflictCode];
      if (!aEl || !bEl) continue;
      const aR = aEl.getBoundingClientRect();
      const bR = bEl.getBoundingClientRect();
      const y1 = aR.top - containerRect.top + container.scrollTop + aR.height / 2;
      const y2 = bR.top - containerRect.top + container.scrollTop + bR.height / 2;
      lines.push({ y1: Math.min(y1, y2), y2: Math.max(y1, y2), color: getDurCfg(p.durType).color });
    }
    setSvgLines(lines);
  }, [localRx]);

  useEffect(() => { recalcLines(); }, [recalcLines]);

  const existingDxCodes = localDx.map(d => d.code);

  const COL = "50px 1fr 40px 36px 36px 50px 40px 30px 30px 70px 24px";

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-[#F4F4F5] gap-1 p-1 overflow-hidden">

      {/* D1: 접수정보 바 (높이 고정 — PanelGroup 밖) */}
      <div className="bg-[#FBFAFF] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 py-2 flex items-center gap-[17px] flex-shrink-0 overflow-hidden">
        {/* 날짜 */}
        <span className="text-[13px] font-bold text-[#171719] whitespace-nowrap flex-shrink-0">2026.03.17 (화)</span>

        {/* 드롭다운 버튼: 직장·재진·청구·주간 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { label: "직장", color: "#3385FF" },
            { label: "재진", color: "#171719" },
            { label: "청구", color: "#171719" },
            { label: "주간", color: "#171719" },
          ].map(({ label, color }) => (
            <div
              key={label}
              className="bg-white border border-[#DBDCDF] rounded-[4px] h-7 px-3 flex items-center justify-center cursor-pointer select-none"
            >
              <span className="text-[10px] font-bold whitespace-nowrap" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>

        {/* 접수메모 필드 (레이블 + 내용) */}
        <div className="flex-1 min-w-0 bg-white border border-[#DBDCDF] rounded-[4px] px-[11px] py-[6px] flex items-center gap-[6px]">
          <span className="text-[11px] font-bold text-[#46474C] whitespace-nowrap flex-shrink-0">접수메모</span>
          <span className="text-[11px] text-[#171719] truncate">MRI 촬영 원함, 보호자(따님) 동반</span>
        </div>

        {/* 삼점 버튼 + 컨텍스트 메뉴 (portal로 클리핑 회피) */}
        <button
          ref={chartMenuBtnRef}
          onClick={e => setChartMenuRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
          className="w-5 h-5 flex items-center justify-center flex-shrink-0 hover:opacity-60"
        >
          <svg width="3" height="14" viewBox="0 0 2.1875 13.125" fill="none">
            <path d={MORE_DOTS_ICON_PATH} fill="#171719" />
          </svg>
        </button>
      </div>


      <PanelGroup direction="vertical" className="flex-1">

      {/* D2: 증상 / 이미지 / 임상메모 — 설정 버튼으로 노출 항목 선택 */}
      <Panel defaultSize={25} minSize={12}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-full overflow-hidden relative">
        <div className="flex divide-x divide-[#DBDCDF] h-full">
          {d2Active.has("증상") && (
            <div className="flex-1 p-3 overflow-y-auto min-w-0">
              <div className="mb-2"><span className="text-[12px] font-bold text-[#292A2D]">증상</span></div>
              <p className="text-[11px] text-[#292A2D] leading-[17px] whitespace-pre-line">{symptom}</p>
            </div>
          )}
          {d2Active.has("이미지") && (
            <div className="flex-1 p-3 overflow-y-auto min-w-0 flex flex-col">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-bold text-[#292A2D]">이미지</span>
                  <span className="text-[9px] bg-[#453EDC] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">3</span>
                </div>
                <button className="text-[10px] text-[#70737C] border border-[#DBDCDF] rounded-[3px] px-1.5 py-0.5">업로드</button>
              </div>
              <div className="rounded-[4px] overflow-hidden relative flex-1 min-h-0">
                <img src={medicalImages[0].url} alt={medicalImages[0].label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                  <span className="text-[9px] text-white font-medium drop-shadow">{medicalImages[0].label}</span>
                </div>
              </div>
            </div>
          )}
          {d2Active.has("임상메모") && (
            <div className="flex-1 p-3 overflow-y-auto min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-[#292A2D]">임상메모</span>
                <button className="text-[10px] text-[#70737C] px-1">📌</button>
              </div>
              <p className="text-[11px] text-[#292A2D] leading-[17px]">다음 방문 시 HbA1c 재검 요청. 혈압 관리 강조. 금연 상담 필요. 체중 감량 목표 설정 (현재 72kg → 목표 68kg). 식이 조절 교육 완료.</p>
            </div>
          )}
          {d2Active.size === 0 && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-[#989BA2]">
              우상단 ⚙ 버튼으로 표시할 항목을 선택하세요
            </div>
          )}
        </div>
        <button
          ref={d2SettingsBtnRef}
          onClick={e => setD2SettingsRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
          className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center text-[#989BA2] hover:text-[#292A2D] text-[12px] transition-colors"
          title="표시 항목 설정"
        >⚙</button>
      </div>
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[#453EDC]/30 active:bg-[#453EDC]/50 transition-colors" />

      {/* D3: 진단 + 처방 */}
      <Panel defaultSize={75} minSize={30}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Diagnosis Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#DBDCDF] flex-shrink-0">
          <span className="text-[12px] font-bold text-[#292A2D] flex-shrink-0">진단 및 처방</span>
          <div className="flex items-center gap-1 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-7 flex-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-[#989BA2]">통합 검색 (코드/명칭/증상)</span>
          </div>
          <button className="text-[11px] font-medium text-[#46474C] border border-[#DBDCDF] rounded-[4px] px-2 h-7 bg-white whitespace-nowrap flex-shrink-0">KOICD 분류</button>
          {/* Settings button — 사전심사 범위 설정 */}
          <button
            onClick={e => setSettingsRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
            className="text-[#989BA2] hover:text-[#292A2D] text-[13px] px-1 transition-colors flex-shrink-0"
            title="사전심사 설정"
          >⚙</button>
        </div>

        {/* D3 Body: 진단 + 처방 + 작동하는 스플리터 */}
        <PanelGroup direction="vertical" className="flex-1">

          {/* Diagnosis Section */}
          <Panel defaultSize={35} minSize={15}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="grid bg-[#F7F7F8] border-b border-[#DBDCDF] px-2 py-1.5 flex-shrink-0"
              style={{ gridTemplateColumns: "16px 40px 1fr 36px 28px 28px 36px 60px 24px" }}>
              {["","코드","상병명","의증","좌","우","불완전","진료과",""].map((h, i) => (
                <span key={i} className="text-[10px] font-medium text-[#989BA2] text-center">{h}</span>
              ))}
            </div>
            <div ref={diagScrollRef} className="flex-1 overflow-y-auto overflow-x-auto">
              {localDx.map((d, i) => (
                <div key={d.code + i}
                  className={`grid items-center px-2 py-1.5 border-b border-[#DBDCDF] relative transition-colors ${
                    d.isNew ? "bg-[#EDFFF4]" : d.isMain ? "bg-[#FFFAEB]" : ""
                  }`}
                  style={{ gridTemplateColumns: "16px 40px 1fr 36px 28px 28px 36px 60px 24px" }}
                >
                  {(d.isMain || d.isNew) && (
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${d.isNew ? "bg-[#2EA652]" : "bg-[#FF7B2E]"}`} />
                  )}
                  <div className="text-[10px] text-[#C2C4C8] text-center">⋮⋮</div>
                  <span className="text-[11px] font-medium text-[#292A2D]">{d.code}</span>
                  <div className="flex items-center gap-1">
                    {d.isMain && <span className="text-[9px] bg-[#FF7B2E] text-white rounded-[3px] px-1 py-0.5 flex-shrink-0">주</span>}
                    {d.special && <span className="text-[9px] bg-[#FEECEC] text-[#FF4242] border border-[#FF9999] rounded-[3px] px-1 py-0.5 flex-shrink-0">{d.special}</span>}
                    <span className="text-[11px] text-[#292A2D] truncate">{d.name}</span>
                  </div>
                  {["의증","좌","우","불완전"].map(col => (
                    <div key={col} className="flex justify-center">
                      <div className="w-3.5 h-3.5 border border-[#DBDCDF] rounded-[2px]" />
                    </div>
                  ))}
                  <span className="text-[10px] text-[#292A2D] text-center">내과</span>
                  <button
                    onClick={() => deleteDx(d.code)}
                    className="text-[11px] text-[#989BA2] hover:text-[#FF4242] text-center transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 border-t border-[#DBDCDF]">
              <DiagSearchRow />
            </div>
          </div>
          </Panel>

          <PanelResizeHandle className="h-[10px] bg-[#F7F7F8] border-y border-[#DBDCDF] flex items-center justify-center cursor-row-resize hover:bg-[#EBEBEF] transition-colors">
            <div className="w-10 h-1 bg-[#989BA2] rounded-full opacity-50" />
          </PanelResizeHandle>

          {/* Prescription Section */}
          <Panel defaultSize={65} minSize={20}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="grid bg-[#F7F7F8] border-b border-[#DBDCDF] px-2 py-1.5 flex-shrink-0"
              style={{ gridTemplateColumns: COL }}>
              {["코드","처방명","용량","일투","일수","용법","예외","청구","수납","단가",""].map((h, i) => (
                <span key={i} className="text-[10px] font-medium text-[#989BA2] text-center truncate">{h}</span>
              ))}
            </div>
            <div ref={prescScrollRef} className="flex-1 overflow-y-auto overflow-x-auto relative"
              onScroll={recalcLines}>
              {/* Conflict SVG lines overlay */}
              {svgLines.length > 0 && (
                <svg className="absolute left-0 top-0 pointer-events-none" width="4" style={{ height: svgH, zIndex: 5 }}>
                  {svgLines.map((ln, i) => (
                    <line key={i} x1="2" y1={ln.y1} x2="2" y2={ln.y2}
                      stroke={ln.color} strokeWidth="2" strokeDasharray="3,3" opacity="0.55" />
                  ))}
                </svg>
              )}

              {/* Prescription Rows */}
            {localRx.map((p, i) => {
              const ds = durStates[p.code] ?? { status: "pending" as const };
              const durResolved = ds.status === "resolved";
              const isDurActive = durChecked && p.isDur && !durResolved;
              const cfg = isDurActive ? getDurCfg(p.durType) : null;
              const isConflictHovered = hoveredConflict === p.code;

              return (
                <div key={p.code + i}
                  ref={el => { rowRefs.current[p.code] = el; }}>
                  <div
                    className={`grid items-center px-2 py-1.5 border-b border-[#DBDCDF] relative transition-all ${
                      p.isNew      ? "bg-[#EDFFF4]" :
                      p.isReserved ? "bg-[#EEF4FF]" : ""
                    }`}
                    style={{
                      gridTemplateColumns: COL,
                      ...(isDurActive && !p.isNew && cfg
                        ? { backgroundColor: cfg.bg }
                        : {}),
                      ...(isConflictHovered && cfg
                        ? { boxShadow: `inset 0 0 0 2px ${cfg.color}40` }
                        : {}),
                    }}
                  >
                    {/* Left strip */}
                    {(p.isNew || p.isReserved || isDurActive) && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                          p.isNew ? "bg-[#2EA652]" :
                          p.isReserved ? "bg-[#3385FF]" : ""
                        }`}
                        style={isDurActive && !p.isNew && cfg ? { backgroundColor: cfg.color } : undefined}
                      />
                    )}
                    <span className="text-[10px] text-[#989BA2] truncate text-center">{p.code}</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] text-[#292A2D] truncate">{p.name}</span>
                    </div>
                    <span className="text-[11px] text-[#292A2D] text-center">{p.dose}</span>
                    <span className="text-[11px] text-[#292A2D] text-center">{p.freq}</span>
                    <span className="text-[11px] text-[#292A2D] text-center">{p.days}</span>
                    <span className="text-[10px] text-[#292A2D] text-center">{p.method}</span>
                    <span className="text-[10px] text-[#FF4242] text-center">{p.exception || ""}</span>
                    <div className="flex justify-center"><Checkbox checked={p.claim} /></div>
                    <div className="flex justify-center"><Checkbox checked={p.pay} /></div>
                    <span className="text-[11px] text-[#292A2D] text-right">{p.price.toLocaleString()}</span>
                    <button
                      onClick={() => deleteRx(p.code)}
                      className="text-[11px] text-[#989BA2] hover:text-[#FF4242] text-center transition-colors"
                    >✕</button>
                  </div>

                  {/* DUR Warning Bar */}
                  {isDurActive && (
                    <DurWarningBar
                      p={p}
                      durState={ds}
                      existingDx={existingDxCodes}
                      onStateChange={state => setDurState(p.code, state)}
                      onDelete={() => deleteRx(p.code)}
                      onDeleteConflict={() => p.conflictCode && deleteRx(p.conflictCode)}
                      onReplace={drug => replaceRx(p.code, drug)}
                      onAdjustDose={dose => adjustDose(p.code, dose)}
                      onAddDiagnosis={dx => addDx(dx)}
                      onHoverConflict={setHoveredConflict}
                      isConflictHighlighted={isConflictHovered}
                    />
                  )}
                </div>
              );
            })}
            </div>
            <div className="flex-shrink-0 border-t border-[#DBDCDF]">
              <PrescSearchRow />
            </div>
          </div>
          </Panel>

        </PanelGroup>
      </div>
      </Panel>

      </PanelGroup>

      {/* D4: Action Bar */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {/* Batch DUR bar (shown above action buttons when ≥2 DUR items) */}
        {durChecked && (
          <DurBatchBar
            prescriptions={localRx}
            durStates={durStates}
            onBulkReason={bulkReason}
            onBulkDismiss={bulkDismiss}
            onScrollToFirst={scrollToFirstDur}
            onScrollTo={code => rowRefs.current[code]?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
          />
        )}

        <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 py-2 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] px-2 py-1">
              <span>📅</span> 예약처방 2
            </button>
            <button className="flex items-center gap-1 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] px-2 py-1">
              <span>👤</span> 환자예외
            </button>
            <button className="flex items-center gap-1 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] px-2 py-1">
              <span>🚫</span> 처방금지
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDurChecked(c => !c)}
              aria-pressed={durChecked}
              className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors inline-flex items-center gap-1 ${
                durChecked
                  ? "border border-[#453EDC] bg-[#453EDC] text-white shadow-inner hover:bg-[#3730B3]"
                  : "border border-[#DBDCDF] text-[#292A2D] bg-white hover:bg-[#F7F7F8]"
              }`}
            >
              <span className={`text-[10px] leading-none ${durChecked ? "opacity-100" : "opacity-30"}`}>●</span>
              점검
            </button>
            <button className="h-7 px-3 border border-[#DBDCDF] rounded-md text-[12px] font-medium text-[#292A2D] bg-white hover:bg-[#F7F7F8]">저장</button>
            <button className="h-7 px-3 border border-[#DBDCDF] rounded-md text-[12px] font-medium text-[#292A2D] bg-white hover:bg-[#F7F7F8]">저장전달</button>
            <button className="h-7 px-3.5 rounded-md text-[12px] font-bold text-white bg-[#453EDC] hover:bg-[#3730B3]">출력전달</button>
          </div>
        </div>
      </div>

      {/* Settings Popover */}
      {settingsRect && (
        <SettingsPopover rect={settingsRect} onClose={() => setSettingsRect(null)} />
      )}

      {/* D2 Sub-panel Settings Popover */}
      {d2SettingsRect && createPortal(
        <div
          id="d2-settings-popover"
          className="fixed w-[160px] bg-white border border-[#DBDCDF] rounded-md shadow-lg py-1.5"
          style={{
            top: d2SettingsRect.bottom + 4,
            left: Math.max(8, d2SettingsRect.right - 160),
            zIndex: 9999,
          }}
        >
          <div className="px-3 pb-1 text-[10px] font-medium text-[#989BA2]">표시 항목</div>
          {D2_SUB_PANELS.map(name => {
            const checked = d2Active.has(name);
            return (
              <label key={name} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[#F7F7F8]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setD2Active(prev => {
                    const next = new Set(prev);
                    next.has(name) ? next.delete(name) : next.add(name);
                    return next;
                  })}
                />
                <span className="text-[12px] text-[#292A2D]">{name}</span>
              </label>
            );
          })}
        </div>,
        document.body
      )}

      {/* Chart Context Menu (portal로 패널 클리핑 회피) */}
      {chartMenuRect && createPortal(
        <div
          id="chart-context-menu"
          className="fixed w-[140px] bg-white border border-[#DBDCDF] rounded-md shadow-lg py-1"
          style={{
            top: chartMenuRect.bottom + 4,
            left: chartMenuRect.right - 140,
            zIndex: 9999,
          }}
        >
          {[
            "차트 닫기",
            "차트 삭제",
            "처방전 보기",
            "차트 출력",
            "진료기록부 출력",
          ].map(item => (
            <button
              key={item}
              onClick={() => setChartMenuRect(null)}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[#292A2D] hover:bg-[#F7F7F8]"
            >
              {item}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* DUR Action Toast */}
      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[#1E1F22] text-white px-4 py-2.5 rounded-xl shadow-2xl">
          <span className="text-[12px]">{toast.msg}</span>
          {toast.undo && (
            <button onClick={() => { toast.undo!(); setToast(null); }}
              className="text-[11px] text-[#6B9FFF] hover:text-[#93B8FF] font-medium underline">
              실행취소
            </button>
          )}
        </div>
      )}
    </div>
  );
}