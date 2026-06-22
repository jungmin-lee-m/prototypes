// 수납완료 환자 목록 표 — 오늘 내원 현황 모달의 좌측 메인 영역.
// 출처: nextemr-docs chart-prototype/_components/today-report/SettledPatientsTable.tsx 그대로 이식.
//   - 외부 의존 store/service 없음 (SETTLED_PATIENTS mock 만 사용)
//   - 엑셀저장 / 출력 사유 입력 (DownloadReasonModal) → 후속 액션 (ExcelExportModal / window.print)
//   - 컬럼 표시 설정 (좌상단 메뉴) · 정렬 (헤더 클릭) · 필터 바 · 합계 행

import { useEffect, useRef, useState } from "react";
import {
  SETTLED_PATIENTS,
  PATIENT_TAGS,
  type SettledPatient,
} from "../EndOfDayReport";
import {
  PATIENT_GROUPS,
  deriveGroup,
  deriveClaim,
  deriveSettledTime,
  deriveRrn,
  derivePhone,
  deriveTags,
  derivePrescriptions,
  searchRxDictionary,
  type RxDictEntry,
} from "./helpers";
import {
  ALL_COLUMNS,
  COL_GROUPS,
  type ColId,
  type ColGroup,
  type ColDef,
  type SortKey,
} from "./table-columns";
import { ExcelExportModal } from "./ExcelExportModal";
import { DownloadReasonModal } from "./DownloadReasonModal";
import { generateCsv, downloadCsv } from "./excel-export";

type GenderFilter = "전체" | "남" | "여";
type VisitorTypeFilter = "전체" | "신환" | "구환";
type VisitOrderFilter = "전체" | "초진" | "재진";
type PayStatusFilter = "전체" | "수납대기" | "수납완료";
type ClaimFilter = "전체" | "청구" | "비청구";

export function SettledPatientsTable() {
  const [search, setSearch] = useState("");
  // 처방 검색 — 사전(dictionary) 에서 코드/명칭/청구코드로 검색 후 선택.
  //   selectedRx: 선택된 처방 entry (필터 적용 대상). 비어있으면 환자 표 미필터.
  //   prescQuery: 입력란 자유 텍스트 (autocomplete 드롭다운 source). 선택되면 selectedRx.name 으로 채워짐.
  const [selectedRx, setSelectedRx] = useState<RxDictEntry | null>(null);
  const [prescQuery, setPrescQuery] = useState("");
  const [insType, setInsType] = useState<string>("전체");
  const [doctor, setDoctor] = useState<string>("전체");
  const [room, setRoom] = useState<string>("전체");
  const [gender, setGender] = useState<GenderFilter>("전체");
  const [visitorType, setVisitorType] = useState<VisitorTypeFilter>("전체");
  const [visitOrder, setVisitOrder] = useState<VisitOrderFilter>("전체");
  const [payStatus, setPayStatus] = useState<PayStatusFilter>("전체");
  const [patientGroups, setPatientGroups] = useState<Set<string>>(new Set());
  const [patientTags, setPatientTags] = useState<Set<string>>(new Set());
  const [claim, setClaim] = useState<ClaimFilter>("전체");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const [hiddenCols, setHiddenCols] = useState<Set<ColId>>(new Set());
  const [showColMenu, setShowColMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"엑셀저장" | "출력" | null>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showColMenu) return;
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColMenu]);

  const visibleCols = ALL_COLUMNS.filter((c) => !hiddenCols.has(c.id));
  const visibleByGroup = (g: ColGroup) => visibleCols.filter((c) => c.group === g).length;
  const toggleCol = (id: ColId) =>
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const ALL_INS = ["전체", ...Array.from(new Set(SETTLED_PATIENTS.map((p) => p.insType)))];
  const ALL_DOCTORS = ["전체", ...Array.from(new Set(SETTLED_PATIENTS.map((p) => p.doctor)))];
  const ALL_ROOMS = ["전체", "1진료실", "2진료실", "3진료실", "건강검진실"];

  const filtered = SETTLED_PATIENTS.filter((p) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hit = p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q) || p.chartNo.includes(q);
      if (!hit) return false;
    }
    // 처방 검색 — 선택된 처방의 code 가 환자의 오늘 처방 목록에 포함되어 있어야 통과.
    if (selectedRx) {
      const rxList = derivePrescriptions(p);
      const hit = rxList.some(rx => rx.code === selectedRx.code);
      if (!hit) return false;
    }
    if (insType !== "전체" && p.insType !== insType) return false;
    if (doctor !== "전체" && p.doctor !== doctor) return false;
    if (gender !== "전체" && p.gender !== gender) return false;
    if (visitorType === "신환" && !p.isNew) return false;
    if (visitorType === "구환" && p.isNew) return false;
    if (visitOrder === "초진" && !p.isFirstVisit) return false;
    if (visitOrder === "재진" && p.isFirstVisit) return false;
    const effectiveStatus: "수납대기" | "수납완료" = p.status ?? "수납완료";
    if (payStatus !== "전체" && effectiveStatus !== payStatus) return false;
    if (patientGroups.size > 0 && !patientGroups.has(deriveGroup(p))) return false;
    if (patientTags.size > 0 && !deriveTags(p).some((t) => patientTags.has(t))) return false;
    if (claim !== "전체" && deriveClaim(p) !== claim) return false;
    void room; void selectedDate;
    if (ageMin && p.age < Number(ageMin)) return false;
    if (ageMax && p.age > Number(ageMax)) return false;
    if (amountMin && p.total < Number(amountMin)) return false;
    if (amountMax && p.total > Number(amountMax)) return false;
    return true;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        if (sortKey === "settledTime") {
          const ta = deriveSettledTime(a); const tb = deriveSettledTime(b);
          if (!ta && !tb) return 0;
          if (!ta) return 1; if (!tb) return -1;
          const cmp = ta.localeCompare(tb);
          return sortDir === "asc" ? cmp : -cmp;
        }
        let cmp = 0;
        switch (sortKey) {
          case "name":      cmp = a.name.localeCompare(b.name, "ko"); break;
          case "gender":    cmp = a.gender.localeCompare(b.gender); break;
          case "visitTime": cmp = a.visitTime.localeCompare(b.visitTime); break;
          case "total":     cmp = a.total - b.total; break;
          case "nhis":      cmp = a.nhis - b.nhis; break;
          case "selfPay":   cmp = a.selfPay - b.selfPay; break;
          case "noPay":     cmp = a.noPay - b.noPay; break;
        }
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const sumTotal = filtered.reduce((s, p) => s + p.total, 0);
  const sumNhis = filtered.reduce((s, p) => s + p.nhis, 0);
  const sumSelf = filtered.reduce((s, p) => s + p.selfPay, 0);
  const sumNoPay = filtered.reduce((s, p) => s + p.noPay, 0);
  const sumCard = filtered.reduce((s, p) => s + p.card, 0);
  const sumCash = filtered.reduce((s, p) => s + p.cash, 0);
  const sumUnpaid = filtered.reduce((s, p) => s + p.unpaid, 0);

  const resetFilters = () => {
    setSearch(""); setSelectedRx(null); setPrescQuery(""); setInsType("전체"); setDoctor("전체"); setRoom("전체");
    setGender("전체"); setVisitorType("전체"); setVisitOrder("전체"); setPayStatus("전체");
    setPatientGroups(new Set()); setPatientTags(new Set()); setClaim("전체");
    setAgeMin(""); setAgeMax(""); setAmountMin(""); setAmountMax("");
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  const activeFilterCount = [
    search.trim() && "검색",
    selectedRx && "처방검색",
    insType !== "전체" && "보험",
    doctor !== "전체" && "담당의",
    room !== "전체" && "진료실",
    (amountMin || amountMax) && "진료비",
    gender !== "전체" && "성별",
    visitorType !== "전체" && "신환여부",
    visitOrder !== "전체" && "초/재진",
    payStatus !== "전체" && "결제상태",
    patientGroups.size > 0 && "환자그룹",
    patientTags.size > 0 && "환자유형",
    claim !== "전체" && "청구여부",
    (ageMin || ageMax) && "나이",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible">
      <div className="hidden print:flex print:flex-col print:gap-1 print:mb-4 print:px-2 print:py-3 print:border-b print:border-gray-300">
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] font-bold text-black">오늘 내원 현황</span>
          <span className="text-[11px] text-gray-700 tabular-nums">조회 환자 {filtered.length}명</span>
        </div>
        <div className="text-[11px] text-gray-700 tabular-nums">조회 날짜 {selectedDate}</div>
      </div>

      <div className="no-print print:hidden">
      <SettledFilterBar
        search={search} setSearch={setSearch}
        selectedRx={selectedRx} setSelectedRx={setSelectedRx}
        prescQuery={prescQuery} setPrescQuery={setPrescQuery}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        insType={insType} setInsType={setInsType}
        doctor={doctor} setDoctor={setDoctor}
        room={room} setRoom={setRoom}
        gender={gender} setGender={setGender}
        visitorType={visitorType} setVisitorType={setVisitorType}
        visitOrder={visitOrder} setVisitOrder={setVisitOrder}
        payStatus={payStatus} setPayStatus={setPayStatus}
        patientGroups={patientGroups} setPatientGroups={setPatientGroups}
        patientTags={patientTags} setPatientTags={setPatientTags}
        claim={claim} setClaim={setClaim}
        ageMin={ageMin} setAgeMin={setAgeMin}
        ageMax={ageMax} setAgeMax={setAgeMax}
        amountMin={amountMin} setAmountMin={setAmountMin}
        amountMax={amountMax} setAmountMax={setAmountMax}
        allIns={ALL_INS} allDoctors={ALL_DOCTORS} allRooms={ALL_ROOMS}
        activeFilterCount={activeFilterCount}
        onReset={resetFilters}
      />
      </div>

      <div className="no-print flex items-center justify-between gap-3 px-6 py-2 bg-white border-b border-[var(--line-default)] flex-shrink-0 print:hidden">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-sm text-[var(--text-tertiary)] whitespace-nowrap">
            조회 환자 <b className="text-[var(--text-main)] tabular-nums">{filtered.length}명</b>
          </span>
          {activeFilterCount > 0 && (
            <>
              <span className="w-px h-4 bg-[var(--line-default)] flex-shrink-0" />
              <span className="text-xs text-[var(--brand-primary)] whitespace-nowrap">필터 {activeFilterCount}개</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPendingAction("엑셀저장")}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] inline-flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5v8M4.5 6L8 9.5L11.5 6M2 11.5v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            엑셀저장
          </button>
          <button onClick={() => setPendingAction("출력")}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] inline-flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M4 5V2h8v3M4 12H2.5a1 1 0 01-1-1V6.5a1 1 0 011-1h11a1 1 0 011 1V11a1 1 0 01-1 1H12M4 9h8v5H4V9z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            출력
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 print:overflow-visible print:px-0">
        <table className="border-collapse table-fixed [&_th]:border-r [&_td]:border-r [&_th]:border-[var(--line-subtle)] [&_td]:border-[var(--line-subtle)] [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
          <colgroup>
            <col style={{ width: "28px" }} />
            {visibleCols.map((c) => (<col key={c.id} style={{ width: c.width }} />))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="px-1 py-1.5 relative print:hidden">
                <button onClick={() => setShowColMenu((v) => !v)}
                  className="w-5 h-5 inline-flex items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]"
                  aria-label="컬럼 표시 설정" title="컬럼 표시 설정">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                {showColMenu && (
                  <div ref={colMenuRef}
                    className="absolute left-0 top-full mt-1 z-50 w-[180px] bg-white border border-[var(--line-default)] rounded-md shadow-md p-1 text-left">
                    <button onClick={() => setHiddenCols(new Set())}
                      className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">
                      기본설정 복원
                    </button>
                    <div className="border-t border-[var(--line-subtle)] my-1" />
                    {ALL_COLUMNS.map((c) => {
                      const visible = !hiddenCols.has(c.id);
                      return (
                        <label key={c.id}
                          className="flex items-center gap-2 px-2.5 py-1 text-sm text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] rounded cursor-pointer select-none">
                          <input type="checkbox" checked={visible} onChange={() => toggleCol(c.id)}
                            className="cursor-pointer accent-[var(--brand-primary)]" />
                          <span>{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </th>
              {COL_GROUPS.map((g) => {
                const span = visibleByGroup(g);
                if (span === 0) return null;
                return (
                  <th key={g} colSpan={span}
                    className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap">
                    {g}
                  </th>
                );
              })}
            </tr>

            <tr className="bg-white border-b border-[var(--line-default)]">
              <th className="px-1 py-1.5 text-center w-7 print:hidden">
                <input type="checkbox" checked={false} readOnly onChange={() => {}}
                  className="cursor-default accent-[var(--brand-primary)]" />
              </th>
              {visibleCols.map((c) =>
                c.sortable ? (
                  <SortableTh key={c.id} align={c.align} active={sortKey === c.sortable} dir={sortDir} onClick={() => toggleSort(c.sortable!)}>
                    {c.label}
                  </SortableTh>
                ) : (
                  <th key={c.id} className={`text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 whitespace-nowrap text-${c.align}`}>
                    {c.label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length + 1} className="text-sm text-[var(--text-tertiary)] text-center py-12">
                  조건에 맞는 환자가 없습니다 — 필터를 조정해보세요
                </td>
              </tr>
            )}
            {sorted.map((p) => (
              <tr key={p.chartNo} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                <td className="px-1 py-1.5 text-center print:hidden">
                  <input type="checkbox" checked={false} readOnly onChange={() => {}}
                    className="cursor-default accent-[var(--brand-primary)]" />
                </td>
                {visibleCols.map((c) => (
                  <td key={c.id}
                    className={`text-sm px-1 py-1.5 text-${c.align} ${c.id === "total" ? "font-medium text-[var(--text-main)]" : "text-[var(--text-sub)]"} ${(c.align === "right" || c.id === "chartNo" || c.id === "age" || c.id === "visitTime" || c.id === "settledTime" || c.id === "rrn" || c.id === "phone") ? "tabular-nums" : ""}`}>
                    {renderCell(c, p, selectedDate)}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length > 0 && (
              <SumRow visibleCols={visibleCols} visibleByGroup={visibleByGroup} count={filtered.length}
                sumTotal={sumTotal} sumNhis={sumNhis} sumSelf={sumSelf} sumNoPay={sumNoPay}
                sumCard={sumCard} sumCash={sumCash} sumUnpaid={sumUnpaid} />
            )}
          </tbody>
        </table>
      </div>

      <DownloadReasonModal
        open={pendingAction !== null}
        action={pendingAction ?? "엑셀저장"}
        onClose={() => setPendingAction(null)}
        onConfirm={(reason) => {
          console.log("[개인정보 접근 기록]", { action: pendingAction, reason, timestamp: new Date().toISOString(), rowCount: filtered.length });
          if (pendingAction === "엑셀저장") { setPendingAction(null); setShowExportModal(true); }
          else if (pendingAction === "출력") { setPendingAction(null); setTimeout(() => window.print(), 50); }
        }}
      />

      <ExcelExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        filteredCount={filtered.length}
        totalCount={SETTLED_PATIENTS.length}
        visibleColumnIds={visibleCols.map((c) => c.id)}
        onConfirm={(opts) => {
          const rows = opts.scope === "all" ? SETTLED_PATIENTS : sorted;
          const csv = generateCsv(rows, { columnIds: opts.columnIds, includeSum: opts.includeSum, filename: opts.filename });
          downloadCsv(csv, opts.filename);
          setShowExportModal(false);
        }}
      />
    </div>
  );
}

function renderCell(c: ColDef, p: SettledPatient, visitDate: string): React.ReactNode {
  switch (c.id) {
    case "chartNo": return p.chartNo;
    case "name":
      return (
        <span title={`${p.name} — 클릭 시 메인 창에서 ${visitDate} 차트 열기`}
          onClick={(e) => {
            e.stopPropagation();
            const payload = { type: "chart-open", chartNo: p.chartNo, name: p.name, visitDate };
            if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
              window.opener.postMessage(payload, "*");
            }
            console.log("[차트 열기 요청]", payload);
          }}
          className="truncate inline-block max-w-full text-[var(--brand-primary)] hover:underline cursor-pointer font-medium print:text-black print:no-underline print:cursor-default print:font-normal">
          {p.name}
        </span>
      );
    case "rrn": return <span className="tabular-nums whitespace-nowrap text-[var(--text-sub)]">{deriveRrn(p)}</span>;
    case "phone": return <span className="tabular-nums whitespace-nowrap text-[var(--text-sub)]">{derivePhone(p)}</span>;
    case "gender": return p.gender;
    case "age": return p.age;
    case "insType": return <span title={p.insType} className="truncate inline-block max-w-full">{p.insType}</span>;
    case "visitorType": return p.isNew ? <span className="text-[var(--brand-primary)] font-medium">신환</span> : null;
    case "visitTime": return p.visitTime;
    case "visitOrder": return p.isFirstVisit ? "초진" : "재진";
    case "doctor": return <span title={p.doctor} className="truncate inline-block max-w-full">{p.doctor}</span>;
    case "total": return p.total.toLocaleString();
    case "nhis": return p.nhis.toLocaleString();
    case "selfPay": return p.selfPay.toLocaleString();
    case "noPay": return p.noPay > 0 ? p.noPay.toLocaleString() : "—";
    case "settledTime": { const t = deriveSettledTime(p); return t ?? <span className="text-[var(--text-disabled)]">—</span>; }
    case "card": return p.card > 0 ? p.card.toLocaleString() : "—";
    case "cash": return p.cash > 0 ? p.cash.toLocaleString() : "—";
    case "unpaid": return p.unpaid > 0
      ? <span className="text-[var(--red-500)] font-bold">{p.unpaid.toLocaleString()}</span>
      : <span className="text-[var(--text-sub)]">—</span>;
  }
}

function SumRow({
  visibleCols, visibleByGroup, count,
  sumTotal, sumNhis, sumSelf, sumNoPay, sumCard, sumCash, sumUnpaid,
}: {
  visibleCols: ColDef[]; visibleByGroup: (g: ColGroup) => number; count: number;
  sumTotal: number; sumNhis: number; sumSelf: number; sumNoPay: number;
  sumCard: number; sumCash: number; sumUnpaid: number;
}) {
  const labelSpan = 1 + visibleByGroup("환자정보") + visibleByGroup("진료정보");
  const numCols = visibleCols.filter((c) => c.group === "진료비 산정" || c.group === "결제");
  const valOf = (id: ColId): { v: number; bold: boolean; red?: boolean } => {
    switch (id) {
      case "total":   return { v: sumTotal,  bold: true };
      case "nhis":    return { v: sumNhis,   bold: false };
      case "selfPay": return { v: sumSelf,   bold: false };
      case "noPay":   return { v: sumNoPay,  bold: false };
      case "card":    return { v: sumCard,   bold: false };
      case "cash":    return { v: sumCash,   bold: false };
      case "unpaid":  return { v: sumUnpaid, bold: false, red: sumUnpaid > 0 };
      default:        return { v: 0, bold: false };
    }
  };
  return (
    <tr className="bg-[var(--bg-subtle)] border-t-2 border-[var(--line-default)] sticky bottom-0">
      <td className="no-print print:hidden" />
      <td className="text-sm font-bold text-[var(--text-main)] px-1 py-2" colSpan={labelSpan - 1}>
        합계 ({count}건)
      </td>
      {numCols.map((c) => {
        const { v, bold, red } = valOf(c.id);
        const show = c.id === "total" || c.id === "nhis" || c.id === "selfPay" || c.id === "noPay" || v > 0;
        return (
          <td key={c.id}
            className={`text-sm font-bold px-1 py-2 text-right tabular-nums ${
              red ? "text-[var(--red-500)]" : bold ? "text-[var(--text-main)]" : "text-[var(--text-sub)]"
            }`}>
            {show ? v.toLocaleString() : "—"}
          </td>
        );
      })}
    </tr>
  );
}

// 처방 검색 combobox — 사전 entry 를 코드/명칭/청구코드로 부분일치 검색.
// 선택 시 해당 entry 를 selectedRx 로 보관, 입력란에는 [코드] 명칭 형태로 표시.
function PrescSearchCombobox({
  selectedRx,
  setSelectedRx,
  prescQuery,
  setPrescQuery,
}: {
  selectedRx: RxDictEntry | null;
  setSelectedRx: (v: RxDictEntry | null) => void;
  prescQuery: string;
  setPrescQuery: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // 선택된 처방이 있으면 입력란은 read-only chip 처럼 노출. 사용자가 ×로 clear 하면 텍스트 입력 가능.
  const hits = searchRxDictionary(prescQuery, 30);

  const pickRx = (rx: RxDictEntry) => {
    setSelectedRx(rx);
    setPrescQuery("");
    setOpen(false);
  };

  const clearRx = () => {
    setSelectedRx(null);
    setPrescQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 max-w-[320px]">
      <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--line-default)] bg-white focus-within:border-[var(--brand-primary)]">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
          <path d="M9 2h4v4M13 2 L8 7M7 9l-1.5 1.5a2.121 2.121 0 0 1-3-3L4 6M6.5 4.5l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {selectedRx ? (
          // 선택된 처방: chip 표시 + × 버튼
          <div className="flex items-center gap-1.5 h-6 px-2 rounded bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)]/40 text-xs text-[var(--brand-primary)] whitespace-nowrap overflow-hidden">
            <span className="font-mono text-[10px] opacity-70 flex-shrink-0">{selectedRx.code}</span>
            <span className="truncate">{selectedRx.name}</span>
            <button onClick={clearRx} aria-label="선택 해제"
              className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1 L7 7 M7 1 L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : (
          <input value={prescQuery}
            onChange={(e) => { setPrescQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="처방 검색 — 코드 또는 명칭 입력..."
            className="flex-1 min-w-0 h-full text-sm outline-none bg-transparent placeholder:text-[var(--text-tertiary)]" />
        )}
      </div>
      {/* 드롭다운 — 입력 중 + 매칭 결과 있을 때만 노출. 30건 cap. */}
      {open && !selectedRx && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[280px] overflow-y-auto bg-white border border-[var(--line-default)] rounded-md shadow-lg">
          {hits.map(rx => (
            <button key={rx.code} type="button" onClick={() => pickRx(rx)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--bg-primary-subtle)] border-b border-[var(--line-subtle)] last:border-b-0">
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] w-16 flex-shrink-0 truncate">{rx.code}</span>
              <span className="text-xs text-[var(--text-main)] flex-1 min-w-0 truncate">{rx.name}</span>
              {rx.billCode && (
                <span className="font-mono text-[10px] text-[var(--text-tertiary)] flex-shrink-0">{rx.billCode}</span>
              )}
              {rx.kind && (
                <span className={`text-[10px] px-1 rounded flex-shrink-0 ${
                  rx.kind === "lab" ? "bg-[var(--blue-100)] text-[var(--blue-700)]"
                  : rx.kind === "procedure" ? "bg-[var(--green-100)] text-[var(--green-700)]"
                  : "bg-[var(--bg-subtle)] text-[var(--text-sub)]"
                }`}>{rx.kind === "lab" ? "검사" : rx.kind === "procedure" ? "시술" : "약"}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {/* 입력 중인데 매칭 결과 없음 — empty state */}
      {open && !selectedRx && prescQuery.trim() && hits.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[var(--line-default)] rounded-md shadow-lg px-3 py-2 text-xs text-[var(--text-tertiary)]">
          일치하는 처방 없음
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  search: string; setSearch: (v: string) => void;
  selectedRx: RxDictEntry | null; setSelectedRx: (v: RxDictEntry | null) => void;
  prescQuery: string; setPrescQuery: (v: string) => void;
  selectedDate: string; setSelectedDate: (v: string) => void;
  insType: string; setInsType: (v: string) => void;
  doctor: string; setDoctor: (v: string) => void;
  room: string; setRoom: (v: string) => void;
  gender: GenderFilter; setGender: (v: GenderFilter) => void;
  visitorType: VisitorTypeFilter; setVisitorType: (v: VisitorTypeFilter) => void;
  visitOrder: VisitOrderFilter; setVisitOrder: (v: VisitOrderFilter) => void;
  payStatus: PayStatusFilter; setPayStatus: (v: PayStatusFilter) => void;
  patientGroups: Set<string>; setPatientGroups: (v: Set<string>) => void;
  patientTags: Set<string>; setPatientTags: (v: Set<string>) => void;
  claim: ClaimFilter; setClaim: (v: ClaimFilter) => void;
  ageMin: string; setAgeMin: (v: string) => void;
  ageMax: string; setAgeMax: (v: string) => void;
  amountMin: string; setAmountMin: (v: string) => void;
  amountMax: string; setAmountMax: (v: string) => void;
  allIns: string[]; allDoctors: string[]; allRooms: string[];
  activeFilterCount: number;
  onReset: () => void;
}

function SettledFilterBar(props: FilterBarProps) {
  const inputCls = "h-7 px-2 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] bg-white";
  const selectCls = `${inputCls} pr-6 appearance-none`;
  const labelCls = "text-xs text-[var(--text-tertiary)] font-medium flex-shrink-0";
  const dateInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    const next = new Set(props.patientTags);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    props.setPatientTags(next);
  };
  const toggleGroup = (g: string) => {
    const next = new Set(props.patientGroups);
    if (next.has(g)) next.delete(g); else next.add(g);
    props.setPatientGroups(next);
  };

  const today = new Date().toISOString().slice(0, 10);
  const isToday = props.selectedDate === today;
  const selectedWeekday = (() => {
    const d = new Date(props.selectedDate);
    if (Number.isNaN(d.getTime())) return "";
    return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  })();
  // 날짜 ◀ ▶ — 1일씩 이동. ▶ 는 오늘 이후로 못 가도록 max=today 정책 유지.
  const shiftDate = (deltaDays: number) => {
    const d = new Date(props.selectedDate);
    if (Number.isNaN(d.getTime())) return;
    d.setDate(d.getDate() + deltaDays);
    const next = d.toISOString().slice(0, 10);
    if (next > today) return; // 미래 날짜 차단
    props.setSelectedDate(next);
  };
  const canGoForward = props.selectedDate < today;

  return (
    <div className="bg-white border-b border-[var(--line-default)] flex-shrink-0">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[var(--line-subtle)]">
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>조회날짜</span>
          {/* ◀ 1일 이전. 항상 활성 (미래 차단만 적용됨). */}
          <button onClick={() => shiftDate(-1)} title="이전 날짜"
            className="h-7 w-7 flex items-center justify-center text-[var(--text-sub)] border border-[var(--line-default)] rounded hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition-colors">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="relative">
            <button type="button" onClick={() => dateInputRef.current?.showPicker?.()}
              className={`${inputCls} flex items-center gap-1.5 tabular-nums hover:bg-[var(--bg-subtle)]`}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
                <rect x="2.5" y="3.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span>{props.selectedDate}{selectedWeekday && ` (${selectedWeekday})`}</span>
            </button>
            <input ref={dateInputRef} type="date" value={props.selectedDate} max={today}
              onChange={(e) => props.setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              tabIndex={-1} aria-hidden="true" />
          </div>
          {/* ▶ 1일 이후. 오늘(today) 보다 더 미래는 불가하므로 isToday 일 때 비활성. */}
          <button onClick={() => shiftDate(1)} disabled={!canGoForward} title="다음 날짜"
            className={`h-7 w-7 flex items-center justify-center border border-[var(--line-default)] rounded transition-colors ${
              canGoForward
                ? "text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]"
                : "text-[var(--text-disabled)] cursor-not-allowed bg-[var(--bg-subtle)]"
            }`}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M6 3 L11 8 L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={() => props.setSelectedDate(today)} disabled={isToday}
            className={`h-7 px-2 text-sm rounded transition-colors ${
              isToday ? "text-[var(--text-disabled)] cursor-not-allowed border border-[var(--line-default)]"
                      : "text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
            }`}>오늘</button>
        </div>

        {/* 환자 검색 */}
        <div className="flex-1 min-w-0 max-w-[280px]">
          <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--line-default)] bg-white focus-within:border-[var(--brand-primary)]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input value={props.search} onChange={(e) => props.setSearch(e.target.value)}
              placeholder="환자 검색"
              className="flex-1 min-w-0 h-full text-sm outline-none bg-transparent placeholder:text-[var(--text-tertiary)]" />
          </div>
        </div>

        {/* 처방 검색 — RX_DICTIONARY 에서 사용자코드/명칭/청구코드 부분일치 autocomplete.
            선택된 처방의 code 로 환자 표 필터링. */}
        <PrescSearchCombobox
          selectedRx={props.selectedRx} setSelectedRx={props.setSelectedRx}
          prescQuery={props.prescQuery} setPrescQuery={props.setPrescQuery}
        />

        <button onClick={props.onReset} disabled={props.activeFilterCount === 0}
          className={`h-7 px-3 text-sm rounded-md flex items-center gap-1.5 transition-colors flex-shrink-0 border ${
            props.activeFilterCount === 0
              ? "text-[var(--text-disabled)] cursor-not-allowed border-[var(--line-default)] bg-[var(--bg-subtle)]"
              : "text-[var(--text-sub)] border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]"
          }`}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8a5 5 0 1 1 1.5 3.5M3 4v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          초기화
          {props.activeFilterCount > 0 && (
            <span className="ml-0.5 text-xs text-[var(--brand-primary)] font-bold tabular-nums">{props.activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 flex-wrap border-b border-[var(--line-subtle)]">
        <FilterGroup label="결제상태">
          {(["전체", "수납대기", "수납완료"] as const).map((v) => (
            <RadioPill key={v} active={props.payStatus === v} onClick={() => props.setPayStatus(v)}>{v}</RadioPill>
          ))}
        </FilterGroup>
        <Sep />
        <FilterGroup label="보험">
          {props.allIns.map((i) => (
            <RadioPill key={i} active={props.insType === i} onClick={() => props.setInsType(i)}>{i}</RadioPill>
          ))}
        </FilterGroup>
        <FilterGroup label="담당의">
          <select value={props.doctor} onChange={(e) => props.setDoctor(e.target.value)} className={selectCls}>
            {props.allDoctors.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="진료실">
          <select value={props.room} onChange={(e) => props.setRoom(e.target.value)} className={selectCls}>
            {props.allRooms.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </FilterGroup>
        <FilterGroup label="진료비">
          <input type="text" inputMode="numeric" value={props.amountMin}
            onChange={(e) => props.setAmountMin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0" className={`${inputCls} w-20 tabular-nums text-right`} />
          <span className="text-xs text-[var(--text-tertiary)]">~</span>
          <input type="text" inputMode="numeric" value={props.amountMax}
            onChange={(e) => props.setAmountMax(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="999,999" className={`${inputCls} w-20 tabular-nums text-right`} />
          <span className="text-xs text-[var(--text-tertiary)]">원</span>
        </FilterGroup>
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 flex-wrap border-b border-[var(--line-subtle)]">
        <FilterGroup label="성별">
          {(["전체", "남", "여"] as const).map((v) => (
            <RadioPill key={v} active={props.gender === v} onClick={() => props.setGender(v)}>{v}</RadioPill>
          ))}
        </FilterGroup>
        <Sep />
        <FilterGroup label="신환여부">
          {(["전체", "신환", "구환"] as const).map((v) => (
            <RadioPill key={v} active={props.visitorType === v} onClick={() => props.setVisitorType(v)}>{v}</RadioPill>
          ))}
        </FilterGroup>
        <Sep />
        <FilterGroup label="초/재진">
          {(["전체", "초진", "재진"] as const).map((v) => (
            <RadioPill key={v} active={props.visitOrder === v} onClick={() => props.setVisitOrder(v)}>{v}</RadioPill>
          ))}
        </FilterGroup>
        <Sep />
        <FilterGroup label="청구여부">
          {(["전체", "청구", "비청구"] as const).map((v) => (
            <RadioPill key={v} active={props.claim === v} onClick={() => props.setClaim(v)}>{v}</RadioPill>
          ))}
        </FilterGroup>
        <Sep />
        <FilterGroup label="만나이">
          <input type="text" inputMode="numeric" value={props.ageMin}
            onChange={(e) => props.setAgeMin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0" className={`${inputCls} w-12 tabular-nums text-center`} />
          <span className="text-xs text-[var(--text-tertiary)]">~</span>
          <input type="text" inputMode="numeric" value={props.ageMax}
            onChange={(e) => props.setAgeMax(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="120" className={`${inputCls} w-12 tabular-nums text-center`} />
          <span className="text-xs text-[var(--text-tertiary)]">세</span>
        </FilterGroup>
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 flex-wrap">
        <FilterGroup label="환자그룹">
          {PATIENT_GROUPS.map((g) => {
            const active = props.patientGroups.has(g);
            return (
              <button key={g} onClick={() => toggleGroup(g)}
                className={`h-6 px-2 text-sm rounded transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--brand-primary)] text-white font-medium"
                    : "bg-white text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                }`}>
                {g}
              </button>
            );
          })}
          {props.patientGroups.size > 0 && (
            <button onClick={() => props.setPatientGroups(new Set())}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-sub)] ml-1">그룹 해제</button>
          )}
        </FilterGroup>
        <Sep />
        <FilterGroup label="환자유형">
          {PATIENT_TAGS.map((tag) => {
            const active = props.patientTags.has(tag);
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`h-6 px-2 text-sm rounded transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--brand-primary)] text-white font-medium"
                    : "bg-white text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                }`}>
                {tag}
              </button>
            );
          })}
          {props.patientTags.size > 0 && (
            <button onClick={() => props.setPatientTags(new Set())}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-sub)] ml-1">태그 해제</button>
          )}
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-[var(--text-tertiary)] font-medium flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Sep() { return <span className="w-px h-4 bg-[var(--line-default)]" />; }

function RadioPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`h-6 px-2 text-sm rounded transition-colors ${
        active
          ? "bg-[var(--brand-primary)] text-white font-medium"
          : "bg-white text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
      }`}>
      {children}
    </button>
  );
}

function SortableTh({ children, align, active, dir, onClick }: {
  children: React.ReactNode; align: "left" | "center" | "right"; active: boolean; dir: "asc" | "desc"; onClick: () => void;
}) {
  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <th className="px-2 py-1.5 whitespace-nowrap">
      <button onClick={onClick}
        className={`w-full flex items-center gap-1 ${justify} text-xs font-medium transition-colors ${
          active ? "text-[var(--brand-primary)] font-bold" : "text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
        }`}>
        {children}
        {active ? (
          <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className={`transition-transform ${dir === "desc" ? "rotate-180" : ""}`}>
            <path d="M4 1.5L6.5 5L1.5 5L4 1.5Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className="opacity-30">
            <path d="M2 3L4 1L6 3M2 5L4 7L6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </button>
    </th>
  );
}
