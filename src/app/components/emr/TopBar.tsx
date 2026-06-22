import { useState, useEffect, useRef } from "react";
import { PatientSearchBar } from "./PatientSearchBar";
import type { SearchablePatient } from "./patientSearch";
import { ROOMS } from "./PanelA";
import { ALL_PANELS, type SavedLayoutEntry } from "./EmrScreenDock";
import { Alert } from "./Alert";

// mm:ss 포맷터
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function TopBar({
  onOpenLabViewer, onOpenReport,
  isRecording = false, recordSec = 0, onToggleRecording,
  layout = 2, onChangeLayout,
  onToggleAI, aiOpen = false,
  onSelectPatient, onOpenPatientDetail, onRegisterPatient, onNewPatient, onAdvancedSearch,
  dockVisibleTabIds,
  dockSavedLayouts = [],
  dockCurrentLayoutId = "default",
  onDockTogglePanel,
  onDockLoadSaved,
  onDockLoadDefault,
  onDockDeleteSaved,
  onDockOpenSaveModal,
}: {
  onOpenLabViewer?: () => void;
  onOpenReport?: () => void;
  isRecording?: boolean;
  recordSec?: number;
  onToggleRecording?: () => void;
  layout?: 1 | "1-a" | 2 | 3 | "dock";
  onChangeLayout?: (n: 1 | "1-a" | 2 | 3 | "dock") => void;
  onToggleAI?: () => void;
  aiOpen?: boolean;
  // 기본 액션 (Enter / 행 클릭) — 직전차트 열기
  onSelectPatient?: (p: SearchablePatient) => void;
  // 행 우측 [상세정보] 버튼 — 환자 상세정보 모달
  onOpenPatientDetail?: (p: SearchablePatient) => void;
  onRegisterPatient?: (p: SearchablePatient) => void;
  onNewPatient?: () => void;
  onAdvancedSearch?: () => void;
  // dock 레이아웃 — 패널 토글 / 저장된 레이아웃 메뉴.
  dockVisibleTabIds?: Set<string>;
  dockSavedLayouts?: SavedLayoutEntry[];
  dockCurrentLayoutId?: string;
  onDockTogglePanel?: (id: string) => void;
  onDockLoadSaved?: (entry: SavedLayoutEntry) => void;
  onDockLoadDefault?: () => void;
  onDockDeleteSaved?: (id: string) => void;
  onDockOpenSaveModal?: () => void;
}) {
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const panelMenuRef = useRef<HTMLDivElement>(null);
  // 레이아웃 삭제 확인 알럿 — 정책 §3 확인(질문형). window.confirm 대신 커스텀 Alert.
  const [deleteConfirmEntry, setDeleteConfirmEntry] = useState<SavedLayoutEntry | null>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!layoutOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-layout-dropdown]")) setLayoutOpen(false);
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [layoutOpen]);

  useEffect(() => {
    if (!panelMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelMenuRef.current && !panelMenuRef.current.contains(e.target as Node)) setPanelMenuOpen(false);
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [panelMenuOpen]);

  // 현재 적용된 dock 레이아웃 이름 — 통합 dropdown 라벨용.
  const dockCurrentName =
    dockCurrentLayoutId === "default"
      ? "기본"
      : dockSavedLayouts.find(e => e.id === dockCurrentLayoutId)?.name ?? "기본";
  const allPanelCount = ALL_PANELS.reduce((s, g) => s + g.items.length, 0);
  const visibleCount = dockVisibleTabIds?.size ?? 0;

  // 진료실 선택 dropdown — PanelA 의 RoomSwitcher 에서 이동된 전역 진료실 선택.
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const [roomOpen, setRoomOpen] = useState(false);
  const roomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!roomOpen) return;
    const handler = (e: MouseEvent) => {
      if (!roomRef.current?.contains(e.target as Node)) setRoomOpen(false);
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [roomOpen]);

  return (
    // mediai-ds.md §9.8: TopBar bg = brand/primary (Blue/500), text = text/on-color (White).
    // 높이 48 → 40 (압축 유지). data-emr-topbar = dock overlay offset 계산용.
    <div data-emr-topbar className="flex items-center h-10 bg-[var(--brand-primary)] px-3 gap-2 flex-shrink-0">
      {/* Date Navigation — Blue 위 White 텍스트로 콘트라스트 확보. */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-[4px] flex items-center justify-center text-white text-md leading-none transition-colors">‹</button>
        <span className="text-md font-bold text-white px-1.5 whitespace-nowrap tabular-nums">2026.03.17 (화)</span>
        <button className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-[4px] flex items-center justify-center text-white text-md leading-none transition-colors">›</button>
        <button className="h-6 px-2 bg-white text-[var(--brand-primary)] rounded-[4px] text-xs font-bold whitespace-nowrap hover:bg-white/90 transition-colors">오늘</button>
      </div>

      {/* 진료실 선택 — White 배경 chip 으로 Blue 위에서 가독성 확보. */}
      <div ref={roomRef} className="relative flex-shrink-0">
        <button
          onClick={() => setRoomOpen(o => !o)}
          title="진료실 선택"
          aria-haspopup="true"
          aria-expanded={roomOpen}
          className={`flex items-center gap-1.5 h-7 px-2 rounded border text-xs font-medium transition-colors whitespace-nowrap ${
            roomOpen
              ? "border-white bg-white text-[var(--brand-primary)]"
              : "border-white/30 bg-white/10 text-white hover:bg-white/20"
          }`}>
          <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold ${
            roomOpen ? "bg-[var(--brand-primary)] text-white" : "bg-white text-[var(--brand-primary)]"
          }`}>
            {activeRoom.label.replace(/[^0-9]/g, "") || "·"}
          </span>
          <span>{activeRoom.label}</span>
          <span className="opacity-60">·</span>
          <span className="opacity-80">{activeRoom.doctor}</span>
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className={`transition-transform ${roomOpen ? "rotate-180" : ""}`}>
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {roomOpen && (
          <div className="absolute top-8 left-0 bg-white border border-[var(--line-default)] rounded-md shadow-xl w-44 z-50 py-1 overflow-hidden">
            {ROOMS.map(r => {
              const active = activeRoom.id === r.id;
              return (
                <button key={r.id}
                  onClick={() => { setActiveRoom(r); setRoomOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    active ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold" : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                  }`}>
                  <span className="flex-1">{r.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{r.doctor}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Search — chart-prototype 의 PatientSearchBar 이식.
          이름·차트번호·생년월일·휴대폰 검색 + dropdown + 키보드 네비. */}
      <PatientSearchBar
        onSelectPatient={p => onSelectPatient?.(p)}
        onOpenDetail={p => onOpenPatientDetail?.(p)}
        onRegister={p => onRegisterPatient?.(p)}
        onNewPatient={onNewPatient}
        onAdvancedSearch={onAdvancedSearch}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Recording Button — 녹음 중에는 빨간 배경 + pulse + 타이머. Blue 위에서 White 외곽 유지. */}
      <button
        onClick={() => onToggleRecording?.()}
        title={isRecording ? "녹음 중지" : "진료 음성 녹음 시작"}
        className={`flex items-center gap-1.5 rounded h-7 px-2 flex-shrink-0 transition-colors ${
          isRecording
            ? "bg-[var(--red-500)] hover:bg-[var(--red-700)] border border-[var(--red-500)]"
            : "bg-white/10 hover:bg-white/20 border border-white/40"
        }`}
      >
        {isRecording ? (
          <>
            <span className="relative flex w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-xs font-bold text-white whitespace-nowrap">녹음 중</span>
            <span className="text-xs font-mono font-bold text-white whitespace-nowrap tabular-nums">{formatTime(recordSec)}</span>
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
            <span className="text-xs font-bold text-white whitespace-nowrap">녹음 시작</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-white/30 flex-shrink-0" />

      {/* Action Buttons — Blue 위 ghost(white/10) 버튼 통일. hover 시 white/20. */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className="h-7 px-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs font-medium text-white whitespace-nowrap transition-colors">
          PACS
        </button>
        <button
          onClick={() => onOpenLabViewer?.()}
          className="h-7 px-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs font-medium text-white whitespace-nowrap transition-colors"
        >
          검사결과
        </button>
        <button className="h-7 px-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs font-medium text-white whitespace-nowrap transition-colors">
          차트리뷰
        </button>
        <button className="h-7 px-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs font-medium text-white whitespace-nowrap transition-colors">
          진단서
        </button>

        {/* 내원 현황 — solid white 강조 (다른 액션과 시각 구분). */}
        <button
          onClick={() => onOpenReport?.()}
          className="flex items-center h-7 px-2 bg-white border border-white rounded text-xs font-bold text-[var(--brand-primary)] hover:bg-white/90 whitespace-nowrap transition-colors"
        >
          내원 현황
        </button>

        {/* 패널 드롭다운 — dock 레이아웃에서만 노출. 진료실 패널 체크박스 토글. */}
        {layout === "dock" && (
          <div ref={panelMenuRef} className="relative">
            <button
              onClick={() => setPanelMenuOpen(o => !o)}
              title="진료실 패널 꺼내고 닫기"
              className={`flex items-center gap-1 h-7 px-2 border rounded text-xs font-medium whitespace-nowrap transition-colors ${
                panelMenuOpen
                  ? "bg-white border-white text-[var(--brand-primary)]"
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20"
              }`}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              </svg>
              패널
              <span className={`tabular-nums text-[10px] ${panelMenuOpen ? "text-[var(--text-tertiary)]" : "text-white/70"}`}>
                {visibleCount}/{allPanelCount}
              </span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className={`transition-transform ${panelMenuOpen ? "rotate-180" : ""}`}>
                <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {panelMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[var(--line-default)] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-[260px] max-h-[420px] overflow-y-auto z-50 py-1.5">
                <div className="px-3 pb-1.5 mb-1 border-b border-[var(--line-subtle)]">
                  <div className="text-xs font-bold text-[var(--text-main)]">진료실 패널</div>
                  <div className="text-micro text-[var(--text-tertiary)] mt-0.5 leading-tight">
                    체크박스로 꺼내고 닫음. 닫힌 패널은 언제든 다시 열 수 있어요.
                  </div>
                </div>
                {ALL_PANELS.map(group => (
                  <div key={group.group} className="mb-1">
                    <div className="px-3 py-0.5 text-[10px] font-bold text-[var(--text-tertiary)] tracking-wide uppercase">
                      {group.group}
                    </div>
                    {group.items.map(panel => {
                      const checked = dockVisibleTabIds?.has(panel.id) ?? false;
                      return (
                        <label
                          key={panel.id}
                          className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[var(--bg-subtle)] text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onDockTogglePanel?.(panel.id)}
                            className="accent-[var(--brand-primary)]"
                          />
                          <span className={checked ? "text-[var(--text-main)]" : "text-[var(--text-sub)]"}>
                            {panel.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 레이아웃 드롭다운 — built-in (1/1-a/2/3/dock) + dock 저장된 레이아웃 + 새 레이아웃 저장 통합. */}
        <div data-layout-dropdown className="relative">
          <button
            onClick={() => setLayoutOpen(o => !o)}
            title="레이아웃 변경"
            className={`flex items-center gap-1 h-7 px-2 border rounded text-xs font-medium whitespace-nowrap transition-colors ${
              layoutOpen
                ? "bg-white border-white text-[var(--brand-primary)]"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            레이아웃
            {layout === "dock" && (
              <span className={`text-[10px] ${layoutOpen ? "text-[var(--text-tertiary)]" : "text-white/70"} truncate max-w-[80px]`}>
                · {dockCurrentName}
              </span>
            )}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className={`transition-transform ${layoutOpen ? "rotate-180" : ""}`}>
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {layoutOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[var(--line-default)] overflow-hidden py-1 min-w-[240px] z-50">
              {/* Built-in 레이아웃 (1, 1-a, 2, 3, dock) */}
              <div className="px-3 py-0.5 text-[10px] font-bold text-[var(--text-tertiary)] tracking-wide uppercase">
                기본 레이아웃 옵션
              </div>
              {([1, "1-a", 2, 3, "dock"] as const).map(n => {
                const active = layout === n;
                return (
                  <button
                    key={String(n)}
                    onClick={() => { onChangeLayout?.(n); setLayoutOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                        : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <span className="w-3 flex-shrink-0">
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    레이아웃 {n}
                  </button>
                );
              })}
              {/* dock 레이아웃 시: 저장된 dock 레이아웃 목록 + 새 레이아웃 저장 버튼 */}
              {layout === "dock" && (
                <>
                  <div className="my-1 border-t border-[var(--line-subtle)]" />
                  <div className="px-3 py-0.5 text-[10px] font-bold text-[var(--text-tertiary)] tracking-wide uppercase">
                    저장된 dock 레이아웃
                  </div>
                  {/* 기본 (default) */}
                  <button
                    onClick={() => { onDockLoadDefault?.(); setLayoutOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                      dockCurrentLayoutId === "default"
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                        : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <span className="w-3 flex-shrink-0">
                      {dockCurrentLayoutId === "default" && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">기본 (시스템 제공)</span>
                  </button>
                  {dockSavedLayouts.map(entry => (
                    <div
                      key={entry.id}
                      className={`group flex items-center gap-1 px-1.5 ${
                        dockCurrentLayoutId === entry.id ? "bg-[var(--bg-primary-subtle)]" : "hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <button
                        onClick={() => { onDockLoadSaved?.(entry); setLayoutOpen(false); }}
                        className={`flex-1 flex items-center gap-2 px-1.5 py-1.5 text-left text-sm ${
                          dockCurrentLayoutId === entry.id ? "text-[var(--brand-primary)] font-bold" : "text-[var(--text-main)]"
                        }`}
                      >
                        <span className="w-3 flex-shrink-0">
                          {dockCurrentLayoutId === entry.id && (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1 truncate" title={entry.name}>{entry.name}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">{entry.createdAt}</span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteConfirmEntry(entry);
                        }}
                        title="삭제"
                        className="w-5 h-5 inline-flex items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)] transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <path d="M3 5h10M6 5V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5M4.5 5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {dockSavedLayouts.length === 0 && (
                    <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)]">
                      아직 저장된 레이아웃이 없어요.
                    </div>
                  )}
                  {/* "새 레이아웃 저장" — 드롭다운 최하단 */}
                  <div className="my-1 border-t border-[var(--line-subtle)]" />
                  <button
                    onClick={() => { onDockOpenSaveModal?.(); setLayoutOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-[var(--brand-primary)] font-bold hover:bg-[var(--bg-primary-subtle)] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3h7l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 3v4h6V3M5 13v-5h6v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    새 레이아웃 저장
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* AI 어시스턴트 — 기존 우하단 플로팅 버튼에서 이동.
            토글 형태 — 열렸을 때 brand-primary fill, 닫혔을 때 outline. */}
        <button
          data-ai-trigger
          onClick={() => onToggleAI?.()}
          title={aiOpen ? "AI 어시스턴트 닫기 (⌘K)" : "AI 어시스턴트 열기 (⌘K)"}
          aria-pressed={aiOpen}
          className={`flex items-center gap-1 h-7 px-2 rounded text-xs font-medium whitespace-nowrap transition-colors ${
            aiOpen
              ? "bg-[var(--brand-primary)] border border-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-pressed)]"
              : "bg-white border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)]"
          }`}
        >
          <span className="text-[11px] leading-none font-bold">✦</span>
          AI
        </button>
      </div>

      {/* 레이아웃 삭제 확인 — 정책 §3 안내+행동유도 알럿. 동작 동사 = "삭제". */}
      {deleteConfirmEntry && (
        <Alert
          type="action"
          actionVerb="삭제"
          title="레이아웃 삭제"
          message={
            <>
              <span className="font-bold">&quot;{deleteConfirmEntry.name}&quot;</span> 레이아웃을 삭제하시겠습니까?
            </>
          }
          description="삭제한 레이아웃은 복구할 수 없습니다."
          onAbstain={() => setDeleteConfirmEntry(null)}
          onAct={() => {
            onDockDeleteSaved?.(deleteConfirmEntry.id);
            setDeleteConfirmEntry(null);
          }}
        />
      )}
    </div>
  );
}