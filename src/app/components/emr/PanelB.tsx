// Panel B: 환자정보 + AI요약 + 바이탈 + 공유메모 통합 패널
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const vitals = [
  { date: "03-12", bp: "128/82", bpHigh: false, hr: 76, temp: 36.5 },
  { date: "02-28", bp: "135/88", bpHigh: false, hr: 72, temp: 36.7 },
  { date: "02-14", bp: "142/90", bpHigh: true,  hr: 80, temp: 36.8 },
];

const memos = [
  {
    id: 1,
    avatar: "이",
    avatarBg: "#dbeafe",
    avatarColor: "#2563eb",
    name: "이간호사",
    nameColor: "#2563eb",
    content: "자보 서류 제출 완료 확인",
    time: "3/14 11:20",
  },
  {
    id: 2,
    avatar: "박",
    avatarBg: "#fef3c7",
    avatarColor: "#d97706",
    name: "박데스크",
    nameColor: "#d97706",
    content: "보험사 담당자 연락처:\n010-9999-8888 (홍길동)",
    time: "3/15 14:00",
  },
];

export function PanelB() {
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <PanelGroup direction="vertical" className="w-full h-full">

      {/* ── 1. 환자정보 ── */}
      <Panel defaultSize={38} minSize={20}>
      <div className="bg-white rounded-md h-full overflow-hidden">
        <div className="px-3 py-1.5 border-b border-[#DBDCDF]">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-medium text-[#989BA2]">100236</span>
              <span className="text-[15px] font-bold text-[#171719]">황미진</span>
              <span className="text-[12px] text-[#70737C]">여 · 45세</span>
            </div>
            <div className="w-3.5 h-3.5 bg-[#989BA2] rounded-[3px] flex-shrink-0 mt-1" />
          </div>
          <span className="text-[10px] text-[#989BA2]">960101-2******</span>
        </div>

        {/* Verify Row */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-[#DBDCDF]">
          <div className="flex items-center gap-1 bg-[#EDF8EF] rounded-[4px] px-1.5 py-0.5">
            <div className="w-2 h-2 bg-[#4EAD0A] rounded-full" />
            <span className="text-[10px] font-medium text-[#4EAD0A] whitespace-nowrap">본인확인</span>
          </div>
          <div className="flex items-center gap-1 bg-[#EDF8EF] rounded-[4px] px-1.5 py-0.5">
            <div className="w-2 h-2 bg-[#4EAD0A] rounded-full" />
            <span className="text-[10px] font-medium text-[#4EAD0A] whitespace-nowrap">수진자조회</span>
          </div>
          <div className="flex items-center gap-1 bg-[#FBFAFF] border border-[#453EDC] rounded-[4px] px-1.5 py-0.5">
            <div className="w-2 h-2 bg-[#453EDC] rounded-full" />
            <span className="text-[10px] font-bold text-[#453EDC] whitespace-nowrap">공단검진 2</span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="border-b border-[#DBDCDF]">
          <div className="flex items-center px-3 h-[24px] border-b border-[#DBDCDF]">
            <span className="text-[11px] text-[#989BA2] w-[60px]">환자그룹</span>
            <span className="text-[12px] font-medium text-[#292A2D]">GC Cell</span>
          </div>
          <div className="flex items-center px-3 h-[26px] border-b border-[#DBDCDF]">
            <span className="text-[11px] text-[#989BA2] w-[60px]">환자유형</span>
            <div className="flex gap-1">
              <span className="text-[10px] font-medium text-[#6541F2] bg-[#F1EDFF] rounded-[3px] px-1.5 py-0.5">만성질환</span>
              <span className="text-[10px] font-medium text-[#3385FF] bg-[#EAF2FE] rounded-[3px] px-1.5 py-0.5">고혈압</span>
              <span className="text-[10px] font-medium text-[#FF4242] bg-[#FEECEC] rounded-[3px] px-1.5 py-0.5">당뇨</span>
            </div>
          </div>
          <div className="flex items-center px-3 h-[24px] border-b border-[#DBDCDF]">
            <span className="text-[11px] text-[#989BA2] w-[60px]">최근내원</span>
            <span className="text-[12px] font-medium text-[#292A2D]">2026-03-12</span>
          </div>
          <div className="flex items-center px-3 h-[24px] border-b border-[#DBDCDF]">
            <span className="text-[11px] text-[#989BA2] w-[60px]">예약일</span>
            <span className="text-[12px] font-medium text-[#FF4242]">2026-04-12</span>
          </div>
          <div className="flex items-center px-3 h-[26px]">
            <span className="text-[11px] text-[#989BA2] w-[60px]">처방금지</span>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="w-3.5 h-3.5 bg-[#FF4242] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold leading-none">!</span>
              </div>
              <span className="text-[11px] text-[#292A2D] truncate">페니실린, 조영제</span>
            </div>
          </div>
        </div>
      </div>
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[#453EDC]/30 active:bg-[#453EDC]/50 transition-colors" />

      {/* ── 2. AI 진료이력 요약 ── */}
      <Panel defaultSize={14} minSize={8}>
      <div className="bg-[#FBFAFF] rounded-md h-full overflow-hidden px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#453EDC] text-[12px]">✨</span>
            <span className="text-[12px] font-bold text-[#292A2D]">AI 진료이력 요약</span>
          </div>
          <button className="text-[10px] text-[#453EDC] font-medium">더보기 ›</button>
        </div>
        <p className="text-[11px] text-[#46474C] leading-[17px]">
          당뇨·고혈압 정기 관리 중. 메트포르민·라미프릴 장기복용. 최근 HbA1c 7.2% (3개월전). 9/20일자 알러지 검사 결과 확인 필요.
        </p>
      </div>
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[#453EDC]/30 active:bg-[#453EDC]/50 transition-colors" />

      {/* ── 3. 최근 바이탈 ── */}
      <Panel defaultSize={18} minSize={10}>
      <div className="bg-white rounded-md h-full overflow-hidden">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-[12px] font-bold text-[#292A2D]">최근 바이탈</span>
          <button className="text-[10px] text-[#989BA2] hover:text-[#453EDC]">+ 기록</button>
        </div>
        <div className="px-3 pb-2">
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
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[#453EDC]/30 active:bg-[#453EDC]/50 transition-colors" />

      {/* ── 4. 공유메모 ── */}
      <Panel defaultSize={30} minSize={15}>
      <div className="bg-white rounded-md overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-[10.5px] py-[7px] border-b border-[#EAEBEC] flex-shrink-0">
          <div className="flex items-center gap-[4px]">
            <svg width="14" height="14" viewBox="0 0 9 9" fill="none">
              <path d="M6.22917 0.5H2.33333C1.8471 0.5 1.38079 0.693154 1.03697 1.03697C0.693154 1.38079 0.5 1.8471 0.5 2.33333V6.22917C0.5 6.7154 0.693154 7.18171 1.03697 7.52553C1.38079 7.86935 1.8471 8.0625 2.33333 8.0625H5.46971C5.71052 8.06251 5.94898 8.01507 6.17146 7.92291C6.39394 7.83074 6.59608 7.69564 6.76633 7.52533L7.52533 6.76633C7.69564 6.59608 7.83074 6.39394 7.92291 6.17146C8.01507 5.94898 8.06251 5.71052 8.0625 5.46971V2.33333C8.0625 1.8471 7.86935 1.38079 7.52553 1.03697C7.18171 0.693154 6.7154 0.5 6.22917 0.5Z" stroke="#989BA2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.0625 5.08333H6.45833C6.09366 5.08333 5.74392 5.2282 5.48606 5.48606C5.2282 5.74392 5.08333 6.09366 5.08333 6.45833V8.0625M2.33333 2.33333H5.77083M2.33333 4.16667H4.625" stroke="#989BA2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-[3px]">
              <span className="text-[12px] font-bold text-black">공유 메모</span>
              <div className="w-[8px] h-[8px] rounded-full bg-[#FFA200]" />
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#989BA2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
            <path d="M14 14L11.1333 11.1333" stroke="#989BA2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
          </svg>
        </div>

        {/* Notice Accordion */}
        <div className="border-b border-[#EAEBEC] flex-shrink-0">
          <button
            className="w-full bg-[#fffbeb] flex items-center justify-between px-[8px] py-[5px]"
            onClick={() => setNoticeOpen((v) => !v)}
          >
            <div className="flex items-center gap-[5px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="rotate-45 flex-shrink-0">
                <path d="M5 7.08333V9.16667" stroke="#D97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
                <path d="M3.75 4.48333C3.74992 4.63837 3.70659 4.79031 3.62488 4.92206C3.54318 5.05382 3.42634 5.16018 3.2875 5.22917L2.54583 5.60417C2.40699 5.67316 2.29015 5.77951 2.20845 5.91127C2.12675 6.04303 2.08342 6.19496 2.08333 6.35V6.66667C2.08333 6.77717 2.12723 6.88315 2.20537 6.96129C2.28351 7.03943 2.38949 7.08333 2.5 7.08333H7.5C7.61051 7.08333 7.71649 7.03943 7.79463 6.96129C7.87277 6.88315 7.91667 6.77717 7.91667 6.66667V6.35C7.91658 6.19496 7.87325 6.04303 7.79155 5.91127C7.70985 5.77951 7.59301 5.67316 7.45417 5.60417L6.7125 5.22917C6.57366 5.16018 6.45682 5.05382 6.37512 4.92206C6.29341 4.79031 6.25008 4.63837 6.25 4.48333V2.91667C6.25 2.80616 6.2939 2.70018 6.37204 2.62204C6.45018 2.5439 6.55616 2.5 6.66667 2.5C6.88768 2.5 7.09964 2.4122 7.25592 2.25592C7.4122 2.09964 7.5 1.88768 7.5 1.66667C7.5 1.44565 7.4122 1.23369 7.25592 1.07741C7.09964 0.921131 6.88768 0.833333 6.66667 0.833333H3.33333C3.11232 0.833333 2.90036 0.921131 2.74408 1.07741C2.5878 1.23369 2.5 1.44565 2.5 1.66667C2.5 1.88768 2.5878 2.09964 2.74408 2.25592C2.90036 2.4122 3.11232 2.5 3.33333 2.5C3.44384 2.5 3.54982 2.5439 3.62796 2.62204C3.7061 2.70018 3.75 2.80616 3.75 2.91667V4.48333Z" stroke="#D97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
              </svg>
              <span className="text-[11px] font-medium text-[#92400e]">공지 1건</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d={noticeOpen ? "M9 7.5L6 4.5L3 7.5" : "M3 4.5L6 7.5L9 4.5"}
                stroke="#92400E" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
          {noticeOpen && (
            <div className="bg-[#fffdf7] px-[10.5px] pb-[6px]">
              <div className="flex items-start gap-[5px] pt-[5px]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="rotate-45 flex-shrink-0 mt-[3px]">
                  <path d="M5 7.08333V9.16667" stroke="#D97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
                  <path d="M3.75 4.48333C3.74992 4.63837 3.70659 4.79031 3.62488 4.92206C3.54318 5.05382 3.42634 5.16018 3.2875 5.22917L2.54583 5.60417C2.40699 5.67316 2.29015 5.77951 2.20845 5.91127C2.12675 6.04303 2.08342 6.19496 2.08333 6.35V6.66667C2.08333 6.77717 2.12723 6.88315 2.20537 6.96129C2.28351 7.03943 2.38949 7.08333 2.5 7.08333H7.5C7.61051 7.08333 7.71649 7.03943 7.79463 6.96129C7.87277 6.88315 7.91667 6.77717 7.91667 6.66667V6.35C7.91658 6.19496 7.87325 6.04303 7.79155 5.91127C7.70985 5.77951 7.59301 5.67316 7.45417 5.60417L6.7125 5.22917C6.57366 5.16018 6.45682 5.05382 6.37512 4.92206C6.29341 4.79031 6.25008 4.63837 6.25 4.48333V2.91667C6.25 2.80616 6.2939 2.70018 6.37204 2.62204C6.45018 2.5439 6.55616 2.5 6.66667 2.5C6.88768 2.5 7.09964 2.4122 7.25592 2.25592C7.4122 2.09964 7.5 1.88768 7.5 1.66667C7.5 1.44565 7.4122 1.23369 7.25592 1.07741C7.09964 0.921131 6.88768 0.833333 6.66667 0.833333H3.33333C3.11232 0.833333 2.90036 0.921131 2.74408 1.07741C2.5878 1.23369 2.5 1.44565 2.5 1.66667C2.5 1.88768 2.5878 2.09964 2.74408 2.25592C2.90036 2.4122 3.11232 2.5 3.33333 2.5C3.44384 2.5 3.54982 2.5439 3.62796 2.62204C3.7061 2.70018 3.75 2.80616 3.75 2.91667V4.48333Z" stroke="#D97706" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
                </svg>
                <div className="flex flex-col gap-[2px]">
                  <p className="text-[12px] text-[#292a2d] leading-[16.5px]">건보/자보 동시 진행 환자 — 차트 분리하여 청구</p>
                  <div className="flex items-center gap-[3.5px]">
                    <span className="text-[10px] font-medium text-[#b45309]">김원장</span>
                    <span className="text-[10px] text-[#aeb0b6]">3/12 10:00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[8.75px] pl-[10.5px] pr-[8px] pt-[7px] pb-[4px]">
          {memos.map((m) => (
            <div key={m.id} className="flex items-start gap-[5.25px]">
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ backgroundColor: m.avatarBg, color: m.avatarColor }}
              >
                {m.avatar}
              </div>
              <div className="flex flex-col gap-0">
                <span className="text-[10px] font-medium pl-[1.75px]" style={{ color: m.nameColor }}>{m.name}</span>
                <div className="bg-[#f7f7f8] rounded-bl-[8px] rounded-br-[8px] rounded-tl-[2px] rounded-tr-[8px] px-[8.75px] pt-[5.25px] pb-[5.25px] mt-[2px]">
                  <p className="text-[12px] text-[#292a2d] leading-[17px] whitespace-pre-line">{m.content}</p>
                </div>
                <span className="text-[9px] text-[#aeb0b6] pl-[1.75px] mt-[2px]">{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Memo Input */}
        <div className="border-t border-[#EAEBEC] px-[7px] pt-[5.917px] pb-[7px] flex-shrink-0">
          <div className="flex items-end gap-[5.25px]">
            <div className="flex-1 border border-[#dbdcdf] rounded-[6px] px-[8.75px] py-[5.25px] h-[30px] flex items-center">
              <span className="text-[12px] text-[rgba(41,42,45,0.5)]">메모 입력...</span>
            </div>
            <div className="w-[30px] h-[30px] bg-[#ede8ff] rounded-[6px] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <g clipPath="url(#clip_send_b)">
                  <path d="M7.87367 11.7466C7.89425 11.7979 7.93002 11.8416 7.97619 11.872C8.02236 11.9024 8.07671 11.9179 8.13196 11.9165C8.1872 11.9151 8.24069 11.8968 8.28524 11.8641C8.32979 11.8314 8.36328 11.7859 8.38121 11.7336L11.902 1.44192C11.9194 1.39392 11.9227 1.34198 11.9116 1.29218C11.9005 1.24237 11.8754 1.19675 11.8393 1.16067C11.8032 1.12459 11.7576 1.09953 11.7078 1.08842C11.658 1.07731 11.6061 1.08062 11.5581 1.09796L1.26642 4.61879C1.21414 4.63672 1.16861 4.67021 1.13591 4.71476C1.10322 4.75931 1.08494 4.8128 1.08353 4.86804C1.08211 4.92329 1.09763 4.97764 1.128 5.02381C1.15837 5.06998 1.20213 5.10575 1.25342 5.12633L5.54883 6.84883C5.68462 6.9032 5.808 6.9845 5.91151 7.08783C6.01503 7.19117 6.09656 7.31439 6.15117 7.45008L7.87367 11.7466Z" stroke="#7C3AED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333"/>
                  <path d="M11.8376 1.16296L5.91175 7.08825" stroke="#7C3AED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333"/>
                </g>
                <defs>
                  <clipPath id="clip_send_b"><rect fill="white" width="13" height="13"/></clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      </Panel>

    </PanelGroup>
  );
}