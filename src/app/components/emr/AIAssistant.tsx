// AI 어시스턴트 패널 — 빠른메뉴 등록 6단계 플로우
import { useState, useEffect, useRef } from "react";

type Step = "home" | "analyzing" | "confirm" | "complete" | "use-menu";

const PRESET_MSG = "위내시경 예약 후 공복 안내 문자를 3일 전, 1일 전에 보내줘";
const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f1efe8] rounded-[8px] px-3 py-3 max-w-[320px] text-[13px] text-[#212121] leading-[20px]">
      {children}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#534ab7] rounded-[8px] px-3 py-3 max-w-[320px] text-[13px] text-white leading-[20px] self-end ml-auto">
      {children}
    </div>
  );
}

function InputArea({
  value = "",
  onChange,
  onSend,
  placeholder = "무엇이든 물어보세요...",
  disabled = false,
}: {
  value?: string;
  onChange?: (v: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const active = !disabled && value.trim().length > 0;
  return (
    <div className="border-t border-[#dbdbde] bg-white px-5 py-4 flex items-center gap-2.5 flex-shrink-0">
      <div className="flex-1 border border-[#dbdbde] rounded-[22px] h-[44px] flex items-center px-5 bg-white overflow-hidden">
        {disabled ? (
          <span className="text-[13px] text-[#999]">{placeholder}</span>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && active && onSend?.()}
            placeholder={placeholder}
            className="w-full text-[13px] text-[#212121] placeholder-[#999] outline-none bg-transparent"
          />
        )}
      </div>
      <button
        onClick={active ? onSend : undefined}
        className={`w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          active ? "bg-[#534ab7] hover:bg-[#4338a8]" : "bg-[#f0f0f0]"
        }`}
      >
        <span className={`text-[14px] font-bold leading-none ${active ? "text-white" : "text-[#999]"}`}>↑</span>
      </button>
    </div>
  );
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 h-[56px] border-b border-[#dbdbde] flex-shrink-0 bg-white">
      <div className="flex items-center gap-2.5">
        <div className="w-[18px] h-[18px] bg-[#534ab7] rounded-[4px] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-bold leading-none">✦</span>
        </div>
        <span className="text-[14px] font-medium text-[#212121]">AI 어시스턴트</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#999] text-[14px] hover:text-[#555] leading-none w-5 h-5 flex items-center justify-center">—</button>
        <button onClick={onClose} className="text-[#999] text-[14px] hover:text-[#555] leading-none w-5 h-5 flex items-center justify-center">✕</button>
      </div>
    </div>
  );
}

// ─── Screen 2: Home ──────────────────────────────────────────────────────────

const CARDS = [
  {
    icon: "⊕", iconBg: "#eeedfe", iconColor: "#3c3489",
    title: "빠른메뉴 만들기", desc: "자주 하는 작업을 한 번에 등록", badge: "새기능",
    id: "quick",
  },
  {
    icon: "◎", iconBg: "#e1f5ee", iconColor: "#085041",
    title: "환자 찾기", desc: "이름·증상·진료 시점으로 검색",
    id: "patient",
  },
  {
    icon: "℞", iconBg: "#faede8", iconColor: "#712b13",
    title: "처방 도우미", desc: "약물 상호작용·용량 가이드 질의",
    id: "rx",
  },
  {
    icon: "▦", iconBg: "#e6f1fb", iconColor: "#0c447c",
    title: "통계 조회", desc: "이번 달 진료·매출 현황",
    id: "stat",
  },
];

function HomeScreen({
  onQuickMenu, inputValue, setInputValue, onSend,
}: {
  onQuickMenu: () => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-2">
        <p className="text-[15px] font-medium text-[#212121] mb-1.5">안녕하세요. 무엇을 도와드릴까요?</p>
        <p className="text-[12px] text-[#6b6b6b] mb-5">자주 쓰는 작업이나 무엇이든 자유롭게 말해주세요.</p>
        <div className="flex flex-col gap-2.5">
          {CARDS.map((card) => (
            <button
              key={card.id}
              onClick={card.id === "quick" ? onQuickMenu : undefined}
              className="flex items-center gap-3 w-full bg-white border border-[#dbdbde] rounded-[8px] px-4 h-[64px] hover:border-[#534ab7] hover:bg-[#fafafe] transition-colors text-left relative"
            >
              <div
                className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center flex-shrink-0 text-[14px] font-semibold"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[13px] font-medium text-[#212121]">{card.title}</span>
                <span className="text-[11px] text-[#6b6b6b]">{card.desc}</span>
              </div>
              {card.badge && (
                <div className="bg-[#eeedfe] rounded-[6px] px-1.5 py-0.5">
                  <span className="text-[10px] font-medium text-[#3c3489]">{card.badge}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <InputArea value={inputValue} onChange={setInputValue} onSend={onSend} placeholder="무엇이든 물어보세요..." />
    </>
  );
}

// ─── Screen 3: Analyzing ─────────────────────────────────────────────────────

function AnalyzingScreen({ phase, message }: { phase: number; message: string }) {
  const steps = [
    { label: "✓  의도 파악 완료", color: "#212121" },
    { label: "✓  필요한 기능 확인 (예약 + 알림톡)", color: "#212121" },
    { label: "⏳  누락된 정보 확인 중...", color: "#6b6b6b" },
  ];
  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 flex flex-col gap-3">
        <AiBubble>
          <p>어떤 작업을 빠른메뉴로 만들고 싶으세요?</p>
          <p>자유롭게 적어주시면 정리해드릴게요.</p>
          <p className="text-[11px] text-[#999] mt-1.5">
            예: "위내시경 예약 후 공복 안내 문자를 3일 전, 1일 전에 보내줘"
          </p>
        </AiBubble>
        <UserBubble>{message}</UserBubble>
        <div className="bg-[#f1efe8] rounded-[8px] px-3 py-3 max-w-[320px]">
          <p className="text-[11px] font-medium text-[#6b6b6b] mb-2.5">분석 중...</p>
          {steps.map((s, i) =>
            phase > i ? (
              <p
                key={i}
                className="text-[13px] mb-1 last:mb-0 transition-all"
                style={{ color: s.color }}
              >
                {s.label}
              </p>
            ) : null
          )}
        </div>
      </div>
      <InputArea disabled placeholder="메시지 입력..." />
    </>
  );
}

// ─── Screen 4: Confirm ───────────────────────────────────────────────────────

const RECOG_ROWS = [
  { label: "예약실", value: "1 진료실" },
  { label: "예약 유형", value: "위내시경", dot: "#D85A30" },
  { label: "진료의", value: "김현호" },
  { label: "발송 횟수", value: "방문 3일 전, 1일 전" },
];

const TMPL_3 = ["공복 안내 - 위내시경 (표준형)", "공복 안내 - 위내시경 (간단형)", "전용 안내문 (원장님 지정)"];
const TMPL_1 = ["전날 최종 확인 (표준)", "전날 최종 확인 (간단)", "당일 방문 안내"];

// ─── Chat-style Confirm Screen (Q&A 형식) ────────────────────────────────────

type ConfirmSub = "tmpl3" | "tmpl1" | "time" | "review";

function formatTimeLabel(hhmm: string) {
  // "10:00" → "오전 10시" / "14:30" → "오후 2시 30분"
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr); const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const ampm = h < 12 ? "오전" : "오후";
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${ampm} ${hh}시` : `${ampm} ${hh}시 ${m}분`;
}

function ChoiceList({
  templates, onPick, onDirect,
}: { templates: string[]; onPick: (t: string) => void; onDirect: () => void }) {
  return (
    <div className="flex flex-col gap-2 self-end ml-auto max-w-[320px] w-full">
      {templates.map((t) => (
        <button
          key={t}
          onClick={() => onPick(t)}
          className="text-[12px] text-left bg-white border border-[#dbdbde] hover:border-[#534ab7] hover:bg-[#f9f8ff] rounded-[8px] px-3 py-2.5 transition-colors"
        >
          <span className="text-[#534ab7] font-medium mr-1">📋</span>{t}
        </button>
      ))}
      <button
        onClick={onDirect}
        className="text-[12px] text-left bg-white border border-dashed border-[#534ab7] hover:bg-[#f9f8ff] text-[#534ab7] rounded-[8px] px-3 py-2.5 transition-colors"
      >
        ✏️ 직접 입력하기
      </button>
    </div>
  );
}

function DirectComposer({
  value, setValue, onSend, onCancel, placeholder,
}: {
  value: string; setValue: (v: string) => void;
  onSend: () => void; onCancel: () => void; placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2 self-end ml-auto max-w-[320px] w-full bg-white border border-[#534ab7] rounded-[8px] p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="text-[12px] resize-none outline-none border border-[#dbdbde] rounded-[6px] p-2 min-h-[64px] focus:border-[#534ab7]"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11px] text-[#6b6b6b] hover:text-[#212121] px-2">취소</button>
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="text-[11px] bg-[#534ab7] text-white px-3 py-1 rounded-[6px] disabled:bg-[#cbcae3] disabled:cursor-not-allowed"
        >
          전송
        </button>
      </div>
    </div>
  );
}

function ConfirmScreen({
  initialMessage, onBack, onSave,
}: {
  initialMessage: string;
  onBack: () => void;
  onSave: (data: { template3: string; template1: string; sendTime: string }) => void;
}) {
  const [sub, setSub] = useState<ConfirmSub>("tmpl3");
  const [template3, setT3] = useState("");
  const [template1, setT1] = useState("");
  const [sendTime, setSendTime] = useState("");

  // 직접 입력 모드 토글 + 임시 입력값
  const [direct3Mode, setDirect3Mode] = useState(false);
  const [direct3Text, setDirect3Text] = useState("");
  const [direct1Mode, setDirect1Mode] = useState(false);
  const [direct1Text, setDirect1Text] = useState("");
  const [directTimeMode, setDirectTimeMode] = useState(false);
  const [directTimeVal, setDirectTimeVal] = useState("10:00");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // 새 버블이 추가되면 스크롤 하단으로
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [sub, template3, template1, sendTime, direct3Mode, direct1Mode, directTimeMode]);

  const pick3 = (t: string) => { setT3(t); setSub("tmpl1"); };
  const send3 = () => { if (direct3Text.trim()) { setT3(direct3Text.trim()); setSub("tmpl1"); } };
  const pick1 = (t: string) => { setT1(t); setSub("time"); };
  const send1 = () => { if (direct1Text.trim()) { setT1(direct1Text.trim()); setSub("time"); } };
  const pickTime = (label: string) => { setSendTime(label); setSub("review"); };

  const showQ2 = sub === "tmpl1" || sub === "time" || sub === "review";
  const showQ3 = sub === "time" || sub === "review";
  const showReview = sub === "review";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-5 pb-4 flex flex-col gap-3">
        {/* 사용자 최초 메시지 */}
        <UserBubble>{initialMessage}</UserBubble>

        {/* AI 분석 응답 */}
        <AiBubble>분석을 마쳤어요. 이렇게 인식했어요 👇</AiBubble>

        {/* 인식 카드 */}
        <div className="bg-[#f8fbf9] border border-[#9fe1cb] rounded-[8px] p-3 self-start max-w-[320px]">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-[14px] h-[14px] bg-[#1D9E75] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold leading-none">✓</span>
            </div>
            <span className="text-[11px] font-medium text-[#08342a]">예약 + 알림 자동화</span>
          </div>
          {RECOG_ROWS.map((row, i) => (
            <div key={row.label} className={`flex items-center py-1 ${i === 0 ? "" : "border-t border-[#e6f4ee]"}`}>
              <span className="text-[11px] text-[#6b6b6b] w-[68px] flex-shrink-0">{row.label}</span>
              <div className="flex items-center gap-1.5">
                {row.dot && <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: row.dot }} />}
                <span className="text-[11px] font-medium text-[#212121]">{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* === Q1: 3일 전 문자 === */}
        <AiBubble>
          <p className="font-medium mb-1">📨 3일 전엔 어떤 내용으로 보낼까요?</p>
          <p className="text-[12px] text-[#6b6b6b]">템플릿을 골라도 되고, 직접 적어도 돼요.</p>
        </AiBubble>

        {!template3 ? (
          direct3Mode ? (
            <DirectComposer
              value={direct3Text} setValue={setDirect3Text}
              onSend={send3}
              onCancel={() => { setDirect3Mode(false); setDirect3Text(""); }}
              placeholder="3일 전 발송할 문자 내용을 직접 입력해주세요"
            />
          ) : (
            <ChoiceList templates={TMPL_3} onPick={pick3} onDirect={() => setDirect3Mode(true)} />
          )
        ) : (
          <UserBubble>📋 {template3}</UserBubble>
        )}

        {/* === Q2: 1일 전 문자 === */}
        {showQ2 && (
          <AiBubble>
            <p className="font-medium mb-1">📨 1일 전 문자는 어떤 내용으로 보낼까요?</p>
            <p className="text-[12px] text-[#6b6b6b]">템플릿 또는 직접 입력 가능해요.</p>
          </AiBubble>
        )}
        {showQ2 && (
          !template1 ? (
            direct1Mode ? (
              <DirectComposer
                value={direct1Text} setValue={setDirect1Text}
                onSend={send1}
                onCancel={() => { setDirect1Mode(false); setDirect1Text(""); }}
                placeholder="1일 전 발송할 문자 내용을 직접 입력해주세요"
              />
            ) : (
              <ChoiceList templates={TMPL_1} onPick={pick1} onDirect={() => setDirect1Mode(true)} />
            )
          ) : (
            <UserBubble>📋 {template1}</UserBubble>
          )
        )}

        {/* === Q3: 발송 시각 === */}
        {showQ3 && (
          <AiBubble>
            <p className="font-medium mb-1">⏰ 몇 시에 보낼까요?</p>
            <p className="text-[12px] text-[#6b6b6b]">자주 쓰는 시각을 골라도 되고, 직접 지정할 수 있어요.</p>
          </AiBubble>
        )}
        {showQ3 && (
          !sendTime ? (
            directTimeMode ? (
              <div className="flex flex-col gap-2 self-end ml-auto max-w-[320px] w-full bg-white border border-[#534ab7] rounded-[8px] p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6b6b6b]">발송 시각</span>
                  <input
                    type="time"
                    value={directTimeVal}
                    onChange={(e) => setDirectTimeVal(e.target.value)}
                    className="flex-1 text-[13px] outline-none border border-[#dbdbde] rounded-[6px] px-2 py-1 focus:border-[#534ab7]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setDirectTimeMode(false)} className="text-[11px] text-[#6b6b6b] hover:text-[#212121] px-2">취소</button>
                  <button
                    onClick={() => pickTime(formatTimeLabel(directTimeVal))}
                    className="text-[11px] bg-[#534ab7] text-white px-3 py-1 rounded-[6px]"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 self-end ml-auto max-w-[320px] w-full">
                <div className="flex flex-wrap gap-2 justify-end">
                  {["오전 9시", "오전 10시", "오후 2시"].map((t) => (
                    <button
                      key={t}
                      onClick={() => pickTime(t)}
                      className="text-[12px] bg-white border border-[#dbdbde] hover:border-[#534ab7] hover:bg-[#f9f8ff] rounded-full px-4 py-1.5 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setDirectTimeMode(true)}
                  className="text-[12px] text-[#534ab7] hover:underline self-end"
                >
                  ✏️ 직접 시간 지정하기
                </button>
              </div>
            )
          ) : (
            <UserBubble>⏰ {sendTime}</UserBubble>
          )
        )}

        {/* === Review === */}
        {showReview && (
          <>
            <AiBubble>
              <p className="font-medium mb-1">✅ 이렇게 만들어드릴게요</p>
              <p className="text-[12px] text-[#6b6b6b]">아래 내용으로 빠른메뉴를 등록할까요?</p>
            </AiBubble>
            <div className="bg-[#f9f8ff] border border-[#ccc8f0] rounded-[8px] p-3 self-start max-w-[320px]">
              <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#e0deeb]">
                <span className="text-[10px] font-medium text-[#3c3489] bg-[#eeedfe] rounded-[4px] px-1.5 py-0.5">예약</span>
                <span className="text-[12px] font-medium text-[#212121]">위내시경 예약 + 공복 안내</span>
              </div>
              <div className="text-[11px] text-[#212121] flex flex-col gap-1.5">
                <div className="flex gap-1.5"><span className="text-[#888] flex-shrink-0">📨 3일 전</span><span className="break-words">{template3}</span></div>
                <div className="flex gap-1.5"><span className="text-[#888] flex-shrink-0">📨 1일 전</span><span className="break-words">{template1}</span></div>
                <div className="flex gap-1.5"><span className="text-[#888] flex-shrink-0">⏰ 발송시각</span><span>{sendTime}</span></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 — review 단계에서만 활성 */}
      <div className="flex gap-2 px-5 py-3 border-t border-[#dbdbde] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-[90px] h-[40px] border border-[#dbdbde] rounded-[8px] text-[13px] text-[#6b6b6b] flex-shrink-0 hover:bg-[#f7f7f7] transition-colors"
        >
          ← 처음으로
        </button>
        <button
          onClick={showReview ? () => onSave({ template3, template1, sendTime }) : undefined}
          disabled={!showReview}
          className={`flex-1 h-[40px] rounded-[8px] text-[13px] font-medium transition-colors ${
            showReview
              ? "bg-[#534ab7] text-white hover:bg-[#4338a8] cursor-pointer"
              : "bg-[#f0f0f0] text-[#999] cursor-not-allowed"
          }`}
        >
          {showReview ? "빠른메뉴로 저장하기" : "대화를 마치면 저장할 수 있어요"}
        </button>
      </div>
    </div>
  );
}

// ─── Screen 5: Complete ───────────────────────────────────────────────────────

function CompleteScreen({
  onUse, onMore, onOther,
}: { onUse: () => void; onMore: () => void; onOther: () => void }) {
  const follow = [
    {
      emoji: "▶", title: "지금 바로 사용해보기", sub: "날짜만 선택하면 예약·문자 자동 등록",
      onClick: onUse, accent: true,
    },
    {
      emoji: "⊕", title: "비슷한 메뉴 또 만들기", sub: "다른 검사도 같은 방식으로",
      onClick: onMore, accent: false,
    },
    {
      emoji: "↩", title: "다른 작업 하기", sub: "환자 검색·통계 등",
      onClick: onOther, accent: false,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-8 pb-5 flex flex-col">
      {/* 성공 아이콘 */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[56px] h-[56px] bg-[#E1F5EE] rounded-full flex items-center justify-center mb-4">
          <span className="text-[24px] text-[#085041] font-bold leading-none">✓</span>
        </div>
        <p className="text-[16px] font-medium text-[#212121] mb-1.5">빠른메뉴에 추가했어요</p>
        <p className="text-[12px] text-[#6b6b6b]">우측 빠른메뉴 영역에서 새 버튼을 확인하세요</p>
      </div>

      {/* 미리보기 */}
      <p className="text-[11px] text-[#999] mb-2">미리보기</p>
      <div className="border border-[#dbdbde] rounded-[8px] px-4 py-3 mb-6">
        <div className="mb-2">
          <span className="text-[10px] font-medium text-[#3c3489] bg-[#eeedfe] rounded-[4px] px-1.5 py-0.5">예약</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] rounded-full bg-[#D85A30] flex-shrink-0" />
          <span className="text-[13px] font-medium text-[#212121]">위내시경 예약 + 공복 안내</span>
        </div>
      </div>

      {/* 다음 작업 */}
      <p className="text-[11px] font-medium text-[#6b6b6b] mb-2.5">다음 작업</p>
      <div className="flex flex-col gap-2.5">
        {follow.map((f) => (
          <button
            key={f.title}
            onClick={f.onClick}
            className={`flex items-start gap-3 w-full rounded-[8px] px-4 py-3 text-left transition-colors ${
              f.accent
                ? "bg-[#eeedfe] border border-[#534ab7] hover:bg-[#e4e2fc]"
                : "bg-white border border-[#dbdbde] hover:border-[#999]"
            }`}
          >
            <span className={`text-[14px] font-bold mt-0.5 flex-shrink-0 ${f.accent ? "text-[#3c3489]" : "text-[#212121]"}`}>{f.emoji}</span>
            <div>
              <p className={`text-[13px] font-medium ${f.accent ? "text-[#26215c]" : "text-[#212121]"}`}>{f.title}</p>
              <p className={`text-[11px] mt-0.5 ${f.accent ? "text-[#3c3489]" : "text-[#6b6b6b]"}`}>{f.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 6: Use Menu ───────────────────────────────────────────────────────

function UseMenuScreen({
  selectedDate, setSelectedDate,
  selectedTimeSlot, setSelectedTimeSlot,
  onClose, onCancel,
}: {
  selectedDate: string; setSelectedDate: (v: string) => void;
  selectedTimeSlot: string; setSelectedTimeSlot: (v: string) => void;
  onClose: () => void; onCancel: () => void;
}) {
  const dateSelected = selectedDate !== "";
  const canReserve = dateSelected && selectedTimeSlot !== "";

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-[#dbdbde] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#534ab7] text-[14px] font-bold leading-none">✦</span>
          <span className="text-[15px] font-bold text-[#212121]">위내시경 예약 + 공복 안내</span>
        </div>
        <button onClick={onClose} className="text-[#999] text-[14px] hover:text-[#555] leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* 날짜 */}
        <div>
          <p className="text-[12px] font-medium text-[#212121] mb-2">📅 예약 날짜</p>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTimeSlot(""); }}
              className="w-full h-[38px] bg-[#faeeda] border border-[#ba7517] rounded-[6px] px-3 text-[13px] text-[#633806] outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* 시간 */}
        <div>
          <p className="text-[12px] font-medium text-[#212121] mb-2">⏰ 예약 시간</p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => dateSelected && setSelectedTimeSlot(slot)}
                  className={`h-[32px] rounded-[6px] border text-[12px] transition-colors ${
                    !dateSelected
                      ? "opacity-50 border-[#dbdbde] text-[#999] cursor-not-allowed"
                      : isSelected
                      ? "bg-[#eeedfe] border-[#534ab7] text-[#26215c] font-medium"
                      : "bg-white border-[#dbdbde] text-[#212121] hover:border-[#534ab7] cursor-pointer"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#dbdbde] flex-shrink-0">
        <button
          onClick={onCancel}
          className="w-[80px] h-[40px] border border-[#dbdbde] rounded-[8px] text-[13px] text-[#6b6b6b] hover:bg-[#f7f7f7] transition-colors"
        >
          취소
        </button>
        <button
          className={`w-[92px] h-[40px] rounded-[8px] text-[13px] font-bold transition-colors ${
            canReserve
              ? "bg-[#534ab7] text-white hover:bg-[#4338a8] cursor-pointer"
              : "bg-[#f0f0f0] text-[#999] cursor-not-allowed"
          }`}
        >
          예약
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AIAssistant({
  onClose,
  onAddQuickMenu,
}: {
  onClose: () => void;
  onAddQuickMenu?: (label: string, category: "예약" | "CRM" | "일수변경" | "즐겨찾기") => void;
}) {
  const [step, setStep] = useState<Step>("home");
  const [inputValue, setInputValue] = useState("");
  const [sentMessage, setSentMessage] = useState(PRESET_MSG);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerAnalysis = (msg?: string) => {
    clearTimers();
    if (msg) setSentMessage(msg);
    setStep("analyzing");
    setAnalysisPhase(0);
    timers.current = [
      setTimeout(() => setAnalysisPhase(1), 500),
      setTimeout(() => setAnalysisPhase(2), 1100),
      setTimeout(() => setAnalysisPhase(3), 1700),
      setTimeout(() => setStep("confirm"), 3000),
    ];
  };

  useEffect(() => () => clearTimers(), []);

  const handleSend = () => {
    const msg = inputValue.trim();
    if (!msg) return;
    triggerAnalysis(msg);
    setInputValue("");
  };

  const isUseMenu = step === "use-menu";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9995] bg-white border border-[#dbdbde] shadow-2xl flex flex-col overflow-hidden rounded-[12px] transition-all duration-300 ${
        isUseMenu ? "w-[400px]" : "w-[440px] h-[720px]"
      }`}
      style={{ fontFamily: "'Noto Sans KR', sans-serif", ...(isUseMenu ? { height: "auto" } : {}) }}
    >
      {/* 공통 헤더 (use-menu 제외) */}
      {!isUseMenu && <PanelHeader onClose={onClose} />}

      {step === "home" && (
        <HomeScreen
          onQuickMenu={() => triggerAnalysis(PRESET_MSG)}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={handleSend}
        />
      )}
      {step === "analyzing" && (
        <AnalyzingScreen phase={analysisPhase} message={sentMessage} />
      )}
      {step === "confirm" && (
        <ConfirmScreen
          initialMessage={sentMessage || PRESET_MSG}
          onBack={() => setStep("home")}
          onSave={(_data) => {
            // 빠른메뉴 패널의 "예약" 카테고리에 새 버튼 추가
            // (필요하면 _data.template3 / _data.template1 / _data.sendTime을
            //  상위로 전달해 메뉴별 메타데이터로 저장할 수 있음)
            onAddQuickMenu?.("위내시경 예약 + 공복 안내", "예약");
            setStep("complete");
          }}
        />
      )}
      {step === "complete" && (
        <CompleteScreen
          onUse={() => setStep("use-menu")}
          onMore={() => triggerAnalysis(PRESET_MSG)}
          onOther={() => setStep("home")}
        />
      )}
      {step === "use-menu" && (
        <UseMenuScreen
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          selectedTimeSlot={selectedTimeSlot} setSelectedTimeSlot={setSelectedTimeSlot}
          onClose={onClose}
          onCancel={() => setStep("complete")}
        />
      )}
    </div>
  );
}
