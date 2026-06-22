// 엑셀 내보내기 옵션 모달 — 출처: nextemr-docs chart-prototype 그대로 이식.
//   - 데이터 범위 (전체 / 현재 필터 결과) · 컬럼 선택 · 합계 행 포함 · 파일명

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_COLUMNS, COL_GROUPS, type ColId, type ColGroup } from "./table-columns";
import { defaultFilename, type ExportOptions } from "./excel-export";

interface Props {
  open: boolean;
  onClose: () => void;
  filteredCount: number;
  totalCount: number;
  visibleColumnIds: ColId[];
  onConfirm: (options: ExportOptions & { scope: "all" | "filtered" }) => void;
}

export function ExcelExportModal({
  open, onClose, filteredCount, totalCount, visibleColumnIds, onConfirm,
}: Props) {
  const [scope, setScope] = useState<"all" | "filtered">("filtered");
  const [columnIds, setColumnIds] = useState<Set<ColId>>(new Set(visibleColumnIds));
  const [includeSum, setIncludeSum] = useState(true);
  const [filename, setFilename] = useState<string>(defaultFilename());

  useEffect(() => {
    if (open) {
      setColumnIds(new Set(visibleColumnIds));
      setFilename(defaultFilename());
      setScope("filtered");
      setIncludeSum(true);
    }
  }, [open, visibleColumnIds]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === "undefined") return null;

  const toggleCol = (id: ColId) =>
    setColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const selectAll = () => setColumnIds(new Set(ALL_COLUMNS.map((c) => c.id)));
  const selectNone = () => setColumnIds(new Set());
  const selectGroup = (g: ColGroup, on: boolean) =>
    setColumnIds((prev) => {
      const next = new Set(prev);
      for (const c of ALL_COLUMNS) {
        if (c.group !== g) continue;
        if (on) next.add(c.id); else next.delete(c.id);
      }
      return next;
    });

  const canConfirm = columnIds.size > 0 && filename.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const ordered = ALL_COLUMNS.filter((c) => columnIds.has(c.id)).map((c) => c.id);
    onConfirm({ scope, columnIds: ordered, includeSum, filename: filename.trim() });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[640px] max-h-[86vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-[var(--line-default)]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <span className="text-md font-bold text-[var(--text-main)]">엑셀 내보내기</span>
          <button onClick={onClose} aria-label="닫기"
            className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <Section label="데이터 범위">
            <div className="flex flex-col gap-1.5">
              <RadioRow checked={scope === "filtered"} onClick={() => setScope("filtered")}
                label={`필터 적용 결과 (${filteredCount}건)`}
                hint="현재 화면의 필터/검색 조건이 그대로 적용됩니다." />
              <RadioRow checked={scope === "all"} onClick={() => setScope("all")}
                label={`전체 (${totalCount}건)`}
                hint="오늘 내원한 모든 환자를 내보냅니다." />
            </div>
          </Section>

          <Section label="컬럼 선택" extra={
            <div className="flex items-center gap-1.5">
              <button onClick={selectAll} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">전체 선택</button>
              <span className="w-px h-3 bg-[var(--line-default)]" />
              <button onClick={selectNone} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">전체 해제</button>
            </div>
          }>
            <div className="flex flex-col gap-2">
              {COL_GROUPS.map((g) => {
                const groupCols = ALL_COLUMNS.filter((c) => c.group === g);
                const allOn = groupCols.every((c) => columnIds.has(c.id));
                return (
                  <div key={g} className="border border-[var(--line-default)] rounded-md p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--text-main)]">{g}</span>
                      <button onClick={() => selectGroup(g, !allOn)}
                        className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">
                        {allOn ? "그룹 해제" : "그룹 모두 선택"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {groupCols.map((c) => (
                        <label key={c.id} className="flex items-center gap-1.5 px-1.5 py-1 text-sm text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] rounded cursor-pointer select-none">
                          <input type="checkbox" checked={columnIds.has(c.id)} onChange={() => toggleCol(c.id)}
                            className="cursor-pointer accent-[var(--brand-primary)]" />
                          <span>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section label="옵션">
            <label className="flex items-center gap-2 text-sm text-[var(--text-sub)] cursor-pointer select-none">
              <input type="checkbox" checked={includeSum} onChange={(e) => setIncludeSum(e.target.checked)}
                className="cursor-pointer accent-[var(--brand-primary)]" />
              합계 행 포함
            </label>
          </Section>

          <Section label="파일명">
            <div className="flex items-center gap-1.5">
              <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                className="flex-1 h-8 px-2.5 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] bg-white"
                placeholder="파일명" />
              <span className="text-sm text-[var(--text-tertiary)]">.csv</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              CSV 형식 (UTF-8) — Excel 에서 바로 열 수 있습니다.
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button onClick={handleConfirm} disabled={!canConfirm}
            className={`h-8 px-3 text-sm rounded font-medium transition-colors ${
              canConfirm
                ? "bg-[var(--brand-primary)] text-white hover:opacity-90"
                : "bg-[var(--bg-subtle)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--line-default)]"
            }`}>
            내보내기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Section({ label, extra, children }: { label: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-[var(--text-main)]">{label}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}

function RadioRow({ checked, onClick, label, hint }: { checked: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-start gap-2 px-2.5 py-1.5 text-left rounded border transition-colors ${
        checked
          ? "border-[var(--brand-primary)] bg-[var(--bg-primary-subtle)]"
          : "border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)]"
      }`}>
      <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
        checked ? "border-[var(--brand-primary)]" : "border-[var(--line-default)]"
      } flex items-center justify-center`}>
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm ${checked ? "font-medium text-[var(--text-main)]" : "text-[var(--text-sub)]"}`}>
          {label}
        </span>
        {hint && <span className="block text-xs text-[var(--text-tertiary)] mt-0.5">{hint}</span>}
      </span>
    </button>
  );
}
