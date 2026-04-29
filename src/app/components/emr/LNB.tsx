const navItems = [
  { label: "원무", active: false },
  { label: "진료", active: true },
  { label: "검사", active: false },
  { label: "영상", active: false },
  { label: "청구", active: false },
  { label: "통계", active: false },
];

export function LNB() {
  return (
    <div className="flex flex-col items-center w-[60px] h-full bg-[#171719] flex-shrink-0">
      {/* Logo */}
      <div className="w-8 h-8 bg-[#453EDC] rounded-lg mt-4 mb-4 flex-shrink-0" />

      {/* Nav Items */}
      <div className="flex flex-col w-full">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center h-12 w-full cursor-pointer ${
              item.active ? "bg-white/10" : ""
            }`}
          >
            <div
              className={`w-5 h-5 rounded-[4px] mb-1 ${
                item.active ? "bg-white" : "bg-[#989BA2]"
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                item.active ? "text-white" : "text-[#989BA2]"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="flex items-center justify-center h-12 w-full mb-2 cursor-pointer">
        <div className="w-5 h-5 rounded-[4px] bg-[#989BA2]" />
      </div>
    </div>
  );
}