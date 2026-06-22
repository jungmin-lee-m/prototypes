// Panel D: 차트 영역 (Main Chart Area)
import { useState, useRef, useCallback, useEffect, useContext } from "react";
import { PatientOverrideContext } from "./PanelB";
import { Alert } from "./Alert";
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

// 이전엔 흉부 X-ray·바이탈 더미 이미지 배열이 있었지만,
// 이미지 sub-panel 기본 상태를 "이미지 없음" 으로 바꾸면서 제거됨.
// 업로드된 이미지는 PanelD 컴포넌트의 chartImages state 에서 관리.

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

// 임상메모 상용구 — 만성질환(고혈압·당뇨) 환자 교육 단계별 템플릿.
//   고 교육1~3: 고혈압 교육 (진단/약물/생활습관)
//   당 교육1~3: 당뇨 교육 (진단/약물·자가측정/합병증 예방)
export const NOTE_SNIPPETS: Snippet[] = [
  { id: "note-htn-edu1", name: "고 교육1", text: "[고혈압 교육 1단계 — 진단·이해]\n- 혈압 정상 범위: 수축기 < 120, 이완기 < 80\n- 환자 현재 혈압·진단 단계 설명\n- 무증상 진행성 질환임을 강조\n- 합병증 위험 (뇌졸중·심근경색·신부전·망막증)" },
  { id: "note-htn-edu2", name: "고 교육2", text: "[고혈압 교육 2단계 — 약물 복용]\n- 복용 약물 종류 (ARB/ACEi/CCB/이뇨제 등) 설명\n- 매일 같은 시간 복용 강조\n- 증상 없어도 임의 중단 금지\n- 부작용 발생 시 즉시 내원 안내\n- 다른 약물 (감기약·진통제 등) 복용 전 상담" },
  { id: "note-htn-edu3", name: "고 교육3", text: "[고혈압 교육 3단계 — 생활습관]\n- 저염식 (하루 소금 < 5g): 국·찌개 자제, 가공식품 줄이기\n- 체중관리 (BMI < 25)\n- 유산소 운동 (주 5회, 30분 이상)\n- 금연·절주\n- 가정혈압 측정 (아침/저녁 2회씩 일주일 기록)" },
  { id: "note-dm-edu1",  name: "당 교육1", text: "[당뇨 교육 1단계 — 진단·이해]\n- 공복혈당 / 식후혈당 / HbA1c 목표 설명\n  * 공복 < 130 mg/dL, 식후 2시간 < 180 mg/dL, HbA1c < 7%\n- 현재 환자 수치 해석\n- 만성 합병증 (눈·신장·신경·발) 위험 설명" },
  { id: "note-dm-edu2",  name: "당교육2",  text: "[당뇨 교육 2단계 — 약물·자가측정]\n- 복용 약물 종류 (메트포르민·DPP-4·SGLT2 등) 설명\n- 자가 혈당 측정법 안내 (시간대·횟수·기록)\n- 저혈당 증상 (식은땀·어지러움·손떨림) 과 대처\n- 인슐린 사용 시 주사 방법·보관 주의" },
  { id: "note-dm-edu3",  name: "당 교육3", text: "[당뇨 교육 3단계 — 합병증 예방]\n- 매년 안저검사·신장기능·말초신경 검사\n- 발 관리 (매일 점검·상처 즉시 치료)\n- 식이 (당지수 낮은 음식·일정한 시간·과식 금지)\n- 운동 (식후 30분 후 가벼운 운동)\n- 정기 HbA1c 추적 (3개월마다)" },
];

// 상용구 칩 행 — 텍스트 영역 하단에 노출. 클릭 시 onInsert로 텍스트 추가
// favorite 가 false 인 항목은 칩으로 노출하지 않음 (즐겨찾기만 빠른 접근 제공).
// leadingElements: 상용구 chip 좌측에 항상 노출되는 슬롯 (예: 오늘날짜 빠른 입력 버튼).
export function SnippetChips({
  snippets,
  onInsert,
  leadingElements,
}: {
  snippets: Snippet[];
  onInsert: (t: string) => void;
  leadingElements?: React.ReactNode;
}) {
  const visible = snippets.filter(s => s.favorite !== false);
  return (
    // 한 줄 + 가로 스크롤. leading 슬롯과 ⋯ 버튼은 고정, 중간 chip strip 만 스크롤.
    <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)] flex-shrink-0 min-h-[34px]">
      {leadingElements && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {leadingElements}
          {/* leading 슬롯과 상용구 사이 시각적 구분선 */}
          <span className="w-px h-4 bg-[var(--line-default)] mx-0.5" />
        </div>
      )}
      {/* chip strip — flex-1 min-w-0 로 남는 공간만 차지하고, 칩이 넘치면 가로 스크롤 */}
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto chip-scroll">
        {visible.length === 0 ? (
          <span className="text-xs text-[var(--text-tertiary)] italic px-1 whitespace-nowrap">즐겨찾기 상용구 없음</span>
        ) : (
          visible.map(s => (
            <button key={s.id}
              onClick={() => onInsert(s.text)}
              title={s.text.split("\n").slice(0, 3).join(" / ")}
              className="text-sm px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap flex-shrink-0">
              {s.name}
            </button>
          ))
        )}
      </div>
      <button title="상용구 관리"
        className="flex-shrink-0 text-md text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] px-1">
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
// EmrScreen 에 state 가 lift 되어 PanelB(환자정보 칩) 와 PanelD(차트 하단바·처방 우클릭) 가 동일 데이터 공유.
export type BannedDrug = {
  id: string;
  registeredAt: string;     // YYYY-MM-DD
  drugName: string;
  ingredientCode: string;   // 주성분코드
  memo: string;
  banSameIngredient: boolean;  // 동일성분금지
  allowPrescribe: boolean;     // 처방허용 (예외 허용)
};

// 기본 시드 — 차트 첫 진입 시 미리 등록된 환자의 처방금지 약품.
// PanelB 에서 보였던 페니실린·조영제 데이터를 BannedDrug 형태로 옮긴 것.
export const DEFAULT_BANNED_DRUGS: BannedDrug[] = [
  {
    id: "bd-seed-1",
    registeredAt: "1995-03-15",
    drugName: "페니실린",
    ingredientCode: "PEN-000001",
    memo: "알러지 반응 (1995)",
    banSameIngredient: true,
    allowPrescribe: false,
  },
  {
    id: "bd-seed-2",
    registeredAt: "2018-06-22",
    drugName: "조영제",
    ingredientCode: "CON-000002",
    memo: "쇼크 이력 (2018)",
    banSameIngredient: false,
    allowPrescribe: false,
  },
];

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
// ── 자동 출력물 후보 — 저장전달 시 출력될 양식 목록 ──────────────────────
// id 는 state 의 Set 키. desc 는 popover 에서 보조 안내.
type PrintItem = { id: string; label: string; desc: string };
const PRINT_ITEMS: PrintItem[] = [
  { id: "prescription", label: "처방전",     desc: "약국 제출용 (DUR·청구 정보 포함)" },
  { id: "order-sheet",  label: "오더지",     desc: "내부 진료 오더 (간호·검사·처치 전달용)" },
  { id: "lab-label",    label: "검사라벨",   desc: "검체 라벨 — 환자·검사명 자동 인쇄" },
];

// ── 저장전달 — 자동 출력물 설정 팝오버 ────────────────────────────────
// 저장전달 버튼 우측 ▾ 클릭 시 버튼 위로 떠오름. 체크된 항목은 다음 저장전달 시 자동 인쇄.
function PrintSettingsPopover({
  rect,
  selected,
  onToggle,
  onClose,
}: {
  rect: DOMRect;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  // 외부 클릭 / ESC 로 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-print-popover]") && !t.closest("[data-print-trigger]")) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", handler);
      document.addEventListener("keydown", onKey);
    }, 50);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const width = 280;
  // popover 가 ▾ 버튼 위쪽으로 펼쳐지도록 — 트리거의 right 기준 정렬.
  const left = Math.max(8, Math.min(rect.right - width, (window.innerWidth || 1200) - width - 8));
  // 위쪽 펼침 — bottom 좌표 사용 + translate-Y(-100%)
  const bottom = (window.innerHeight || 800) - rect.top + 6;

  return createPortal(
    <div
      data-print-popover
      style={{ left, bottom, width }}
      className="fixed z-[9999] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.18)] border border-[var(--line-default)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-md font-bold text-[var(--text-main)]">자동 출력 설정</span>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{selected.size}/{PRINT_ITEMS.length}</span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-md leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] px-3 pt-2 pb-1">
        체크한 출력물은 <strong className="text-[var(--text-sub)]">진료완료</strong> 시 자동으로 인쇄됩니다.
      </p>
      <div className="py-1">
        {PRINT_ITEMS.map(item => {
          const checked = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="w-full flex items-start gap-2 px-3 py-1.5 hover:bg-[var(--bg-subtle)] text-left transition-colors"
            >
              {/* 체크박스 — 시각적으로만 (실제 input 은 button onClick 으로 처리) */}
              <span
                className={`mt-0.5 w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked
                    ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
                    : "bg-white border-[var(--line-default)]"
                }`}
              >
                {checked && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${checked ? "text-[var(--text-main)]" : "text-[var(--text-sub)]"}`}>{item.label}</p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-[var(--line-default)] flex items-center justify-end bg-[var(--bg-subtle)]">
        <button
          onClick={onClose}
          className="h-7 px-3 text-xs font-medium text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-pressed)] rounded-md"
        >
          확인
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── 처방금지 약품 — 검색용 마스터 mock (약품명·성분명 둘 다 검색 가능) ──
type BannedSearchDrug = {
  drugCode: string;
  drugName: string;
  ingredient: string;
  ingredientCode: string;
};
const BANNED_SEARCH_MASTER: BannedSearchDrug[] = [
  { drugCode: "tyl500",     drugName: "타이레놀정 500mg",      ingredient: "아세트아미노펜",  ingredientCode: "ACE-001" },
  { drugCode: "ibu200",     drugName: "이부프로펜정 200mg",    ingredient: "이부프로펜",     ingredientCode: "IBU-001" },
  { drugCode: "amp250",     drugName: "암피실린캡슐 250mg",    ingredient: "암피실린",       ingredientCode: "AMP-001" },
  { drugCode: "pen-inj",    drugName: "페니실린 G 주사",       ingredient: "페니실린",       ingredientCode: "PEN-001" },
  { drugCode: "iopromide",  drugName: "조영제 (이오프로마이드)", ingredient: "이오프로마이드", ingredientCode: "CON-002" },
  { drugCode: "asp100",     drugName: "아스피린정 100mg",      ingredient: "아스피린",       ingredientCode: "ASP-001" },
  { drugCode: "cef500",     drugName: "세파클러캡슐 500mg",    ingredient: "세파클러",       ingredientCode: "CEF-001" },
  { drugCode: "metf500",    drugName: "메트포민정 500mg",      ingredient: "메트포민",       ingredientCode: "MET-001" },
  { drugCode: "amox250",    drugName: "아목시실린정 250mg",    ingredient: "아목시실린",     ingredientCode: "AMX-001" },
  { drugCode: "warf5",      drugName: "와파린정 5mg",          ingredient: "와파린",         ingredientCode: "WAR-001" },
];

// 처방금지 약품 등록 입력 — 모달이 부모에게 넘기는 페이로드
export type BannedDrugRegisterInput = Omit<BannedDrug, "id" | "registeredAt">;

// 처방금지 약품 통합 모달 — 환자 상세 팝업의 "처방금지 약품" 탭과 동일한 표 형식.
//   • 표 한 줄(상단) = inline-add 입력 행: 약품명(검색 autocomplete) / 성분코드 / 메모 / 동일성분 / 처방가능 / [추가]
//   • 표 나머지 줄 = 기존 등록 행 (편집 가능)
//   • 팝업 크기 고정 — 등록 폼 펼침/접힘으로 인한 size jump 없음
export function BannedDrugsModal({
  drugs,
  onClose,
  onAdd,
  onDelete,
  onUpdate,
  initialSearch = "",
}: {
  drugs: BannedDrug[];
  onClose: () => void;
  onAdd: (entry: BannedDrugRegisterInput) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BannedDrug>) => void;
  initialSearch?: string;
}) {
  // ── inline-add 입력 행 state ──
  const emptyDraft = {
    drugName: "",
    ingredientCode: "",
    memo: "",
    banSameIngredient: false,
    allowPrescribe: false,
  };
  const [draft, setDraft] = useState<typeof emptyDraft>({ ...emptyDraft, drugName: initialSearch });
  // 약품명 input autocomplete 노출 여부
  const [acOpen, setAcOpen] = useState(false);

  // initialSearch 변경 시 폼 초기화
  useEffect(() => {
    setDraft({ ...emptyDraft, drugName: initialSearch });
    setAcOpen(!!initialSearch.trim());
  }, [initialSearch]);

  // 약품명/성분명/코드 어디로든 매칭 (autocomplete)
  const acMatches = (draft.drugName.trim() && acOpen)
    ? BANNED_SEARCH_MASTER.filter(d =>
        d.drugName.includes(draft.drugName) ||
        d.ingredient.includes(draft.drugName) ||
        d.drugCode.toLowerCase().includes(draft.drugName.toLowerCase()) ||
        d.ingredientCode.toLowerCase().includes(draft.drugName.toLowerCase()),
      )
    : [];

  const todayStr = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const pickMaster = (m: BannedSearchDrug) => {
    setDraft(d => ({ ...d, drugName: m.drugName, ingredientCode: m.ingredientCode }));
    setAcOpen(false);
  };

  const addDrug = () => {
    if (!draft.drugName.trim()) return;
    // 중복 등록 방지 — 동일 ingredientCode 이미 등록되어 있으면 거부
    if (draft.ingredientCode.trim()) {
      const dup = drugs.find(d => d.ingredientCode === draft.ingredientCode.trim());
      if (dup) {
        window.alert(`'${dup.drugName}' (${dup.ingredientCode})는 이미 등록된 처방금지 약품입니다.`);
        return;
      }
    }
    onAdd({
      drugName: draft.drugName.trim(),
      ingredientCode: draft.ingredientCode.trim(),
      memo: draft.memo.trim(),
      banSameIngredient: draft.banSameIngredient,
      allowPrescribe: draft.allowPrescribe,
    });
    setDraft(emptyDraft);
    setAcOpen(false);
  };

  // ── 목록 조회/필터 state ──
  const [listSearch, setListSearch] = useState("");
  const filteredList = listSearch.trim()
    ? drugs.filter(d =>
        d.drugName.includes(listSearch) ||
        d.ingredientCode.toLowerCase().includes(listSearch.toLowerCase()) ||
        (d.memo ?? "").includes(listSearch),
      )
    : drugs;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        // 고정 크기 — 등록 영역이 표 안에 있어서 펼침/접힘 없음
        className="bg-white rounded-xl border border-[var(--line-default)] shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 760, maxWidth: "94vw", height: 560, maxHeight: "88vh" }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-md font-bold text-[var(--text-main)]">처방금지 약품</span>
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
              {filteredList.length}{filteredList.length !== drugs.length && ` / ${drugs.length}`}건
            </span>
          </div>
          <div className="flex items-center gap-2">
            {drugs.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-[var(--line-default)] rounded-md px-2 h-7 w-44">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-[var(--text-tertiary)]">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  placeholder="목록 조회…"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded"
              aria-label="닫기"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — 표 한 개 (sticky header + inline-add 행 + 등록 행들) */}
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 88 }} />
              <col />
              <col style={{ width: 120 }} />
              <col />
              <col style={{ width: 64 }} />
              <col style={{ width: 64 }} />
              <col style={{ width: 56 }} />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">등록일</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">약품명</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">주성분코드</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">메모</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center whitespace-nowrap" title="주성분코드가 같은 다른 약품도 함께 처방금지">동일성분<br/>금지</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center whitespace-nowrap" title="처방금지 등록되어 있어도 예외적으로 처방 허용">처방<br/>가능</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center" />
              </tr>
            </thead>
            <tbody>
              {/* 신규 입력 행 — 모든 셀이 input */}
              <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg-primary-subtle)]/30 align-top">
                <td className="px-2 py-1 text-xs text-[var(--text-tertiary)] tabular-nums whitespace-nowrap pt-1.5">{todayStr()}</td>
                <td className="px-2 py-1 relative">
                  <input
                    type="text"
                    value={draft.drugName}
                    onChange={e => { setDraft(d => ({ ...d, drugName: e.target.value })); setAcOpen(true); }}
                    onFocus={() => setAcOpen(true)}
                    onBlur={() => setTimeout(() => setAcOpen(false), 150)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDrug(); } }}
                    placeholder="약품명 또는 성분명 검색 *"
                    className="h-6 w-full px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                  />
                  {/* autocomplete 결과 — absolute popover, 표 행 크기에 영향 없음 */}
                  {acOpen && acMatches.length > 0 && (
                    <div className="absolute left-2 right-2 top-[calc(100%-2px)] bg-white border border-[var(--line-default)] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.16)] max-h-[200px] overflow-y-auto z-20">
                      {acMatches.map(m => (
                        <button
                          key={m.drugCode}
                          onMouseDown={e => { e.preventDefault(); pickMaster(m); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--bg-primary-subtle)] border-b border-[var(--line-subtle)] last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[var(--text-main)] truncate">{m.drugName}</div>
                            <div className="text-micro text-[var(--text-tertiary)] truncate">
                              <span>{m.ingredient}</span>
                              <span className="mx-1">·</span>
                              <span className="font-mono">{m.ingredientCode}</span>
                            </div>
                          </div>
                          <span className="text-micro text-[var(--brand-primary)] font-bold flex-shrink-0">선택</span>
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={draft.ingredientCode}
                    onChange={e => setDraft(d => ({ ...d, ingredientCode: e.target.value }))}
                    placeholder="자동 매칭"
                    className="h-6 w-full px-1.5 text-xs tabular-nums border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={draft.memo}
                    onChange={e => setDraft(d => ({ ...d, memo: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDrug(); } }}
                    placeholder="알러지 반응 / 부작용 이력 등"
                    className="h-6 w-full px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                  />
                </td>
                <td className="px-2 py-1 text-center pt-2">
                  <input
                    type="checkbox"
                    checked={draft.banSameIngredient}
                    onChange={e => setDraft(d => ({ ...d, banSameIngredient: e.target.checked }))}
                    className="accent-[var(--brand-primary)] cursor-pointer"
                  />
                </td>
                <td className="px-2 py-1 text-center pt-2">
                  <input
                    type="checkbox"
                    checked={draft.allowPrescribe}
                    onChange={e => setDraft(d => ({ ...d, allowPrescribe: e.target.checked }))}
                    className="accent-[var(--brand-primary)] cursor-pointer"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <button
                    onClick={addDrug}
                    disabled={!draft.drugName.trim()}
                    className={`h-6 px-2 text-xs font-bold rounded-sm transition-colors ${
                      draft.drugName.trim()
                        ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                        : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
                    }`}
                  >
                    추가
                  </button>
                </td>
              </tr>

              {/* 등록된 행들 */}
              {filteredList.map(d => (
                <tr key={d.id} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                  <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums whitespace-nowrap">{d.registeredAt}</td>
                  <td className="px-2 py-1 text-xs font-medium text-[var(--text-main)] whitespace-nowrap truncate">{d.drugName}</td>
                  <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums whitespace-nowrap truncate">{d.ingredientCode || "—"}</td>
                  <td className="px-2 py-1">
                    <input
                      value={d.memo}
                      onChange={e => onUpdate(d.id, { memo: e.target.value })}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      placeholder="—"
                      className="h-6 w-full px-1.5 text-xs border border-transparent rounded-sm bg-transparent outline-none hover:border-[var(--line-subtle)] focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-[var(--text-tertiary)]"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={d.banSameIngredient}
                      onChange={e => onUpdate(d.id, { banSameIngredient: e.target.checked })}
                      title="동일성분 금지 토글"
                      className="accent-[var(--brand-primary)] cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={d.allowPrescribe}
                      onChange={e => onUpdate(d.id, { allowPrescribe: e.target.checked })}
                      title="처방가능 (예외 허용) 토글"
                      className="accent-[var(--brand-primary)] cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button
                      onClick={() => onDelete(d.id)}
                      title="삭제"
                      className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red-500)] transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-xs text-[var(--text-tertiary)]">
                    {drugs.length === 0
                      ? "등록된 처방금지 약품 없음 — 위 입력 행에서 새 약품을 추가하세요"
                      : "조회 결과 없음"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── 특정내역 한줄 입력의 상용구 quick-chips ─────────────────────────
// 자주 쓰는 특정내역 표현을 chip 으로 빠르게 입력. 클릭 시 input 의 커서 위치에 삽입.
// (전체 상용구 모달과 별개 — 가벼운 quick-access 용). 예시 슬롯 3개.
const SPECIAL_DETAIL_SNIPPETS = [
  { id: "s1", label: "상용 1", text: "상용구 1 본문" },
  { id: "s2", label: "상용 2", text: "상용구 2 본문" },
  { id: "s3", label: "상용 3", text: "상용구 3 본문" },
];

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

// ── 수행일 dropdown 컴포넌트 ──────────────────────────────────────────
// 기본값 "다음에" (빈 문자열) + 1주/2주/1개월… 빠른 선택 + 직접선택(달력).
// 예약처방 등록 모달의 각 행에서 사용.
function ScheduledDateDropdown({
  value,
  onChange,
}: {
  value: string;             // "" = 다음에, "YYYY-MM-DD" = 지정 날짜
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-sdd-popover]") && !t.closest("[data-sdd-trigger]")) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", handler);
      // 스크롤 시 popover 위치가 어긋나므로 닫음 (모달 내부 스크롤 포함)
      window.addEventListener("scroll", onScroll, true);
    }, 30);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // 현재 값이 어느 빠른 옵션과 매칭되는지 확인 → 라벨 결정
  const matchedQuick = value ? QUICK_DATE_OPTIONS.find(opt => addToTodayISO(opt) === value) : null;
  const label = !value
    ? "다음에"
    : matchedQuick
      ? `${matchedQuick.label} (${value.slice(2).replace(/-/g, ".")})`
      : value.slice(2).replace(/-/g, ".");

  const toggleOpen = () => {
    setOpen(o => {
      if (o) return false;
      // 열 때 현재 trigger 좌표 측정
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setRect(r);
      return true;
    });
  };

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const openCalendar = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      const inp = dateInputRef.current;
      if (!inp) return;
      // 최신 브라우저: showPicker() 로 네이티브 달력 즉시 노출
      // (Safari 등 미지원 브라우저는 input click 으로 fallback)
      if (typeof (inp as HTMLInputElement & { showPicker?: () => void }).showPicker === "function") {
        (inp as HTMLInputElement & { showPicker: () => void }).showPicker();
      } else {
        inp.focus();
        inp.click();
      }
    });
  };

  // popover 위치 계산 — 화면 우측·하단 경계 클램프
  const popoverWidth = 200;
  const popoverLeft = rect
    ? Math.max(8, Math.min(rect.left, (window.innerWidth || 1200) - popoverWidth - 8))
    : 0;
  const popoverTop = rect ? rect.bottom + 4 : 0;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        data-sdd-trigger
        type="button"
        onClick={toggleOpen}
        title={label}
        className={`w-full h-7 px-2 inline-flex items-center justify-between gap-1 border rounded outline-none transition-colors ${
          value
            ? "border-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]"
            : "border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)]"
        }`}
      >
        <span className="text-xs truncate font-medium tabular-nums">{label}</span>
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* popover 는 portal 로 document.body 에 렌더 — 표/모달 overflow 에 잘리지 않음.
          위치는 trigger 의 getBoundingClientRect 기준 fixed 좌표 사용. */}
      {open && rect && createPortal(
        <div
          data-sdd-popover
          style={{
            position: "fixed",
            top: popoverTop,
            left: popoverLeft,
            width: popoverWidth,
            zIndex: 10010,
          }}
          className="bg-white border border-[var(--line-default)] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1"
        >
          <button
            type="button"
            onClick={() => select("")}
            className={`w-full text-left px-3 py-1 text-sm hover:bg-[var(--bg-subtle)] transition-colors ${
              !value ? "text-[var(--brand-primary)] font-medium" : "text-[var(--text-main)]"
            }`}
          >
            다음에
          </button>
          <div className="my-0.5 border-t border-[var(--line-subtle)]" />
          {QUICK_DATE_OPTIONS.map(opt => {
            const optDate = addToTodayISO(opt);
            const active = matchedQuick?.label === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => select(optDate)}
                className={`w-full text-left px-3 py-1 text-sm hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between gap-2 ${
                  active ? "text-[var(--brand-primary)] font-medium" : "text-[var(--text-main)]"
                }`}
              >
                <span>{opt.label} 후</span>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{optDate.slice(2).replace(/-/g, ".")}</span>
              </button>
            );
          })}
          <div className="my-0.5 border-t border-[var(--line-subtle)]" />
          <button
            type="button"
            onClick={openCalendar}
            className="w-full text-left px-3 py-1 text-sm text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-1.5"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--text-sub)]">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 6h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            직접선택…
          </button>
        </div>,
        document.body,
      )}
      {/* 숨겨진 date input — 직접선택 시 showPicker() 로 네이티브 달력 트리거 */}
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })()}
        className="absolute opacity-0 pointer-events-none w-0 h-0 left-0 top-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

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

  // 등록 버튼 라벨 — 모든 항목이 "다음에" 면 "등록", 아니면 "예약 등록"
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

          {/* 예약할 처방 — 항목별 수행일 / 메모 입력. 안내 문구 제거, 처방 명칭이 가장 잘 보이도록 강조. */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--text-main)]">예약할 처방</span>
            <div className="border border-[var(--line-default)] rounded-md overflow-hidden">
              {/* 헤더 — 처방 / 용량·일투·일수 / 단가 / 수행일 / 메모. 코드는 처방 셀로 통합. */}
              <div className="grid items-center px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] gap-2"
                style={{ gridTemplateColumns: "2fr 90px 70px 140px 1.4fr" }}>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">처방</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-center">용량·일투·일수</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)] text-right">단가</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">수행일</span>
                <span className="text-micro font-medium text-[var(--text-tertiary)]">메모</span>
              </div>
              {/* 행 */}
              <div className="max-h-[320px] overflow-y-auto">
                {items.map((it, i) => {
                  const rowDate = dates[i] ?? "";
                  return (
                    <div key={i} className="grid items-center px-2.5 py-2 border-b border-[var(--line-subtle)] last:border-b-0 gap-2"
                      style={{ gridTemplateColumns: "2fr 90px 70px 140px 1.4fr" }}>
                      {/* 처방 — 명칭을 크게(text-md font-medium), 코드를 그 아래 작게 노출 */}
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-md font-medium text-[var(--text-main)] truncate leading-tight">{it.name}</span>
                        <span className="text-micro font-mono text-[var(--text-tertiary)] truncate">{it.code}</span>
                      </div>
                      {/* 용량·일투·일수 — 한 셀로 묶어 시각 단순화 (예: "1 × 3 × 7일") */}
                      <span className="text-xs text-center tabular-nums text-[var(--text-sub)]">
                        {it.dose} <span className="text-[var(--text-tertiary)]">×</span> {it.freq} <span className="text-[var(--text-tertiary)]">×</span> {it.days}일
                      </span>
                      <span className="text-xs text-right tabular-nums text-[var(--text-main)]">{it.price.toLocaleString()}원</span>
                      {/* 수행일 — 다음에(default) + 1주·2주·1개월… + 직접선택 dropdown */}
                      <ScheduledDateDropdown value={rowDate} onChange={v => updateDate(i, v)} />
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
            {allUnscheduled ? "등록" : "예약 등록"}
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

// ── 음성기록 뷰 — STT 음성 전사문 표시 ────────────────────────────────────
// transcript 는 새 녹음 시작 전까지 차트에 보존됨 (status 와 무관).
// 4가지 상태:
//   idle      — transcript 가 있으면 그대로, 없으면 안내문
//   recording — 상단에 컴팩트한 녹음 중 인디케이터 + (이전 transcript 가 있으면 그대로 노출)
//   converting— 변환 중 작은 spinner + 안내 (이전 transcript 가 있으면 그 위에)
//   ready     — transcript 본문 (status 와 무관하게 동일 처리)
function formatRecordTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function VoiceRecordView({
  soapStatus, transcript, recordSec,
}: {
  soapStatus: "idle" | "recording" | "converting" | "ready";
  transcript: string;
  recordSec: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API 미지원 환경 fallback — 무시
    }
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    a.download = `voice-transcript-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasTranscript = !!transcript;
  const showRecordingBanner = soapStatus === "recording";
  const showConvertingBanner = soapStatus === "converting";

  return (
    // h-full로 부모 높이 채움 → 본문(flex-1, 자체 스크롤) / 버튼(shrink) 2단 구성
    <div className="flex flex-col h-full p-3 gap-2.5 min-h-0">
      {/* 본문 — transcript 가 있으면 항상 보이고, 녹음 중·변환 중일 때 상단에 작은 배너만 추가됨. */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-md border border-[var(--line-default)] bg-white">
        {/* 녹음 중 배너 — 한 줄, 작은 도트 + 시간 + 안내문. 너무 강조되지 않게. */}
        {showRecordingBanner && (
          <div className="sticky top-0 z-10 flex items-center gap-1.5 px-3 py-1 border-b border-[var(--line-subtle)] bg-[var(--bg-subtle)] text-xs text-[var(--text-sub)]">
            <span className="relative flex w-1.5 h-1.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--red-500)] opacity-50 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--red-500)]" />
            </span>
            <span>녹음 중</span>
            <span className="tabular-nums font-medium text-[var(--text-main)]">{formatRecordTime(recordSec)}</span>
            <span className="text-[var(--text-tertiary)] ml-auto">종료 시 자동 변환</span>
          </div>
        )}
        {/* 변환 중 배너 — spinner + 안내 */}
        {showConvertingBanner && (
          <div className="sticky top-0 z-10 flex items-center gap-1.5 px-3 py-1 border-b border-[var(--line-subtle)] bg-[var(--bg-primary-subtle)] text-xs text-[var(--text-sub)]">
            <span className="inline-block w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--brand-primary)] border-r-transparent animate-spin flex-shrink-0" />
            <span className="text-[var(--brand-primary)]">변환 중 — STT·SOAP 정리</span>
          </div>
        )}

        {/* 본문 콘텐츠 — transcript 있으면 우선 표시, 없으면 상태별 안내 */}
        {hasTranscript ? (
          <pre className="text-md text-[var(--text-main)] leading-[20px] whitespace-pre-wrap font-sans m-0 px-4 py-3">
            {transcript}
          </pre>
        ) : showRecordingBanner ? (
          <div className="px-4 py-6 text-center text-xs text-[var(--text-tertiary)]">
            녹음 종료 후 음성 전사문이 여기에 표시됩니다.
          </div>
        ) : showConvertingBanner ? null : (
          // idle + transcript 없음
          <div className="px-4 py-6 text-center">
            <span className="text-sm text-[var(--text-tertiary)]">
              상단 <b className="text-[var(--text-sub)]">[녹음 시작]</b> 버튼을 눌러주세요.
            </span>
          </div>
        )}
      </div>

      {/* 액션 버튼 — 우하단 고정. 복사·다운로드는 transcript 있을 때만 활성 */}
      <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
        <button
          disabled={!hasTranscript}
          onClick={handleCopy}
          title="음성 전사문을 클립보드에 복사"
          className="h-7 px-2.5 text-xs font-medium rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors">
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 11V3.5C3 3 3.4 2.5 4 2.5h7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              복사
            </>
          )}
        </button>
        <button
          disabled={!hasTranscript}
          onClick={handleDownload}
          title="음성 전사문을 .txt 파일로 다운로드"
          className="h-7 px-2.5 text-xs font-medium rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          다운로드
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

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 방사선 처방 모달 — 인체도 클릭 → 촬영부위·용법·매수 선택 → 처방 일괄 추가
// ║ 진입점: PanelC 하단바 [🩻 방사선] 버튼 (예약처방 옆)
// ║ 인체 부위(머리·가슴·복부 등) 를 시각적으로 클릭 → 해당 부위의 모든 view 목록이
// ║ 가운데 라디오 리스트로 노출 → view 선택 + 용법(PA/AP/Lat/Obl/Both/Axial) + 매수
// ║ 선택 후 [⬇ 추가] 로 우측 preview 누적 → 마지막 [+ 처방 N건 추가] 로 차트에 일괄 푸시.
// ╚══════════════════════════════════════════════════════════════════════════════

// 부위별 view 카탈로그 — 청구코드 G + 부위코드 형식 (mock).
const RADIOLOGY_VIEWS: Record<string, { label: string; views: { code: string; name: string; price: number }[] }> = {
  head: {
    label: "두부",
    views: [
      { code: "G1001", name: "SKULL AP",          price: 12000 },
      { code: "G1002", name: "SKULL Lat",         price: 12000 },
      { code: "G1003", name: "FACIAL BONE",       price: 14500 },
      { code: "G1004", name: "PARANASAL SINUS",   price: 13800 },
      { code: "G1005", name: "MASTOID",           price: 12500 },
      { code: "G1006", name: "TMJ",               price: 13500 },
    ],
  },
  neck: {
    label: "경부 / 경추",
    views: [
      { code: "G1101", name: "C-SPINE AP",        price: 13500 },
      { code: "G1102", name: "C-SPINE Lat",       price: 13500 },
      { code: "G1103", name: "C-SPINE Oblique",   price: 14000 },
      { code: "G1104", name: "C-SPINE Flexion",   price: 14500 },
      { code: "G1105", name: "NECK SOFT TISSUE",  price: 12800 },
    ],
  },
  shoulder: {
    label: "어깨",
    views: [
      { code: "G1201", name: "SHOULDER AP",       price: 13800 },
      { code: "G1202", name: "SHOULDER Y-VIEW",   price: 14500 },
      { code: "G1203", name: "AC JOINT",          price: 13000 },
      { code: "G1204", name: "CLAVICLE",          price: 12500 },
      { code: "G1205", name: "SCAPULA",           price: 13200 },
    ],
  },
  chest: {
    label: "흉부",
    views: [
      { code: "G2103", name: "CHEST PA",                   price: 12500 },
      { code: "G2104", name: "CHEST AP",                   price: 12500 },
      { code: "G2105", name: "CHEST LORDOTIC VIEW",        price: 14000 },
      { code: "G2106", name: "STERNUM",                    price: 13500 },
      { code: "G2107", name: "RIB",                        price: 14000 },
      { code: "G2108", name: "T-SPINE AP",                 price: 14500 },
      { code: "G2109", name: "T-SPINE Lat",                price: 14500 },
      { code: "G2110", name: "MAMMOGRAPHY",                price: 38000 },
      { code: "G2111", name: "MAGNIFICATION MAMMOGRAPHY",  price: 42000 },
    ],
  },
  arm: {
    label: "팔 / 팔꿈치",
    views: [
      { code: "G1301", name: "HUMERUS AP",        price: 13500 },
      { code: "G1302", name: "HUMERUS Lat",       price: 13500 },
      { code: "G1303", name: "ELBOW AP",          price: 13000 },
      { code: "G1304", name: "ELBOW Lat",         price: 13000 },
      { code: "G1305", name: "FOREARM AP",        price: 13500 },
      { code: "G1306", name: "FOREARM Lat",       price: 13500 },
    ],
  },
  hand: {
    label: "손목 / 손",
    views: [
      { code: "G1401", name: "WRIST AP",          price: 13000 },
      { code: "G1402", name: "WRIST Lat",         price: 13000 },
      { code: "G1403", name: "HAND AP",           price: 13000 },
      { code: "G1404", name: "HAND Oblique",      price: 13500 },
      { code: "G1405", name: "FINGER",            price: 12500 },
      { code: "G1406", name: "SCAPHOID",          price: 13800 },
    ],
  },
  abdomen: {
    label: "복부",
    views: [
      { code: "G2401", name: "ABDOMEN AP",        price: 13500 },
      { code: "G2402", name: "ABDOMEN Upright",   price: 14000 },
      { code: "G2403", name: "KUB",               price: 13500 },
      { code: "G2404", name: "T-L SPINE",         price: 14500 },
    ],
  },
  pelvis: {
    label: "골반 / 요추",
    views: [
      { code: "G2501", name: "L-SPINE AP",        price: 14500 },
      { code: "G2502", name: "L-SPINE Lat",       price: 14500 },
      { code: "G2503", name: "L-SPINE Oblique",   price: 15000 },
      { code: "G2504", name: "PELVIS AP",         price: 13800 },
      { code: "G2505", name: "HIP AP",            price: 13800 },
      { code: "G2506", name: "HIP Lat",           price: 13800 },
      { code: "G2507", name: "SACRUM / COCCYX",   price: 13500 },
    ],
  },
  thigh: {
    label: "허벅지 / 대퇴",
    views: [
      { code: "G2601", name: "FEMUR AP",          price: 14000 },
      { code: "G2602", name: "FEMUR Lat",         price: 14000 },
    ],
  },
  knee: {
    label: "무릎",
    views: [
      { code: "G2701", name: "KNEE AP",           price: 13500 },
      { code: "G2702", name: "KNEE Lat",          price: 13500 },
      { code: "G2703", name: "KNEE Skyline",      price: 14000 },
      { code: "G2704", name: "PATELLA",           price: 13000 },
      { code: "G2705", name: "KNEE Both AP",      price: 16500 },
    ],
  },
  leg: {
    label: "정강이 / 하지",
    views: [
      { code: "G2801", name: "TIBIA/FIBULA AP",   price: 13500 },
      { code: "G2802", name: "TIBIA/FIBULA Lat",  price: 13500 },
    ],
  },
  foot: {
    label: "발목 / 발",
    views: [
      { code: "G2901", name: "ANKLE AP",          price: 13000 },
      { code: "G2902", name: "ANKLE Lat",         price: 13000 },
      { code: "G2903", name: "FOOT AP",           price: 13000 },
      { code: "G2904", name: "FOOT Oblique",      price: 13500 },
      { code: "G2905", name: "CALCANEUS",         price: 13000 },
      { code: "G2906", name: "TOE",               price: 12500 },
    ],
  },
};

const RADIOLOGY_METHODS = ["PA", "AP", "Lat", "Obl", "Both", "Axial"] as const;
const RADIOLOGY_COUNTS  = ["1매", "2매", "3매", "4매", "5매 이상"] as const;

// 인체도 — 정면 단순 실루엣. 각 부위가 클릭 가능한 region.
// 부위 코드는 RADIOLOGY_VIEWS 의 key 와 일치. 좌우(어깨·팔·다리 등)는 동일 region 으로 묶음.
function HumanBodyDiagram({ active, onClick }: {
  active: string | null;
  onClick: (region: string) => void;
}) {
  const regionProps = (r: string) => ({
    fill: active === r ? "var(--brand-primary)" : "var(--text-tertiary)",
    fillOpacity: active === r ? 0.85 : 0.32,
    stroke: active === r ? "var(--brand-primary-hover, var(--brand-primary))" : "transparent",
    strokeWidth: 1.4,
    onClick: () => onClick(r),
    onMouseEnter: (e: React.MouseEvent<SVGElement>) => {
      if (active !== r) (e.currentTarget as SVGElement).style.fillOpacity = "0.55";
    },
    onMouseLeave: (e: React.MouseEvent<SVGElement>) => {
      if (active !== r) (e.currentTarget as SVGElement).style.fillOpacity = "0.32";
    },
    style: { cursor: "pointer", transition: "fill 0.15s, fill-opacity 0.15s" } as React.CSSProperties,
  });

  return (
    <svg viewBox="0 0 200 460" className="select-none" style={{ width: "100%", maxWidth: 240, height: "auto" }}>
      {/* 머리 */}
      <ellipse cx="100" cy="34" rx="22" ry="26" {...regionProps("head")} />
      {/* 목 */}
      <rect x="91" y="58" width="18" height="14" {...regionProps("neck")} />
      {/* 양쪽 어깨 — 좌우 동일 region */}
      <circle cx="58" cy="80" r="13" {...regionProps("shoulder")} />
      <circle cx="142" cy="80" r="13" {...regionProps("shoulder")} />
      {/* 가슴 */}
      <path d="M70 70 L130 70 L132 132 L68 132 Z" {...regionProps("chest")} />
      {/* 복부 */}
      <path d="M72 132 L128 132 L128 180 L72 180 Z" {...regionProps("abdomen")} />
      {/* 골반 */}
      <path d="M70 180 L130 180 L138 222 L62 222 Z" {...regionProps("pelvis")} />
      {/* 양쪽 팔(위팔 + 아래팔) */}
      <path d="M44 95 L60 92 L62 168 L46 170 Z" {...regionProps("arm")} />
      <path d="M156 95 L140 92 L138 168 L154 170 Z" {...regionProps("arm")} />
      {/* 양쪽 손 */}
      <circle cx="48" cy="182" r="10" {...regionProps("hand")} />
      <circle cx="152" cy="182" r="10" {...regionProps("hand")} />
      {/* 양쪽 허벅지 */}
      <rect x="66" y="222" width="26" height="84" rx="10" {...regionProps("thigh")} />
      <rect x="108" y="222" width="26" height="84" rx="10" {...regionProps("thigh")} />
      {/* 양쪽 무릎 */}
      <circle cx="79" cy="314" r="11" {...regionProps("knee")} />
      <circle cx="121" cy="314" r="11" {...regionProps("knee")} />
      {/* 양쪽 정강이 */}
      <rect x="69" y="326" width="20" height="82" rx="8" {...regionProps("leg")} />
      <rect x="111" y="326" width="20" height="82" rx="8" {...regionProps("leg")} />
      {/* 양쪽 발 */}
      <ellipse cx="79" cy="424" rx="14" ry="10" {...regionProps("foot")} />
      <ellipse cx="121" cy="424" rx="14" ry="10" {...regionProps("foot")} />
    </svg>
  );
}

export type RadiologyOrderInput = {
  code: string;
  billCode: string;
  name: string;
  method: string;          // 합성된 용법 (예: "PA/Obl")
  count: number;           // 1~5 (5매 이상 = 5)
  price: number;
};

export function RadiologyOrderModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (orders: RadiologyOrderInput[]) => void;
}) {
  const [region, setRegion]   = useState<string>("chest");
  const [view, setView]       = useState<{ code: string; name: string; price: number } | null>(null);
  const [methods, setMethods] = useState<Set<string>>(new Set(["PA"]));
  const [countLabel, setCountLabel] = useState<string>("1매");
  const [pending, setPending] = useState<RadiologyOrderInput[]>([]);

  const currentRegion = RADIOLOGY_VIEWS[region];
  const currentViews  = currentRegion?.views ?? [];

  const toggleMethod = (m: string) => {
    setMethods(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  };

  const addToPending = () => {
    if (!view) return;
    const methodArr = Array.from(methods);
    const methodLabel = methodArr.length > 0 ? methodArr.join("/") : "";
    const countNum = countLabel === "5매 이상" ? 5 : parseInt(countLabel, 10);
    setPending(prev => [...prev, {
      code: view.code.toLowerCase(),    // 사용자코드 — 소문자 변환 (관례)
      billCode: view.code,              // 청구코드
      name: `${view.name}${methodLabel ? ` (${methodLabel})` : ""}`,
      method: methodLabel || "—",
      count: countNum,
      price: view.price + (methodArr.length - 1) * 2000 + (countNum - 1) * 3000,  // 매수·용법 추가분 보정
    }]);
    // 다음 선택을 위해 view 만 리셋, 용법·매수는 유지 (같은 부위 연속 입력 편의)
    setView(null);
  };

  const removePending = (i: number) => setPending(prev => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (pending.length === 0) return;
    onAdd(pending);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 1180, maxWidth: "96vw", height: 660, maxHeight: "92vh" }}
        onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-md font-bold text-[var(--text-main)]">방사선 처방</span>
            <span className="text-xs text-[var(--text-tertiary)]">인체도 클릭 → 촬영부위·용법·매수 선택 → 추가</span>
          </div>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded"
            aria-label="닫기">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body — 4-column grid */}
        <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: "260px 300px 200px 1fr" }}>

          {/* ① 인체도 */}
          <div className="border-r border-[var(--line-default)] bg-[var(--bg-subtle)] p-3 flex flex-col items-center min-h-0">
            <div className="text-xs text-[var(--text-tertiary)] mb-1.5">부위 클릭</div>
            <div className="flex-1 min-h-0 flex items-center justify-center w-full">
              <HumanBodyDiagram active={region} onClick={r => { setRegion(r); setView(null); }} />
            </div>
          </div>

          {/* ② 촬영부위 — region 의 view 라디오 리스트 */}
          <div className="border-r border-[var(--line-default)] flex flex-col min-h-0">
            <div className="px-3 h-8 flex items-center border-b border-[var(--line-default)] bg-[var(--bg-subtle)] flex-shrink-0">
              <span className="text-sm font-bold text-[var(--text-main)]">촬영부위 — {currentRegion?.label ?? "선택"}</span>
              <span className="ml-2 text-xs text-[var(--text-tertiary)] tabular-nums">({currentViews.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {currentViews.map(v => {
                const sel = view?.code === v.code;
                return (
                  <label key={v.code}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded ${
                      sel ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] font-medium"
                          : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
                    }`}>
                    <input type="radio" checked={sel} onChange={() => setView(v)}
                      className="accent-[var(--brand-primary)]" />
                    <span className="flex-1 truncate">{v.name}</span>
                    <span className={`text-xs tabular-nums ${sel ? "text-[var(--brand-primary)]" : "text-[var(--text-tertiary)]"}`}>{v.code}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ③ 용법 + 매수 */}
          <div className="border-r border-[var(--line-default)] flex flex-col min-h-0">
            <div className="border-b border-[var(--line-default)] flex-shrink-0">
              <div className="px-3 h-8 flex items-center bg-[var(--bg-subtle)]">
                <span className="text-sm font-bold text-[var(--text-main)]">용법</span>
                <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">(복수)</span>
              </div>
              <div className="p-2 flex flex-col gap-0.5">
                {RADIOLOGY_METHODS.map(m => (
                  <label key={m} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded hover:bg-[var(--bg-subtle)]">
                    <input type="checkbox" checked={methods.has(m)} onChange={() => toggleMethod(m)}
                      className="accent-[var(--brand-primary)]" />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <div className="px-3 h-8 flex items-center bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                <span className="text-sm font-bold text-[var(--text-main)]">매수</span>
              </div>
              <div className="p-2 flex flex-col gap-0.5">
                {RADIOLOGY_COUNTS.map(c => (
                  <label key={c} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded hover:bg-[var(--bg-subtle)]">
                    <input type="radio" checked={countLabel === c} onChange={() => setCountLabel(c)}
                      className="accent-[var(--brand-primary)]" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ④ 처방 preview */}
          <div className="flex flex-col min-h-0">
            <div className="px-3 h-8 flex items-center justify-between border-b border-[var(--line-default)] bg-[var(--bg-subtle)] flex-shrink-0">
              <span className="text-sm font-bold text-[var(--text-main)]">
                처방 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({pending.length}건)</span>
              </span>
              <button onClick={addToPending}
                disabled={!view}
                title={view ? `${view.name} 을(를) 목록에 추가` : "촬영부위를 먼저 선택하세요"}
                className={`h-6 px-2.5 text-xs font-bold rounded inline-flex items-center gap-1 ${
                  view ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                       : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
                }`}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2V10M2 6L6 10L10 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                추가
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {pending.length === 0 ? (
                <div className="p-6 text-xs text-[var(--text-tertiary)] text-center leading-relaxed">
                  좌측에서 <strong className="text-[var(--text-sub)]">부위</strong> → <strong className="text-[var(--text-sub)]">촬영부위</strong> → <strong className="text-[var(--text-sub)]">용법·매수</strong> 선택<br/>
                  → 우측 상단 <strong className="text-[var(--brand-primary)]">⬇ 추가</strong> 버튼으로 목록에 담아주세요
                </div>
              ) : (
                <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: 72 }}/>
                    <col/>
                    <col style={{ width: 56 }}/>
                    <col style={{ width: 80 }}/>
                    <col style={{ width: 32 }}/>
                  </colgroup>
                  <thead className="bg-[var(--bg-subtle)] sticky top-0">
                    <tr className="border-b border-[var(--line-default)]">
                      <th className="px-2 py-1.5 text-left font-medium text-[var(--text-tertiary)]">청구코드</th>
                      <th className="px-2 py-1.5 text-left font-medium text-[var(--text-tertiary)]">코드명</th>
                      <th className="px-2 py-1.5 text-center font-medium text-[var(--text-tertiary)]">매수</th>
                      <th className="px-2 py-1.5 text-right font-medium text-[var(--text-tertiary)]">단가</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p, i) => (
                      <tr key={i} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                        <td className="px-2 py-1 tabular-nums text-[var(--text-sub)] truncate">{p.billCode}</td>
                        <td className="px-2 py-1 text-[var(--text-main)] truncate" title={p.name}>{p.name}</td>
                        <td className="px-2 py-1 text-center tabular-nums">{p.count}{p.count === 5 ? "+" : ""}</td>
                        <td className="px-2 py-1 text-right tabular-nums">{p.price.toLocaleString()}</td>
                        <td className="px-1 py-1 text-center">
                          <button onClick={() => removePending(i)} title="제거"
                            className="text-[var(--text-tertiary)] hover:text-[var(--red-500)] text-xs">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer — CR / 가산 설정 + actions */}
        <div className="px-4 py-2.5 border-t border-[var(--line-default)] bg-[var(--bg-subtle)] flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--text-sub)]">CR 설정</span>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-sub)] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--brand-primary)]"/> CR 사용
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-sub)] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--brand-primary)]"/> Full PACS 사용
            </label>
          </div>
          <div className="w-px h-4 bg-[var(--line-default)]"/>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--text-sub)]">가산 설정</span>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-sub)] cursor-pointer">
              <input type="checkbox" className="accent-[var(--brand-primary)]"/> 영상의학과 전문의 판독
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-sub)] cursor-pointer">
              <input type="checkbox" className="accent-[var(--brand-primary)]"/> 판독료 제외
            </label>
          </div>
          <div className="flex-1"/>
          <button onClick={onClose}
            className="h-8 px-3 text-sm rounded border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button onClick={submit} disabled={pending.length === 0}
            className={`h-8 px-4 text-sm font-bold rounded ${
              pending.length > 0
                ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
            }`}>
            + 처방 {pending.length > 0 ? `${pending.length}건 ` : ""}추가
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// 멀티 차트 (Layout 1-a) 용 — EmrScreen 에서 lift up.
type ChartTabMeta = {
  insuranceType: string;
  visitType: "초진" | "재진";
  dayNight: "주간" | "야간" | "공휴";
};
type ChartTab = { id: string; meta: ChartTabMeta };

// dock 레이아웃에서 PanelD 를 sub-section 단위로 렌더링하기 위한 slice 종류.
// all: 전체 (Layout 1/1-a/2/3 기존 동작)
// chart-info: D1 접수정보 바만
// symptom: D2 의 증상 sub-panel 만
// image:   D2 의 이미지 sub-panel 만
// dx-rx:   D3 진단/처방 + D3.5 특정내역 + D4 하단바 (사전점검 banner 포함)
// special: D3.5 특정내역만
export type PanelDSlice = "all" | "chart-info" | "symptom" | "image" | "dx-rx" | "special";

export function PanelD({
  diagnoses: initDiagnoses,
  prescriptions: initPrescriptions,
  symptom,
  onChangeSymptom,
  isRecording = false,
  soap = { S: "", O: "", A: "", P: "" },
  // 새 녹음 플로우 — soapStatus 상태 머신.
  //   idle/recording: 음성기록 탭에 안내·녹음중 표시.
  //   converting: STT 변환 중 spinner.
  //   ready: transcript 노출 (복사·다운로드 가능) + 증상 탭에 "변환 완료" 뱃지.
  soapStatus = "idle",
  transcript = "",
  recordSec = 0,
  // 증상 탭의 "변환 완료" 뱃지 클릭 → SOAP 을 증상란에 펼침.
  onConsumeSoap,
  // 처방금지 약품 — EmrScreen 에서 lift up. PanelB 의 환자정보 칩과 동일 데이터 공유.
  bannedDrugs,
  onAddBannedDrug,
  onUpdateBannedDrug,
  onDeleteBannedDrug,
  // 통합 처방금지 모달 진입점 — 처방 우클릭·하단바 버튼 두 곳 모두 동일 콜백 사용.
  onOpenBannedDrugsModal,
  // ── 멀티 차트 (Layout 1-a) ──
  // multiChart=true 면 ⋮ 메뉴에 "차트 추가" 노출 + 차트 2개 이상이면 상단 탭 노출.
  multiChart = false,
  charts = [],
  activeChartIdx = 0,
  onSwitchChart,
  onOpenAddChart,
  // dock 레이아웃 sub-section 분리 — 'all' 외에는 해당 섹션만 풀폭 렌더링.
  slice = "all",
  // dock VOICE_RECORD 탭은 slice='symptom' 으로 진입하되 시작 sub-tab 을 '음성기록' 으로 설정.
  initialSymptomTab,
  // 직전차트 보기 모드 — 증상/진단처방 클릭 시 confirm 알럿. "예" → onConfirmEditPastChart.
  pastChartDate,
  pastChartEditing = false,
  onConfirmEditPastChart,
  // 환자별 차트정보 — D1 헤더 (진료일자/접수메모). 검색에서 선택된 환자에 따라 다르게 표시.
  patientChartInfo,
}: {
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  symptom: string;
  onChangeSymptom?: (next: string) => void;
  // clinicalNote/onChangeClinicalNote는 ClinicalNoteCard (PanelB) 로 이동됨
  isRecording?: boolean;
  soap?: { S: string; O: string; A: string; P: string };
  soapStatus?: "idle" | "recording" | "converting" | "ready";
  transcript?: string;
  recordSec?: number;
  onConsumeSoap?: () => void;
  bannedDrugs: BannedDrug[];
  onAddBannedDrug: (data: Omit<BannedDrug, "id">) => void;
  onUpdateBannedDrug: (id: string, patch: Partial<BannedDrug>) => void;
  onDeleteBannedDrug: (id: string) => void;
  onOpenBannedDrugsModal?: (initialSearch?: string) => void;
  multiChart?: boolean;
  charts?: ChartTab[];
  activeChartIdx?: number;
  onSwitchChart?: (idx: number) => void;
  onOpenAddChart?: () => void;
  slice?: PanelDSlice;
  initialSymptomTab?: "증상" | "음성기록";
  pastChartDate?: string;
  pastChartEditing?: boolean;
  onConfirmEditPastChart?: () => void;
  patientChartInfo?: { visitDate: string; intakeMemo: string };
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

  // dock slice 모드: 특정 sub-panel 만 강제 노출. d2Active 무시.
  // slice='symptom' → 증상만, slice='image' → 이미지만, 그 외 → d2Active 그대로.
  const d2Visible: Set<D2Sub> =
    slice === "symptom" ? new Set(["증상"])
    : slice === "image" ? new Set(["이미지"])
    : d2Active;

  // 환자별 차트 메타 — dock 레이아웃 cached tab 우회용 context fallback.
  const overrideFromContext = useContext(PatientOverrideContext);
  // dock 에서 cached tab 의 prop 이 stale 일 수 있으므로 context fallback 사용.
  const effectivePastChartDate = pastChartDate ?? overrideFromContext?.pastChart?.date;
  const effectivePastChartEditing = pastChartEditing || (overrideFromContext?.pastChart?.editing ?? false);
  const effectiveOnConfirmEdit = onConfirmEditPastChart ?? overrideFromContext?.pastChart?.onConfirmEdit;

  // 직전차트 클릭 인터셉트 — 증상/진단처방 영역 클릭 시 화면 중앙 커스텀 모달.
  // "예" → onConfirmEditPastChart() (모드 해제, 편집중 진입).
  // "아니요" → 모달만 닫기, 모드 유지.
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const handlePastChartEditAttempt = () => {
    if (!effectivePastChartDate || effectivePastChartEditing) return false;
    setEditConfirmOpen(true);
    return true;
  };
  // 알럿에 노출할 날짜 — context.chartInfo.visitDate (예: "2026.03.12 (목)") 우선,
  // 없으면 effective pastChartDate raw (예: "26-03-12") 사용.
  const editConfirmDateLabel = overrideFromContext?.chartInfo?.visitDate ?? effectivePastChartDate ?? "";

  // ── 특정내역 한줄 입력 — 상용구 chip 으로 빠른 삽입 가능 ──
  // controlled input 으로 변경하여 chip 클릭 시 커서 위치에 텍스트 삽입.
  // 빈 상태에서 chip 클릭 시 그대로 입력, 기존 텍스트가 있으면 공백 후 append.
  const [specialDetailInput, setSpecialDetailInput] = useState("");
  const specialDetailInputRef = useRef<HTMLInputElement>(null);
  const insertSpecialDetailSnippet = (text: string) => {
    const ta = specialDetailInputRef.current;
    if (!ta) {
      setSpecialDetailInput(prev => prev ? `${prev} ${text}` : text);
      return;
    }
    const start = ta.selectionStart ?? specialDetailInput.length;
    const end = ta.selectionEnd ?? specialDetailInput.length;
    const before = specialDetailInput.substring(0, start);
    const after = specialDetailInput.substring(end);
    // 앞 글자가 공백/빈 문자열이 아니면 공백 자동 삽입
    const sep = before.length > 0 && !before.endsWith(" ") ? " " : "";
    const next = `${before}${sep}${text}${after}`;
    setSpecialDetailInput(next);
    requestAnimationFrame(() => {
      const pos = before.length + sep.length + text.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  // ── 저장전달 — 자동 출력물 설정 ──
  // 저장전달 버튼 우측 ▾ 클릭 → 출력물 체크박스 popover 가 버튼 위에 떠오름.
  // 체크된 출력물은 저장전달 클릭 시 자동으로 출력됨. 기본값: 처방전 (가장 보편적).
  // prototype: 실제 인쇄 wire-up 없음 — 상태만 관리.
  const [selectedPrints, setSelectedPrints] = useState<Set<string>>(
    new Set(["prescription"])
  );
  const [printSettingsRect, setPrintSettingsRect] = useState<DOMRect | null>(null);
  const printChevronRef = useRef<HTMLButtonElement>(null);
  const togglePrintItem = (id: string) => {
    setSelectedPrints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 이미지 sub-panel — 업로드된 이미지 state. 기본은 빈 상태 (예시 X-ray 제거됨). ──
  // prototype: 파일 선택 시 createObjectURL 로 미리보기. 실제 업로드 로직은 추후 wire-up.
  const [chartImages, setChartImages] = useState<{ name: string; url: string }[]>([]);
  const chartImageInputRef = useRef<HTMLInputElement>(null);
  const handleImageUploadClick = () => chartImageInputRef.current?.click();
  const handleImageFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const next = Array.from(files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setChartImages(prev => [...prev, ...next]);
    // 같은 파일을 다시 선택할 수 있도록 input value reset
    e.target.value = "";
  };
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

  // 증상 영역 탭 — "증상" 또는 "음성기록" (STT 음성 전사문)
  const [symptomTab, setSymptomTab] = useState<"증상" | "음성기록">(initialSymptomTab ?? "증상");

  // 임상메모 관련 state는 ClinicalNoteCard (PanelB) 로 이동됨

  // ── 처방금지 약품 ───────────────────────────────────────────────
  // bannedDrugs 는 EmrScreen 에서 lift 되어 props 로 주입됨. PanelB 의 환자정보 칩과 동일 데이터 공유.
  // 단일 처방 행에서 컨텍스트 메뉴로 등록 시 — 모달에 prefill 할 약품 정보
  const [bannedRegisterDrug, setBannedRegisterDrug] = useState<{ name: string; code: string; ingredientCode: string } | null>(null);
  // 하단바 처방금지 버튼 popover 위치
  const [bannedListRect, setBannedListRect] = useState<DOMRect | null>(null);

  // ── 방사선 처방 모달 ─────────────────────────────────────────────
  // 인체도 클릭 → 촬영부위·용법·매수 선택 → 처방 일괄 추가. 진입점은 하단바 [🩻 방사선] 버튼.
  const [radiologyModalOpen, setRadiologyModalOpen] = useState(false);

  // local alias — 기존 코드 호환성 위해 동일 이름 유지
  const addBannedDrug = onAddBannedDrug;
  const updateBannedDrug = onUpdateBannedDrug;
  const deleteBannedDrug = onDeleteBannedDrug;

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
  // 자동 탭 전환 제거 — 녹음 시작해도 증상 탭 그대로 유지. 음성기록 탭은 의사가 명시적으로 선택.

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

      {/* 멀티 차트 탭 바 — Layout 1-a 에서 차트가 2개 이상일 때 노출.
          각 차트의 보험·초재진·주야간 메타를 보여주고 클릭으로 활성 차트 전환.
          dock slice 모드에서는 숨김 (탭 자체가 dock 탭으로 노출됨). */}
      {slice === "all" && multiChart && charts.length > 1 && (
        <div className="flex items-center gap-1 px-1 flex-shrink-0">
          {charts.map((c, i) => {
            const active = i === activeChartIdx;
            return (
              <button
                key={c.id}
                onClick={() => onSwitchChart?.(i)}
                title={`${c.meta.insuranceType} · ${c.meta.visitType} · ${c.meta.dayNight}`}
                className={`flex items-center gap-1.5 h-7 px-3 rounded-t-md text-sm transition-colors border-t border-l border-r whitespace-nowrap ${
                  active
                    ? "bg-white text-[var(--text-main)] border-[var(--blue-200)] font-bold"
                    : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-subtle)] hover:bg-white"
                }`}>
                <span className="tabular-nums text-micro text-[var(--text-tertiary)]">{i + 1}</span>
                <span>{c.meta.insuranceType}</span>
                <span className="text-micro text-[var(--text-tertiary)]">· {c.meta.visitType}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* D1: 접수정보 바 (높이 고정 — PanelGroup 밖). gap 축소로 접수메모에 더 많은 공간 확보.
          dock slice 모드: chart-info 슬라이스 또는 all 일 때만 노출. */}
      {(slice === "all" || slice === "chart-info") && (
      <div className="bg-[var(--bg-primary-subtle)] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-2.5 py-1.5 flex items-center gap-2 flex-shrink-0 overflow-hidden">
        {/* 날짜 — text-lg → text-md 로 폰트 축소 (옆 접수메모 영역 확장) */}
        <span className="text-md font-bold text-[var(--text-main)] whitespace-nowrap flex-shrink-0">{patientChartInfo?.visitDate ?? overrideFromContext?.chartInfo?.visitDate ?? "2026.03.17 (화)"}</span>

        {/* 접수정보 — 보험구분·초재진·청구·시간·담당의 (진료유형·진료과 숨김 처리).
            상태에는 그대로 유지되지만 바에 노출하지 않아 접수메모에 더 많은 폭을 양보. */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {INTAKE_FIELDS
            .filter(field => field.key !== "visitType" && field.key !== "department")
            .map(field => (
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
          <span className="text-sm text-[var(--text-main)] truncate">{patientChartInfo?.intakeMemo ?? overrideFromContext?.chartInfo?.intakeMemo ?? "MRI 촬영 원함, 보호자(따님) 동반"}</span>
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
      )}


      {/* 사전점검 — 차트 단위 알림 (D1과 PanelGroup 사이에 노출).
          dock slice 모드: dx-rx 또는 all 일 때만. (chart-info 는 깔끔하게 D1 만 노출) */}
      {(slice === "all" || slice === "dx-rx") && (durChecked || departureCheck.status !== "pending" || timeCheck.status !== "pending") && (
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

      {/* D2+D3 vertical PanelGroup. slice 별로 어느 Panel 을 노출할지 다르게 처리.
          slice='all': 둘 다 보임 (기존 동작)
          slice='symptom'/'image': D2 만 100%, D3 숨김
          slice='dx-rx': D3 만 100%, D2 숨김
          slice='chart-info'/'special': 둘 다 숨김 (다른 섹션이 메인 영역 차지) */}
      {(slice === "all" || slice === "symptom" || slice === "image" || slice === "dx-rx") && (
      <PanelGroup direction="vertical" className="flex-1">

      {/* D2: 증상 / 이미지 / 임상메모 — 설정 버튼으로 노출 항목 선택.
          pastChartDate 가 있으면 증상 영역 클릭 시 confirm 알럿. "예" → 모드 해제 (편집중 진입). */}
      {(slice === "all" || slice === "symptom" || slice === "image") && (
      <Panel defaultSize={slice === "all" ? 25 : 100} minSize={12}>
      <div
        className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-full overflow-hidden relative"
        onMouseDownCapture={effectivePastChartDate && !effectivePastChartEditing ? (e) => {
          // mousedown 시점에 가로채기 — 실제 click 전 confirm. 거부 시 이벤트 차단.
          e.preventDefault();
          e.stopPropagation();
          handlePastChartEditAttempt();
        } : undefined}
      >
        {/* 시각 단서는 내원이력에서 충분히 제공 — 패널 내부 배지 제거. */}
        <div className="flex divide-x divide-[var(--line-default)] h-full">
          {d2Visible.has("증상") && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* 탭 헤더 — SOAP 변환 완료는 증상 탭 본문에 큰 뱃지로 노출하고,
                  탭 라벨 옆에는 작은 체크 아이콘으로만 시각 단서를 남김 (클릭 X).
                  slice='symptom' (dock): dock 탭 자체가 증상/음성기록 분리 역할이므로 내부 탭 헤더 숨김. */}
              {slice !== "symptom" && (
              <div className="flex items-center gap-0.5 px-2 pt-0.5 border-b border-[var(--line-default)] flex-shrink-0">
                <button
                  onClick={() => setSymptomTab("증상")}
                  className={`flex items-center gap-1 px-2 pb-1 text-sm font-medium border-b-2 transition-colors ${
                    symptomTab === "증상"
                      ? "border-[var(--text-main)] text-[var(--text-main)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
                  }`}
                >
                  <span>증상</span>
                  {/* SOAP 변환 완료 — 단순 시각 단서. 클릭 X (실제 액션은 본문 뱃지). */}
                  {soapStatus === "ready" && hasSoapContent && (
                    <svg
                      width="11" height="11" viewBox="0 0 16 16" fill="none"
                      title="SOAP 변환 완료 (본문 뱃지로 펼치기)"
                      className="text-[var(--green-500)]">
                      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setSymptomTab("음성기록")}
                  className={`flex items-center gap-1 px-2 pb-1 text-sm font-medium border-b-2 transition-colors ${
                    symptomTab === "음성기록"
                      ? "border-[var(--text-main)] text-[var(--text-main)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
                  }`}
                >
                  음성기록
                  {/* 녹음 중 → 작은 빨간 도트 (애니메이션 없음, TopBar 가 메인 인디케이터).
                      변환 중 → 작은 spinner. */}
                  {isRecording && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--red-500)]" />
                  )}
                  {soapStatus === "converting" && (
                    <span className="inline-block w-2 h-2 rounded-full border-[1.5px] border-[var(--brand-primary)] border-r-transparent animate-spin" />
                  )}
                </button>
              </div>
              )}

              {/* 본문 — 탭별로 자체 스크롤/sticky 레이아웃 관리 */}
              <div className="flex-1 flex flex-col min-h-0">
                {symptomTab === "증상" ? (
                  <>
                    {/* SOAP 변환 완료 뱃지 — 증상 textarea 상단. 클릭 시 SOAP 이 증상란에 펼쳐지면서 뱃지 사라짐. */}
                    {soapStatus === "ready" && hasSoapContent && (
                      <button
                        onClick={() => onConsumeSoap?.()}
                        title="클릭하면 SOAP 이 증상란에 펼쳐집니다"
                        className="mx-3 mt-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--green-500)] bg-[var(--status-success-bg-subtle)] hover:bg-[var(--green-100)] transition-colors text-left flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[var(--green-500)] flex-shrink-0">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-[var(--green-700)]">AI SOAP 변환 완료</span>
                          <span className="text-micro text-[var(--text-sub)]">클릭하면 증상란에 펼쳐지고, 자유롭게 수정 가능합니다.</span>
                        </span>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--green-500)] flex-shrink-0">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
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
                  <VoiceRecordView
                    soapStatus={soapStatus}
                    transcript={transcript}
                    recordSec={recordSec}
                  />
                )}
              </div>
            </div>
          )}
          {d2Visible.has("이미지") && (
            // 이미지 영역 — 우측에 좁게 배치 (160px 고정폭). 증상 영역이 주 영역.
            // 우상단 ⚙ 설정 버튼과 겹치지 않도록 추가 버튼은 헤더 텍스트 바로 옆에 위치.
            // slice='image' 단독 모드에서는 풀폭으로 확장.
            <div className={`${slice === "image" ? "flex-1" : "w-[160px] flex-shrink-0"} p-2 overflow-y-auto flex flex-col`}>
              {/* hidden 파일 input — + 버튼이 click() 으로 트리거. multiple + image/* 만 허용. */}
              <input
                ref={chartImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFilesSelected}
                className="hidden"
              />
              {/* 헤더 — "이미지" 라벨 + "+ 추가" 버튼 + 카운트 뱃지.
                  slice='image' (dock): 라벨/추가버튼 숨김. 본문의 "이미지 없음, + 추가" 빈상태 버튼 또는
                  업로드된 이미지 미리보기만 노출. */}
              {slice !== "image" && (
              <div className="flex items-center gap-1 mb-1.5 flex-shrink-0 min-w-0 pr-6">
                <span className="text-sm font-bold text-[var(--text-main)]">이미지</span>
                {/* + 추가 버튼 — 헤더 텍스트 바로 옆. 클릭 시 파일 탐색기 오픈. */}
                <button
                  onClick={handleImageUploadClick}
                  title="이미지 추가 — 파일 탐색기에서 선택"
                  className="w-5 h-5 flex items-center justify-center text-[var(--text-sub)] border border-[var(--line-default)] rounded-[3px] hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors flex-shrink-0"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
                {/* 카운트 뱃지 — 업로드된 이미지가 있을 때만 노출 */}
                {chartImages.length > 0 && (
                  <span className="text-micro bg-[var(--brand-primary)] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold flex-shrink-0">
                    {chartImages.length}
                  </span>
                )}
              </div>
              )}
              {/* 본문 — 이미지 없으면 빈 상태 placeholder, 있으면 첫 이미지 미리보기 */}
              {chartImages.length === 0 ? (
                <button
                  onClick={handleImageUploadClick}
                  title="이미지 추가 — 클릭하여 파일 탐색기 열기"
                  className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-default)] text-[var(--text-tertiary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="text-micro">이미지 없음</span>
                  <span className="text-micro">+ 추가</span>
                </button>
              ) : (
                <div className="rounded-[4px] overflow-hidden relative flex-1 min-h-0">
                  <img src={chartImages[0].url} alt={chartImages[0].name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                    <span className="text-micro text-white font-medium drop-shadow truncate">{chartImages[0].name}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* 임상메모 sub-panel은 PanelB의 ClinicalNoteCard 로 이동됨 */}
          {d2Visible.size === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-tertiary)]">
              우상단 ⚙ 버튼으로 표시할 항목을 선택하세요
            </div>
          )}
        </div>
        {/* ⚙ 설정 버튼 — slice 모드에서는 강제 제어되므로 숨김. */}
        {slice === "all" && (
        <button
          ref={d2SettingsBtnRef}
          onClick={e => setD2SettingsRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
          className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-md transition-colors"
          title="표시 항목 설정"
        >⚙</button>
        )}
      </div>
      </Panel>
      )}

      {/* D2-D3 사이 ResizeHandle — slice='all' 에서만 (둘 다 보일 때만 의미). */}
      {slice === "all" && (
      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
      )}

      {/* D3: 진단 + 처방.
          pastChartDate 가 있으면 영역 클릭 시 confirm 알럿. "예" → 모드 해제. */}
      {(slice === "all" || slice === "dx-rx") && (
      <Panel defaultSize={slice === "all" ? 75 : 100} minSize={30}>
      <div
        className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden relative"
        onMouseDownCapture={effectivePastChartDate && !effectivePastChartEditing ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          handlePastChartEditAttempt();
        } : undefined}
      >
        {/* Diagnosis Header — slice='dx-rx' 면 dock 탭 라벨로 식별되므로 타이틀 숨김. */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
          {slice !== "dx-rx" && (
            <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">진단 및 처방</span>
          )}
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
            {/* 진단 — 스크롤 컨테이너(헤더 sticky top) + 하단 고정 검색 행.
                검색 행은 처방과 동일하게 패널 하단에 항상 고정 — 내용이 짧을 때도 패널 가장 아래에 위치. */}
            <div ref={diagScrollRef} className="flex-1 overflow-auto min-h-0">
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
            </div>
            {/* 상병검색 — Panel 하단에 고정 footer 로 분리. 내용이 짧아도 항상 패널 가장 아래 위치.
                (처방 검색은 아직 scroll container 내부 sticky bottom 으로 동작) */}
            <div className="flex-shrink-0 border-t border-[var(--line-default)] bg-white overflow-x-auto">
              <DiagSearchRow />
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
                        stopPropagation 으로 행 클릭(선택 변경) 차단해서 multi-edit 유지.
                        onFocus={e.target.select()} — 클릭/포커스 시 기존 값 전체 선택. 다음 타이핑이 덮어쓰기.
                        EMR 처방 입력 패턴: "1" 상태에서 "2" 누르면 "12"가 아닌 "2"로 즉시 교체. */}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={p.dose}
                      onFocus={e => e.target.select()}
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
                      onFocus={e => e.target.select()}
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
                      onFocus={e => e.target.select()}
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
              {/* ── 예약처방 (스크롤 영역 내 일반 행) ──
                   sticky 가 아니라 처방 목록 끝에 일반 행으로 노출 → 여러 건 등록 시 자연스럽게 스크롤됨.
                   처방 검색 바만 sticky bottom 유지. ── */}
              {todaysReservations.length > 0 && (
                <>
                  {/* 상단 구분선 — 진한 violet 으로 섹션 시작 강조 */}
                  <div className="h-[2px] bg-[var(--violet-500)]" />
                  {todaysReservations.map(r => (
                    <div
                      key={r.id}
                      title="오늘 등록한 예약처방 — 처방 목록 하단에 배치 (스크롤 함께)"
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

              {/* ── 처방 검색만 sticky bottom — 항상 가장 아래 노출 ── */}
              <div className="sticky bottom-0 z-10 bg-white">
                <PrescSearchRow />
              </div>
            </div>
          </div>
          </Panel>

        </PanelGroup>
      </div>
      </Panel>
      )}

      </PanelGroup>
      )}

      {/* D3.5: 특정내역.
          all: 가로 1줄 컴팩트 — [라벨] [input] [chips] [+]
          special: 세로 가변 — [textarea flex-1] [chips bottom]. 헤더·+ 버튼 제거.
          dx-rx (dock): 특정내역 dock 탭으로 분리되어 있으므로 진단/처방 패널 내에서는 미노출. */}
      {slice === "all" && (
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-2.5 py-1.5 flex items-center gap-2 flex-shrink-0">
        {/* 라벨 */}
        <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">특정내역</span>
        {/* 입력 영역 — 가장 넓은 공간 차지 */}
        <input
          ref={specialDetailInputRef}
          type="text"
          value={specialDetailInput}
          onChange={e => setSpecialDetailInput(e.target.value)}
          placeholder="영문(700자), 한글(350자) 이내 입력"
          className="flex-1 min-w-0 h-7 px-3 text-md bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] outline-none focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-[var(--text-placeholder)]"
        />
        {/* 상용구 quick chips — 입력 우측. 클릭 시 input 커서 위치에 삽입. */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {SPECIAL_DETAIL_SNIPPETS.map(s => (
            <button
              key={s.id}
              onClick={() => insertSpecialDetailSnippet(s.text)}
              title={`삽입: ${s.text}`}
              className="text-xs px-1.5 h-6 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
        {/* 추가 버튼 — + 아이콘만 (텍스트 라벨 생략) */}
        <button
          title="특정내역 추가"
          className="w-7 h-7 flex items-center justify-center text-[var(--brand-primary)] bg-white border border-[var(--brand-primary)] rounded-[6px] hover:bg-[var(--bg-primary-subtle)] flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      )}

      {/* slice='special' 단독: textarea + 상용구. textarea 는 잔여공간 가변, 상용구는 하단 1줄. */}
      {slice === "special" && (
        <div className="flex-1 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden min-h-0">
          {/* textarea — 임상메모처럼 패널 잔여공간 가변 차지. */}
          <textarea
            value={specialDetailInput}
            onChange={e => setSpecialDetailInput(e.target.value)}
            placeholder="영문(700자), 한글(350자) 이내 입력"
            className="flex-1 min-h-0 px-2.5 py-2 text-md outline-none resize-none bg-white placeholder:text-[var(--text-placeholder)]"
          />
          {/* 상용구 quick chips — 하단 가로 스크롤 1줄. */}
          <div className="flex items-center gap-1 px-2 py-1 border-t border-[var(--line-default)] overflow-x-auto chip-scroll flex-shrink-0">
            {SPECIAL_DETAIL_SNIPPETS.map(s => (
              <button
                key={s.id}
                onClick={() => insertSpecialDetailSnippet(s.text)}
                title={`삽입: ${s.text}`}
                className="text-xs px-2 h-6 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap flex-shrink-0"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* D4: Action Bar / 하단바 — dock slice: all 또는 dx-rx 일 때 노출.
          dx-rx 슬라이스에서 진단·처방 아래에 항상 고정 위치. */}
      {(slice === "all" || slice === "dx-rx") && (
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
          {/* 좌측 액션 그룹 — 아이콘 only (flat outline). 패널 폭이 좁아지면 가로 스크롤. */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto chip-scroll">
            {/* 예약처방 — 달력 아이콘. 등록 건수 있으면 우상단 count 뱃지. */}
            <button
              onClick={e => setReserveListRect(r => r ? null : e.currentTarget.getBoundingClientRect())}
              title={reservedRx.length === 0 ? "예약처방 목록 / 등록" : `예약처방 ${reservedRx.length}건 — 클릭하여 목록/등록`}
              aria-label="예약처방"
              className={`relative w-7 h-7 rounded-md border transition-colors inline-flex items-center justify-center flex-shrink-0 ${
                reserveListRect
                  ? "bg-[var(--bg-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : reservedRx.length > 0
                    ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white hover:opacity-90"
                    : "bg-white border-[var(--line-default)] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2.5" y="3.5" width="11" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="11" cy="10" r="1" fill="currentColor"/>
              </svg>
              {reservedRx.length > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] font-bold tabular-nums inline-flex items-center justify-center ${
                  reserveListRect
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)]"
                }`}>{reservedRx.length}</span>
              )}
            </button>

            {/* 방사선 처방 — X-ray/방사선 아이콘 (방사형 광선). */}
            <button
              onClick={() => setRadiologyModalOpen(true)}
              title="방사선 처방 — 인체도에서 부위 클릭으로 빠르게 X-ray 오더 추가"
              aria-label="방사선 처방"
              className="w-7 h-7 rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors inline-flex items-center justify-center flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>

            {/* 환자예외 — 사람 + 별표(예외 표시) 아이콘. */}
            <button
              title="환자예외 (특정 환자 진료 규칙 예외 등록)"
              aria-label="환자예외"
              className="w-7 h-7 rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors inline-flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 13.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M12 1.5l.6 1.5L14 3.4l-1.2 1.1.3 1.5L12 5.3l-1.1.7.3-1.5L10 3.4l1.4-.4L12 1.5z" fill="currentColor"/>
              </svg>
            </button>

            {/* 처방금지 — 금지(원+사선) 아이콘. 등록 건수 있으면 red fill + count 뱃지. */}
            <button
              onClick={() => onOpenBannedDrugsModal?.()}
              title={
                bannedDrugs.length === 0
                  ? "처방금지 약품 목록 / 등록"
                  : `처방금지 약품 (${bannedDrugs.length}건):\n${bannedDrugs.map(d => `• ${d.drugName}${d.ingredientCode ? ` — ${d.ingredientCode}` : ""}`).join("\n")}\n\n클릭하여 목록/등록`
              }
              aria-label="처방금지"
              className={`relative w-7 h-7 rounded-md border transition-colors inline-flex items-center justify-center flex-shrink-0 ${
                bannedDrugs.length > 0
                  ? "bg-[var(--red-500)] border-[var(--red-500)] text-white hover:opacity-90"
                  : "bg-white border-[var(--line-default)] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--red-500)] hover:border-[var(--red-500)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {bannedDrugs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] font-bold tabular-nums inline-flex items-center justify-center bg-white text-[var(--red-500)] border border-[var(--red-500)]">
                  {bannedDrugs.length}
                </span>
              )}
            </button>
          </div>
          {/* 오늘 차트 합계 — 점검 버튼 좌측. 우측 그룹은 항상 노출 (shrink 금지). */}
          <div className="flex items-baseline px-2 flex-shrink-0">
            <span className="text-lg font-bold text-[var(--text-main)] tabular-nums">
              ₩{localRx.reduce((sum, p) => sum + (p.price ?? 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* 점검 — 아이콘 only, w-7 h-7. 활성 시 brand fill, 비활성 시 outline. */}
            <button
              onClick={() => setDurChecked(c => !c)}
              aria-pressed={durChecked}
              title={durChecked ? "점검 활성 — 처방 시 DUR 자동 확인" : "점검 — 클릭하여 활성화"}
              aria-label="점검"
              className={`w-7 h-7 rounded-md transition-colors inline-flex items-center justify-center ${
                durChecked
                  ? "border border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-pressed)]"
                  : "border border-[var(--line-default)] text-[var(--text-sub)] bg-white hover:bg-[var(--bg-subtle)]"
              }`}
            >
              {/* 체크리스트(점검) 아이콘 */}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h2M3 8h2M3 12h2M7 4h6M7 8h6M7 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            {/* 진료보류 (계속) — 저장 + 대기리스트 상태를 "보류"로 변경. 수납 전달 X.
                의사가 검사/추가 확인이 필요해 진료를 일시 중단할 때 사용. */}
            <button
              title="진료보류 — 저장 후 환자를 대기리스트 보류 상태로 이동. 수납 전달 안 함."
              className="h-7 px-2.5 text-sm font-medium text-[var(--text-main)] border border-[var(--line-default)] rounded-md bg-white hover:bg-[var(--bg-subtle)]"
            >
              진료보류
              <span className="text-xs text-[var(--text-tertiary)] ml-0.5">(계속)</span>
            </button>
            {/* 진료완료 — 저장 + 수납 전달 + 자동 출력물 인쇄. 파란색 primary split-button.
                본체 클릭: 선택된 출력물 자동 인쇄. ▾ chevron: 자동 출력물 설정 popover. */}
            <div className="inline-flex h-7 rounded-md overflow-hidden shadow-sm">
              <button
                title={
                  selectedPrints.size === 0
                    ? "진료완료 — 저장 후 수납 전달 (자동 출력 없음)"
                    : `진료완료 — 저장 후 수납 전달. 자동 출력: ${PRINT_ITEMS.filter(i => selectedPrints.has(i.id)).map(i => i.label).join(", ")}`
                }
                className="h-7 px-2.5 text-sm font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-pressed)] inline-flex items-center"
              >
                진료완료
              </button>
              {/* 분할선 */}
              <div className="w-px bg-white/30 self-stretch" />
              {/* ▾ chevron — 자동 출력물 설정 popover 트리거 */}
              <button
                ref={printChevronRef}
                data-print-trigger
                onClick={() => setPrintSettingsRect(r => r ? null : printChevronRef.current?.getBoundingClientRect() ?? null)}
                title="자동 출력물 설정"
                aria-haspopup="true"
                aria-expanded={!!printSettingsRect}
                className="h-7 px-1 text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-pressed)] flex items-center"
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Settings Popover */}
      {settingsRect && (
        <SettingsPopover rect={settingsRect} onClose={() => setSettingsRect(null)} />
      )}

      {/* 저장전달 — 자동 출력물 설정 popover */}
      {printSettingsRect && (
        <PrintSettingsPopover
          rect={printSettingsRect}
          selected={selectedPrints}
          onToggle={togglePrintItem}
          onClose={() => setPrintSettingsRect(null)}
        />
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
          {/* Layout 1-a (multiChart) — 차트 추가 항목 우선 노출 */}
          {multiChart && charts.length < 2 && (
            <>
              <button
                onClick={() => { onOpenAddChart?.(); setChartMenuRect(null); }}
                className="w-full text-left px-3 py-1.5 text-md text-[var(--brand-primary)] font-medium hover:bg-[var(--bg-primary-subtle)] inline-flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                차트 추가
              </button>
              <div className="h-px bg-[var(--line-subtle)] my-1" />
            </>
          )}
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

          {/* ── 3. 단일 약품일 때만: 처방금지약품 등록 — 통합 모달 오픈 (약품명 prefill) ── */}
          {rowContextMenu.selectedCount === 1 && rowContextMenu.table === "rx" && rowContextMenu.singleKind !== "lab" && (
            <button
              onClick={() => {
                const code = Array.from(rowSelection?.codes ?? [])[0];
                const rx = localRx.find(p => p.code === code);
                onOpenBannedDrugsModal?.(rx?.name ?? "");
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

      {/* 처방금지 약품 — 통합 모달은 EmrScreen 에 lift up 됨. (BannedDrugRegisterModal/Popover 사용 안 함) */}

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

      {/* 방사선 처방 모달 — 인체도 클릭으로 X-ray 오더 빠르게 추가 → localRx 에 푸시 */}
      {radiologyModalOpen && (
        <RadiologyOrderModal
          onClose={() => setRadiologyModalOpen(false)}
          onAdd={orders => {
            const newRx: Prescription[] = orders.map(o => ({
              kind: "lab" as const,
              code: o.code,
              billCode: o.billCode,
              name: o.name,
              dose: "1",
              freq: 1,
              days: 1,
              method: o.method,
              claim: true,
              pay: true,
              payMethod: "보험가" as const,
              price: o.price,
              isInternal: true,    // 방사선은 기본 원내 촬영
              isNew: true,
            }));
            setLocalRx(prev => [...prev, ...newRx]);
            showToast(`방사선 처방 ${orders.length}건 추가됨`);
          }}
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

      {/* 직전차트 편집 확인 알럿 — 정책 §3 확인(질문형) 알럿.
          우상단 ✕ 없음, backdrop 닫기 비활성, [아니요] / [예] 하단 버튼만 응답. */}
      {editConfirmOpen && (
        <Alert
          type="confirm"
          message={
            <>
              <span className="font-bold">{editConfirmDateLabel}</span> 일자 차트입니다.{"\n"}
              수정하시겠습니까?
            </>
          }
          onNo={() => setEditConfirmOpen(false)}
          onYes={() => {
            setEditConfirmOpen(false);
            effectiveOnConfirmEdit?.();
          }}
        />
      )}
    </div>
  );
}