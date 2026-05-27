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

function AiBubble() {
  return (
    <div className="absolute bg-[#f1efe8] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[76px] left-[19.5px] not-italic overflow-clip rounded-[8px] top-[75.5px] w-[320px]" data-name="AIBubble1">
      <div className="absolute leading-[0] left-[12px] text-[#212121] text-[13px] top-[12px] w-[296px]">
        <p className="leading-[20px] mb-0">어떤 작업을 빠른메뉴로 만들고 싶으세요?</p>
        <p className="leading-[20px]">자유롭게 적어주시면 정리해드릴게요.</p>
      </div>
      <p className="absolute leading-[14px] left-[12px] text-[#999] text-[11px] top-[56px] w-[296px]">{`예: "위내시경 예약 후 공복 안내 문자를 3일 전, 1일 전에 보내줘"`}</p>
    </div>
  );
}

function UserBubble() {
  return (
    <div className="absolute bg-[#534ab7] h-[44px] left-[99.5px] overflow-clip rounded-[8px] top-[167.5px] w-[320px]" data-name="UserBubble">
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[13px] text-white top-[12px] w-[296px]">위내시경 예약 후 공복 안내 문자를 3일 전, 1일 전에 보내줘</p>
    </div>
  );
}

function AiBubble1() {
  return (
    <div className="absolute bg-[#f1efe8] h-[116px] leading-[normal] left-[19.5px] not-italic overflow-clip rounded-[8px] top-[231.5px] w-[320px]" data-name="AIBubble2">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium left-[12px] text-[#6b6b6b] text-[11px] top-[12px] whitespace-nowrap">분석 중...</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal left-[12px] text-[#212121] text-[13px] top-[36px] whitespace-pre">{`✓  의도 파악 완료`}</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal left-[12px] text-[#212121] text-[13px] top-[60px] whitespace-pre">{`✓  필요한 기능 확인 (예약 + 알림톡)`}</p>
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal left-[12px] text-[#6b6b6b] text-[13px] top-[84px] whitespace-pre">{`⏳  누락된 정보 확인 중...`}</p>
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
      <p className="absolute font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-[19.5px] not-italic text-[#999] text-[13px] top-[13.5px] whitespace-nowrap">메시지 입력...</p>
    </div>
  );
}

export default function Component3Ai() {
  return (
    <div className="bg-white border-[#dbdbde] border-[0.5px] border-solid overflow-clip relative rounded-[12px] size-full" data-name="3. 자연어 입력 + AI 분석 중">
      <Header />
      <HeaderBorder />
      <AiBubble />
      <UserBubble />
      <AiBubble1 />
      <InputBg />
      <InputBorder />
      <InputBox />
      <div className="absolute left-[387.5px] size-[32px] top-[663.5px]" data-name="SendBtn">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" fill="var(--fill-0, #F0F0F0)" id="SendBtn" r="16" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[396.5px] not-italic text-[#999] text-[14px] top-[670.5px] whitespace-nowrap">↑</p>
    </div>
  );
}