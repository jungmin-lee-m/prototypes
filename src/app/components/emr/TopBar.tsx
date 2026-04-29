// 레이아웃 아이콘 SVG path (인라인) — 한글 폴더 의존성 제거
const LAYOUT_ICON_PATH = "M13.0625 0H9.10417C8.44708 0 7.91667 0.530417 7.91667 1.1875V5.14583C7.91667 5.80292 8.44708 6.33333 9.10417 6.33333H13.0625C13.7196 6.33333 14.25 5.80292 14.25 5.14583V1.1875C14.25 0.530417 13.7196 0 13.0625 0ZM12.6667 4.75H9.5V1.58333H12.6667V4.75ZM5.14583 0H1.1875C0.530417 0 0 0.530417 0 1.1875V13.0625C0 13.7196 0.530417 14.25 1.1875 14.25H5.14583C5.80292 14.25 6.33333 13.7196 6.33333 13.0625V1.1875C6.33333 0.530417 5.80292 0 5.14583 0ZM4.75 12.6667H1.58333V1.58333H4.75V12.6667ZM13.0625 7.91667H9.10417C8.44708 7.91667 7.91667 8.44708 7.91667 9.10417V13.0625C7.91667 13.7196 8.44708 14.25 9.10417 14.25H13.0625C13.7196 14.25 14.25 13.7196 14.25 13.0625V9.10417C14.25 8.44708 13.7196 7.91667 13.0625 7.91667ZM12.6667 12.6667H9.5V9.5H12.6667V12.6667Z";

export function TopBar({ onOpenLabViewer }: { onOpenLabViewer?: () => void }) {
  return (
    <div className="flex items-center h-14 bg-white border-b border-[#DBDCDF] px-4 gap-3 flex-shrink-0">
      {/* Date Navigation */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className="w-7 h-7 bg-[#F7F7F8] rounded-[6px] flex items-center justify-center text-[#70737C] text-lg leading-none">‹</button>
        <span className="text-[15px] font-bold text-[#171719] px-2 whitespace-nowrap">2026.03.17 (화)</span>
        <button className="w-7 h-7 bg-[#F7F7F8] rounded-[6px] flex items-center justify-center text-[#70737C] text-lg leading-none">›</button>
        <button className="h-7 px-3 bg-[#453EDC] rounded-[6px] text-white text-[13px] font-medium whitespace-nowrap">오늘</button>
      </div>

      {/* Patient Search */}
      <div className="flex items-center gap-2 bg-[#F7F7F8] border border-[#DBDCDF] rounded-lg px-3 h-9 w-[380px] flex-shrink-0">
        <div className="w-4 h-4 bg-[#989BA2] rounded-lg flex-shrink-0" />
        <span className="text-[13px] text-[#989BA2]">환자 검색 (이름, 차트번호, 연락처)</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Recording Button */}
      <button className="flex items-center gap-2 border border-[#FF4242] rounded-[10px] h-9 px-3 bg-white flex-shrink-0">
        <div className="w-5 h-5 rounded-full border border-[#FF4242] flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF4242]" />
        </div>
        <span className="text-[12px] font-bold text-[#FF4242] whitespace-nowrap">녹음 시작</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[#DBDCDF] flex-shrink-0" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="h-9 px-3 bg-white border border-[#C2C4C8] rounded-[10px] text-[13px] font-medium text-[#292A2D] hover:bg-[#F7F7F8] whitespace-nowrap">
          PACS
        </button>
        <button
          onClick={() => onOpenLabViewer?.()}
          className="h-9 px-3 bg-white border border-[#C2C4C8] rounded-[10px] text-[13px] font-medium text-[#292A2D] hover:bg-[#F7F7F8] whitespace-nowrap"
        >
          검사결과
        </button>
        <button className="h-9 px-3 bg-white border border-[#C2C4C8] rounded-[10px] text-[13px] font-medium text-[#292A2D] hover:bg-[#F7F7F8] whitespace-nowrap">
          차트리뷰
        </button>
        <button className="h-9 px-3 bg-white border border-[#C2C4C8] rounded-[10px] text-[13px] font-medium text-[#292A2D] hover:bg-[#F7F7F8] whitespace-nowrap">
          진단서
        </button>

        {/* 레이아웃 버튼 (아이콘 + 텍스트) */}
        <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#C2C4C8] rounded-[10px] text-[13px] font-medium text-[#292A2D] hover:bg-[#F7F7F8] whitespace-nowrap">
          <div className="w-[14px] h-[14px] flex-shrink-0">
            <svg className="w-full h-full" fill="none" viewBox="0 0 14.25 14.25">
              <path d={LAYOUT_ICON_PATH} fill="#46474C" />
            </svg>
          </div>
          레이아웃
        </button>
      </div>
    </div>
  );
}