// Panel A: 대기 패널 (Waiting List)

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

type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  status: "진료중" | "대기" | "보류";
  waitMin: number;
  visitType: "재진" | "초진";
  insType: "일반" | "건보";
  symptom: string;
  tags: string[];
  color: string;
};

const patients: Patient[] = [
  { id: "100236", name: "황미진", gender: "여", age: 45, status: "진료중", waitMin: 30, visitType: "재진", insType: "일반", symptom: "교통사고 후유증", tags: ["검", "주"], color: "var(--brand-primary)" },
  { id: "100234", name: "박소윤", gender: "여", age: 34, status: "대기", waitMin: 23, visitType: "재진", insType: "일반", symptom: "혈압약 처방 요청", tags: ["약"], color: "var(--orange-500)" },
  { id: "100237", name: "김현빈", gender: "남", age: 52, status: "대기", waitMin: 14, visitType: "재진", insType: "일반", symptom: "고지혈증 정기 검진", tags: ["검"], color: "var(--orange-500)" },
  { id: "100240", name: "이하늘", gender: "여", age: 28, status: "대기", waitMin: 7, visitType: "초진", insType: "건보", symptom: "감기, 목 통증", tags: [], color: "var(--orange-500)" },
  { id: "100241", name: "정수현", gender: "남", age: 41, status: "보류", waitMin: 0, visitType: "재진", insType: "일반", symptom: "기다리겠다고 전화 후 이탈", tags: [], color: "var(--text-disabled)" },
  { id: "100242", name: "최윤서", gender: "여", age: 67, status: "대기", waitMin: 2, visitType: "재진", insType: "건보", symptom: "혈압, 당뇨 정기 관리", tags: ["주", "약"], color: "var(--orange-500)" },
  { id: "100243", name: "강도윤", gender: "남", age: 8, status: "대기", waitMin: 5, visitType: "초진", insType: "건보", symptom: "발열, 인후통", tags: [], color: "var(--orange-500)" },
  { id: "100244", name: "서예린", gender: "여", age: 73, status: "대기", waitMin: 8, visitType: "재진", insType: "건보", symptom: "고혈압 정기진료", tags: ["주"], color: "var(--orange-500)" },
  { id: "100245", name: "오준혁", gender: "남", age: 19, status: "대기", waitMin: 12, visitType: "초진", insType: "일반", symptom: "두통, 어지러움", tags: [], color: "var(--orange-500)" },
  { id: "100246", name: "이지아", gender: "여", age: 30, status: "대기", waitMin: 15, visitType: "초진", insType: "일반", symptom: "생리통, 복통", tags: [], color: "var(--orange-500)" },
];

const tagColors: Record<string, string> = {
  "검": "bg-[var(--bg-primary-subtle)] text-[var(--text-link)]",
  "주": "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)]",
  "약": "bg-[var(--status-success-bg-subtle)] text-[var(--green-500)]",
  "방": "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]",
  "중": "bg-[var(--status-error-bg-subtle)] text-[var(--red-500)]",
};

export function PanelA() {
  return (
    <div className="flex flex-col w-[220px] h-full bg-[var(--bg-subtle)] flex-shrink-0 overflow-hidden">
      {/* Mini Calendar */}
      <div className="border-b border-[var(--line-default)] bg-white">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
          <button className="text-[var(--text-sub)] text-sm font-bold">‹</button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[var(--text-main)]">2026년 3월</span>
            <span className="text-[9px] font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[4px] bg-[var(--bg-primary-subtle)] px-1.5 py-0.5">오늘</span>
          </div>
          <button className="text-[var(--text-sub)] text-sm font-bold">›</button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 px-2 pb-1">
          {calDays.map((d) => (
            <div key={d.day} className={`text-center text-[10px] font-medium py-1 ${d.color}`}>
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
                        className={`w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] ${
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

      {/* Tab Bar */}
      <div className="flex items-center border-b border-[var(--line-default)] bg-white">
        {[
          { label: "예약", cnt: 8, active: false },
          { label: "대기", cnt: 4, active: true },
          { label: "보류", cnt: 1, active: false },
          { label: "수납", cnt: 2, active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            className={`flex-1 flex items-center justify-center gap-1 h-8 cursor-pointer relative ${
              tab.active ? "text-[var(--text-main)]" : "text-[var(--text-tertiary)]"
            }`}
          >
            <span className={`text-[12px] ${tab.active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
            <span
              className={`text-[9px] font-bold text-white rounded-full w-4 h-[14px] flex items-center justify-center ${
                tab.active ? "bg-[var(--brand-primary)]" : "bg-[var(--text-disabled)]"
              }`}
            >
              {tab.cnt}
            </span>
            {tab.active && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[52px] h-[2px] bg-[var(--brand-primary)] rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {patients.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col border-b border-[var(--line-default)] py-1.5 pl-3 pr-2 cursor-pointer hover:bg-[var(--bg-subtle)] ${
              p.status === "진료중" ? "bg-[var(--bg-primary-subtle)]" : "bg-white"
            }`}
          >
            {/* Left status strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: p.color }}
            />
            {/* Row 1: id badge + name + gender/age + wait time */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium px-1.5 py-0 rounded-[3px] border border-[var(--line-default)] text-[var(--text-tertiary)] tabular-nums">{p.id}</span>
              <span className="text-[13px] font-bold text-[var(--text-main)]">{p.name}</span>
              <span className="text-[11px] text-[var(--text-sub)] tabular-nums">{p.gender}/{p.age}</span>
              <div className="flex items-center gap-0.5 ml-auto">
                {p.status === "진료중" ? (
                  <span className="text-[9px] font-bold rounded-[3px] px-1.5 py-0.5 bg-[var(--brand-primary)] text-white flex-shrink-0">
                    진료중
                  </span>
                ) : (
                  <>
                    <div className="w-[6px] h-[6px] rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] font-bold" style={{ color: p.color }}>
                      {p.waitMin > 0 ? `${p.waitMin}분` : "—"}
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* Row 2: badges + symptom */}
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-[9px] font-medium rounded-[3px] px-1.5 py-0.5 flex-shrink-0 ${
                  p.visitType === "재진" ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)]" : "bg-[var(--bg-primary-subtle)] text-[var(--text-link)]"
                }`}
              >
                {p.visitType}
              </span>
              <span className="text-[9px] font-medium rounded-[3px] px-1.5 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-sub)] flex-shrink-0">
                {p.insType}
              </span>
              <span className="text-[11px] text-[var(--text-sub)] ml-1 truncate">{p.symptom}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}