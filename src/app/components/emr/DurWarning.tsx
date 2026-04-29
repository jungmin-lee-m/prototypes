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
export const PRECHECK_COLOR  = "#FF7B2E";
export const PRECHECK_BG     = "#FFF1E0";
export const PRECHECK_BORDER = "#FFE4C4";

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
      className="bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.16)] border border-[#DBDCDF] overflow-hidden">
      {children}
    </div>
  );
}

function PopHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#DBDCDF]">
      <span className="text-[11px] font-bold text-[#292A2D]">{title}</span>
      <button onClick={onClose} className="text-[#989BA2] hover:text-[#292A2D] text-[13px]">✕</button>
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
      <div className="px-3 py-1.5 bg-[#F7F7F8] border-b border-[#DBDCDF]">
        <span className="text-[10px] text-[#989BA2]">시스템 추천 — 동일 효능군, 사전심사 충돌 없음</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {list.map(d => (
          <div key={d.code} className="flex items-center gap-2 px-3 py-2 border-b border-[#F0F0F0] hover:bg-[#F7F7F8]">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#292A2D] truncate">{d.name}</p>
              <p className="text-[10px] text-[#989BA2]">1회 {d.dose}정 · {d.price.toLocaleString()}원</p>
            </div>
            <button onClick={() => onSelect(d)}
              className="text-[10px] text-white rounded-[4px] px-2 py-1 flex-shrink-0 hover:opacity-90"
              style={{ backgroundColor: PRECHECK_COLOR }}>
              선택
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="py-4 text-[11px] text-[#989BA2] text-center">검색 결과 없음</div>}
      </div>
      <div className="px-3 py-2 border-t border-[#DBDCDF]">
        <div className="flex items-center gap-1.5 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-7">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
            <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="다른 약품 검색..."
            className="text-[11px] bg-transparent flex-1 outline-none placeholder:text-[#BABBBE]" />
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
          <span className="text-[#989BA2]">현재 용량</span>
          <span className="font-medium text-[#292A2D]">{p.dose}정</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-[#989BA2]">권장 최대</span>
          <span className="font-medium text-[#FF4242]">{max}mg 이하</span>
        </div>
        <div className="h-px bg-[#DBDCDF]" />
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => adj(-0.5)}
            className="w-7 h-7 rounded-full border border-[#DBDCDF] flex items-center justify-center text-[16px] hover:bg-[#F7F7F8]">−</button>
          <span className={`text-[20px] font-bold w-14 text-center ${inRange ? "text-[#2EA652]" : "text-[#FF4242]"}`}>{val}</span>
          <button onClick={() => adj(0.5)}
            className="w-7 h-7 rounded-full border border-[#DBDCDF] flex items-center justify-center text-[16px] hover:bg-[#F7F7F8]">+</button>
        </div>
        <p className={`text-[10px] text-center ${inRange ? "text-[#2EA652]" : "text-[#FF4242]"}`}>
          {inRange ? "권장 범위 내" : "권장 최대 초과"}
        </p>
        <input type="range" min={0.25} max={max * 2} step={0.25} value={val}
          onChange={e => setVal(parseFloat(e.target.value))} className="w-full accent-[#FF7B2E]" />
        <div className="flex gap-2">
          <button onClick={() => { onApply(String(val)); onClose(); }} disabled={!inRange}
            className="flex-1 h-7 rounded-[6px] text-[11px] text-white disabled:opacity-40"
            style={{ backgroundColor: inRange ? PRECHECK_COLOR : "#ccc" }}>적용</button>
          <button onClick={onClose}
            className="flex-1 h-7 rounded-[6px] text-[11px] text-[#46474C] border border-[#DBDCDF] hover:bg-[#F7F7F8]">취소</button>
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
      <div className="px-3 py-1.5 border-b border-[#DBDCDF]" style={{ backgroundColor: PRECHECK_BG }}>
        <p className="text-[10px]" style={{ color: PRECHECK_COLOR }}>이 처방에 필요한 상병 추천</p>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {filtered.map(dx => {
          const already = existingDx.includes(dx.code);
          return (
            <div key={dx.code} className="flex items-center gap-2 px-3 py-2 border-b border-[#F0F0F0] hover:bg-[#F7F7F8]">
              <span className="text-[10px] font-medium text-[#989BA2] w-12 flex-shrink-0">{dx.code}</span>
              <span className="text-[11px] text-[#292A2D] flex-1">{dx.name}</span>
              {already
                ? <span className="text-[10px] text-[#2EA652] flex-shrink-0">등록됨</span>
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
      <div className="px-3 py-2 border-t border-[#DBDCDF]">
        <div className="flex items-center gap-1.5 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-7">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#989BA2" strokeWidth="1.4"/>
            <path d="M10 10L13.5 13.5" stroke="#989BA2" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="다른 상병 검색..."
            className="text-[11px] bg-transparent flex-1 outline-none placeholder:text-[#BABBBE]" />
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
        <div className="px-3 py-1.5 border-b border-[#DBDCDF]" style={{ backgroundColor: PRECHECK_BG }}>
          <p className="text-[10px]" style={{ color: PRECHECK_COLOR }}>모든 미처리 경고에 동일 사유 적용</p>
        </div>
      )}
      <div className="px-3 py-3 space-y-1.5">
        {[...QUICK_REASONS, "직접 입력"].map(r => (
          <label key={r} className="flex items-center gap-2 cursor-pointer group py-0.5">
            <div onClick={() => setSel(r)}
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                sel === r ? "border-[#FF7B2E]" : "border-[#C2C4C8] group-hover:border-[#FF7B2E]"
              }`}>
              {sel === r && <div className="w-1.5 h-1.5 rounded-full bg-[#FF7B2E]" />}
            </div>
            <span className="text-[11px] text-[#292A2D]" onClick={() => setSel(r)}>{r}</span>
          </label>
        ))}
        {sel === "직접 입력" && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="사유를 직접 입력하세요..."
            className="w-full mt-1 text-[11px] border border-[#DBDCDF] rounded-[6px] px-2 py-1.5 h-16 resize-none outline-none focus:border-[#FF7B2E]" />
        )}
      </div>
      <div className="px-3 py-2 border-t border-[#DBDCDF]">
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
        <p className="text-[10px] text-[#989BA2]">점검 범위</p>
        {opts.map(({ k, label }) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => tog(k)}
              className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center border transition-colors flex-shrink-0 ${
                checks[k] ? "border-[#FF7B2E]" : "border-[#C2C4C8]"
              }`} style={checks[k] ? { backgroundColor: PRECHECK_COLOR } : {}}>
              {checks[k] && <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
            </div>
            <span className="text-[11px] text-[#292A2D]">{label}</span>
          </label>
        ))}
        <div className="h-px bg-[#DBDCDF] my-1" />
        <p className="text-[10px] text-[#989BA2]">적용 범위</p>
        {([["this","이 환자에게만 적용"],["all","전체 환자에 적용"]] as const).map(([v, label]) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setScope(v)}
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                scope === v ? "border-[#FF7B2E]" : "border-[#C2C4C8]"
              }`}>
              {scope === v && <div className="w-1.5 h-1.5 rounded-full bg-[#FF7B2E]" />}
            </div>
            <span className="text-[11px] text-[#292A2D]">{label}</span>
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
}

export function DurWarningBar({
  p, durState, existingDx,
  onStateChange, onDelete, onDeleteConflict, onReplace, onAdjustDose, onAddDiagnosis,
  onHoverConflict, isConflictHighlighted,
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
    ...(isConflictHighlighted ? { boxShadow: `inset 0 0 0 2px ${PRECHECK_COLOR}50` } : {}),
  };

  // ── 처리된 상태 렌더링 ──────────────────────────────────────────────────────
  if (durState.status !== "pending") {
    const message = cfg.getMessage(p.durExtra);
    return (
      <div className="relative border-b border-[#DBDCDF]" style={wrapStyle}
        onMouseEnter={() => p.conflictCode && onHoverConflict(p.conflictCode)}
        onMouseLeave={() => p.conflictCode && onHoverConflict(null)}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: PRECHECK_COLOR }} />
        {/* 단일 행: 뱃지 + 내용 + 액션 버튼 */}
        <div className="flex items-center gap-2 pl-3 pr-3 h-8">
          {durState.status === "reasonEntered" && <StatusBadge label="사유 입력됨" color="white" bg="#2EA652" />}
          {durState.status === "replaced"      && <StatusBadge label="대체 완료"   color="white" bg="#0066FF" />}
          {durState.status === "dismissed"     && <StatusBadge label="확인됨"      color="#6B7280" bg="#E5E7EB" />}

          <span className="text-[11px] text-[#46474C] flex-1 min-w-0 truncate">
            {durState.status === "reasonEntered" && `사유: ${durState.reason}`}
            {durState.status === "replaced" && (
              <>{durState.replacedFrom} → {durState.replacedTo}</>
            )}
            {durState.status === "dismissed" && message}
          </span>

          {durState.status === "reasonEntered" && (
            <button data-precheck-btn="true" onClick={e => open("reason", e)}
              className="h-6 px-3 text-[11px] text-[#46474C] bg-white border border-[#DBDCDF] rounded-[4px] hover:shadow-sm flex-shrink-0">
              수정
            </button>
          )}
          <button onClick={() => onStateChange({ status: "pending" })}
            className="h-6 px-3 text-[11px] text-[#989BA2] hover:text-[#46474C] flex-shrink-0">
            되돌리기
          </button>
        </div>
      </div>
    );
  }

  // ── 미처리(pending) 상태 렌더링 ────────────────────────────────────────────
  return (
    <>
      <div className="relative border-b border-[#DBDCDF]" style={wrapStyle}
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
                className="h-6 px-3 text-[11px] text-[#989BA2] hover:text-[#70737C] flex-shrink-0 transition-colors">
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
                      : "bg-white border border-[#DBDCDF] text-[#46474C] hover:shadow-sm hover:border-[#C2C4C8]"
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
    if (s === "reasonEntered")       return { label: "사유 입력됨", color: "white", bg: "#2EA652" };
    if (s === "replaced")            return { label: "대체 완료", color: "white", bg: "#0066FF" };
    if (s === "dismissed")           return { label: "확인됨", color: "#6B7280", bg: "#E5E7EB" };
    return { label: s, color: "#292A2D", bg: "#F7F7F8" };
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
            <div key={p.code + i} className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F0F0F0] hover:bg-[#F7F7F8]">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#292A2D] font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-[#989BA2]">{cfg.label}</p>
              </div>
              <StatusBadge label={badge.label} color={badge.color} bg={badge.bg} />
              <button onClick={() => { onScrollTo(p.code); onClose(); }}
                className="text-[10px] text-[#453EDC] hover:underline flex-shrink-0 ml-1">
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
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2EA652]/30 bg-[#EDF8EF] flex-shrink-0 animate-pulse">
        <span className="text-[11px] text-[#2EA652]">모든 사전심사 경고 처리됨</span>
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
            className="h-7 px-3 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            모두 사유 일괄 입력
          </button>
          <button
            onClick={onBulkDismiss}
            className="h-7 px-3 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            모두 무시
          </button>
          <button
            onClick={onScrollToFirst}
            className="h-7 px-3 text-[11px] bg-white border border-[#DBDCDF] text-[#46474C] rounded-[4px] hover:shadow-sm whitespace-nowrap">
            하나씩 처리
          </button>
          <button
            data-precheck-btn="true"
            onClick={e => setSummaryRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
            className="h-7 px-3 text-[11px] bg-white border border-[#DBDCDF] rounded-[4px] hover:shadow-sm whitespace-nowrap"
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