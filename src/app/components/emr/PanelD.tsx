// Panel D: 차트 영역 (Main Chart Area)
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { TodayDiagnosis, TodayPrescription, Anesthesiologist, PreCheckCompleteOption, DayNightHoliday } from "./chartTypes";
import {
  getDurCfg, DurWarningBar, DurBatchBar, SettingsPopover,
  type DurItemState, type AlternativeDrug,
} from "./DurWarning";
import {
  IncompleteDxWarning, AnesthesiologistWarning, ZeroDoseWarning,
  DepartureBanner, TreatmentTimeBanner, PreCheckSummaryBar,
  type PreCheckResolution,
} from "./PreCheckWarning";

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
      checked ? "bg-[var(--bg-primary-subtle)] border border-[var(--blue-400)]" : "border border-[var(--line-default)]"
    }`}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// 진단 컬럼: 상병코드 / 명칭 / 의증 / 배제 / 좌 / 우 / 진료과 / 특정기호 / 상해외인 / 수술 / 영문명
// 명칭은 minmax로 최소폭(220px) 보장 — 패널이 좁아지면 좌우 스크롤 발생
const DIAG_COLS = "60px minmax(220px, 1fr) 32px 32px 28px 28px 88px 64px 64px 32px 80px";
const DIAG_MIN_WIDTH = "744px"; // 60+220+32+32+28+28+88+64+64+32+80 + 16(px-2) = 744

function DiagSearchRow() {
  return (
    <div className="grid items-center px-2 py-1.5 border-t border-[var(--line-default)] bg-white cursor-text"
      style={{ gridTemplateColumns: DIAG_COLS, minWidth: DIAG_MIN_WIDTH }}>
      <div className="flex items-center gap-1.5" style={{ gridColumn: "1 / -1" }}>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
          <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span className="text-xs text-[var(--text-placeholder)]">상병 검색 — 코드 또는 명칭 입력...</span>
      </div>
    </div>
  );
}

// ── 상용구 (즐겨찾기 스니펫) ─────────────────────────────────────
// 의사가 자주 쓰는 임상 텍스트 템플릿. 칩 클릭 시 텍스트 영역 끝에 추가됨.
// 실제 시스템에서는 사용자별로 등록·관리되는 데이터.
// favorite 가 true 인 스니펫만 하단 칩으로 노출 — undefined(preset) 도 표시
export type Snippet = {
  id: string;
  name: string;
  text: string;
  favorite?: boolean;
  targets?: string[];
};

const SYMPTOM_SNIPPETS: Snippet[] = [
  { id: "sym-1st", name: "1st", text: "초진 환자\n주증상: \n발병 시기: \n양상: \n관련 증상: " },
  { id: "sym-2nd", name: "2nd", text: "재진 환자\n이전 방문 후 경과: \n약 순응도: \n새로운 증상: " },
  { id: "sym-abd", name: "abd", text: "복부 통증\n부위: \n양상: \n시작 시점: \n악화/완화 인자: \n동반증상(N/V/D/C, 발열): " },
];

export const NOTE_SNIPPETS: Snippet[] = [
  { id: "note-1st", name: "1st", text: "S> \n\nO> \n\nA> \n# \n\nP> \n# " },
  { id: "note-2nd", name: "2nd", text: "재진 노트\n- 호전 양상: \n- 약 순응도: \n- 부작용 유무: \n- 다음 방문: " },
  { id: "note-abd", name: "abd", text: "복부 진찰\n- 시진: \n- 청진: 장음 정상\n- 촉진: 압통(-), 반발통(-), 종괴(-)\n- 타진: 정상" },
];

// 상용구 칩 행 — 텍스트 영역 하단에 노출. 클릭 시 onInsert로 텍스트 추가
// favorite 가 false 인 항목은 칩으로 노출하지 않음 (즐겨찾기만 빠른 접근 제공)
export function SnippetChips({ snippets, onInsert }: { snippets: Snippet[]; onInsert: (t: string) => void }) {
  const visible = snippets.filter(s => s.favorite !== false);
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)] flex-shrink-0 flex-wrap min-h-[34px]">
      {visible.length === 0 ? (
        <span className="text-xs text-[var(--text-tertiary)] italic px-1">즐겨찾기 상용구 없음</span>
      ) : (
        visible.map(s => (
          <button key={s.id}
            onClick={() => onInsert(s.text)}
            title={s.text.split("\n").slice(0, 3).join(" / ")}
            className="text-sm px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            {s.name}
          </button>
        ))
      )}
      <button title="상용구 관리"
        className="ml-auto text-md text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] px-1">
        ⋯
      </button>
    </div>
  );
}

// ── 상용구 등록 모달 ─────────────────────────────────────────────
// 텍스트를 드래그 후 floating toolbar 의 "상용구" 버튼을 누르면 노출됨.
// 코드(이름) + 즐겨찾기 + 내용 + 사용처(다중 선택) 입력. 즐겨찾기 ON 시에만 하단 칩으로 노출.
const SNIPPET_TARGETS = ["전체", "증상", "임상메모", "특정내역", "조제시참고사항", "처방메모", "예약메모", "환자메모"] as const;
type SnippetTarget = typeof SNIPPET_TARGETS[number];

export function SnippetRegisterModal({
  initialText,
  defaultTarget,
  onClose,
  onSubmit,
}: {
  initialText: string;
  defaultTarget: SnippetTarget;
  onClose: () => void;
  onSubmit: (data: { code: string; text: string; favorite: boolean; targets: string[] }) => void;
}) {
  const [code, setCode] = useState("");
  const [favorite, setFavorite] = useState(true);
  const [text, setText] = useState(initialText);
  const [targets, setTargets] = useState<Set<string>>(new Set([defaultTarget]));

  const toggleTarget = (t: string) => {
    setTargets(prev => {
      const next = new Set(prev);
      if (t === "전체") {
        // "전체" 선택 시 다른 선택 해제하고 전체만 선택
        return next.has("전체") ? new Set() : new Set(["전체"]);
      }
      if (next.has(t)) next.delete(t); else next.add(t);
      // 다른 항목 선택되면 "전체" 자동 해제
      next.delete("전체");
      return next;
    });
  };

  const canSubmit = code.trim().length > 0 && text.trim().length > 0 && targets.size > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      code: code.trim(),
      text,
      favorite,
      targets: Array.from(targets),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-[460px] max-w-[92vw] flex flex-col overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-lg font-bold text-[var(--text-main)]">상용구 등록</span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]"
            aria-label="닫기"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* 코드 + 즐겨찾기 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[var(--text-main)]">
              코드 <span className="text-[var(--red-500)]">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-md font-mono text-[var(--text-tertiary)] flex-shrink-0">/</span>
              <input
                value={code}
                onChange={e => setCode(e.target.value.slice(0, 20))}
                maxLength={20}
                placeholder="코드를 입력해주세요 (최대 20자)"
                className="flex-1 h-8 px-2.5 text-md text-[var(--text-main)] border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <button
                onClick={() => setFavorite(f => !f)}
                title={favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors flex-shrink-0 ${
                  favorite
                    ? "bg-[var(--orange-50,#FFF7ED)] border-[var(--orange-500)] text-[var(--orange-500)]"
                    : "bg-white border-[var(--line-default)] text-[var(--text-tertiary)] hover:text-[var(--orange-500)]"
                }`}
              >
                <span className="text-lg leading-none">{favorite ? "★" : "☆"}</span>
              </button>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              즐겨찾기로 등록하면 임상메모 하단에 빠른 입력 칩으로 노출됩니다.
            </span>
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[var(--text-main)]">
              내용 <span className="text-[var(--red-500)]">*</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              className="w-full px-2.5 py-2 text-md text-[var(--text-main)] leading-[18px] border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] resize-none"
              placeholder="상용구 내용을 입력해주세요"
            />
          </div>

          {/* 사용처 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[var(--text-main)]">
              사용처 <span className="text-[var(--red-500)]">*</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {SNIPPET_TARGETS.map(t => {
                const active = targets.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTarget(t)}
                    className={`h-7 px-2.5 text-sm rounded-md border transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold"
                        : "bg-white border-[var(--line-default)] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 h-12 border-t border-[var(--line-default)] flex-shrink-0 bg-[var(--bg-subtle)]">
          <button
            onClick={onClose}
            className="h-8 px-3 text-md font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`h-8 px-4 text-md font-bold rounded-md text-white transition-colors ${
              canSubmit
                ? "bg-[var(--brand-primary)] hover:opacity-90"
                : "bg-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            등록
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 처방금지 약품 ─────────────────────────────────────────────────
// 환자별로 등록되는 처방금지 약품. 차트 처방 시 자동 경고로 활용됨.
type BannedDrug = {
  id: string;
  registeredAt: string;     // YYYY-MM-DD
  drugName: string;
  ingredientCode: string;   // 주성분코드
  memo: string;
  banSameIngredient: boolean;  // 동일성분금지
  allowPrescribe: boolean;     // 처방허용 (예외 허용)
};

// 오늘 날짜 (YYYY-MM-DD)
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// 처방코드 → 주성분코드 mock 매핑 (실제로는 마스터 DB 조회)
const mockIngredientCode = (drugCode: string): string => {
  // 간단히 코드 앞 3글자를 대문자로 + 임의 숫자
  const prefix = drugCode.slice(0, 3).toUpperCase();
  return `${prefix}-${(drugCode.length * 7919).toString().slice(0, 6)}`;
};

// ── 처방금지 등록 모달 — 단일 약품에 대해 처방금지 등록 ───────────────
function BannedDrugRegisterModal({
  drug,
  onClose,
  onSubmit,
}: {
  drug: { name: string; code: string; ingredientCode: string };
  onClose: () => void;
  onSubmit: (data: Omit<BannedDrug, "id">) => void;
}) {
  const [memo, setMemo] = useState("");
  const [banSame, setBanSame] = useState(false);
  const [allowPrescribe, setAllowPrescribe] = useState(false);
  const today = todayISO();

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-[480px] max-w-[92vw] flex flex-col overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-lg font-bold text-[var(--text-main)]">처방금지 약품 등록</span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]" aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* 등록일 / 약품명 / 주성분코드 — read-only info */}
          <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-3 text-md">
            <span className="text-[var(--text-sub)] font-medium">등록일</span>
            <span className="text-[var(--text-main)] tabular-nums">{today}</span>
            <span className="text-[var(--text-sub)] font-medium">약품명</span>
            <span className="text-[var(--text-main)]">{drug.name}</span>
            <span className="text-[var(--text-sub)] font-medium">주성분코드</span>
            <span className="text-[var(--text-main)] font-mono">{drug.ingredientCode}</span>
          </div>

          <div className="h-px bg-[var(--line-default)]" />

          {/* 메모 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[var(--text-main)]">메모</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={3}
              placeholder="처방금지 사유를 입력해주세요 (예: 알러지 반응, 부작용 이력 등)"
              className="w-full px-2.5 py-2 text-md text-[var(--text-main)] leading-[18px] border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>

          {/* 옵션 체크박스 */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={banSame}
                onChange={e => setBanSame(e.target.checked)}
                className="mt-0.5 accent-[var(--brand-primary)]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-md font-medium text-[var(--text-main)]">동일성분금지</span>
                <span className="text-xs text-[var(--text-tertiary)]">주성분코드가 같은 다른 약품도 함께 처방금지 처리</span>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPrescribe}
                onChange={e => setAllowPrescribe(e.target.checked)}
                className="mt-0.5 accent-[var(--brand-primary)]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-md font-medium text-[var(--text-main)]">처방허용</span>
                <span className="text-xs text-[var(--text-tertiary)]">금지 등록되어 있어도 의사 판단 시 처방 가능 (경고만 표시)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 h-12 border-t border-[var(--line-default)] flex-shrink-0 bg-[var(--bg-subtle)]">
          <button
            onClick={onClose}
            className="h-8 px-3 text-md font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
          >
            취소
          </button>
          <button
            onClick={() => onSubmit({
              registeredAt: today,
              drugName: drug.name,
              ingredientCode: drug.ingredientCode,
              memo,
              banSameIngredient: banSame,
              allowPrescribe,
            })}
            className="h-8 px-4 text-md font-bold rounded-md text-white bg-[var(--brand-primary)] hover:opacity-90"
          >
            등록
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 처방금지 목록 팝오버 — 하단바 처방금지 버튼에서 열림 ──────────────
// 등록된 약품 리스트 + 처방 검색으로 즉시 추가 + 행별 삭제
function BannedDrugListPopover({
  rect,
  drugs,
  onClose,
  onAdd,
  onDelete,
  onUpdate,
}: {
  rect: DOMRect;
  drugs: BannedDrug[];
  onClose: () => void;
  onAdd: (drug: { name: string; code: string }) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BannedDrug>) => void;
}) {
  const [search, setSearch] = useState("");

  // 처방 검색 mock 결과 — 실제로는 마스터 검색 API
  const MOCK_DRUGS = [
    { name: "타이레놀정500mg", code: "tyl500" },
    { name: "이부프로펜정200mg", code: "ibu200" },
    { name: "암피실린캡슐250mg", code: "amp250" },
    { name: "페니실린주사", code: "pen-inj" },
    { name: "조영제(이오프로마이드)", code: "iopromide" },
    { name: "아스피린정100mg", code: "asp100" },
  ];
  const matches = search.trim()
    ? MOCK_DRUGS.filter(d => d.name.includes(search) || d.code.toLowerCase().includes(search.toLowerCase()))
    : [];

  // 팝오버 위치 — 하단바 버튼 위에 띄움 (위로 펼쳐지는 형태)
  const popWidth = 280;  // 컴팩트 — 메모/약품명을 행 내에서 세로 스택
  const top = rect.top - 8;  // 버튼 위쪽
  const left = Math.max(8, rect.left);

  return createPortal(
    <>
      {/* 외부 클릭 가드 */}
      <div className="fixed inset-0 z-[9998]" onMouseDown={onClose} />

      <div
        className="fixed z-[9999] bg-white rounded-lg border border-[var(--line-default)] shadow-2xl flex flex-col overflow-hidden"
        style={{
          left,
          top,
          width: popWidth,
          maxHeight: "70vh",
          transform: "translateY(-100%)",
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <span className="text-md font-bold text-[var(--text-main)]">
            처방금지 약품 <span className="text-[var(--text-tertiary)] tabular-nums">({drugs.length})</span>
          </span>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 처방 검색 (즉시 등록) */}
        <div className="px-2.5 py-2 border-b border-[var(--line-default)] relative">
          <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-md px-2 h-8">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="처방 검색 — 코드 또는 명칭 입력"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          {/* 검색 결과 드롭다운 */}
          {matches.length > 0 && (
            <div className="absolute left-2.5 right-2.5 top-[calc(100%-4px)] bg-white border border-[var(--line-default)] rounded-md shadow-lg max-h-[180px] overflow-y-auto z-10">
              {matches.map(m => (
                <button
                  key={m.code}
                  onClick={() => { onAdd(m); setSearch(""); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-[var(--bg-primary-subtle)]"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-[var(--text-tertiary)] flex-shrink-0">{m.code}</span>
                    <span className="text-sm text-[var(--text-main)] truncate">{m.name}</span>
                  </span>
                  <span className="text-xs text-[var(--brand-primary)] font-bold flex-shrink-0">+ 등록</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {drugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-1.5">
              <span className="text-[24px] opacity-30">🚫</span>
              <span className="text-sm text-[var(--text-tertiary)]">등록된 처방금지 약품이 없습니다</span>
              <span className="text-xs text-[var(--text-tertiary)]">검색 후 즉시 등록할 수 있어요</span>
            </div>
          ) : (
            <>
              {/* Column header — 컴팩트: 등록일 / 약품 / 동일·허용 / 삭제 */}
              <div className="grid bg-[var(--bg-base)] border-b border-[var(--line-default)] px-2 py-1 sticky top-0 z-10 gap-1"
                style={{ gridTemplateColumns: "44px 1fr 32px 32px 20px" }}>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">등록</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">약품 / 주성분 / 메모</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center" title="동일성분금지">동일</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center" title="처방허용">허용</span>
                <span />
              </div>
              {drugs.map(d => (
                <div
                  key={d.id}
                  className="grid items-start px-2 py-1.5 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)] gap-1"
                  style={{ gridTemplateColumns: "44px 1fr 32px 32px 20px" }}
                >
                  <span className="text-xs text-[var(--text-sub)] tabular-nums pt-0.5">{d.registeredAt.slice(5)}</span>
                  {/* 약품명 / 주성분 / 메모 — 세로 스택 */}
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-sm text-[var(--text-main)] truncate">{d.drugName}</span>
                    <span className="text-micro text-[var(--text-tertiary)] font-mono truncate">{d.ingredientCode}</span>
                    <input
                      value={d.memo}
                      onChange={e => onUpdate(d.id, { memo: e.target.value })}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      placeholder="메모..."
                      title={d.memo || "클릭하여 메모 편집"}
                      className="text-xs text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] truncate bg-transparent outline-none border border-transparent hover:border-[var(--line-default)] focus:border-[var(--brand-primary)] focus:bg-white rounded px-1 py-0"
                    />
                  </div>
                  <div className="flex justify-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={d.banSameIngredient}
                      onChange={e => onUpdate(d.id, { banSameIngredient: e.target.checked })}
                      title="동일성분금지"
                      className="accent-[var(--brand-primary)]"
                    />
                  </div>
                  <div className="flex justify-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={d.allowPrescribe}
                      onChange={e => onUpdate(d.id, { allowPrescribe: e.target.checked })}
                      title="처방허용"
                      className="accent-[var(--brand-primary)]"
                    />
                  </div>
                  <button
                    onClick={() => onDelete(d.id)}
                    title="삭제"
                    className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)] rounded mt-0.5"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ── 특정내역 (Specific Detail) — 처방 행에 첨부되는 청구 보조코드 + 평문 ──
// JX999: 기타내역 (free text 필수), JT019/JS001 등: 사유 코드 (free text 옵션)
type SpecialCode = { code: string; name: string; description: string; placeholder?: string };

const SPECIAL_CODES: SpecialCode[] = [
  { code: "JX999", name: "기타내역", description: "특정내역의 구분코드가 없는 경우 기타내역에 기재\n평문(FreeText) ※ 영문(700자), 한글(350자) (Y(700))", placeholder: "내용을 입력하세요. ('/' 입력하여 상용구 검색)" },
  { code: "JS001", name: "마취의사", description: "마취과 전문의 정보 기재 시 사용", placeholder: "마취의사 정보 입력" },
  { code: "JS002", name: "의약분업 예외구분코드", description: "의약분업 예외 사유 기재" },
  { code: "JS005", name: "검체검사 위탁", description: "검체검사 위탁 의뢰 시 기재" },
  { code: "JS006", name: "시설 등의 공동이용 진료", description: "시설/장비 공동이용 진료 시 기재" },
  { code: "JS007", name: "개방병원 의뢰진료", description: "개방병원 의뢰진료 시 기재" },
  { code: "JS008", name: "위탁진료", description: "위탁진료 시 기재" },
  { code: "JS009", name: "준용명", description: "준용 항목 기재" },
  { code: "JS010", name: "야간가산, 응급의료수가", description: "야간/응급 가산 사유 기재" },
  { code: "JS013", name: "기본·유도초음파 세부내역", description: "기본/유도초음파 세부 내역 기재" },
  { code: "JT001", name: "확인코드", description: "확인코드 기재" },
  { code: "JT005", name: "임산부초음파", description: "임산부 초음파 검사 세부내역" },
  { code: "JT007", name: "치매 검사결과", description: "치매 검사 결과 기재" },
  { code: "JT010", name: "저함량 의약품 배수처방사유", description: "저함량 의약품 배수 처방 사유" },
  { code: "JT011", name: "병용·연령금기 등 약제 처방사유", description: "병용·연령금기 등 약제 처방 사유" },
  { code: "JT012", name: "동일성분 의약품 중복 처방사유", description: "동일성분 중복 처방 사유" },
  { code: "JT013", name: "수술일자 기재(35세 이상 분만만 기재)", description: "수술일자 기재 (35세 이상 분만만)" },
  { code: "JT014", name: "장기처방(조제) 사유", description: "장기처방 사유 기재" },
  { code: "JT016", name: "내시경적 점막하 박리절제술(ESD)시 100/100 산정사유", description: "ESD 100/100 산정 사유" },
  { code: "JT017", name: "내용액제 처방(조제)사유", description: "내용액제 처방 사유" },
  { code: "JT018", name: "건강검진 실시 당일 진찰료 산정사유", description: "건강검진 당일 진찰료 산정 사유" },
  { code: "JT019", name: "필요시 투약하는 약제(PRN) 처방", description: "PRN(필요시 투약) 처방 사유" },
  { code: "JT023", name: "신경인지기능검사 세부검사항목코드", description: "신경인지기능검사 세부 항목" },
  { code: "JT024", name: "골밀도검사", description: "골밀도검사 세부내역" },
  { code: "JT030", name: "체중", description: "체중 기재" },
];

function SpecialDetailModal({
  rxName,
  initial,
  onClose,
  onSave,
}: {
  rxName: string;
  initial?: { code: string; content?: string };
  onClose: () => void;
  onSave: (detail: { code: string; content?: string }) => void;
}) {
  const [selectedCode, setSelectedCode] = useState(initial?.code ?? "JX999");
  const [content, setContent] = useState(initial?.content ?? "");
  const [search, setSearch] = useState("");

  const selected = SPECIAL_CODES.find(c => c.code === selectedCode) ?? SPECIAL_CODES[0];
  const filtered = search.trim()
    ? SPECIAL_CODES.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.includes(search))
    : SPECIAL_CODES;

  const bytes = new Blob([content]).size;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(820px, 94vw)", height: "min(640px, 88vh)" }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-lg font-bold text-[var(--text-main)]">줄단위 특정내역</span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]" aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 선택된 오더명 — context bar */}
        <div className="px-4 py-2 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-[var(--text-tertiary)]">선택된 오더명</span>
          <span className="text-md text-[var(--text-main)] truncate">{rxName}</span>
        </div>

        {/* Body — 좌(코드 리스트) / 우(설명 + 입력) */}
        <div className="flex-1 flex min-h-0">
          {/* Left: 검색 + 코드 테이블 */}
          <div className="w-[300px] flex-shrink-0 border-r border-[var(--line-default)] flex flex-col min-h-0">
            <div className="px-2.5 py-2 border-b border-[var(--line-default)] flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-md px-2 h-7">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                  <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="검색"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>
            {/* 헤더 */}
            <div className="grid items-center gap-2 px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0"
              style={{ gridTemplateColumns: "70px 1fr 36px" }}>
              <span className="text-xs font-medium text-[var(--text-tertiary)]">코드</span>
              <span className="text-xs font-medium text-[var(--text-tertiary)]">명칭</span>
              <span className="text-xs font-medium text-[var(--text-tertiary)] text-right">등록</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(c => {
                const active = selectedCode === c.code;
                return (
                  <button key={c.code}
                    onClick={() => setSelectedCode(c.code)}
                    className={`w-full grid items-center gap-2 px-2.5 py-1.5 border-b border-[var(--line-subtle)] text-left transition-colors ${
                      active ? "bg-[var(--bg-primary-subtle)]" : "hover:bg-[var(--bg-subtle)]"
                    }`}
                    style={{ gridTemplateColumns: "70px 1fr 36px" }}>
                    <span className={`text-sm font-mono ${active ? "text-[var(--brand-primary)] font-bold" : "text-[var(--text-link)]"}`}>{c.code}</span>
                    <span className="text-sm text-[var(--text-main)] truncate">{c.name}</span>
                    <span className="text-xs text-right" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: 코드 설명 + 입력 */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* 코드 설명 박스 */}
            <div className="m-3 mb-0 p-3 bg-[var(--bg-subtle)] rounded-md border border-[var(--line-default)] flex-shrink-0">
              <div className="text-md font-bold text-[var(--text-main)] mb-1">{selected.code}</div>
              <div className="text-sm text-[var(--text-sub)] leading-[16px] whitespace-pre-line">{selected.description}</div>
            </div>
            {/* 입력 textarea */}
            <div className="m-3 mt-2 flex-1 flex flex-col border border-[var(--line-default)] rounded-md overflow-hidden min-h-0">
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={selected.placeholder ?? "내용을 입력하세요. ('/' 입력하여 상용구 검색)"}
                className="flex-1 p-3 text-md text-[var(--text-main)] leading-[18px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent"
              />
              <div className="px-3 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1">
                  {["1st", "2nd", "abd"].map(t => (
                    <button key={t} className="text-xs px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                      {t}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{bytes} / 700 bytes (영문 700자, 한글 350자)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — 저장 */}
        <div className="flex items-center justify-end gap-2 px-4 h-12 border-t border-[var(--line-default)] flex-shrink-0 bg-white">
          <button onClick={onClose} className="h-8 px-3 text-md font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button
            onClick={() => onSave({ code: selectedCode, content: content.trim() || undefined })}
            className="h-8 px-4 text-md font-bold rounded-md text-white bg-[var(--text-main)] hover:opacity-90"
          >
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 예약처방 (Reserved Prescription) ────────────────────────────
// 다음 내원일 또는 미정 ("다음에") 으로 등록되는 처방. 원무 접수 시 자동 적용 가능.
type ReservedRx = {
  id: string;
  code: string;             // 사용자코드
  name: string;             // 명칭
  dose: string;             // 용량
  freq: number;             // 일투
  days: number;             // 일수
  method?: string;          // 용법
  insurancePrice: number;   // 보험가
  generalPrice: number;     // 일반가
  memo?: string;            // 처방별 메모 (예: 부작용 모니터, 검사 후 결정 등)
  scheduledDate: string | null;  // YYYY-MM-DD or null (= "다음에")
  registeredAt: string;     // YYYY-MM-DD
  registeredBy: string;     // 등록자 이름
};

// 수행일 빠른 선택 버튼 — 오늘 기준 N일/주/개월 후 날짜를 계산
const QUICK_DATE_OPTIONS: { label: string; days?: number; months?: number }[] = [
  { label: "1주",   days: 7 },
  { label: "2주",   days: 14 },
  { label: "1개월", months: 1 },
  { label: "2개월", months: 2 },
  { label: "3개월", months: 3 },
  { label: "6개월", months: 6 },
];

const addToTodayISO = (opt: { days?: number; months?: number }): string => {
  const d = new Date();
  if (opt.days)   d.setDate(d.getDate() + opt.days);
  if (opt.months) d.setMonth(d.getMonth() + opt.months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// 예약처방 등록 모달 — 컨텍스트 메뉴 "예약처방 등록" 클릭 시 열림
// 항목별로 수행일 / 메모를 다르게 지정 가능. 수행일 미지정 시 자동 "다음에"
// 상단의 일괄 적용 버튼은 모든 항목에 동일한 날짜를 한번에 셋팅
function ReservedRxRegisterModal({
  items,
  doctorName,
  onClose,
  onSubmit,
}: {
  items: { code: string; name: string; dose: string; freq: number; days: number; method?: string; price: number; }[];
  doctorName: string;
  onClose: () => void;
  onSubmit: (data: { dates: Record<number, string | null>; memos: Record<number, string> }) => void;
}) {
  // 항목별 날짜 — "" = 다음에 (null) 로 등록됨
  const [dates, setDates] = useState<Record<number, string>>({});
  const [memos, setMemos] = useState<Record<number, string>>({});

  const updateDate = (idx: number, value: string) => {
    setDates(prev => ({ ...prev, [idx]: value }));
  };
  const updateMemo = (idx: number, value: string) => {
    setMemos(prev => ({ ...prev, [idx]: value }));
  };

  // 일괄 적용 — 모든 항목에 동일한 날짜 셋팅. 빈 문자열 → 모두 "다음에"
  const bulkApplyDate = (value: string) => {
    const next: Record<number, string> = {};
    items.forEach((_, i) => { next[i] = value; });
    setDates(next);
  };

  const submit = () => {
    // 항목별 날짜 매핑 — 빈 값은 null (다음에)
    const dateMap: Record<number, string | null> = {};
    items.forEach((_, i) => {
      const d = dates[i];
      dateMap[i] = d && d.length > 0 ? d : null;
    });
    onSubmit({ dates: dateMap, memos });
  };

  // 모든 항목이 같은 날짜를 가질 때 어떤 quick option 인지 — 일괄 적용 버튼 활성 표시
  const allSameDate = (() => {
    const values = Array.from({ length: items.length }, (_, i) => dates[i] ?? "");
    const first = values[0];
    return values.every(v => v === first) ? first : null;
  })();
  const bulkActiveLabel = (() => {
    if (allSameDate === null || allSameDate === "") return null;
    const match = QUICK_DATE_OPTIONS.find(o => addToTodayISO(o) === allSameDate);
    return match?.label ?? null;
  })();

  // 등록 버튼 라벨 — 모든 항목이 "다음에" 면 "다음에 등록", 아니면 "예약 등록"
  const allUnscheduled = items.every((_, i) => !dates[i]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-[760px] max-w-[94vw] flex flex-col overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-lg font-bold text-[var(--text-main)]">
            예약처방 등록 <span className="text-[var(--text-tertiary)] tabular-nums">({items.length}건)</span>
          </span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]" aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* 일괄 적용 — 클릭 시 모든 항목 수행일에 동일 날짜 셋팅 */}
          <div className="flex items-center gap-2 flex-wrap bg-[var(--bg-base)] border border-[var(--line-default)] rounded-md px-2.5 py-2">
            <span className="text-sm font-bold text-[var(--text-main)] flex-shrink-0">일괄 적용</span>
            {QUICK_DATE_OPTIONS.map(opt => {
              const active = bulkActiveLabel === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => bulkApplyDate(addToTodayISO(opt))}
                  className={`h-7 px-2.5 text-sm rounded-md border transition-colors ${
                    active
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                      : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                  }`}
                >
                  +{opt.label}
                </button>
              );
            })}
            <button
              onClick={() => bulkApplyDate("")}
              className={`h-7 px-2.5 text-sm rounded-md border transition-colors ${
                allSameDate === ""
                  ? "bg-[var(--bg-subtle)] text-[var(--text-main)] border-[var(--text-disabled)] font-bold"
                  : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              다음에
            </button>
            <span className="ml-auto text-xs text-[var(--text-tertiary)]">항목별로 따로 지정 가능</span>
          </div>

          {/* 예약할 처방 — 항목별 수행일 / 메모 입력 */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--text-main)]">예약할 처방 <span className="text-xs text-[var(--text-tertiary)] font-normal">— 행마다 수행일 / 메모를 다르게 지정 가능</span></span>
            <div className="border border-[var(--line-default)] rounded-md overflow-hidden">
              {/* 헤더 */}
              <div className="grid items-center px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] gap-2"
                style={{ gridTemplateColumns: "56px 1.4fr 28px 28px 28px 60px 130px 1.4fr" }}>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">코드</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">명칭</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center">용량</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center">일투</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center">일수</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-right">단가</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">수행일</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">메모</span>
              </div>
              {/* 행 */}
              <div className="max-h-[320px] overflow-y-auto">
                {items.map((it, i) => {
                  const rowDate = dates[i] ?? "";
                  return (
                    <div key={i} className="grid items-center px-2.5 py-1.5 border-b border-[var(--line-subtle)] last:border-b-0 gap-2"
                      style={{ gridTemplateColumns: "56px 1.4fr 28px 28px 28px 60px 130px 1.4fr" }}>
                      <span className="text-xs font-mono text-[var(--text-tertiary)] truncate">{it.code}</span>
                      <span className="text-sm text-[var(--text-main)] truncate">{it.name}</span>
                      <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{it.dose}</span>
                      <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{it.freq}</span>
                      <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{it.days}</span>
                      <span className="text-xs text-right tabular-nums text-[var(--text-main)]">{it.price.toLocaleString()}원</span>
                      {/* 수행일 — 항목별 date input. 빈 값이면 회색으로 "다음에" 안내 */}
                      <div className="flex items-center gap-0.5">
                        <input
                          type="date"
                          value={rowDate}
                          onChange={e => updateDate(i, e.target.value)}
                          min={todayISO()}
                          className={`flex-1 h-7 px-1.5 text-sm border rounded outline-none focus:border-[var(--brand-primary)] ${
                            rowDate
                              ? "border-[var(--line-default)] text-[var(--text-main)]"
                              : "border-[var(--line-default)] text-[var(--text-tertiary)] bg-[var(--bg-base)]"
                          }`}
                          title={rowDate ? "" : "비워두면 '다음에' 로 등록됩니다"}
                        />
                        {rowDate && (
                          <button
                            onClick={() => updateDate(i, "")}
                            title="날짜 지우기 → '다음에'"
                            className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--red-500)] hover:bg-[var(--bg-subtle)] rounded"
                          >
                            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <input
                        value={memos[i] ?? ""}
                        onChange={e => updateMemo(i, e.target.value)}
                        placeholder="메모 (선택)"
                        className="h-7 px-2 text-sm text-[var(--text-main)] border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-tertiary)] bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 등록자 정보 */}
          <div className="flex items-center gap-3 text-sm text-[var(--text-sub)] border-t border-[var(--line-default)] pt-2">
            <span>등록일 <span className="font-mono tabular-nums text-[var(--text-main)]">{todayISO()}</span></span>
            <span>등록자 <span className="font-bold text-[var(--text-main)]">{doctorName}</span></span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 h-12 border-t border-[var(--line-default)] flex-shrink-0 bg-[var(--bg-subtle)]">
          <button onClick={onClose} className="h-8 px-3 text-md font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button
            onClick={submit}
            className="h-8 px-4 text-md font-bold rounded-md text-white bg-[var(--brand-primary)] hover:opacity-90"
          >
            {allUnscheduled ? "다음에 등록" : "예약 등록"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// 예약처방 목록 팝오버 — 하단바 예약처방 버튼에서 열림
// 등록된 모든 예약처방 (수행일 미정 포함) 노출. 행별 삭제 + 메모 인라인 편집.
function ReservedRxListPopover({
  rect,
  items,
  onClose,
  onDelete,
  onUpdate,
}: {
  rect: DOMRect;
  items: ReservedRx[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ReservedRx>) => void;
}) {
  // 정렬: 수행일 있는 것 먼저 (오름차순), 없는 것("다음에")은 뒤로
  const sorted = [...items].sort((a, b) => {
    if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
    if (a.scheduledDate) return -1;
    if (b.scheduledDate) return 1;
    return b.registeredAt.localeCompare(a.registeredAt);
  });

  const popWidth = 760;
  const top = rect.top - 8;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - popWidth - 8));

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onMouseDown={onClose} />
      <div
        className="fixed z-[9999] bg-white rounded-lg border border-[var(--line-default)] shadow-2xl flex flex-col overflow-hidden"
        style={{
          left,
          top,
          width: popWidth,
          maxHeight: "70vh",
          transform: "translateY(-100%)",
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <span className="text-md font-bold text-[var(--text-main)]">
            예약처방 목록 <span className="text-[var(--text-tertiary)] tabular-nums">({items.length})</span>
          </span>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-1.5">
              <span className="text-[24px] opacity-30">📅</span>
              <span className="text-sm text-[var(--text-tertiary)]">등록된 예약처방이 없습니다</span>
              <span className="text-xs text-[var(--text-tertiary)]">처방을 우클릭 → '예약처방 등록' 으로 추가</span>
            </div>
          ) : (
            <>
              <div className="grid bg-[var(--bg-base)] border-b border-[var(--line-default)] px-2.5 py-1.5 sticky top-0 z-10 gap-1"
                style={{ gridTemplateColumns: "70px 64px 1fr 32px 32px 32px 1.4fr 64px 56px 24px" }}>
                {["수행일","사용자코드","명칭","용량","일투","일수","메모","등록일","등록자",""].map((h, i) => (
                  <span key={i} className={`text-micro font-medium text-[var(--text-tertiary)] ${i === 2 || i === 6 ? "text-left" : "text-center"}`}>{h}</span>
                ))}
              </div>
              {sorted.map(r => {
                const isUnscheduled = r.scheduledDate === null;
                return (
                  <div key={r.id}
                    className="grid items-center px-2.5 py-1.5 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)] gap-1"
                    style={{ gridTemplateColumns: "70px 64px 1fr 32px 32px 32px 1.4fr 64px 56px 24px" }}>
                    {/* 수행일 — null이면 "다음에" 칩 */}
                    {isUnscheduled ? (
                      <span className="text-micro font-bold rounded-[3px] px-1 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--line-default)] text-center justify-self-center">다음에</span>
                    ) : (
                      <span className="text-xs tabular-nums text-center text-[var(--text-main)] font-medium">{r.scheduledDate?.slice(2).replace(/-/g, ".")}</span>
                    )}
                    <span className="text-xs font-mono text-[var(--text-sub)] truncate">{r.code}</span>
                    <span className="text-sm text-[var(--text-main)] truncate">{r.name}</span>
                    <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{r.dose}</span>
                    <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{r.freq}</span>
                    <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{r.days}</span>
                    {/* 메모 — 클릭 시 즉시 편집 모드. blur 또는 Enter 시 저장 */}
                    <input
                      value={r.memo ?? ""}
                      onChange={e => onUpdate(r.id, { memo: e.target.value })}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      placeholder="메모 입력..."
                      title={r.memo || "클릭하여 메모 편집"}
                      className="text-xs truncate text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] bg-transparent outline-none border border-transparent rounded px-1 py-0.5 hover:border-[var(--line-default)] hover:bg-white focus:border-[var(--brand-primary)] focus:bg-white cursor-text transition-colors"
                    />
                    <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">{r.registeredAt.slice(2).replace(/-/g, ".")}</span>
                    <span className="text-xs text-center text-[var(--text-sub)] truncate">{r.registeredBy}</span>
                    <button
                      onClick={() => onDelete(r.id)}
                      title="삭제"
                      className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)] rounded justify-self-center"
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ── AI SOAP 뷰 — AI가 진료 음성을 SOAP 형식으로 정리한 결과를 단일 텍스트로 표시 ──
// S/O/A/P은 인라인 라벨로만 구분 (박스 분리 없음)
const SOAP_KEYS: ("S" | "O" | "A" | "P")[] = ["S", "O", "A", "P"];

function AiSoapView({
  soap, isRecording, onPaste, hasContent,
}: {
  soap: { S: string; O: string; A: string; P: string };
  isRecording: boolean;
  onPaste: () => void;
  hasContent: boolean;
}) {
  const lastFilledKey = [...SOAP_KEYS].reverse().find(k => soap[k]);

  return (
    // h-full로 부모 높이 채움 → 본문(flex-1, 자체 스크롤) / 버튼(shrink) 2단 구성
    <div className="flex flex-col h-full p-3 gap-2.5 min-h-0">
      {/* AI SOAP 본문 — 본문이 길어지면 이 영역만 스크롤됨 */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-md border border-[var(--line-default)] bg-white px-4 py-3">
        {hasContent ? (
          <div className="text-md text-[var(--text-main)] leading-[20px] flex flex-col gap-3">
            {SOAP_KEYS.map(k => {
              if (!soap[k]) return null;
              return (
                <p key={k} className="whitespace-pre-line">
                  <span className="font-bold mr-1.5" style={{ color: "var(--brand-primary)" }}>{k}.</span>
                  {soap[k].trim()}
                  {isRecording && k === lastFilledKey && (
                    <span className="inline-block w-0.5 h-3.5 align-middle ml-0.5 animate-pulse" style={{ background: "var(--red-500)" }} />
                  )}
                </p>
              );
            })}
          </div>
        ) : (
          <span className="text-sm text-[var(--text-tertiary)] italic">
            {isRecording ? "음성 인식 대기 중..." : "—"}
          </span>
        )}
      </div>

      {/* 증상란에 붙여넣기 — 항상 우하단 고정. 본문이 길어도 스크롤 영역 밖이라 항상 보임 */}
      <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
        <button
          disabled={!hasContent}
          onClick={onPaste}
          className="h-9 px-4 text-md font-bold rounded-md text-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          style={{ background: hasContent ? "var(--brand-primary)" : "var(--text-disabled)" }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M5 3h6M5 3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1M5 3v1h6V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 8h2M7 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          증상란에 붙여넣기
        </button>
      </div>
    </div>
  );
}

// 처방 컬럼: 사용자코드 | 명칭 | 용량 | 일투 | 일수 | 용법 | 특정내역 | 청구 | 수납방법 | 검체 | 단가 | 단위 | 청구코드 | 예외 | 가루 | 원내
// 명칭은 minmax로 최소폭(240px) 보장 — 패널이 좁아지면 좌우 스크롤 발생
const PRESC_COLS = "56px minmax(240px, 1fr) 32px 28px 28px 36px 52px 28px 60px 36px 56px 44px 60px 28px 28px 32px";
const PRESC_MIN_WIDTH = "860px"; // 56+240+32+28+28+36+52+28+60+36+56+44+60+28+28+32 + 16 = 860

// ── D1 접수정보 — 드롭다운 가능한 필드 정의 ──────────────────────────
type IntakeKey = "insurance" | "visitType" | "visitNum" | "claim" | "timezone" | "department" | "doctor";
interface IntakeFieldDef {
  key: IntakeKey;
  label: string;
  options: string[];
  color: string;
}
const INTAKE_FIELDS: IntakeFieldDef[] = [
  { key: "insurance",  label: "보험가입유형", options: ["직장", "지역", "의료급여", "자보", "산재"],                                  color: "var(--text-link)"     },
  { key: "visitType",  label: "진료유형",     options: ["외래", "입원"],                                                              color: "var(--text-main)"     },
  { key: "visitNum",   label: "초/재진",      options: ["초진", "재진"],                                                              color: "var(--text-main)"     },
  { key: "claim",      label: "청구구분",     options: ["청구", "비청구"],                                                            color: "var(--text-main)"     },
  { key: "timezone",   label: "시간구분",     options: ["주간", "야간", "공휴"],                                                      color: "var(--text-main)"     },
  { key: "department", label: "진료과",       options: ["내과", "외과", "정형외과", "이비인후과", "재활의학과", "마취통증의학과"], color: "var(--brand-primary)" },
  { key: "doctor",     label: "담당의",       options: ["김의사", "이의사", "박의사"],                                                color: "var(--brand-primary)" },
];

// 미니 드롭다운 — 버튼 클릭 시 portal 메뉴 노출, 옵션 선택으로 값 변경
function MiniDropdown({ value, label, options, color, onChange }: {
  value: string;
  label: string;
  options: string[];
  color: string;
  onChange: (v: string) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const open = !!rect;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-mini-dropdown]") && t !== btnRef.current && !btnRef.current?.contains(t as Node)) {
        setRect(null);
      }
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [open]);

  const toggle = () => {
    setRect(prev => prev ? null : btnRef.current?.getBoundingClientRect() ?? null);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        title={label}
        className={`bg-white border rounded-[4px] h-6 px-2 flex items-center justify-center gap-1 cursor-pointer select-none transition-colors ${
          open ? "border-[var(--brand-primary)]" : "border-[var(--line-default)] hover:border-[var(--brand-primary)]"
        }`}
      >
        <span className="text-xs font-bold whitespace-nowrap" style={{ color }}>{value}</span>
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3L4 5.5L6.5 3" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {rect && createPortal(
        <div data-mini-dropdown
          style={{
            position: "fixed",
            top: rect.bottom + 4,
            left: Math.min(rect.left, (window.innerWidth || 1200) - 180),
            minWidth: Math.max(rect.width, 110),
          }}
          className="z-[9998] bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[var(--line-default)] overflow-hidden py-1">
          <div className="px-3 pt-1 pb-1 text-micro font-bold text-[var(--text-tertiary)] uppercase tracking-wide border-b border-[var(--line-subtle)] mb-1">
            {label}
          </div>
          {options.map(opt => (
            <button key={opt}
              onClick={() => { onChange(opt); setRect(null); }}
              className={`w-full text-left px-3 py-1.5 text-md whitespace-nowrap transition-colors ${
                opt === value
                  ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-bold"
                  : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              }`}>
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function PrescSearchRow() {
  return (
    <div className="grid items-center px-2 py-1.5 border-t border-[var(--line-default)] bg-white cursor-text"
      style={{ gridTemplateColumns: PRESC_COLS, minWidth: PRESC_MIN_WIDTH }}>
      <div />
      <div className="flex items-center gap-1.5" style={{ gridColumn: "2 / -1" }}>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
          <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span className="text-xs text-[var(--text-placeholder)]">처방 검색 — 코드 또는 명칭 입력...</span>
      </div>
    </div>
  );
}

export function PanelD({
  diagnoses: initDiagnoses,
  prescriptions: initPrescriptions,
  symptom,
  onChangeSymptom,
  isRecording = false,
  soap = { S: "", O: "", A: "", P: "" },
  onPasteSoap,
}: {
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  symptom: string;
  onChangeSymptom?: (next: string) => void;
  // clinicalNote/onChangeClinicalNote는 ClinicalNoteCard (PanelB) 로 이동됨
  isRecording?: boolean;
  soap?: { S: string; O: string; A: string; P: string };
  onPasteSoap?: () => void;
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

  // ── 사전점검(PreCheck) state ────────────────────────────────────────────────
  // 행 단위 prechecks (incompleteDx, zeroDose, anesthesiologist) — code 키
  const [rowPreChecks, setRowPreChecks] = useState<Record<string, PreCheckResolution>>({});
  // 차트 단위 prechecks (departure, treatmentTime)
  const [departureCheck, setDepartureCheck] = useState<PreCheckResolution>({ status: "pending" });
  const [timeCheck,      setTimeCheck]      = useState<PreCheckResolution>({ status: "pending" });
  // 차트 단위 점검 입력 (실제 시스템에서는 환자/스케줄에서 받음)
  const [scheduledAt, setScheduledAt] = useState("2026-03-17T19:30");
  const chartZone: DayNightHoliday = "주";          // 차트는 주간 진료로 등록됨
  const scheduleZone: DayNightHoliday = "야";        // 진료일시는 야간(19:30)
  const departureDate = "2026-03-25";
  const patientName = "황미진";

  // pcId 기반 resolution lookup. dx 코드/처방 명칭이 바뀌어도 동일 row를 추적할 수 있도록 한다.
  const setRowPC = useCallback((pcId: string, r: PreCheckResolution) =>
    setRowPreChecks(prev => ({ ...prev, [pcId]: r })), []);
  const getRowPC = (pcId: string | undefined): PreCheckResolution =>
    (pcId && rowPreChecks[pcId]) || { status: "pending" };
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [settingsRect, setSettingsRect] = useState<DOMRect | null>(null);
  const [chartMenuRect, setChartMenuRect] = useState<DOMRect | null>(null);
  const chartMenuBtnRef = useRef<HTMLButtonElement>(null);

  // D2 sub-panel system — 어떤 서브패널을 노출할지 설정
  // 임상메모는 PanelB(환자 정보 영역)로 이동 — 환자 누적 메모이므로 차트별 영역에서 분리
  const D2_SUB_PANELS = ["증상", "이미지"] as const;
  type D2Sub = typeof D2_SUB_PANELS[number];
  const [d2Active, setD2Active] = useState<Set<D2Sub>>(new Set(D2_SUB_PANELS));
  const [d2SettingsRect, setD2SettingsRect] = useState<DOMRect | null>(null);
  const d2SettingsBtnRef = useRef<HTMLButtonElement>(null);

  // ── D1 접수정보 — 드롭다운으로 선택 가능 ──────────────────────────
  const [intake, setIntake] = useState<Record<IntakeKey, string>>({
    insurance:  "직장",
    visitType:  "외래",
    visitNum:   "재진",
    claim:      "청구",
    timezone:   "주간",
    department: "내과",
    doctor:     "김의사",
  });
  const setIntakeField = (key: IntakeKey) => (value: string) =>
    setIntake(prev => ({ ...prev, [key]: value }));

  // 증상 영역 탭 — "증상" 또는 "AI SOAP" (AI가 정리한 SOAP 요약)
  const [symptomTab, setSymptomTab] = useState<"증상" | "AI SOAP">("증상");

  // 임상메모 관련 state는 ClinicalNoteCard (PanelB) 로 이동됨

  // ── 처방금지 약품 ───────────────────────────────────────────────
  // 환자별 등록 — 차트 처방 시 자동 경고 트리거
  const [bannedDrugs, setBannedDrugs] = useState<BannedDrug[]>([]);
  // 단일 처방 행에서 컨텍스트 메뉴로 등록 시 — 모달에 prefill 할 약품 정보
  const [bannedRegisterDrug, setBannedRegisterDrug] = useState<{ name: string; code: string; ingredientCode: string } | null>(null);
  // 하단바 처방금지 버튼 popover 위치
  const [bannedListRect, setBannedListRect] = useState<DOMRect | null>(null);

  // 처방금지 약품 추가 (모달 또는 popover 검색에서 호출)
  const addBannedDrug = (data: Omit<BannedDrug, "id">) => {
    setBannedDrugs(prev => [...prev, { ...data, id: `ban-${Date.now()}` }]);
  };
  const updateBannedDrug = (id: string, patch: Partial<BannedDrug>) => {
    setBannedDrugs(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  };
  const deleteBannedDrug = (id: string) => {
    setBannedDrugs(prev => prev.filter(b => b.id !== id));
  };

  // ── 예약처방 ───────────────────────────────────────────────────
  // 샘플: 과거 등록 (수행일 미정 + 미래 일자 혼합) — 실제 시스템은 환자별 누적 데이터
  const [reservedRx, setReservedRx] = useState<ReservedRx[]>([
    { id: "res-sample-1", code: "dzls23", name: "이런검사", dose: "1", freq: 1, days: 1,
      insurancePrice: 23000, generalPrice: 23000,
      memo: "다음 내원 시 결과 확인",
      scheduledDate: null,
      registeredAt: "2025-08-12", registeredBy: intake.doctor },
    { id: "res-sample-2", code: "a1",     name: "저런검사", dose: "1", freq: 1, days: 1,
      insurancePrice: 23000, generalPrice: 23000,
      scheduledDate: null,
      registeredAt: "2025-08-12", registeredBy: intake.doctor },
    { id: "res-sample-3", code: "af12",   name: "판검사",   dose: "1", freq: 1, days: 1,
      insurancePrice: 23000, generalPrice: 23000,
      memo: "공복 8시간 필요",
      scheduledDate: "2026-08-12",
      registeredAt: "2025-08-12", registeredBy: intake.doctor },
    { id: "res-sample-4", code: "asf",    name: "부장검사", dose: "1", freq: 1, days: 1,
      insurancePrice: 23000, generalPrice: 23000,
      scheduledDate: "2026-08-12",
      registeredAt: "2025-08-12", registeredBy: intake.doctor },
  ]);
  // 컨텍스트 메뉴에서 예약 등록 시 모달에 전달할 항목들 (null = 모달 닫힘)
  const [reserveModalItems, setReserveModalItems] = useState<
    { code: string; name: string; dose: string; freq: number; days: number; method?: string; price: number; insurancePrice: number; generalPrice: number }[] | null
  >(null);
  const [reserveListRect, setReserveListRect] = useState<DOMRect | null>(null);

  const addReservedRx = (data: Omit<ReservedRx, "id">) => {
    setReservedRx(prev => [...prev, { ...data, id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]);
  };
  const deleteReservedRx = (id: string) => {
    setReservedRx(prev => prev.filter(r => r.id !== id));
  };
  const updateReservedRx = (id: string, patch: Partial<ReservedRx>) => {
    setReservedRx(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  // 오늘 등록된 예약처방만 — 처방 표 하단에 파란색 행으로 노출
  const todaysReservations = reservedRx.filter(r => r.registeredAt === todayISO());

  // ── 진단/처방 행 선택 (Ctrl/Shift 다중선택) + 우클릭 컨텍스트 메뉴 ─
  // table: 어떤 표의 선택인지 ("dx" | "rx") — 표 간 선택은 분리됨
  const [rowSelection, setRowSelection] = useState<{ table: "dx" | "rx"; codes: Set<string> } | null>(null);
  const [lastClickedCode, setLastClickedCode] = useState<{ table: "dx" | "rx"; code: string } | null>(null);
  const [rowContextMenu, setRowContextMenu] = useState<{
    x: number; y: number;
    table: "dx" | "rx";
    selectedCount: number;
    singleKind?: "drug" | "lab";  // 단일 선택일 때만 채워짐
  } | null>(null);

  // 행 클릭 — Ctrl(toggle) / Shift(range) / 일반(단일선택)
  const handleRowSelect = (
    table: "dx" | "rx",
    code: string,
    e: React.MouseEvent,
    allCodes: string[]
  ) => {
    const isSameTable = rowSelection?.table === table;
    const current = isSameTable ? rowSelection!.codes : new Set<string>();

    if (e.shiftKey && lastClickedCode?.table === table) {
      const start = allCodes.indexOf(lastClickedCode.code);
      const end = allCodes.indexOf(code);
      if (start !== -1 && end !== -1) {
        const [from, to] = start < end ? [start, end] : [end, start];
        const range = new Set(allCodes.slice(from, to + 1));
        setRowSelection({ table, codes: range });
        return;
      }
    }
    if (e.ctrlKey || e.metaKey) {
      const next = new Set(current);
      if (next.has(code)) next.delete(code); else next.add(code);
      setRowSelection({ table, codes: next });
      setLastClickedCode({ table, code });
      return;
    }
    setRowSelection({ table, codes: new Set([code]) });
    setLastClickedCode({ table, code });
  };

  // 행 우클릭 — 미선택 행이면 단일 선택으로 바꿈, 이미 선택된 행이면 선택 유지
  const handleRowContextMenu = (
    table: "dx" | "rx",
    code: string,
    e: React.MouseEvent,
    kind?: "drug" | "lab"
  ) => {
    e.preventDefault();
    const isSameTable = rowSelection?.table === table;
    const current = isSameTable ? rowSelection!.codes : new Set<string>();
    let nextCodes: Set<string>;
    if (current.has(code) && current.size > 1) {
      nextCodes = current; // 이미 다중선택 안에 포함됨 — 유지
    } else {
      nextCodes = new Set([code]);
      setRowSelection({ table, codes: nextCodes });
      setLastClickedCode({ table, code });
    }
    setRowContextMenu({
      x: e.clientX,
      y: e.clientY,
      table,
      selectedCount: nextCodes.size,
      singleKind: nextCodes.size === 1 ? (table === "rx" ? kind : undefined) : undefined,
    });
  };

  // 컨텍스트 메뉴 외부 클릭 / Esc / 스크롤 시 닫기
  useEffect(() => {
    if (!rowContextMenu) return;
    const close = () => setRowContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [rowContextMenu]);

  // 임상메모 핸들러 (handleNoteSelection / registerSnippet / pinSelection 등) 는
  // ClinicalNoteCard (PanelB) 로 이동됨

  const hasSoapContent = !!(soap.S || soap.O || soap.A || soap.P);
  // 녹음이 시작되면 자동으로 AI SOAP 탭으로 전환
  useEffect(() => {
    if (isRecording) setSymptomTab("AI SOAP");
  }, [isRecording]);

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

  // ── 사전점검 적용 핸들러 ────────────────────────────────────────────────────
  // pcId 기반으로 row를 찾아 수정. preCheck 자체는 보존해 처리됨 UI가 계속 보이게 한다.
  // 1) 불완전상병을 완전상병으로 교체
  const replaceIncompleteDx = useCallback((pcId: string, opt: PreCheckCompleteOption) => {
    setLocalDx(prev => prev.map(d =>
      d.pcId === pcId ? { ...d, code: opt.code, name: opt.name } : d
    ));
  }, []);

  // 2) 마취과 전문의 정보 추가 (해당 처방에 special 표기)
  const setAnesthesiologist = useCallback((pcId: string, a: Anesthesiologist) => {
    setLocalRx(prev => prev.map(p =>
      p.pcId === pcId ? { ...p, special: `${a.name}(${a.license})` } : p
    ));
  }, []);

  // 3) 용량 0 → 권장 용량으로 변경
  const fixZeroDose = useCallback((pcId: string, dose: string) => {
    setLocalRx(prev => prev.map(p =>
      p.pcId === pcId ? { ...p, dose } : p
    ));
  }, []);

  // 4) 출국자 → 비청구 전환 (모든 처방 claim=false)
  const convertVisitToNonClaim = useCallback(() => {
    setLocalRx(prev => prev.map(p => ({ ...p, claim: false })));
    showToast("내원일이 비청구로 전환되었습니다");
  }, [showToast]);

  // 사전점검 결과를 기초자료(상병/약품 마스터)에 반영
  // 실제 시스템에서는 마스터 API 호출. 여기서는 resolution 플래그만 갱신하고 토스트로 피드백.
  const markRowMaster = useCallback((pcId: string, label: string) => {
    setRowPreChecks(prev => {
      const cur = prev[pcId] ?? { status: "pending" };
      return { ...prev, [pcId]: { ...cur, appliedToMaster: true } };
    });
    showToast(`${label}이(가) 기초자료에 반영되었습니다`);
  }, [showToast]);
  // DUR(병용금기·연령금기·임부금기·중복처방·용량주의·상병필요) 처리 결과를 마스터에 반영
  const markDurMaster = useCallback((code: string, label: string) => {
    setDurStates(prev => {
      const cur = prev[code] ?? { status: "pending" };
      return { ...prev, [code]: { ...cur, appliedToMaster: true } };
    });
    showToast(`${label}이(가) 기초자료에 반영되었습니다`);
  }, [showToast]);

  // 청구 ↔ 비청구 토글
  const toggleClaim = useCallback((code: string) =>
    setLocalRx(prev => prev.map(p => p.code === code ? { ...p, claim: !p.claim } : p)), []);

  // 수납방법 — 드롭다운으로 직접 선택. "—" (undefined) 옵션 포함.
  const PAY_METHODS = ["보험가", "일반가", "보험가비급여", "수납없음"] as const;
  const setPayMethod = useCallback((code: string, value: string | undefined) =>
    setLocalRx(prev => prev.map(p => p.code === code ? { ...p, payMethod: value as typeof PAY_METHODS[number] | undefined } : p)), []);
  // 어느 행의 수납방법 드롭다운이 열려있는지
  const [payMenuFor, setPayMenuFor] = useState<{ code: string; rect: DOMRect } | null>(null);

  // 특정내역 모달 — 어느 행의 모달이 열려있는지 (rxCode 로 추적)
  const [specialModalFor, setSpecialModalFor] = useState<string | null>(null);
  const setRxSpecialDetail = useCallback((rxCode: string, detail: { code: string; content?: string } | undefined) =>
    setLocalRx(prev => prev.map(p => p.code === rxCode ? { ...p, specialDetail: detail } : p)), []);

  // 처방 행 셀 인라인 편집 (용량/일투/일수)
  // 편집 행이 다중선택에 포함되어 있으면 → 선택된 모든 행에 일괄 적용. 아니면 해당 행만.
  const updateRxField = useCallback(
    (rxCode: string, field: "dose" | "freq" | "days", rawValue: string) => {
      // freq / days 는 number, dose 는 string
      const isNum = field === "freq" || field === "days";
      const parsed: string | number = isNum
        ? (rawValue.replace(/[^0-9]/g, "") === "" ? 0 : parseInt(rawValue.replace(/[^0-9]/g, ""), 10))
        : rawValue;

      setLocalRx(prev => {
        // 현재 함수 호출 시점의 selection 으로 대상 결정
        const isMulti =
          rowSelection?.table === "rx" &&
          rowSelection.codes.has(rxCode) &&
          rowSelection.codes.size > 1;
        const targets = isMulti ? rowSelection!.codes : new Set([rxCode]);
        return prev.map(p => (targets.has(p.code) ? { ...p, [field]: parsed } : p));
      });
    },
    [rowSelection]
  );

  // 외부 클릭 / Esc / 스크롤 시 드롭다운 닫기
  useEffect(() => {
    if (!payMenuFor) return;
    const close = () => setPayMenuFor(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [payMenuFor]);

  // 원내/원외 토글 (약품에만 사용)
  const toggleInternal = useCallback((code: string) =>
    setLocalRx(prev => prev.map(p => p.code === code ? { ...p, isInternal: !p.isInternal } : p)), []);

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

  // 컬럼: PRESC_COLS / PRESC_MIN_WIDTH 상수 사용 — 명칭 최소폭(240px) 확보, 좁은 패널에서 좌우 스크롤

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-[var(--bg-subtle)] gap-1 p-1 overflow-hidden">

      {/* D1: 접수정보 바 (높이 고정 — PanelGroup 밖) */}
      <div className="bg-[var(--bg-primary-subtle)] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-2.5 py-1.5 flex items-center gap-3 flex-shrink-0 overflow-hidden">
        {/* 날짜 */}
        <span className="text-lg font-bold text-[var(--text-main)] whitespace-nowrap flex-shrink-0">2026.03.17 (화)</span>

        {/* 접수정보 — 보험구분·진료유형·초재진·청구·시간·진료과·담당의 (드롭다운) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {INTAKE_FIELDS.map(field => (
            <MiniDropdown
              key={field.key}
              value={intake[field.key]}
              label={field.label}
              options={field.options}
              color={field.color}
              onChange={setIntakeField(field.key)}
            />
          ))}
        </div>

        {/* 접수메모 필드 (레이블 + 내용) */}
        <div className="flex-1 min-w-0 bg-white border border-[var(--line-default)] rounded-[4px] px-[11px] py-[6px] flex items-center gap-[6px]">
          <span className="text-sm font-bold text-[var(--text-sub)] whitespace-nowrap flex-shrink-0">접수메모</span>
          <span className="text-sm text-[var(--text-main)] truncate">MRI 촬영 원함, 보호자(따님) 동반</span>
        </div>

        {/* 삼점 버튼 + 컨텍스트 메뉴 (portal로 클리핑 회피) */}
        <button
          ref={chartMenuBtnRef}
          onClick={e => setChartMenuRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
          className="w-5 h-5 flex items-center justify-center flex-shrink-0 hover:opacity-60"
        >
          <svg width="3" height="14" viewBox="0 0 2.1875 13.125" fill="none">
            <path d={MORE_DOTS_ICON_PATH} fill="var(--text-main)" />
          </svg>
        </button>
      </div>


      {/* 사전점검 — 차트 단위 알림 (D1과 PanelGroup 사이에 노출) */}
      {(durChecked || departureCheck.status !== "pending" || timeCheck.status !== "pending") && (
        <div className="flex flex-col gap-1 flex-shrink-0">
          <PreCheckSummaryBar
            pendingCount={
              (departureCheck.status === "pending" ? 1 : 0) +
              (timeCheck.status === "pending" ? 1 : 0) +
              localDx.filter(d => d.preCheck && getRowPC(d.code).status === "pending").length +
              localRx.filter(p => p.preCheck && getRowPC(p.code).status === "pending").length
            }
            fixedCount={
              (departureCheck.status === "fixed" ? 1 : 0) +
              (timeCheck.status === "fixed" ? 1 : 0) +
              Object.values(rowPreChecks).filter(r => r.status === "fixed").length
            }
            dismissedCount={
              (departureCheck.status === "dismissed" ? 1 : 0) +
              (timeCheck.status === "dismissed" ? 1 : 0) +
              Object.values(rowPreChecks).filter(r => r.status === "dismissed").length
            }
            onScrollToFirst={() => {
              const firstDx = localDx.find(d => d.preCheck && getRowPC(d.code).status === "pending");
              const firstRx = localRx.find(p => p.preCheck && getRowPC(p.code).status === "pending");
              const first = firstDx ?? firstRx;
              if (first) rowRefs.current[first.code]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
          <DepartureBanner
            patientName={patientName}
            departureDate={departureDate}
            resolution={departureCheck}
            onResolve={(r, decision) => {
              setDepartureCheck(r);
              if (decision === "convertToNonClaim") convertVisitToNonClaim();
            }}
          />
          <TreatmentTimeBanner
            chartZone={chartZone}
            scheduleZone={scheduleZone}
            scheduledAt={scheduledAt}
            resolution={timeCheck}
            onResolve={(r, newAt) => {
              setTimeCheck(r);
              if (newAt) setScheduledAt(newAt);
            }}
          />
        </div>
      )}

      <PanelGroup direction="vertical" className="flex-1">

      {/* D2: 증상 / 이미지 / 임상메모 — 설정 버튼으로 노출 항목 선택 */}
      <Panel defaultSize={25} minSize={12}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-full overflow-hidden relative">
        <div className="flex divide-x divide-[var(--line-default)] h-full">
          {d2Active.has("증상") && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* 탭 헤더 — "증상" / "STT" — 녹음 중에는 STT 탭 옆에 작은 빨간 펄스 도트만 표시 */}
              <div className="flex items-center gap-1 px-3 pt-2 border-b border-[var(--line-default)] flex-shrink-0">
                <button
                  onClick={() => setSymptomTab("증상")}
                  className={`px-2.5 pb-2 text-md font-bold border-b-2 transition-colors ${
                    symptomTab === "증상"
                      ? "border-[var(--text-main)] text-[var(--text-main)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
                  }`}
                >증상</button>
                <button
                  onClick={() => setSymptomTab("AI SOAP")}
                  className={`flex items-center gap-1.5 px-2.5 pb-2 text-md font-bold border-b-2 transition-colors ${
                    symptomTab === "AI SOAP"
                      ? "border-[var(--text-main)] text-[var(--text-main)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
                  }`}
                >
                  AI SOAP
                  {isRecording && (
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--red-500)] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--red-500)]" />
                    </span>
                  )}
                </button>
              </div>

              {/* 본문 — 탭별로 자체 스크롤/sticky 레이아웃 관리 */}
              <div className="flex-1 flex flex-col min-h-0">
                {symptomTab === "증상" ? (
                  <>
                    <textarea
                      value={symptom}
                      onChange={e => onChangeSymptom?.(e.target.value)}
                      placeholder="증상을 입력해주세요. ('/' 입력하여 상용구 검색)"
                      className="flex-1 p-3 text-sm text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent overflow-y-auto"
                    />
                    {/* 즐겨찾기 상용구 — 클릭 시 텍스트 추가 */}
                    <SnippetChips
                      snippets={SYMPTOM_SNIPPETS}
                      onInsert={t => onChangeSymptom?.(symptom ? `${symptom}\n${t}` : t)}
                    />
                  </>
                ) : (
                  <AiSoapView
                    soap={soap}
                    isRecording={isRecording}
                    onPaste={() => onPasteSoap?.()}
                    hasContent={hasSoapContent}
                  />
                )}
              </div>
            </div>
          )}
          {d2Active.has("이미지") && (
            // 이미지 영역 — 우측에 좁게 배치 (160px 고정폭). 증상 영역이 주 영역.
            <div className="w-[160px] flex-shrink-0 p-2 overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm font-bold text-[var(--text-main)] truncate">이미지</span>
                  <span className="text-micro bg-[var(--brand-primary)] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold flex-shrink-0">3</span>
                </div>
                <button title="이미지 업로드" className="w-5 h-5 flex items-center justify-center text-[var(--text-sub)] border border-[var(--line-default)] rounded-[3px] hover:bg-[var(--bg-subtle)] flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="rounded-[4px] overflow-hidden relative flex-1 min-h-0">
                <img src={medicalImages[0].url} alt={medicalImages[0].label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                  <span className="text-micro text-white font-medium drop-shadow truncate">{medicalImages[0].label}</span>
                </div>
              </div>
            </div>
          )}
          {/* 임상메모 sub-panel은 PanelB의 ClinicalNoteCard 로 이동됨 */}
          {d2Active.size === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-tertiary)]">
              우상단 ⚙ 버튼으로 표시할 항목을 선택하세요
            </div>
          )}
        </div>
        <button
          ref={d2SettingsBtnRef}
          onClick={e => setD2SettingsRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
          className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-md transition-colors"
          title="표시 항목 설정"
        >⚙</button>
      </div>
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

      {/* D3: 진단 + 처방 */}
      <Panel defaultSize={75} minSize={30}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Diagnosis Header */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">진단 및 처방</span>
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7 flex-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[var(--text-tertiary)]">통합 검색 (코드/명칭/증상)</span>
          </div>
          <button className="text-sm font-medium text-[var(--text-sub)] border border-[var(--line-default)] rounded-[4px] px-2 h-7 bg-white whitespace-nowrap flex-shrink-0">KOICD 분류</button>
          {/* Settings button — 사전심사 범위 설정 */}
          <button
            onClick={e => setSettingsRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-lg px-1 transition-colors flex-shrink-0"
            title="사전심사 설정"
          >⚙</button>
        </div>

        {/* D3 Body: 진단 + 처방 + 작동하는 스플리터 */}
        <PanelGroup direction="vertical" className="flex-1">

          {/* Diagnosis Section */}
          <Panel defaultSize={35} minSize={15}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* 진단 — 단일 스크롤 컨테이너. 헤더는 sticky top으로 항상 보임 */}
            <div ref={diagScrollRef} className="flex-1 overflow-auto">
            {/* 헤더 (sticky top) */}
            <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-default)] px-2 py-1.5 sticky top-0 z-10"
              style={{ gridTemplateColumns: DIAG_COLS, minWidth: DIAG_MIN_WIDTH }}>
              {["상병코드","명칭","의증","배제","좌","우","진료과","특정기호","상해외인","수술","영문명"].map((h, i) => (
                <span key={i} className={`text-xs font-medium text-[var(--text-tertiary)] truncate ${i === 0 || i === 1 || i === 6 || i === 7 || i === 8 || i === 10 ? "text-left" : "text-center"}`}>{h}</span>
              ))}
            </div>
              {localDx.map((d, i) => {
                const dxPC = getRowPC(d.pcId);
                const showDxPC = durChecked && d.preCheck?.type === "incompleteDx" && d.pcId !== undefined;
                const isSelected = rowSelection?.table === "dx" && rowSelection.codes.has(d.code);
                const dxCodes = localDx.map(x => x.code);
                return (
                <div key={d.code + i} ref={el => { rowRefs.current[d.code] = el; }}>
                  <div
                    onClick={e => handleRowSelect("dx", d.code, e, dxCodes)}
                    onContextMenu={e => handleRowContextMenu("dx", d.code, e)}
                    className={`grid items-center px-2 py-1.5 border-b border-[var(--line-default)] relative transition-colors cursor-default ${
                      isSelected ? "bg-[var(--bg-primary-subtle)] ring-1 ring-inset ring-[var(--brand-primary)]" :
                      d.isNew ? "bg-[var(--status-success-bg-subtle)]" : d.isMain ? "bg-[var(--status-warning-bg-subtle)]" : ""
                    }`}
                    style={{ gridTemplateColumns: DIAG_COLS, minWidth: DIAG_MIN_WIDTH }}
                  >
                    {(d.isMain || d.isNew) && !isSelected && (
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${d.isNew ? "bg-[var(--green-500)]" : "bg-[var(--orange-500)]"}`} />
                    )}
                    {/* 상병코드 */}
                    <span className="text-sm font-medium text-[var(--text-main)] truncate">{d.code}</span>
                    {/* 명칭 */}
                    <div className="flex items-center gap-1 min-w-0">
                      {d.isMain && <span className="text-micro bg-[var(--orange-500)] text-white rounded-[3px] px-1 py-0.5 flex-shrink-0">주</span>}
                      {d.special && <span className="text-micro bg-[var(--status-error-bg-subtle)] text-[var(--red-500)] border border-[var(--red-200)] rounded-[3px] px-1 py-0.5 flex-shrink-0">{d.special}</span>}
                      <span className="text-sm text-[var(--text-main)] truncate">{d.name}</span>
                    </div>
                    {/* 의증 / 배제 / 좌 / 우 — 체크박스 */}
                    {["의증","배제","좌","우"].map(col => (
                      <div key={col} className="flex justify-center">
                        <Checkbox checked={false} />
                      </div>
                    ))}
                    {/* 진료과 — 드롭다운 형태 */}
                    <div className="flex items-center justify-between gap-1 px-1.5 h-[18px] border border-[var(--line-default)] rounded-[3px] bg-white">
                      <span className="text-xs text-[var(--text-main)] truncate">이비인후과</span>
                      <span className="text-micro text-[var(--text-tertiary)] leading-none">▾</span>
                    </div>
                    {/* 특정기호 */}
                    <span className="text-xs text-[var(--text-sub)] truncate"></span>
                    {/* 상해외인 */}
                    <span className="text-xs text-[var(--text-sub)] truncate"></span>
                    {/* 수술 — 체크박스 */}
                    <div className="flex justify-center">
                      <Checkbox checked={false} />
                    </div>
                    {/* 영문명 */}
                    <span className="text-xs text-[var(--text-sub)] truncate"></span>
                  </div>

                  {/* 사전점검 — 불완전상병 인라인 알림 */}
                  {showDxPC && d.preCheck?.type === "incompleteDx" && d.pcId && (
                    <IncompleteDxWarning
                      dxCode={d.code}
                      dxName={d.name}
                      options={d.preCheck.options}
                      resolution={dxPC}
                      onResolve={(r, replacement) => {
                        // 되돌리기 — prev 스냅샷으로 dx 복원
                        if (r.status === "pending") {
                          const cur = getRowPC(d.pcId);
                          if (cur.prev?.dxCode && cur.prev?.dxName) {
                            replaceIncompleteDx(d.pcId!, { code: cur.prev.dxCode, name: cur.prev.dxName });
                          }
                          setRowPC(d.pcId!, { status: "pending" });
                          return;
                        }
                        setRowPC(d.pcId!, r);
                        if (r.status === "fixed" && replacement) replaceIncompleteDx(d.pcId!, replacement);
                      }}
                      onApplyToMaster={() => markRowMaster(d.pcId!, "상병 교체")}
                    />
                  )}
                </div>
                );
              })}
              {/* 상병검색 — sticky bottom으로 항상 가장 아래 노출. body와 함께 좌우 스크롤됨 */}
              <div className="sticky bottom-0 z-10 bg-white">
                <DiagSearchRow />
              </div>
            </div>
          </div>
          </Panel>

          <PanelResizeHandle className="h-[10px] bg-[var(--bg-subtle)] border-y border-[var(--line-default)] flex items-center justify-center cursor-row-resize hover:bg-[var(--bg-subtle)] transition-colors">
            <div className="w-10 h-1 bg-[var(--text-tertiary)] rounded-full opacity-50" />
          </PanelResizeHandle>

          {/* Prescription Section */}
          <Panel defaultSize={65} minSize={20}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* 처방 — 단일 스크롤 컨테이너. 헤더는 sticky top, 검색 행은 sticky bottom */}
            <div ref={prescScrollRef} className="flex-1 overflow-auto relative"
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
              {/* 헤더 (sticky top) */}
              <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-default)] px-2 py-1.5 sticky top-0 z-10"
                style={{ gridTemplateColumns: PRESC_COLS, minWidth: PRESC_MIN_WIDTH }}>
                {["사용자코드","명칭","용량","일투","일수","용법","특정내역","청구","수납방법","검체","단가","단위","청구코드","예외","가루","원내"].map((h, i) => (
                  <span key={i} className={`text-xs font-medium text-[var(--text-tertiary)] truncate ${i === 1 ? "text-left" : i === 10 ? "text-right" : "text-center"}`}>{h}</span>
                ))}
              </div>

              {/* Prescription Rows */}
            {localRx.map((p, i) => {
              const ds = durStates[p.code] ?? { status: "pending" as const };
              const durResolved = ds.status === "resolved";
              const isDurActive = durChecked && p.isDur && !durResolved;
              const cfg = isDurActive ? getDurCfg(p.durType) : null;
              const isConflictHovered = hoveredConflict === p.code;
              const isSelected = rowSelection?.table === "rx" && rowSelection.codes.has(p.code);
              const rxCodes = localRx.map(x => x.code);

              return (
                <div key={p.code + i}
                  ref={el => { rowRefs.current[p.code] = el; }}>
                  <div
                    onClick={e => handleRowSelect("rx", p.code, e, rxCodes)}
                    onContextMenu={e => handleRowContextMenu("rx", p.code, e, p.kind ?? "drug")}
                    title={p.fromReservation ? "원무 접수 시 미리 적용된 예약처방" : undefined}
                    className={`group grid items-center px-2 py-1.5 border-b border-[var(--line-default)] relative transition-all cursor-default ${
                      isSelected   ? "ring-1 ring-inset ring-[var(--brand-primary)]" : ""
                    } ${
                      isSelected        ? "bg-[var(--bg-primary-subtle)]" :
                      p.fromReservation ? "bg-[var(--orange-100)]" :
                      p.isNew           ? "bg-[var(--status-success-bg-subtle)]" :
                      p.isReserved      ? "bg-[var(--bg-primary-subtle)]" : ""
                    }`}
                    style={{
                      gridTemplateColumns: PRESC_COLS,
                      minWidth: PRESC_MIN_WIDTH,
                      ...(!isSelected && !p.fromReservation && isDurActive && !p.isNew && cfg
                        ? { backgroundColor: cfg.bg }
                        : {}),
                      // 충돌 행 hover 강조 — DS 200 톤 (var() 알파 표기는 invalid CSS였음)
                      ...(isConflictHovered && cfg
                        ? { boxShadow: `inset 0 0 0 2px var(--orange-200)` }
                        : {}),
                    }}
                  >
                    {/* Left strip */}
                    {(p.isNew || p.isReserved || p.fromReservation || isDurActive) && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                          p.fromReservation ? "bg-[var(--orange-500)]" :
                          p.isNew           ? "bg-[var(--green-500)]" :
                          p.isReserved      ? "bg-[var(--text-link)]" : ""
                        }`}
                        style={isDurActive && !p.isNew && !p.fromReservation && cfg ? { backgroundColor: cfg.color } : undefined}
                      />
                    )}
                    {/* 사용자코드 — fromReservation 일 때 시계 아이콘 prefix */}
                    {p.fromReservation ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-[var(--orange-500)] truncate">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <span className="truncate">{p.code}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-tertiary)] truncate text-center">{p.code}</span>
                    )}
                    {/* 명칭 */}
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm text-[var(--text-main)] truncate">{p.name}</span>
                    </div>
                    {/* 용량 / 일투 / 일수 — 인라인 편집. 다중선택 시 일괄변경됨.
                        stopPropagation 으로 행 클릭(선택 변경) 차단해서 multi-edit 유지. */}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={p.dose}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      onContextMenu={e => e.stopPropagation()}
                      onChange={e => updateRxField(p.code, "dose", e.target.value)}
                      title={isSelected && rowSelection!.codes.size > 1 ? `다중선택 일괄변경 (${rowSelection!.codes.size}건)` : "용량 편집"}
                      className="text-sm text-[var(--text-main)] text-center tabular-nums w-full bg-transparent outline-none border border-transparent hover:border-[var(--line-default)] focus:border-[var(--brand-primary)] focus:bg-white rounded px-0.5 cursor-text transition-colors"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={p.freq}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      onContextMenu={e => e.stopPropagation()}
                      onChange={e => updateRxField(p.code, "freq", e.target.value)}
                      title={isSelected && rowSelection!.codes.size > 1 ? `다중선택 일괄변경 (${rowSelection!.codes.size}건)` : "일투 편집"}
                      className="text-sm text-[var(--text-main)] text-center tabular-nums w-full bg-transparent outline-none border border-transparent hover:border-[var(--line-default)] focus:border-[var(--brand-primary)] focus:bg-white rounded px-0.5 cursor-text transition-colors"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={p.days}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      onContextMenu={e => e.stopPropagation()}
                      onChange={e => updateRxField(p.code, "days", e.target.value)}
                      title={isSelected && rowSelection!.codes.size > 1 ? `다중선택 일괄변경 (${rowSelection!.codes.size}건)` : "일수 편집"}
                      className="text-sm text-[var(--text-main)] text-center tabular-nums w-full bg-transparent outline-none border border-transparent hover:border-[var(--line-default)] focus:border-[var(--brand-primary)] focus:bg-white rounded px-0.5 cursor-text transition-colors"
                    />
                    {/* 용법 */}
                    <span className="text-xs text-[var(--text-main)] text-center truncate">{p.method}</span>
                    {/* 특정내역 — 3-state 메모 아이콘:
                         · 내용 있음                          → 브랜드 컬러 메모 아이콘 (channel 채워짐)
                         · 기초자료 requiresSpecial + 미입력  → 회색 메모 아이콘 (미입력 알림)
                         · 그 외 (사용자가 그냥 비워둠)        → 아이콘 숨김, 행 호버 시 + 아이콘 노출
                       의사가 모달 열었다가 내용 없이 저장 → specialDetail 를 clear 해서 빈 상태로 돌아감 */}
                    <div className="flex justify-center">
                      {p.specialDetail?.content ? (
                        // 내용 있음
                        <button
                          onClick={e => { e.stopPropagation(); setSpecialModalFor(p.code); }}
                          title={`${p.specialDetail.code}: ${p.specialDetail.content}`}
                          className="w-5 h-5 flex items-center justify-center rounded text-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)] transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M3 3h7l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity={0.12} />
                            <path d="M10 3v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      ) : p.requiresSpecial ? (
                        // 기초자료에서 특정내역 필요라고 플래그됨 + 아직 미입력 → 회색 알림
                        <button
                          onClick={e => { e.stopPropagation(); setSpecialModalFor(p.code); }}
                          title="특정내역 입력 필요 (기초자료에서 필수로 설정됨)"
                          className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M3 3h7l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
                            <path d="M10 3v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                          </svg>
                        </button>
                      ) : (
                        // 빈 상태 — 행 호버 시 옅은 + 아이콘만 노출 (clickable)
                        <button
                          onClick={e => { e.stopPropagation(); setSpecialModalFor(p.code); }}
                          title="특정내역 등록"
                          className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-subtle)] hover:text-[var(--text-sub)] transition-opacity"
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {/* 청구 — 클릭 시 청/비 토글 */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleClaim(p.code)}
                        title={p.claim ? "청구 → 클릭하여 비청구" : "비청구 → 클릭하여 청구"}
                        className={`text-micro font-bold rounded-[3px] px-1 py-0.5 leading-none transition-colors ${
                          p.claim
                            ? "bg-[var(--orange-500)] text-white hover:opacity-80"
                            : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--line-default)] hover:bg-[var(--bg-neutral)]"
                        }`}
                      >{p.claim ? "청" : "비"}</button>
                    </div>
                    {/* 수납방법 — 드롭다운 (클릭 시 옵션 메뉴 노출) */}
                    <div className="flex justify-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPayMenuFor(prev => prev?.code === p.code ? null : { code: p.code, rect });
                        }}
                        title="수납방법 선택"
                        className={`flex items-center gap-0.5 text-micro bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-[var(--line-default)] rounded-[3px] px-1 py-0.5 leading-none whitespace-nowrap hover:bg-[var(--bg-neutral)] transition-colors min-w-[40px] justify-center ${
                          payMenuFor?.code === p.code ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : ""
                        }`}
                      >
                        <span>{p.payMethod ?? "—"}</span>
                        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" className={`transition-transform ${payMenuFor?.code === p.code ? "rotate-180" : ""}`}>
                          <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    {/* 검체 */}
                    <span className="text-xs text-[var(--text-sub)] text-center truncate">{p.specimen ?? ""}</span>
                    {/* 단가 */}
                    <span className="text-sm text-[var(--text-main)] text-right">{p.price > 0 ? `${p.price.toLocaleString()}원` : "0원"}</span>
                    {/* 단위 */}
                    <span className="text-xs text-[var(--text-sub)] text-center truncate">{p.unit ?? ""}</span>
                    {/* 청구코드 */}
                    <span className="text-xs text-[var(--text-sub)] text-center truncate">{p.billCode ?? ""}</span>
                    {/* 예외 */}
                    <div className="flex justify-center">
                      <Checkbox checked={!!p.exception} />
                    </div>
                    {/* 가루 */}
                    <div className="flex justify-center">
                      <Checkbox checked={!!p.isPowder} />
                    </div>
                    {/* 원내 — 검사는 텍스트(수탁/원내), 약품은 체크박스(체크=원내, 미체크=원외) */}
                    {p.kind === "lab" ? (
                      <span className="text-xs text-[var(--text-sub)] text-center">
                        {p.isInternal ? "원내" : "수탁"}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleInternal(p.code)}
                        title={p.isInternal ? "원내 → 클릭하여 원외" : "원외 → 클릭하여 원내"}
                        className="flex justify-center"
                      >
                        <Checkbox checked={!!p.isInternal} />
                      </button>
                    )}
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
                      onApplyToMaster={() => markDurMaster(p.code, getDurCfg(p.durType).label)}
                    />
                  )}

                  {/* 사전점검 — 용량 0 처방 */}
                  {durChecked && p.preCheck?.type === "zeroDose" && p.pcId && (
                    <ZeroDoseWarning
                      rxName={p.name}
                      suggested={p.preCheck.suggested}
                      resolution={getRowPC(p.pcId)}
                      onResolve={(r, dose) => {
                        if (r.status === "pending") {
                          const cur = getRowPC(p.pcId);
                          if (cur.prev?.dose !== undefined) fixZeroDose(p.pcId!, cur.prev.dose);
                          setRowPC(p.pcId!, { status: "pending" });
                          return;
                        }
                        setRowPC(p.pcId!, r);
                        if (r.status === "fixed" && dose) fixZeroDose(p.pcId!, dose);
                      }}
                      onApplyToMaster={() => markRowMaster(p.pcId!, "용량 수정")}
                    />
                  )}

                  {/* 사전점검 — 마취과 전문의 */}
                  {durChecked && p.preCheck?.type === "anesthesiologist" && p.pcId && (
                    <AnesthesiologistWarning
                      rxName={p.name}
                      candidates={p.preCheck.candidates}
                      resolution={getRowPC(p.pcId)}
                      onResolve={(r, selected, makeDefault) => {
                        if (r.status === "pending") {
                          // 마취과 전문의 정보 비움 (special 초기화)
                          setLocalRx(prev => prev.map(x =>
                            x.pcId === p.pcId ? { ...x, special: undefined } : x
                          ));
                          setRowPC(p.pcId!, { status: "pending" });
                          return;
                        }
                        setRowPC(p.pcId!, r);
                        if (r.status === "fixed" && selected) {
                          setAnesthesiologist(p.pcId!, selected);
                          if (makeDefault) showToast(`${selected.name}을(를) 기본 마취과 전문의로 설정했습니다`);
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}
              {/* ── 처방 표 sticky bottom 묶음 ──
                   오늘 등록 예약처방 + 처방검색바 를 하나의 sticky 컨테이너로 묶어서
                   둘 사이에 갭 없이 검색바 위에 바로 붙도록 함. ── */}
              <div className="sticky bottom-0 z-10 bg-white">
                {todaysReservations.length > 0 && (
                  <>
                    {/* 상단 구분선 — 진한 violet 으로 섹션 시작 강조 */}
                    <div className="h-[2px] bg-[var(--violet-500)]" />
                    {todaysReservations.map(r => (
                      <div
                        key={r.id}
                        title="오늘 등록한 예약처방 — 처방 검색 바로 위에 고정 노출"
                        className="grid items-center px-2 py-1.5 border-b border-[var(--line-default)] relative bg-[var(--gray-075)] hover:bg-[var(--gray-100)]"
                        style={{ gridTemplateColumns: PRESC_COLS, minWidth: PRESC_MIN_WIDTH }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--violet-500)]" />
                        {/* 사용자코드 — 시계 아이콘 + 코드 */}
                        <span className="flex items-center justify-center gap-1 text-xs text-[var(--violet-700)] truncate">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span className="truncate">{r.code}</span>
                        </span>
                        {/* 명칭 */}
                        <span className="text-sm text-[var(--text-main)] truncate">{r.name}</span>
                        {/* 용량 / 일투 / 일수 */}
                        <span className="text-sm text-[var(--text-main)] text-center tabular-nums">{r.dose}</span>
                        <span className="text-sm text-[var(--text-main)] text-center tabular-nums">{r.freq}</span>
                        <span className="text-sm text-[var(--text-main)] text-center tabular-nums">{r.days}</span>
                        {/* 용법 */}
                        <span className="text-xs text-[var(--text-main)] text-center truncate">{r.method ?? ""}</span>
                        {/* 특정내역 — "다음에" / 수행일 */}
                        <span className={`text-micro text-center truncate font-medium ${r.scheduledDate ? "text-[var(--violet-700)]" : "text-[var(--text-tertiary)]"}`}>
                          {r.scheduledDate ? r.scheduledDate.slice(5).replace("-", ".") : "다음에"}
                        </span>
                        {/* 청구 / 수납방법 / 검체 — 예약은 비활성 */}
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        {/* 단가 (보험가) */}
                        <span className="text-sm text-[var(--text-main)] text-right tabular-nums">{r.insurancePrice.toLocaleString()}원</span>
                        {/* 단위 / 청구코드 / 예외 / 가루 / 원내 — 예약은 비워둠 */}
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                        <span className="text-micro text-center text-[var(--text-tertiary)]">—</span>
                      </div>
                    ))}
                  </>
                )}
                {/* 처방 검색 — 항상 가장 아래 */}
                <PrescSearchRow />
              </div>
            </div>
          </div>
          </Panel>

        </PanelGroup>
      </div>
      </Panel>

      </PanelGroup>

      {/* D3.5: 특정내역 — 가로로 길고 높이는 1줄로 컴팩트 */}
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-2.5 py-1.5 flex items-center gap-2 flex-shrink-0">
        {/* 라벨 */}
        <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">특정내역</span>
        <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">(MX999)</span>
        {/* 설정 + 더보기 */}
        <button title="특정내역 설정"
          className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
            <path fill="currentColor" d="M11.5 1.5h-3l-.5 2.1a6.5 6.5 0 0 0-1.6.7L4.6 3.1 2.5 5.2 3.7 7a6.5 6.5 0 0 0-.7 1.6L1 9.1v3l2 .5c.2.6.4 1.1.7 1.6L2.5 16l2 2 1.8-1.2c.5.3 1 .5 1.6.7l.5 2h3l.5-2c.6-.2 1.1-.4 1.6-.7l1.8 1.2 2-2-1.2-1.8c.3-.5.5-1 .7-1.6l2-.5v-3l-2-.5a6.5 6.5 0 0 0-.7-1.6l1.2-1.8-2-2-1.8 1.2a6.5 6.5 0 0 0-1.6-.7l-.5-2zM10 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </button>
        <button title="더보기"
          className="w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex-shrink-0">
          <span className="text-lg leading-none">···</span>
        </button>
        {/* 입력 영역 */}
        <input
          type="text"
          placeholder="영문(700자), 한글(350자) 이내 입력"
          className="flex-1 min-w-0 h-7 px-3 text-md bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] outline-none focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-[var(--text-placeholder)]"
        />
        {/* 추가 버튼 */}
        <button
          className="h-7 px-3 text-md font-medium text-[var(--brand-primary)] bg-white border border-[var(--brand-primary)] rounded-[6px] hover:bg-[var(--bg-primary-subtle)] flex-shrink-0">
          특정내역 추가
        </button>
      </div>

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

        <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-2.5 py-1.5 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={e => setReserveListRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
              title="예약처방 목록 / 등록"
              className={`flex items-center gap-1 text-sm rounded-[4px] px-2 py-1 transition-colors ${
                reserveListRect
                  ? "bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "bg-white border border-[var(--line-default)] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span>📅</span> 예약처방
              {reservedRx.length > 0 && (
                <span className={`text-xs font-bold tabular-nums ${reserveListRect ? "text-[var(--brand-primary)]" : "text-[var(--text-link)]"}`}>{reservedRx.length}</span>
              )}
            </button>
            <button className="flex items-center gap-1 text-sm bg-white border border-[var(--line-default)] text-[var(--text-sub)] rounded-[4px] px-2 py-1">
              <span>👤</span> 환자예외
            </button>
            <button
              onClick={e => setBannedListRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
              title="처방금지 약품 목록 / 등록"
              className={`flex items-center gap-1 text-sm rounded-[4px] px-2 py-1 transition-colors ${
                bannedListRect
                  ? "bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "bg-white border border-[var(--line-default)] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span>🚫</span> 처방금지
              {bannedDrugs.length > 0 && (
                <span className="text-xs font-bold tabular-nums text-[var(--red-500)]">{bannedDrugs.length}</span>
              )}
            </button>
          </div>
          <div className="flex-1" />
          {/* 오늘 차트 합계 — 점검 버튼 좌측 */}
          <div className="flex items-baseline px-2">
            <span className="text-lg font-bold text-[var(--text-main)] tabular-nums">
              ₩{localRx.reduce((sum, p) => sum + (p.price ?? 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDurChecked(c => !c)}
              aria-pressed={durChecked}
              className={`h-7 px-3 rounded-md text-md font-medium transition-colors inline-flex items-center gap-1 ${
                durChecked
                  ? "border border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-inner hover:bg-[var(--brand-primary-pressed)]"
                  : "border border-[var(--line-default)] text-[var(--text-main)] bg-white hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span className={`text-xs leading-none ${durChecked ? "opacity-100" : "opacity-30"}`}>●</span>
              점검
            </button>
            <button className="h-7 px-3 border border-[var(--line-default)] rounded-md text-md font-medium text-[var(--text-main)] bg-white hover:bg-[var(--bg-subtle)]">저장</button>
            <button className="h-7 px-3 border border-[var(--line-default)] rounded-md text-md font-medium text-[var(--text-main)] bg-white hover:bg-[var(--bg-subtle)]">저장전달</button>
            <button className="h-7 px-3.5 rounded-md text-md font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-pressed)]">출력전달</button>
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
          className="fixed w-[160px] bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1.5"
          style={{
            top: d2SettingsRect.bottom + 4,
            left: Math.max(8, d2SettingsRect.right - 160),
            zIndex: 9999,
          }}
        >
          <div className="px-3 pb-1 text-xs font-medium text-[var(--text-tertiary)]">표시 항목</div>
          {D2_SUB_PANELS.map(name => {
            const checked = d2Active.has(name);
            return (
              <label key={name} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[var(--bg-subtle)]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setD2Active(prev => {
                    const next = new Set(prev);
                    next.has(name) ? next.delete(name) : next.add(name);
                    return next;
                  })}
                />
                <span className="text-md text-[var(--text-main)]">{name}</span>
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
          className="fixed w-[140px] bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1"
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
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              {item}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* 진단/처방 행 우클릭 컨텍스트 메뉴 — 단일/다중 선택에 따라 메뉴 항목 분기 */}
      {rowContextMenu && createPortal(
        <div
          className="fixed bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 min-w-[160px]"
          style={{
            top: rowContextMenu.y,
            left: rowContextMenu.x,
            zIndex: 9999,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* ── 1. 항상 맨 위: 선택삭제 / 전체삭제 (destructive) ── */}
          <button
            onClick={() => {
              const codes = rowSelection?.codes ?? new Set<string>();
              if (rowContextMenu.table === "dx") {
                const snapshot = localDx;
                setLocalDx(prev => prev.filter(d => !codes.has(d.code)));
                showToast(`진단 ${codes.size}건 삭제됨`, () => setLocalDx(snapshot));
              } else {
                const snapshot = localRx;
                setLocalRx(prev => prev.filter(p => !codes.has(p.code)));
                showToast(`처방 ${codes.size}건 삭제됨`, () => setLocalRx(snapshot));
              }
              setRowSelection(null);
              setRowContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-md text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)]"
          >
            선택삭제 ({rowContextMenu.selectedCount})
          </button>
          <button
            onClick={() => {
              if (rowContextMenu.table === "dx") {
                const snapshot = localDx;
                setLocalDx([]);
                showToast("진단 전체 삭제됨", () => setLocalDx(snapshot));
              } else {
                const snapshot = localRx;
                setLocalRx([]);
                showToast("처방 전체 삭제됨", () => setLocalRx(snapshot));
              }
              setRowSelection(null);
              setRowContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-md text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)]"
          >
            전체삭제
          </button>

          {/* divider — 삭제 그룹과 그 외 액션 분리 (rx 표 또는 다중선택일 때만 노출) */}
          {(rowContextMenu.table === "rx" || rowContextMenu.selectedCount > 1) && (
            <div className="h-px bg-[var(--line-default)] my-1" />
          )}

          {/* ── 2. 단일 선택일 때만: 약품→DI 조회 / 검사→검사정보 조회 ── */}
          {rowContextMenu.selectedCount === 1 && rowContextMenu.table === "rx" && (
            <button
              onClick={() => {
                showToast(rowContextMenu.singleKind === "lab" ? "검사정보 조회" : "DI 조회");
                setRowContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              {rowContextMenu.singleKind === "lab" ? "검사정보 조회" : "DI 조회"}
            </button>
          )}

          {/* ── 3. 단일 약품일 때만: 처방금지약품 등록 ── */}
          {rowContextMenu.selectedCount === 1 && rowContextMenu.table === "rx" && rowContextMenu.singleKind !== "lab" && (
            <button
              onClick={() => {
                const code = Array.from(rowSelection?.codes ?? [])[0];
                const rx = localRx.find(p => p.code === code);
                if (rx) {
                  setBannedRegisterDrug({
                    name: rx.name,
                    code: rx.code,
                    ingredientCode: mockIngredientCode(rx.code),
                  });
                }
                setRowContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              처방금지약품 등록
            </button>
          )}

          {/* ── 4. 다중 선택일 때만: 묶음으로 추가 ── */}
          {rowContextMenu.selectedCount > 1 && (
            <button
              onClick={() => {
                showToast(`${rowContextMenu.selectedCount}개 항목을 묶음으로 추가`);
                setRowContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              묶음으로 추가
            </button>
          )}

          {/* ── 5. 공통 (rx 표만): PRN 처방 추가 / 예약처방 등록 ── */}
          {rowContextMenu.table === "rx" && (
            <button
              onClick={() => {
                showToast("PRN 처방 추가");
                setRowContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              PRN 처방 추가
            </button>
          )}

          {/* ── 6. 공통 (rx 표만): 예약처방 등록 (단일/다중 모두) ── */}
          {rowContextMenu.table === "rx" && (
            <button
              onClick={() => {
                const codes = Array.from(rowSelection?.codes ?? []);
                const items = codes
                  .map(c => localRx.find(p => p.code === c))
                  .filter((p): p is NonNullable<typeof p> => !!p)
                  .map(p => ({
                    code: p.code,
                    name: p.name,
                    dose: p.dose,
                    freq: p.freq,
                    days: p.days,
                    method: p.method,
                    price: p.price,
                    insurancePrice: p.price,
                    generalPrice: p.price,  // prototype: 보험가/일반가 동일 (실제는 마스터 분리)
                  }));
                if (items.length > 0) setReserveModalItems(items);
                setRowContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-md text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              예약처방 등록
            </button>
          )}
        </div>,
        document.body
      )}

      {/* 특정내역 모달 — 처방 행의 메모 아이콘 클릭 시 열림.
          내용 없이 저장하면 specialDetail 를 undefined 로 clear (빈 상태로 복귀).
          기초자료 requiresSpecial 플래그는 별개로 유지되어 회색 알림 아이콘은 계속 노출됨. */}
      {specialModalFor && (() => {
        const rx = localRx.find(p => p.code === specialModalFor);
        if (!rx) return null;
        return (
          <SpecialDetailModal
            rxName={rx.name}
            initial={rx.specialDetail}
            onClose={() => setSpecialModalFor(null)}
            onSave={detail => {
              // 내용 없이 저장 시 specialDetail clear — 빈 상태로 처리
              const next = detail.content?.trim() ? detail : undefined;
              setRxSpecialDetail(specialModalFor, next);
              setSpecialModalFor(null);
              showToast(
                next
                  ? `'${rx.name}' 특정내역 등록 (${next.code})`
                  : `'${rx.name}' 특정내역 미입력`
              );
            }}
          />
        );
      })()}

      {/* 수납방법 드롭다운 — 처방 행의 수납방법 버튼 클릭 시 노출 */}
      {payMenuFor && createPortal(
        <div
          className="fixed bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 min-w-[100px]"
          style={{
            top: payMenuFor.rect.bottom + 4,
            left: payMenuFor.rect.left,
            zIndex: 9999,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* "—" (수납방법 없음) 옵션 — 가장 위 */}
          {(() => {
            const cur = localRx.find(p => p.code === payMenuFor.code)?.payMethod;
            const items: { value: string | undefined; label: string }[] = [
              { value: undefined, label: "—" },
              ...PAY_METHODS.map(m => ({ value: m, label: m })),
            ];
            return items.map(item => {
              const active = cur === item.value;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setPayMethod(payMenuFor.code, item.value);
                    setPayMenuFor(null);
                  }}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1 text-sm text-left hover:bg-[var(--bg-subtle)] ${
                    active ? "text-[var(--brand-primary)] font-bold bg-[var(--bg-primary-subtle)]" : "text-[var(--text-main)]"
                  }`}
                >
                  <span className="w-3 flex-shrink-0">
                    {active && (
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {item.label}
                </button>
              );
            });
          })()}
        </div>,
        document.body
      )}

      {/* 처방금지 약품 — 단일 행 컨텍스트 메뉴에서 열린 등록 모달 */}
      {bannedRegisterDrug && (
        <BannedDrugRegisterModal
          drug={bannedRegisterDrug}
          onClose={() => setBannedRegisterDrug(null)}
          onSubmit={data => {
            addBannedDrug(data);
            setBannedRegisterDrug(null);
            showToast(`'${data.drugName}' 처방금지 등록됨`);
          }}
        />
      )}

      {/* 처방금지 약품 — 하단바 버튼에서 열린 목록 팝오버 */}
      {bannedListRect && (
        <BannedDrugListPopover
          rect={bannedListRect}
          drugs={bannedDrugs}
          onClose={() => setBannedListRect(null)}
          onAdd={drug => {
            addBannedDrug({
              registeredAt: todayISO(),
              drugName: drug.name,
              ingredientCode: mockIngredientCode(drug.code),
              memo: "",
              banSameIngredient: false,
              allowPrescribe: false,
            });
          }}
          onDelete={deleteBannedDrug}
          onUpdate={updateBannedDrug}
        />
      )}

      {/* 예약처방 — 컨텍스트 메뉴에서 열린 등록 모달
          기존 처방을 예약처방으로 *전환* (이동) — localRx 에서 제거하고 reservedRx 에 추가.
          결과적으로 처방 표 본문에서는 사라지고, 표 하단의 파란색 예약처방 행에 노출됨. */}
      {reserveModalItems && (
        <ReservedRxRegisterModal
          items={reserveModalItems}
          doctorName={intake.doctor}
          onClose={() => setReserveModalItems(null)}
          onSubmit={({ dates, memos }) => {
            const today = todayISO();
            const movedCodes = new Set(reserveModalItems.map(it => it.code));
            // 1) reservedRx 에 항목별로 추가 (수행일·메모 매핑)
            reserveModalItems.forEach((it, idx) => {
              addReservedRx({
                code: it.code,
                name: it.name,
                dose: it.dose,
                freq: it.freq,
                days: it.days,
                method: it.method,
                insurancePrice: it.insurancePrice,
                generalPrice: it.generalPrice,
                memo: memos[idx]?.trim() || undefined,
                scheduledDate: dates[idx] ?? null,
                registeredAt: today,
                registeredBy: intake.doctor,
              });
            });
            // 2) 기존 처방 표(localRx) 에서 해당 코드 제거 — 전환 의미
            const snapshot = localRx;
            setLocalRx(prev => prev.filter(p => !movedCodes.has(p.code)));
            // 3) 선택 상태도 정리
            setRowSelection(null);

            setReserveModalItems(null);
            // 토스트 — 모든 항목 동일 날짜면 그 날짜, 다르면 항목별 표시. 실행취소 가능.
            const allDates = reserveModalItems.map((_, idx) => dates[idx]);
            const allSame = allDates.every(d => d === allDates[0]);
            const label = allSame
              ? (allDates[0] ? allDates[0].slice(2).replace(/-/g, ".") : "다음에")
              : "항목별 지정";
            showToast(
              `${reserveModalItems.length}건 예약처방으로 전환 (${label})`,
              () => {
                // 실행취소 — localRx 복원 + reservedRx 에서 방금 추가한 항목 제거
                setLocalRx(snapshot);
                setReservedRx(prev => prev.filter(r => !(r.registeredAt === today && movedCodes.has(r.code))));
              }
            );
          }}
        />
      )}

      {/* 예약처방 — 하단바 버튼에서 열린 목록 팝오버 */}
      {reserveListRect && (
        <ReservedRxListPopover
          rect={reserveListRect}
          items={reservedRx}
          onClose={() => setReserveListRect(null)}
          onDelete={deleteReservedRx}
          onUpdate={updateReservedRx}
        />
      )}

      {/* DUR Action Toast */}
      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[var(--bg-inverse)] text-white px-4 py-2.5 rounded-xl shadow-2xl">
          <span className="text-md">{toast.msg}</span>
          {toast.undo && (
            <button onClick={() => { toast.undo!(); setToast(null); }}
              className="text-sm text-[var(--blue-300)] hover:text-[var(--blue-200)] font-medium underline">
              실행취소
            </button>
          )}
        </div>
      )}
    </div>
  );
}