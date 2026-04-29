// Panel: 최근 바이탈
const vitals = [
  { date: "03-12", bp: "128/82", bpHigh: false, hr: 76, temp: 36.5 },
  { date: "02-28", bp: "135/88", bpHigh: false, hr: 72, temp: 36.7 },
  { date: "02-14", bp: "142/90", bpHigh: true,  hr: 80, temp: 36.8 },
];

export function PanelVitals() {
  return (
    <div className="bg-white flex flex-col flex-shrink-0">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[12px] font-bold text-[#292A2D]">최근 바이탈</span>
        <button className="text-[10px] text-[#989BA2] hover:text-[#453EDC]">+ 기록</button>
      </div>
      <div className="px-3 pb-2">
        {/* Header */}
        <div className="grid grid-cols-4 py-1">
          {["일자", "혈압", "맥박", "체온"].map((h) => (
            <span key={h} className="text-[10px] font-medium text-[#989BA2] text-center">{h}</span>
          ))}
        </div>
        {vitals.map((v) => (
          <div key={v.date} className="grid grid-cols-4 py-1 border-t border-[#F7F7F8]">
            <span className="text-[11px] text-[#292A2D] text-center">{v.date}</span>
            <span className={`text-[11px] font-medium text-center ${v.bpHigh ? "text-[#FF4242]" : "text-[#292A2D]"}`}>{v.bp}</span>
            <span className="text-[11px] font-medium text-[#292A2D] text-center">{v.hr}</span>
            <span className="text-[11px] font-medium text-[#292A2D] text-center">{v.temp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
