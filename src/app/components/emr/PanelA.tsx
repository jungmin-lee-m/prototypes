// Panel A: 대기 패널 (Waiting List)
// 탭: 예약 / 대기 / 보류 / 수납 — 각 탭마다 환자 목록 노출
// 상단에 진료실 선택 dropdown — 다른 진료실로 전환 가능

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const calDays = [
  { day: "일", color: "text-[var(--red-500)]" },
  { day: "월", color: "text-[var(--text-tertiary)]" },
  { day: "화", color: "text-[var(--text-tertiary)]" },
  { day: "수", color: "text-[var(--text-tertiary)]" },
  { day: "목", color: "text-[var(--text-tertiary)]" },
  { day: "금", color: "text-[var(--text-tertiary)]" },
  { day: "토", color: "text-[var(--text-link)]" },
];

type CalDay = {
  date: number | null;
  hasDot?: boolean;
  isSun?: boolean;
  isSat?: boolean;
  isToday?: boolean;
};

const calRows: CalDay[][] = [
  [
    { date: 1, isSun: true },
    { date: 2 },
    { date: 3, hasDot: true },
    { date: 4 },
    { date: 5, hasDot: true },
    { date: 6 },
    { date: 7, isSat: true },
  ],
  [
    { date: 8, isSun: true },
    { date: 9 },
    { date: 10, hasDot: true },
    { date: 11 },
    { date: 12, hasDot: true },
    { date: 13 },
    { date: 14, isSat: true },
  ],
  [
    { date: 15, isSun: true },
    { date: 16 },
    { date: 17, isToday: true },
    { date: 18 },
    { date: 19, hasDot: true },
    { date: 20 },
    { date: 21, isSat: true },
  ],
  [
    { date: 22, isSun: true },
    { date: 23 },
    { date: 24, hasDot: true },
    { date: 25 },
    { date: 26, hasDot: true },
    { date: 27 },
    { date: 28, isSat: true },
  ],
  [
    { date: 29, isSun: true },
    { date: 30 },
    { date: 31, hasDot: true },
    { date: null },
    { date: null },
    { date: null },
    { date: null },
  ],
];

type PatientStatus = "예약" | "대기" | "진료중" | "보류" | "수납대기" | "수납완료";

type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  status: PatientStatus;
  visitType: "재진" | "초진";
  insType: "일반" | "건보";
  symptom: string;
  tags: string[];
  // 탭별 추가 정보
  reservedAt?: string;    // 예약: 예약시각 (HH:MM)
  checkInAt?: string;     // 대기/진료중/보류/수납: 접수시각 (HH:MM)
  heldAt?: string;        // 보류: 보류 처리 시각 — 여기로부터 보류 경과 계산
  paidAt?: string;        // 수납완료: 수납 처리 시각
  holdReason?: string;    // 보류: 보류 사유
  amount?: number;        // 수납대기: 청구 금액 / 수납완료: 수납 금액 (원)
};

// 시뮬레이션 현재 시각 — 실제로는 Date.now() 사용
const NOW_REF = "15:00";

// HH:MM 문자열을 분(minute) 단위 정수로 변환
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
// 접수시각 → 현재까지 경과 분 (대기시간 계산)
const minutesSince = (checkInAt: string): number => {
  return Math.max(0, toMinutes(NOW_REF) - toMinutes(checkInAt));
};

const patients: Patient[] = [
  // ── 진료중 (1명) ──────────────────────────────────────────
  { id: "100236", name: "황미진", gender: "여", age: 45, status: "진료중", visitType: "재진", insType: "일반", symptom: "교통사고 후유증", tags: ["검", "주"], checkInAt: "14:30" },

  // ── 대기 (4명) ────────────────────────────────────────────
  { id: "100234", name: "박소윤", gender: "여", age: 34, status: "대기", visitType: "재진", insType: "일반", symptom: "혈압약 처방 요청", tags: ["약"], checkInAt: "14:37" },
  { id: "100237", name: "김현빈", gender: "남", age: 52, status: "대기", visitType: "재진", insType: "일반", symptom: "고지혈증 정기 검진", tags: ["검"], checkInAt: "14:46" },
  { id: "100240", name: "이하늘", gender: "여", age: 28, status: "대기", visitType: "초진", insType: "건보", symptom: "감기, 목 통증", tags: [], checkInAt: "14:53" },
  { id: "100242", name: "최윤서", gender: "여", age: 67, status: "대기", visitType: "재진", insType: "건보", symptom: "혈압, 당뇨 정기 관리", tags: ["주", "약"], checkInAt: "14:58" },

  // ── 예약 (8명) — 오늘 진료 예약된 환자, 아직 도착 안 함 ──
  { id: "100250", name: "한지호", gender: "남", age: 38, status: "예약", visitType: "재진", insType: "건보", symptom: "당뇨 정기 검진", tags: ["검"], reservedAt: "09:30" },
  { id: "100251", name: "임수아", gender: "여", age: 52, status: "예약", visitType: "재진", insType: "일반", symptom: "갑상선 추적 관찰", tags: [], reservedAt: "10:00" },
  { id: "100252", name: "장우영", gender: "남", age: 29, status: "예약", visitType: "초진", insType: "건보", symptom: "건강검진 결과 상담", tags: [], reservedAt: "10:30" },
  { id: "100253", name: "윤서연", gender: "여", age: 41, status: "예약", visitType: "재진", insType: "건보", symptom: "고혈압 약 처방", tags: ["약"], reservedAt: "11:00" },
  { id: "100254", name: "황민준", gender: "남", age: 60, status: "예약", visitType: "재진", insType: "건보", symptom: "관절염 정기 관리", tags: ["주"], reservedAt: "13:30" },
  { id: "100255", name: "조은비", gender: "여", age: 25, status: "예약", visitType: "초진", insType: "일반", symptom: "두통 상담", tags: [], reservedAt: "14:00" },
  { id: "100256", name: "송재현", gender: "남", age: 47, status: "예약", visitType: "재진", insType: "일반", symptom: "위염 추적", tags: ["검"], reservedAt: "14:30" },
  { id: "100257", name: "백서윤", gender: "여", age: 33, status: "예약", visitType: "재진", insType: "건보", symptom: "알러지 검사 결과 확인", tags: [], reservedAt: "15:00" },

  // ── 보류 (1명) — 1차 진료 후 검사실로 이동, 결과 확인 위해 재호출 대기 ──
  { id: "100241", name: "정수현", gender: "남", age: 41, status: "보류", visitType: "재진", insType: "일반", symptom: "복부 통증 — 정밀 검사 필요", tags: [], checkInAt: "13:45", heldAt: "14:00", holdReason: "1차 진료 후 검사 중 — 결과 확인 위해 재호출 필요" },

  // ── 수납대기 (2명) — 진료 종료 후 원무 수납 대기 ──────────
  { id: "100260", name: "노아인", gender: "여", age: 39, status: "수납대기", visitType: "재진", insType: "건보", symptom: "위장약 처방", tags: ["약"], checkInAt: "13:45", amount: 23500 },
  { id: "100261", name: "안준호", gender: "남", age: 56, status: "수납대기", visitType: "재진", insType: "일반", symptom: "허리 디스크 추적", tags: ["주"], checkInAt: "13:50", amount: 41200 },

  // ── 수납완료 (3명) — 오늘 수납 처리 완료 ──────────────────
  { id: "100243", name: "강도윤", gender: "남", age: 8, status: "수납완료", visitType: "초진", insType: "건보", symptom: "발열, 인후통", tags: [], checkInAt: "13:30", paidAt: "14:12", amount: 45200 },
  { id: "100244", name: "서예린", gender: "여", age: 73, status: "수납완료", visitType: "재진", insType: "건보", symptom: "고혈압 정기진료", tags: ["주"], checkInAt: "14:00", paidAt: "14:45", amount: 18700 },
  { id: "100262", name: "유진우", gender: "남", age: 22, status: "수납완료", visitType: "초진", insType: "일반", symptom: "감기 진료", tags: [], checkInAt: "13:15", paidAt: "13:55", amount: 12300 },
];

// ── 진료실 목록 ────────────────────────────────────────────
const ROOMS = [
  { id: "room-1", label: "1진료실", doctor: "김의사" },
  { id: "room-2", label: "2진료실", doctor: "이의사" },
  { id: "room-3", label: "3진료실", doctor: "박의사" },
  { id: "room-4", label: "건강검진실", doctor: "최의사" },
];

const tagColors: Record<string, string> = {
  "검": "bg-[var(--bg-primary-subtle)] text-[var(--text-link)]",
  "주": "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)]",
  "약": "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)]",
  "방": "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]",
  "중": "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)]",
};

// 진료실 전환 dropdown — 현재 선택된 진료실 라벨 + 펼침 시 다른 진료실 옵션
function RoomSwitcher({
  current,
  onChange,
}: {
  current: typeof ROOMS[number];
  onChange: (room: typeof ROOMS[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-room-menu]") && !t.closest("[data-room-trigger]")) setOpen(false);
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [open]);

  const rect = btnRef.current?.getBoundingClientRect();

  return (
    <>
      <button
        ref={btnRef}
        data-room-trigger
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-2.5 h-9 border-b border-[var(--line-default)] transition-colors ${
          open ? "bg-[var(--bg-primary-subtle)]" : "bg-white hover:bg-[var(--bg-subtle)]"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* 의사 아바타 */}
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-micro font-bold flex-shrink-0">
            {current.doctor.slice(0, 1)}
          </span>
          <span className="text-md font-bold text-[var(--text-main)] truncate">{current.label}</span>
          <span className="text-xs text-[var(--text-tertiary)] truncate">{current.doctor}</span>
        </div>
        <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && rect && createPortal(
        <div
          data-room-menu
          className="fixed z-[9998] bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 overflow-hidden"
          style={{
            top: rect.bottom + 2,
            left: rect.left,
            width: rect.width,
          }}
        >
          {ROOMS.map(r => {
            const active = r.id === current.id;
            return (
              <button
                key={r.id}
                onClick={() => { onChange(r); setOpen(false); }}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors ${
                  active ? "bg-[var(--bg-primary-subtle)]" : "hover:bg-[var(--bg-subtle)]"
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-micro font-bold flex-shrink-0 ${
                  active ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-sub)]"
                }`}>
                  {r.doctor.slice(0, 1)}
                </span>
                <span className={`text-md flex-1 truncate ${active ? "font-bold text-[var(--brand-primary)]" : "text-[var(--text-main)]"}`}>
                  {r.label}
                </span>
                <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{r.doctor}</span>
                {active && (
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--brand-primary)] flex-shrink-0">
                    <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

type TabKey = "예약" | "대기" | "수납대기" | "수납완료";

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: "예약",     label: "예약" },
  { key: "대기",     label: "대기" },     // 진료중 + 대기 + 보류 통합
  { key: "수납대기", label: "수납대기" },
  { key: "수납완료", label: "수납완료" },
];

export function PanelA({
  // 환자명 클릭 → 환자 자세히보기 모달 열기. EmrScreen 에서 주입.
  onPatientNameClick,
}: {
  onPatientNameClick?: (patientId: string) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState<TabKey>("대기");
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  // 환자 행 우클릭 컨텍스트 메뉴
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; patient: Patient } | null>(null);
  // 한 번이라도 호출했던 환자 id 셋 — 호출 → 재호출 라벨 전환용. 데모용 1명 (박소윤) prefill.
  const [calledIds, setCalledIds] = useState<Set<string>>(new Set(["100234"]));
  const markCalled = (id: string) => setCalledIds(prev => new Set(prev).add(id));

  // 외부 클릭 / Esc / 스크롤 시 컨텍스트 메뉴 닫기
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [contextMenu]);

  // 탭별 환자 필터 — 대기 탭은 진료중 + 대기 + 보류 모두 포함
  const tabPatients = (() => {
    if (activeTab === "대기") {
      return patients.filter(p => p.status === "진료중" || p.status === "대기" || p.status === "보류");
    }
    return patients.filter(p => p.status === activeTab);
  })();

  // 탭 카운트 — 대기 탭은 활성 대기 환자 + 보류 합산 (진료중은 시각 노출용이라 카운트 제외)
  const tabCount = (tab: TabKey) => {
    if (tab === "대기") return patients.filter(p => p.status === "대기" || p.status === "보류").length;
    return patients.filter(p => p.status === tab).length;
  };

  return (
    <div className="flex flex-col w-[232px] h-full bg-[var(--bg-subtle)] flex-shrink-0 overflow-hidden">
      {/* Mini Calendar */}
      <div className="border-b border-[var(--line-default)] bg-white">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
          <button className="text-[var(--text-sub)] text-sm font-bold">‹</button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--text-main)]">2026년 3월</span>
            <span className="text-micro font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[4px] bg-[var(--bg-primary-subtle)] px-1.5 py-0.5">오늘</span>
          </div>
          <button className="text-[var(--text-sub)] text-sm font-bold">›</button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 px-2 pb-1">
          {calDays.map((d) => (
            <div key={d.day} className={`text-center text-xs font-medium py-1 ${d.color}`}>
              {d.day}
            </div>
          ))}
        </div>
        {/* Date grid */}
        <div className="px-1.5 pb-1.5">
          {calRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7">
              {row.map((cell, ci) => (
                <div key={ci} className="flex flex-col items-center py-0.5">
                  {cell.date ? (
                    <>
                      <div
                        className={`w-[22px] h-[22px] flex items-center justify-center rounded-full text-sm ${
                          cell.isToday
                            ? "bg-[var(--brand-primary)] text-white font-bold"
                            : cell.isSun
                            ? "text-[var(--red-500)]"
                            : cell.isSat
                            ? "text-[var(--text-link)]"
                            : "text-[var(--text-main)]"
                        }`}
                      >
                        {cell.date}
                      </div>
                      {cell.hasDot && !cell.isToday && (
                        <div className="w-[3px] h-[3px] rounded-full bg-[var(--brand-primary)] mt-0.5" />
                      )}
                      {!cell.hasDot && <div className="w-[3px] h-[3px] mt-0.5" />}
                    </>
                  ) : (
                    <div className="h-[22px]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 진료실 전환 — 달력 아래, 환자 목록 위 */}
      <RoomSwitcher current={activeRoom} onChange={setActiveRoom} />

      {/* Tab Bar — 4 메인 탭. 카운트는 뱃지가 아닌 컬러 숫자 텍스트로 표기 */}
      <div className="flex items-stretch border-b border-[var(--line-default)] bg-white">
        {TAB_LABELS.map((t) => {
          const active = activeTab === t.key;
          const cnt = tabCount(t.key);
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1 h-8 cursor-pointer relative transition-colors ${
                active ? "text-[var(--text-main)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
              }`}
            >
              <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>{t.label}</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  active ? "text-[var(--brand-primary)]" : "text-[var(--text-tertiary)]"
                }`}
              >
                {cnt}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[52px] h-[2px] bg-[var(--brand-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>


      {/* Patient List — activeTab 으로 필터된 환자 목록 */}
      <div className="flex-1 overflow-y-auto">
        {tabPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-1.5">
            <span className="text-xl opacity-30">
              {activeTab === "예약" ? "📅" :
               activeTab === "수납대기" ? "💵" :
               activeTab === "수납완료" ? "✓" :
               "📋"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{activeTab} 환자가 없습니다</span>
          </div>
        ) : (
          tabPatients.map((p) => {
            const waitMin = p.checkInAt ? minutesSince(p.checkInAt) : 0;
            const heldMin = p.heldAt ? minutesSince(p.heldAt) : 0;
            // 경과 시간 색상 — 길수록 강조
            const elapseColor = (mins: number) =>
              mins >= 30 ? "var(--red-500)" :
              mins >= 15 ? "var(--orange-500)" :
              "var(--text-sub)";

            // 텍스트 간 구분자 ㅣ — 좌우 여백 좁게
            const sep = <span className="text-[var(--text-tertiary)] mx-px flex-shrink-0">ㅣ</span>;

            // row 2 의 메타 정보 — 수납대기/수납완료는 접수시각을 맨 왼쪽에 prefix
            const renderRow2 = () => {
              const memo = p.status === "보류" && p.holdReason ? p.holdReason : p.symptom;
              const showCheckInAtLeft = (p.status === "수납대기" || p.status === "수납완료") && p.checkInAt;
              return (
                <div className="flex items-center text-sm text-[var(--text-sub)] mt-0.5 min-w-0">
                  {/* 수납대기/완료 — 접수시각 맨 왼쪽 */}
                  {showCheckInAtLeft && (
                    <>
                      <span className="tabular-nums flex-shrink-0">{p.checkInAt}</span>
                      {sep}
                    </>
                  )}
                  <span className="flex-shrink-0">{p.visitType}</span>
                  {sep}
                  <span className="flex-shrink-0">{p.insType}</span>
                  {sep}
                  <span className="truncate">{memo}</span>
                </div>
              );
            };

            // 우측 정보 — 상태별 텍스트 (뱃지 X). 접수시각과 경과분 사이 구분자 없이 공백만.
            const renderRow1Right = () => {
              if (p.status === "진료중") {
                return (
                  <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    {p.checkInAt && <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{p.checkInAt}</span>}
                    <span className="text-sm font-bold text-[var(--brand-primary)]">진료중</span>
                  </div>
                );
              }
              if (p.status === "예약" && p.reservedAt) {
                return (
                  <span className="ml-auto text-md font-bold tabular-nums text-[var(--text-link)] flex-shrink-0">
                    {p.reservedAt}
                  </span>
                );
              }
              if (p.status === "대기" && p.checkInAt) {
                return (
                  <div className="ml-auto flex items-baseline gap-1 flex-shrink-0">
                    <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{p.checkInAt}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: elapseColor(waitMin) }}>{waitMin}분</span>
                  </div>
                );
              }
              if (p.status === "보류") {
                return (
                  <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    <span className="text-micro font-bold rounded-[3px] px-1.5 py-0.5 bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border border-[var(--orange-200)] flex-shrink-0">
                      보류
                    </span>
                    {p.checkInAt && (
                      <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{p.checkInAt}</span>
                    )}
                    {p.heldAt && (
                      <span className="text-sm font-bold tabular-nums" style={{ color: elapseColor(heldMin) }}>{heldMin}분</span>
                    )}
                  </div>
                );
              }
              if (p.status === "수납대기" && p.amount !== undefined) {
                return (
                  <span className="ml-auto text-sm font-bold tabular-nums text-[var(--text-main)] flex-shrink-0">
                    {p.amount.toLocaleString()}원
                  </span>
                );
              }
              if (p.status === "수납완료" && p.amount !== undefined) {
                return (
                  <div className="ml-auto flex items-baseline gap-1 flex-shrink-0">
                    {p.paidAt && (
                      <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{p.paidAt}</span>
                    )}
                    <span className="text-sm font-bold tabular-nums text-[var(--text-main)]">
                      {p.amount.toLocaleString()}원
                    </span>
                  </div>
                );
              }
              return null;
            };

            // 호출 버튼 노출 조건 — 대기 탭의 활성 환자 (진료중/대기/보류 모두)
            const showCallButton = activeTab === "대기" && (
              p.status === "대기" || p.status === "보류" || p.status === "진료중"
            );
            // 진료중은 이미 호출되어 들어온 상태 → 항상 "재호출". 그 외는 calledIds 로 분기.
            const hasCalled = p.status === "진료중" || calledIds.has(p.id);

            return (
              <div
                key={p.id}
                onContextMenu={e => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, patient: p });
                }}
                className={`group/row relative flex flex-col border-b border-[var(--line-default)] py-2.5 px-2.5 cursor-pointer hover:bg-[var(--bg-subtle)] ${
                  p.status === "진료중" ? "bg-[var(--bg-primary-subtle)]" : "bg-white"
                }`}
              >
                {/* Row 1: chart no + name + gender/age + 우측. 이름 클릭 → 환자 자세히보기 모달 (initialTab="기본정보"). */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{p.id}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();  // 행 클릭 이벤트 차단 — 모달 열기만 처리
                      onPatientNameClick?.(p.id);
                    }}
                    title="환자 자세히보기"
                    className="text-lg font-bold text-[var(--text-main)] truncate hover:text-[var(--brand-primary)] hover:underline text-left"
                  >
                    {p.name}
                  </button>
                  <span className="text-sm text-[var(--text-sub)] tabular-nums flex-shrink-0">{p.gender}/{p.age}</span>
                  {renderRow1Right()}
                </div>

                {/* Row 2: 재진 ㅣ 일반 ㅣ [상태별 시간] ㅣ 증상/사유 */}
                {renderRow2()}

                {/* 호버 시 노출되는 호출/재호출 버튼 — 카드 우하단, pill 형태 */}
                {showCallButton && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      markCalled(p.id);
                    }}
                    className="absolute bottom-1.5 right-2 opacity-0 group-hover/row:opacity-100 transition-opacity h-6 px-3 rounded-full text-sm font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-sm flex-shrink-0"
                  >
                    {hasCalled ? "재호출" : "호출"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 환자 우클릭 컨텍스트 메뉴 — 탭별로 항목 분기. createPortal 로 패널 클리핑 회피 */}
      {contextMenu && createPortal(
        <div
          className="fixed bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* 예약 — 접수 / 예약취소 */}
          {activeTab === "예약" && (
            <>
              <MenuItem onClick={() => setContextMenu(null)}>접수</MenuItem>
              <MenuItem onClick={() => setContextMenu(null)} danger>예약취소</MenuItem>
            </>
          )}

          {/* 대기 (진료중 + 대기 + 보류) — 호출 / 보류 / 접수취소 / 진료실 변경 ▸ */}
          {activeTab === "대기" && (
            <>
              <MenuItem onClick={() => setContextMenu(null)}>호출</MenuItem>
              <MenuItem onClick={() => setContextMenu(null)}>보류</MenuItem>
              <MenuItem onClick={() => setContextMenu(null)} danger>접수취소</MenuItem>
              <div className="h-px bg-[var(--line-default)] my-1" />
              {/* 진료실 변경 — 호버 시 우측 서브메뉴 노출 */}
              <RoomChangeSubmenu
                currentRoomId={activeRoom.id}
                onChange={() => setContextMenu(null)}
              />
            </>
          )}

          {/* 수납대기 / 수납완료 — 재호출 */}
          {(activeTab === "수납대기" || activeTab === "수납완료") && (
            <MenuItem onClick={() => setContextMenu(null)}>재호출</MenuItem>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// 컨텍스트 메뉴 아이템 — danger 옵션 시 빨간 destructive 스타일
function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${
        danger
          ? "text-[var(--red-500)] hover:bg-[var(--status-error-bg-subtle)]"
          : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
      }`}
    >
      {children}
    </button>
  );
}

// 진료실 변경 — 메뉴 아이템 + 우측 호버 서브메뉴 (2-depth dropdown)
function RoomChangeSubmenu({
  currentRoomId,
  onChange,
}: {
  currentRoomId: string;
  onChange: (roomId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const otherRooms = ROOMS.filter(r => r.id !== currentRoomId);

  // 호버 → 즉시 열기 / 떠나면 150ms 후 닫기 (trigger↔submenu 이동 허용)
  const openNow = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors ${
          open ? "bg-[var(--bg-subtle)] text-[var(--text-main)]" : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
        }`}
      >
        <span>진료실 변경</span>
        <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className="text-[var(--text-tertiary)]">
          <path d="M3 1.5L5.5 4L3 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-full top-0 ml-0.5 bg-white border border-[var(--line-default)] rounded-md shadow-lg py-1 min-w-[180px]"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          {otherRooms.map(r => (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-sub)] text-micro font-bold flex-shrink-0">
                {r.doctor.slice(0, 1)}
              </span>
              <span className="text-[var(--text-main)]">{r.label}</span>
              <span className="text-xs text-[var(--text-tertiary)] ml-auto">{r.doctor}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}