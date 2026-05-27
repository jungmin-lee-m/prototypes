import svgPaths from "./svg-rqnrnq1sru";

function Icon() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_35_6961)" id="Icon">
          <path d={svgPaths.p266900} id="Vector" stroke="var(--stroke-0, #453EDC)" strokeWidth="1.1375" />
          <path d={svgPaths.p5a4a000} id="Vector_2" stroke="var(--stroke-0, #453EDC)" strokeWidth="1.1375" />
          <path d={svgPaths.p9c8c700} id="Vector_3" stroke="var(--stroke-0, #453EDC)" strokeWidth="1.1375" />
          <path d={svgPaths.p1c952180} id="Vector_4" stroke="var(--stroke-0, #453EDC)" strokeWidth="1.1375" />
        </g>
        <defs>
          <clipPath id="clip0_35_6961">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[99.323px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">내원이력 펼쳐보기</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-center pb-[2px] pt-px px-[5px] relative rounded-[4px] shrink-0" data-name="Text">
      <div aria-hidden="true" className="absolute border border-[#dbdcdf] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#989ba2] text-[12px] text-center whitespace-nowrap">100236</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex h-[30px] items-start relative shrink-0" data-name="Text">
      <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#171719] text-[16px] whitespace-nowrap">황미진</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex h-[19.5px] items-start relative shrink-0 w-[49.26px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] relative shrink-0 text-[#70737c] text-[13px] whitespace-nowrap">여 / 45세</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Text1 />
        <Text2 />
        <Text3 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[19.5px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center relative size-full">
        <Icon />
        <Text />
        <Frame4 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[10.67px] size-[11px] top-[8.5px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_35_6949)" id="Icon">
          <path d={svgPaths.p1c10c270} id="Vector" stroke="var(--stroke-0, #46474C)" strokeWidth="0.89375" />
          <path d={svgPaths.p24430300} id="Vector_2" stroke="var(--stroke-0, #46474C)" strokeWidth="0.89375" />
          <path d={svgPaths.p3397ba00} id="Vector_3" stroke="var(--stroke-0, #46474C)" strokeWidth="0.89375" />
          <path d={svgPaths.p45ca000} id="Vector_4" stroke="var(--stroke-0, #46474C)" strokeWidth="0.89375" />
        </g>
        <defs>
          <clipPath id="clip0_35_6949">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[28px] relative rounded-[6px] shrink-0 w-[56.583px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[36.17px] text-[#46474c] text-[11px] text-center top-[3.75px] whitespace-nowrap">축소</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[28px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[44px] relative shrink-0 w-full" data-name="header">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[0.667px] px-[16px] relative size-full">
          <Container />
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p38b9c680} id="Vector" stroke="var(--stroke-0, #989BA2)" strokeWidth="1.05" />
          <path d="M7.5 7.5L10.125 10.125" id="Vector_2" stroke="var(--stroke-0, #989BA2)" strokeLinecap="round" strokeWidth="1.05" />
        </g>
      </svg>
    </div>
  );
}

function TextInput() {
  return (
    <div className="flex-[180_0_0] h-[16.5px] min-w-px relative" data-name="Text Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#989ba2] text-[11px] whitespace-nowrap">기록 검색...</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-white h-[28px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center px-[8.667px] py-[0.667px] relative size-full">
          <Icon2 />
          <TextInput />
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[8.67px] top-[6.67px] w-[11px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#c2c4c8] text-[11px] text-center whitespace-nowrap">☆</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[29.833px] relative rounded-[6px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Text4 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[62.67px] text-[#70737c] text-[11px] text-center top-[4.67px] whitespace-nowrap">즐겨찾기만 보기</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#70737c] text-[10px]">처방 타입</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#feecec] h-[23.833px] relative rounded-[5px] shrink-0 w-[37.583px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.17px] text-[#ff4242] text-[11px] text-center top-[1.67px] whitespace-nowrap">주사</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e0f7fa] h-[23.833px] relative rounded-[5px] shrink-0 w-[47.698px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[24.17px] text-[#00838f] text-[11px] text-center top-[1.67px] whitespace-nowrap">내시경</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#edf8ef] h-[23.833px] relative rounded-[5px] shrink-0 w-[57.823px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[29.17px] text-[#4ead0a] text-[11px] text-center top-[1.67px] whitespace-nowrap">혈액검사</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#fce4ec] h-[23.833px] relative rounded-[5px] shrink-0 w-[37.583px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.17px] text-[#c2185b] text-[11px] text-center top-[1.67px] whitespace-nowrap">처치</p>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#f1edff] h-[23.833px] relative rounded-[5px] shrink-0 w-[57.823px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[29.17px] text-[#6541f2] text-[11px] text-center top-[1.67px] whitespace-nowrap">물리치료</p>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#f6fadf] h-[23.833px] relative rounded-[5px] shrink-0 w-[57.823px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[29.17px] text-[#7cb342] text-[11px] text-center top-[1.67px] whitespace-nowrap">소변검사</p>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[#fff8e1] h-[23.833px] relative rounded-[5px] shrink-0 w-[37.583px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.17px] text-[#f57c00] text-[11px] text-center top-[1.67px] whitespace-nowrap">투약</p>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[#fff1e0] h-[23.833px] relative rounded-[5px] shrink-0 w-[47.698px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[24.17px] text-[#ff7b2e] text-[11px] text-center top-[1.67px] whitespace-nowrap">방사선</p>
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-[#e8f5e9] h-[23.833px] relative rounded-[5px] shrink-0 w-[47.698px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[24.17px] text-[#2e7d32] text-[11px] text-center top-[1.67px] whitespace-nowrap">심전도</p>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-[#eaf2fe] h-[23.833px] relative rounded-[5px] shrink-0 w-[47.698px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[24.17px] text-[#06f] text-[11px] text-center top-[1.67px] whitespace-nowrap">초음파</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-center flex flex-wrap gap-[5px_7px] items-center relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
      <Button10 />
      <Button11 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] whitespace-nowrap">본태성(원발성) 고혈압</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">I10 · 8회</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start px-[6px] py-[4px] relative rounded-[5px] shrink-0 w-[104px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#c2c4c8] border-[0.67px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] whitespace-nowrap">제2형 당뇨병</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">E11.9 · 6회</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start px-[6px] py-[4px] relative rounded-[5px] shrink-0 w-[66px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#c2c4c8] border-[0.67px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] whitespace-nowrap">급성비인두염</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">J00 · 5회</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start px-[6px] py-[4px] relative rounded-[5px] shrink-0 w-[68px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#c2c4c8] border-[0.67px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] whitespace-nowrap">상세불명의 두통</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">R51 · 4회</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start px-[6px] py-[4px] relative rounded-[5px] shrink-0 w-[79px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#c2c4c8] border-[0.67px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <Container20 />
      <Container21 />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-center flex flex-wrap gap-[4px] items-center relative size-full">
        <Container10 />
        <Container13 />
        <Container16 />
        <Container19 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#70737c] text-[10px] w-full">다빈도 상병</p>
      <Frame />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#70737c] text-[10px]">초재진</p>
    </div>
  );
}

function Chip() {
  return (
    <div className="absolute bg-[#453edc] border-[#453edc] border-[0.667px] border-solid h-[23.833px] left-0 rounded-[5px] top-0 w-[39.583px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.5px] text-[11px] text-center text-white top-px whitespace-nowrap">전체</p>
    </div>
  );
}

function Chip1() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-[0.667px] border-solid h-[23.833px] left-[43.58px] rounded-[5px] top-0 w-[39.583px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.5px] text-[#70737c] text-[11px] text-center top-px whitespace-nowrap">초진</p>
    </div>
  );
}

function Chip2() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-[0.667px] border-solid h-[23.833px] left-[87.17px] rounded-[5px] top-0 w-[39.583px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.5px] text-[#70737c] text-[11px] text-center top-px whitespace-nowrap">재진</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[23.833px] relative shrink-0 w-full" data-name="Container">
      <Chip />
      <Chip1 />
      <Chip2 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[44.833px] items-start relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#70737c] text-[10px]">청구구분</p>
    </div>
  );
}

function Chip3() {
  return (
    <div className="absolute bg-[#453edc] border-[#453edc] border-[0.667px] border-solid h-[23.833px] left-0 rounded-[5px] top-0 w-[39.583px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.5px] text-[11px] text-center text-white top-px whitespace-nowrap">전체</p>
    </div>
  );
}

function Chip4() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-[0.667px] border-solid h-[23.833px] left-[43.58px] rounded-[5px] top-0 w-[39.583px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[19.5px] text-[#70737c] text-[11px] text-center top-px whitespace-nowrap">청구</p>
    </div>
  );
}

function Chip5() {
  return (
    <div className="absolute bg-white border-[#dbdcdf] border-[0.667px] border-solid h-[23.833px] left-[87.17px] rounded-[5px] top-0 w-[49.698px]" data-name="Chip">
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[24.5px] text-[#70737c] text-[11px] text-center top-px whitespace-nowrap">비청구</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[23.833px] relative shrink-0 w-full" data-name="Container">
      <Chip3 />
      <Chip4 />
      <Chip5 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[44.833px] items-start relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#70737c] text-[10px]">보험</p>
    </div>
  );
}

function Chip6() {
  return (
    <div className="bg-[#453edc] h-[23.833px] relative rounded-[5px] shrink-0 w-[39.583px]" data-name="Chip">
      <div aria-hidden="true" className="absolute border-[#453edc] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[20.17px] text-[11px] text-center text-white top-[1.67px] whitespace-nowrap">전체</p>
    </div>
  );
}

function Chip7() {
  return (
    <div className="bg-white h-[23.833px] relative rounded-[5px] shrink-0 w-[39.583px]" data-name="Chip">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[20.17px] text-[#70737c] text-[11px] text-center top-[1.67px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Chip8() {
  return (
    <div className="bg-white h-[23.833px] relative rounded-[5px] shrink-0 w-[39.583px]" data-name="Chip">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[20.17px] text-[#70737c] text-[11px] text-center top-[1.67px] whitespace-nowrap">건보</p>
    </div>
  );
}

function Chip9() {
  return (
    <div className="bg-white h-[23.833px] relative rounded-[5px] shrink-0 w-[39.583px]" data-name="Chip">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] left-[20.17px] text-[#70737c] text-[11px] text-center top-[1.67px] whitespace-nowrap">자보</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-center flex flex-wrap gap-[4px] items-center relative shrink-0 w-full" data-name="Container">
      <Chip6 />
      <Chip7 />
      <Chip8 />
      <Chip9 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-[72.667px] items-start relative shrink-0 w-full" data-name="Container">
      <Container29 />
      <Container30 />
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[#f7f7f8] h-[20.333px] relative rounded-[4px] shrink-0 w-[43.875px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium','Noto_Sans_Math:Regular',sans-serif] font-medium leading-[15px] left-[21.67px] text-[#70737c] text-[10px] text-center top-[0.67px] whitespace-nowrap">⟳ 리셋</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10px] items-start p-[12px] relative size-full">
          <Container4 />
          <Button1 />
          <Container5 />
          <Container8 />
          <Container22 />
          <Container25 />
          <Container28 />
          <Button12 />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[15px] relative shrink-0 w-[58.979px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[15px] relative shrink-0 text-[#70737c] text-[10px] whitespace-nowrap">내원일 (11건)</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-[#f9f9fc] h-[31.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[8.667px] pl-[12px] pr-[168.354px] pt-[8px] relative size-full">
          <Text5 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return <div className="bg-[#453edc] h-[42.5px] rounded-br-[6px] rounded-tr-[6px] shrink-0 w-[3px]" data-name="Container" />;
}

function Text6() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#292a2d] text-[11px] whitespace-nowrap">26-03-12</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="flex-[1_0_0] h-[15px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] whitespace-nowrap">₩83,000</p>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#ff7b2e] text-[11px] text-center whitespace-nowrap">★</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[52.188px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text7 />
        <Button13 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex h-[16.5px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text6 />
      <Container37 />
    </div>
  );
}

function Text8() {
  return (
    <div className="bg-[#fff1d1] content-stretch flex h-[12px] items-start px-[4px] relative rounded-[2px] shrink-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="content-stretch flex h-[12px] items-start relative shrink-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text10() {
  return <div className="bg-[#4ead0a] rounded-[22369600px] shrink-0 size-[8px]" data-name="Text" />;
}

function Text11() {
  return <div className="bg-[#ff4242] rounded-[22369600px] shrink-0 size-[8px]" data-name="Text" />;
}

function Text12() {
  return (
    <div className="content-stretch flex h-[12px] items-start relative shrink-0 w-[12.448px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">🖼3</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Text8 />
      <Text9 />
      <Text10 />
      <Text11 />
      <Text12 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px relative">
      <Container36 />
      <Frame1 />
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[9px] items-center pr-[12px] relative size-full">
          <Container35 />
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">26-02-28</p>
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩42,000</p>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text14 />
        <Button14 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text13 />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function Text15() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text16() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text17() {
  return <div className="absolute bg-[#ff4242] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container41() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text15 />
      <Text16 />
      <Text17 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container39 />
        <Container41 />
      </div>
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">26-02-14</p>
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩55,000</p>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text19 />
        <Button15 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text18 />
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function Text20() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text21() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text22() {
  return <div className="absolute bg-[#ff4242] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Text23() {
  return <div className="absolute bg-[#6541f2] left-[57.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container45() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text20 />
      <Text21 />
      <Text22 />
      <Text23 />
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container43 />
        <Container45 />
      </div>
    </div>
  );
}

function Text24() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">26-01-05</p>
      </div>
    </div>
  );
}

function Text25() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩28,000</p>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text25 />
        <Button16 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text24 />
          <Container48 />
        </div>
      </div>
    </div>
  );
}

function Text26() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text27() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text28() {
  return <div className="absolute bg-[#ff7b2e] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container49() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text26 />
      <Text27 />
      <Text28 />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container47 />
        <Container49 />
      </div>
    </div>
  );
}

function Text29() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-11-01</p>
      </div>
    </div>
  );
}

function Text30() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩38,000</p>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text30 />
        <Button17 />
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text29 />
          <Container52 />
        </div>
      </div>
    </div>
  );
}

function Text31() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text32() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text33() {
  return <div className="absolute bg-[#ff4242] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Text34() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[57.46px] top-0 w-[12.448px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">🖼2</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text31 />
      <Text32 />
      <Text33 />
      <Text34 />
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container51 />
        <Container53 />
      </div>
    </div>
  );
}

function Text35() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-09-20</p>
      </div>
    </div>
  );
}

function Text36() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩19,400</p>
      </div>
    </div>
  );
}

function Button18() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#ff7b2e] text-[11px] text-center whitespace-nowrap">★</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text36 />
        <Button18 />
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text35 />
          <Container56 />
        </div>
      </div>
    </div>
  );
}

function Text37() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text38() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">건보</p>
    </div>
  );
}

function Text39() {
  return <div className="absolute bg-[#4ead0a] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Text40() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[57.46px] top-0 w-[12.448px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">🖼1</p>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text37 />
      <Text38 />
      <Text39 />
      <Text40 />
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container55 />
        <Container57 />
      </div>
    </div>
  );
}

function Text41() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-07-31</p>
      </div>
    </div>
  );
}

function Text42() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩25,000</p>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text42 />
        <Button19 />
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text41 />
          <Container60 />
        </div>
      </div>
    </div>
  );
}

function Text43() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text44() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text45() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[45.46px] top-0 w-[12.448px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">🖼4</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text43 />
      <Text44 />
      <Text45 />
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container59 />
        <Container61 />
      </div>
    </div>
  );
}

function Text46() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-06-20</p>
      </div>
    </div>
  );
}

function Text47() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩18,000</p>
      </div>
    </div>
  );
}

function Button20() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text47 />
        <Button20 />
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text46 />
          <Container64 />
        </div>
      </div>
    </div>
  );
}

function Text48() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text49() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Text50() {
  return <div className="absolute bg-[#ff7b2e] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container65() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text48 />
      <Text49 />
      <Text50 />
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container63 />
        <Container65 />
      </div>
    </div>
  );
}

function Text51() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-04-02</p>
      </div>
    </div>
  );
}

function Text52() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩32,000</p>
      </div>
    </div>
  );
}

function Button21() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text52 />
        <Button21 />
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text51 />
          <Container68 />
        </div>
      </div>
    </div>
  );
}

function Text53() {
  return (
    <div className="absolute bg-[#eaf2fe] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#3385ff] text-[8px] whitespace-nowrap">초진</p>
    </div>
  );
}

function Text54() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">일반</p>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text53 />
      <Text54 />
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container67 />
        <Container69 />
      </div>
    </div>
  );
}

function Text55() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">25-01-15</p>
      </div>
    </div>
  );
}

function Text56() {
  return (
    <div className="h-[15px] relative shrink-0 w-[36.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩62,000</p>
      </div>
    </div>
  );
}

function Button22() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[51.083px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text56 />
        <Button22 />
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text55 />
          <Container72 />
        </div>
      </div>
    </div>
  );
}

function Text57() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text58() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">건보</p>
    </div>
  );
}

function Text59() {
  return <div className="absolute bg-[#4ead0a] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container73() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text57 />
      <Text58 />
      <Text59 />
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container71 />
        <Container73 />
      </div>
    </div>
  );
}

function Text60() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[47.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16.5px] relative shrink-0 text-[#70737c] text-[11px] whitespace-nowrap">24-11-03</p>
      </div>
    </div>
  );
}

function Text61() {
  return (
    <div className="flex-[1_0_0] h-[15px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">₩8,500</p>
      </div>
    </div>
  );
}

function Button23() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[11px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] relative shrink-0 text-[#d0d1d6] text-[11px] text-center whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[45.531px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text61 />
        <Button23 />
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex h-[16.5px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text60 />
      <Container76 />
    </div>
  );
}

function Text62() {
  return (
    <div className="absolute bg-[#fff1d1] content-stretch flex h-[12px] items-start left-0 px-[4px] rounded-[2px] top-0 w-[22.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#a67300] text-[8px] whitespace-nowrap">재진</p>
    </div>
  );
}

function Text63() {
  return (
    <div className="absolute content-stretch flex h-[12px] items-start left-[26.73px] top-0 w-[14.729px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] relative shrink-0 text-[#989ba2] text-[8px] whitespace-nowrap">건보</p>
    </div>
  );
}

function Text64() {
  return <div className="absolute bg-[#ff4242] left-[45.46px] rounded-[22369600px] size-[8px] top-[2px]" data-name="Text" />;
}

function Container77() {
  return (
    <div className="h-[12px] relative shrink-0 w-full" data-name="Container">
      <Text62 />
      <Text63 />
      <Text64 />
    </div>
  );
}

function Container74() {
  return (
    <div className="h-[43.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ecedf1] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[2px] items-start pb-[0.667px] pt-[6px] px-[12px] relative size-full">
        <Container75 />
        <Container77 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container33 />
        <Container34 />
        <Container38 />
        <Container42 />
        <Container46 />
        <Container50 />
        <Container54 />
        <Container58 />
        <Container62 />
        <Container66 />
        <Container70 />
        <Container74 />
      </div>
    </div>
  );
}

function Filter() {
  return (
    <div className="bg-[#f9f9fc] h-[1067px] relative shrink-0 w-[178px]" data-name="filter">
      <div className="content-stretch flex flex-col items-start overflow-clip pr-[0.667px] relative rounded-[inherit] size-full">
        <Container3 />
        <Container31 />
        <Container32 />
      </div>
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-r-[0.667px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Text65() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">26-03-12</p>
      </div>
    </div>
  );
}

function Text66() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">11:47</p>
      </div>
    </div>
  );
}

function Text67() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text68() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text69() {
  return (
    <div className="bg-[#edf8ef] h-[16px] relative rounded-[3px] shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#4ead0a] text-[8px] whitespace-nowrap">검</p>
      </div>
    </div>
  );
}

function Text70() {
  return (
    <div className="bg-[#feecec] h-[16px] relative rounded-[3px] shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff4242] text-[8px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g id="Icon">
          <path d={svgPaths.p18f48c00} id="Vector" stroke="var(--stroke-0, #6B7BB0)" strokeWidth="0.771429" />
          <path d={svgPaths.p56fc680} fill="var(--fill-0, #6B7BB0)" id="Vector_2" />
          <path d={svgPaths.p2da90c40} id="Vector_3" stroke="var(--stroke-0, #6B7BB0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.707143" />
        </g>
      </svg>
    </div>
  );
}

function Text72() {
  return (
    <div className="h-[12px] relative shrink-0 w-[4.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">3</p>
      </div>
    </div>
  );
}

function Text71() {
  return (
    <div className="bg-[#f0f2f8] h-[17.333px] relative rounded-[3px] shrink-0 w-[24.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#d0d4e8] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center px-[4.667px] py-[2.667px] relative size-full">
        <Icon3 />
        <Text72 />
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="h-[19.5px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text65 />
        <Text66 />
        <Text67 />
        <Text68 />
        <Text69 />
        <Text70 />
        <Text71 />
      </div>
    </div>
  );
}

function Text73() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩83,000</p>
      </div>
    </div>
  );
}

function Button24() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#ff7b2e] text-[14px] text-center top-[-2.33px] whitespace-nowrap">★</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="bg-[#f8f8fd] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e8e8f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-end size-full">
        <div className="content-end flex flex-wrap gap-y-[6.00006103515625px] items-end justify-between pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container79 />
          <Text73 />
          <Button24 />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] min-w-px relative text-[#292a2d] text-[12px] whitespace-pre-wrap">
        <p className="leading-[18px] mb-0">{`기침, 콧물, 발열 3일 전부터 지속. `}</p>
        <p className="leading-[18px]">목 통증 동반.</p>
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[6px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Text74() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text75() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container83() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex items-center justify-between py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text74 />
      <Text75 />
    </div>
  );
}

function Text76() {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">J00</p>
    </div>
  );
}

function Text77() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[3.5px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">급성비인두염</p>
    </div>
  );
}

function Container84() {
  return (
    <div className="content-stretch flex gap-[6px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text76 />
      <Text77 />
    </div>
  );
}

function Text78() {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">J20.9</p>
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex gap-[10px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <Text78 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[89px] text-[#292a2d] text-[11px] top-[4px] w-[214.885px]">급성 기관지염</p>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container83 />
      <Container84 />
      <Container85 />
    </div>
  );
}

function Container81() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[0.667px] px-[6px] relative size-full">
        <Container82 />
      </div>
    </div>
  );
}

function Text79() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text80() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#989ba2] text-[9px] text-center whitespace-nowrap">용량</p>
    </div>
  );
}

function Text81() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#989ba2] text-[9px] text-center whitespace-nowrap">일투</p>
    </div>
  );
}

function Text82() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#989ba2] text-[9px] text-center whitespace-nowrap">일수</p>
    </div>
  );
}

function Text83() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#989ba2] text-[9px] text-center whitespace-nowrap">용법</p>
    </div>
  );
}

function Text84() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[33px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Text85() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[33px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#989ba2] text-[9px] text-right whitespace-nowrap">검사결과</p>
    </div>
  );
}

function Container88() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[5px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text79 />
      <Text80 />
      <Text81 />
      <Text82 />
      <Text83 />
      <Text84 />
      <Text85 />
    </div>
  );
}

function Text86() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">도네페질정 5mg</p>
    </div>
  );
}

function Text87() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text88() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text89() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text90() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text91() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">2,000</p>
    </div>
  );
}

function Container89() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text86 />
      <Text87 />
      <Text88 />
      <Text89 />
      <Text90 />
      <Text91 />
    </div>
  );
}

function Text92() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">암브록솔염산염시럽</p>
    </div>
  );
}

function Text93() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text94() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text95() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text96() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text97() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,800</p>
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text92 />
      <Text93 />
      <Text94 />
      <Text95 />
      <Text96 />
      <Text97 />
    </div>
  );
}

function Text98() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아세트아미노펜정 500mg</p>
    </div>
  );
}

function Text99() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text100() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text101() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text102() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text103() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container91() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text98 />
      <Text99 />
      <Text100 />
      <Text101 />
      <Text102 />
      <Text103 />
    </div>
  );
}

function Text104() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">클로르페니라민정 4mg</p>
    </div>
  );
}

function Text105() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text106() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text107() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text108() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text109() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">400</p>
    </div>
  );
}

function Container92() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text104 />
      <Text105 />
      <Text106 />
      <Text107 />
      <Text108 />
      <Text109 />
    </div>
  );
}

function Text110() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">덱시부프로펜정 300mg</p>
    </div>
  );
}

function Text111() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text112() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text113() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text114() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text115() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">600</p>
    </div>
  );
}

function Container93() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text110 />
      <Text111 />
      <Text112 />
      <Text113 />
      <Text114 />
      <Text115 />
    </div>
  );
}

function Text116() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">포비돈요오드 가글액</p>
    </div>
  );
}

function Text117() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text118() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">4</p>
    </div>
  );
}

function Text119() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text120() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">외용</p>
    </div>
  );
}

function Text121() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">500</p>
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text116 />
      <Text117 />
      <Text118 />
      <Text119 />
      <Text120 />
      <Text121 />
    </div>
  );
}

function Text122() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">전혈구검사(CBC)</p>
    </div>
  );
}

function Text123() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text124() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text125() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text126() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text127() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">9,000</p>
    </div>
  );
}

function Text128() {
  return (
    <div className="content-stretch flex h-[14px] items-start overflow-clip relative shrink-0 w-[38px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">정상</p>
    </div>
  );
}

function Container95() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text122 />
      <Text123 />
      <Text124 />
      <Text125 />
      <Text126 />
      <Text127 />
      <Text128 />
    </div>
  );
}

function Text129() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">CRP</p>
    </div>
  );
}

function Text130() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text131() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text132() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text133() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text134() {
  return (
    <div className="content-stretch flex h-[13px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">3,500</p>
    </div>
  );
}

function Text135() {
  return (
    <div className="content-stretch flex h-[13px] items-start overflow-clip relative shrink-0 w-[38px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">3.2</p>
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text129 />
      <Text130 />
      <Text131 />
      <Text132 />
      <Text133 />
      <Text134 />
      <Text135 />
    </div>
  );
}

function Text136() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[112px]" data-name="Text">
      <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#292a2d] text-[10px] w-[112px]">흉부 X-ray</p>
    </div>
  );
}

function Text137() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text138() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text139() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text140() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text141() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-[30px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">18,500</p>
    </div>
  );
}

function Text142() {
  return (
    <div className="content-stretch flex h-[14px] items-start overflow-clip relative shrink-0 w-[38px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">정상</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[6px] relative shrink-0">
      <Text136 />
      <Text137 />
      <Text138 />
      <Text139 />
      <Text140 />
      <Text141 />
      <Text142 />
    </div>
  );
}

function Container87() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-px items-start px-[6px] py-px relative size-full">
        <Container88 />
        <Container89 />
        <Container90 />
        <Container91 />
        <Container92 />
        <Container93 />
        <Container94 />
        <Container95 />
        <Container96 />
        <Frame3 />
      </div>
    </div>
  );
}

function Text143() {
  return (
    <div className="h-[17px] relative shrink-0 w-[107.354px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[#06f] text-[11px] whitespace-nowrap">가루약으로 나가주세요.</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="h-[31px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start pb-[10px] pt-[4px] px-[6px] relative size-full">
        <Text143 />
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex flex-col h-[310.167px] items-start relative shrink-0 w-full" data-name="Container">
      <Container87 />
      <Container97 />
    </div>
  );
}

function VisitCard() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-[319px]" data-name="VisitCard">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Container78 />
        <Container80 />
        <Container81 />
        <Container86 />
      </div>
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(69,62,220,0.25)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_2px_12px_0px_rgba(69,62,220,0.1)]" />
    </div>
  );
}

function Text144() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">26-01-05</p>
      </div>
    </div>
  );
}

function Text145() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">10:22</p>
      </div>
    </div>
  );
}

function Text146() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text147() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text148() {
  return (
    <div className="bg-[#fff1e0] h-[16px] relative rounded-[3px] shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff7b2e] text-[8px] whitespace-nowrap">방</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text144 />
        <Text145 />
        <Text146 />
        <Text147 />
        <Text148 />
      </div>
    </div>
  );
}

function Text149() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩28,000</p>
      </div>
    </div>
  );
}

function Button25() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container100 />
          <Text149 />
          <Button25 />
        </div>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] min-w-px relative text-[#292a2d] text-[12px] whitespace-pre-wrap">
        <p className="leading-[18px] mb-0">{`두통, 목 뻣뻣함 호소. `}</p>
        <p className="leading-[18px]">스트레스성으로 판단.</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Text150() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text151() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container104() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[6px] items-center py-[4px] relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text150 />
      <Text151 />
    </div>
  );
}

function Text152() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-[66px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">R51</p>
    </div>
  );
}

function Text153() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">두통</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-start py-[6px] relative shrink-0">
      <Text152 />
      <Text153 />
    </div>
  );
}

function Container103() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[6px] relative size-full">
        <Container104 />
        <Frame5 />
      </div>
    </div>
  );
}

function Container102() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container103 />
    </div>
  );
}

function Text154() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text155() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text156() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text157() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text158() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text159() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container106() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[2px] items-center py-[4px] relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text154 />
      <Text155 />
      <Text156 />
      <Text157 />
      <Text158 />
      <Text159 />
    </div>
  );
}

function Text160() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아세트아미노펜정 500mg</p>
    </div>
  );
}

function Text161() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text162() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text163() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text164() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text165() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container107() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-[362.885px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text160 />
      <Text161 />
      <Text162 />
      <Text163 />
      <Text164 />
      <Text165 />
    </div>
  );
}

function Text166() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">이부프로펜정 400mg</p>
    </div>
  );
}

function Text167() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text168() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text169() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text170() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text171() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">500</p>
    </div>
  );
}

function Container108() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-[362.885px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text166 />
      <Text167 />
      <Text168 />
      <Text169 />
      <Text170 />
      <Text171 />
    </div>
  );
}

function Text172() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">에티졸람정 0.5mg</p>
    </div>
  );
}

function Text173() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text174() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text175() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">7</p>
    </div>
  );
}

function Text176() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text177() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,200</p>
    </div>
  );
}

function Container109() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-[362.885px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text172 />
      <Text173 />
      <Text174 />
      <Text175 />
      <Text176 />
      <Text177 />
    </div>
  );
}

function Text178() {
  return (
    <div className="content-stretch flex h-[15px] items-start overflow-clip pr-[4px] relative shrink-0 w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">티자니딘염산염정 2mg</p>
    </div>
  );
}

function Text179() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text180() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text181() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text182() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start overflow-clip relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text183() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">700</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start py-[6px] relative shrink-0">
      <Text178 />
      <Text179 />
      <Text180 />
      <Text181 />
      <Text182 />
      <Text183 />
    </div>
  );
}

function Container105() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[6px] relative size-full">
        <Container106 />
        <Container107 />
        <Container108 />
        <Container109 />
        <Frame6 />
      </div>
    </div>
  );
}

function VisitCard1() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[6px] pt-[0.667px] px-[0.667px] relative size-full">
          <Container99 />
          <Container101 />
          <Container102 />
          <Container105 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex flex-col h-[452px] items-start relative shrink-0 w-[319px]" data-name="Container">
      <VisitCard1 />
    </div>
  );
}

function Text184() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-07-31</p>
      </div>
    </div>
  );
}

function Text185() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">15:30</p>
      </div>
    </div>
  );
}

function Text186() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text187() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g id="Icon">
          <path d={svgPaths.p18f48c00} id="Vector" stroke="var(--stroke-0, #6B7BB0)" strokeWidth="0.771429" />
          <path d={svgPaths.p56fc680} fill="var(--fill-0, #6B7BB0)" id="Vector_2" />
          <path d={svgPaths.p2da90c40} id="Vector_3" stroke="var(--stroke-0, #6B7BB0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.707143" />
        </g>
      </svg>
    </div>
  );
}

function Text189() {
  return (
    <div className="h-[12px] relative shrink-0 w-[4.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">4</p>
      </div>
    </div>
  );
}

function Text188() {
  return (
    <div className="bg-[#f0f2f8] h-[17.333px] relative rounded-[3px] shrink-0 w-[24.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#d0d4e8] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center px-[4.667px] py-[2.667px] relative size-full">
        <Icon4 />
        <Text189 />
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text184 />
        <Text185 />
        <Text186 />
        <Text187 />
        <Text188 />
      </div>
    </div>
  );
}

function Text190() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩25,000</p>
      </div>
    </div>
  );
}

function Button26() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container111 />
          <Text190 />
          <Button26 />
        </div>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] min-w-px relative text-[#292a2d] text-[12px] whitespace-pre-wrap">
        <p className="leading-[18px] mb-0">기침, 콧물,</p>
        <p className="leading-[18px] mb-0">{`발열 2일. `}</p>
        <p className="leading-[18px]">여름감기.</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[6px] relative size-full">
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container114() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-[103px]" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">첨부 이미지 (4)</p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pd919a80} id="Vector" stroke="var(--stroke-0, white)" strokeOpacity="0.35" strokeWidth="1.25" />
          <path d={svgPaths.p3040ac00} id="Vector_2" stroke="var(--stroke-0, white)" strokeOpacity="0.35" strokeWidth="1.25" />
          <path d={svgPaths.p18275e80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container117() {
  return (
    <div className="bg-[#2d3a6b] flex-[1_0_0] min-h-px relative rounded-[5px] w-[84.719px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[32.354px] pr-[32.365px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Text191() {
  return (
    <div className="h-[10px] relative shrink-0 w-[84.719px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[10px] left-[42.42px] text-[#70737c] text-[8px] text-center top-[-0.67px] whitespace-nowrap">흉부 X-ray</p>
      </div>
    </div>
  );
}

function Container116() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[68px] items-center left-0 top-0 w-[84.719px]" data-name="Container">
      <Container117 />
      <Text191 />
    </div>
  );
}

function Container115() {
  return (
    <div className="h-[68px] relative shrink-0 w-full" data-name="Container">
      <Container116 />
    </div>
  );
}

function Container113() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start px-[12px] py-[6px] relative shrink-0 w-[108px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-l-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container114 />
      <Container115 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full">
      <Container112 />
      <Container113 />
    </div>
  );
}

function Text192() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text193() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container120() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[6px] items-center px-[24px] py-[4px] relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text192 />
      <Text193 />
    </div>
  );
}

function Text194() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[5.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">J00</p>
    </div>
  );
}

function Text195() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[6px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">급성비인두염</p>
    </div>
  );
}

function Container121() {
  return (
    <div className="h-[28px] relative shrink-0 w-[363px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text194 />
      <Text195 />
    </div>
  );
}

function Text196() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[4.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">E78.5</p>
    </div>
  );
}

function Container122() {
  return (
    <div className="h-[28px] relative shrink-0 w-[363px]" data-name="Container">
      <Text196 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[5px] w-[214.885px]">고지혈증</p>
    </div>
  );
}

function Container119() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container120 />
      <Container121 />
      <Container122 />
    </div>
  );
}

function Container118() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[0.667px] px-[6px] relative size-full">
        <Container119 />
      </div>
    </div>
  );
}

function Text197() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text198() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text199() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text200() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text201() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text202() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container124() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[2px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text197 />
      <Text198 />
      <Text199 />
      <Text200 />
      <Text201 />
      <Text202 />
    </div>
  );
}

function Text203() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">클로르페니라민정 4mg</p>
    </div>
  );
}

function Text204() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text205() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text206() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text207() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text208() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">400</p>
    </div>
  );
}

function Container125() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text203 />
      <Text204 />
      <Text205 />
      <Text206 />
      <Text207 />
      <Text208 />
    </div>
  );
}

function Text209() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아세트아미노펜정 500mg</p>
    </div>
  );
}

function Text210() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text211() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text212() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text213() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text214() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container126() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text209 />
      <Text210 />
      <Text211 />
      <Text212 />
      <Text213 />
      <Text214 />
    </div>
  );
}

function Text215() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">암브록솔염산염정 30mg</p>
    </div>
  );
}

function Text216() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text217() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text218() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text219() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text220() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">600</p>
    </div>
  );
}

function Container127() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text215 />
      <Text216 />
      <Text217 />
      <Text218 />
      <Text219 />
      <Text220 />
    </div>
  );
}

function Text221() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">페니레프린 코드롭 0.25%</p>
    </div>
  );
}

function Text222() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text223() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text224() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text225() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">점비</p>
    </div>
  );
}

function Text226() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">800</p>
    </div>
  );
}

function Container128() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text221 />
      <Text222 />
      <Text223 />
      <Text224 />
      <Text225 />
      <Text226 />
    </div>
  );
}

function Text227() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">로수바스타틴정 10mg</p>
    </div>
  );
}

function Text228() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text229() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text230() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text231() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text232() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,500</p>
    </div>
  );
}

function Container129() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text227 />
      <Text228 />
      <Text229 />
      <Text230 />
      <Text231 />
      <Text232 />
    </div>
  );
}

function Container123() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pb-[6px] px-[6px] relative size-full">
        <Container124 />
        <Container125 />
        <Container126 />
        <Container127 />
        <Container128 />
        <Container129 />
      </div>
    </div>
  );
}

function VisitCard2() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-[319px]" data-name="VisitCard">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.667px] relative rounded-[inherit] size-full">
        <Container110 />
        <Frame7 />
        <Container118 />
        <Container123 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Text233() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-01-15</p>
      </div>
    </div>
  );
}

function Text234() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">14:00</p>
      </div>
    </div>
  );
}

function Text235() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text236() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">건보</p>
      </div>
    </div>
  );
}

function Text237() {
  return (
    <div className="bg-[#edf8ef] h-[16px] relative rounded-[3px] shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#4ead0a] text-[8px] whitespace-nowrap">검</p>
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text233 />
        <Text234 />
        <Text235 />
        <Text236 />
        <Text237 />
      </div>
    </div>
  );
}

function Text238() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩62,000</p>
      </div>
    </div>
  );
}

function Button27() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container131 />
          <Text238 />
          <Button27 />
        </div>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">연간 건강검진.</p>
    </div>
  );
}

function Container132() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[6px] py-[10px] relative size-full">
        <Paragraph3 />
      </div>
    </div>
  );
}

function Text239() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text240() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container135() {
  return (
    <div className="bg-[#f7f7f8] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[12px] pr-px py-[4px] relative size-full">
          <Text239 />
          <Text240 />
        </div>
      </div>
    </div>
  );
}

function Text241() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[4.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">Z00.0</p>
    </div>
  );
}

function Text242() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[5px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">일반 건강검진</p>
    </div>
  );
}

function Container136() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text241 />
      <Text242 />
    </div>
  );
}

function Text243() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[4.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">E11.9</p>
    </div>
  );
}

function Container137() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Text243 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[5px] w-[214.885px]">제2형 당뇨병</p>
    </div>
  );
}

function Container134() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container135 />
      <Container136 />
      <Container137 />
    </div>
  );
}

function Container133() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[0.667px] px-[6px] relative size-full">
        <Container134 />
      </div>
    </div>
  );
}

function Text244() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text245() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text246() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text247() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text248() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text249() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container139() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[2px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text244 />
      <Text245 />
      <Text246 />
      <Text247 />
      <Text248 />
      <Text249 />
    </div>
  );
}

function Text250() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">HbA1c</p>
    </div>
  );
}

function Text251() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text252() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text253() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text254() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text255() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">12,000</p>
    </div>
  );
}

function Text256() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">7.2 ↑</p>
    </div>
  );
}

function Container140() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text250 />
      <Text251 />
      <Text252 />
      <Text253 />
      <Text254 />
      <Text255 />
      <Text256 />
    </div>
  );
}

function Text257() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">LDL 콜레스테롤</p>
    </div>
  );
}

function Text258() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text259() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text260() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text261() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text262() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">8,000</p>
    </div>
  );
}

function Text263() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">145 ↑</p>
    </div>
  );
}

function Container141() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text257 />
      <Text258 />
      <Text259 />
      <Text260 />
      <Text261 />
      <Text262 />
      <Text263 />
    </div>
  );
}

function Text264() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">eGFR</p>
    </div>
  );
}

function Text265() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text266() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text267() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text268() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text269() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">6,000</p>
    </div>
  );
}

function Text270() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#1d7cf2] text-[9px] text-right">68 ↓</p>
    </div>
  );
}

function Container142() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text264 />
      <Text265 />
      <Text266 />
      <Text267 />
      <Text268 />
      <Text269 />
      <Text270 />
    </div>
  );
}

function Text271() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">공복혈당</p>
    </div>
  );
}

function Text272() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text273() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text274() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text275() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text276() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">4,000</p>
    </div>
  );
}

function Text277() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">128 ↑</p>
    </div>
  );
}

function Container143() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text271 />
      <Text272 />
      <Text273 />
      <Text274 />
      <Text275 />
      <Text276 />
      <Text277 />
    </div>
  );
}

function Text278() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">총콜레스테롤</p>
    </div>
  );
}

function Text279() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text280() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text281() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text282() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text283() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">5,000</p>
    </div>
  );
}

function Text284() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">218 ↑</p>
    </div>
  );
}

function Container144() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text278 />
      <Text279 />
      <Text280 />
      <Text281 />
      <Text282 />
      <Text283 />
      <Text284 />
    </div>
  );
}

function Text285() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">요침사검사</p>
    </div>
  );
}

function Text286() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text287() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text288() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text289() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text290() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">3,500</p>
    </div>
  );
}

function Text291() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">0~3</p>
    </div>
  );
}

function Container145() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text285 />
      <Text286 />
      <Text287 />
      <Text288 />
      <Text289 />
      <Text290 />
      <Text291 />
    </div>
  );
}

function Text292() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">심전도검사</p>
    </div>
  );
}

function Text293() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text294() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text295() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text296() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text297() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">8,500</p>
    </div>
  );
}

function Text298() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">정상</p>
    </div>
  );
}

function Container146() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text292 />
      <Text293 />
      <Text294 />
      <Text295 />
      <Text296 />
      <Text297 />
      <Text298 />
    </div>
  );
}

function Container138() {
  return (
    <div className="h-[223.833px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[6px] relative size-full">
        <Container139 />
        <Container140 />
        <Container141 />
        <Container142 />
        <Container143 />
        <Container144 />
        <Container145 />
        <Container146 />
      </div>
    </div>
  );
}

function VisitCard3() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-[319px]" data-name="VisitCard">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.667px] relative rounded-[inherit] size-full">
        <Container130 />
        <Container132 />
        <Container133 />
        <Container138 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Text299() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">26-02-28</p>
      </div>
    </div>
  );
}

function Text300() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">09:30</p>
      </div>
    </div>
  );
}

function Text301() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text302() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text303() {
  return (
    <div className="bg-[#feecec] h-[16px] relative rounded-[3px] shrink-0 w-[26.729px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff4242] text-[8px] whitespace-nowrap">주사</p>
      </div>
    </div>
  );
}

function Container149() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text299 />
        <Text300 />
        <Text301 />
        <Text302 />
        <Text303 />
      </div>
    </div>
  );
}

function Text304() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩42,000</p>
      </div>
    </div>
  );
}

function Button28() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container148() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container149 />
          <Text304 />
          <Button28 />
        </div>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">혈압 약 처방 요청. 두통 간헐적 발생.</p>
    </div>
  );
}

function Container150() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[6px] py-[10px] relative size-full">
        <Paragraph4 />
      </div>
    </div>
  );
}

function Text305() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text306() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container153() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex gap-[6px] items-center py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text305 />
      <Text306 />
    </div>
  );
}

function Text307() {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">I10</p>
    </div>
  );
}

function Text308() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">본태성 고혈압</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[6px] items-center py-[4px] relative shrink-0 w-full">
      <Text307 />
      <Text308 />
    </div>
  );
}

function Text309() {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">I10</p>
    </div>
  );
}

function Text310() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">본태성 고혈압</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[6px] items-center py-[4px] relative shrink-0 w-full">
      <Text309 />
      <Text310 />
    </div>
  );
}

function Container152() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[6px] relative size-full">
        <Container153 />
        <Frame8 />
        <Frame9 />
      </div>
    </div>
  );
}

function Container151() {
  return (
    <div className="content-stretch flex flex-col h-[67.5px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container152 />
    </div>
  );
}

function Text311() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6.67px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text312() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text313() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.67px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text314() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text315() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6.67px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text316() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.67px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container155() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text311 />
      <Text312 />
      <Text313 />
      <Text314 />
      <Text315 />
      <Text316 />
    </div>
  );
}

function Text317() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">텔미사르탄정 40mg</p>
    </div>
  );
}

function Text318() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text319() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text320() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text321() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text322() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,200</p>
    </div>
  );
}

function Container156() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text317 />
      <Text318 />
      <Text319 />
      <Text320 />
      <Text321 />
      <Text322 />
    </div>
  );
}

function Text323() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">암로디핀베실산염정 5mg</p>
    </div>
  );
}

function Text324() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text325() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text326() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text327() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text328() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">900</p>
    </div>
  );
}

function Container157() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text323 />
      <Text324 />
      <Text325 />
      <Text326 />
      <Text327 />
      <Text328 />
    </div>
  );
}

function Text329() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아스피린장용정 100mg</p>
    </div>
  );
}

function Text330() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text331() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text332() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text333() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text334() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container158() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text329 />
      <Text330 />
      <Text331 />
      <Text332 />
      <Text333 />
      <Text334 />
    </div>
  );
}

function Text335() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">로수바스타틴정 10mg</p>
    </div>
  );
}

function Text336() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text337() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text338() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text339() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text340() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,500</p>
    </div>
  );
}

function Container159() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text335 />
      <Text336 />
      <Text337 />
      <Text338 />
      <Text339 />
      <Text340 />
    </div>
  );
}

function Text341() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">히드로클로로티아지드정 12.5mg</p>
    </div>
  );
}

function Text342() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text343() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text344() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text345() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text346() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">250</p>
    </div>
  );
}

function Container160() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text341 />
      <Text342 />
      <Text343 />
      <Text344 />
      <Text345 />
      <Text346 />
    </div>
  );
}

function Container154() {
  return (
    <div className="h-[168.5px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container155 />
        <Container156 />
        <Container157 />
        <Container158 />
        <Container159 />
        <Container160 />
      </div>
    </div>
  );
}

function VisitCard4() {
  return (
    <div className="bg-white h-[331px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container148 />
          <Container150 />
          <Container151 />
          <Container154 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container147() {
  return (
    <div className="content-stretch flex flex-col h-[621px] items-start relative shrink-0 w-[318px]" data-name="Container">
      <VisitCard4 />
    </div>
  );
}

function Text347() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-11-01</p>
      </div>
    </div>
  );
}

function Text348() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">11:00</p>
      </div>
    </div>
  );
}

function Text349() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text350() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text351() {
  return (
    <div className="bg-[#edf8ef] h-[17.5px] relative rounded-[3px] shrink-0 w-[36.844px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] whitespace-nowrap">임산부</p>
      </div>
    </div>
  );
}

function Text352() {
  return (
    <div className="bg-[#feecec] h-[16px] relative rounded-[3px] shrink-0 w-[26.729px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff4242] text-[8px] whitespace-nowrap">주사</p>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g id="Icon">
          <path d={svgPaths.p18f48c00} id="Vector" stroke="var(--stroke-0, #6B7BB0)" strokeWidth="0.771429" />
          <path d={svgPaths.p56fc680} fill="var(--fill-0, #6B7BB0)" id="Vector_2" />
          <path d={svgPaths.p2da90c40} id="Vector_3" stroke="var(--stroke-0, #6B7BB0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.707143" />
        </g>
      </svg>
    </div>
  );
}

function Text354() {
  return (
    <div className="h-[12px] relative shrink-0 w-[4.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">2</p>
      </div>
    </div>
  );
}

function Text353() {
  return (
    <div className="bg-[#f0f2f8] h-[17.333px] relative rounded-[3px] shrink-0 w-[24.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#d0d4e8] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center px-[4.667px] py-[2.667px] relative size-full">
        <Icon6 />
        <Text354 />
      </div>
    </div>
  );
}

function Container162() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text347 />
        <Text348 />
        <Text349 />
        <Text350 />
        <Text351 />
        <Text352 />
        <Text353 />
      </div>
    </div>
  );
}

function Text355() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩38,000</p>
      </div>
    </div>
  );
}

function Button29() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container161() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[6.667px] pt-[6px] px-[8px] relative size-full">
          <Container162 />
          <Text355 />
          <Button29 />
        </div>
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[0] min-w-px relative text-[#292a2d] text-[12px] whitespace-pre-wrap">
        <p className="leading-[18px] mb-0">{`두통, 부종. `}</p>
        <p className="leading-[18px]">임산부 특례 적용.</p>
      </div>
    </div>
  );
}

function Container163() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[6px] relative size-full">
        <Paragraph5 />
      </div>
    </div>
  );
}

function Text356() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text357() {
  return (
    <div className="content-stretch flex h-[13.5px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container166() {
  return (
    <div className="bg-[#f7f7f8] content-stretch flex items-center justify-between py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text356 />
      <Text357 />
    </div>
  );
}

function Text358() {
  return (
    <div className="content-stretch flex h-[16.5px] items-start relative shrink-0 w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">R51</p>
    </div>
  );
}

function Text359() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">두통</p>
    </div>
  );
}

function Container167() {
  return (
    <div className="content-stretch flex items-center justify-between py-[4px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text358 />
      <Text359 />
    </div>
  );
}

function Text360() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">I10</p>
    </div>
  );
}

function Container168() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Text360 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[10px] w-[214.885px]">본태성 고혈압</p>
    </div>
  );
}

function Container165() {
  return (
    <div className="content-stretch flex flex-col h-[103.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container166 />
      <Container167 />
      <Container168 />
    </div>
  );
}

function Container164() {
  return (
    <div className="h-[104.167px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[0.667px] px-[6px] relative size-full">
        <Container165 />
      </div>
    </div>
  );
}

function Text361() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text362() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text363() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text364() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text365() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text366() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container170() {
  return (
    <div className="absolute bg-[#f7f7f8] border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] h-[26.833px] left-[16px] top-0 w-[362.885px]" data-name="Container">
      <Text361 />
      <Text362 />
      <Text363 />
      <Text364 />
      <Text365 />
      <Text366 />
    </div>
  );
}

function Text367() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아세트아미노펜정 500mg</p>
    </div>
  );
}

function Text368() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text369() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text370() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text371() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text372() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container171() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[26.83px] w-[362.885px]" data-name="Container">
      <Text367 />
      <Text368 />
      <Text369 />
      <Text370 />
      <Text371 />
      <Text372 />
    </div>
  );
}

function Text373() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">마그네슘산화물정 500mg</p>
    </div>
  );
}

function Text374() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text375() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text376() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">30</p>
    </div>
  );
}

function Text377() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text378() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">400</p>
    </div>
  );
}

function Container172() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[54.5px] w-[362.885px]" data-name="Container">
      <Text373 />
      <Text374 />
      <Text375 />
      <Text376 />
      <Text377 />
      <Text378 />
    </div>
  );
}

function Text379() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">폴산정 5mg</p>
    </div>
  );
}

function Text380() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text381() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text382() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">30</p>
    </div>
  );
}

function Text383() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text384() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">200</p>
    </div>
  );
}

function Container173() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[82.17px] w-[362.885px]" data-name="Container">
      <Text379 />
      <Text380 />
      <Text381 />
      <Text382 />
      <Text383 />
      <Text384 />
    </div>
  );
}

function Text385() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-[16px] overflow-clip pr-[4px] top-[115.83px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">라베탈롤정 100mg</p>
    </div>
  );
}

function Text386() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[186.89px] top-[116.58px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text387() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[208.89px] top-[116.58px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text388() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[228.89px] top-[116.58px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text389() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[250.89px] overflow-clip top-[116.58px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text390() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[280.89px] top-[116.58px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,800</p>
    </div>
  );
}

function Container169() {
  return (
    <div className="h-[140.833px] relative shrink-0 w-full" data-name="Container">
      <Container170 />
      <Container171 />
      <Container172 />
      <Container173 />
      <Text385 />
      <Text386 />
      <Text387 />
      <Text388 />
      <Text389 />
      <Text390 />
    </div>
  );
}

function VisitCard5() {
  return (
    <div className="bg-white h-[452px] relative rounded-[8px] shrink-0 w-[318px]" data-name="VisitCard">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.667px] relative rounded-[inherit] size-full">
        <Container161 />
        <Container163 />
        <Container164 />
        <Container169 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Text391() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-06-20</p>
      </div>
    </div>
  );
}

function Text392() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">10:10</p>
      </div>
    </div>
  );
}

function Text393() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text394() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text395() {
  return (
    <div className="bg-[#fff1e0] h-[16px] relative rounded-[3px] shrink-0 w-[34.083px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff7b2e] text-[8px] whitespace-nowrap">방사선</p>
      </div>
    </div>
  );
}

function Container176() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text391 />
        <Text392 />
        <Text393 />
        <Text394 />
        <Text395 />
      </div>
    </div>
  );
}

function Text396() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩18,000</p>
      </div>
    </div>
  );
}

function Button30() {
  return (
    <div className="bg-[#f0fff4] h-[18.833px] relative rounded-[3px] shrink-0 w-[40.188px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(46,166,82,0.5)] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[6.667px] py-[2.667px] relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] text-center whitespace-nowrap">↩ 전체</p>
      </div>
    </div>
  );
}

function Button31() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container175() {
  return (
    <div className="bg-[#fafafa] h-[38px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[0.667px] pl-[20px] pr-[12px] relative size-full">
          <Container176 />
          <Text396 />
          <Button30 />
          <Button31 />
        </div>
      </div>
    </div>
  );
}

function Container178() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">증상</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">두통 반복, 어지러움 동반. 편두통 추정.</p>
    </div>
  );
}

function Container177() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container178 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Text397() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[24px] top-[6.67px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text398() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[90px] top-[6.67px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container181() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text397 />
      <Text398 />
    </div>
  );
}

function Text399() {
  return (
    <div className="bg-[#ff7b2e] h-[14px] relative rounded-[2px] shrink-0 w-[11.365px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[14px] left-[2px] text-[8px] text-white top-[-0.67px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Container183() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start justify-center left-0 pl-[3.313px] pr-[3.323px] top-[11px] w-[18px]" data-name="Container">
      <Text399 />
    </div>
  );
}

function Text400() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">G43.9</p>
    </div>
  );
}

function Text401() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[10px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">편두통</p>
    </div>
  );
}

function Container182() {
  return (
    <div className="h-[36.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container183 />
      <Text400 />
      <Text401 />
    </div>
  );
}

function Text402() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">E78.5</p>
    </div>
  );
}

function Container184() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Text402 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[10px] w-[214.885px]">고지혈증</p>
    </div>
  );
}

function Container180() {
  return (
    <div className="h-[103.5px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container181 />
        <Container182 />
        <Container184 />
      </div>
    </div>
  );
}

function Container179() {
  return (
    <div className="content-stretch flex flex-col h-[104.167px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container180 />
    </div>
  );
}

function Text403() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text404() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text405() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text406() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text407() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text408() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container186() {
  return (
    <div className="absolute bg-[#f7f7f8] border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] h-[26.833px] left-[16px] top-0 w-[362.885px]" data-name="Container">
      <Text403 />
      <Text404 />
      <Text405 />
      <Text406 />
      <Text407 />
      <Text408 />
    </div>
  );
}

function Text409() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[12px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">수마트립탄정 50mg</p>
    </div>
  );
}

function Text410() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[12.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text411() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[12.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">10</p>
    </div>
  );
}

function Text412() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[12.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text413() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[12.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">2,800</p>
    </div>
  );
}

function Container187() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[39.667px] left-[16px] top-[26.83px] w-[362.885px]" data-name="Container">
      <Text409 />
      <Text410 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[201.89px] text-[#46474c] text-[9px] text-center top-[5px] w-[18px]">필요시</p>
      <Text411 />
      <Text412 />
      <Text413 />
    </div>
  );
}

function Text414() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[12px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">메토클로프라미드정 10mg</p>
    </div>
  );
}

function Text415() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[12.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text416() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[12.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">10</p>
    </div>
  );
}

function Text417() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[12.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text418() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[12.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container188() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[39.667px] left-[16px] top-[66.5px] w-[362.885px]" data-name="Container">
      <Text414 />
      <Text415 />
      <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[201.89px] text-[#46474c] text-[9px] text-center top-[5px] w-[18px]">필요시</p>
      <Text416 />
      <Text417 />
      <Text418 />
    </div>
  );
}

function Text419() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">프로프라놀롤정 20mg</p>
    </div>
  );
}

function Text420() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text421() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text422() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text423() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text424() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">400</p>
    </div>
  );
}

function Container189() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[106.17px] w-[362.885px]" data-name="Container">
      <Text419 />
      <Text420 />
      <Text421 />
      <Text422 />
      <Text423 />
      <Text424 />
    </div>
  );
}

function Text425() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-[16px] overflow-clip pr-[4px] top-[139.83px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">나프록센나트륨정 275mg</p>
    </div>
  );
}

function Text426() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[186.89px] top-[140.58px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text427() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[208.89px] top-[140.58px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text428() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[228.89px] top-[140.58px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text429() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[250.89px] overflow-clip top-[140.58px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text430() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[280.89px] top-[140.58px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">650</p>
    </div>
  );
}

function Container185() {
  return (
    <div className="h-[164.833px] relative shrink-0 w-full" data-name="Container">
      <Container186 />
      <Container187 />
      <Container188 />
      <Container189 />
      <Text425 />
      <Text426 />
      <Text427 />
      <Text428 />
      <Text429 />
      <Text430 />
    </div>
  );
}

function VisitCard6() {
  return (
    <div className="bg-white h-[364px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container175 />
          <Container177 />
          <Container179 />
          <Container185 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container174() {
  return (
    <div className="content-stretch flex flex-col h-[479.333px] items-start relative shrink-0 w-[396.219px]" data-name="Container">
      <VisitCard6 />
    </div>
  );
}

function Text431() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">24-11-03</p>
      </div>
    </div>
  );
}

function Text432() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">10:30</p>
      </div>
    </div>
  );
}

function Text433() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text434() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">건보</p>
      </div>
    </div>
  );
}

function Text435() {
  return (
    <div className="bg-[#feecec] h-[16px] relative rounded-[3px] shrink-0 w-[26.729px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff4242] text-[8px] whitespace-nowrap">주사</p>
      </div>
    </div>
  );
}

function Container192() {
  return (
    <div className="flex-[251.396_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text431 />
        <Text432 />
        <Text433 />
        <Text434 />
        <Text435 />
      </div>
    </div>
  );
}

function Text436() {
  return (
    <div className="h-[18px] relative shrink-0 w-[39.302px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩8,500</p>
      </div>
    </div>
  );
}

function Button32() {
  return (
    <div className="bg-[#f0fff4] h-[18.833px] relative rounded-[3px] shrink-0 w-[40.188px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(46,166,82,0.5)] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[6.667px] py-[2.667px] relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] text-center whitespace-nowrap">↩ 전체</p>
      </div>
    </div>
  );
}

function Button33() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container191() {
  return (
    <div className="bg-[#fafafa] h-[38px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[0.667px] pl-[20px] pr-[12px] relative size-full">
          <Container192 />
          <Text436 />
          <Button32 />
          <Button33 />
        </div>
      </div>
    </div>
  );
}

function Container194() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">증상</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">독감 예방접종.</p>
    </div>
  );
}

function Container193() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container194 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function Text437() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[24px] top-[6.67px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text438() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[90px] top-[6.67px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container197() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text437 />
      <Text438 />
    </div>
  );
}

function Text439() {
  return (
    <div className="bg-[#ff7b2e] h-[14px] relative rounded-[2px] shrink-0 w-[11.365px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[14px] left-[2px] text-[8px] text-white top-[-0.67px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Container199() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start justify-center left-0 pl-[3.313px] pr-[3.323px] top-[11px] w-[18px]" data-name="Container">
      <Text439 />
    </div>
  );
}

function Text440() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">Z23</p>
    </div>
  );
}

function Text441() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[10px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">독감 예방접종</p>
    </div>
  );
}

function Container198() {
  return (
    <div className="h-[36.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container199 />
      <Text440 />
      <Text441 />
    </div>
  );
}

function Text442() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">K21.0</p>
    </div>
  );
}

function Container200() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Text442 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[10px] w-[214.885px]">역류성 식도염</p>
    </div>
  );
}

function Container196() {
  return (
    <div className="h-[103.5px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container197 />
        <Container198 />
        <Container200 />
      </div>
    </div>
  );
}

function Container195() {
  return (
    <div className="content-stretch flex flex-col h-[104.167px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container196 />
    </div>
  );
}

function Text443() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6.67px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text444() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text445() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.67px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text446() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text447() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6.67px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text448() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.67px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container202() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text443 />
      <Text444 />
      <Text445 />
      <Text446 />
      <Text447 />
      <Text448 />
    </div>
  );
}

function Text449() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">오메프라졸캡슐 20mg</p>
    </div>
  );
}

function Text450() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text451() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text452() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text453() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text454() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">650</p>
    </div>
  );
}

function Container203() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text449 />
      <Text450 />
      <Text451 />
      <Text452 />
      <Text453 />
      <Text454 />
    </div>
  );
}

function Text455() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">모사프리드정 5mg</p>
    </div>
  );
}

function Text456() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text457() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text458() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text459() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text460() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">420</p>
    </div>
  );
}

function Container204() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text455 />
      <Text456 />
      <Text457 />
      <Text458 />
      <Text459 />
      <Text460 />
    </div>
  );
}

function Container201() {
  return (
    <div className="h-[85.5px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container202 />
        <Container203 />
        <Container204 />
      </div>
    </div>
  );
}

function VisitCard7() {
  return (
    <div className="bg-white h-[284.667px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container191 />
          <Container193 />
          <Container195 />
          <Container201 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container190() {
  return (
    <div className="content-stretch flex flex-col h-[423px] items-start relative shrink-0 w-[396.219px]" data-name="Container">
      <VisitCard7 />
    </div>
  );
}

function Text461() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">26-02-14</p>
      </div>
    </div>
  );
}

function Text462() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">14:15</p>
      </div>
    </div>
  );
}

function Text463() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text464() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Text465() {
  return (
    <div className="bg-[#feecec] h-[16px] relative rounded-[3px] shrink-0 w-[26.729px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#ff4242] text-[8px] whitespace-nowrap">주사</p>
      </div>
    </div>
  );
}

function Text466() {
  return (
    <div className="bg-[#f1edff] h-[16px] relative rounded-[3px] shrink-0 w-[41.448px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#6541f2] text-[8px] whitespace-nowrap">물리치료</p>
      </div>
    </div>
  );
}

function Container207() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text461 />
        <Text462 />
        <Text463 />
        <Text464 />
        <Text465 />
        <Text466 />
      </div>
    </div>
  );
}

function Text467() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩55,000</p>
      </div>
    </div>
  );
}

function Button34() {
  return (
    <div className="bg-[#f0fff4] h-[18.833px] relative rounded-[3px] shrink-0 w-[40.188px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(46,166,82,0.5)] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[6.667px] py-[2.667px] relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] text-center whitespace-nowrap">↩ 전체</p>
      </div>
    </div>
  );
}

function Button35() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container206() {
  return (
    <div className="bg-[#fafafa] h-[38px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[0.667px] pl-[20px] pr-[12px] relative size-full">
          <Container207 />
          <Text467 />
          <Button34 />
          <Button35 />
        </div>
      </div>
    </div>
  );
}

function Container209() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">증상</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">혈압·당뇨 정기 관리. 어지러움 호소.</p>
    </div>
  );
}

function Container208() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container209 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Text468() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[24px] top-[6px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text469() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[90px] top-[6px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container212() {
  return (
    <div className="absolute bg-[#f7f7f8] border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] h-[26.833px] left-[16px] top-0 w-[362.885px]" data-name="Container">
      <Text468 />
      <Text469 />
    </div>
  );
}

function Text470() {
  return (
    <div className="bg-[#ff7b2e] h-[14px] relative rounded-[2px] shrink-0 w-[11.365px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[14px] left-[2px] text-[8px] text-white top-[-0.67px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Container214() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start justify-center left-0 pl-[3.313px] pr-[3.323px] top-[11px] w-[18px]" data-name="Container">
      <Text470 />
    </div>
  );
}

function Text471() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">I10</p>
    </div>
  );
}

function Text472() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[10px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">본태성 고혈압</p>
    </div>
  );
}

function Container213() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[36.667px] left-[16px] top-[26.83px] w-[362.885px]" data-name="Container">
      <Container214 />
      <Text471 />
      <Text472 />
    </div>
  );
}

function Text473() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">E11.9</p>
    </div>
  );
}

function Container215() {
  return (
    <div className="absolute h-[36px] left-[16px] top-[63.5px] w-[362.885px]" data-name="Container">
      <Text473 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[10px] w-[214.885px]">제2형 당뇨병</p>
    </div>
  );
}

function Container211() {
  return (
    <div className="h-[103.5px] relative shrink-0 w-full" data-name="Container">
      <Container212 />
      <Container213 />
      <Container215 />
    </div>
  );
}

function Container210() {
  return (
    <div className="content-stretch flex flex-col h-[104.167px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container211 />
    </div>
  );
}

function Text474() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6.67px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text475() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text476() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.67px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text477() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text478() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6.67px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text479() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.67px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container217() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text474 />
      <Text475 />
      <Text476 />
      <Text477 />
      <Text478 />
      <Text479 />
    </div>
  );
}

function Text480() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">메트포르민염산염정 500mg</p>
    </div>
  );
}

function Text481() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text482() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text483() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text484() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text485() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">600</p>
    </div>
  );
}

function Container218() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text480 />
      <Text481 />
      <Text482 />
      <Text483 />
      <Text484 />
      <Text485 />
    </div>
  );
}

function Text486() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">라미프릴정 5mg</p>
    </div>
  );
}

function Text487() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text488() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text489() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text490() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text491() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,100</p>
    </div>
  );
}

function Container219() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text486 />
      <Text487 />
      <Text488 />
      <Text489 />
      <Text490 />
      <Text491 />
    </div>
  );
}

function Text492() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">텔미사르탄정 40mg</p>
    </div>
  );
}

function Text493() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text494() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text495() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text496() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text497() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,200</p>
    </div>
  );
}

function Container220() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text492 />
      <Text493 />
      <Text494 />
      <Text495 />
      <Text496 />
      <Text497 />
    </div>
  );
}

function Text498() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">글리메피리드정 2mg</p>
    </div>
  );
}

function Text499() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text500() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text501() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text502() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text503() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">800</p>
    </div>
  );
}

function Container221() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text498 />
      <Text499 />
      <Text500 />
      <Text501 />
      <Text502 />
      <Text503 />
    </div>
  );
}

function Text504() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아스피린장용정 100mg</p>
    </div>
  );
}

function Text505() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text506() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text507() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text508() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text509() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">300</p>
    </div>
  );
}

function Container222() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text504 />
      <Text505 />
      <Text506 />
      <Text507 />
      <Text508 />
      <Text509 />
    </div>
  );
}

function Text510() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">로수바스타틴정 10mg</p>
    </div>
  );
}

function Text511() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text512() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text513() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text514() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text515() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">1,500</p>
    </div>
  );
}

function Container223() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text510 />
      <Text511 />
      <Text512 />
      <Text513 />
      <Text514 />
      <Text515 />
    </div>
  );
}

function Text516() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">알파리포산정 300mg</p>
    </div>
  );
}

function Text517() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text518() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text519() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">28</p>
    </div>
  );
}

function Text520() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text521() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">950</p>
    </div>
  );
}

function Container224() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text516 />
      <Text517 />
      <Text518 />
      <Text519 />
      <Text520 />
      <Text521 />
    </div>
  );
}

function Container216() {
  return (
    <div className="h-[223.833px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container217 />
        <Container218 />
        <Container219 />
        <Container220 />
        <Container221 />
        <Container222 />
        <Container223 />
        <Container224 />
      </div>
    </div>
  );
}

function VisitCard8() {
  return (
    <div className="bg-white h-[423px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container206 />
          <Container208 />
          <Container210 />
          <Container216 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container205() {
  return (
    <div className="content-stretch flex flex-col h-[621px] items-start relative shrink-0 w-[396.219px]" data-name="Container">
      <VisitCard8 />
    </div>
  );
}

function Text522() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-09-20</p>
      </div>
    </div>
  );
}

function Text523() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">09:45</p>
      </div>
    </div>
  );
}

function Text524() {
  return (
    <div className="bg-[#fff1d1] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#a67300] text-[9px] whitespace-nowrap">재진</p>
      </div>
    </div>
  );
}

function Text525() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">건보</p>
      </div>
    </div>
  );
}

function Text526() {
  return (
    <div className="bg-[#edf8ef] h-[16px] relative rounded-[3px] shrink-0 w-[26.729px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[12px] relative shrink-0 text-[#4ead0a] text-[8px] whitespace-nowrap">검사</p>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g id="Icon">
          <path d={svgPaths.p18f48c00} id="Vector" stroke="var(--stroke-0, #6B7BB0)" strokeWidth="0.771429" />
          <path d={svgPaths.p56fc680} fill="var(--fill-0, #6B7BB0)" id="Vector_2" />
          <path d={svgPaths.p2da90c40} id="Vector_3" stroke="var(--stroke-0, #6B7BB0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.707143" />
        </g>
      </svg>
    </div>
  );
}

function Text528() {
  return (
    <div className="h-[12px] relative shrink-0 w-[4.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#6b7bb0] text-[8px] whitespace-nowrap">1</p>
      </div>
    </div>
  );
}

function Text527() {
  return (
    <div className="bg-[#f0f2f8] h-[17.333px] relative rounded-[3px] shrink-0 w-[24.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#d0d4e8] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center px-[4.667px] py-[2.667px] relative size-full">
        <Icon7 />
        <Text528 />
      </div>
    </div>
  );
}

function Container227() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text522 />
        <Text523 />
        <Text524 />
        <Text525 />
        <Text526 />
        <Text527 />
      </div>
    </div>
  );
}

function Text529() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩19,400</p>
      </div>
    </div>
  );
}

function Button36() {
  return (
    <div className="bg-[#f0fff4] h-[18.833px] relative rounded-[3px] shrink-0 w-[40.188px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(46,166,82,0.5)] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[6.667px] py-[2.667px] relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] text-center whitespace-nowrap">↩ 전체</p>
      </div>
    </div>
  );
}

function Button37() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#ff7b2e] text-[14px] text-center top-[-2.33px] whitespace-nowrap">★</p>
      </div>
    </div>
  );
}

function Container226() {
  return (
    <div className="bg-[#fafafa] h-[38px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[0.667px] pl-[20px] pr-[12px] relative size-full">
          <Container227 />
          <Text529 />
          <Button36 />
          <Button37 />
        </div>
      </div>
    </div>
  );
}

function Container229() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">증상</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">알러지 검사 위해 내원. 페니실린·조영제 알러지 기왕력.</p>
    </div>
  );
}

function Container228() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container229 />
        <Paragraph9 />
      </div>
    </div>
  );
}

function Container231() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">첨부 이미지 (1)</p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pd919a80} id="Vector" stroke="var(--stroke-0, white)" strokeOpacity="0.35" strokeWidth="1.25" />
          <path d={svgPaths.p3040ac00} id="Vector_2" stroke="var(--stroke-0, white)" strokeOpacity="0.35" strokeWidth="1.25" />
          <path d={svgPaths.p18275e80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container233() {
  return (
    <div className="bg-[#2d3a6b] flex-[1_0_0] min-h-px relative rounded-[5px] w-[84.719px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[32.354px] pr-[32.365px] relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Text530() {
  return (
    <div className="h-[10px] relative shrink-0 w-[84.719px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[10px] left-[42.16px] text-[#70737c] text-[8px] text-center top-[-0.67px] whitespace-nowrap">피부반응 검사</p>
      </div>
    </div>
  );
}

function Container232() {
  return (
    <div className="h-[68px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-center pr-[278.167px] relative size-full">
          <Container233 />
          <Text530 />
        </div>
      </div>
    </div>
  );
}

function Container230() {
  return (
    <div className="h-[111.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[8px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container231 />
        <Container232 />
      </div>
    </div>
  );
}

function Text531() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[24px] top-[6.67px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text532() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[90px] top-[6.67px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container236() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text531 />
      <Text532 />
    </div>
  );
}

function Text533() {
  return (
    <div className="bg-[#ff7b2e] h-[14px] relative rounded-[2px] shrink-0 w-[11.365px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[14px] left-[2px] text-[8px] text-white top-[-0.67px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Container238() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start justify-center left-0 pl-[3.313px] pr-[3.323px] top-[11px] w-[18px]" data-name="Container">
      <Text533 />
    </div>
  );
}

function Text534() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">Z01.1</p>
    </div>
  );
}

function Text535() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[10px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">알러지 검사</p>
    </div>
  );
}

function Container237() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Container238 />
      <Text534 />
      <Text535 />
    </div>
  );
}

function Container235() {
  return (
    <div className="h-[66.833px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container236 />
        <Container237 />
      </div>
    </div>
  );
}

function Container234() {
  return (
    <div className="content-stretch flex flex-col h-[67.5px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container235 />
    </div>
  );
}

function Text536() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6.67px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text537() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text538() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.67px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text539() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.67px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text540() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6.67px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text541() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.67px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container241() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text536 />
      <Text537 />
      <Text538 />
      <Text539 />
      <Text540 />
      <Text541 />
    </div>
  );
}

function Text542() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">페니실린 IgE</p>
    </div>
  );
}

function Text543() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text544() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text545() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text546() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text547() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">6,000</p>
    </div>
  );
}

function Text548() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">2.8 ↑</p>
    </div>
  );
}

function Container242() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text542 />
      <Text543 />
      <Text544 />
      <Text545 />
      <Text546 />
      <Text547 />
      <Text548 />
    </div>
  );
}

function Text549() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">조영제 IgE</p>
    </div>
  );
}

function Text550() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text551() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text552() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text553() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text554() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">6,000</p>
    </div>
  );
}

function Text555() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">1.4 ↑</p>
    </div>
  );
}

function Container243() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text549 />
      <Text550 />
      <Text551 />
      <Text552 />
      <Text553 />
      <Text554 />
      <Text555 />
    </div>
  );
}

function Text556() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">집먼지진드기 IgE</p>
    </div>
  );
}

function Text557() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text558() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text559() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text560() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text561() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">6,000</p>
    </div>
  );
}

function Text562() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#e03333] text-[9px] text-right">12.4 ↑</p>
    </div>
  );
}

function Container244() {
  return (
    <div className="h-[27.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Text556 />
      <Text557 />
      <Text558 />
      <Text559 />
      <Text560 />
      <Text561 />
      <Text562 />
    </div>
  );
}

function Text563() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">꽃가루 IgE</p>
    </div>
  );
}

function Text564() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text565() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text566() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text567() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">-</p>
    </div>
  );
}

function Text568() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">6,000</p>
    </div>
  );
}

function Text569() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[310.89px] overflow-clip top-[6.75px] w-[52px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">0.18</p>
    </div>
  );
}

function Container245() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Container">
      <Text563 />
      <Text564 />
      <Text565 />
      <Text566 />
      <Text567 />
      <Text568 />
      <Text569 />
    </div>
  );
}

function Container240() {
  return (
    <div className="h-[140.833px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container241 />
        <Container242 />
        <Container243 />
        <Container244 />
        <Container245 />
      </div>
    </div>
  );
}

function Text570() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[15.104px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16.5px] min-w-px relative text-[#0a0a0a] text-[11px]">📝</p>
      </div>
    </div>
  );
}

function Text571() {
  return (
    <div className="h-[17px] relative shrink-0 w-[164.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[#453edc] text-[11px] whitespace-nowrap">결과 3~4주 소요 예정. 확인 후 연락.</p>
      </div>
    </div>
  );
}

function Container246() {
  return (
    <div className="h-[31px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[6px] items-start pb-[10px] pt-[4px] px-[16px] relative size-full">
        <Text570 />
        <Text571 />
      </div>
    </div>
  );
}

function Container239() {
  return (
    <div className="content-stretch flex flex-col h-[171.833px] items-start relative shrink-0 w-full" data-name="Container">
      <Container240 />
      <Container246 />
    </div>
  );
}

function VisitCard9() {
  return (
    <div className="bg-white h-[446px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container226 />
          <Container228 />
          <Container230 />
          <Container234 />
          <Container239 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container225() {
  return (
    <div className="content-stretch flex flex-col h-[451.667px] items-start relative shrink-0 w-[396.219px]" data-name="Container">
      <VisitCard9 />
    </div>
  );
}

function Text572() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[55.667px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[19.5px] relative shrink-0 text-[#292a2d] text-[13px] whitespace-nowrap">25-04-02</p>
      </div>
    </div>
  );
}

function Text573() {
  return (
    <div className="h-[15px] relative shrink-0 w-[25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#989ba2] text-[10px] whitespace-nowrap">09:00</p>
      </div>
    </div>
  );
}

function Text574() {
  return (
    <div className="bg-[#eaf2fe] h-[17.5px] relative rounded-[3px] shrink-0 w-[28.563px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[6px] py-[2px] relative size-full">
        <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#3385ff] text-[9px] whitespace-nowrap">초진</p>
      </div>
    </div>
  );
}

function Text575() {
  return (
    <div className="bg-white h-[18.833px] relative rounded-[3px] shrink-0 w-[29.896px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dbdcdf] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] left-[6.67px] text-[#70737c] text-[9px] top-[1.67px] whitespace-nowrap">일반</p>
      </div>
    </div>
  );
}

function Container249() {
  return (
    <div className="flex-[244.313_0_0] h-[19.5px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center overflow-clip relative rounded-[inherit] size-full">
        <Text572 />
        <Text573 />
        <Text574 />
        <Text575 />
      </div>
    </div>
  );
}

function Text576() {
  return (
    <div className="h-[18px] relative shrink-0 w-[46.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#292a2d] text-[12px] whitespace-nowrap">₩32,000</p>
      </div>
    </div>
  );
}

function Button38() {
  return (
    <div className="bg-[#f0fff4] h-[18.833px] relative rounded-[3px] shrink-0 w-[40.188px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.667px] border-[rgba(46,166,82,0.5)] border-solid inset-0 pointer-events-none rounded-[3px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[6.667px] py-[2.667px] relative size-full">
        <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] relative shrink-0 text-[#2ea652] text-[9px] text-center whitespace-nowrap">↩ 전체</p>
      </div>
    </div>
  );
}

function Button39() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[14px] left-[7px] text-[#d0d1d6] text-[14px] text-center top-[-2.33px] whitespace-nowrap">☆</p>
      </div>
    </div>
  );
}

function Container248() {
  return (
    <div className="bg-[#fafafa] h-[38px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f0f0f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pb-[0.667px] pl-[20px] pr-[12px] relative size-full">
          <Container249 />
          <Text576 />
          <Button38 />
          <Button39 />
        </div>
      </div>
    </div>
  );
}

function Container251() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[15px] min-w-px relative text-[#989ba2] text-[10px]">증상</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] min-w-px relative text-[#292a2d] text-[12px]">발열 38.5도, 인후통. 처음 내원.</p>
    </div>
  );
}

function Container250() {
  return (
    <div className="h-[55.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pb-[0.667px] pt-[10px] px-[16px] relative size-full">
        <Container251 />
        <Paragraph10 />
      </div>
    </div>
  );
}

function Text577() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[24px] top-[6.67px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">코드</p>
    </div>
  );
}

function Text578() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[90px] top-[6.67px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">상병명</p>
    </div>
  );
}

function Container254() {
  return (
    <div className="bg-[#f7f7f8] h-[26.833px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] inset-0 pointer-events-none" />
      <Text577 />
      <Text578 />
    </div>
  );
}

function Text579() {
  return (
    <div className="bg-[#ff7b2e] h-[14px] relative rounded-[2px] shrink-0 w-[11.365px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[14px] left-[2px] text-[8px] text-white top-[-0.67px] whitespace-nowrap">주</p>
      </div>
    </div>
  );
}

function Container256() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start justify-center left-0 pl-[3.313px] pr-[3.323px] top-[11px] w-[18px]" data-name="Container">
      <Text579 />
    </div>
  );
}

function Text580() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">J02.9</p>
    </div>
  );
}

function Text581() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[90px] top-[10px] w-[214.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-w-px relative text-[#292a2d] text-[11px]">급성인두염</p>
    </div>
  );
}

function Container255() {
  return (
    <div className="h-[36.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container256 />
      <Text580 />
      <Text581 />
    </div>
  );
}

function Text582() {
  return (
    <div className="absolute content-stretch flex h-[16.5px] items-start left-[24px] top-[9.75px] w-[60px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[16.5px] min-w-px relative text-[#453edc] text-[11px]">J30.9</p>
    </div>
  );
}

function Container257() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Text582 />
      <p className="absolute font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[90px] text-[#292a2d] text-[11px] top-[10px] w-[214.885px]">알레르기성 비염</p>
    </div>
  );
}

function Container253() {
  return (
    <div className="h-[103.5px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container254 />
        <Container255 />
        <Container257 />
      </div>
    </div>
  );
}

function Container252() {
  return (
    <div className="content-stretch flex flex-col h-[104.167px] items-start pb-[0.667px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f8] border-b-[0.667px] border-solid inset-0 pointer-events-none" />
      <Container253 />
    </div>
  );
}

function Text583() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-0 top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px]">처방명</p>
    </div>
  );
}

function Text584() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용량</p>
    </div>
  );
}

function Text585() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일투</p>
    </div>
  );
}

function Text586() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">일수</p>
    </div>
  );
}

function Text587() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] top-[6px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-center">용법</p>
    </div>
  );
}

function Text588() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Medium',sans-serif] font-medium leading-[13.5px] min-w-px relative text-[#989ba2] text-[9px] text-right">단가</p>
    </div>
  );
}

function Container259() {
  return (
    <div className="absolute bg-[#f7f7f8] border-[#ebebf0] border-b-[0.667px] border-solid border-t-[0.667px] h-[26.833px] left-[16px] top-0 w-[362.885px]" data-name="Container">
      <Text583 />
      <Text584 />
      <Text585 />
      <Text586 />
      <Text587 />
      <Text588 />
    </div>
  );
}

function Text589() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">아목시실린캡슐 500mg</p>
    </div>
  );
}

function Text590() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text591() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text592() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text593() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text594() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">800</p>
    </div>
  );
}

function Container260() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[26.83px] w-[362.885px]" data-name="Container">
      <Text589 />
      <Text590 />
      <Text591 />
      <Text592 />
      <Text593 />
      <Text594 />
    </div>
  );
}

function Text595() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">이부프로펜정 400mg</p>
    </div>
  );
}

function Text596() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text597() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">3</p>
    </div>
  );
}

function Text598() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">5</p>
    </div>
  );
}

function Text599() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text600() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">500</p>
    </div>
  );
}

function Container261() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[54.5px] w-[362.885px]" data-name="Container">
      <Text595 />
      <Text596 />
      <Text597 />
      <Text598 />
      <Text599 />
      <Text600 />
    </div>
  );
}

function Text601() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">베클로메타손 비강 스프레이</p>
    </div>
  );
}

function Text602() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text603() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text604() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">7</p>
    </div>
  );
}

function Text605() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">흡입</p>
    </div>
  );
}

function Text606() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">4,500</p>
    </div>
  );
}

function Container262() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[82.17px] w-[362.885px]" data-name="Container">
      <Text601 />
      <Text602 />
      <Text603 />
      <Text604 />
      <Text605 />
      <Text606 />
    </div>
  );
}

function Text607() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 overflow-clip pr-[4px] top-[6px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">클라리트로마이신정 500mg</p>
    </div>
  );
}

function Text608() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[170.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text609() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[192.89px] top-[6.75px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">2</p>
    </div>
  );
}

function Text610() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[212.89px] top-[6.75px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">7</p>
    </div>
  );
}

function Text611() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[234.89px] overflow-clip top-[6.75px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text612() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[264.89px] top-[6.75px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">2,800</p>
    </div>
  );
}

function Container263() {
  return (
    <div className="absolute border-[#f2f2f4] border-b-[0.667px] border-solid h-[27.667px] left-[16px] top-[109.83px] w-[362.885px]" data-name="Container">
      <Text607 />
      <Text608 />
      <Text609 />
      <Text610 />
      <Text611 />
      <Text612 />
    </div>
  );
}

function Text613() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-[16px] overflow-clip pr-[4px] top-[143.5px] w-[168.885px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[15px] min-w-px relative text-[#292a2d] text-[10px]">세티리진염산염정 10mg</p>
    </div>
  );
}

function Text614() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[186.89px] top-[144.25px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text615() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[208.89px] top-[144.25px] w-[18px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">1</p>
    </div>
  );
}

function Text616() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[228.89px] top-[144.25px] w-[20px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#46474c] text-[9px] text-center">7</p>
    </div>
  );
}

function Text617() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[250.89px] overflow-clip top-[144.25px] w-[28px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#70737c] text-[9px] text-center">경구</p>
    </div>
  );
}

function Text618() {
  return (
    <div className="absolute content-stretch flex h-[13.5px] items-start left-[280.89px] top-[144.25px] w-[44px]" data-name="Text">
      <p className="flex-[1_0_0] font-['Noto_Sans_KR:Regular',sans-serif] font-normal leading-[13.5px] min-w-px relative text-[#292a2d] text-[9px] text-right">350</p>
    </div>
  );
}

function Container258() {
  return (
    <div className="h-[168.5px] relative shrink-0 w-full" data-name="Container">
      <Container259 />
      <Container260 />
      <Container261 />
      <Container262 />
      <Container263 />
      <Text613 />
      <Text614 />
      <Text615 />
      <Text616 />
      <Text617 />
      <Text618 />
    </div>
  );
}

function VisitCard10() {
  return (
    <div className="bg-white h-[367.667px] relative rounded-[8px] shrink-0 w-full" data-name="VisitCard">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.667px] relative size-full">
          <Container248 />
          <Container250 />
          <Container252 />
          <Container258 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e0e1e7] border-[0.667px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container247() {
  return (
    <div className="content-stretch flex flex-col h-[479.333px] items-start relative shrink-0 w-[396.219px]" data-name="Container">
      <VisitCard10 />
    </div>
  );
}

function HistoryCardStack() {
  return (
    <div className="bg-[#f4f4f5] flex-[1_0_0] h-[1067px] min-w-px relative" data-name="history card stack">
      <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative size-full">
        <VisitCard />
        <Container98 />
        <VisitCard2 />
        <VisitCard3 />
        <Container147 />
        <VisitCard5 />
        <Container174 />
        <Container190 />
        <Container205 />
        <Container225 />
        <Container247 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex h-[1019px] items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <Filter />
      <HistoryCardStack />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[14px] shadow-[2px_2px_35.9px_-18px_rgba(0,0,0,0.7)] size-full" data-name="내원이력 펼친 팝업">
      <Header />
      <Container2 />
    </div>
  );
}