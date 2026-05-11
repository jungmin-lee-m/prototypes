// 사전점검(PreCheck) — 인라인 알림 시스템
// 5종: 불완전상병 / 마취과전문의 / 용량0 / 출국자 / 진료시간
// 각 알림은 수정 UI + "기초자료에 반영" 옵션을 포함한다.
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type {
  Anesthesiologist,
  DayNightHoliday,
  PreCheckCompleteOption,
} from "./chartTypes";

// ── 공통 토큰 (DurWarning과 동일 색상으로 시각 일관성 유지) ─────────────────
export const PRECHECK_COLOR  = "var(--orange-500)";
export const PRECHECK_BG     = "var(--status-warning-bg-subtle)";
export const PRECHECK_BORDER = "var(--orange-100)";

// ── 공통 상태 ──────────────────────────────────────────────────────────────────
export type PreCheckStatus =
  | "pending"
  | "fixed"      // 수정 완료
  | "dismissed"; // 무시함

export interface PreCheckResolution {
  status: PreCheckStatus;
  appliedToMaster?: boolean; // 기초자료 반영 여부
  summary?: string;           // 수정 결과 요약 텍스트
  // 되돌리기 스냅샷 — 수정 적용 직전 값을 보관해 onUndo에서 복원
  prev?: {
    dxCode?: string;
    dxName?: string;
    dose?: string;
    special?: string;
  };
}

// ── 공통 인라인 래퍼 ──────────────────────────────────────────────────────────
// status 에 따라 3가지 모드:
//   pending   — 경고 메시지 + 사용자 액션 버튼들(children)
//   fixed     — 처리됨 + 되돌리기 + (옵션) 기초자료에도 반영
//   dismissed — 확인됨 + 되돌리기
function WarningRow({
  label, message, children, status, summary,
  appliedToMaster, onUndo, onApplyToMaster, masterLabel = "기초자료에도 반영",
}: {
  label: string;
  message: string;
  children?: React.ReactNode;
  status: PreCheckStatus;
  summary?: string;
  appliedToMaster?: boolean;
  onUndo?: () => void;
  onApplyToMaster?: () => void;     // 있으면 fixed 상태에 "기초자료에도 반영" 버튼 노출
  masterLabel?: string;
}) {
  if (status === "dismissed") {
    return (
      <div className="relative border-b border-[var(--line-default)]"
        style={{ backgroundColor: "var(--bg-subtle)", borderTop: `1px solid var(--line-subtle)` }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--text-disabled)" }} />
        <div className="flex items-center gap-2 pl-3 pr-3 h-8">
          <span className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-[3px]"
            style={{ color: "var(--text-tertiary)", backgroundColor: "var(--line-default)" }}>확인됨</span>
          <span className="text-[11px] text-[var(--text-tertiary)] flex-1 truncate">{message}</span>
          {onUndo && (
            <button onClick={onUndo}
              className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0">
              되돌리기
            </button>
          )}
        </div>
      </div>
    );
  }
  if (status === "fixed") {
    return (
      <div className="relative border-b border-[var(--line-default)]"
        style={{ backgroundColor: PRECHECK_BG, borderTop: `1px solid ${PRECHECK_BORDER}` }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--green-500)" }} />
        <div className="flex items-center gap-2 pl-3 pr-3 min-h-8 py-1 flex-wrap">
          <span className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-[3px] text-white"
            style={{ backgroundColor: "var(--green-500)" }}>처리됨</span>
          <span className="text-[11px] text-[var(--text-sub)] flex-1 min-w-0 truncate">{summary ?? message}</span>
          {appliedToMaster && (
            <span className="flex items-center gap-1 text-[10px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded-[3px]"
              style={{ color: "var(--brand-primary)", backgroundColor: "var(--bg-primary-subtle)" }}>
              <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              기초자료 반영됨
            </span>
          )}
          {!appliedToMaster && onApplyToMaster && (
            <button onClick={onApplyToMaster}
              className="h-6 px-3 text-[11px] font-medium rounded-[4px] flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] border"
              style={{ color: "var(--brand-primary)", borderColor: "var(--brand-primary)", backgroundColor: "white" }}>
              {masterLabel}
            </button>
          )}
          {onUndo && (
            <button onClick={onUndo}
              className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0">
              되돌리기
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="relative border-b border-[var(--line-default)]"
      style={{ backgroundColor: PRECHECK_BG, borderTop: `1px solid ${PRECHECK_BORDER}` }}>
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: PRECHECK_COLOR }} />
      <div className="flex items-center gap-2 pl-3 pr-3 min-h-8 py-1.5 flex-wrap">
        <span className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-[3px] text-white"
          style={{ backgroundColor: PRECHECK_COLOR }}>{label}</span>
        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: PRECHECK_COLOR }}>
          {message}
        </span>
        <div className="flex-1 min-w-[8px]" />
        {children}
      </div>
    </div>
  );
}

// ── 공통 팝오버 래퍼 (DurWarning과 동일 동작, 별도 정의로 의존성 분리) ────
function useOutsideClick(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-precheck-popover]") && !t.closest("[data-precheck-trigger]")) onClose();
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", h), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", h); };
  }, [active, onClose]);
}

function PopoverWrap({
  rect, width, onClose, children, alignRight,
}: {
  rect: DOMRect;
  width: number;
  onClose: () => void;
  children: React.ReactNode;
  alignRight?: boolean;
}) {
  useOutsideClick(true, onClose);
  const left = alignRight
    ? Math.max(8, rect.right - width)
    : Math.min(rect.left, (window.innerWidth || 1200) - width - 8);
  const fitsBelow = rect.bottom + 460 < (window.innerHeight || 800);
  const style: React.CSSProperties = fitsBelow
    ? { position: "fixed", top: rect.bottom + 4, left, width, zIndex: 9998 }
    : { position: "fixed", bottom: (window.innerHeight || 800) - rect.top + 4, left, width, zIndex: 9998 };
  return createPortal(
    <div data-precheck-popover style={style}
      className="bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.16)] border border-[var(--line-default)] overflow-hidden">
      {children}
    </div>,
    document.body
  );
}

function PopHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line-default)]">
      <span className="text-[12px] font-bold text-[var(--text-main)]">{title}</span>
      <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-[13px]">✕</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 1. 불완전상병 점검 — 인라인 행
// ╚══════════════════════════════════════════════════════════════════════════
export function IncompleteDxWarning({
  dxCode, dxName, options, resolution, onResolve, onApplyToMaster,
}: {
  dxCode: string;
  dxName: string;
  options: PreCheckCompleteOption[];
  resolution: PreCheckResolution;
  onResolve: (r: PreCheckResolution, replacement?: PreCheckCompleteOption) => void;
  onApplyToMaster: () => void;  // 기초자료 반영(영구화)
}) {
  const [pickerRect, setPickerRect] = useState<DOMRect | null>(null);
  const [search, setSearch] = useState("");

  const onUndo = () => onResolve({ status: "pending" });

  const fix = (opt: PreCheckCompleteOption) => {
    onResolve({
      status: "fixed",
      appliedToMaster: false,
      summary: `${dxCode} → ${opt.code} ${opt.name}로 교체됨`,
      prev: { dxCode, dxName },     // 되돌리기를 위해 원본 보관
    }, opt);
    setPickerRect(null);
  };

  const filtered = options.filter(o => !search ||
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    o.name.includes(search));

  return (
    <WarningRow
      label="불완전상병"
      message={`${dxCode} ${dxName} — 완전상병으로 교체 필요`}
      status={resolution.status}
      summary={resolution.summary}
      appliedToMaster={resolution.appliedToMaster}
      onUndo={resolution.status !== "pending" ? onUndo : undefined}
      onApplyToMaster={resolution.status === "fixed" ? onApplyToMaster : undefined}
      masterLabel="상병 기초자료에 반영"
    >
      {resolution.status === "pending" && (
        <>
          <button
            data-precheck-trigger
            onClick={e => setPickerRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
            className="h-6 px-3 text-[11px] text-white rounded-[4px] hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: PRECHECK_COLOR }}
          >완전상병 선택</button>
          <button
            onClick={() => onResolve({ status: "dismissed" })}
            className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0"
          >무시</button>
        </>
      )}

      {pickerRect && (
        <PopoverWrap rect={pickerRect} width={340} onClose={() => setPickerRect(null)} alignRight>
          <PopHead title="완전상병 선택" onClose={() => setPickerRect(null)} />
          <div className="px-3 py-1.5 border-b border-[var(--line-default)]" style={{ backgroundColor: PRECHECK_BG }}>
            <p className="text-[10px]" style={{ color: PRECHECK_COLOR }}>
              {dxCode}({dxName})를 다음 중 하나로 교체합니다
            </p>
          </div>
          <div className="px-3 py-2 border-b border-[var(--line-subtle)]">
            <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="코드 또는 명칭 검색..."
                className="text-[11px] bg-transparent flex-1 outline-none placeholder:text-[var(--text-placeholder)]" />
            </div>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.map(o => (
              <div key={o.code} className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-14 flex-shrink-0">{o.code}</span>
                <span className="text-[11px] text-[var(--text-main)] flex-1 truncate">{o.name}</span>
                <button onClick={() => fix(o)}
                  className="text-[10px] text-white rounded-[4px] px-2 py-1 flex-shrink-0 hover:opacity-90"
                  style={{ backgroundColor: PRECHECK_COLOR }}>선택</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-4 text-[11px] text-[var(--text-tertiary)] text-center">검색 결과 없음</div>
            )}
          </div>
        </PopoverWrap>
      )}
    </WarningRow>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 2. 마취과전문의 청구코드 점검 — 인라인 행
// ╚══════════════════════════════════════════════════════════════════════════
export function AnesthesiologistWarning({
  rxName, candidates, resolution, onResolve,
}: {
  rxName: string;
  candidates: Anesthesiologist[];
  resolution: PreCheckResolution;
  /** makeDefault — 모달의 "기본 마취과 전문의로 설정" 체크박스 값. 체크 시 기초자료 반영 처리됨. */
  onResolve: (r: PreCheckResolution, selected?: Anesthesiologist, makeDefault?: boolean) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const onUndo = () => onResolve({ status: "pending" });

  const handleSelect = (a: Anesthesiologist, makeDefault: boolean) => {
    onResolve({
      status: "fixed",
      appliedToMaster: makeDefault,
      summary: makeDefault
        ? `${rxName} — ${a.name}(면허 ${a.license}) · 기본 마취과 전문의로 설정`
        : `${rxName} — ${a.name}(면허 ${a.license})`,
      prev: { special: "" }, // 되돌리기 시 special을 비움 (전문의 정보 미입력 상태로 복원)
    }, a, makeDefault);
    setModalOpen(false);
  };

  return (
    <>
      <WarningRow
        label="마취과 전문의"
        message={`${rxName} — 마취과 전문의 정보가 누락되었습니다`}
        status={resolution.status}
        summary={resolution.summary}
        appliedToMaster={resolution.appliedToMaster}
        onUndo={resolution.status !== "pending" ? onUndo : undefined}
        // 마취과 전문의의 "기초자료 반영"은 모달 내부의 체크박스로 처리.
        // WarningRow의 post-fix 버튼은 노출하지 않는다.
      >
        {resolution.status === "pending" && (
          <>
            <button
              onClick={() => setModalOpen(true)}
              className="h-6 px-3 text-[11px] text-white rounded-[4px] hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: PRECHECK_COLOR }}
            >전문의 선택</button>
            <button
              onClick={() => onResolve({ status: "dismissed" })}
              className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0"
            >무시</button>
          </>
        )}
      </WarningRow>

      {modalOpen && (
        <AnesthesiologistModal
          candidates={candidates}
          onClose={() => setModalOpen(false)}
          onConfirm={handleSelect}
        />
      )}
    </>
  );
}

// 전문의 선택 모달 — 첨부 이미지(마취통증의학과 전문의 목록) 스타일
function AnesthesiologistModal({
  candidates, onClose, onConfirm,
}: {
  candidates: Anesthesiologist[];
  onClose: () => void;
  onConfirm: (a: Anesthesiologist, makeDefault: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [list, setList] = useState<Anesthesiologist[]>(candidates);
  const [makeDefault, setMakeDefault] = useState(false); // 기본 마취과 전문의로 설정 체크박스
  // 새 행 입력 상태
  const [draftName, setDraftName]       = useState("");
  const [draftLicense, setDraftLicense] = useState("");
  const [draftRrn, setDraftRrn]         = useState("");

  const toggle = (id: string) => setSelected(prev => prev === id ? null : id);
  const removeSelected = () => {
    if (!selected) return;
    setList(prev => prev.filter(a => a.id !== selected));
    setSelected(null);
  };
  const addDraft = () => {
    if (!draftName.trim() || !draftLicense.trim()) return;
    const a: Anesthesiologist = {
      id: `new-${Date.now()}`,
      name: draftName.trim(),
      license: draftLicense.trim(),
      rrn: draftRrn.trim(),
    };
    setList(prev => [...prev, a]);
    setDraftName(""); setDraftLicense(""); setDraftRrn("");
  };

  const confirm = () => {
    const picked = list.find(a => a.id === selected);
    if (!picked) return;
    onConfirm(picked, makeDefault);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-[640px] max-w-[92vw] max-h-[88vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line-default)]">
          <span className="text-[14px] font-bold text-[var(--text-main)]">마취통증의학과 전문의 목록</span>
          <button onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-[16px]">✕</button>
        </div>

        {/* Toolbar */}
        <div className="px-5 pt-4 flex justify-end">
          <button onClick={removeSelected}
            disabled={!selected}
            className="h-7 px-3 text-[11px] border border-[var(--line-default)] rounded-[6px] bg-white text-[var(--text-sub)] disabled:opacity-40 hover:bg-[var(--bg-subtle)]">
            삭제
          </button>
        </div>

        {/* Table */}
        <div className="px-5 pt-3 overflow-y-auto flex-1">
          <div className="border border-[var(--line-default)] rounded-md overflow-hidden">
            {/* Head */}
            <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-default)] px-2 py-2"
              style={{ gridTemplateColumns: "32px 1fr 1.2fr 1.5fr" }}>
              <span />
              <span className="text-[11px] font-medium text-[var(--text-sub)] text-center">이름</span>
              <span className="text-[11px] font-medium text-[var(--text-sub)] text-center">면허번호</span>
              <span className="text-[11px] font-medium text-[var(--text-sub)] text-center">주민등록번호</span>
            </div>
            {/* Rows */}
            {list.map((a) => (
              <div key={a.id}
                className={`grid items-center border-b border-[var(--line-subtle)] last:border-b-0 px-2 py-2 cursor-pointer hover:bg-[var(--bg-subtle)] ${
                  selected === a.id ? "bg-[var(--bg-primary-subtle)]" : ""
                }`}
                style={{ gridTemplateColumns: "32px 1fr 1.2fr 1.5fr" }}
                onClick={() => toggle(a.id)}>
                <div className="flex justify-center">
                  <span className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center ${
                    selected === a.id ? "border-[var(--brand-primary)]" : "border-[var(--text-disabled)]"
                  }`} style={selected === a.id ? { backgroundColor: "var(--brand-primary)" } : {}}>
                    {selected === a.id && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--text-main)] text-center">{a.name}</span>
                <span className="text-[12px] text-[var(--text-main)] text-center">{a.license}</span>
                <span className="text-[12px] text-[var(--text-main)] text-center">{a.rrn}</span>
              </div>
            ))}
            {/* Draft row (placeholder style — 첨부 이미지의 마지막 회색 행) */}
            <div className="grid items-center bg-[var(--bg-subtle)] px-2 py-2"
              style={{ gridTemplateColumns: "32px 1fr 1.2fr 1.5fr" }}>
              <div />
              <input value={draftName} onChange={e => setDraftName(e.target.value)}
                placeholder="이름"
                className="text-[12px] text-center bg-transparent outline-none placeholder:text-[var(--text-tertiary)] focus:bg-white focus:border focus:border-[var(--brand-primary)] rounded-[3px] px-1 py-0.5" />
              <input value={draftLicense} onChange={e => setDraftLicense(e.target.value)}
                placeholder="면허번호"
                className="text-[12px] text-center bg-transparent outline-none placeholder:text-[var(--text-tertiary)] focus:bg-white focus:border focus:border-[var(--brand-primary)] rounded-[3px] px-1 py-0.5" />
              <input value={draftRrn} onChange={e => setDraftRrn(e.target.value)}
                onBlur={addDraft}
                onKeyDown={e => { if (e.key === "Enter") addDraft(); }}
                placeholder="주민등록번호"
                className="text-[12px] text-center bg-transparent outline-none placeholder:text-[var(--text-tertiary)] focus:bg-white focus:border focus:border-[var(--brand-primary)] rounded-[3px] px-1 py-0.5" />
            </div>
          </div>

          {/* 기본 마취과 전문의로 설정 — 체크 시 저장 후 기초자료에 반영됨 */}
          <label className="flex items-center gap-2 mt-4 px-1 cursor-pointer select-none">
            <span
              onClick={() => setMakeDefault(v => !v)}
              className={`w-4 h-4 rounded-[3px] flex items-center justify-center border transition-colors flex-shrink-0 ${
                makeDefault ? "border-[var(--brand-primary)]" : "border-[var(--text-disabled)]"
              }`}
              style={makeDefault ? { backgroundColor: "var(--brand-primary)" } : {}}
            >
              {makeDefault && (
                <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[12px] text-[var(--text-main)]">기본 마취과 전문의로 설정</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">— 이후 동일 청구코드 처방 시 자동으로 입력됩니다</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--line-default)]">
          <button onClick={onClose}
            className="h-9 px-4 text-[12px] border border-[var(--line-default)] rounded-md bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button onClick={confirm} disabled={!selected}
            className="h-9 px-5 text-[12px] font-bold text-white rounded-md disabled:opacity-40"
            style={{ backgroundColor: "var(--bg-inverse)" }}>
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 3. 용량 0 처방 점검 — 인라인 행
// ╚══════════════════════════════════════════════════════════════════════════
export function ZeroDoseWarning({
  rxName, suggested, resolution, onResolve, onApplyToMaster,
}: {
  rxName: string;
  suggested?: string;
  resolution: PreCheckResolution;
  onResolve: (r: PreCheckResolution, dose?: string) => void;
  onApplyToMaster: () => void;
}) {
  const [val, setVal] = useState(suggested ?? "1");
  const onUndo = () => onResolve({ status: "pending" });
  const apply = () => {
    const dose = (val ?? "").trim();
    if (!dose || parseFloat(dose) <= 0) return;
    onResolve({
      status: "fixed",
      appliedToMaster: false,
      summary: `${rxName} 용량 ${dose}로 수정됨`,
      prev: { dose: "0" }, // 되돌리기 시 0으로 복원
    }, dose);
  };
  return (
    <WarningRow
      label="용량 0"
      message={`${rxName} — 용량이 0입니다. 권장 용량으로 수정하세요`}
      status={resolution.status}
      summary={resolution.summary}
      appliedToMaster={resolution.appliedToMaster}
      onUndo={resolution.status !== "pending" ? onUndo : undefined}
      onApplyToMaster={resolution.status === "fixed" ? onApplyToMaster : undefined}
      masterLabel="약품 기초자료에 반영"
    >
      {resolution.status === "pending" && (
        <>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setVal(v => String(Math.max(0, parseFloat(v || "0") - 0.5)))}
              className="w-6 h-6 rounded-[3px] border border-[var(--line-default)] bg-white text-[12px] hover:bg-[var(--bg-subtle)]">−</button>
            <input value={val} onChange={e => setVal(e.target.value)}
              className="w-12 h-6 text-center text-[11px] border border-[var(--line-default)] rounded-[3px] outline-none focus:border-[var(--brand-primary)]" />
            <button
              onClick={() => setVal(v => String(parseFloat(v || "0") + 0.5))}
              className="w-6 h-6 rounded-[3px] border border-[var(--line-default)] bg-white text-[12px] hover:bg-[var(--bg-subtle)]">＋</button>
            <span className="text-[10px] text-[var(--text-tertiary)] ml-1">권장 {suggested ?? "1"}</span>
          </div>
          <button
            onClick={apply}
            className="h-6 px-3 text-[11px] text-white rounded-[4px] hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: PRECHECK_COLOR }}
          >적용</button>
          <button
            onClick={() => onResolve({ status: "dismissed" })}
            className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0"
          >무시</button>
        </>
      )}
    </WarningRow>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 4. 출국자 점검 — 차트 상단 배너
// ╚══════════════════════════════════════════════════════════════════════════
export function DepartureBanner({
  patientName, departureDate, resolution, onResolve,
}: {
  patientName: string;
  departureDate: string;
  resolution: PreCheckResolution;
  onResolve: (r: PreCheckResolution, decision?: "convertToNonClaim" | "keepClaim") => void;
}) {
  if (resolution.status === "fixed" || resolution.status === "dismissed") {
    const isFixed = resolution.status === "fixed";
    return (
      <div className="rounded-md border flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
        style={{
          backgroundColor: isFixed ? "var(--status-success-bg-subtle)" : "var(--bg-subtle)",
          borderColor: isFixed ? "var(--green-200)" : "var(--line-default)",
        }}>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] text-white flex-shrink-0"
          style={{ backgroundColor: isFixed ? "var(--green-500)" : "var(--text-disabled)" }}>
          {isFixed ? "처리됨" : "확인됨"}
        </span>
        <span className="text-[11px] text-[var(--text-sub)] flex-1 min-w-0 truncate">{resolution.summary}</span>
        {/* 출국 정보는 1회성 결정 — 기초자료 반영하지 않음 */}
        <button onClick={() => onResolve({ status: "pending" })}
          className="h-6 px-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0">되돌리기</button>
      </div>
    );
  }
  const yes = () => onResolve({
    status: "fixed",
    summary: `${patientName} — 출국(${departureDate})으로 비청구 내원일 전환됨`,
  }, "convertToNonClaim");
  const no = () => onResolve({
    status: "fixed",
    summary: `${patientName} — 출국(${departureDate}) 확인, 청구 유지`,
  }, "keepClaim");
  return (
    <div className="rounded-md border flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
      style={{ backgroundColor: PRECHECK_BG, borderColor: PRECHECK_BORDER }}>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] text-white flex-shrink-0"
        style={{ backgroundColor: PRECHECK_COLOR }}>출국자</span>
      <span className="text-[11px] font-medium flex-shrink-0" style={{ color: PRECHECK_COLOR }}>
        {patientName} 환자는 {departureDate}에 출국 예정입니다. 비청구 내원일로 전환하시겠습니까?
      </span>
      <div className="flex-1 min-w-[8px]" />
      <button onClick={yes}
        className="h-7 px-3 text-[11px] font-medium text-white rounded-[6px] hover:opacity-90 flex-shrink-0"
        style={{ backgroundColor: PRECHECK_COLOR }}
      >예 — 비청구 전환</button>
      <button onClick={no}
        className="h-7 px-3 text-[11px] font-medium text-[var(--text-sub)] bg-white border border-[var(--line-default)] rounded-[6px] hover:bg-[var(--bg-subtle)] flex-shrink-0"
      >아니오 — 청구 유지</button>
      <button onClick={() => onResolve({ status: "dismissed", summary: `${patientName} 출국자 확인 무시` })}
        className="h-7 px-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0"
      >무시</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 5. 진료시간 점검 — 차트 상단 배너 + 시간 입력
// ╚══════════════════════════════════════════════════════════════════════════
const ZONE_LABEL: Record<DayNightHoliday, string> = { 주: "주간", 야: "야간", 공: "공휴일" };

// 시간으로부터 주야공 zone 판정 (간이 룰)
const zoneFromTime = (iso: string): DayNightHoliday => {
  if (!iso) return "주";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "주";
  const day = d.getDay(); // 0=일, 6=토
  if (day === 0) return "공";
  const hour = d.getHours();
  if (hour < 9 || hour >= 18) return "야";
  return "주";
};

export function TreatmentTimeBanner({
  chartZone, scheduleZone, scheduledAt, resolution, onResolve,
}: {
  chartZone: DayNightHoliday;
  scheduleZone: DayNightHoliday;
  scheduledAt: string;
  resolution: PreCheckResolution;
  onResolve: (r: PreCheckResolution, newScheduledAt?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(scheduledAt);

  const newZone = zoneFromTime(val);
  const willMatch = newZone === chartZone;

  if (resolution.status === "fixed" || resolution.status === "dismissed") {
    const isFixed = resolution.status === "fixed";
    return (
      <div className="rounded-md border flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
        style={{
          backgroundColor: isFixed ? "var(--status-success-bg-subtle)" : "var(--bg-subtle)",
          borderColor: isFixed ? "var(--green-200)" : "var(--line-default)",
        }}>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] text-white flex-shrink-0"
          style={{ backgroundColor: isFixed ? "var(--green-500)" : "var(--text-disabled)" }}>
          {isFixed ? "수정됨" : "확인됨"}
        </span>
        <span className="text-[11px] text-[var(--text-sub)] flex-1 truncate">{resolution.summary}</span>
        {/* 진료시간은 마스터에 반영하지 않음 — 항상 1회성 수정 */}
        <button onClick={() => onResolve({ status: "pending" })}
          className="h-6 px-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0">되돌리기</button>
      </div>
    );
  }

  const apply = () => {
    onResolve({
      status: "fixed",
      summary: `진료일시 ${val.replace("T", " ")} (${ZONE_LABEL[newZone]})로 수정`,
    }, val);
    setEditing(false);
  };

  return (
    <div className="rounded-md border flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
      style={{ backgroundColor: PRECHECK_BG, borderColor: PRECHECK_BORDER }}>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] text-white flex-shrink-0"
        style={{ backgroundColor: PRECHECK_COLOR }}>진료시간</span>
      <span className="text-[11px] font-medium flex-shrink-0" style={{ color: PRECHECK_COLOR }}>
        진료일시({ZONE_LABEL[scheduleZone]})와 차트 구분({ZONE_LABEL[chartZone]})이 다릅니다
      </span>

      {!editing ? (
        <>
          <span className="text-[11px] text-[var(--text-sub)] flex-shrink-0">현재 {scheduledAt.replace("T", " ")}</span>
          <div className="flex-1 min-w-[8px]" />
          <button onClick={() => { setEditing(true); setVal(scheduledAt); }}
            className="h-7 px-3 text-[11px] font-medium text-white rounded-[6px] hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: PRECHECK_COLOR }}
          >진료일시 수정</button>
          <button onClick={() => onResolve({
            status: "dismissed",
            summary: `진료시간 점검 — 차트(${ZONE_LABEL[chartZone]}) / 진료일시(${ZONE_LABEL[scheduleZone]}) 불일치 무시`,
          })}
            className="h-7 px-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0"
          >무시</button>
        </>
      ) : (
        <>
          <input
            type="datetime-local"
            value={val}
            onChange={e => setVal(e.target.value)}
            className="text-[11px] border border-[var(--line-default)] rounded-[6px] px-2 h-7 outline-none focus:border-[var(--brand-primary)] bg-white"
          />
          <span className="text-[10px] flex-shrink-0"
            style={{ color: willMatch ? "var(--green-500)" : "var(--red-500)" }}>
            → {ZONE_LABEL[newZone]} {willMatch ? "✓ 일치" : "✗ 불일치"}
          </span>
          <div className="flex-1 min-w-[8px]" />
          <button onClick={apply} disabled={!willMatch}
            className="h-7 px-3 text-[11px] font-medium text-white rounded-[6px] disabled:opacity-40"
            style={{ backgroundColor: PRECHECK_COLOR }}
          >적용</button>
          <button onClick={() => setEditing(false)}
            className="h-7 px-3 text-[11px] text-[var(--text-sub)] bg-white border border-[var(--line-default)] rounded-[6px] hover:bg-[var(--bg-subtle)] flex-shrink-0"
          >취소</button>
        </>
      )}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════
// ║ 사전점검 요약 바 — 차트 상단 (있을 때만 노출)
// ╚══════════════════════════════════════════════════════════════════════════
export function PreCheckSummaryBar({
  pendingCount, fixedCount, dismissedCount, onScrollToFirst,
}: {
  pendingCount: number;
  fixedCount: number;
  dismissedCount: number;
  onScrollToFirst?: () => void;
}) {
  if (pendingCount + fixedCount + dismissedCount === 0) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 rounded-md border"
      style={{ backgroundColor: PRECHECK_BG, borderColor: PRECHECK_BORDER }}>
      <span className="text-[11px] font-bold flex-shrink-0" style={{ color: PRECHECK_COLOR }}>
        사전점검 {pendingCount + fixedCount + dismissedCount}건
      </span>
      <span className="text-[11px] text-[var(--text-sub)]">
        {pendingCount > 0 && <>미처리 <b style={{ color: PRECHECK_COLOR }}>{pendingCount}</b></>}
        {pendingCount > 0 && (fixedCount > 0 || dismissedCount > 0) && " · "}
        {fixedCount > 0 && <>수정 <b style={{ color: "var(--green-500)" }}>{fixedCount}</b></>}
        {fixedCount > 0 && dismissedCount > 0 && " · "}
        {dismissedCount > 0 && <>확인됨 <b style={{ color: "var(--text-tertiary)" }}>{dismissedCount}</b></>}
      </span>
      <div className="flex-1" />
      {pendingCount > 0 && onScrollToFirst && (
        <button onClick={onScrollToFirst}
          className="h-6 px-2 text-[11px] bg-white border border-[var(--line-default)] rounded-[4px] hover:shadow-sm whitespace-nowrap"
          style={{ color: PRECHECK_COLOR, borderColor: PRECHECK_COLOR }}>
          첫 미처리로 이동
        </button>
      )}
    </div>
  );
}

// utilities export
export { zoneFromTime };
