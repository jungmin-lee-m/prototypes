import { useState, useEffect } from "react";

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
}: {
  onOpenLabViewer?: () => void;
  onOpenReport?: () => void;
  isRecording?: boolean;
  recordSec?: number;
  onToggleRecording?: () => void;
  layout?: 1 | 2;
  onChangeLayout?: (n: 1 | 2) => void;
  // AI 어시스턴트 토글 — 우하단 플로팅 버튼 대신 TopBar 의 레이아웃 옆으로 이동.
  onToggleAI?: () => void;
  aiOpen?: boolean;
}) {
  const [layoutOpen, setLayoutOpen] = useState(false);

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

  return (
    <div className="flex items-center h-14 bg-white border-b border-[var(--line-default)] px-4 gap-3 flex-shrink-0">
      {/* Date Navigation */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className="w-7 h-7 bg-[var(--bg-subtle)] rounded-[6px] flex items-center justify-center text-[var(--text-sub)] text-lg leading-none">‹</button>
        <span className="text-xl font-bold text-[var(--text-main)] px-2 whitespace-nowrap">2026.03.17 (화)</span>
        <button className="w-7 h-7 bg-[var(--bg-subtle)] rounded-[6px] flex items-center justify-center text-[var(--text-sub)] text-lg leading-none">›</button>
        <button className="h-7 px-3 bg-[var(--brand-primary)] rounded-[6px] text-white text-lg font-medium whitespace-nowrap">오늘</button>
      </div>

      {/* Patient Search */}
      <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-lg px-3 h-9 w-[380px] flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="text-lg text-[var(--text-tertiary)]">환자 검색 (이름, 차트번호, 연락처)</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Recording Button — 녹음 중에는 빨간 배경 + pulse + 타이머 */}
      <button
        onClick={() => onToggleRecording?.()}
        title={isRecording ? "녹음 중지" : "진료 음성 녹음 시작"}
        className={`flex items-center gap-2 rounded-[10px] h-9 px-3 flex-shrink-0 transition-colors ${
          isRecording
            ? "bg-[var(--red-500)] hover:bg-[var(--red-700)] border border-[var(--red-500)]"
            : "bg-white hover:bg-[var(--status-error-bg-subtle)] border border-[var(--red-500)]"
        }`}
      >
        {isRecording ? (
          // 녹음 중 — 펄스 도트 + 타이머
          <>
            <span className="relative flex w-3 h-3 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="text-md font-bold text-white whitespace-nowrap">녹음 중</span>
            <span className="text-md font-mono font-bold text-white whitespace-nowrap tabular-nums">{formatTime(recordSec)}</span>
          </>
        ) : (
          // 대기 — 솔리드 빨간 도트 + "녹음 시작"
          <>
            <span className="w-5 h-5 rounded-full border border-[var(--red-500)] flex items-center justify-center flex-shrink-0">
              <span className="w-3 h-3 rounded-full bg-[var(--red-500)]" />
            </span>
            <span className="text-md font-bold text-[var(--red-500)] whitespace-nowrap">녹음 시작</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--line-default)] flex-shrink-0" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="h-9 px-3 bg-white border border-[var(--text-disabled)] rounded-[10px] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] whitespace-nowrap">
          PACS
        </button>
        <button
          onClick={() => onOpenLabViewer?.()}
          className="h-9 px-3 bg-white border border-[var(--text-disabled)] rounded-[10px] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] whitespace-nowrap"
        >
          검사결과
        </button>
        <button className="h-9 px-3 bg-white border border-[var(--text-disabled)] rounded-[10px] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] whitespace-nowrap">
          차트리뷰
        </button>
        <button className="h-9 px-3 bg-white border border-[var(--text-disabled)] rounded-[10px] text-lg font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] whitespace-nowrap">
          진단서
        </button>

        {/* 오늘 내원 현황 — 오늘 진료 + 수납완료 환자 현황 + 자동 분석 리포트 */}
        <button
          onClick={() => onOpenReport?.()}
          className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[var(--brand-primary)] rounded-[10px] text-lg font-medium text-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)] whitespace-nowrap"
        >
          <span>📊</span>
          오늘 내원 현황
        </button>

        {/* 레이아웃 드롭다운 — 클릭 시 옵션 메뉴 노출 */}
        <div data-layout-dropdown className="relative">
          <button
            onClick={() => setLayoutOpen(o => !o)}
            title="레이아웃 변경"
            className={`flex items-center gap-1.5 h-9 px-3 bg-white border rounded-[10px] text-lg font-medium whitespace-nowrap transition-colors ${
              layoutOpen
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-[var(--text-disabled)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            </svg>
            레이아웃
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className={`transition-transform ${layoutOpen ? "rotate-180" : ""}`}>
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {layoutOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[var(--line-default)] overflow-hidden py-1 min-w-[140px] z-50">
              {([1, 2] as const).map(n => {
                const active = layout === n;
                return (
                  <button
                    key={n}
                    onClick={() => { onChangeLayout?.(n); setLayoutOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-md text-left transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                        : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <span className="w-3 flex-shrink-0">
                      {active && (
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    레이아웃 {n}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI 어시스턴트 — 기존 우하단 플로팅 버튼에서 이동.
            토글 형태 — 열렸을 때 brand-primary fill, 닫혔을 때 outline.
            data-ai-trigger: AIAssistant 의 외부 클릭 닫기 핸들러가 자기 자신을 닫지 않도록 식별자. */}
        <button
          data-ai-trigger
          onClick={() => onToggleAI?.()}
          title={aiOpen ? "AI 어시스턴트 닫기 (⌘K)" : "AI 어시스턴트 열기 (⌘K)"}
          aria-pressed={aiOpen}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-lg font-medium whitespace-nowrap transition-colors ${
            aiOpen
              ? "bg-[var(--brand-primary)] border border-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-pressed)]"
              : "bg-white border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)]"
          }`}
        >
          <span className="text-[14px] leading-none font-bold">✦</span>
          AI
        </button>
      </div>
    </div>
  );
}