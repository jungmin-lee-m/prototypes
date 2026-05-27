function Logo() {
  return <div className="absolute bg-[#453edc] left-[14px] rounded-[8px] size-[32px] top-[16px]" data-name="logo" />;
}

function Lnb1() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[72px] w-[60px]" data-name="lnb_원무">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#989ba2] text-[10px] text-center top-[30px] w-[60px]">원무</p>
    </div>
  );
}

function Lnb2() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.08)] h-[48px] left-0 overflow-clip top-[128px] w-[60px]" data-name="lnb_진료">
      <div className="absolute bg-white left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[10px] text-center text-white top-[30px] w-[60px]">진료</p>
    </div>
  );
}

function Lnb3() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[184px] w-[60px]" data-name="lnb_검사">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#989ba2] text-[10px] text-center top-[30px] w-[60px]">검사</p>
    </div>
  );
}

function Lnb4() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[240px] w-[60px]" data-name="lnb_영상">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#989ba2] text-[10px] text-center top-[30px] w-[60px]">영상</p>
    </div>
  );
}

function Lnb5() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[296px] w-[60px]" data-name="lnb_청구">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#989ba2] text-[10px] text-center top-[30px] w-[60px]">청구</p>
    </div>
  );
}

function Lnb6() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[352px] w-[60px]" data-name="lnb_통계">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[6px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#989ba2] text-[10px] text-center top-[30px] w-[60px]">통계</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="absolute h-[48px] left-0 overflow-clip top-[1020px] w-[60px]" data-name="settings">
      <div className="absolute bg-[#989ba2] left-[20px] rounded-[4px] size-[20px] top-[14px]" data-name="Rectangle" />
    </div>
  );
}

function Lnb() {
  return (
    <div className="absolute bg-[#171719] h-[1080px] left-0 overflow-clip top-0 w-[60px]" data-name="LNB">
      <Logo />
      <Lnb1 />
      <Lnb2 />
      <Lnb3 />
      <Lnb4 />
      <Lnb5 />
      <Lnb6 />
      <Settings />
    </div>
  );
}

function Prev() {
  return (
    <div className="absolute bg-[#f7f7f8] left-0 overflow-clip rounded-[6px] size-[28px] top-[2px]" data-name="prev">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] leading-[normal] left-[14px] text-[#70737c] text-[18px] text-center top-[3px] w-[28px]">‹</p>
    </div>
  );
}

function Next() {
  return (
    <div className="absolute bg-[#f7f7f8] left-[168px] overflow-clip rounded-[6px] size-[28px] top-[2px]" data-name="next">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] leading-[normal] left-[14px] text-[#70737c] text-[18px] text-center top-[3px] w-[28px]">›</p>
    </div>
  );
}

function Today() {
  return (
    <div className="absolute bg-[#453edc] h-[28px] left-[204px] overflow-clip rounded-[6px] top-[2px] w-[48px]" data-name="today">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[18px] leading-[normal] left-[24px] text-[13px] text-center text-white top-[5px] w-[48px]">오늘</p>
    </div>
  );
}

function DateNav() {
  return (
    <div className="absolute h-[32px] left-[20px] overflow-clip top-[12px] w-[260px]" data-name="date_nav">
      <Prev />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[40px] text-[#171719] text-[15px] top-[6px] whitespace-nowrap">2026.03.17 (화)</p>
      <Next />
      <Today />
    </div>
  );
}

function PatientSearch() {
  return (
    <div className="absolute bg-[#f7f7f8] border border-[#dbdcdf] border-solid h-[36px] left-[300px] overflow-clip rounded-[8px] top-[10px] w-[420px]" data-name="patient_search">
      <div className="absolute bg-[#989ba2] left-[13px] rounded-[8px] size-[16px] top-[9px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[37px] text-[#989ba2] text-[13px] top-[8px] whitespace-nowrap">환자 검색 (이름, 차트번호, 연락처)</p>
    </div>
  );
}

function Quick() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[36px] left-[1744px] overflow-clip rounded-[8px] top-[10px] w-[96px]" data-name="quick_진단서">
      <div className="absolute bg-[#453edc] left-[13px] rounded-[3px] size-[16px] top-[9px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[37px] text-[#292a2d] text-[13px] top-[8px] whitespace-nowrap">진단서</p>
    </div>
  );
}

function Quick1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[36px] left-[1642px] overflow-clip rounded-[8px] top-[10px] w-[96px]" data-name="quick_차트리뷰">
      <div className="absolute bg-[#453edc] left-[13px] rounded-[3px] size-[16px] top-[9px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[37px] text-[#292a2d] text-[13px] top-[8px] whitespace-nowrap">차트리뷰</p>
    </div>
  );
}

function Quick2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[36px] left-[1540px] overflow-clip rounded-[8px] top-[10px] w-[96px]" data-name="quick_검사결과">
      <div className="absolute bg-[#453edc] left-[13px] rounded-[3px] size-[16px] top-[9px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[37px] text-[#292a2d] text-[13px] top-[8px] whitespace-nowrap">검사결과</p>
    </div>
  );
}

function QuickPacs() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[36px] left-[1438px] overflow-clip rounded-[8px] top-[10px] w-[96px]" data-name="quick_PACS">
      <div className="absolute bg-[#453edc] left-[13px] rounded-[3px] size-[16px] top-[9px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[37px] text-[#292a2d] text-[13px] top-[8px] whitespace-nowrap">PACS</p>
    </div>
  );
}

function DotRing() {
  return (
    <div className="absolute border-[#ff4242] border-[1.5px] border-solid left-[8.5px] overflow-clip rounded-[10px] size-[20px] top-[6.5px]" data-name="dot_ring">
      <div className="absolute bg-[#ff4242] left-[2.5px] rounded-[6px] size-[12px] top-[2.5px]" data-name="Rectangle" />
    </div>
  );
}

function SoapRecorder() {
  return (
    <div className="absolute bg-white border-[#ff4242] border-[1.5px] border-solid h-[36px] left-[1320px] overflow-clip rounded-[8px] top-[9px] w-[95px]" data-name="soap_recorder">
      <DotRing />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[36.5px] text-[#ff4242] text-[12px] top-[8.5px] whitespace-nowrap">녹음 시작</p>
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute bg-white h-[56px] left-[60px] overflow-clip top-0 w-[1860px]" data-name="top_bar">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[55px] w-[1860px]" data-name="Rectangle" />
      <DateNav />
      <PatientSearch />
      <Quick />
      <Quick1 />
      <Quick2 />
      <QuickPacs />
      <div className="absolute bg-[#dbdcdf] h-[24px] left-[1426px] top-[16px] w-px" data-name="Rectangle" />
      <SoapRecorder />
    </div>
  );
}

function CalToday() {
  return (
    <div className="absolute bg-[#fbfaff] border border-[#453edc] border-solid h-[18px] left-[165px] overflow-clip rounded-[4px] top-[14px] w-[32px]" data-name="cal_today">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[12px] leading-[normal] left-[15px] text-[#453edc] text-[9px] text-center top-[2px] w-[32px]">오늘</p>
    </div>
  );
}

function D() {
  return (
    <div className="absolute bg-[#453edc] left-[78.14px] overflow-clip rounded-[11px] size-[22px] top-[104px]" data-name="d_17">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[11px] text-[11px] text-center text-white top-[4px] w-[22px]">17</p>
    </div>
  );
}

function Calendar() {
  return (
    <div className="absolute bg-white h-[200px] left-0 overflow-clip top-0 w-[240px]" data-name="calendar">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#70737c] text-[14px] top-[14px] whitespace-nowrap">‹</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[18px] leading-[normal] left-[120px] text-[#171719] text-[13px] text-center top-[13px] w-[120px]">2026년 3월</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[216px] text-[#70737c] text-[14px] top-[14px] whitespace-nowrap">›</p>
      <CalToday />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[10px] text-center top-[42px] w-[30.857px]">일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[58.29px] text-[#989ba2] text-[10px] text-center top-[42px] w-[30.857px]">월</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[89.14px] text-[#989ba2] text-[10px] text-center top-[42px] w-[30.857px]">화</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[120px] text-[#989ba2] text-[10px] text-center top-[42px] w-[30.857px]">수</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[150.86px] text-[#989ba2] text-[10px] text-center top-[42px] w-[30.857px]">목</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[181.71px] text-[#989ba2] text-[10px] text-center top-[42px] w-[30.857px]">금</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[212.57px] text-[#3385ff] text-[10px] text-center top-[42px] w-[30.857px]">토</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[11px] text-center top-[64px] w-[30.857px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[58.29px] text-[#292a2d] text-[11px] text-center top-[64px] w-[30.857px]">2</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[89.14px] text-[#292a2d] text-[11px] text-center top-[64px] w-[30.857px]">3</p>
      <div className="absolute bg-[#453edc] left-[87.64px] rounded-[2px] size-[3px] top-[77px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[120px] text-[#292a2d] text-[11px] text-center top-[64px] w-[30.857px]">4</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[150.86px] text-[#292a2d] text-[11px] text-center top-[64px] w-[30.857px]">5</p>
      <div className="absolute bg-[#453edc] left-[149.36px] rounded-[2px] size-[3px] top-[77px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[181.71px] text-[#292a2d] text-[11px] text-center top-[64px] w-[30.857px]">6</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[212.57px] text-[#3385ff] text-[11px] text-center top-[64px] w-[30.857px]">7</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[11px] text-center top-[86px] w-[30.857px]">8</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[58.29px] text-[#292a2d] text-[11px] text-center top-[86px] w-[30.857px]">9</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[89.14px] text-[#292a2d] text-[11px] text-center top-[86px] w-[30.857px]">10</p>
      <div className="absolute bg-[#453edc] left-[87.64px] rounded-[2px] size-[3px] top-[99px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[120px] text-[#292a2d] text-[11px] text-center top-[86px] w-[30.857px]">11</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[150.86px] text-[#292a2d] text-[11px] text-center top-[86px] w-[30.857px]">12</p>
      <div className="absolute bg-[#453edc] left-[149.36px] rounded-[2px] size-[3px] top-[99px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[181.71px] text-[#292a2d] text-[11px] text-center top-[86px] w-[30.857px]">13</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[212.57px] text-[#3385ff] text-[11px] text-center top-[86px] w-[30.857px]">14</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[11px] text-center top-[108px] w-[30.857px]">15</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[58.29px] text-[#292a2d] text-[11px] text-center top-[108px] w-[30.857px]">16</p>
      <D />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[120px] text-[#292a2d] text-[11px] text-center top-[108px] w-[30.857px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[150.86px] text-[#292a2d] text-[11px] text-center top-[108px] w-[30.857px]">19</p>
      <div className="absolute bg-[#453edc] left-[149.36px] rounded-[2px] size-[3px] top-[121px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[181.71px] text-[#292a2d] text-[11px] text-center top-[108px] w-[30.857px]">20</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[212.57px] text-[#3385ff] text-[11px] text-center top-[108px] w-[30.857px]">21</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[11px] text-center top-[130px] w-[30.857px]">22</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[58.29px] text-[#292a2d] text-[11px] text-center top-[130px] w-[30.857px]">23</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[89.14px] text-[#292a2d] text-[11px] text-center top-[130px] w-[30.857px]">24</p>
      <div className="absolute bg-[#453edc] left-[87.64px] rounded-[2px] size-[3px] top-[143px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[120px] text-[#292a2d] text-[11px] text-center top-[130px] w-[30.857px]">25</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[150.86px] text-[#292a2d] text-[11px] text-center top-[130px] w-[30.857px]">26</p>
      <div className="absolute bg-[#453edc] left-[149.36px] rounded-[2px] size-[3px] top-[143px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[181.71px] text-[#292a2d] text-[11px] text-center top-[130px] w-[30.857px]">27</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[212.57px] text-[#3385ff] text-[11px] text-center top-[130px] w-[30.857px]">28</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[27.43px] text-[#ff4242] text-[11px] text-center top-[152px] w-[30.857px]">29</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[58.29px] text-[#292a2d] text-[11px] text-center top-[152px] w-[30.857px]">30</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[89.14px] text-[#292a2d] text-[11px] text-center top-[152px] w-[30.857px]">31</p>
      <div className="absolute bg-[#453edc] left-[87.64px] rounded-[2px] size-[3px] top-[165px]" data-name="Rectangle" />
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[199px] w-[240px]" data-name="Rectangle" />
    </div>
  );
}

function Cnt() {
  return (
    <div className="absolute bg-[#c2c4c8] h-[14px] left-[40px] overflow-clip rounded-[7px] top-[14px] w-[16px]" data-name="cnt_예약">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[10px] leading-[normal] left-[8px] text-[9px] text-center text-white top-[2px] w-[16px]">8</p>
    </div>
  );
}

function Cnt1() {
  return (
    <div className="absolute bg-[#453edc] h-[14px] left-[100px] overflow-clip rounded-[7px] top-[14px] w-[16px]" data-name="cnt_대기">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[10px] leading-[normal] left-[8px] text-[9px] text-center text-white top-[2px] w-[16px]">4</p>
    </div>
  );
}

function Cnt2() {
  return (
    <div className="absolute bg-[#c2c4c8] h-[14px] left-[160px] overflow-clip rounded-[7px] top-[14px] w-[16px]" data-name="cnt_보류">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[10px] leading-[normal] left-[8px] text-[9px] text-center text-white top-[2px] w-[16px]">1</p>
    </div>
  );
}

function Cnt3() {
  return (
    <div className="absolute bg-[#c2c4c8] h-[14px] left-[220px] overflow-clip rounded-[7px] top-[14px] w-[16px]" data-name="cnt_수납">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[10px] leading-[normal] left-[8px] text-[9px] text-center text-white top-[2px] w-[16px]">2</p>
    </div>
  );
}

function TabBar() {
  return (
    <div className="absolute bg-white h-[40px] left-0 overflow-clip top-[200px] w-[240px]" data-name="tab_bar">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] leading-[normal] left-[20px] text-[#989ba2] text-[12px] text-center top-[12px] w-[40px]">예약</p>
      <Cnt />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[80px] text-[#171719] text-[12px] text-center top-[12px] w-[40px]">대기</p>
      <Cnt1 />
      <div className="absolute bg-[#453edc] h-[2px] left-[64px] top-[38px] w-[52px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] leading-[normal] left-[140px] text-[#989ba2] text-[12px] text-center top-[12px] w-[40px]">보류</p>
      <Cnt2 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] leading-[normal] left-[200px] text-[#989ba2] text-[12px] text-center top-[12px] w-[40px]">수납</p>
      <Cnt3 />
    </div>
  );
}

function V() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[14px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="v">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#a67300] text-[9px] text-center top-[3px] w-[26px]">재진</p>
    </div>
  );
}

function I() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[44px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="i">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#70737c] text-[9px] text-center top-[3px] w-[26px]">일반</p>
    </div>
  );
}

function Item1() {
  return (
    <div className="absolute bg-[#fbfaff] h-[58px] left-0 overflow-clip top-[240px] w-[240px]" data-name="item_100236">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[81px] w-[240px]" data-name="Rectangle" />
      <div className="absolute bg-[#6541f2] h-[82px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">100236</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[59px] text-[#171719] text-[14px] top-[9px] whitespace-nowrap">황미진</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[111px] text-[#70737c] text-[11px] top-[12px] whitespace-nowrap">(여/45)</p>
      <div className="absolute bg-[#6541f2] left-[192px] rounded-[3px] size-[6px] top-[13px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[202px] text-[#6541f2] text-[11px] top-[9px] whitespace-nowrap">30분</p>
      <V />
      <I />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[76px] text-[#46474c] text-[11px] top-[34px] w-[160px]">교통사고 후유증</p>
    </div>
  );
}

function V1() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[14px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="v">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#a67300] text-[9px] text-center top-[3px] w-[26px]">재진</p>
    </div>
  );
}

function I1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[44px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="i">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#70737c] text-[9px] text-center top-[3px] w-[26px]">일반</p>
    </div>
  );
}

function Item() {
  return (
    <div className="absolute bg-white h-[61px] left-0 overflow-clip top-[298px] w-[240px]" data-name="item_100234">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[81px] w-[240px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[82px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">100234</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[59px] text-[#171719] text-[14px] top-[7px] whitespace-nowrap">박소윤</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[111px] text-[#70737c] text-[11px] top-[10px] whitespace-nowrap">(여/34)</p>
      <div className="absolute bg-[#ff7b2e] left-[192px] rounded-[3px] size-[6px] top-[13px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[202px] text-[#ff7b2e] text-[11px] top-[9px] whitespace-nowrap">23분</p>
      <V1 />
      <I1 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[79px] text-[#46474c] text-[11px] top-[36px] w-[160px]">혈압약 처방 요청</p>
    </div>
  );
}

function V2() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[14px] overflow-clip rounded-[3px] top-[35px] w-[26px]" data-name="v">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#a67300] text-[9px] text-center top-[3px] w-[26px]">재진</p>
    </div>
  );
}

function I2() {
  return <div className="absolute bg-[#f7f7f8] h-[16px] left-[44px] rounded-[3px] top-[35px] w-[26px]" data-name="i" />;
}

function Item2() {
  return (
    <div className="absolute bg-white h-[58px] left-0 overflow-clip top-[359px] w-[240px]" data-name="item_100237">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[81px] w-[240px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[82px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">100237</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[63px] text-[#171719] text-[14px] top-[7px] whitespace-nowrap">김현빈</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[115px] text-[#70737c] text-[11px] top-[10px] whitespace-nowrap">(남/52)</p>
      <div className="absolute bg-[#ff7b2e] left-[192px] rounded-[3px] size-[6px] top-[13px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[202px] text-[#ff7b2e] text-[11px] top-[9px] whitespace-nowrap">14분</p>
      <V2 />
      <I2 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[57px] text-[#70737c] text-[9px] text-center top-[37px] w-[26px]">일반</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[80px] text-[#46474c] text-[11px] top-[36px] w-[160px]">고지혈증 정기 검진</p>
    </div>
  );
}

function V3() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[16px] left-[14px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="v">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#3385ff] text-[9px] text-center top-[3px] w-[26px]">초진</p>
    </div>
  );
}

function I3() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[44px] overflow-clip rounded-[3px] top-[33px] w-[26px]" data-name="i">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[13px] text-[#70737c] text-[9px] text-center top-[3px] w-[26px]">일반</p>
    </div>
  );
}

function Item3() {
  return (
    <div className="absolute bg-white h-[58px] left-0 overflow-clip top-[417px] w-[240px]" data-name="item_100240">
      <div className="absolute bg-[#ff7b2e] h-[82px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">100240</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[59px] text-[#171719] text-[14px] top-[11px] whitespace-nowrap">이하늘</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[111px] text-[#70737c] text-[11px] top-[14px] whitespace-nowrap">(여/28)</p>
      <div className="absolute bg-[#ff7b2e] left-[192px] rounded-[3px] size-[6px] top-[13px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[202px] text-[#ff7b2e] text-[11px] top-[9px] whitespace-nowrap">10분</p>
      <V3 />
      <I3 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[77px] text-[#46474c] text-[11px] top-[33px] w-[160px]">감기 증상</p>
    </div>
  );
}

function ColWaitlist() {
  return (
    <div className="absolute bg-white h-[1024px] left-[60px] overflow-clip top-[56px] w-[240px]" data-name="col_waitlist">
      <Calendar />
      <TabBar />
      <Item1 />
      <Item />
      <Item2 />
      <Item3 />
      <div className="absolute bg-[#dbdcdf] h-[1024px] left-[239px] top-0 w-px" data-name="Rectangle" />
    </div>
  );
}

function AllergyIco() {
  return (
    <div className="absolute bg-[#feecec] left-[16px] overflow-clip rounded-[9px] size-[18px] top-[13px]" data-name="allergy_ico">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#ff4242] text-[11px] text-center top-[2px] w-[18px]">!</p>
    </div>
  );
}

function AgrB() {
  return (
    <div className="absolute bg-[#edf8ef] h-[18px] left-[202px] overflow-clip rounded-[4px] top-[13px] w-[56px]" data-name="agr_b">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[#4ead0a] text-[10px] text-center top-[3px] w-[56px]">✓ 동의 3</p>
    </div>
  );
}

function AllergyAgree() {
  return (
    <div className="absolute bg-white h-[44px] left-[-1px] overflow-clip top-[246px] w-[268px]" data-name="allergy_agree">
      <AllergyIco />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[40px] text-[#989ba2] text-[11px] top-[6px] whitespace-nowrap">알러지</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[40px] text-[#ff4242] text-[11px] top-[22px] whitespace-nowrap">페니실린, 조영제</p>
      <AgrB />
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[268px]" data-name="Rectangle" />
    </div>
  );
}

function Vitals() {
  return (
    <div className="absolute bg-white h-[100px] left-[-1px] overflow-clip top-[290px] w-[268px]" data-name="vitals">
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">최근 바이탈 (3회)</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[221px] text-[#453edc] text-[11px] top-[10px] whitespace-nowrap">상세 ›</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[16px] text-[#989ba2] text-[10px] top-[32px] whitespace-nowrap">일자</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[80px] text-[#989ba2] text-[10px] top-[32px] whitespace-nowrap">혈압</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[150px] text-[#989ba2] text-[10px] top-[32px] whitespace-nowrap">맥박</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[216px] text-[#989ba2] text-[10px] top-[32px] whitespace-nowrap">체온</p>
      <div className="absolute bg-[#dbdcdf] h-px left-[16px] top-[46px] w-[268px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#292a2d] text-[11px] top-[52px] whitespace-nowrap">03-12</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[80px] text-[#292a2d] text-[11px] top-[52px] whitespace-nowrap">128/82</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[150px] text-[#292a2d] text-[11px] top-[52px] whitespace-nowrap">76</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[216px] text-[#292a2d] text-[11px] top-[52px] whitespace-nowrap">36.5</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#292a2d] text-[11px] top-[66px] whitespace-nowrap">02-28</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[80px] text-[#292a2d] text-[11px] top-[66px] whitespace-nowrap">135/88</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[150px] text-[#292a2d] text-[11px] top-[66px] whitespace-nowrap">72</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[216px] text-[#292a2d] text-[11px] top-[66px] whitespace-nowrap">36.7</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#292a2d] text-[11px] top-[80px] whitespace-nowrap">02-14</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[80px] text-[#ff4242] text-[11px] top-[80px] whitespace-nowrap">142/90</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[150px] text-[#292a2d] text-[11px] top-[80px] whitespace-nowrap">80</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[216px] text-[#292a2d] text-[11px] top-[80px] whitespace-nowrap">36.8</p>
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[99px] w-[268px]" data-name="Rectangle" />
    </div>
  );
}

function PmHead() {
  return (
    <div className="absolute h-[32px] left-0 overflow-clip top-0 w-[300px]" data-name="pm_head">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#292a2d] text-[12px] top-[10px] whitespace-nowrap">환자메모</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[66px] text-[#70737c] text-[10px] top-[11px] whitespace-nowrap">🔒</p>
      <div className="absolute bg-[#989ba2] left-[270px] rounded-[8px] size-[16px] top-[8px]" data-name="Rectangle" />
    </div>
  );
}

function PmNotice() {
  return (
    <div className="absolute bg-[#fffaeb] border border-[#ffe08f] border-solid h-[52px] leading-[normal] left-[12px] overflow-clip rounded-[6px] top-[36px] w-[244px] whitespace-nowrap" data-name="pm_notice">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold left-[9px] text-[#a67300] text-[11px] top-[7px]">📌 공지 1건</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal left-[9px] text-[#292a2d] text-[11px] top-[23px]">건보/자보 동시 진행 환자 — 차트 분리하여 청구</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal left-[9px] text-[#989ba2] text-[10px] top-[37px]">김원장 · 3/12</p>
    </div>
  );
}

function Av() {
  return (
    <div className="absolute bg-[#3385ff] left-[9px] overflow-clip rounded-[10px] size-[20px] top-[9px]" data-name="av">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[10px] text-center text-white top-[3px] w-[20px]">이</p>
    </div>
  );
}

function Cm() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[62px] left-[12px] overflow-clip rounded-[6px] top-[100px] w-[244px]" data-name="cm_이간호사">
      <Av />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[35px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">이간호사</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[28px] leading-[15px] left-[9px] text-[#46474c] text-[11px] top-[35px] w-[252px]">자보 서류 제출 완료 확인</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[9px] text-[#989ba2] text-[10px] top-[45px] whitespace-nowrap">3/14 11:20</p>
    </div>
  );
}

function Av1() {
  return (
    <div className="absolute bg-[#ff7b2e] left-[9px] overflow-clip rounded-[10px] size-[20px] top-[9px]" data-name="av">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[10px] text-center text-white top-[3px] w-[20px]">박</p>
    </div>
  );
}

function Cm1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[80px] left-[12px] overflow-clip rounded-[6px] top-[170px] w-[244px]" data-name="cm_박데스크">
      <Av1 />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[35px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">박데스크</p>
      <div className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[28px] leading-[0] left-[9px] text-[#46474c] text-[11px] top-[35px] w-[252px]">
        <p className="leading-[15px] mb-0">보험사 담당자 연락처:</p>
        <p className="leading-[15px]">010-9999-8888 (홍길동)</p>
      </div>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[9px] text-[#989ba2] text-[10px] top-[63px] whitespace-nowrap">3/15 14:00</p>
    </div>
  );
}

function PmInput() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[36px] left-[12px] overflow-clip rounded-[6px] top-[586px] w-[244px]" data-name="pm_input">
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[9px] text-[#989ba2] text-[12px] top-[10px] whitespace-nowrap">메모 입력...</p>
      <div className="absolute bg-[#453edc] left-[216px] rounded-[3px] size-[16px] top-[9px]" data-name="Rectangle" />
    </div>
  );
}

function PatientMemo() {
  return (
    <div className="absolute bg-white h-[634px] left-[-1px] overflow-clip top-[390px] w-[268px]" data-name="patient_memo">
      <PmHead />
      <PmNotice />
      <Cm />
      <Cm1 />
      <PmInput />
    </div>
  );
}

function PatientHeader() {
  return (
    <div className="absolute bg-white h-[76px] left-[-1px] overflow-clip top-0 w-[268px]" data-name="patient_header">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[75px] w-[300px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[16px] text-[#989ba2] text-[12px] top-[14px] whitespace-nowrap">100236</p>
      <div className="absolute bg-[#989ba2] left-[268px] rounded-[3px] size-[16px] top-[14px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[69px] text-[#171719] text-[20px] top-[10px] whitespace-nowrap">황미진</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[131px] text-[#70737c] text-[13px] top-[16px] whitespace-nowrap">여 · 45세</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#989ba2] text-[11px] top-[45px] whitespace-nowrap">960101-2******</p>
    </div>
  );
}

function BOk() {
  return (
    <div className="absolute bg-[#edf8ef] h-[20px] left-[16px] overflow-clip rounded-[4px] top-[5px] w-[64px]" data-name="b_ok1">
      <div className="absolute bg-[#4ead0a] left-[6px] rounded-[5px] size-[10px] top-[5px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[20px] text-[#4ead0a] text-[10px] top-[4px] whitespace-nowrap">본인확인</p>
    </div>
  );
}

function BOk1() {
  return (
    <div className="absolute bg-[#edf8ef] h-[20px] left-[84px] overflow-clip rounded-[4px] top-[5px] w-[78px]" data-name="b_ok2">
      <div className="absolute bg-[#4ead0a] left-[6px] rounded-[5px] size-[10px] top-[5px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[20px] text-[#4ead0a] text-[10px] top-[4px] whitespace-nowrap">수진자조회</p>
    </div>
  );
}

function BScreening() {
  return (
    <div className="absolute bg-[#fbfaff] border border-[#453edc] border-solid h-[20px] left-[168px] overflow-clip rounded-[4px] top-[5px] w-[84px]" data-name="b_screening">
      <div className="absolute bg-[#453edc] left-[5px] rounded-[5px] size-[10px] top-[4px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[19px] text-[#453edc] text-[10px] top-[3px] whitespace-nowrap">공단검진 2</p>
    </div>
  );
}

function VerifyRow() {
  return (
    <div className="absolute bg-white h-[30px] left-[-1px] overflow-clip top-[76px] w-[268px]" data-name="verify_row">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[29px] w-[300px]" data-name="Rectangle" />
      <BOk />
      <BOk1 />
      <BScreening />
    </div>
  );
}

function Row() {
  return (
    <div className="absolute bg-white h-[34px] left-[-1px] overflow-clip top-[106px] w-[268px]" data-name="row_환자그룹">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[33px] w-[300px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">환자그룹</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[96px] text-[#292a2d] text-[12px] top-[10px] whitespace-nowrap">GC Cell</p>
    </div>
  );
}

function Type() {
  return (
    <div className="absolute bg-[#f1edff] h-[18px] left-[96px] overflow-clip rounded-[3px] top-[10px] w-[54px]" data-name="type_만성질환">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[27px] text-[#6541f2] text-[10px] text-center top-[3px] w-[54px]">만성질환</p>
    </div>
  );
}

function Type1() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[18px] left-[154px] overflow-clip rounded-[3px] top-[10px] w-[43px]" data-name="type_고혈압">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[21.5px] text-[#3385ff] text-[10px] text-center top-[3px] w-[43px]">고혈압</p>
    </div>
  );
}

function Type2() {
  return (
    <div className="absolute bg-[#feecec] h-[18px] left-[201px] overflow-clip rounded-[3px] top-[10px] w-[32px]" data-name="type_당뇨">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[16px] text-[#ff4242] text-[10px] text-center top-[3px] w-[32px]">당뇨</p>
    </div>
  );
}

function RowType() {
  return (
    <div className="absolute bg-white h-[38px] left-[-1px] overflow-clip top-[140px] w-[268px]" data-name="row_type">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[37px] w-[300px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[12px] whitespace-nowrap">환자유형</p>
      <Type />
      <Type1 />
      <Type2 />
    </div>
  );
}

function Row1() {
  return (
    <div className="absolute bg-white h-[34px] left-[-1px] overflow-clip top-[178px] w-[268px]" data-name="row_최근내원">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[33px] w-[300px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">최근내원</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[96px] text-[#292a2d] text-[12px] top-[10px] whitespace-nowrap">2026-03-12</p>
    </div>
  );
}

function Row2() {
  return (
    <div className="absolute bg-white h-[34px] left-[-1px] overflow-clip top-[212px] w-[268px]" data-name="row_예약일">
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[10px] whitespace-nowrap">예약일</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[96px] text-[#ff4242] text-[12px] top-[10px] whitespace-nowrap">2026-04-12</p>
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[33px] w-[268px]" data-name="Rectangle" />
    </div>
  );
}

function ColPatient() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-l border-r border-solid h-[1024px] left-[300px] overflow-clip top-[56px] w-[268px]" data-name="col_patient">
      <AllergyAgree />
      <Vitals />
      <PatientMemo />
      <PatientHeader />
      <VerifyRow />
      <Row />
      <RowType />
      <Row1 />
      <Row2 />
      <div className="absolute bg-[#dbdcdf] h-[1024px] left-[266px] top-0 w-px" data-name="Rectangle" />
    </div>
  );
}

function Sin() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[81px] overflow-clip rounded-[6px] top-[6px] w-[256px]" data-name="sin">
      <div className="absolute bg-[#989ba2] left-[9px] rounded-[7px] size-[14px] top-[8px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[29px] text-[#989ba2] text-[12px] top-[8px] whitespace-nowrap">기록 검색 (상병/처방/의사)</p>
    </div>
  );
}

function HistoryHeader() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-0 w-[344px]" data-name="history_header">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[320px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#171719] text-[14px] top-[13px] whitespace-nowrap">내원이력</p>
      <Sin />
    </div>
  );
}

function StarBtn() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[12px] overflow-clip rounded-[4px] size-[24px] top-[10px]" data-name="star_btn">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[11px] text-[#70737c] text-[13px] text-center top-[3px] w-[24px]">☆</p>
    </div>
  );
}

function RefBtn() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[40px] overflow-clip rounded-[4px] size-[24px] top-[10px]" data-name="ref_btn">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium h-[16px] leading-[normal] left-[11px] text-[#70737c] text-[12px] text-center top-[3px] w-[24px]">⟳</p>
    </div>
  );
}

function Dd() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid font-medium h-[24px] leading-[normal] left-[72px] overflow-clip rounded-[4px] top-[10px] w-[54px] whitespace-nowrap" data-name="dd_초재진">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] left-[5px] text-[#46474c] text-[10px] top-[5px]">초재진</p>
      <p className="absolute font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] left-[41px] text-[#989ba2] text-[9px] top-[5px]">⌄</p>
    </div>
  );
}

function Dd1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid font-medium h-[24px] leading-[normal] left-[130px] overflow-clip rounded-[4px] top-[10px] w-[46px] whitespace-nowrap" data-name="dd_청구">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] left-[5px] text-[#46474c] text-[10px] top-[5px]">청구</p>
      <p className="absolute font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] left-[33px] text-[#989ba2] text-[9px] top-[5px]">⌄</p>
    </div>
  );
}

function Dd2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid font-medium h-[24px] leading-[normal] left-[180px] overflow-clip rounded-[4px] top-[10px] w-[46px] whitespace-nowrap" data-name="dd_보험">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] left-[5px] text-[#46474c] text-[10px] top-[5px]">보험</p>
      <p className="absolute font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] left-[33px] text-[#989ba2] text-[9px] top-[5px]">⌄</p>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[44px] w-[344px]" data-name="filter_bar">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[320px]" data-name="Rectangle" />
      <StarBtn />
      <RefBtn />
      <Dd />
      <Dd1 />
      <Dd2 />
    </div>
  );
}

function TBg() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date8() {
  return (
    <div className="absolute bg-white h-[52px] left-0 overflow-clip top-0 w-[76px]" data-name="date_26-03-12">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <div className="absolute bg-[#453edc] h-[52px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#171719] text-[11px] top-[8px] whitespace-nowrap">26-03-12</p>
      <TBg />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg1() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date7() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[52px] w-[76px]" data-name="date_26-02-28">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">26-02-28</p>
      <TBg1 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg2() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date6() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[104px] w-[76px]" data-name="date_26-02-14">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">26-02-14</p>
      <TBg2 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg3() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date5() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[156px] w-[76px]" data-name="date_26-01-05">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">26-01-05</p>
      <TBg3 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg4() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date4() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[208px] w-[76px]" data-name="date_25-11-01">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">25-11-01</p>
      <TBg4 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg5() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date3() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[260px] w-[76px]" data-name="date_25-09-20">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">25-09-20</p>
      <TBg5 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg6() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date2() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[312px] w-[76px]" data-name="date_25-07-31">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">25-07-31</p>
      <TBg6 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg7() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Date1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[364px] w-[76px]" data-name="date_25-06-20">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">25-06-20</p>
      <TBg7 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function TBg8() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[28px] w-[28px]" data-name="t_bg">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#3385ff] text-[9px] text-center top-[3px] w-[28px]">초진</p>
    </div>
  );
}

function Date() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[416px] w-[76px]" data-name="date_25-04-02">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[76px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#46474c] text-[11px] top-[8px] whitespace-nowrap">25-04-02</p>
      <TBg8 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[42px] text-[#70737c] text-[10px] top-[31px] whitespace-nowrap">일반</p>
    </div>
  );
}

function DateList() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[809px] left-0 overflow-clip top-[88px] w-[76px]" data-name="date_list">
      <div className="absolute bg-[#dbdcdf] h-[789px] left-[75px] top-0 w-px" data-name="Rectangle" />
      <Date8 />
      <Date7 />
      <Date6 />
      <Date5 />
      <Date4 />
      <Date3 />
      <Date2 />
      <Date1 />
      <Date />
    </div>
  );
}

function Sb() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[116px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb1">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#a67300] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Sb1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[148px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb2">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#70737c] text-[9px] text-center top-[3px] w-[28px]">일반</p>
    </div>
  );
}

function Sb2() {
  return (
    <div className="absolute bg-[#feecec] h-[16px] left-[180px] overflow-clip rounded-[3px] top-[8px] w-[36px]" data-name="sb3">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[18px] text-[#ff4242] text-[9px] text-center top-[3px] w-[36px]">임산부</p>
    </div>
  );
}

function ST() {
  return (
    <div className="absolute bg-[#edf8ef] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_검">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#4ead0a] text-[9px] text-center top-[3px] w-[18px]">검</p>
    </div>
  );
}

function ST1() {
  return (
    <div className="absolute bg-[#feecec] h-[16px] left-[30px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_주">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#ff4242] text-[9px] text-center top-[3px] w-[18px]">주</p>
    </div>
  );
}

function ST2() {
  return (
    <div className="absolute bg-[#fff2e8] h-[16px] left-[50px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_중">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#d9731a] text-[9px] text-center top-[3px] w-[18px]">중</p>
    </div>
  );
}

function ST3() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[16px] left-[70px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_메">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#3385ff] text-[9px] text-center top-[3px] w-[18px]">메</p>
    </div>
  );
}

function VisitSummary2() {
  return (
    <div className="absolute bg-[#fbfaff] h-[60px] left-0 overflow-clip top-0 w-[276px]" data-name="visit_summary_2026-03-12">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[59px] w-[244px]" data-name="Rectangle" />
      <div className="absolute bg-[#453edc] h-[60px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#171719] text-[12px] top-[8px] whitespace-nowrap">26-03-12</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[82px] text-[#70737c] text-[11px] top-[9px] whitespace-nowrap">11:47</p>
      <Sb />
      <Sb1 />
      <Sb2 />
      <ST />
      <ST1 />
      <ST2 />
      <ST3 />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[110px] text-[#171719] text-[11px] top-[36px] whitespace-nowrap">₩ 83,000</p>
    </div>
  );
}

function Sx2() {
  return (
    <div className="absolute bg-white h-[52px] left-0 overflow-clip top-[60px] w-[276px]" data-name="sx_2026-03-12">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#989ba2] text-[10px] top-[8px] whitespace-nowrap">증상</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[24px] leading-[15px] left-[10px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[24px] w-[224px] whitespace-nowrap">3일 전부터 목 아프고 기침 심함. 열감 있음. 콧물, 가래 동반.</p>
    </div>
  );
}

function DxHead() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[112px] w-[276px]" data-name="dx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">코드</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[66px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">명칭</p>
    </div>
  );
}

function DxJ2() {
  return (
    <div className="absolute bg-white h-[24px] left-0 overflow-clip top-[134px] w-[276px]" data-name="dx_J528">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[23px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#70737c] text-[10px] top-[6px] whitespace-nowrap">J528</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[66px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[5px] w-[164px] whitespace-nowrap">급성비인두염</p>
    </div>
  );
}

function DxC() {
  return (
    <div className="absolute bg-white h-[24px] left-0 overflow-clip top-[158px] w-[276px]" data-name="dx_c6840">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[23px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#70737c] text-[10px] top-[6px] whitespace-nowrap">c6840</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[66px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[5px] w-[164px] whitespace-nowrap">미성기관지염</p>
    </div>
  );
}

function RxHead() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[182px] w-[276px]" data-name="rx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[6px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">명칭</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[128px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">용</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[142px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">투</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[156px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">일</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[174px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[188px] text-[#989ba2] text-[9px] top-[5px] whitespace-nowrap">수</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[12px] leading-[normal] left-[242px] text-[#989ba2] text-[9px] text-right top-[5px] w-[34px]">단가</p>
    </div>
  );
}

function RxB() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[204px] w-[276px]" data-name="rx_B600">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">가브스메트정 50/850mg 고함량중 의약품</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">2,000</p>
    </div>
  );
}

function RxTrajen() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[226px] w-[276px]" data-name="rx_trajen">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">트라젠타정 5mg</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">162,245</p>
    </div>
  );
}

function Rx2() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[248px] w-[276px]" data-name="rx_985145">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">물리치료</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#ff4242] text-[10px] top-[5px] whitespace-nowrap">비</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">​</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">3,600</p>
    </div>
  );
}

function Rx() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[270px] w-[276px]" data-name="rx_660045">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">푸르설타민주(마늘주사)</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">1,000</p>
    </div>
  );
}

function RxA1() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[292px] w-[276px]" data-name="rx_A0015">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">암브록솔염산염·클렌부테롤 성분 복합 주사제 (호흡기용)</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#ff4242] text-[10px] top-[5px] whitespace-nowrap">90</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">2,500</p>
    </div>
  );
}

function RxTm1() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[314px] w-[276px]" data-name="rx_tm0001">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">텔미사르탄·암로디핀베실산염 복합정 80/5mg</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#ff4242] text-[10px] top-[5px] whitespace-nowrap">100</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">2,500</p>
    </div>
  );
}

function RxPlaceh() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[336px] w-[276px]" data-name="rx_Placeh">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#292a2d] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">클로르페니라민말레산염·슈도에페드린 시럽</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#46474c] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#292a2d] text-[10px] text-right top-[5px] w-[34px]">2,500</p>
    </div>
  );
}

function Note() {
  return (
    <div className="absolute bg-[#fbfaff] h-[22px] left-0 overflow-clip top-[358px] w-[276px]" data-name="note_2026-03-12">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#453edc] text-[10px] top-[5px] whitespace-nowrap">· 가루약으로 나가주세요</p>
    </div>
  );
}

function Sep() {
  return <div className="absolute bg-[#f4f4f5] h-[8px] left-0 top-[380px] w-[276px]" data-name="sep" />;
}

function Sb3() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[116px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb1">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Sb4() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[148px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb2">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[9px] text-center top-[3px] w-[28px]">일반</p>
    </div>
  );
}

function ST4() {
  return (
    <div className="absolute bg-[#edf8ef] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_검">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#989ba2] text-[9px] text-center top-[3px] w-[18px]">검</p>
    </div>
  );
}

function ST5() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[16px] left-[30px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_약">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#aeb0b6] text-[9px] text-center top-[3px] w-[18px]">약</p>
    </div>
  );
}

function VisitSummary1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[60px] left-0 overflow-clip top-[388px] w-[276px]" data-name="visit_summary_2026-02-28">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[59px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#989ba2] text-[12px] top-[8px] whitespace-nowrap">26-02-28</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[82px] text-[#989ba2] text-[11px] top-[9px] whitespace-nowrap">10:20</p>
      <Sb3 />
      <Sb4 />
      <ST4 />
      <ST5 />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[110px] text-[#989ba2] text-[11px] top-[36px] whitespace-nowrap">₩ 18,400</p>
    </div>
  );
}

function Sx1() {
  return (
    <div className="absolute bg-white h-[52px] left-0 overflow-clip top-[448px] w-[276px]" data-name="sx_2026-02-28">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#aeb0b6] text-[10px] top-[8px] whitespace-nowrap">증상</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[24px] leading-[15px] left-[10px] overflow-hidden text-[#989ba2] text-[11px] text-ellipsis top-[24px] w-[224px] whitespace-nowrap">고혈압 정기 검진. 혈압 조절 상태 양호.</p>
    </div>
  );
}

function DxHead1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[500px] w-[276px]" data-name="dx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#aeb0b6] text-[10px] top-[5px] whitespace-nowrap">코드</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[66px] text-[#aeb0b6] text-[10px] top-[5px] whitespace-nowrap">명칭</p>
    </div>
  );
}

function DxI() {
  return (
    <div className="absolute bg-white h-[24px] left-0 overflow-clip top-[522px] w-[276px]" data-name="dx_I10">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[23px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#989ba2] text-[10px] top-[6px] whitespace-nowrap">I10</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[66px] overflow-hidden text-[#989ba2] text-[11px] text-ellipsis top-[5px] w-[164px] whitespace-nowrap">본태성(원발성) 고혈압</p>
    </div>
  );
}

function RxHead1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[546px] w-[276px]" data-name="rx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[6px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">명칭</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[128px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">용</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[142px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">투</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[156px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">일</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[174px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[188px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">수</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[12px] leading-[normal] left-[242px] text-[#aeb0b6] text-[9px] text-right top-[5px] w-[34px]">단가</p>
    </div>
  );
}

function RxTrajen1() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[568px] w-[276px]" data-name="rx_trajen">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#989ba2] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">트라젠타정 5mg</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">30</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#989ba2] text-[10px] text-right top-[5px] w-[34px]">12,000</p>
    </div>
  );
}

function RxB1() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[590px] w-[276px]" data-name="rx_B600">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#989ba2] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">가브스메트정 50/850mg</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">30</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#989ba2] text-[10px] text-right top-[5px] w-[34px]">6,400</p>
    </div>
  );
}

function Sep1() {
  return <div className="absolute bg-[#f4f4f5] h-[8px] left-0 top-[612px] w-[276px]" data-name="sep" />;
}

function Sb5() {
  return (
    <div className="absolute bg-[#fff1d1] h-[16px] left-[116px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb1">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[9px] text-center top-[3px] w-[28px]">재진</p>
    </div>
  );
}

function Sb6() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[16px] left-[148px] overflow-clip rounded-[3px] top-[8px] w-[28px]" data-name="sb2">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[14px] text-[#989ba2] text-[9px] text-center top-[3px] w-[28px]">일반</p>
    </div>
  );
}

function ST6() {
  return (
    <div className="absolute bg-[#edf8ef] h-[16px] left-[10px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_검">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#989ba2] text-[9px] text-center top-[3px] w-[18px]">검</p>
    </div>
  );
}

function ST7() {
  return (
    <div className="absolute bg-[#eaf2fe] h-[16px] left-[30px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_약">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#aeb0b6] text-[9px] text-center top-[3px] w-[18px]">약</p>
    </div>
  );
}

function ST8() {
  return (
    <div className="absolute bg-[#fff2e8] h-[16px] left-[50px] overflow-clip rounded-[3px] top-[34px] w-[18px]" data-name="s_t_방">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[9px] text-[#989ba2] text-[9px] text-center top-[3px] w-[18px]">방</p>
    </div>
  );
}

function VisitSummary() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[60px] left-0 overflow-clip top-[620px] w-[276px]" data-name="visit_summary_2026-02-14">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[59px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#989ba2] text-[12px] top-[8px] whitespace-nowrap">26-02-14</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[82px] text-[#989ba2] text-[11px] top-[9px] whitespace-nowrap">09:15</p>
      <Sb5 />
      <Sb6 />
      <ST6 />
      <ST7 />
      <ST8 />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[110px] text-[#989ba2] text-[11px] top-[36px] whitespace-nowrap">₩ 42,000</p>
    </div>
  );
}

function Sx() {
  return (
    <div className="absolute bg-white h-[52px] left-0 overflow-clip top-[680px] w-[276px]" data-name="sx_2026-02-14">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[51px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#aeb0b6] text-[10px] top-[8px] whitespace-nowrap">증상</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[24px] leading-[15px] left-[10px] overflow-hidden text-[#989ba2] text-[11px] text-ellipsis top-[24px] w-[224px] whitespace-nowrap">당뇨 추적 관찰. HbA1c 검사 실시.</p>
    </div>
  );
}

function DxHead2() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[732px] w-[276px]" data-name="dx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#aeb0b6] text-[10px] top-[5px] whitespace-nowrap">코드</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[66px] text-[#aeb0b6] text-[10px] top-[5px] whitespace-nowrap">명칭</p>
    </div>
  );
}

function DxI1() {
  return (
    <div className="absolute bg-white h-[24px] left-0 overflow-clip top-[754px] w-[276px]" data-name="dx_I10">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[23px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#989ba2] text-[10px] top-[6px] whitespace-nowrap">I10</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[66px] overflow-hidden text-[#989ba2] text-[11px] text-ellipsis top-[5px] w-[164px] whitespace-nowrap">본태성(원발성) 고혈압</p>
    </div>
  );
}

function DxE() {
  return (
    <div className="absolute bg-white h-[24px] left-0 overflow-clip top-[778px] w-[276px]" data-name="dx_E11.9">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[23px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#989ba2] text-[10px] top-[6px] whitespace-nowrap">E11.9</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[66px] overflow-hidden text-[#989ba2] text-[11px] text-ellipsis top-[5px] w-[164px] whitespace-nowrap">제2형 당뇨병</p>
    </div>
  );
}

function RxHead2() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[22px] left-0 overflow-clip top-[802px] w-[276px]" data-name="rx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[6px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">명칭</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[128px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">용</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[142px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">투</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[156px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">일</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[174px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[188px] text-[#aeb0b6] text-[9px] top-[5px] whitespace-nowrap">수</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[12px] leading-[normal] left-[242px] text-[#aeb0b6] text-[9px] text-right top-[5px] w-[34px]">단가</p>
    </div>
  );
}

function RxB2() {
  return (
    <div className="absolute bg-white h-[22px] left-0 overflow-clip top-[824px] w-[276px]" data-name="rx_B600">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[21px] w-[244px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[6px] overflow-hidden text-[#989ba2] text-[10px] text-ellipsis top-[5px] w-[118px] whitespace-nowrap">가브스메트정 50/850mg</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[128px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[142px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">1</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[156px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">30</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[174px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">청</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[188px] text-[#989ba2] text-[10px] top-[5px] whitespace-nowrap">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[242px] text-[#989ba2] text-[10px] text-right top-[5px] w-[34px]">6,400</p>
    </div>
  );
}

function DetailScroll() {
  return (
    <div className="absolute bg-white h-[809px] left-[76px] overflow-clip top-[88px] w-[268px]" data-name="detail_scroll">
      <VisitSummary2 />
      <Sx2 />
      <DxHead />
      <DxJ2 />
      <DxC />
      <RxHead />
      <RxB />
      <RxTrajen />
      <Rx2 />
      <Rx />
      <RxA1 />
      <RxTm1 />
      <RxPlaceh />
      <Note />
      <Sep />
      <VisitSummary1 />
      <Sx1 />
      <DxHead1 />
      <DxI />
      <RxHead1 />
      <RxTrajen1 />
      <RxB1 />
      <Sep1 />
      <VisitSummary />
      <Sx />
      <DxHead2 />
      <DxI1 />
      <DxE />
      <RxHead2 />
      <RxB2 />
    </div>
  );
}

function WidgetHistory() {
  return (
    <div className="absolute bg-white h-[897px] left-[3px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[122px] w-[344px]" data-name="widget_history">
      <HistoryHeader />
      <FilterBar />
      <DateList />
      <DetailScroll />
      <div className="absolute bg-[#dbdcdf] h-[809px] left-[76px] top-[88px] w-px" data-name="dl_divider" />
    </div>
  );
}

function ColHistory() {
  return (
    <div className="absolute border border-[#dbdcdf] border-solid h-[1024px] left-[568px] overflow-clip top-[56px] w-[352px]" data-name="col_history">
      <WidgetHistory />
    </div>
  );
}

function AiIco() {
  return (
    <div className="absolute bg-[#7c5cfa] left-[16px] overflow-clip rounded-[4px] size-[16px] top-[10px]" data-name="ai_ico">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[12px] leading-[normal] left-[8px] text-[10px] text-center text-white top-[2px] w-[16px]">✨</p>
    </div>
  );
}

function AiSummary() {
  return (
    <div className="absolute bg-white h-[115px] left-[572px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[60px] w-[344px]" data-name="ai_summary">
      <AiIco />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[40px] text-[#453edc] text-[14px] top-[12px] whitespace-nowrap">AI 진료이력 요약</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[291px] text-[#453edc] text-[11px] top-[10px] whitespace-nowrap">더보기 ›</p>
      <div className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[48px] leading-[0] left-[16px] text-[#46474c] text-[11px] top-[47px] w-[268px]">
        <p className="leading-[16px] mb-0">당뇨·고혈압 정기 관리 중. 메트포르민·라미프릴 장기복용.</p>
        <p className="leading-[16px] mb-0">최근 HbA1c 7.2% (3개월전).</p>
        <p className="leading-[16px]">9/20일자 알러지 검사 약 3~4주 소요, 결과 확인 필요.</p>
      </div>
    </div>
  );
}

function Symptom() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-r border-solid h-[275px] left-0 overflow-clip top-0 w-[210px]" data-name="symptom">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#171719] text-[14px] top-[12px] whitespace-nowrap">증상</p>
      <div className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[140px] leading-[0] left-[14px] text-[#292a2d] text-[12px] top-[44px] w-[185.333px]">
        <p className="leading-[18px] mb-0">3일 전부터 목 아프고 기침 심함.</p>
        <p className="leading-[18px] mb-0">열감 있음. 콧물, 가래 동반.</p>
        <p className="leading-[18px]">밤에 기침 심해 수면 방해.</p>
      </div>
    </div>
  );
}

function Up() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[20px] left-[92.5px] overflow-clip rounded-[4px] top-[12px] w-[44px]" data-name="up">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[13px] leading-[normal] left-[21px] text-[#70737c] text-[10px] text-center top-[2px] w-[44px]">업로드</p>
    </div>
  );
}

function LbBg() {
  return <div className="absolute bg-[rgba(0,0,0,0.55)] h-[16px] left-[-1px] top-[41px] w-[58px]" data-name="lb_bg" />;
}

function Thumb() {
  return (
    <div className="absolute bg-[#d9d9e5] border border-[#dbdcdf] border-solid left-[14px] overflow-clip rounded-[6px] size-[58px] top-[44px]" data-name="thumb_인후">
      <LbBg />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[9px] text-center text-white top-[43px] w-[58px]">인후</p>
    </div>
  );
}

function LbBg1() {
  return <div className="absolute bg-[rgba(0,0,0,0.55)] h-[16px] left-[-1px] top-[41px] w-[58px]" data-name="lb_bg" />;
}

function Thumb1() {
  return (
    <div className="absolute bg-[#f2e0d9] border border-[#dbdcdf] border-solid left-[78px] overflow-clip rounded-[6px] size-[58px] top-[44px]" data-name="thumb_편도">
      <LbBg1 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[9px] text-center text-white top-[43px] w-[58px]">편도</p>
    </div>
  );
}

function LbBg2() {
  return <div className="absolute bg-[rgba(0,0,0,0.55)] h-[16px] left-[-1px] top-[41px] w-[58px]" data-name="lb_bg" />;
}

function ThumbXRay() {
  return (
    <div className="absolute bg-[#bfd1e5] border border-[#dbdcdf] border-solid left-[14px] overflow-clip rounded-[6px] size-[58px] top-[108px]" data-name="thumb_X-ray">
      <LbBg2 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[9px] text-center text-white top-[43px] w-[58px]">X-ray</p>
    </div>
  );
}

function LbBg3() {
  return <div className="absolute bg-[rgba(0,0,0,0.55)] h-[16px] left-[-1px] top-[41px] w-[58px]" data-name="lb_bg" />;
}

function ThumbCt() {
  return (
    <div className="absolute bg-[#e0ebd9] border border-[#dbdcdf] border-solid left-[78px] overflow-clip rounded-[6px] size-[58px] top-[108px]" data-name="thumb_CT">
      <LbBg3 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[9px] text-center text-white top-[43px] w-[58px]">CT</p>
    </div>
  );
}

function LbBg4() {
  return <div className="absolute bg-[rgba(0,0,0,0.55)] h-[16px] left-[-1px] top-[41px] w-[58px]" data-name="lb_bg" />;
}

function Thumb2() {
  return (
    <div className="absolute bg-[#e5d9e0] border border-[#dbdcdf] border-solid left-[13.67px] overflow-clip rounded-[6px] size-[58px] top-[172px]" data-name="thumb_동의서">
      <LbBg4 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[28px] text-[9px] text-center text-white top-[43px] w-[58px]">동의서</p>
    </div>
  );
}

function Images() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-r border-solid h-[275px] left-[210px] overflow-clip top-0 w-[210px]" data-name="images">
      <div className="absolute bg-[#dbdcdf] h-[200px] left-[212.33px] top-0 w-px" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#171719] text-[14px] top-[12px] whitespace-nowrap">이미지</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[56.67px] text-[#989ba2] text-[11px] top-[13px] whitespace-nowrap">5</p>
      <Up />
      <Thumb />
      <Thumb1 />
      <ThumbXRay />
      <ThumbCt />
      <Thumb2 />
    </div>
  );
}

function Pinned() {
  return (
    <div className="absolute bg-[#fbfaff] h-[18px] left-[76px] overflow-clip rounded-[3px] top-[13px] w-[30px]" data-name="pinned">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[15px] text-[#453edc] text-[9px] text-center top-[3px] w-[30px]">📌 고정</p>
    </div>
  );
}

function ClinicalMemo() {
  return (
    <div className="absolute bg-white h-[275px] left-[420px] overflow-clip top-0 w-[212px]" data-name="clinical_memo">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#171719] text-[14px] top-[12px] whitespace-nowrap">임상메모</p>
      <Pinned />
      <div className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[140px] leading-[0] left-[14px] text-[#46474c] text-[12px] top-[44px] w-[185.333px]">
        <p className="leading-[17px] mb-0">한 달 주기로 고혈압약 복용중.</p>
        <p className="leading-[17px] mb-0">혈액검사(간기능·신기능·혈당) 주기 관찰 필요.</p>
        <p className="leading-[17px]">해외출장으로 약 2주치 처방 원함.</p>
      </div>
    </div>
  );
}

function WidgetSettingsGear() {
  return (
    <div className="absolute left-[602px] overflow-clip rounded-[4px] size-[24px] top-[8px]" data-name="widget_settings_gear">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[18px] leading-[normal] left-[12px] text-[#989ba2] text-[16px] text-center top-[3px] w-[24px]">⚙</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-white h-[275px] left-[4px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[52px] w-[632px]">
      <Symptom />
      <Images />
      <ClinicalMemo />
      <div className="absolute bg-[#dbdcdf] h-[275px] left-[210px] top-0 w-px" data-name="f1_div1" />
      <div className="absolute bg-[#dbdcdf] h-[275px] left-[420px] top-0 w-px" data-name="f1_div2" />
      <WidgetSettingsGear />
    </div>
  );
}

function RxPlaceh1() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[800px] w-[640px]" data-name="rx_Placeh">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">Placeh</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">클로르페니라민말레산염·슈도에페드린 시럽</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">1일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,500</p>
    </div>
  );
}

function R() {
  return (
    <div className="absolute bg-[#453edc] h-[32px] left-[528px] overflow-clip rounded-[6px] top-[14px] w-[96px]" data-name="r_출력전달">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[48px] text-[12px] text-center text-white top-[8px] w-[96px]">출력전달</p>
    </div>
  );
}

function R1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[442px] overflow-clip rounded-[6px] top-[14px] w-[80px]" data-name="r_저장전달">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[39px] text-[#292a2d] text-[12px] text-center top-[7px] w-[80px]">저장전달</p>
    </div>
  );
}

function R2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[372px] overflow-clip rounded-[6px] top-[14px] w-[64px]" data-name="r_저장">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[31px] text-[#292a2d] text-[12px] text-center top-[7px] w-[64px]">저장</p>
    </div>
  );
}

function Q() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] leading-[normal] left-[16px] overflow-clip rounded-[6px] text-[#ff7b2e] text-[11px] top-[14px] w-[108px] whitespace-nowrap" data-name="q_📅 예약처방">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium left-[7px] top-[8px]">📅 예약처방</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold left-[89px] top-[8px]">2</p>
    </div>
  );
}

function Q1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[130px] overflow-clip rounded-[6px] top-[14px] w-[96px]" data-name="q_👤 환자예외">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[7px] text-[#70737c] text-[11px] top-[8px] whitespace-nowrap">👤 환자예외</p>
    </div>
  );
}

function Q2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[232px] overflow-clip rounded-[6px] top-[14px] w-[96px]" data-name="q_🚫 처방금지">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[7px] text-[#70737c] text-[11px] top-[8px] whitespace-nowrap">🚫 처방금지</p>
    </div>
  );
}

function BtnBar() {
  return (
    <div className="absolute bg-white h-[60px] left-[4px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[960px] w-[632px]" data-name="btn_bar">
      <R />
      <R1 />
      <R2 />
      <Q />
      <Q1 />
      <Q2 />
    </div>
  );
}

function Sel() {
  return (
    <div className="absolute bg-white left-[9px] rounded-[6px] top-[8px] w-[55px]" data-name="sel_초재진">
      <div className="content-stretch flex gap-[8px] items-center justify-center leading-[normal] overflow-clip py-[7px] relative rounded-[inherit] size-full whitespace-nowrap">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#a67300] text-[11px]">재진</p>
        <p className="font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#989ba2] text-[10px]">⌄</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Sel1() {
  return (
    <div className="absolute bg-white left-[68px] rounded-[6px] top-[8px] w-[54px]" data-name="sel_주야간">
      <div className="content-stretch flex gap-[8px] items-center justify-center leading-[normal] overflow-clip py-[7px] relative rounded-[inherit] size-full whitespace-nowrap">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#292a2d] text-[11px]">주간</p>
        <p className="font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#989ba2] text-[10px]">⌄</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Sel2() {
  return (
    <div className="absolute bg-white left-[126px] rounded-[6px] top-[8px] w-[55px]" data-name="sel_청구">
      <div className="content-stretch flex gap-[8px] items-center justify-center leading-[normal] overflow-clip py-[7px] relative rounded-[inherit] size-full whitespace-nowrap">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#453edc] text-[11px]">청구</p>
        <p className="font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#989ba2] text-[10px]">⌄</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Sel3() {
  return (
    <div className="absolute bg-white left-[186px] rounded-[6px] top-[8px] w-[69px]" data-name="sel_보험">
      <div className="content-stretch flex gap-[8px] items-center justify-center leading-[normal] overflow-clip py-[7px] relative rounded-[inherit] size-full whitespace-nowrap">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-[#292a2d] text-[11px]">건강보험</p>
        <p className="font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[#989ba2] text-[10px]">⌄</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function TopbarMemo() {
  return (
    <div className="absolute bg-[#f7f7f8] font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[28px] leading-[normal] left-[286px] overflow-clip rounded-[6px] text-[11px] top-[7px] w-[343px]" data-name="topbar_memo">
      <p className="absolute h-[14px] left-[82px] text-[#46474c] top-[7px] w-[164px]">MRI 촬영 원함, 보호자(따님) 동반</p>
      <p className="absolute left-[13px] text-black top-[8px] whitespace-nowrap">접수메모</p>
    </div>
  );
}

function ChartTopbar() {
  return (
    <div className="absolute bg-white h-[44px] left-[4px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[4px] w-[632px]" data-name="chart_topbar">
      <Sel />
      <Sel1 />
      <Sel2 />
      <Sel3 />
      <TopbarMemo />
    </div>
  );
}

function KoicdCat() {
  return (
    <div className="absolute bg-white border border-[#453edc] border-solid h-[22px] left-[442px] overflow-clip rounded-[6px] top-[3px] w-[71px]" data-name="koicd_cat">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[6px] text-[#453edc] text-[11px] top-[3px] whitespace-nowrap">KOICD 분류</p>
    </div>
  );
}

function DxSearch() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[30px] left-[105px] overflow-clip rounded-[6px] top-[7px] w-[520px]" data-name="dx_search">
      <div className="absolute bg-[#989ba2] left-[9px] rounded-[7px] size-[14px] top-[7px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[29px] text-[#989ba2] text-[12px] top-[6px] whitespace-nowrap">통합 검색 (코드/명칭)</p>
      <KoicdCat />
    </div>
  );
}

function DxTitle() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-0 w-[632px]" data-name="dx_title">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#171719] text-[14px] top-[14px] whitespace-nowrap">진단 및 처방</p>
      <DxSearch />
    </div>
  );
}

function DxHead3() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[32px] left-0 overflow-clip top-[44px] w-[632px]" data-name="dx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[32px] text-[#989ba2] text-[11px] top-[9px] w-[70px]">코드</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[110px] text-[#989ba2] text-[11px] top-[9px] w-[210px]">상병명</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[354px] text-[#989ba2] text-[11px] text-center top-[9px] w-[40px]">의증</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[393px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">좌</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[427px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">우</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[473px] text-[#989ba2] text-[11px] text-center top-[9px] w-[50px]">불완전</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[532px] text-[#989ba2] text-[11px] text-center top-[9px] w-[56px]">특정기호</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[594px] text-[#989ba2] text-[11px] text-center top-[9px] w-[60px]">진료과</p>
    </div>
  );
}

function MainB() {
  return (
    <div className="absolute bg-[#ff7b2e] h-[16px] left-[32px] overflow-clip rounded-[3px] top-[10px] w-[24px]" data-name="main_b">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[11px] leading-[normal] left-[12px] text-[10px] text-center text-white top-[3px] w-[24px]">주</p>
    </div>
  );
}

function Chk() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[348px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk1() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[388px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk2() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[422px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk3() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[466px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function DxJ() {
  return (
    <div className="absolute bg-[#fffaed] h-[36px] left-0 overflow-clip top-[76px] w-[632px]" data-name="dx_J00">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[35px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[12px] top-[10px] whitespace-nowrap">⋮⋮</p>
      <div className="absolute bg-[#ff7b2e] h-[36px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <MainB />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[60px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">J00</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[110px] text-[#292a2d] text-[12px] top-[11px] w-[220px]">급성비인두염 [감기]</p>
      <Chk />
      <Chk1 />
      <Chk2 />
      <Chk3 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[532px] text-[#989ba2] text-[11px] text-center top-[12px] w-[56px]">-</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[594px] text-[#70737c] text-[11px] text-center top-[12px] w-[60px]">내과</p>
      <p className="absolute font-['Noto_Sans_KR:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] left-[616px] text-[#989ba2] text-[12px] top-[11px] whitespace-nowrap">✕</p>
    </div>
  );
}

function Chk4() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[348px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk5() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[388px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk6() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[422px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk7() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[466px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function DxJ1() {
  return (
    <div className="absolute bg-white h-[36px] left-0 overflow-clip top-[112px] w-[632px]" data-name="dx_J209">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[35px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[12px] top-[10px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">J209</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[110px] text-[#292a2d] text-[12px] top-[11px] w-[220px]">상세불명의 급성 기관지염</p>
      <Chk4 />
      <Chk5 />
      <Chk6 />
      <Chk7 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[532px] text-[#989ba2] text-[11px] text-center top-[12px] w-[56px]">-</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[594px] text-[#70737c] text-[11px] text-center top-[12px] w-[60px]">내과</p>
      <p className="absolute font-['Noto_Sans_KR:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] left-[616px] text-[#989ba2] text-[12px] top-[11px] whitespace-nowrap">✕</p>
    </div>
  );
}

function Chk8() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[348px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk9() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[388px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk10() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[422px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk11() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[466px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Spec() {
  return (
    <div className="absolute bg-[#feecec] h-[18px] left-[514px] overflow-clip rounded-[3px] top-[9px] w-[36px]" data-name="spec">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[18px] text-[#ff4242] text-[10px] text-center top-[3px] w-[36px]">V193</p>
    </div>
  );
}

function DxI2() {
  return (
    <div className="absolute bg-white h-[36px] left-0 overflow-clip top-[148px] w-[632px]" data-name="dx_I10">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[35px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[12px] top-[10px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">I10</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[110px] text-[#292a2d] text-[12px] top-[11px] w-[220px]">본태성(원발성) 고혈압</p>
      <Chk8 />
      <Chk9 />
      <Chk10 />
      <Chk11 />
      <Spec />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[594px] text-[#70737c] text-[11px] text-center top-[12px] w-[60px]">내과</p>
      <p className="absolute font-['Noto_Sans_KR:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] left-[616px] text-[#989ba2] text-[12px] top-[11px] whitespace-nowrap">✕</p>
    </div>
  );
}

function Chk12() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[348px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk13() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[388px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk14() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[422px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function Chk15() {
  return <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[466px] rounded-[3px] size-[14px] top-[11px]" data-name="chk" />;
}

function DxE1() {
  return (
    <div className="absolute bg-white h-[36px] left-0 overflow-clip top-[184px] w-[632px]" data-name="dx_E11.9">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[35px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[12px] top-[10px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#292a2d] text-[11px] top-[11px] whitespace-nowrap">E11.9</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[110px] text-[#292a2d] text-[12px] top-[11px] w-[220px]">제2형 당뇨병, 합병증을 동반하지 않음</p>
      <Chk12 />
      <Chk13 />
      <Chk14 />
      <Chk15 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[532px] text-[#989ba2] text-[11px] text-center top-[12px] w-[56px]">-</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[12px] leading-[normal] left-[594px] text-[#70737c] text-[11px] text-center top-[12px] w-[60px]">내과</p>
      <p className="absolute font-['Noto_Sans_KR:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[normal] left-[616px] text-[#989ba2] text-[12px] top-[11px] whitespace-nowrap">✕</p>
    </div>
  );
}

function RxPlaceh2() {
  return (
    <div className="absolute bg-[#f1edff] border-[#dbdcdf] border-b border-r border-solid h-[32px] left-0 overflow-clip top-[220px] w-[632px]" data-name="rx_Placeh">
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[109px] text-[#989ba2] text-[11px] top-[9px] whitespace-nowrap">진단 검색</p>
    </div>
  );
}

function SplitterHandle() {
  return <div className="absolute bg-[#989ba2] h-[4px] left-[296px] rounded-[2px] top-[3px] w-[40px]" data-name="splitter_handle" />;
}

function SplitterDxRx() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[10px] left-0 overflow-clip top-[215px] w-[632px]" data-name="splitter_dx_rx">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-0 w-[632px]" data-name="Rectangle" />
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[9px] w-[632px]" data-name="Rectangle" />
      <SplitterHandle />
    </div>
  );
}

function RxHead3() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[32px] left-0 overflow-clip top-[225px] w-[632px]" data-name="rx_head">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[32px] text-[#989ba2] text-[11px] top-[9px] w-[60px]">코드</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[96px] text-[#989ba2] text-[11px] top-[9px] w-[200px]">처방명</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[322px] text-[#989ba2] text-[11px] text-center top-[9px] w-[36px]">용량</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[357px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">일투</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[391px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">일수</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[435px] text-[#989ba2] text-[11px] text-center top-[9px] w-[50px]">용법</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[479px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">예외</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">청구</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#989ba2] text-[11px] text-center top-[9px] w-[30px]">수납</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#989ba2] text-[11px] text-right top-[9px] w-[50px]">단가</p>
    </div>
  );
}

function RxTrajen2() {
  return (
    <div className="absolute bg-[#fff8ed] h-[32px] left-0 overflow-clip top-[257px] w-[632px]" data-name="rx_trajen">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[32px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">trajen</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[150px] whitespace-nowrap">트라젠타정 5mg</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">20</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">식후</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">​</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">162,245</p>
    </div>
  );
}

function RxB600R() {
  return (
    <div className="absolute bg-[#fff8ed] h-[32px] left-0 overflow-clip top-[289px] w-[632px]" data-name="rx_B600-r">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[32px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">B600-r</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[150px] whitespace-nowrap">가브스메트정 50/850mg</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">30</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">식후</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">​</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">6,400</p>
    </div>
  );
}

function RxRo() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[321px] w-[632px]" data-name="rx_ro022">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">ro022</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">접종</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">가려</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">원외</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,000</p>
    </div>
  );
}

function Rx3() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[353px] w-[632px]" data-name="rx_985145">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">985145</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">물리치료</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">#20</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">10</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#ff4242] text-[10px] text-center top-[9px] w-[30px]">비</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">​</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">3,600</p>
    </div>
  );
}

function Rx1() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[385px] w-[632px]" data-name="rx_660045">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">660045</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">푸르설타민주 (마늘주사)</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">1일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">1,000</p>
    </div>
  );
}

function RxA() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[417px] w-[632px]" data-name="rx_A0015">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">A0015</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">암브록솔염산염·클렌부테롤 복합제</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">1일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#ff4242] text-[10px] text-center top-[9px] w-[30px]">90</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,500</p>
    </div>
  );
}

function RxTm() {
  return (
    <div className="absolute bg-white h-[56px] left-0 overflow-clip top-[449px] w-[632px]" data-name="rx_tm0001">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">tm0001</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">텔미사르탄·암로디핀베실산염 복합정</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">1일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#ff4242] text-[10px] text-center top-[9px] w-[30px]">100</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,500</p>
    </div>
  );
}

function RxB3() {
  return (
    <div className="absolute bg-[#fff7f0] h-[32px] left-0 overflow-clip top-[505px] w-[632px]" data-name="rx_B600">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[32px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">B600</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">가브스메트정 50/850mg</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">30</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">식후</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">​</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,500</p>
    </div>
  );
}

function R3() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[18px] left-[420px] overflow-clip rounded-[3px] top-[5px] w-[50px]" data-name="r_증량">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#46474c] text-[10px] text-center top-[2px] w-[50px]">증량</p>
    </div>
  );
}

function R4() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[18px] left-[474px] overflow-clip rounded-[3px] top-[5px] w-[50px]" data-name="r_금기아님">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#46474c] text-[10px] text-center top-[2px] w-[50px]">금기아님</p>
    </div>
  );
}

function R5() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[18px] left-[528px] overflow-clip rounded-[3px] top-[5px] w-[50px]" data-name="r_기타">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[24px] text-[#46474c] text-[10px] text-center top-[2px] w-[50px]">기타</p>
    </div>
  );
}

function DurInline() {
  return (
    <div className="absolute bg-[#fff7f0] h-[28px] left-0 overflow-clip top-[537px] w-[632px]" data-name="dur_inline">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[27px] w-[640px]" data-name="Rectangle" />
      <div className="absolute bg-[#ff7b2e] h-[28px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#ff7b2e] text-[11px] top-[7px] whitespace-nowrap">⚠</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#292a2d] text-[11px] top-[7px] whitespace-nowrap">DUR 병용금기 — 트라젠타정과 병용</p>
      <R3 />
      <R4 />
      <R5 />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[560px] text-[#ff7b2e] text-[11px] top-[7px] whitespace-nowrap">사유 입력 ›</p>
    </div>
  );
}

function RxPlaceh3() {
  return (
    <div className="absolute bg-[#f1edff] border-[#dbdcdf] border-b border-r border-solid h-[32px] left-0 overflow-clip top-[565px] w-[632px]" data-name="rx_Placeh">
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[98px] text-[#989ba2] text-[11px] top-[9px] whitespace-nowrap">처방 검색</p>
    </div>
  );
}

function RxCro() {
  return (
    <div className="absolute bg-white h-[32px] left-0 overflow-clip top-[597px] w-[632px]" data-name="rx_cro000">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[31px] w-[640px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[11px] top-[8px] whitespace-nowrap">⋮⋮</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[32px] text-[#70737c] text-[10px] top-[10px] whitespace-nowrap">cro000</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] overflow-hidden text-[#292a2d] text-[11px] text-ellipsis top-[9px] w-[200px] whitespace-nowrap">클로르페니라민말레산염·슈도에페드린 복합시럽</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[322px] text-[#46474c] text-[11px] text-center top-[9px] w-[36px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[357px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[391px] text-[#46474c] text-[11px] text-center top-[9px] w-[30px]">1</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[435px] text-[#70737c] text-[10px] text-center top-[9px] w-[50px]">1일</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[479px] text-[#70737c] text-[10px] text-center top-[9px] w-[30px]">18</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[513px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">청</p>
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[545px] text-[#46474c] text-[10px] text-center top-[9px] w-[30px]">보</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[620px] text-[#292a2d] text-[11px] text-right top-[9px] w-[50px]">2,500</p>
    </div>
  );
}

function Prescreen() {
  return (
    <div className="absolute bg-[#edf8ef] border border-[#4ead0a] border-solid h-[30px] left-[448px] overflow-clip rounded-[6px] top-[6px] w-[90px]" data-name="prescreen">
      <div className="absolute bg-[#4ead0a] left-[9px] rounded-[4px] size-[8px] top-[10px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[21px] text-[#4ead0a] text-[10px] top-[8px] whitespace-nowrap">사전심사 OK</p>
    </div>
  );
}

function Dur() {
  return (
    <div className="absolute bg-[#fff2e8] border border-[#ff7b2e] border-solid font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[30px] leading-[normal] left-[546px] overflow-clip rounded-[6px] text-[#ff7b2e] top-[6px] w-[74px] whitespace-nowrap" data-name="dur">
      <p className="absolute left-[9px] text-[12px] top-[6px]">⚠</p>
      <p className="absolute left-[23px] text-[10px] top-[8px]">DUR 2건</p>
    </div>
  );
}

function RxSummary() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[40px] left-0 overflow-clip top-[629px] w-[632px]" data-name="rx_summary">
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[16px] text-[#989ba2] text-[11px] top-[14px] whitespace-nowrap">본인부담금</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[90px] text-[#171719] text-[13px] top-[12px] whitespace-nowrap">24,000원</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[200px] text-[#989ba2] text-[11px] top-[14px] whitespace-nowrap">총 진료비</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[260px] text-[#171719] text-[13px] top-[12px] whitespace-nowrap">83,000원</p>
      <Prescreen />
      <Dur />
    </div>
  );
}

function WidgetDxRx() {
  return (
    <div className="absolute bg-white h-[625px] left-[4px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] top-[331px] w-[632px]" data-name="widget_dx_rx">
      <DxTitle />
      <DxHead3 />
      <DxJ />
      <DxJ1 />
      <DxI2 />
      <DxE1 />
      <RxPlaceh2 />
      <SplitterDxRx />
      <RxHead3 />
      <RxTrajen2 />
      <RxB600R />
      <RxRo />
      <Rx3 />
      <Rx1 />
      <RxA />
      <RxTm />
      <RxB3 />
      <DurInline />
      <RxPlaceh3 />
      <RxCro />
      <RxSummary />
    </div>
  );
}

function ColDxRx() {
  return (
    <div className="absolute h-[1024px] left-[920px] overflow-clip top-[58px] w-[640px]" data-name="col_dx_rx">
      <Frame />
      <RxPlaceh1 />
      <BtnBar />
      <ChartTopbar />
      <WidgetDxRx />
    </div>
  );
}

function BundleAdd() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[320px] overflow-clip rounded-[4px] size-[24px] top-[10px]" data-name="bundle_add">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[18px] leading-[normal] left-[11px] text-[#70737c] text-[16px] text-center top-[2px] w-[24px]">+</p>
    </div>
  );
}

function BundleSet() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid left-[290px] overflow-clip rounded-[4px] size-[24px] top-[10px]" data-name="bundle_set">
      <div className="absolute bg-[#989ba2] left-[5px] rounded-[3px] size-[12px] top-[5px]" data-name="Rectangle" />
    </div>
  );
}

function Sin1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[83px] overflow-clip rounded-[6px] top-[6px] w-[195px]" data-name="sin">
      <div className="absolute bg-[#989ba2] left-[9px] rounded-[7px] size-[14px] top-[8px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[29px] text-[#989ba2] text-[12px] top-[8px] whitespace-nowrap">세트 검색</p>
    </div>
  );
}

function BundleHeader() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-0 w-[352px]" data-name="bundle_header">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#171719] text-[15px] top-[13px] whitespace-nowrap">세트처방</p>
      <BundleAdd />
      <BundleSet />
      <Sin1 />
    </div>
  );
}

function Cat() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[12px] overflow-clip rounded-[14px] top-[12px] w-[85px]" data-name="cat_★ 즐겨찾기">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[41.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[85px]">★ 즐겨찾기 3</p>
    </div>
  );
}

function Cat1() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[103px] overflow-clip rounded-[14px] top-[12px] w-[58px]" data-name="cat_일반">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[28px] text-[#46474c] text-[11px] text-center top-[6px] w-[58px]">일반 14</p>
    </div>
  );
}

function Cat2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[167px] overflow-clip rounded-[14px] top-[12px] w-[51px]" data-name="cat_약품">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">약품 6</p>
    </div>
  );
}

function Cat3() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[224px] overflow-clip rounded-[14px] top-[12px] w-[51px]" data-name="cat_주사">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">주사 4</p>
    </div>
  );
}

function Cat4() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[281px] overflow-clip rounded-[14px] top-[12px] w-[62px]" data-name="cat_방사선">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30px] text-[#46474c] text-[11px] text-center top-[6px] w-[62px]">방사선 4</p>
    </div>
  );
}

function Cat5() {
  return (
    <div className="absolute bg-[#453edc] border border-[#453edc] border-solid h-[28px] left-[12px] overflow-clip rounded-[14px] top-[46px] w-[78px]" data-name="cat_기능의학">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[38px] text-[11px] text-center text-white top-[6px] w-[78px]">기능의학 12</p>
    </div>
  );
}

function Cat6() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[96px] overflow-clip rounded-[14px] top-[46px] w-[51px]" data-name="cat_식대">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">식대 6</p>
    </div>
  );
}

function Cat7() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[153px] overflow-clip rounded-[14px] top-[46px] w-[72px]" data-name="cat_치료재료">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[35px] text-[#46474c] text-[11px] text-center top-[6px] w-[72px]">치료재료 5</p>
    </div>
  );
}

function Cat8() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[231px] overflow-clip rounded-[14px] top-[46px] w-[51px]" data-name="cat_검체">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">검체 8</p>
    </div>
  );
}

function Cat9() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[12px] overflow-clip rounded-[14px] top-[80px] w-[72px]" data-name="cat_처방세트">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[35px] text-[#46474c] text-[11px] text-center top-[6px] w-[72px]">처방세트 5</p>
    </div>
  );
}

function Cat10() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[90px] overflow-clip rounded-[14px] top-[80px] w-[51px]" data-name="cat_+ 분류">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#989ba2] text-[11px] text-center top-[6px] w-[51px]">+ 분류</p>
    </div>
  );
}

function CatWrapper() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[120px] left-0 overflow-clip top-[44px] w-[352px]" data-name="cat_wrapper">
      <Cat />
      <Cat1 />
      <Cat2 />
      <Cat3 />
      <Cat4 />
      <Cat5 />
      <Cat6 />
      <Cat7 />
      <Cat8 />
      <Cat9 />
      <Cat10 />
    </div>
  );
}

function CurCat() {
  return (
    <div className="absolute bg-[#fbfaff] h-[28px] left-0 overflow-clip top-0 w-[352px]" data-name="cur_cat">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[27px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#453edc] text-[12px] top-[7px] whitespace-nowrap">기능의학</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[70px] text-[#989ba2] text-[10px] top-[9px] whitespace-nowrap">12개 묶음</p>
      <p className="absolute font-['Noto_Sans_KR:Medium','Noto_Sans:Medium',sans-serif] font-medium leading-[normal] left-[296px] text-[#70737c] text-[10px] top-[9px] whitespace-nowrap">이름순 ⌄</p>
    </div>
  );
}

function Plus() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[28px] w-[352px]" data-name="b_BK001">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#ff7b2e] text-[13px] top-[15px] whitespace-nowrap">★</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">기본검진 (15종)</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus />
    </div>
  );
}

function Plus1() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk1() {
  return (
    <div className="absolute bg-[#fbfaff] h-[44px] left-0 overflow-clip top-[72px] w-[352px]" data-name="b_BK002">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <div className="absolute bg-[#453edc] h-[44px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[13px] top-[15px] whitespace-nowrap">☆</p>
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">뇌기능-5만원</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus1 />
    </div>
  );
}

function Preview() {
  return (
    <div className="absolute bg-[#fbfaff] h-[110px] left-0 overflow-clip top-[116px] w-[352px]" data-name="preview">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[109px] w-[360px]" data-name="Rectangle" />
      <div className="absolute bg-[#453edc] h-[110px] left-0 top-0 w-[3px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#46474c] text-[10px] top-[28px] whitespace-nowrap">· 뇌 CT 검사</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[344px] text-[#70737c] text-[10px] text-right top-[28px] w-[60px]">23,000원</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#46474c] text-[10px] top-[44px] whitespace-nowrap">· 뇌파검사(EEG)</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[344px] text-[#70737c] text-[10px] text-right top-[44px] w-[60px]">15,000원</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#46474c] text-[10px] top-[60px] whitespace-nowrap">· 신경학적 검사</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[344px] text-[#70737c] text-[10px] text-right top-[60px] w-[60px]">8,000원</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[16px] text-[#46474c] text-[10px] top-[76px] whitespace-nowrap">· 혈액검사 5종</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[344px] text-[#70737c] text-[10px] text-right top-[76px] w-[60px]">4,000원</p>
      <div className="absolute bg-[#dbdcdf] h-px left-[16px] top-[88px] w-[328px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[16px] text-[#989ba2] text-[10px] top-[94px] whitespace-nowrap">합계</p>
      <p className="-translate-x-full absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[344px] text-[#171719] text-[11px] text-right top-[93px] w-[80px]">50,000원</p>
    </div>
  );
}

function Plus2() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk2() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[226px] w-[352px]" data-name="b_BK003">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[13px] top-[15px] whitespace-nowrap">☆</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">뇌신경계 정밀</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus2 />
    </div>
  );
}

function Plus3() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk3() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[270px] w-[352px]" data-name="b_BK004">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#ff7b2e] text-[13px] top-[15px] whitespace-nowrap">★</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">IVFORM3-1 영양주사</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus3 />
    </div>
  );
}

function Plus4() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk4() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[314px] w-[352px]" data-name="b_BK005">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#ff7b2e] text-[13px] top-[15px] whitespace-nowrap">★</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">토혈기 감기 1세트</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus4 />
    </div>
  );
}

function Plus5() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk5() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[358px] w-[352px]" data-name="b_BK006">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[13px] top-[15px] whitespace-nowrap">☆</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">급성 기관지염 1세트</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus5 />
    </div>
  );
}

function Plus6() {
  return (
    <div className="absolute bg-[#453edc] left-[330px] overflow-clip rounded-[11px] size-[22px] top-[11px]" data-name="plus">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] leading-[normal] left-[11px] text-[14px] text-center text-white top-[2px] w-[22px]">+</p>
    </div>
  );
}

function BBk6() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-[402px] w-[352px]" data-name="b_BK007">
      <div className="absolute bg-[#dbdcdf] h-px left-0 top-[43px] w-[360px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[14px] text-[#989ba2] text-[13px] top-[15px] whitespace-nowrap">☆</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] leading-[normal] left-[36px] overflow-hidden text-[#292a2d] text-[12px] text-ellipsis top-[8px] w-[220px] whitespace-nowrap">만성질환 관리 A</p>
      <p className="absolute font-['Noto_Sans_KR:Bold','Noto_Sans:Bold',sans-serif] font-bold leading-[normal] left-[310px] text-[#989ba2] text-[12px] top-[15px] whitespace-nowrap">⌄</p>
      <Plus6 />
    </div>
  );
}

function BundleList() {
  return (
    <div className="absolute bg-white h-[539px] left-0 overflow-clip top-[164px] w-[352px]" data-name="bundle_list">
      <CurCat />
      <BBk />
      <BBk1 />
      <Preview />
      <BBk2 />
      <BBk3 />
      <BBk4 />
      <BBk5 />
      <BBk6 />
    </div>
  );
}

function WidgetSetPrescription() {
  return (
    <div className="absolute bg-white h-[703px] left-[3px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] top-[3px] w-[352px]" data-name="widget_set_prescription">
      <BundleHeader />
      <CatWrapper />
      <BundleList />
    </div>
  );
}

function ColBundle() {
  return (
    <div className="absolute border border-[#dbdcdf] border-solid h-[711px] left-[1560px] overflow-clip top-[56px] w-[360px]" data-name="col_bundle">
      <WidgetSetPrescription />
    </div>
  );
}

function Sin2() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[32px] left-[83px] overflow-clip rounded-[6px] top-[6px] w-[195px]" data-name="sin">
      <div className="absolute bg-[#989ba2] left-[9px] rounded-[7px] size-[14px] top-[8px]" data-name="Rectangle" />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[29px] text-[#989ba2] text-[12px] top-[8px] whitespace-nowrap">빠른 메뉴 검색</p>
    </div>
  );
}

function BundleHeader1() {
  return (
    <div className="absolute bg-white h-[44px] left-0 overflow-clip top-0 w-[352px]" data-name="bundle_header">
      <p className="absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[normal] left-[16px] text-[#171719] text-[15px] top-[13px] whitespace-nowrap">빠른 메뉴</p>
      <Sin2 />
    </div>
  );
}

function Cat11() {
  return (
    <div className="absolute bg-white border border-[#dbdcdf] border-solid h-[28px] left-[71px] overflow-clip rounded-[14px] top-[12px] w-[85px]" data-name="cat_★ 즐겨찾기">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[41.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[85px]">★ 즐겨찾기 3</p>
    </div>
  );
}

function Cat12() {
  return (
    <div className="absolute bg-[#eaf2fe] border border-[#dbdcdf] border-solid h-[28px] left-[162px] overflow-clip rounded-[14px] top-[12px] w-[58px]" data-name="cat_일반">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[28px] text-[#46474c] text-[11px] text-center top-[6px] w-[58px]">CRM 14</p>
    </div>
  );
}

function Cat13() {
  return (
    <div className="absolute bg-[#feecec] border border-[#dbdcdf] border-solid h-[28px] left-[226px] overflow-clip rounded-[14px] top-[12px] w-[51px]" data-name="cat_약품">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[24.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">예약 6</p>
    </div>
  );
}

function Cat14() {
  return (
    <div className="absolute bg-[#f9edff] border border-[#dbdcdf] border-solid h-[28px] left-[283px] overflow-clip rounded-[14px] top-[12px] w-[63px]" data-name="cat_약품">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[14px] leading-[normal] left-[30.5px] text-[#46474c] text-[11px] text-center top-[6px] w-[51px]">일수변경 6</p>
    </div>
  );
}

function Cat15() {
  return (
    <div className="absolute bg-[#453edc] border border-[#453edc] border-solid h-[28px] left-[16px] overflow-clip rounded-[14px] top-[12px] w-[49px]" data-name="cat_기능의학">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[14px] leading-[normal] left-[23.5px] text-[11px] text-center text-white top-[6px] w-[49px]">전체 35</p>
    </div>
  );
}

function CatWrapper1() {
  return (
    <div className="absolute bg-[#f7f7f8] h-[52px] left-0 overflow-clip top-[44px] w-[352px]" data-name="cat_wrapper">
      <Cat11 />
      <Cat12 />
      <Cat13 />
      <Cat14 />
      <Cat15 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-[#feecec] content-stretch flex items-center justify-center left-[4px] px-[10px] py-[8px] rounded-[4px] top-[97px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">1일 후 예약</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#feecec] content-stretch flex items-center justify-center left-[87px] px-[10px] py-[8px] rounded-[4px] top-[97px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">3일 후 예약</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#feecec] content-stretch flex items-center justify-center left-[170px] px-[10px] py-[8px] rounded-[4px] top-[97px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">1주 후 예약</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-[#feecec] content-stretch flex items-center justify-center left-[253px] px-[10px] py-[8px] rounded-[4px] top-[97px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">2주 후 예약</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-[#feecec] content-stretch flex items-center justify-center left-[4px] px-[10px] py-[8px] rounded-[4px] top-[134px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">3주 후 예약</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-[#f9edff] content-stretch flex items-center justify-center left-[87px] px-[10px] py-[8px] rounded-[4px] top-[134px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">일수변경 1일</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute bg-[#f9edff] content-stretch flex items-center justify-center left-[180px] px-[10px] py-[8px] rounded-[4px] top-[134px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">일수변경 3일</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute bg-[#f9edff] content-stretch flex items-center justify-center left-[4px] px-[10px] py-[8px] rounded-[4px] top-[171px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">일수변경 4일</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-[#eaf2fe] content-stretch flex items-center justify-center left-[97px] px-[10px] py-[8px] rounded-[4px] top-[171px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">내시경 검사결과 문자</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute bg-[#eaf2fe] content-stretch flex items-center justify-center left-[227px] px-[10px] py-[8px] rounded-[4px] top-[171px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">혈액검사결과 문자</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute bg-[#eaf2fe] content-stretch flex items-center justify-center left-[4px] px-[10px] py-[8px] rounded-[4px] top-[208px]">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#292a2d] text-[12px] text-ellipsis whitespace-nowrap">공복채혈 문자</p>
    </div>
  );
}

function WidgetQuickMenu() {
  return (
    <div className="absolute bg-white h-[308px] left-[3px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] top-[3px] w-[352px]" data-name="widget_quick_menu">
      <BundleHeader1 />
      <CatWrapper1 />
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame4 />
      <Frame5 />
      <Frame6 />
      <Frame7 />
      <Frame8 />
      <Frame9 />
      <Frame10 />
      <Frame11 />
    </div>
  );
}

function ColBundle1() {
  return (
    <div className="absolute border border-[#dbdcdf] border-solid h-[316px] left-[1560px] overflow-clip top-[766px] w-[360px]" data-name="col_bundle">
      <WidgetQuickMenu />
    </div>
  );
}

export default function V2Wireframe() {
  return (
    <div className="bg-[#f4f4f5] relative size-full" data-name="진료실_v2_wireframe">
      <Lnb />
      <TopBar />
      <ColWaitlist />
      <ColPatient />
      <ColHistory />
      <AiSummary />
      <ColDxRx />
      <ColBundle />
      <ColBundle1 />
    </div>
  );
}