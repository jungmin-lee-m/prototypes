// Alert / ConfirmAlert — Confluence "팝업 · 알럿 규칙 v1.1" 정책 구현체.
// https://ubnextemr.atlassian.net/wiki/x/EQCtCg
//
// 핵심 규칙:
//   - 우상단 ✕ 없음 (팝업에만 있음, 알럿엔 없음)
//   - 하단 부정 버튼 있음 — [아니요] / [동작 안 함]
//   - [취소] 사용 안 함
//   - backdrop 클릭으로 닫히지 않음 (하단 버튼만 응답)
//   - 좌=부정, 우=긍정(강조)
//
// 유형:
//   confirm  — 질문형 "~하시겠습니까?". [아니요] / [예]
//   notice   — 안내 단독. [확인] 1개
//   action   — 안내+행동유도. [{동작} 안 함] / [{동작}]
//   failRetry — 실패+재시도. [아니요] / [예]
//   unsavedExit — 미저장 이탈 (특수). [저장 안 함] / [저장]. 우상단 ✕ 있음 (이탈 취소).

import { useEffect } from "react";
import { createPortal } from "react-dom";

type AlertType = "confirm" | "notice" | "action" | "failRetry";

type CommonProps = {
  /** 알럿 본문. 줄바꿈은 \n 또는 React.ReactNode 사용. */
  message: React.ReactNode;
  /** optional 짧은 제목 (강조). */
  title?: string;
  /** optional 추가 안내 본문 (sub text). */
  description?: React.ReactNode;
};

type ConfirmProps = CommonProps & {
  type: "confirm" | "failRetry";
  onYes: () => void;
  onNo?: () => void;
  yesLabel?: string;  // default: "예"
  noLabel?: string;   // default: "아니요"
};

type NoticeProps = CommonProps & {
  type: "notice";
  onConfirm: () => void;
  confirmLabel?: string;  // default: "확인"
};

type ActionProps = CommonProps & {
  type: "action";
  /** 긍정 액션 동사 (예: "삭제"). 자동으로 부정 버튼은 "{동사} 안 함" 생성. */
  actionVerb: string;
  onAct: () => void;
  onAbstain?: () => void;
};

export type AlertProps = ConfirmProps | NoticeProps | ActionProps;

export function Alert(props: AlertProps) {
  // ESC 키 차단 — 정책: 알럿은 반드시 하단 버튼으로만 응답.
  // (예외: 미저장 이탈 팝업의 ESC = ✕ 동일 동작은 별도 컴포넌트 UnsavedExitPopup 참조)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, []);

  return createPortal(
    // backdrop — 클릭으로 닫히지 않음. dim 처리만 담당.
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ zIndex: 9500 }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-white rounded-md shadow-2xl w-[360px] p-4"
        // 정책: backdrop 클릭으로 닫히지 않으므로 stopPropagation 도 굳이 필요 없음.
      >
        {props.title && (
          <h3 className="text-md font-bold text-[var(--text-main)] mb-1.5">{props.title}</h3>
        )}
        <div className="text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-line">
          {props.message}
        </div>
        {props.description && (
          <p className="text-xs text-[var(--text-sub)] leading-relaxed mt-1.5">
            {props.description}
          </p>
        )}
        <div className="flex items-center justify-end gap-2 mt-4">
          <AlertButtons {...props} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AlertButtons(props: AlertProps) {
  if (props.type === "notice") {
    // 안내 — [확인] 1개
    return (
      <button
        autoFocus
        onClick={props.onConfirm}
        className="h-7 px-3 text-xs font-bold bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] transition-colors"
      >
        {props.confirmLabel ?? "확인"}
      </button>
    );
  }
  if (props.type === "action") {
    // 안내+행동유도 — [{동작} 안 함] / [{동작}]
    return (
      <>
        <button
          onClick={props.onAbstain ?? (() => { /* default: noop, parent unmount */ })}
          className="h-7 px-3 text-xs font-medium text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
        >
          {props.actionVerb} 안 함
        </button>
        <button
          autoFocus
          onClick={props.onAct}
          className="h-7 px-3 text-xs font-bold bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
          {props.actionVerb}
        </button>
      </>
    );
  }
  // confirm / failRetry — [아니요] / [예]
  return (
    <>
      <button
        onClick={props.onNo ?? (() => { /* default: noop */ })}
        className="h-7 px-3 text-xs font-medium text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
      >
        {props.noLabel ?? "아니요"}
      </button>
      <button
        autoFocus
        onClick={props.onYes}
        className="h-7 px-3 text-xs font-bold bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] transition-colors"
      >
        {props.yesLabel ?? "예"}
      </button>
    </>
  );
}

// ── 미저장 이탈 팝업 ─────────────────────────────────────────
// 별도 형식 — 알럿이 아닌 "팝업" 으로 분류됨. 우상단 ✕ 존재.
//   ✕ 클릭 / ESC → 이탈 취소 (= 작업 중 화면으로 복귀)
//   [저장 안 함] → 데이터 폐기 + 원래 이동/닫기 실행
//   [저장] → 저장 후 원래 이동/닫기 실행
export function UnsavedExitPopup({
  onCancelExit,
  onDiscard,
  onSave,
}: {
  /** ✕ / ESC / backdrop 클릭 시 (이탈 자체를 취소) */
  onCancelExit: () => void;
  /** [저장 안 함] */
  onDiscard: () => void;
  /** [저장] */
  onSave: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancelExit();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [onCancelExit]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ zIndex: 9500 }}
      onClick={onCancelExit}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-md shadow-2xl w-[360px] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* 우상단 ✕ — 이탈 취소 (= 작업 중이던 화면으로 복귀) */}
        <button
          onClick={onCancelExit}
          aria-label="이탈 취소"
          title="이탈 취소"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="p-4 pr-9">
          <h3 className="text-md font-bold text-[var(--text-main)] mb-1.5">저장되지 않은 정보가 있습니다.</h3>
          <p className="text-sm text-[var(--text-main)] leading-relaxed">저장하시겠습니까?</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          <button
            onClick={onDiscard}
            className="h-7 px-3 text-xs font-medium text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
          >
            저장 안 함
          </button>
          <button
            autoFocus
            onClick={onSave}
            className="h-7 px-3 text-xs font-bold bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
