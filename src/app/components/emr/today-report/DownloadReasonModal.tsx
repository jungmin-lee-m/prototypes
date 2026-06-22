// 다운로드 사유 입력 모달 — 출처: nextemr-docs chart-prototype 그대로 이식.
//   - 주민등록번호 등 민감정보 다운로드/출력 직전 사용 목적 기록
//   - 「개인정보 보호법」제15조·제29조 — 사용 목적 명시 + 안전성 확보조치
//   - 사용 사례: 엑셀저장 → 본 모달 → 확인 → ExcelExportModal / 출력 → window.print()
//   - mock: console.log 기록, 실제 EMR 에서는 audit-log 백엔드 전송

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const REASONS = ["진료", "보험청구", "정산/회계", "통계/분석"] as const;
type ReasonId = (typeof REASONS)[number] | "기타";
const DEFAULT_REASON: ReasonId = "통계/분석";

interface Props {
  open: boolean;
  action: "엑셀저장" | "출력";
  onClose: () => void;
  onConfirm: (reasonLabel: string) => void;
}

export function DownloadReasonModal({ open, action, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<ReasonId>(DEFAULT_REASON);
  const [reasonDetail, setReasonDetail] = useState<string>("");

  useEffect(() => {
    if (open) { setReason(DEFAULT_REASON); setReasonDetail(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  const requiresDetail = reason === "기타";
  const canConfirm = !requiresDetail || reasonDetail.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const label = reason === "기타" ? reasonDetail.trim() : reason;
    onConfirm(label);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[480px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-[var(--line-default)]"
        onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <span className="text-md font-bold text-[var(--text-main)]">{action} 사유 입력</span>
          <button onClick={onClose} aria-label="닫기"
            className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="px-4 py-3">
          {/* 경고 박스 */}
          <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-md border bg-[var(--orange-050)] border-[var(--orange-200)]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              className="flex-shrink-0 mt-0.5 text-[var(--orange-700)]">
              <path d="M8 1.5l7 12.5H1L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M8 6.5v3M8 11.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <div className="flex-1 text-xs leading-relaxed text-[var(--text-sub)]">
              <b className="text-[var(--text-main)]">주민등록번호가 포함된 자료입니다.</b>
              <br />
              「개인정보 보호법」에 따라 사용 목적이 기록·보관됩니다.
            </div>
          </div>

          <div className="mb-3">
            <span className="block text-sm font-bold text-[var(--text-main)] mb-1.5">사용 목적</span>
            <div className="relative">
              <select value={reason} onChange={(e) => setReason(e.target.value as ReasonId)}
                className="w-full h-9 pl-3 pr-8 text-sm border border-[var(--line-default)] rounded bg-white text-[var(--text-main)] outline-none focus:border-[var(--brand-primary)] appearance-none cursor-pointer">
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="기타">기타</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>

          {reason === "기타" && (
            <div className="mb-1">
              <span className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
                사유 상세 <span className="text-[var(--red-500)] font-normal">*</span>
              </span>
              <input type="text" value={reasonDetail} onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="구체적인 사용 목적을 입력하세요"
                className="w-full h-8 px-2.5 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] bg-white"
                autoFocus />
            </div>
          )}

          <div className="mt-3 text-xs text-[var(--text-tertiary)] flex items-center gap-2">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5v3.5L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span>접근 시각 / 사용자 정보가 자동으로 기록됩니다.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button onClick={handleConfirm} disabled={!canConfirm}
            className={`h-8 px-3 text-sm rounded font-medium transition-colors ${
              canConfirm
                ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                : "bg-[var(--bg-subtle)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--line-default)]"
            }`}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
