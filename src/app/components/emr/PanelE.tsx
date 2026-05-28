// Panel E: 묶음처방 + 공유메모 + 빠른메뉴

import { useState } from "react";
import { createPortal } from "react-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { SharedMemoCard } from "./PanelB";

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 빠른메뉴 — 자주 쓰는 액션을 한 번에 등록해두는 사용자별 단축 버튼
// ╚══════════════════════════════════════════════════════════════════════════════
export type QuickCategory = "전체" | "즐겨찾기" | "CRM" | "예약" | "일수변경";

export type QuickMenuItem = {
  label: string;
  category: QuickCategory;
  isNew?: boolean;
};

export const INIT_QUICK_MENU: QuickMenuItem[] = [
  { label: "1일 후 예약",          category: "예약" },
  { label: "3일 후 예약",          category: "예약" },
  { label: "1주 후 예약",          category: "예약" },
  { label: "2주 후 예약",          category: "예약" },
  { label: "3주 후 예약",          category: "예약" },
  { label: "일수변경 1일",         category: "일수변경" },
  { label: "일수변경 3일",         category: "일수변경" },
  { label: "일수변경 4일",         category: "일수변경" },
  { label: "내시경 검사결과 문자",  category: "CRM" },
  { label: "혈액검사결과 문자",     category: "CRM" },
  { label: "공복채혈 문자",        category: "CRM" },
  { label: "공복채혈 안내문자",     category: "CRM" },
];

const QUICK_CATEGORY_ORDER: { label: string; key: QuickCategory }[] = [
  { label: "전체",     key: "전체" },
  { label: "★ 즐겨찾기", key: "즐겨찾기" },
  { label: "CRM",       key: "CRM" },
  { label: "예약",       key: "예약" },
  { label: "일수변경",   key: "일수변경" },
];

// 카테고리별 칩 활성 색상 (선택된 카테고리)
const catChipActive: Record<QuickCategory, string> = {
  "전체":      "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]",
  "즐겨찾기":  "bg-[var(--orange-500)] text-white border-[var(--orange-500)]",
  "CRM":       "bg-[var(--blue-500)] text-white border-[var(--blue-500)]",
  "예약":      "bg-[var(--green-500)] text-white border-[var(--green-500)]",
  "일수변경":   "bg-[var(--orange-700)] text-white border-[var(--orange-700)]",
};

// 카테고리별 칩 비활성 색상 (subtle bg + 카테고리 컬러 텍스트)
const catChipInactive: Record<QuickCategory, string> = {
  "전체":      "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-default)]",
  "즐겨찾기":  "bg-[var(--orange-050)] text-[var(--orange-700)] border-[var(--orange-200)]",
  "CRM":       "bg-[var(--bg-primary-subtle)] text-[var(--blue-500)] border-[var(--blue-200)]",
  "예약":      "bg-[var(--green-050)] text-[var(--green-700)] border-[var(--green-200)]",
  "일수변경":   "bg-[var(--orange-050)] text-[var(--orange-700)] border-[var(--orange-200)]",
};

// 빠른메뉴 버튼 자체의 카테고리별 색상
const quickBtnStyle: Record<QuickCategory, string> = {
  "전체":      "bg-[var(--bg-subtle)] text-[var(--text-main)] border-[var(--line-default)]",
  "즐겨찾기":  "bg-[var(--orange-050)] text-[var(--orange-700)] border-[var(--orange-200)]",
  "CRM":       "bg-[var(--bg-primary-subtle)] text-[var(--blue-500)] border-[var(--blue-200)]",
  "예약":      "bg-[var(--green-050)] text-[var(--green-700)] border-[var(--green-200)]",
  "일수변경":   "bg-[var(--orange-050)] text-[var(--orange-700)] border-[var(--orange-200)]",
};

// ── 대분류 + 중분류 (2-depth taxonomy) ────────────────────────────
type MainCategory = { label: string; count: number; subs: { label: string; count: number }[] };

// 세트 카테고리 라벨 타입 — 필터·표시에서 사용. 묶음과 동일한 패턴.
type SetMainLabel = "★ 즐겨찾기" | "기본" | "예방접종" | "수액" | "검사";
// 세트 대분류 — 기본 / 예방접종 / 수액 / 검사 + ★ 즐겨찾기 (다른 패널과 일관).
// count 는 setItems 에서 동적으로 계산됨 (아래 SET_TAXONOMY 와 후속 derive 로직 참고).
const SET_TAXONOMY: Record<Exclude<SetMainLabel, "★ 즐겨찾기">, string[]> = {
  "기본":     ["일반진료", "정기관리", "만성질환", "알러지"],
  "예방접종": ["독감", "코로나", "폐렴구균", "대상포진", "어린이 필수"],
  "수액":     ["영양", "면역", "디톡스", "호르몬"],
  "검사":     ["혈액", "영상", "심전도", "초음파", "내시경"],
};

// 세트 항목 type — 처방뿐 아니라 증상·진단·특정내역 등 다양한 요소 포함 가능
type SetItemElementType = "증상" | "진단" | "처방" | "특정내역";
type SetItem = {
  id: number;
  // 사용자코드 — 묶음과 동일하게 알파벳·숫자 조합. 빠른 검색·키보드 입력 식별자.
  code: string;
  name: string;
  // 분류 — 필터링용. ★ 즐겨찾기는 별도 starred 필드로 결정되므로 category 는 실 카테고리.
  category: Exclude<SetMainLabel, "★ 즐겨찾기">;
  subCategory: string;
  count: number;
  price: number;
  starred: boolean;
  items?: { type?: SetItemElementType; name: string; price?: number }[];
};

const setItems: SetItem[] = [
  // ─── 기본 > 일반진료 ───
  {
    id: 1, code: "CLD-S1", name: "급성 기타감기 1세트",
    category: "기본", subCategory: "일반진료",
    count: 5, price: 12500, starred: true,
    items: [
      { type: "증상", name: "발열·인후통·기침" },
      { type: "진단", name: "J00 급성비인두염" },
      { type: "처방", name: "타이레놀이알서방정",  price: 2400 },
      { type: "처방", name: "코대원포르테시럽",    price: 6800 },
      { type: "특정내역", name: "MX012 감기 부가" },
    ],
  },
  { id: 10, code: "HDA-S1", name: "두통·어지러움 세트",     category: "기본", subCategory: "일반진료", count: 4, price: 11200, starred: false },
  { id: 11, code: "PHA-S1", name: "인후염 진료세트",        category: "기본", subCategory: "일반진료", count: 4, price: 9800,  starred: false },
  { id: 12, code: "GST-S1", name: "급성위장염 세트",        category: "기본", subCategory: "일반진료", count: 5, price: 13500, starred: false },
  { id: 13, code: "PAIN-1", name: "통증관리 1차 세트",      category: "기본", subCategory: "일반진료", count: 3, price: 10500, starred: false },

  // ─── 기본 > 정기관리 ───
  { id: 4,  code: "HTN-RC", name: "고혈압 정기관리 세트",    category: "기본", subCategory: "정기관리", count: 4, price: 15400, starred: false },
  { id: 7,  code: "DM-RC",  name: "당뇨 정기관리 세트",      category: "기본", subCategory: "정기관리", count: 5, price: 22000, starred: false },
  { id: 14, code: "LIP-RC", name: "고지혈증 정기관리",      category: "기본", subCategory: "정기관리", count: 4, price: 18200, starred: false },
  { id: 15, code: "THY-RC", name: "갑상선 정기관리",        category: "기본", subCategory: "정기관리", count: 4, price: 19500, starred: false },
  { id: 16, code: "OP-RC",  name: "골다공증 정기관리",      category: "기본", subCategory: "정기관리", count: 3, price: 16800, starred: false },

  // ─── 기본 > 만성질환 ───
  { id: 5,  code: "WHG-A",  name: "완성활골 원A",            category: "기본", subCategory: "만성질환", count: 2, price: 18000, starred: false },
  { id: 9,  code: "HSH-B",  name: "한성활혈 원B",            category: "기본", subCategory: "만성질환", count: 2, price: 9500,  starred: false },
  { id: 17, code: "CKD-1",  name: "만성콩팥병 관리세트",     category: "기본", subCategory: "만성질환", count: 5, price: 24500, starred: false },
  { id: 18, code: "COPD-1", name: "COPD 관리세트",          category: "기본", subCategory: "만성질환", count: 4, price: 19800, starred: false },

  // ─── 기본 > 알러지 ───
  { id: 8,  code: "ALG-S1", name: "알러지 1차 진료세트",     category: "기본", subCategory: "알러지",   count: 3, price: 15000, starred: false },
  { id: 19, code: "RHI-S1", name: "알러지 비염 관리세트",    category: "기본", subCategory: "알러지",   count: 4, price: 13600, starred: false },
  { id: 20, code: "ATD-S1", name: "아토피 관리세트",        category: "기본", subCategory: "알러지",   count: 4, price: 17400, starred: false },

  // ─── 예방접종 > 독감 ───
  { id: 30, code: "FLU-4V", name: "독감 4가 백신",          category: "예방접종", subCategory: "독감",       count: 1, price: 38000, starred: false },
  { id: 31, code: "FLU-3V", name: "독감 3가 백신",          category: "예방접종", subCategory: "독감",       count: 1, price: 28000, starred: false },

  // ─── 예방접종 > 코로나 ───
  { id: 32, code: "COV-B4", name: "코로나 부스터 4차",      category: "예방접종", subCategory: "코로나",     count: 1, price: 0,     starred: false },
  { id: 33, code: "COV-B5", name: "코로나 부스터 5차",      category: "예방접종", subCategory: "코로나",     count: 1, price: 0,     starred: false },

  // ─── 예방접종 > 폐렴구균 ───
  { id: 34, code: "PCV13",  name: "폐렴구균 13가 백신",     category: "예방접종", subCategory: "폐렴구균",   count: 1, price: 95000, starred: false },

  // ─── 예방접종 > 대상포진 ───
  { id: 35, code: "ZOST",   name: "대상포진 백신",          category: "예방접종", subCategory: "대상포진",   count: 1, price: 180000, starred: false },

  // ─── 예방접종 > 어린이 필수 ───
  { id: 36, code: "MMR",    name: "MMR (홍역·볼거리·풍진)", category: "예방접종", subCategory: "어린이 필수", count: 1, price: 32000, starred: false },
  { id: 37, code: "DTAP",   name: "DTaP (디·파·백)",        category: "예방접종", subCategory: "어린이 필수", count: 1, price: 28000, starred: false },
  { id: 38, code: "JEV",    name: "일본뇌염 백신",          category: "예방접종", subCategory: "어린이 필수", count: 1, price: 22000, starred: false },
  { id: 39, code: "VAR",    name: "수두 백신",              category: "예방접종", subCategory: "어린이 필수", count: 1, price: 38000, starred: false },

  // ─── 수액 > 영양 ───
  { id: 6,  code: "IV31",   name: "IV FORM3-1 영양수액",     category: "수액", subCategory: "영양",     count: 3, price: 35000, starred: true  },
  { id: 40, code: "NTR-A",  name: "종합영양수액 A",         category: "수액", subCategory: "영양",     count: 4, price: 42000, starred: false },
  { id: 41, code: "NTR-B",  name: "종합영양수액 B",         category: "수액", subCategory: "영양",     count: 4, price: 38000, starred: false },
  { id: 42, code: "VITM-X", name: "비타민 종합수액",        category: "수액", subCategory: "영양",     count: 3, price: 28000, starred: false },
  { id: 43, code: "PROT-S", name: "단백 수액 세트",         category: "수액", subCategory: "영양",     count: 3, price: 32000, starred: false },

  // ─── 수액 > 면역 ───
  {
    id: 2, code: "IMM-FM", name: "기능의학 면역세트",
    category: "수액", subCategory: "면역",
    count: 4, price: 48000, starred: false,
    items: [
      { type: "증상", name: "피로·면역력 저하" },
      { type: "처방", name: "비타민C 주사", price: 12000 },
      { type: "처방", name: "푸르설타민주 (마늘주사)", price: 15000 },
      { type: "처방", name: "글루타치온 주사", price: 21000 },
    ],
  },
  { id: 44, code: "IMM-A",  name: "면역강화 IV-A",          category: "수액", subCategory: "면역",     count: 3, price: 45000, starred: false },
  { id: 45, code: "IMM-B",  name: "면역강화 IV-B",          category: "수액", subCategory: "면역",     count: 3, price: 52000, starred: false },

  // ─── 수액 > 디톡스 ───
  { id: 46, code: "DTX-A",  name: "해독수액 A",             category: "수액", subCategory: "디톡스",   count: 3, price: 38000, starred: false },
  { id: 47, code: "DTX-B",  name: "해독수액 B (강력)",       category: "수액", subCategory: "디톡스",   count: 4, price: 55000, starred: false },

  // ─── 수액 > 호르몬 ───
  { id: 48, code: "HOR-BL", name: "호르몬 균형 수액",       category: "수액", subCategory: "호르몬",   count: 3, price: 48000, starred: false },
  { id: 49, code: "HOR-MN", name: "갱년기 수액 세트",       category: "수액", subCategory: "호르몬",   count: 4, price: 65000, starred: false },

  // ─── 검사 > 혈액 ───
  { id: 50, code: "CBC-A",  name: "종합 혈액검사 A",        category: "검사", subCategory: "혈액",     count: 5, price: 28000, starred: false },
  { id: 51, code: "CBC-B",  name: "종합 혈액검사 B (확장)", category: "검사", subCategory: "혈액",     count: 7, price: 42000, starred: false },
  { id: 52, code: "DM-LAB", name: "당뇨 혈액검사 패널",     category: "검사", subCategory: "혈액",     count: 4, price: 18500, starred: false },
  { id: 53, code: "THY-LB", name: "갑상선 혈액검사",        category: "검사", subCategory: "혈액",     count: 3, price: 22000, starred: false },
  { id: 54, code: "LFT",    name: "간기능 혈액검사",        category: "검사", subCategory: "혈액",     count: 4, price: 15800, starred: false },
  { id: 55, code: "KFT",    name: "신장기능 혈액검사",      category: "검사", subCategory: "혈액",     count: 4, price: 14200, starred: false },
  { id: 56, code: "LIPID",  name: "콜레스테롤 패널",        category: "검사", subCategory: "혈액",     count: 3, price: 9800,  starred: false },

  // ─── 검사 > 영상 ───
  { id: 3,  code: "NEU-S1", name: "뇌기능 검사 1세트",       category: "검사", subCategory: "영상",     count: 3, price: 31000, starred: true  },
  { id: 57, code: "CXR-S",  name: "흉부 X-ray 세트",        category: "검사", subCategory: "영상",     count: 2, price: 22000, starred: false },
  { id: 58, code: "ABD-IM", name: "복부 영상검사",          category: "검사", subCategory: "영상",     count: 3, price: 85000, starred: false },
  { id: 59, code: "SPN-IM", name: "척추 영상검사",          category: "검사", subCategory: "영상",     count: 3, price: 95000, starred: false },

  // ─── 검사 > 심전도 ───
  { id: 60, code: "EKG12",  name: "12-Lead 심전도",         category: "검사", subCategory: "심전도",   count: 1, price: 12000, starred: false },
  { id: 61, code: "STR-T",  name: "운동부하 심전도",        category: "검사", subCategory: "심전도",   count: 2, price: 65000, starred: false },
  { id: 62, code: "HOL24",  name: "24h Holter 검사",        category: "검사", subCategory: "심전도",   count: 2, price: 95000, starred: false },

  // ─── 검사 > 초음파 ───
  { id: 63, code: "THY-US", name: "갑상선 초음파",          category: "검사", subCategory: "초음파",   count: 1, price: 75000, starred: false },
  { id: 64, code: "ABD-US", name: "복부 초음파",            category: "검사", subCategory: "초음파",   count: 1, price: 80000, starred: false },
  { id: 65, code: "CAR-US", name: "심장 초음파",            category: "검사", subCategory: "초음파",   count: 2, price: 120000, starred: false },

  // ─── 검사 > 내시경 ───
  { id: 66, code: "EGD",    name: "위장 내시경 세트",       category: "검사", subCategory: "내시경",   count: 3, price: 145000, starred: false },
];

// 동적으로 카테고리 카운트 계산 — 데이터 변경 시 chip 카운트 자동 동기화.
// ★ 즐겨찾기는 starred=true 의 개수, 그 외는 category 별 개수.
const MAIN_CATEGORIES: MainCategory[] = (() => {
  const starredCount = setItems.filter(s => s.starred).length;
  const result: MainCategory[] = [
    { label: "★ 즐겨찾기", count: starredCount, subs: [{ label: "전체", count: starredCount }] },
  ];
  for (const [main, subs] of Object.entries(SET_TAXONOMY) as [
    Exclude<SetMainLabel, "★ 즐겨찾기">,
    string[]
  ][]) {
    const inMain = setItems.filter(s => s.category === main);
    result.push({
      label: main,
      count: inMain.length,
      subs: [
        { label: "전체", count: inMain.length },
        ...subs.map(sub => ({ label: sub, count: inMain.filter(s => s.subCategory === sub).length })),
      ],
    });
  }
  return result;
})();

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 묶음 (신규 탭) — 처방만 포함. 대분류: 약·주사·검사·치료재료 / 중분류: 질환별
// ╚══════════════════════════════════════════════════════════════════════════════
type BundleMainCategory = {
  label: "★ 즐겨찾기" | "약" | "주사" | "검사" | "치료재료";
  count: number;
  subs: { label: string; count: number }[];
};

const BUNDLE_CATEGORIES: BundleMainCategory[] = [
  // ★ 즐겨찾기 — bundleItems 중 starred=true 만 필터. 중분류 없이 "전체"만 노출.
  { label: "★ 즐겨찾기", count: 6, subs: [{ label: "전체", count: 6 }] },
  { label: "약", count: 14, subs: [
    { label: "전체", count: 14 }, { label: "고혈압", count: 4 }, { label: "당뇨", count: 3 },
    { label: "감기", count: 4 }, { label: "알러지", count: 2 }, { label: "위장", count: 1 },
  ]},
  { label: "주사", count: 8, subs: [
    { label: "전체", count: 8 }, { label: "영양", count: 3 }, { label: "면역", count: 2 },
    { label: "진통", count: 2 }, { label: "항생", count: 1 },
  ]},
  { label: "검사", count: 10, subs: [
    { label: "전체", count: 10 }, { label: "혈액", count: 4 }, { label: "영상", count: 3 },
    { label: "심전도", count: 2 }, { label: "초음파", count: 1 },
  ]},
  { label: "치료재료", count: 5, subs: [
    { label: "전체", count: 5 }, { label: "드레싱", count: 2 }, { label: "주사기", count: 2 }, { label: "기타", count: 1 },
  ]},
];

// 묶음 항목 — 단일 처방(약·주사·검사·치료재료) 단위로 플랫.
// 사용자가 대분류·중분류를 선택하면 해당 처방 목록이 쭉 노출됨 (묶음 제목 + 하위 약품 nesting 구조 X).
type BundleDrug = {
  id: number;
  code: string;
  name: string;
  category: BundleMainCategory["label"];
  subCategory: string;        // 질환명 또는 분류명
  dose?: string;              // 1회 용량
  days?: string;              // 일수
  price: number;
  starred: boolean;
};

const bundleItems: BundleDrug[] = [
  // 약 > 고혈압 — 일반명 기반 알파벳·숫자 코드 (성분 약어 + 용량)
  { id: 101, code: "AMLO5",     name: "노바스크정 5mg",       category: "약", subCategory: "고혈압", dose: "1", days: "30", price: 4200, starred: true  },
  { id: 102, code: "LOSA50",    name: "코자라르탄정 50mg",     category: "약", subCategory: "고혈압", dose: "1", days: "30", price: 4200, starred: false },
  { id: 103, code: "ATEN50",    name: "테노르민정 50mg",       category: "약", subCategory: "고혈압", dose: "1", days: "30", price: 3500, starred: false },
  { id: 104, code: "FURO40",    name: "라식스정 40mg",         category: "약", subCategory: "고혈압", dose: "1", days: "30", price: 3500, starred: false },
  // 약 > 당뇨
  { id: 110, code: "METF500",   name: "메트포민정 500mg",      category: "약", subCategory: "당뇨", dose: "1", days: "30", price: 3400, starred: true  },
  { id: 111, code: "GLIC30",    name: "디아미크론정 30mg",     category: "약", subCategory: "당뇨", dose: "1", days: "30", price: 3400, starred: false },
  { id: 112, code: "SITA100",   name: "자누비아정 100mg",      category: "약", subCategory: "당뇨", dose: "1", days: "30", price: 5200, starred: false },
  // 약 > 감기
  { id: 120, code: "ACET500",   name: "타이레놀이알서방정",     category: "약", subCategory: "감기", dose: "1", days: "3",  price: 2400, starred: false },
  { id: 121, code: "CDWN-F",    name: "코대원포르테시럽",      category: "약", subCategory: "감기", dose: "10", days: "3", price: 6800, starred: true  },
  { id: 122, code: "AMOX250",   name: "아목시실린 250mg",      category: "약", subCategory: "감기", dose: "1", days: "5",  price: 8200, starred: false },
  { id: 123, code: "CTZ10-C",   name: "지르텍정 10mg (감기)",  category: "약", subCategory: "감기", dose: "1", days: "5",  price: 7400, starred: false },
  // 약 > 알러지
  { id: 130, code: "CTZ10",     name: "지르텍정 10mg",         category: "약", subCategory: "알러지", dose: "1", days: "14", price: 7200, starred: false },
  { id: 131, code: "ALRP",      name: "알러파인정",            category: "약", subCategory: "알러지", dose: "1", days: "14", price: 6800, starred: false },
  // 약 > 위장
  { id: 140, code: "RANI150",   name: "잔탁정 150mg",          category: "약", subCategory: "위장", dose: "1", days: "14", price: 4200, starred: false },

  // 주사 > 영양
  { id: 201, code: "VITC-IV",   name: "비타민C 주사",          category: "주사", subCategory: "영양", dose: "1", days: "1", price: 12000, starred: true  },
  { id: 202, code: "PURS-IV",   name: "푸르설타민 (마늘주사)", category: "주사", subCategory: "영양", dose: "1", days: "1", price: 15000, starred: false },
  { id: 203, code: "GSH-IV",    name: "글루타치온 주사",        category: "주사", subCategory: "영양", dose: "1", days: "1", price: 21000, starred: false },
  // 주사 > 면역
  { id: 210, code: "IVIG",      name: "면역글로불린 IgG",      category: "주사", subCategory: "면역", dose: "1", days: "1", price: 28000, starred: false },
  { id: 211, code: "IFNa",      name: "인터페론 알파",          category: "주사", subCategory: "면역", dose: "1", days: "1", price: 42000, starred: false },
  // 주사 > 진통
  { id: 220, code: "KETOP-IV",  name: "케토프로펜 주사",       category: "주사", subCategory: "진통", dose: "1", days: "1", price: 8000, starred: false },
  { id: 221, code: "LIDO1",     name: "리도카인 1% 주사",      category: "주사", subCategory: "진통", dose: "1", days: "1", price: 6500, starred: false },
  // 주사 > 항생
  { id: 230, code: "PENG",      name: "페니실린 G 주사",        category: "주사", subCategory: "항생", dose: "1", days: "1", price: 9500, starred: false },

  // 검사 > 혈액
  { id: 301, code: "CBC",        name: "CBC 일반혈액검사",       category: "검사", subCategory: "혈액", dose: "1", days: "1", price: 8000, starred: false },
  { id: 302, code: "BST",        name: "공복혈당 검사",           category: "검사", subCategory: "혈액", dose: "1", days: "1", price: 4000, starred: true  },
  { id: 303, code: "Lipid",      name: "지질(콜레스테롤) 검사",   category: "검사", subCategory: "혈액", dose: "1", days: "1", price: 6000, starred: false },
  { id: 304, code: "HbA1c",      name: "당화혈색소 HbA1c",        category: "검사", subCategory: "혈액", dose: "1", days: "1", price: 9000, starred: true  },
  // 검사 > 영상
  { id: 310, code: "CXR",        name: "흉부 X-ray",              category: "검사", subCategory: "영상", dose: "1", days: "1", price: 15000, starred: false },
  { id: 311, code: "AbdUS",      name: "복부 초음파",              category: "검사", subCategory: "영상", dose: "1", days: "1", price: 80000, starred: false },
  { id: 312, code: "BrainCT",    name: "두부 CT",                  category: "검사", subCategory: "영상", dose: "1", days: "1", price: 120000, starred: false },
  // 검사 > 심전도
  { id: 320, code: "EKG12",      name: "12-Lead 심전도",          category: "검사", subCategory: "심전도", dose: "1", days: "1", price: 12000, starred: false },
  { id: 321, code: "Holter",     name: "24h Holter",              category: "검사", subCategory: "심전도", dose: "1", days: "1", price: 95000, starred: false },
  // 검사 > 초음파
  { id: 330, code: "ThyroidUS",  name: "갑상선 초음파",            category: "검사", subCategory: "초음파", dose: "1", days: "1", price: 75000, starred: false },

  // 치료재료 > 드레싱
  { id: 401, code: "GAUZE-S",   name: "멸균거즈",                category: "치료재료", subCategory: "드레싱", dose: "5", days: "1", price: 2500, starred: false },
  { id: 402, code: "TAPE-SG",   name: "외과용 테이프",            category: "치료재료", subCategory: "드레싱", dose: "1", days: "1", price: 3000, starred: false },
  // 치료재료 > 주사기
  { id: 410, code: "Syr5",       name: "5cc 주사기",              category: "치료재료", subCategory: "주사기", dose: "1", days: "1", price: 400,  starred: false },
  { id: 411, code: "Syr10",      name: "10cc 주사기",             category: "치료재료", subCategory: "주사기", dose: "1", days: "1", price: 500,  starred: false },
  // 치료재료 > 기타
  { id: 420, code: "Alcohol",    name: "알콜솜",                  category: "치료재료", subCategory: "기타",  dose: "1", days: "1", price: 200,  starred: false },
];

// ── 신규 묶음 등록 모달용 mock 데이터 ────────────────────────────────
// 실제 시스템에서는 현재 차트의 진단·처방을 그대로 가져와 prefill
type ModalDx = { code: string; name: string; dept: string; active?: boolean };
type ModalRx = {
  userCode: string; name: string;
  dose: string; per: string; days: string; usage: string;
  spec: string; claim: "청" | "비"; payment: string;
  sample: string; price: string; unit: string;
  billCode: string; exception: boolean; inHouse: boolean; powder: boolean;
};

const SAMPLE_DX: ModalDx[] = [
  { code: "L708", name: "기타 여드름",      dept: "피부과", active: true },
  { code: "L709", name: "상세불명의 여드름", dept: "피부과" },
];

const SAMPLE_RX: ModalRx[] = [
  { userCode: "doxy",    name: "영풍독시사이클린정100mg",   dose: "1", per: "1", days: "1", usage: "#1", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "661901…", exception: false, inHouse: false, powder: false },
  { userCode: "mino",    name: "미노씬캡슐50mg",           dose: "2", per: "2", days: "1", usage: "#2", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "644700…", exception: false, inHouse: false, powder: false },
  { userCode: "itt",     name: "이소티논연질캡슐10mg",      dose: "1", per: "1", days: "1", usage: "#1", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "643502…", exception: false, inHouse: false, powder: false },
  { userCode: "cleocin", name: "크레오신티외용액1%(외용)",  dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "652103…", exception: false, inHouse: false, powder: false },
  { userCode: "stieva1", name: "스티바에이크림0.01%(외용)", dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "650002…", exception: false, inHouse: false, powder: false },
  { userCode: "stieva2", name: "스티바에이크림0.025%(외용)",dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "650002…", exception: false, inHouse: false, powder: false },
];

// 토글 스위치 — 즐겨찾기 / 사용여부에 사용
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[var(--brand-primary)]" : "bg-[var(--text-disabled)]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// 표 헤더 셀 — 컴팩트하게 11px 굵은 글씨
function ThCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-sm font-bold text-[var(--text-sub)] text-left px-1.5 py-1.5 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function NewSetModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  // 기본 정보
  const [mainCat, setMainCat] = useState("선택안함");
  const [subCat, setSubCat] = useState("선택안함");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [priceMode, setPriceMode] = useState("단가합산");
  const [favorite, setFavorite] = useState(false);
  const [active, setActive] = useState(true);
  const [unbundle, setUnbundle] = useState(false);
  const [verbal, setVerbal] = useState(false);
  const [noBilling, setNoBilling] = useState(false);

  // 상병 / 처방 — 차트에서 prefill (prototype: 편집 미지원, 표시만)
  const [dxList] = useState<ModalDx[]>(SAMPLE_DX);
  const [rxList] = useState<ModalRx[]>(SAMPLE_RX);
  const [activeDx, setActiveDx] = useState<string | null>("L708");

  // 텍스트 영역
  const [symptom, setSymptom] = useState("");
  const [mx999, setMx999] = useState("");

  const canSave = code.trim().length > 0 && name.trim().length > 0;

  const subCategoriesForMain =
    MAIN_CATEGORIES.find(c => c.label === mainCat)?.subs ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(1280px, 96vw)", maxHeight: "92vh" }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-xl font-bold text-[var(--text-main)]">신규 묶음 등록</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]" aria-label="닫기">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0">
          {/* Section 1: 묶음 신규 추가 ─────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md">
            <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
              <span className="text-md font-bold text-[var(--text-main)]">묶음 신규 추가</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-[var(--text-sub)]">
                  즐겨찾기
                  <ToggleSwitch checked={favorite} onChange={setFavorite} />
                </label>
                <label className="flex items-center gap-1.5 text-sm text-[var(--text-sub)]">
                  사용여부
                  <ToggleSwitch checked={active} onChange={setActive} />
                </label>
              </div>
            </div>
            <div className="grid gap-3 px-3 py-3" style={{ gridTemplateColumns: "200px 1fr 1fr 160px 1.4fr" }}>
              {/* 카테고리 */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--text-sub)]">카테고리</span>
                <div className="flex items-center gap-1">
                  <select
                    value={mainCat}
                    onChange={e => { setMainCat(e.target.value); setSubCat("선택안함"); }}
                    className="flex-1 h-8 px-1.5 text-sm border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="선택안함">선택안함</option>
                    {MAIN_CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label.replace("★ ", "")}</option>)}
                  </select>
                  <select
                    value={subCat}
                    onChange={e => setSubCat(e.target.value)}
                    disabled={mainCat === "선택안함"}
                    className="flex-1 h-8 px-1.5 text-sm border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)] disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-tertiary)]"
                  >
                    <option value="선택안함">선택안함</option>
                    {subCategoriesForMain.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {/* 묶음코드 */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--text-sub)]">
                  묶음코드 <span className="text-[var(--red-500)]">*</span>
                </span>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="h-8 px-2 text-sm border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              {/* 묶음명칭 */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--text-sub)]">
                  묶음명칭 <span className="text-[var(--red-500)]">*</span>
                </span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-8 px-2 text-sm border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              {/* 묶음가 */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--text-sub)]">
                  묶음가 <span className="text-[var(--red-500)]">*</span>
                </span>
                <select
                  value={priceMode}
                  onChange={e => setPriceMode(e.target.value)}
                  className="h-8 px-1.5 text-sm border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]"
                >
                  <option>단가합산</option>
                  <option>고정가</option>
                  <option>할인가</option>
                </select>
              </div>
              {/* 기타 */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--text-sub)]">기타</span>
                <div className="flex items-center gap-3 h-8">
                  <label className="flex items-center gap-1 text-sm text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={unbundle} onChange={e => setUnbundle(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    묶음풀어서처방
                  </label>
                  <label className="flex items-center gap-1 text-sm text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={verbal} onChange={e => setVerbal(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    구두처방 가능
                  </label>
                  <label className="flex items-center gap-1 text-sm text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={noBilling} onChange={e => setNoBilling(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    내원일 비청구
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: 상병 ─────────────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                <tr>
                  <ThCell className="w-7 text-center">≡</ThCell>
                  <ThCell className="w-20">상병코드</ThCell>
                  <ThCell>명칭</ThCell>
                  <ThCell className="w-12 text-center">의증</ThCell>
                  <ThCell className="w-12 text-center">배제</ThCell>
                  <ThCell className="w-10 text-center">좌</ThCell>
                  <ThCell className="w-10 text-center">우</ThCell>
                  <ThCell className="w-20">진료과</ThCell>
                  <ThCell className="w-20">특정기호</ThCell>
                  <ThCell className="w-20">상해외인</ThCell>
                  <ThCell className="w-12 text-center">수술</ThCell>
                  <ThCell>영문명</ThCell>
                </tr>
              </thead>
              <tbody>
                {dxList.map(d => {
                  const isActive = activeDx === d.code;
                  return (
                    <tr
                      key={d.code}
                      onClick={() => setActiveDx(d.code)}
                      className={`border-b border-[var(--line-subtle)] cursor-pointer ${
                        isActive ? "bg-[var(--orange-50,#FFF7ED)]" : "hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <td className="px-1.5 py-1 text-center">
                        <span className={`text-md ${isActive ? "text-[var(--orange-500)]" : "text-[var(--text-tertiary)]"}`}>⊕</span>
                      </td>
                      <td className="px-1.5 py-1 text-sm font-mono text-[var(--text-main)]">{d.code}</td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-main)]">{d.name}</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-main)]">
                        <select defaultValue={d.dept} className="h-6 px-1 text-sm border border-[var(--line-default)] rounded bg-white outline-none w-full">
                          <option>피부과</option><option>내과</option><option>가정의학과</option>
                        </select>
                      </td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">—</td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">—</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* 상병 검색 — 행 추가 입력 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-base)] border-t border-[var(--line-default)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="상병 검색"
                className="flex-1 h-6 text-sm outline-none bg-transparent placeholder:text-[var(--text-tertiary)]"
              />
            </div>
          </section>

          {/* Section 3: 처방 ─────────────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: "1100px" }}>
                <thead className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                  <tr>
                    <ThCell className="w-7 text-center">≡</ThCell>
                    <ThCell className="w-20">사용자코드</ThCell>
                    <ThCell>명칭</ThCell>
                    <ThCell className="w-12 text-center">용량</ThCell>
                    <ThCell className="w-12 text-center">일투</ThCell>
                    <ThCell className="w-12 text-center">일수</ThCell>
                    <ThCell className="w-12 text-center">용법</ThCell>
                    <ThCell className="w-16">특정내역</ThCell>
                    <ThCell className="w-10 text-center">청구</ThCell>
                    <ThCell className="w-16">수납방법</ThCell>
                    <ThCell className="w-12">검체</ThCell>
                    <ThCell className="w-14">단가</ThCell>
                    <ThCell className="w-12">단위</ThCell>
                    <ThCell className="w-20">청구코드</ThCell>
                    <ThCell className="w-10 text-center">예외</ThCell>
                    <ThCell className="w-10 text-center">원내</ThCell>
                    <ThCell className="w-10 text-center">가루</ThCell>
                  </tr>
                </thead>
                <tbody>
                  {rxList.map(r => (
                    <tr key={r.userCode} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                      <td className="px-1.5 py-1 text-center">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="inline-block text-[var(--text-tertiary)]">
                          <path d="M5 4l4 4-4 4M12 3v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </td>
                      <td className="px-1.5 py-1 text-sm font-mono text-[var(--text-main)]">{r.userCode}</td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-main)]">{r.name}</td>
                      <td className="px-1.5 py-1 text-sm text-center tabular-nums">{r.dose}</td>
                      <td className="px-1.5 py-1 text-sm text-center tabular-nums">{r.per}</td>
                      <td className="px-1.5 py-1 text-sm text-center tabular-nums">{r.days}</td>
                      <td className="px-1.5 py-1 text-sm text-center tabular-nums">{r.usage}</td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">{r.spec || "—"}</td>
                      <td className="px-1.5 py-1 text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white ${
                          r.claim === "청" ? "bg-[var(--orange-500)]" : "bg-[var(--text-tertiary)]"
                        }`}>{r.claim}</span>
                      </td>
                      <td className="px-1.5 py-1 text-center">
                        <span className={`inline-flex items-center justify-center px-1.5 h-5 rounded text-xs font-medium ${
                          r.payment === "보험가" ? "bg-[var(--orange-50,#FFF7ED)] text-[var(--orange-500)]" : "bg-[var(--bg-subtle)] text-[var(--text-sub)]"
                        }`}>{r.payment}</span>
                      </td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">{r.sample || "—"}</td>
                      <td className="px-1.5 py-1 text-sm tabular-nums text-[var(--text-main)]">{r.price}</td>
                      <td className="px-1.5 py-1 text-sm text-[var(--text-tertiary)]">{r.unit || "—"}</td>
                      <td className="px-1.5 py-1 text-sm font-mono text-[var(--text-tertiary)]">{r.billCode}</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.exception} className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.inHouse} className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.powder} className="accent-[var(--brand-primary)]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 처방 검색 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-base)] border-t border-[var(--line-default)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="처방 검색"
                className="flex-1 h-6 text-sm outline-none bg-transparent placeholder:text-[var(--text-tertiary)]"
              />
            </div>
          </section>

          {/* Section 4: 증상 / 특정내역 ───────────────────────── */}
          <section className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* 증상 */}
            <div className="border border-[var(--line-default)] rounded-md flex flex-col">
              <div className="flex items-center justify-between px-3 h-8 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
                <span className="text-sm font-bold text-[var(--text-main)]">증상</span>
              </div>
              <textarea
                value={symptom}
                onChange={e => setSymptom(e.target.value)}
                rows={4}
                placeholder="('/' 입력하여 상용구 검색)"
                className="px-3 py-2 text-sm text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent"
              />
              <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)]">
                {["1st", "2nd", "abd"].map(t => (
                  <button key={t} className="text-xs px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* 특정내역(MX999) */}
            <div className="border border-[var(--line-default)] rounded-md flex flex-col">
              <div className="flex items-center justify-between px-3 h-8 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
                <span className="text-sm font-bold text-[var(--text-main)]">특정내역(MX999)</span>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{new Blob([mx999]).size}/700 bytes</span>
              </div>
              <textarea
                value={mx999}
                onChange={e => setMx999(e.target.value)}
                rows={4}
                placeholder="특정내역(MX999)을 입력해주세요."
                className="px-3 py-2 text-sm text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent"
              />
              <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)]">
                {["1st", "2nd", "abd"].map(t => (
                  <button key={t} className="text-xs px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 h-13 py-3 border-t border-[var(--line-default)] flex-shrink-0 bg-white">
          <button onClick={onClose} className="h-9 px-4 text-md font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button
            onClick={() => { if (canSave) onSave(); }}
            disabled={!canSave}
            className={`h-9 px-5 text-md font-bold rounded-md text-white transition-colors ${
              canSave ? "bg-[var(--text-main)] hover:opacity-90" : "bg-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PanelE({
  quickMenuItems = INIT_QUICK_MENU,
  layout = 2,
}: {
  quickMenuItems?: QuickMenuItem[];
  layout?: 1 | 2;
} = {}) {
  // 묶음처방 영역 — 두 탭으로 분리. "세트" (기존 묶음처방) / "묶음" (신규 처방-only)
  const [catalogTab, setCatalogTab] = useState<"세트" | "묶음">("세트");

  // ── 세트 탭 state (기존 구조 유지) ──
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const [activeMain, setActiveMain] = useState("기본");
  const [activeSub, setActiveSub] = useState("전체");

  // ── 묶음 탭 state (신규) — 플랫 리스트라 expand state 불필요 ──
  const [activeBundleCat, setActiveBundleCat] = useState<BundleMainCategory["label"]>("약");
  const [activeBundleSub, setActiveBundleSub] = useState("전체");

  const [activeQuickCat, setActiveQuickCat] = useState<QuickCategory>("전체");
  // 신규 묶음 등록 모달 — 현재 차트 내용으로 prefill 되어 열림
  const [newSetOpen, setNewSetOpen] = useState(false);

  const currentMain = MAIN_CATEGORIES.find(c => c.label === activeMain) ?? MAIN_CATEGORIES[1];

  // ★ 즐겨찾기 대분류 = starred=true 만, 그 외 = category + subCategory 필터.
  // 묶음과 동일한 패턴으로 통일. 이전엔 setItems 를 그대로 .map 해서 필터가 안 먹었음.
  const filteredSets = activeMain === "★ 즐겨찾기"
    ? setItems.filter(s => s.starred)
    : setItems.filter(s =>
        s.category === activeMain && (activeSub === "전체" || s.subCategory === activeSub)
      );

  const currentBundleCat = BUNDLE_CATEGORIES.find(c => c.label === activeBundleCat) ?? BUNDLE_CATEGORIES[0];
  const filteredBundles = activeBundleCat === "★ 즐겨찾기"
    ? bundleItems.filter(b => b.starred)
    : bundleItems.filter(b =>
        b.category === activeBundleCat && (activeBundleSub === "전체" || b.subCategory === activeBundleSub)
      );

  // Layout 2 일 땐 빠른메뉴 패널 숨김
  const showQuickMenu = layout !== 2;

  // 카테고리별 빠른메뉴 개수 (즐겨찾기는 데모용 고정값)
  const quickCategories = QUICK_CATEGORY_ORDER.map(c => ({
    ...c,
    cnt: c.key === "전체"
      ? quickMenuItems.length
      : c.key === "즐겨찾기"
        ? 3
        : quickMenuItems.filter(i => i.category === c.key).length,
  }));
  const filteredQuickItems =
    activeQuickCat === "전체"
      ? quickMenuItems
      : quickMenuItems.filter(i => i.category === activeQuickCat);

  return (
    <PanelGroup direction="vertical" className="w-full h-full">
      {/* 묶음처방 (상단) — Layout 1: 공유메모가 PanelB 로 이동했으므로 묶음·빠른메뉴가 풀공간 차지 */}
      <Panel defaultSize={showQuickMenu ? 70 : 60} minSize={25}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Header — 세트/묶음 탭 + 검색 + ⚙ + 신규 등록 */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
          {/* 탭 토글 — 세트 / 묶음 */}
          <div className="inline-flex items-center bg-[var(--bg-subtle)] rounded-[6px] p-0.5 flex-shrink-0">
            {(["세트", "묶음"] as const).map(t => {
              const active = catalogTab === t;
              return (
                <button
                  key={t}
                  onClick={() => setCatalogTab(t)}
                  className={`h-6 px-2.5 text-xs font-bold rounded-[4px] transition-colors ${
                    active
                      ? "bg-white text-[var(--brand-primary)] shadow-sm"
                      : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7 flex-1 min-w-0">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[var(--text-tertiary)] truncate">{catalogTab} 검색</span>
          </div>
          <button className="w-6 h-6 border border-[var(--line-default)] rounded-[4px] flex items-center justify-center text-sm text-[var(--text-sub)] flex-shrink-0">⚙</button>
          <button
            onClick={() => setNewSetOpen(true)}
            title={`현재 차트 내용으로 ${catalogTab} 신규 등록`}
            className="w-6 h-6 border border-[var(--line-default)] bg-white rounded-[4px] flex items-center justify-center text-[var(--text-sub)] text-lg hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors flex-shrink-0"
          >+</button>
        </div>

        {/* ────────── 세트 탭 (기존 묶음처방 — 증상·진단·처방·특정내역 등 다양한 요소 포함) ────────── */}
        {catalogTab === "세트" && (
          <>
            {/* 대분류 chips */}
            <div className="flex flex-wrap gap-1 px-2.5 py-1 border-b border-[var(--line-default)] flex-shrink-0">
              {MAIN_CATEGORIES.map((cat) => {
                const active = activeMain === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => { setActiveMain(cat.label); setActiveSub("전체"); }}
                    className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium border whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                        : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    {cat.label}
                    <span className={`text-micro tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{cat.count}</span>
                  </button>
                );
              })}
            </div>

            {/* 중분류 chips */}
            <div className="flex flex-wrap gap-1 px-2.5 py-1 bg-[var(--bg-base)] border-b border-[var(--line-default)] flex-shrink-0">
              {currentMain.subs.map(sub => {
                const active = activeSub === sub.label;
                return (
                  <button
                    key={sub.label}
                    onClick={() => setActiveSub(sub.label)}
                    className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border border-[var(--brand-primary)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-transparent hover:bg-white hover:border-[var(--line-default)]"
                    }`}
                  >
                    {sub.label}
                    <span className={`text-micro tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{sub.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0">
              <span className="text-xs text-[var(--text-sub)]">
                {activeMain} <span className="text-[var(--text-tertiary)]">›</span> {activeSub} · <span className="font-bold text-[var(--text-main)]">{filteredSets.length}</span>개 세트
              </span>
              <button className="text-xs text-[var(--text-sub)]">이름순 ▾</button>
            </div>

            {/* 세트 List — filteredSets (대·중분류 필터 적용) 기준으로 렌더 */}
            <div className="flex-1 overflow-y-auto">
              {filteredSets.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] py-3 text-center">조건에 맞는 세트 없음</p>
              )}
              {filteredSets.map((item) => {
                const isExpanded = expandedSet === item.id;
                return (
                  <div key={item.id} className="border-b border-[var(--line-subtle)]">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[var(--bg-subtle)] cursor-pointer">
                      <span className={`text-md flex-shrink-0 ${item.starred ? "text-[var(--orange-500)]" : "text-[var(--text-disabled)]"}`}>
                        {item.starred ? "★" : "☆"}
                      </span>
                      {/* 사용자코드 — 묶음과 동일 시각 패턴 (text-tertiary tabular w-14) */}
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0 w-14 truncate">{item.code}</span>
                      {/* 명칭 — 항목수·금액 제거로 폭 더 넓어짐 */}
                      <span className="text-sm font-medium text-[var(--text-main)] truncate flex-1 min-w-0">{item.name}</span>
                      <button
                        onClick={() => setExpandedSet(isExpanded ? null : item.id)}
                        title={isExpanded ? "접기" : "펼치기"}
                        className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-sub)] w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {isExpanded ? "⌃" : "⌄"}
                      </button>
                      <button title="추가" className="w-5 h-5 border border-[var(--line-default)] bg-white rounded-full flex items-center justify-center text-[var(--text-sub)] text-sm flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                        +
                      </button>
                    </div>
                    {/* 펼친 항목 — 같은 유형은 한 번만 라벨링 (rowSpan).
                        흰 배경 + 카테고리별 셀 배경색으로 가독성 향상.
                        PatientDetailModal 의 DetailGroup 과 동일한 컬러 매핑. */}
                    {isExpanded && item.items && (() => {
                      // 연속된 같은 유형 끼리 그룹화 — 순서 유지
                      type Group = { type: string; bg: string; color: string; items: typeof item.items };
                      // 유형별 (글자색, 셀 배경색) 매핑 — 내원이력·환자상세 모달과 동일 톤.
                      const typeStyleOf = (t?: string): { color: string; bg: string } =>
                        t === "증상"     ? { color: "var(--orange-700)", bg: "var(--status-warning-bg-subtle)" } :
                        t === "진단"     ? { color: "var(--red-700)",    bg: "var(--status-error-bg-subtle)" } :
                        t === "처방"     ? { color: "var(--green-700)",  bg: "var(--status-success-bg-subtle)" } :
                        t === "특정내역" ? { color: "var(--violet-500)", bg: "var(--violet-050)" } :
                                            { color: "var(--text-tertiary)", bg: "var(--bg-subtle)" };
                      const groups: Group[] = [];
                      for (const sub of item.items) {
                        const last = groups[groups.length - 1];
                        if (last && last.type === (sub.type ?? "—")) {
                          last.items.push(sub);
                        } else {
                          const style = typeStyleOf(sub.type);
                          groups.push({ type: sub.type ?? "—", color: style.color, bg: style.bg, items: [sub] });
                        }
                      }
                      return (
                        <div className="bg-white border-t border-[var(--line-default)]">
                          <table className="w-full border-collapse">
                            <tbody>
                              {groups.map((g, gi) => (
                                g.items.map((sub, i) => {
                                  const isLastRowOfGroup = i === g.items.length - 1;
                                  const isLastGroup = gi === groups.length - 1;
                                  // 그룹 사이는 얇은 구분선 — 같은 유형 행끼리는 구분선 없음
                                  const rowBorderClass = isLastRowOfGroup && !isLastGroup ? "border-b border-[var(--line-subtle)]" : "";
                                  return (
                                    <tr key={`${gi}-${i}`} className={rowBorderClass}>
                                      {/* 그룹 첫 행에만 유형 라벨 셀 — 셀 전체 배경색 + bold 텍스트 */}
                                      {i === 0 && (
                                        <td
                                          rowSpan={g.items.length}
                                          className="text-xs font-bold text-center align-middle w-14 whitespace-nowrap"
                                          style={{ color: g.color, background: g.bg }}
                                        >
                                          {g.type}
                                        </td>
                                      )}
                                      <td className="text-sm text-[var(--text-main)] py-1 px-2.5">{sub.name}</td>
                                      <td className="text-xs text-[var(--text-tertiary)] tabular-nums py-1 pr-2.5 text-right whitespace-nowrap w-16">
                                        {sub.price !== undefined ? `${sub.price.toLocaleString()}원` : ""}
                                      </td>
                                    </tr>
                                  );
                                })
                              ))}
                              {/* 합계 — 가격이 있는 항목만 합산 */}
                              {item.items.some(s => s.price !== undefined) && (
                                <tr className="border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
                                  <td colSpan={2} className="text-sm font-bold text-[var(--text-main)] py-1.5 px-2.5">합계</td>
                                  <td className="text-sm font-bold text-[var(--brand-primary)] tabular-nums text-right py-1.5 pr-2.5 whitespace-nowrap">
                                    {item.items.reduce((s, sub) => s + (sub.price ?? 0), 0).toLocaleString()}원
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ────────── 묶음 탭 (신규 — 처방만, 약/주사/검사/치료재료 + 질환별) ────────── */}
        {catalogTab === "묶음" && (
          <>
            {/* 대분류 chips — 약/주사/검사/치료재료 */}
            <div className="flex flex-wrap gap-1 px-2.5 py-1 border-b border-[var(--line-default)] flex-shrink-0">
              {BUNDLE_CATEGORIES.map(cat => {
                const active = activeBundleCat === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => { setActiveBundleCat(cat.label); setActiveBundleSub("전체"); }}
                    className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium border whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                        : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    {cat.label}
                    <span className={`text-micro tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{cat.count}</span>
                  </button>
                );
              })}
            </div>

            {/* 중분류 chips — 질환별 */}
            <div className="flex flex-wrap gap-1 px-2.5 py-1 bg-[var(--bg-base)] border-b border-[var(--line-default)] flex-shrink-0">
              {currentBundleCat.subs.map(sub => {
                const active = activeBundleSub === sub.label;
                return (
                  <button
                    key={sub.label}
                    onClick={() => setActiveBundleSub(sub.label)}
                    className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border border-[var(--brand-primary)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-transparent hover:bg-white hover:border-[var(--line-default)]"
                    }`}
                  >
                    {sub.label}
                    <span className={`text-micro tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{sub.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0">
              <span className="text-xs text-[var(--text-sub)]">
                {activeBundleCat} <span className="text-[var(--text-tertiary)]">›</span> {activeBundleSub} · <span className="font-bold text-[var(--text-main)]">{filteredBundles.length}</span>개
              </span>
              <button className="text-xs text-[var(--text-sub)]">이름순 ▾</button>
            </div>

            {/* 묶음 List — 플랫 처방 목록. nesting 없이 한 줄씩 노출. */}
            <div className="flex-1 overflow-y-auto">
              {filteredBundles.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] py-3 text-center">조건에 맞는 처방 없음</p>
              )}
              {filteredBundles.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <span className={`text-md flex-shrink-0 ${item.starred ? "text-[var(--orange-500)]" : "text-[var(--text-disabled)]"}`}>
                    {item.starred ? "★" : "☆"}
                  </span>
                  {/* 사용자코드 */}
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0 w-14 truncate">{item.code}</span>
                  {/* 명칭 — 가격 컬럼 제거로 더 넓게. truncate 유지. */}
                  <span className="text-sm font-medium text-[var(--text-main)] truncate flex-1 min-w-0">{item.name}</span>
                  {/* 용량·일수 (없으면 생략) */}
                  {item.dose && <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">×{item.dose}</span>}
                  {item.days && <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{item.days}일</span>}
                  {/* 추가 */}
                  <button title={`${item.name} 추가`} className="w-5 h-5 border border-[var(--line-default)] bg-white rounded-full flex items-center justify-center text-[var(--text-sub)] text-sm flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    +
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </Panel>

      {/* 빠른메뉴 — Layout 2 에서는 숨김 (showQuickMenu=false). Layout 1 에서는 공유메모가 PanelB 로 이동돼 비중 30% 로 확대 */}
      {showQuickMenu && (
        <>
          <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
          <Panel defaultSize={30} minSize={10}>
            <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
              {/* 헤더 — 검색 */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
                <span className="text-md font-bold text-[var(--text-main)]">빠른메뉴</span>
                <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7 flex-1">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-[var(--text-tertiary)]">빠른메뉴 검색</span>
                </div>
                <button
                  title="빠른메뉴 신규 등록"
                  className="w-6 h-6 border border-[var(--line-default)] bg-white rounded-[4px] flex items-center justify-center text-[var(--text-sub)] text-lg hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
                >+</button>
              </div>

              {/* 카테고리 칩 */}
              <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-wrap flex-shrink-0">
                {quickCategories.map(cat => {
                  const active = activeQuickCat === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveQuickCat(cat.key)}
                      className={`flex items-center gap-0.5 h-6 px-2 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                        active ? catChipActive[cat.key] : catChipInactive[cat.key]
                      }`}
                    >
                      {cat.label}
                      <span className={`text-micro font-bold tabular-nums ml-0.5 ${active ? "opacity-80" : "opacity-70"}`}>{cat.cnt}</span>
                    </button>
                  );
                })}
              </div>

              {/* 버튼 그리드 — 카테고리별 색상 */}
              <div className="flex-1 overflow-y-auto px-2.5 py-1.5">
                <div className="flex flex-wrap gap-1">
                  {filteredQuickItems.map(item => (
                    <button
                      key={item.label}
                      title={`${item.label} 실행`}
                      className={`relative text-xs border rounded-[6px] px-2 py-1 transition-colors whitespace-nowrap hover:brightness-95 ${quickBtnStyle[item.category]} ${
                        item.isNew ? "ring-2 ring-[var(--brand-primary)] ring-offset-1" : ""
                      }`}
                    >
                      {item.isNew && (
                        <span
                          className="absolute -top-1 -right-1 w-[6px] h-[6px] rounded-full bg-[var(--red-500)]"
                          aria-label="새로 추가됨"
                        />
                      )}
                      {item.label}
                    </button>
                  ))}
                  {filteredQuickItems.length === 0 && (
                    <p className="text-xs text-[var(--text-tertiary)] py-2 w-full text-center">
                      이 카테고리에 등록된 빠른메뉴 없음
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </>
      )}

      {/* 공유메모 — Layout 2 에서만 PanelE 하단에 노출.
          Layout 1 에서는 PanelB 의 SharedMemoCard 슬롯으로 이동되어 여기엔 표시 안 함. */}
      {!showQuickMenu && (
        <>
          <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
          <Panel defaultSize={40} minSize={12}>
            <SharedMemoCard />
          </Panel>
        </>
      )}

      {/* 신규 묶음 등록 모달 — + 버튼으로 오픈 */}
      {newSetOpen && (
        <NewSetModal
          onClose={() => setNewSetOpen(false)}
          onSave={() => setNewSetOpen(false)}
        />
      )}
    </PanelGroup>
  );
}
