function AssistantIcon() {
  return (
    <div className="absolute bg-[#534ab7] left-[20px] overflow-clip rounded-[4px] size-[18px] top-[19px]" data-name="AssistantIcon">
      <p className="absolute font-['Inter:Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-bold leading-[normal] left-[4px] not-italic text-[11px] text-white top-px whitespace-nowrap">✦</p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white h-[56px] left-[-0.5px] overflow-clip top-[-0.5px] w-[440px]" data-name="Header">
      <AssistantIcon />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[48px] not-italic text-[#212121] text-[14px] top-[19px] whitespace-nowrap">AI 어시스턴트</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[384px] not-italic text-[#999] text-[14px] top-[19px] whitespace-nowrap">—</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_Symbols2:Regular',sans-serif] font-normal leading-[normal] left-[412px] not-italic text-[#999] text-[14px] top-[19px] whitespace-nowrap">✕</p>
    </div>
  );
}

function HeaderBorder() {
  return <div className="absolute bg-[#dbdbde] h-px left-[-0.5px] top-[55.5px] w-[440px]" data-name="HeaderBorder" />;
}

function IconBox() {
  return (
    <div className="absolute bg-[#eeedfe] left-[15.5px] overflow-clip rounded-[6px] size-[28px] top-[17.5px]" data-name="IconBox">
      <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_Math:Regular',sans-serif] font-semibold leading-[normal] left-[8px] not-italic text-[#3c3489] text-[14px] top-[5px] whitespace-nowrap">⊕</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#eeedfe] h-[18px] left-[349.5px] overflow-clip rounded-[6px] top-[22.5px] w-[36px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[5px] not-italic text-[#3c3489] text-[10px] top-[3px] whitespace-nowrap">새기능</p>
    </div>
  );
}

function Card() {
  return (
    <div className="absolute bg-white border-[#dbdbde] border-[0.5px] border-solid h-[64px] left-[19.5px] overflow-clip rounded-[8px] top-[147.5px] w-[400px]" data-name="Card">
      <IconBox />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[55.5px] not-italic text-[#212121] text-[13px] top-[13.5px] whitespace-nowrap">빠른메뉴 만들기</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[55.5px] not-italic text-[#6b6b6b] text-[11px] top-[35.5px] whitespace-nowrap">자주 하는 작업을 한 번에 등록</p>
      <Badge />
    </div>
  );
}

function IconBox1() {
  return (
    <div className="absolute bg-[#e1f5ee] left-[15.5px] overflow-clip rounded-[6px] size-[28px] top-[17.5px]" data-name="IconBox">
      <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-semibold leading-[normal] left-[8px] not-italic text-[#085041] text-[14px] top-[5px] whitespace-nowrap">◎</p>
    </div>
  );
}

function Card1() {
  return (
    <div className="absolute bg-white border-[#dbdbde] border-[0.5px] border-solid h-[64px] left-[19.5px] overflow-clip rounded-[8px] top-[219.5px] w-[400px]" data-name="Card">
      <IconBox1 />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[55.5px] not-italic text-[#212121] text-[13px] top-[13.5px] whitespace-nowrap">환자 찾기</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[55.5px] not-italic text-[#6b6b6b] text-[11px] top-[35.5px] whitespace-nowrap">이름·증상·진료 시점으로 검색</p>
    </div>
  );
}

function IconBox2() {
  return (
    <div className="absolute bg-[#faede8] left-[15.5px] overflow-clip rounded-[6px] size-[28px] top-[17.5px]" data-name="IconBox">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[8px] not-italic text-[#712b13] text-[14px] top-[5px] whitespace-nowrap">℞</p>
    </div>
  );
}

function Card2() {
  return (
    <div className="absolute bg-white border-[#dbdbde] border-[0.5px] border-solid h-[64px] left-[19.5px] overflow-clip rounded-[8px] top-[291.5px] w-[400px]" data-name="Card">
      <IconBox2 />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[55.5px] not-italic text-[#212121] text-[13px] top-[13.5px] whitespace-nowrap">처방 도우미</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[55.5px] not-italic text-[#6b6b6b] text-[11px] top-[35.5px] whitespace-nowrap">약물 상호작용·용량 가이드 질의</p>
    </div>
  );
}

function IconBox3() {
  return (
    <div className="absolute bg-[#e6f1fb] left-[15.5px] overflow-clip rounded-[6px] size-[28px] top-[17.5px]" data-name="IconBox">
      <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_Symbols2:Regular',sans-serif] font-semibold leading-[normal] left-[8px] not-italic text-[#0c447c] text-[14px] top-[5px] whitespace-nowrap">▦</p>
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute bg-white border-[#dbdbde] border-[0.5px] border-solid h-[64px] left-[19.5px] overflow-clip rounded-[8px] top-[363.5px] w-[400px]" data-name="Card">
      <IconBox3 />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[55.5px] not-italic text-[#212121] text-[13px] top-[13.5px] whitespace-nowrap">통계 조회</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[55.5px] not-italic text-[#6b6b6b] text-[11px] top-[35.5px] whitespace-nowrap">이번 달 진료·매출 현황</p>
    </div>
  );
}

function InputBg() {
  return <div className="absolute bg-white h-[80px] left-[-0.5px] top-[639.5px] w-[440px]" data-name="InputBg" />;
}

function InputBorder() {
  return <div className="absolute bg-[#dbdbde] h-px left-[-0.5px] top-[639.5px] w-[440px]" data-name="InputBorder" />;
}

function InputBox() {
  return (
    <div className="absolute bg-white border-[#dbdbde] border-[0.5px] border-solid h-[44px] left-[19.5px] overflow-clip rounded-[22px] top-[657.5px] w-[360px]" data-name="InputBox">
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[19.5px] not-italic text-[#999] text-[13px] top-[13.5px] whitespace-nowrap">무엇이든 물어보세요...</p>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white border-[#dbdbde] border-[0.5px] border-solid overflow-clip relative rounded-[12px] size-full" data-name="2. 첫 진입 — 추천 작업 카드">
      <Header />
      <HeaderBorder />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[normal] left-[19.5px] not-italic text-[#212121] text-[15px] top-[79.5px] w-[400px]">안녕하세요. 무엇을 도와드릴까요?</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[19.5px] not-italic text-[#6b6b6b] text-[12px] top-[107.5px] w-[400px]">자주 쓰는 작업이나 무엇이든 자유롭게 말해주세요.</p>
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
      <InputBg />
      <InputBorder />
      <InputBox />
      <div className="absolute left-[387.5px] size-[32px] top-[663.5px]" data-name="SendBtn">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" fill="var(--fill-0, #534AB7)" id="SendBtn" r="16" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[396.5px] not-italic text-[14px] text-white top-[670.5px] whitespace-nowrap">↑</p>
    </div>
  );
}