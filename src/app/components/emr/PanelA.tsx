// Panel A: 대기 패널 (Waiting List)

const calDays = [
  { day: "일", color: "text-[#FF4242]" },
  { day: "월", color: "text-[#989BA2]" },
  { day: "화", color: "text-[#989BA2]" },
  { day: "수", color: "text-[#989BA2]" },
  { day: "목", color: "text-[#989BA2]" },
  { day: "금", color: "text-[#989BA2]" },
  { day: "토", color: "text-[#3385FF]" },
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
  { id: "100236", name: "황미진", gender: "여", age: 45, status: "진료중", waitMin: 30, visitType: "재진", insType: "일반", symptom: "교통사고 후유증", tags: ["검", "주"], color: "#6541F2" },
  { id: "100234", name: "박소윤", gender: "여", age: 34, status: "대기", waitMin: 23, visitType: "재진", insType: "일반", symptom: "혈압약 처방 요청", tags: ["약"], color: "#FF7B2E" },
  { id: "100237", name: "김현빈", gender: "남", age: 52, status: "대기", waitMin: 14, visitType: "재진", insType: "일반", symptom: "고지혈증 정기 검진", tags: ["검"], color: "#FF7B2E" },
  { id: "100240", name: "이하늘", gender: "여", age: 28, status: "대기", waitMin: 7, visitType: "초진", insType: "건보", symptom: "감기, 목 통증", tags: [], color: "#FF7B2E" },
  { id: "100241", name: "정수현", gender: "남", age: 41, status: "보류", waitMin: 0, visitType: "재진", insType: "일반", symptom: "기다리겠다고 전화 후 이탈", tags: [], color: "#C2C4C8" },
  { id: "100242", name: "최윤서", gender: "여", age: 67, status: "대기", waitMin: 2, visitType: "재진", insType: "건보", symptom: "혈압, 당뇨 정기 관리", tags: ["주", "약"], color: "#FF7B2E" },
  { id: "100243", name: "강도윤", gender: "남", age: 8, status: "대기", waitMin: 5, visitType: "초진", insType: "건보", symptom: "발열, 인후통", tags: [], color: "#FF7B2E" },
  { id: "100244", name: "서예린", gender: "여", age: 73, status: "대기", waitMin: 8, visitType: "재진", insType: "건보", symptom: "고혈압 정기진료", tags: ["주"], color: "#FF7B2E" },
  { id: "100245", name: "오준혁", gender: "남", age: 19, status: "대기", waitMin: 12, visitType: "초진", insType: "일반", symptom: "두통, 어지러움", tags: [], color: "#FF7B2E" },
  { id: "100246", name: "이지아", gender: "여", age: 30, status: "대기", waitMin: 15, visitType: "초진", insType: "일반", symptom: "생리통, 복통", tags: [], color: "#FF7B2E" },
];

const tagColors: Record<string, string> = {
  "검": "bg-[#EAF2FE] text-[#3385FF]",
  "주": "bg-[#FFF1D1] text-[#A67300]",
  "약": "bg-[#EDF8EF] text-[#2EA652]",
  "방": "bg-[#F1EDFF] text-[#6541F2]",
  "중": "bg-[#FEECEC] text-[#FF4242]",
};

export function PanelA() {
  return (
    <div className="flex flex-col w-[220px] h-full bg-[#ECEEF8] flex-shrink-0 overflow-hidden">
      {/* Mini Calendar */}
      <div className="border-b border-[#DBDCDF] bg-white">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <button className="text-[#70737C] text-sm font-bold">‹</button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#171719]">2026년 3월</span>
            <span className="text-[9px] font-medium text-[#453EDC] border border-[#453EDC] rounded-[4px] bg-[#FBFAFF] px-1.5 py-0.5">오늘</span>
          </div>
          <button className="text-[#70737C] text-sm font-bold">›</button>
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
        <div className="px-2 pb-2">
          {calRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7">
              {row.map((cell, ci) => (
                <div key={ci} className="flex flex-col items-center py-0.5">
                  {cell.date ? (
                    <>
                      <div
                        className={`w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] ${
                          cell.isToday
                            ? "bg-[#453EDC] text-white font-bold"
                            : cell.isSun
                            ? "text-[#FF4242]"
                            : cell.isSat
                            ? "text-[#3385FF]"
                            : "text-[#292A2D]"
                        }`}
                      >
                        {cell.date}
                      </div>
                      {cell.hasDot && !cell.isToday && (
                        <div className="w-[3px] h-[3px] rounded-full bg-[#453EDC] mt-0.5" />
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
      <div className="flex items-center border-b border-[#DBDCDF] bg-white">
        {[
          { label: "예약", cnt: 8, active: false },
          { label: "대기", cnt: 4, active: true },
          { label: "보류", cnt: 1, active: false },
          { label: "수납", cnt: 2, active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            className={`flex-1 flex items-center justify-center gap-1 h-10 cursor-pointer relative ${
              tab.active ? "text-[#171719]" : "text-[#989BA2]"
            }`}
          >
            <span className={`text-[12px] ${tab.active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
            <span
              className={`text-[9px] font-bold text-white rounded-full w-4 h-[14px] flex items-center justify-center ${
                tab.active ? "bg-[#453EDC]" : "bg-[#C2C4C8]"
              }`}
            >
              {tab.cnt}
            </span>
            {tab.active && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[52px] h-[2px] bg-[#453EDC] rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {patients.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col border-b border-[#DBDCDF] py-2 pl-4 pr-3 cursor-pointer hover:bg-[#F7F7F8] ${
              p.status === "진료중" ? "bg-[#FBFAFF]" : "bg-white"
            }`}
          >
            {/* Left status strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: p.color }}
            />
            {/* Row 1: id + name + gender/age + wait time */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-[#989BA2]">{p.id}</span>
              <span className="text-[13px] font-bold text-[#171719] ml-1">{p.name}</span>
              <span className="text-[11px] text-[#70737C]">({p.gender}/{p.age})</span>
              <div className="flex items-center gap-0.5 ml-auto">
                {p.status === "진료중" ? (
                  <span className="text-[9px] font-bold rounded-[3px] px-1.5 py-0.5 bg-[#6541F2] text-white flex-shrink-0">
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
                  p.visitType === "재진" ? "bg-[#FFF1D1] text-[#A67300]" : "bg-[#EAF2FE] text-[#3385FF]"
                }`}
              >
                {p.visitType}
              </span>
              <span className="text-[9px] font-medium rounded-[3px] px-1.5 py-0.5 bg-[#F7F7F8] text-[#70737C] flex-shrink-0">
                {p.insType}
              </span>
              <span className="text-[11px] text-[#46474C] ml-1 truncate">{p.symptom}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}