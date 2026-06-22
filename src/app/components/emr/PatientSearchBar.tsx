// 환자 검색바 — chart-prototype/_components/topbar/PatientSearchBar.tsx 이식.
// TopBar 가운데 위치. 차트번호·이름·생년월일(주민 앞6)·휴대폰 검색.
//
// 동작:
//   - 입력 시 드롭다운에 결과 목록 표시
//   - 각 행: 환자 정보 + 당일 예약/당일 내원 뱃지 + [상세정보]/[접수] 버튼
//   - 엔터 → (활성 행) 환자 상세정보 팝업 (onSelectPatient)
//   - 행 클릭 → 상세정보 팝업 / 행의 [접수] 버튼 → 접수 (onRegister, placeholder)
//   - 하단바: [신환접수] [상세검색] (placeholder)
//   - ArrowDown/ArrowUp 으로 활성 행 이동, ESC 로 dropdown 닫기

import { useEffect, useRef, useState } from "react";
import { searchPatients, displayRrn, type SearchablePatient } from "./patientSearch";

interface Props {
  /** 환자 선택(엔터/행 클릭) — 기본 액션. 직전차트(최근 진료차트) 열기 */
  onSelectPatient: (p: SearchablePatient) => void;
  /** 행 우측 [상세정보] 버튼 → 환자 상세정보 모달 */
  onOpenDetail?: (p: SearchablePatient) => void;
  /** 행 우측 [접수] 버튼 → 접수 플로우 */
  onRegister?: (p: SearchablePatient) => void;
  /** 신환접수 (추후) */
  onNewPatient?: () => void;
  /** 상세검색 팝업 (추후) */
  onAdvancedSearch?: () => void;
}

export function PatientSearchBar({ onSelectPatient, onOpenDetail, onRegister, onNewPatient, onAdvancedSearch }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = query.trim() ? searchPatients(query) : [];

  // 결과 바뀌면 활성 인덱스 리셋
  useEffect(() => { setActiveIdx(0); }, [query]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectAndClose = (p: SearchablePatient) => {
    onSelectPatient(p);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      if (results.length) setOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const p = results[activeIdx];
      if (p) selectAndClose(p);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative w-[340px] flex-shrink-0">
      {/* 입력창 */}
      {/* TopBar(Blue) 위에 얹힘 — White 배경 + 진한 텍스트로 가독성 확보. */}
      <div className="flex items-center gap-1.5 bg-white border border-white/30 rounded px-2 h-7 focus-within:border-white transition-colors shadow-sm">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="환자검색"
          aria-label="환자 검색"
          className="flex-1 min-w-0 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-tertiary)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            aria-label="검색어 지우기"
            className="w-4 h-4 inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)] rounded transition-colors flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* 드롭다운 — 포커스 시 항상 표시 (query 없으면 안내 + 하단바만) */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[var(--line-default)] rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden z-[9990]">
          <div className="max-h-[320px] overflow-y-auto">
            {!query.trim() ? (
              <div className="px-4 py-4 text-xs text-[var(--text-tertiary)] text-center">
                환자명 · 차트번호 · 생년월일 · 휴대폰으로 검색하세요
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[var(--text-tertiary)] text-center">
                검색 결과가 없습니다
              </div>
            ) : (
              results.map((p, i) => (
                <div
                  key={p.chartNo}
                  className={`relative py-2 pl-3 pr-[150px] border-b border-[var(--line-subtle)] last:border-b-0 cursor-pointer transition-colors ${
                    i === activeIdx ? "bg-[var(--bg-primary-subtle)]" : ""
                  }`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => selectAndClose(p)}
                >
                  {/* 1행: 이름 · 성별/나이 · 뱃지 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-main)]">{p.name}</span>
                    <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">{p.sex}/{p.age}</span>
                    {p.hasReservationToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)]">당일 예약</span>
                    )}
                    {p.visitedToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-[var(--orange-700)] bg-[var(--orange-050)]">당일 내원</span>
                    )}
                  </div>
                  {/* 2행: 차트번호 · 주민번호 · 휴대폰 */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-sub)]">
                    <span className="tabular-nums">{p.chartNo}</span>
                    <span className="text-[var(--text-tertiary)]">·</span>
                    <span className="tabular-nums">{displayRrn(p)}</span>
                    <span className="text-[var(--text-tertiary)]">·</span>
                    <span className="tabular-nums">{p.phone}</span>
                  </div>
                  {/* 우측 액션 — 상세정보 (모달) / 접수. 행 기본 액션(직전차트 열기) 과 분리. */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenDetail?.(p); setOpen(false); }}
                      className="h-6 px-2.5 text-xs border border-[var(--line-default)] rounded bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap">
                      상세정보
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegister?.(p); }}
                      className="h-6 px-2.5 text-xs border border-[var(--brand-primary)] rounded bg-white text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors whitespace-nowrap">
                      접수
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 하단바 — 신환접수 / 상세검색 (추후 구현) */}
          <div className="flex items-center gap-0.5 px-2 py-1 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
            <button
              onClick={() => onNewPatient?.()}
              className="inline-flex items-center gap-1 h-7 px-2 text-xs text-[var(--text-sub)] hover:bg-white hover:text-[var(--brand-primary)] rounded transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              신환접수
            </button>
            <button
              onClick={() => onAdvancedSearch?.()}
              className="inline-flex items-center gap-1 h-7 px-2 text-xs text-[var(--text-sub)] hover:bg-white hover:text-[var(--brand-primary)] rounded transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              상세검색
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
