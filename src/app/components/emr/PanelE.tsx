// Panel E: 세트처방 + 빠른메뉴

import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const setCategories = [
  { label: "★ 즐겨찾기", cnt: 3 },
  { label: "일반", cnt: 14 },
  { label: "약품", cnt: 6 },
  { label: "주사", cnt: 4 },
  { label: "방사선", cnt: 4 },
  { label: "기능의학", cnt: 12, active: true },
  { label: "식대", cnt: 6 },
  { label: "치료재료", cnt: 5 },
  { label: "검체", cnt: 8 },
  { label: "처방세트", cnt: 5 },
];

type SetItem = {
  id: number;
  name: string;
  count: number;
  price: number;
  starred: boolean;
  items?: { name: string; price: number }[];
};

const setItems: SetItem[] = [
  {
    id: 1,
    name: "기능의학 기본세트 1",
    count: 5,
    price: 35000,
    starred: true,
    items: [
      { name: "푸르설타민주(마늘주사)", price: 15000 },
      { name: "비타민C 주사", price: 12000 },
      { name: "물리치료", price: 3600 },
      { name: "침", price: 2000 },
      { name: "부항", price: 2400 },
    ],
  },
  {
    id: 2,
    name: "기능의학 면역세트",
    count: 4,
    price: 48000,
    starred: false,
  },
  {
    id: 3,
    name: "뇌기능 검사 1세트",
    count: 3,
    price: 31000,
    starred: true,
  },
  {
    id: 4,
    name: "급성 기타감기 1세트",
    count: 4,
    price: 12500,
    starred: false,
  },
  {
    id: 5,
    name: "완성활골 원A",
    count: 2,
    price: 18000,
    starred: false,
  },
  {
    id: 6,
    name: "IV FORM3-1 영양수사",
    count: 3,
    price: 35000,
    starred: true,
  },
  {
    id: 7,
    name: "트릭기 감기 1세트",
    count: 5,
    price: 22000,
    starred: false,
  },
  {
    id: 8,
    name: "급성 기타감기 1세트 B",
    count: 3,
    price: 15000,
    starred: false,
  },
  {
    id: 9,
    name: "한성활혈 원B",
    count: 2,
    price: 9500,
    starred: false,
  },
];

export type QuickCategory = "전체" | "즐겨찾기" | "CRM" | "예약" | "일수변경";

export type QuickMenuItem = {
  label: string;
  category: QuickCategory;
  isNew?: boolean;
};

export const INIT_QUICK_MENU: QuickMenuItem[] = [
  { label: "1일 후 예약", category: "예약" },
  { label: "3일 후 예약", category: "예약" },
  { label: "1주 후 예약", category: "예약" },
  { label: "2주 후 예약", category: "예약" },
  { label: "3주 후 예약", category: "예약" },
  { label: "일수변경 1일", category: "일수변경" },
  { label: "일수변경 3일", category: "일수변경" },
  { label: "일수변경 4일", category: "일수변경" },
  { label: "내시경 검사결과 문자", category: "CRM" },
  { label: "혈액검사결과 문자", category: "CRM" },
  { label: "공복채혈 문자", category: "CRM" },
  { label: "공복채혈 안내문자", category: "CRM" },
];

const QUICK_CATEGORY_ORDER: { label: string; key: QuickCategory }[] = [
  { label: "전체", key: "전체" },
  { label: "★ 즐겨찾기", key: "즐겨찾기" },
  { label: "CRM", key: "CRM" },
  { label: "예약", key: "예약" },
  { label: "일수변경", key: "일수변경" },
];

// Category chip active colors
const catChipActive: Record<QuickCategory, string> = {
  "전체": "bg-[#453EDC] text-white border-[#453EDC]",
  "즐겨찾기": "bg-[#FF7B2E] text-white border-[#FF7B2E]",
  "CRM": "bg-[#3385FF] text-white border-[#3385FF]",
  "예약": "bg-[#2EA652] text-white border-[#2EA652]",
  "일수변경": "bg-[#E08A00] text-white border-[#E08A00]",
};

// Category chip inactive background colors
const catChipInactive: Record<QuickCategory, string> = {
  "전체": "bg-[#F7F7F8] text-[#46474C] border-[#DBDCDF]",
  "즐겨찾기": "bg-[#FFF7F0] text-[#FF7B2E] border-[#FFD0B0]",
  "CRM": "bg-[#EAF2FE] text-[#3385FF] border-[#B8D4FC]",
  "예약": "bg-[#EDF8EF] text-[#2EA652] border-[#B8E8C4]",
  "일수변경": "bg-[#FFF7E6] text-[#E08A00] border-[#FFD98A]",
};

// Quick menu button styles per category
const quickBtnStyle: Record<QuickCategory, string> = {
  "전체": "bg-[#F7F7F8] text-[#292A2D] border-[#DBDCDF]",
  "즐겨찾기": "bg-[#FFF7F0] text-[#FF7B2E] border-[#FFD0B0]",
  "CRM": "bg-[#EAF2FE] text-[#3385FF] border-[#B8D4FC]",
  "예약": "bg-[#EDF8EF] text-[#2EA652] border-[#B8E8C4]",
  "일수변경": "bg-[#FFF7E6] text-[#E08A00] border-[#FFD98A]",
};

export function PanelE({ quickMenuItems = INIT_QUICK_MENU }: { quickMenuItems?: QuickMenuItem[] } = {}) {
  const [expandedSet, setExpandedSet] = useState<number | null>(1);
  const [activeSetCat, setActiveSetCat] = useState("기능의학");
  const [activeQuickCat, setActiveQuickCat] = useState<QuickCategory>("전체");

  // Dynamically compute category counts from items
  const quickCategories = QUICK_CATEGORY_ORDER.map((c) => ({
    ...c,
    cnt: c.key === "전체"
      ? quickMenuItems.length
      : c.key === "즐겨찾기"
        ? 3 // 즐겨찾기는 별도 로직(데모: 고정값 유지)
        : quickMenuItems.filter((i) => i.category === c.key).length,
  }));

  const filteredQuickItems =
    activeQuickCat === "전체"
      ? quickMenuItems
      : quickMenuItems.filter((item) => item.category === activeQuickCat);

  return (
    <PanelGroup direction="vertical" className="w-full h-full">
      {/* E1: 세트처방 */}
      <Panel defaultSize={70} minSize={30}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#DBDCDF] flex-shrink-0">
          <span className="text-[12px] font-bold text-[#292A2D]">세트처방</span>
          <div className="flex items-center gap-1 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-7 flex-1">
            <div className="w-3 h-3 bg-[#989BA2] rounded-sm flex-shrink-0" />
            <span className="text-[10px] text-[#989BA2]">세트 검색</span>
          </div>
          <button className="w-6 h-6 border border-[#DBDCDF] rounded-[4px] flex items-center justify-center text-[11px] text-[#70737C]">⚙</button>
          <button className="w-5 h-5 border border-[#DBDCDF] bg-white rounded-[4px] flex items-center justify-center text-[#70737C] text-[13px]">+</button>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#DBDCDF] flex-shrink-0">
          {setCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveSetCat(cat.label.replace("★ ", "").split(" ")[0])}
              className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border whitespace-nowrap ${
                cat.active || activeSetCat === cat.label.split(" ")[0] || (cat.label === "기능의학" && activeSetCat === "기능의학")
                  ? "bg-[#453EDC] text-white border-[#453EDC] font-bold"
                  : "bg-[#F7F7F8] text-[#46474C] border-[#DBDCDF]"
              }`}
            >
              {cat.label}
              <span className={`text-[9px] font-bold ${cat.active ? "text-white" : "text-[#989BA2]"}`}>{cat.cnt}</span>
            </button>
          ))}
          <button className="text-[10px] text-[#453EDC] border border-[#453EDC] rounded-full px-2 py-0.5">+ 분류</button>
        </div>

        {/* Current Category Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#F7F7F8] border-b border-[#DBDCDF] flex-shrink-0">
          <span className="text-[11px] text-[#70737C]">기능의학 12개 묶음</span>
          <button className="text-[11px] text-[#70737C]">이름순 ▾</button>
        </div>

        {/* Set Item List */}
        <div className="flex-1 overflow-y-auto">
          {setItems.map((item) => (
            <div key={item.id} className="border-b border-[#DBDCDF]">
              {/* Set Item Row */}
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#F7F7F8] cursor-pointer">
                <span className={`text-[12px] ${item.starred ? "text-[#FF7B2E]" : "text-[#C2C4C8]"}`}>
                  {item.starred ? "★" : "☆"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-[#292A2D] truncate block">{item.name}</span>
                  {/* Count and price only shown when expanded */}
                  {expandedSet === item.id && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-[#989BA2]">{item.count}항목</span>
                      <span className="text-[10px] text-[#989BA2]">·</span>
                      <span className="text-[10px] text-[#453EDC]">{item.price.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setExpandedSet(expandedSet === item.id ? null : item.id)}
                  className="text-[11px] text-[#989BA2] px-1"
                >
                  {expandedSet === item.id ? "⌃" : "⌄"}
                </button>
                <button className="w-5 h-5 border border-[#DBDCDF] bg-white rounded-full flex items-center justify-center text-[#70737C] text-[12px] flex-shrink-0">
                  +
                </button>
              </div>

              {/* Expanded items */}
              {expandedSet === item.id && item.items && (
                <div className="bg-[#FBFAFF] border-t border-[#DBDCDF] px-4 py-2">
                  {item.items.map((sub) => (
                    <div key={sub.name} className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-[#292A2D]">{sub.name}</span>
                      <span className="text-[10px] text-[#989BA2]">{sub.price.toLocaleString()}원</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1 border-t border-[#DBDCDF] mt-1">
                    <span className="text-[11px] font-bold text-[#292A2D]">합계</span>
                    <span className="text-[11px] font-bold text-[#453EDC]">
                      {item.items.reduce((s, sub) => s + sub.price, 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[#453EDC]/30 active:bg-[#453EDC]/50 transition-colors" />

      {/* E2: 빠른메뉴 */}
      <Panel defaultSize={30} minSize={15}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#DBDCDF]">
          <span className="text-[12px] font-bold text-[#292A2D]">빠른 메뉴</span>
          <div className="flex items-center gap-1 bg-[#F7F7F8] border border-[#DBDCDF] rounded-[6px] px-2 h-7 flex-1">
            <div className="w-3 h-3 bg-[#989BA2] rounded-sm flex-shrink-0" />
            <span className="text-[10px] text-[#989BA2]">빠른 메뉴 검색</span>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#DBDCDF] flex-wrap">
          {quickCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveQuickCat(cat.key)}
              className={`flex items-center gap-0.5 text-[10px] rounded-full px-2 py-0.5 border whitespace-nowrap font-medium transition-colors ${
                activeQuickCat === cat.key
                  ? catChipActive[cat.key]
                  : catChipInactive[cat.key]
              }`}
            >
              {cat.label}
              <span className={`text-[9px] font-bold ml-0.5 ${activeQuickCat === cat.key ? "text-white opacity-80" : "opacity-70"}`}>
                {cat.cnt}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Menu Button Grid */}
        <div className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {filteredQuickItems.map((item) => (
              <button
                key={item.label}
                className={`relative text-[11px] border rounded-[6px] px-2 py-1.5 transition-colors whitespace-nowrap ${quickBtnStyle[item.category]} ${
                  item.isNew ? "ring-2 ring-[#534ab7] ring-offset-1" : ""
                }`}
              >
                {item.isNew && (
                  <span
                    className="absolute -top-1 -right-1 w-[6px] h-[6px] rounded-full bg-[#D85A30]"
                    aria-label="새로 추가됨"
                  />
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      </Panel>
    </PanelGroup>
  );
}