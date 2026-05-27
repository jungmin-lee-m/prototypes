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
        <span className="text-md font-bold text-[var(--text-main)]">최근 바이탈</span>
        <button className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">+ 기록</button>
      </div>
      <div className="px-3 pb-2">
        {/* Header */}
        <div className="grid grid-cols-4 py-1">
          {["일자", "혈압", "맥박", "체온"].map((h) => (
            <span key={h} className="text-xs font-medium text-[var(--text-tertiary)] text-center">{h}</span>
          ))}
        </div>
        {vitals.map((v) => (
          <div key={v.date} className="grid grid-cols-4 py-1 border-t border-[var(--bg-subtle)]">
            <span className="text-sm text-[var(--text-main)] text-center">{v.date}</span>
            <span className={`text-sm font-medium text-center ${v.bpHigh ? "text-[var(--red-500)]" : "text-[var(--text-main)]"}`}>{v.bp}</span>
            <span className="text-sm font-medium text-[var(--text-main)] text-center">{v.hr}</span>
            <span className="text-sm font-medium text-[var(--text-main)] text-center">{v.temp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
