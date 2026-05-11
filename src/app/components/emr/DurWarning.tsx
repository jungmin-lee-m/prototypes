// 사전심사 경고 시스템 — 인라인 경고 바, 팝오버, 상태 관리
// "DUR" 용어는 내부 타입명에만 사용하며 UI에는 노출하지 않는다.
import { useState, useEffect, useCallback } from "react";
import type { TodayPrescription, DurType } from "./chartTypes";

// ── Public types ──────────────────────────────────────────────────────────────
export type DurStatus = "pending" | "reasonEntered" | "replaced" | "dismissed" | "resolved";

export interface DurItemState {
  status: DurStatus;
  reason?: string;
  replacedFrom?: string;
  replacedTo?: string;
  appliedToMaster?: boolean; // 처리된 결과를 기초자료(약품·상병 마스터)에 반영했는지
}

export interface AlternativeDrug {
  code: string; name: string; dose: string; price: number;
}

// ── Static data ───────────────────────────────────────────────────────────────
const ALTERNATIVES: Record<string, AlternativeDrug[]> = {
  tnjam: [
    { code: "sita01", name: "시타글립틴정 100mg (자누비아)", dose: "1", price: 1890 },
    { code: "empa01", name: "엠파글리플로진정 10mg (자디앙)", dose: "1", price: 2340 },
    { code: "vilda01", name: "빌다글립틴정 50mg (가브스)", dose: "2", price: 980 },
    { code: "linagl", name: "리나글립틴정 5mg", dose: "1", price: 1650 },
  ],
  gv022: [
    { code: "met001", name: "메트포르민염산염정 500mg", dose: "2", price: 150 },
    { code: "acto01", name: "피오글리타존정 15mg (액토스)", dose: "1", price: 890 },
    { code: "dapa01", name: "다파글리플로진정 10mg (포시가)", dose: "1", price: 2100 },
  ],
  aspirin100: [
    { code: "clopi01", name: "클로피도그렐정 75mg (플라빅스)", dose: "1", price: 1200 },
    { code: "tica01",  name: "티카그렐러정 90mg (브릴린타)", dose: "2", price: 3400 },
    { code: "prasu01", name: "프라수그렐정 10mg (에피언트)", dose: "1", price: 2800 },
  ],
};
const DEFAULT_ALTS: AlternativeDrug[] = [
  { code: "alt001", name: "대체 약품 A (동일 효능군)", dose: "1", price: 1000 },
  { code: "alt002", name: "대체 약품 B (충돌 없음)", dose: "2", price: 1500 },
];
const getAlts = (code: string) => ALTERNATIVES[code] ?? DEFAULT_ALTS;

const QUICK_REASONS = [
  "만성질환 장기 복용 중",
  "환자 동의 하 진행",
  "증량 필요",
  "금기 아님 (의학적 판단)",
  "환자 특이체질",
];

const DX_SUGGESTIONS: Record<string, { code: string; name: string }[]> = {
  aspirin100: [
    { code: "I25.1", name: "죽상경화성 심장병" },
    { code: "I20.0", name: "불안정 협심증" },
    { code: "I63",   name: "뇌경색증" },
  ],
};

// ── 사전심사 경고 config — 모든 종류 동일한 시각 스타일 ──────────────────────
type ActionVariant = "primary" | "reason" | "dismiss";
interface PreCheckAction { label: string; variant: ActionVariant }
interface PreCheckCfg {
  color: string;  // 공통값 PRECHECK_COLOR — 타입 호환성 유지
  bg: string;     // 공통값 PRECHECK_BG
  label: string;
  getMessage: (extra?: string) => string;
  actions: PreCheckAction[];
}

// 공통 색상 (모든 경고 종류 동일)
export const PRECHECK_COLOR  = "var(--orange-500)";
export const PRECHECK_BG     = "var(--status-warning-bg-subtle)";
export const PRECHECK_BORDER = "var(--orange-100)";

const PRECHECK_CONFIG: Record<DurType, PreCheckCfg> = {
  prohibited: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "병용금기",
    getMessage: (e) => `병용금기 — ${e ?? "해당 약물"}과 동시 처방 불가`,
    actions: [
      { label: "대체처방",       variant: "primary" },
      { label: "이 처방 삭제",   variant: "primary" },
      { label: "충돌약 삭제",    variant: "primary" },
      { label: "사유 입력",      variant: "reason"  },
      { label: "무시",           variant: "dismiss" },
    ],
  },
  age: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "연령금기",
    getMessage: (e) => e ?? "연령금기 — 만 65세 이상 주의 (현재 환자 45세)",
    actions: [
      { label: "용량 조정",  variant: "primary" },
      { label: "대체처방",   variant: "primary" },
      { label: "사유 입력",  variant: "reason"  },
      { label: "무시",       variant: "dismiss" },
    ],
  },
  pregnancy: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "임부금기",
    getMessage: (e) => e ?? "임부금기 — 임신부 처방 주의 등급 D",
    actions: [
      { label: "대체처방",     variant: "primary" },
      { label: "이 처방 삭제", variant: "primary" },
      { label: "사유 입력",    variant: "reason"  },
      { label: "무시",         variant: "dismiss" },
    ],
  },
  duplicate: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "중복처방",
    getMessage: (e) => `중복처방 — ${e ?? "다른 약"}과 성분 중복`,
    actions: [
      { label: "이 처방 삭제",   variant: "primary" },
      { label: "다른 처방 삭제", variant: "primary" },
      { label: "사유 입력",      variant: "reason"  },
      { label: "무시",           variant: "dismiss" },
    ],
  },
  dose: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "용량주의",
    getMessage: (e) => `용량주의 — 권장 최대 용량(${e ?? "Xmg"}) 초과`,
    actions: [
      { label: "용량 조정",  variant: "primary" },
      { label: "사유 입력",  variant: "reason"  },
      { label: "무시",       variant: "dismiss" },
    ],
  },
  diagnosis: {
    color: PRECHECK_COLOR, bg: PRECHECK_BG,
    label: "상병 필요",
    getMessage: (e) => `상병 필요 — 이 처방은 ${e ?? "해당"} 상병이 필요합니다`,
    actions: [
      { label: "상병 추가",  variant: "primary" },
      { label: "사유 입력",  variant: "reason"  },
      { label: "무시",       variant: "dismiss" },
    ],
  },
};

export const getDurCfg = (durType?: string): PreCheckCfg =>
  PRECHECK_CONFIG[(durType as DurType) ?? "prohibited"] ?? PRECHECK_CONFIG.prohibited;

// ── Popover 기반 컴포넌트 ──────────────────────────────────────────────────────
function useOutsideClick(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-popover]") && !t.closest("[data-precheck-btn]")) onClose();
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", h), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", h); };
  }, [active, onClose]);
}

interface PwProps { rect: DOMRect; width: number; onClose: () => void; children: React.ReactNode; alignRight?: boolean }
function PopoverWrap({ rect, width, onClose, children, alignRight }: PwProps) {
  useOutsideClick(true, onClose);
  const left = alignRight
    ? Math.max(8, rect.right - width)
    : Math.min(rect.left, (window.innerWidth || 1200) - width - 8);
  const fitsBelow = rect.bottom + 420 < (window.innerHeight || 800);
  const style: React.CSSProperties = fitsBelow
    ? { position: "fixed", top: rect.bottom + 4, left, width, zIndex: 9998 }
    : { position: "fixed", bottom: (window.innerHeight || 800) - rect.top + 4, left, width, zIndex: 9998 };
  return (
    <div data-popover="true" style={style}
      className="bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.16)] border border-[var(--line-default)] overflow-hidden">
      {children}
    </div>
  );
}

function PopHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line-default)]">
      <span className="text-[11px] font-bold text-[var(--text-main)]">{title}</span>
      <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-[13px]">✕</button>
    </div>
  );
}

// ── 대체처방 팝오버 ────────────────────────────────────────────────────────────
function AltPopover({ rect, p, onSelect, onClose }: {
  rect: DOMRect; p: TodayPrescription;
  onSelect: (d: AlternativeDrug) => void; onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = getAlts(p.code).filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <PopoverWrap rect={rect} width={320} onClose={onClose}>
      <PopHead title="대체 처방 선택" onClose={onClose} />
      <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
        <span className="text-[10px] text-[var(--text-tertiary)]">시스템 추천 — 동일 효능군, 사전심사 충돌 없음</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {list.map(d => (
          <div key={d.code} className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[var(--text-main)] truncate">{d.name}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">1회 {d.dose}정 · {d.price.toLocaleString()}원</p>
            </div>
            <button onClick={() => onSelect(d)}
              className="text-[10px] text-white rounded-[4px] px-2 py-1 flex-shrink-0 hover:opacity-90"
              style={{ backgroundColor: PRECHECK_COLOR }}>
              선택
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="py-4 text-[11px] text-[var(--text-tertiary)] text-center">검색 결과 없음</div>}
      </div>
      <div className="px-3 py-2 border-t border-[var(--line-default)]">
        <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
            <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="다른 약품 검색..."
            className="text-[11px] bg-transparent flex-1 outline-none placeholder:text-[var(--text-placeholder)]" />
        </div>
      </div>
    </PopoverWrap>
  );
}

// ── 용량 조정 팝오버 ──────────────────────────────────────────────────────────
function DosePopover({ rect, p, onApply, onClose }: {
  rect: DOMRect; p: TodayPrescription;
  onApply: (dose: string) => void; onClose: () => void;
}) {
  const max = parseFloat(p.durExtra ?? "5");
  const [val, setVal] = useState(parseFloat(p.dose));
  const inRange = val <= max;
  const adj = (d: number) => setVal(v => Math.max(0.25, parseFloat((v + d).toFixed(2))));
  return (
    <PopoverWrap rect={rect} width={240} onClose={onClose} alignRight>
      <PopHead title="용량 조정" onClose={onClose} />
      <div className="px-3 py-3 space-y-3">
        <div className="flex justify-between text-[10px]">
          <span className="text-[var(--text-tertiary)]">현재 용량</span>
          <span className="font-medium text-[var(--text-main)]">{p.dose}정</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-[var(--text-tertiary)]">권장 최대</span>
          <span className="font-medium text-[var(--red-500)]">{max}mg 이하</span>
        </div>
        <div className="h-px bg-[var(--line-default)]" />
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => adj(-0.5)}
            className="w-7 h-7 rounded-full border border-[var(--line-default)] flex items-center justify-center text-[16px] hover:bg-[var(--bg-subtle)]">−</button>
          <span className={`text-[20px] font-bold w-14 text-center ${inRange ? "text-[var(--green-500)]" : "text-[var(--red-500)]"}`}>{val}</span>
          <button onClick={() => adj(0.5)}
            className="w-7 h-7 rounded-full border border-[var(--line-default)] flex items-center justify-center text-[16px] hover:bg-[var(--bg-subtle)]">+</button>
        </div>
        <p className={`text-[10px] text-center ${inRange ? "text-[var(--green-500)]" : "text-[var(--red-500)]"}`}>
          {inRange ? "권장 범위 내" : "권장 최대 초과"}
        </p>
        <input type="range" min={0.25} max={max * 2} step={0.25} value={val}
          onChange={e => setVal(parseFloat(e.target.value))} className="w-full accent-[var(--orange-500)]" />
        <div className="flex gap-2">
          <button onClick={() => { onApply(String(val)); onClose(); }} disabled={!inRange}
            className="flex-1 h-7 rounded-[6px] text-[11px] text-white disabled:opacity-40"
            style={{ backgroundColor: inRange ? PRECHECK_COLOR : "#ccc" }}>적용</button>
          <button onClick={onClose}
            className="flex-1 h-7 rounded-[6px] text-[11px] text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]">취소</button>
        </div>
      </div>
    </PopoverWrap>
  );
}

// ── 상병 추가 팝오버 ──────────────────────────────────────────────────────────
function DiagPopover({ rect, p, existingDx, onAdd, onClose }: {
  rect: DOMRect; p: TodayPrescription; existingDx: string[];
  onAdd: (dx: { code: string; name: string }) => void; onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const suggestions = DX_SUGGESTIONS[p.code] ?? [
    { code: "I25.1", name: "죽상경화성 심장병" },
    { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
    { code: "I10",   name: "본태성 고혈압" },
  ];
  const filtered = suggestions.filter(d => !q || d.name.includes(q) || d.code.includes(q));
  return (
    <PopoverWrap rect={rect} width={320} onClose={onClose} alignRight>
      <PopHead title="필요 상병 추가" onClose={onClose} />
      <div className="px-3 py-1.5 border-b border-[var(--line-default)]" style={{ backgroundColor: PRECHECK_BG }}>
        <p className="text-[10px]" style={{ color: PRECHECK_COLOR }}>이 처방에 필요한 상병 추천</p>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {filtered.map(dx => {
          const already = existingDx.includes(dx.code);
          return (
            <div key={dx.code} className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
              <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-12 flex-shrink-0">{dx.code}</span>
              <span className="text-[11px] text-[var(--text-main)] flex-1">{dx.name}</span>
              {already
                ? <span className="text-[10px] text-[var(--green-500)] flex-shrink-0">등록됨</span>
                : <button onClick={() => onAdd(dx)}
                    className="text-[10px] border rounded-[4px] px-2 py-0.5 flex-shrink-0 hover:opacity-80"
                    style={{ color: PRECHECK_COLOR, borderColor: PRECHECK_COLOR }}>
                    + 추가
                  </button>
              }
            </div>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-[var(--line-default)]">
        <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
            <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="다른 상병 검색..."
            className="text-[11px] bg-transparent flex-1 outline-none placeholder:text-[var(--text-placeholder)]" />
        </div>
      </div>
    </PopoverWrap>
  );
}

// ── 사유 입력 팝오버 ──────────────────────────────────────────────────────────
function ReasonPopover({ rect, defaultReason, onConfirm, onClose, title = "사유 입력", countLabel }: {
  rect: DOMRect; defaultReason?: string;
  onConfirm: (r: string) => void; onClose: () => void; title?: string; countLabel?: string;
}) {
  const [sel, setSel] = useState<string | null>(defaultReason ?? null);
  const [custom, setCustom] = useState(defaultReason ?? "");
  const final = sel === "직접 입력" ? custom : (sel ?? "");
  return (
    <PopoverWrap rect={rect} width={280} onClose={onClose} alignRight>
      <PopHead title={countLabel ? `${title} (${countLabel})` : title} onClose={onClose} />
      {countLabel && (
        <div className="px-3 py-1.5 border-b border-[var(--line-default)]" style={{ backgroundColor: PRECHECK_BG }}>
          <p className="text-[10px]" style={{ color: PRECHECK_COLOR }}>모든 미처리 경고에 동일 사유 적용</p>
        </div>
      )}
      <div className="px-3 py-3 space-y-1.5">
        {[...QUICK_REASONS, "직접 입력"].map(r => (
          <label key={r} className="flex items-center gap-2 cursor-pointer group py-0.5">
            <div onClick={() => setSel(r)}
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                sel === r ? "border-[var(--orange-500)]" : "border-[var(--text-disabled)] group-hover:border-[var(--orange-500)]"
              }`}>
              {sel === r && <div className="w-1.5 h-1.5 rounded-full bg-[var(--orange-500)]" />}
            </div>
            <span className="text-[11px] text-[var(--text-main)]" onClick={() => setSel(r)}>{r}</span>
          </label>
        ))}
        {sel === "직접 입력" && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="사유를 직접 입력하세요..."
            className="w-full mt-1 text-[11px] border border-[var(--line-default)] rounded-[6px] px-2 py-1.5 h-16 resize-none outline-none focus:border-[var(--orange-500)]" />
        )}
      </div>
      <div className="px-3 py-2 border-t border-[var(--line-default)]">
        <button onClick={() => final && onConfirm(final)} disabled={!final}
          className="w-full h-7 rounded-[6px] text-[11px] text-white disabled:opacity-40"
          style={{ backgroundColor: final ? PRECHECK_COLOR : "#ccc" }}>
          {countLabel ? `${countLabel} 일괄 적용` : "확인"}
        </button>
      </div>
    </PopoverWrap>
  );
}

// ── 설정 팝오버 ───────────────────────────────────────────────────────────────
export function SettingsPopover({ rect, onClose }: { rect: DOMRect; onClose: () => void }) {
  const [checks, setChecks] = useState({ reimbursed: true, nonReimbursed: true, iv: false, supp: false });
  const [scope, setScope] = useState<"this" | "all">("this");
  const tog = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }));
  const opts = [
    { k: "reimbursed",    label: "급여 약품 사전심사" },
    { k: "nonReimbursed", label: "비급여 약품 사전심사" },
    { k: "iv",            label: "영양주사·수액 포함" },
    { k: "supp",          label: "건강기능식품 포함" },
  ] as const;
  return (
    <PopoverWrap rect={rect} width={260} onClose={onClose} alignRight>
      <PopHead title="사전심사 범위 설정" onClose={onClose} />
      <div className="px-3 py-3 space-y-2">
        <p className="text-[10px] text-[var(--text-tertiary)]">점검 범위</p>
        {opts.map(({ k, label }) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => tog(k)}
              className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center border transition-colors flex-shrink-0 ${
                checks[k] ? "border-[var(--orange-500)]" : "border-[var(--text-disabled)]"
              }`} style={checks[k] ? { backgroundColor: PRECHECK_COLOR } : {}}>
              {checks[k] && <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
            </div>
            <span className="text-[11px] text-[var(--text-main)]">{label}</span>
          </label>
        ))}
        <div className="h-px bg-[var(--line-default)] my-1" />
        <p className="text-[10px] text-[var(--text-tertiary)]">적용 범위</p>
        {([["this","이 환자에게만 적용"],["all","전체 환자에 적용"]] as const).map(([v, label]) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setScope(v)}
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                scope === v ? "border-[var(--orange-500)]" : "border-[var(--text-disabled)]"
              }`}>
              {scope === v && <div className="w-1.5 h-1.5 rounded-full bg-[var(--orange-500)]" />}
            </div>
            <span className="text-[11px] text-[var(--text-main)]">{label}</span>
          </label>
        ))}
      </div>
    </PopoverWrap>
  );
}

// ── 상태 뱃지 컴포넌트 ────────────────────────────────────────────────────────
function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ color, backgroundColor: bg, padding: "2px 6px", borderRadius: "3px" }}
      className="text-[10px] font-bold flex-shrink-0">
      {label}
    </span>
  );
}

// ── 사전심사 경고 바 ──────────────────────────────────────────────────────────
type PopType = "alternative" | "dose" | "diagnosis" | "reason";

interface DurWarningBarProps {
  p: TodayPrescription;
  durState: DurItemState;
  existingDx: string[];
  onStateChange: (s: DurItemState) => void;
  onDelete: () => void;
  onDeleteConflict: () => void;
  onReplace: (d: AlternativeDrug) => void;
  onAdjustDose: (dose: string) => void;
  onAddDiagnosis: (dx: { code: string; name: string }) => void;
  onHoverConflict: (code: string | null) => void;
  isConflictHighlighted: boolean;
  /** 처리됨 상태에서 "기초자료에도 반영" 버튼 클릭 시 호출. 약품/상병 마스터에 결과를 영구화한다. */
  onApplyToMaster?: () => void;
}

export function DurWarningBar({
  p, durState, existingDx,
  onStateChange, onDelete, onDeleteConflict, onReplace, onAdjustDose, onAddDiagnosis,
  onHoverConflict, isConflictHighlighted,
  onApplyToMaster,
}: DurWarningBarProps) {
  const cfg = getDurCfg(p.durType);
  const [pop, setPop] = useState<{ type: PopType; rect: DOMRect } | null>(null);
  const open = useCallback((type: PopType, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPop({ type, rect: e.currentTarget.getBoundingClientRect() });
  }, []);
  const close = useCallback(() => setPop(null), []);

  if (durState.status === "resolved") return null;

  // ── 공통 래퍼 스타일 ────────────────────────────────────────────────────────
  const wrapStyle: React.CSSProperties = {
    backgroundColor: PRECHECK_BG,
    borderTop: `1px solid ${PRECHECK_BORDER}`,
    // 충돌 행 강조 — DS 200 톤 테두리 (이전 ${COLOR}50 알파 표기는 var() 위에서 invalid CSS였음)
    ...(isConflictHighlighted ? { boxShadow: `inset 0 0 0 2px var(--orange-200)` } : {}),
  };

  // ── 처리된 상태 렌더링 ──────────────────────────────────────────────────────
  if (durState.status !== "pending") {
    const message = cfg.getMessage(p.durExtra);
    // "기초자료에도 반영" 버튼 노출 — 사유/대체/용량/상병처럼 실제 수정한 케이스만
    const canApplyMaster = durState.status === "replaced" || durState.status === "reasonEntered";
    // 케이스별 마스터 라벨 — 항상 "약품 기초자료" 기준 (상병/용량을 약품에 자동 추가)
    const masterLabel = (() => {
      if (durState.status !== "replaced" && durState.status !== "reasonEntered") return "";
      // "상병 필요"는 약품 처방 시 함께 등록할 상병을 약품 기초자료에 추가
      if (p.durType === "diagnosis")  return `${p.name} 기초자료에 상병 추가`;
      // "용량주의"는 약품의 권장 용량을 마스터에 갱신
      if (p.durType === "dose")       return `${p.name} 기초자료에 용량 반영`;
      // "병용금기·중복처방·임부금기·연령금기"의 대체처방을 약품 기초자료에 자동 대체로 등록
      if (durState.status === "replaced") return "약품 기초자료에 대체 처방 등록";
      // 그 외 사유 입력 케이스 — 동일 환자/약품 조합에 대해 룰을 기억
      return "이 환자·약품 조합의 사유로 기억";
    })();

    return (
      <div className="relative border-b border-[var(--line-default)]" style={wrapStyle}
        onMouseEnter={() => p.conflictCode && onHoverConflict(p.conflictCode)}
        onMouseLeave={() => p.conflictCode && onHoverConflict(null)}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: PRECHECK_COLOR }} />
        {/* 단일 행: 뱃지 + 내용 + 액션 버튼 */}
        <div className="flex items-center gap-2 pl-3 pr-3 min-h-8 py-1 flex-wrap">
          {durState.status === "reasonEntered" && <StatusBadge label="처리됨"     color="white" bg="var(--green-500)" />}
          {durState.status === "replaced"      && <StatusBadge label="대체 완료"  color="white" bg="var(--brand-primary)" />}
          {durState.status === "dismissed"     && <StatusBadge label="확인됨"     color="var(--text-tertiary)" bg="var(--line-default)" />}

          <span className="text-[11px] text-[var(--text-sub)] flex-1 min-w-0 truncate">
            {durState.status === "reasonEntered" && `사유: ${durState.reason}`}
            {durState.status === "replaced" && (
              <>{durState.replacedFrom} → {durState.replacedTo}</>
            )}
            {durState.status === "dismissed" && message}
          </span>

          {/* 기초자료 반영됨 인디케이터 또는 반영 버튼 */}
          {canApplyMaster && durState.appliedToMaster && (
            <span className="flex items-center gap-1 text-[10px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded-[3px]"
              style={{ color: "var(--brand-primary)", backgroundColor: "var(--bg-primary-subtle)" }}>
              <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              기초자료 반영됨
            </span>
          )}
          {canApplyMaster && !durState.appliedToMaster && onApplyToMaster && (
            <button data-precheck-btn="true" onClick={onApplyToMaster}
              className="h-6 px-3 text-[11px] font-medium rounded-[4px] flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] border bg-white"
              style={{ color: "var(--brand-primary)", borderColor: "var(--brand-primary)" }}>
              {masterLabel}
            </button>
          )}

          {durState.status === "reasonEntered" && (
            <button data-precheck-btn="true" onClick={e => open("reason", e)}
              className="h-6 px-3 text-[11px] text-[var(--text-sub)] bg-white border border-[var(--line-default)] rounded-[4px] hover:shadow-sm flex-shrink-0">
              수정
            </button>
          )}
          <button onClick={() => onStateChange({ status: "pending" })}
            className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0">
            되돌리기
          </button>
        </div>
      </div>
    );
  }

  // ── 미처리(pending) 상태 렌더링 ────────────────────────────────────────────
  return (
    <>
      <div className="relative border-b border-[var(--line-default)]" style={wrapStyle}
        onMouseEnter={() => p.conflictCode && onHoverConflict(p.conflictCode)}
        onMouseLeave={() => p.conflictCode && onHoverConflict(null)}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: PRECHECK_COLOR }} />
        {/* 단일 행: 경고 메시지 + 퀵 액션 버튼 */}
        <div className="flex items-center gap-[6px] pl-3 pr-3 h-8">
          <span className="text-[11px] font-bold flex-shrink-0 mr-1" style={{ color: PRECHECK_COLOR }}>
            {cfg.getMessage(p.durExtra)}
          </span>
          <div className="flex-1" />
          {cfg.actions.map((act, idx) => {
            const isDismiss = act.variant === "dismiss";
            const isFirst   = idx === 0;

            if (isDismiss) return (
              <button key={act.label} data-precheck-btn="true"
                onClick={() => onStateChange({ status: "dismissed" })}
                className="h-6 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] flex-shrink-0 transition-colors">
                {act.label}
              </button>
            );

            const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              if (act.label === "이 처방 삭제" || act.label === "다른 처방 삭제") { onDelete(); return; }
              if (act.label === "충돌약 삭제") { onDeleteConflict(); return; }
              if (act.label === "대체처방")    { open("alternative", e); return; }
              if (act.label === "용량 조정")   { open("dose", e); return; }
              if (act.label === "상병 추가")   { open("diagnosis", e); return; }
              if (act.variant === "reason")    { open("reason", e); return; }
            };

            return (
              <button key={act.label} data-precheck-btn="true" onClick={handleClick}
                className={`h-6 px-3 text-[11px] rounded-[4px] whitespace-nowrap flex-shrink-0 transition-all ${
                    isFirst
                      ? "text-white hover:opacity-90"
                      : "bg-white border border-[var(--line-default)] text-[var(--text-sub)] hover:shadow-sm hover:border-[var(--text-disabled)]"
                }`}
                style={isFirst ? { backgroundColor: PRECHECK_COLOR } : {}}>
                {act.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 팝오버 */}
      {pop?.type === "alternative" && (
        <AltPopover rect={pop.rect} p={p}
          onSelect={d => {
            onReplace(d);
            onStateChange({ status: "replaced", replacedFrom: p.name, replacedTo: d.name });
            close();
          }} onClose={close} />
      )}
      {pop?.type === "dose" && (
        <DosePopover rect={pop.rect} p={p}
          onApply={dose => {
            onAdjustDose(dose);
            onStateChange({ status: "reasonEntered", reason: `용량 조정: ${dose}정 (권장 범위 내)` });
          }} onClose={close} />
      )}
      {pop?.type === "diagnosis" && (
        <DiagPopover rect={pop.rect} p={p} existingDx={existingDx}
          onAdd={dx => {
            onAddDiagnosis(dx);
            onStateChange({ status: "reasonEntered", reason: `상병 추가: ${dx.code} ${dx.name}` });
            close();
          }} onClose={close} />
      )}
      {pop?.type === "reason" && (
        <ReasonPopover rect={pop.rect} defaultReason={durState.reason}
          onConfirm={r => { onStateChange({ status: "reasonEntered", reason: r }); close(); }}
          onClose={close} />
      )}
    </>
  );
}

// ── 상세 요약 팝오버 ──────────────────────────────────────────────────────────
function SummaryPopover({ rect, prescriptions, durStates, onScrollTo, onClose }: {
  rect: DOMRect;
  prescriptions: TodayPrescription[];
  durStates: Record<string, DurItemState>;
  onScrollTo: (code: string) => void;
  onClose: () => void;
}) {
  const items = prescriptions.filter(p => p.isDur && durStates[p.code]?.status !== "resolved");
  const getStateBadge = (s: DurStatus | undefined) => {
    if (!s || s === "pending")       return { label: "미처리", color: PRECHECK_COLOR, bg: PRECHECK_BG };
    if (s === "reasonEntered")       return { label: "사유 입력됨", color: "white", bg: "var(--green-500)" };
    if (s === "replaced")            return { label: "대체 완료", color: "white", bg: "var(--brand-primary)" };
    if (s === "dismissed")           return { label: "확인됨", color: "var(--text-tertiary)", bg: "var(--line-default)" };
    return { label: s, color: "var(--text-main)", bg: "var(--bg-subtle)" };
  };
  return (
    <PopoverWrap rect={rect} width={340} onClose={onClose} alignRight>
      <PopHead title="사전심사 경고 요약" onClose={onClose} />
      <div className="max-h-[320px] overflow-y-auto">
        {items.map((p, i) => {
          const cfg = getDurCfg(p.durType);
          const st = durStates[p.code]?.status;
          const badge = getStateBadge(st);
          return (
            <div key={p.code + i} className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[var(--text-main)] font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{cfg.label}</p>
              </div>
              <StatusBadge label={badge.label} color={badge.color} bg={badge.bg} />
              <button onClick={() => { onScrollTo(p.code); onClose(); }}
                className="text-[10px] text-[var(--brand-primary)] hover:underline flex-shrink-0 ml-1">
                이동
              </button>
            </div>
          );
        })}
      </div>
    </PopoverWrap>
  );
}

// ── 일괄 처리 바 ─────────────────────────────────────────────────────────────
interface DurBatchBarProps {
  prescriptions: TodayPrescription[];
  durStates: Record<string, DurItemState>;
  onBulkReason: (reason: string) => void;
  onBulkDismiss: () => void;
  onScrollToFirst: () => void;
  onScrollTo?: (code: string) => void;
}

export function DurBatchBar({
  prescriptions, durStates, onBulkReason, onBulkDismiss, onScrollToFirst, onScrollTo,
}: DurBatchBarProps) {
  const durItems = prescriptions.filter(p => p.isDur && durStates[p.code]?.status !== "resolved");
  const pending    = durItems.filter(p => !durStates[p.code] || durStates[p.code].status === "pending");
  const reasonDone = durItems.filter(p => durStates[p.code]?.status === "reasonEntered");
  const replaced   = durItems.filter(p => durStates[p.code]?.status === "replaced");
  const dismissed  = durItems.filter(p => durStates[p.code]?.status === "dismissed");

  const [batchRect, setBatchRect]   = useState<DOMRect | null>(null);
  const [summaryRect, setSummaryRect] = useState<DOMRect | null>(null);
  const [doneVisible, setDoneVisible] = useState(false);

  // 모두 처리됨 → 초록 배너 노출 후 3초 fade out
  useEffect(() => {
    if (durItems.length > 0 && pending.length === 0) {
      setDoneVisible(true);
      const id = setTimeout(() => setDoneVisible(false), 3000);
      return () => clearTimeout(id);
    }
  }, [pending.length, durItems.length]);

  if (durItems.length < 2) return null;

  // 모두 처리됨 → 초록 배너
  if (pending.length === 0 && doneVisible) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--green-500)]/30 bg-[var(--status-success-bg-subtle)] flex-shrink-0 animate-pulse">
        <span className="text-[11px] text-[var(--green-500)]">모든 사전심사 경고 처리됨</span>
      </div>
    );
  }
  if (pending.length === 0) return null;

  // 요약 텍스트
  const parts: string[] = [`미처리 ${pending.length}건`];
  if (reasonDone.length > 0) parts.push(`사유 ${reasonDone.length}건`);
  if (replaced.length  > 0) parts.push(`대체 ${replaced.length}건`);
  if (dismissed.length > 0) parts.push(`확인됨 ${dismissed.length}건`);

  return (
    <>
      <div className="flex items-center gap-2 px-4 flex-shrink-0"
        style={{ height: "44px", backgroundColor: PRECHECK_BG, borderTop: `1px solid ${PRECHECK_BORDER}` }}>
        {/* 왼쪽: 요약 텍스트 */}
        <span className="text-[12px] font-bold flex-shrink-0 truncate" style={{ color: PRECHECK_COLOR }}>
          사전심사 경고 {durItems.length}건 — {parts.join(", ")}
        </span>
        <div className="flex-1" />
        {/* 오른쪽: 액션 버튼 */}
        <div className="flex items-center gap-[6px] flex-shrink-0">
          <button
            data-precheck-btn="true"
            onClick={e => setBatchRect(e.currentTarget.getBoundingClientRect())}
            className="h-7 px-3 text-[11px] bg-white border border-[var(--line-default)] text-[var(--text-sub)] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            모두 사유 일괄 입력
          </button>
          <button
            onClick={onBulkDismiss}
            className="h-7 px-3 text-[11px] bg-white border border-[var(--line-default)] text-[var(--text-sub)] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            모두 무시
          </button>
          <button
            onClick={onScrollToFirst}
            className="h-7 px-3 text-[11px] bg-white border border-[var(--line-default)] text-[var(--text-sub)] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            하나씩 처리
          </button>
          <button
            data-precheck-btn="true"
            onClick={e => setSummaryRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
            className="h-7 px-3 text-[11px] bg-white border border-[var(--line-default)] rounded-[4px] hover:shadow-sm whitespace-nowrap"
            style={{ color: PRECHECK_COLOR, borderColor: PRECHECK_COLOR }}>
            상세 요약
          </button>
        </div>
      </div>

      {/* 모두 사유 팝오버 */}
      {batchRect && (
        <ReasonPopover rect={batchRect} title="일괄 사유 입력" countLabel={`미처리 ${pending.length}건`}
          onConfirm={r => { onBulkReason(r); setBatchRect(null); }}
          onClose={() => setBatchRect(null)} />
      )}

      {/* 상세 요약 팝오버 */}
      {summaryRect && onScrollTo && (
        <SummaryPopover rect={summaryRect} prescriptions={prescriptions}
          durStates={durStates} onScrollTo={onScrollTo}
          onClose={() => setSummaryRect(null)} />
      )}
    </>
  );
}