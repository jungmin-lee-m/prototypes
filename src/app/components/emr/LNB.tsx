// LNB — 좌측 글로벌 네비게이션
// "대시보드" 추가. EmrScreen에서 controlled 상태로 사용.

export type LNBItem = "대시보드" | "원무" | "진료" | "검사" | "영상" | "청구" | "통계";

const NAV_ITEMS: LNBItem[] = ["대시보드", "원무", "진료", "검사", "영상", "청구", "통계"];

interface Props {
  active: LNBItem;
  onChange: (item: LNBItem) => void;
}

export function LNB({ active, onChange }: Props) {
  return (
    <div className="flex flex-col items-center w-[60px] h-full bg-[var(--text-main)] flex-shrink-0">
      {/* Logo */}
      <div className="w-8 h-8 bg-[var(--brand-primary)] rounded-lg mt-4 mb-4 flex-shrink-0" />

      {/* Nav Items */}
      <div className="flex flex-col w-full">
        {NAV_ITEMS.map((label) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onChange(label)}
              className={`flex flex-col items-center justify-center h-12 w-full cursor-pointer transition-colors ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-[4px] mb-1 ${
                  isActive ? "bg-white" : "bg-[var(--text-tertiary)]"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-white" : "text-[var(--text-tertiary)]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="flex items-center justify-center h-12 w-full mb-2 cursor-pointer">
        <div className="w-5 h-5 rounded-[4px] bg-[var(--text-tertiary)]" />
      </div>
    </div>
  );
}
