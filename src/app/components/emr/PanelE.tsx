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

// 세트 카테고리 라벨 타입 — 필터·표시에서 사용. 실제 EMR 시스템의 묶음 폴더 분류를 그대로 반영.
// 진료실 운영 형태(병명별 / 진료의별 / 분야별) 가 혼재된 현실적인 mock.
type SetMainLabel =
  | "★ 즐겨찾기"
  | "일반 묶음" | "병명 묶음" | "주사 (Dr.김현호)" | "검사 묶음"
  | "기능의학(Dr.김상만)" | "Dr.김동환" | "접종" | "제증명"
  | "증상 묶음" | "처방 묶음" | "방사선 묶음" | "식대 묶음"
  | "시술 묶음" | "Dr. GC" | "금연치료사업진찰료";
// 세트 대분류 — 총 15개. 각 카테고리는 3~6 개의 소분류를 갖고 그 아래 각각 4~6 개의 묶음 항목이 존재.
// 카테고리당 약 20~30 건이 등록되어 있는 실제 임상 환경을 시뮬레이션함.
const SET_TAXONOMY: Record<Exclude<SetMainLabel, "★ 즐겨찾기">, string[]> = {
  "일반 묶음":           ["진단명", "검사", "처방", "기타"],
  "병명 묶음":           ["고혈압", "당뇨", "고지혈", "관절염", "갑상선", "기타"],
  "주사 (Dr.김현호)":     ["일반", "주사재료"],
  "검사 묶음":           ["혈액", "심전도", "초음파", "내시경", "기타"],
  "기능의학(Dr.김상만)":  ["호르몬", "장건강", "디톡스", "항노화", "면역"],
  "Dr.김동환":           ["통증관리", "재활", "주사", "물리치료"],
  "접종":                ["독감", "코로나", "대상포진", "폐렴구균", "소아 필수", "여행자"],
  "제증명":              ["진단서", "소견서", "보험서류", "사망진단", "기타"],
  "증상 묶음":           ["두통", "복통", "관절통", "발열", "기침"],
  "처방 묶음":           ["내복약", "외용제", "주사약", "수액"],
  "방사선 묶음":         ["X-ray", "CT", "MRI", "투시"],
  "식대 묶음":           ["일반식", "치료식", "특수식"],
  "시술 묶음":           ["통증시술", "미용시술", "재활시술", "기타시술", "응급처치"],
  "Dr. GC":              ["GC 패키지", "GC 검진", "GC 케어", "GC 회복"],
  "금연치료사업진찰료":   ["초진", "재진", "유지"],
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

// ─── 묶음 항목 시드 — 15 개 대분류 × 3~6 개 소분류 × 4~5 건 = 카테고리당 20~30 건 ──────────────
// 각 항목은 (코드 prefix + 일련번호) 형식의 사용자코드와 (이름 prefix + 번호) 형식의 명칭으로 자동 생성.
// 첫 번째 항목은 starred = true 로 표시 (즐겨찾기 보임). 일부 starred 에는 expand 시 보일 items 내용을 후처리로 추가.
type SubSeed = {
  sub: string;            // 소분류명
  codePrefix: string;     // 사용자코드 prefix (예: "GEN-G")
  namePrefix: string;     // 명칭 prefix (예: "일반 진료")
  basePrice: number;      // 기본 가격
  itemCount: number;      // 생성할 항목 갯수 (4~6)
  count: number;          // 묶음 내부 항목 갯수 (display 용)
};
type MainSeed = {
  category: Exclude<SetMainLabel, "★ 즐겨찾기">;
  subs: SubSeed[];
};

// 일반 묶음·주사 (Dr.김현호) 는 실제 클리닉 사용 패턴을 반영한 explicit 명칭 사용 → NAMED_ITEMS 별도 정의.
// 나머지 13 개 카테고리는 procedural 시드로 생성.
const SET_SEED: MainSeed[] = [
  { category: "병명 묶음", subs: [
    { sub: "고혈압",   codePrefix: "DX-HTN",  namePrefix: "고혈압 패키지",   basePrice: 15500, itemCount: 5, count: 5 },
    { sub: "당뇨",     codePrefix: "DX-DM",   namePrefix: "당뇨 패키지",     basePrice: 22000, itemCount: 5, count: 5 },
    { sub: "고지혈",   codePrefix: "DX-DLP",  namePrefix: "고지혈 패키지",   basePrice: 18000, itemCount: 4, count: 4 },
    { sub: "관절염",   codePrefix: "DX-ART",  namePrefix: "관절염 패키지",   basePrice: 16500, itemCount: 4, count: 5 },
    { sub: "갑상선",   codePrefix: "DX-THY",  namePrefix: "갑상선 패키지",   basePrice: 19500, itemCount: 4, count: 4 },
    { sub: "기타",     codePrefix: "DX-XX",   namePrefix: "병명 기타",       basePrice: 14000, itemCount: 4, count: 3 },
  ]},
  { category: "검사 묶음", subs: [
    { sub: "혈액",     codePrefix: "LAB-CB", namePrefix: "혈액검사",         basePrice: 25000, itemCount: 5, count: 5 },
    { sub: "심전도",   codePrefix: "LAB-EK", namePrefix: "심전도 검사",      basePrice: 28000, itemCount: 4, count: 3 },
    { sub: "초음파",   codePrefix: "LAB-US", namePrefix: "초음파 검사",      basePrice: 80000, itemCount: 5, count: 2 },
    { sub: "내시경",   codePrefix: "LAB-EG", namePrefix: "내시경 검사",      basePrice: 145000, itemCount: 4, count: 3 },
    { sub: "기타",     codePrefix: "LAB-XX", namePrefix: "검사 기타",        basePrice: 35000, itemCount: 4, count: 3 },
  ]},
  { category: "기능의학(Dr.김상만)", subs: [
    { sub: "호르몬",   codePrefix: "FM-HR",  namePrefix: "호르몬 케어",      basePrice: 65000, itemCount: 5, count: 4 },
    { sub: "장건강",   codePrefix: "FM-GI",  namePrefix: "장건강 케어",      basePrice: 55000, itemCount: 5, count: 4 },
    { sub: "디톡스",   codePrefix: "FM-DX",  namePrefix: "디톡스 케어",      basePrice: 48000, itemCount: 5, count: 3 },
    { sub: "항노화",   codePrefix: "FM-AG",  namePrefix: "항노화 케어",      basePrice: 78000, itemCount: 5, count: 4 },
    { sub: "면역",     codePrefix: "FM-IM",  namePrefix: "면역 케어",        basePrice: 52000, itemCount: 5, count: 4 },
  ]},
  { category: "Dr.김동환", subs: [
    { sub: "통증관리", codePrefix: "KDH-PN", namePrefix: "김동환 통증",      basePrice: 55000, itemCount: 6, count: 3 },
    { sub: "재활",     codePrefix: "KDH-RB", namePrefix: "김동환 재활",      basePrice: 65000, itemCount: 6, count: 3 },
    { sub: "주사",     codePrefix: "KDH-IJ", namePrefix: "김동환 주사",      basePrice: 38000, itemCount: 6, count: 2 },
    { sub: "물리치료", codePrefix: "KDH-PT", namePrefix: "김동환 물리치료",  basePrice: 6800,  itemCount: 6, count: 2 },
  ]},
  { category: "접종", subs: [
    { sub: "독감",     codePrefix: "VAC-FL", namePrefix: "독감 백신",        basePrice: 35000, itemCount: 4, count: 1 },
    { sub: "코로나",   codePrefix: "VAC-CV", namePrefix: "코로나 백신",      basePrice: 0,     itemCount: 4, count: 1 },
    { sub: "대상포진", codePrefix: "VAC-ZS", namePrefix: "대상포진 백신",    basePrice: 180000, itemCount: 4, count: 1 },
    { sub: "폐렴구균", codePrefix: "VAC-PC", namePrefix: "폐렴구균 백신",    basePrice: 95000, itemCount: 4, count: 1 },
    { sub: "소아 필수", codePrefix: "VAC-PD", namePrefix: "소아 필수 백신",  basePrice: 28000, itemCount: 4, count: 1 },
    { sub: "여행자",   codePrefix: "VAC-TR", namePrefix: "여행자 백신",      basePrice: 42000, itemCount: 4, count: 1 },
  ]},
  { category: "제증명", subs: [
    { sub: "진단서",   codePrefix: "CRT-DG", namePrefix: "진단서",           basePrice: 20000, itemCount: 5, count: 1 },
    { sub: "소견서",   codePrefix: "CRT-OP", namePrefix: "소견서",           basePrice: 10000, itemCount: 5, count: 1 },
    { sub: "보험서류", codePrefix: "CRT-IN", namePrefix: "보험 서류",        basePrice: 15000, itemCount: 5, count: 1 },
    { sub: "사망진단", codePrefix: "CRT-DC", namePrefix: "사망진단서",       basePrice: 30000, itemCount: 5, count: 1 },
    { sub: "기타",     codePrefix: "CRT-XX", namePrefix: "기타 증명",        basePrice: 12000, itemCount: 5, count: 1 },
  ]},
  { category: "증상 묶음", subs: [
    { sub: "두통",     codePrefix: "SX-HD",  namePrefix: "두통 케어",        basePrice: 11200, itemCount: 5, count: 3 },
    { sub: "복통",     codePrefix: "SX-AB",  namePrefix: "복통 케어",        basePrice: 12500, itemCount: 5, count: 3 },
    { sub: "관절통",   codePrefix: "SX-JT",  namePrefix: "관절통 케어",      basePrice: 13800, itemCount: 5, count: 4 },
    { sub: "발열",     codePrefix: "SX-FV",  namePrefix: "발열 케어",        basePrice: 9800,  itemCount: 5, count: 3 },
    { sub: "기침",     codePrefix: "SX-CG",  namePrefix: "기침 케어",        basePrice: 10500, itemCount: 5, count: 3 },
  ]},
  { category: "처방 묶음", subs: [
    { sub: "내복약",   codePrefix: "RX-PO",  namePrefix: "내복 처방",        basePrice: 6800,  itemCount: 6, count: 3 },
    { sub: "외용제",   codePrefix: "RX-TP",  namePrefix: "외용 처방",        basePrice: 4500,  itemCount: 6, count: 2 },
    { sub: "주사약",   codePrefix: "RX-IJ",  namePrefix: "주사 처방",        basePrice: 18000, itemCount: 6, count: 2 },
    { sub: "수액",     codePrefix: "RX-IV",  namePrefix: "수액 처방",        basePrice: 38000, itemCount: 6, count: 2 },
  ]},
  { category: "방사선 묶음", subs: [
    { sub: "X-ray",    codePrefix: "RAD-XR", namePrefix: "X-ray 묶음",       basePrice: 22000, itemCount: 6, count: 2 },
    { sub: "CT",       codePrefix: "RAD-CT", namePrefix: "CT 묶음",          basePrice: 180000, itemCount: 6, count: 3 },
    { sub: "MRI",      codePrefix: "RAD-MR", namePrefix: "MRI 묶음",         basePrice: 480000, itemCount: 6, count: 3 },
    { sub: "투시",     codePrefix: "RAD-FL", namePrefix: "투시검사",         basePrice: 38000, itemCount: 6, count: 2 },
  ]},
  { category: "식대 묶음", subs: [
    { sub: "일반식",   codePrefix: "MEAL-G", namePrefix: "일반식 묶음",      basePrice: 4200,  itemCount: 8, count: 1 },
    { sub: "치료식",   codePrefix: "MEAL-T", namePrefix: "치료식 묶음",      basePrice: 5800,  itemCount: 8, count: 1 },
    { sub: "특수식",   codePrefix: "MEAL-S", namePrefix: "특수식 묶음",      basePrice: 6500,  itemCount: 8, count: 1 },
  ]},
  { category: "시술 묶음", subs: [
    { sub: "통증시술", codePrefix: "PRC-PN", namePrefix: "통증 시술",        basePrice: 55000, itemCount: 5, count: 3 },
    { sub: "미용시술", codePrefix: "PRC-AS", namePrefix: "미용 시술",        basePrice: 180000, itemCount: 5, count: 2 },
    { sub: "재활시술", codePrefix: "PRC-RB", namePrefix: "재활 시술",        basePrice: 65000, itemCount: 5, count: 3 },
    { sub: "기타시술", codePrefix: "PRC-XX", namePrefix: "기타 시술",        basePrice: 38000, itemCount: 5, count: 2 },
    { sub: "응급처치", codePrefix: "PRC-EM", namePrefix: "응급 처치",        basePrice: 42000, itemCount: 5, count: 3 },
  ]},
  { category: "Dr. GC", subs: [
    { sub: "GC 패키지", codePrefix: "GC-PKG", namePrefix: "GC 패키지",       basePrice: 220000, itemCount: 6, count: 6 },
    { sub: "GC 검진",   codePrefix: "GC-HC",  namePrefix: "GC 검진",         basePrice: 380000, itemCount: 6, count: 7 },
    { sub: "GC 케어",   codePrefix: "GC-CR",  namePrefix: "GC 케어",         basePrice: 150000, itemCount: 6, count: 5 },
    { sub: "GC 회복",   codePrefix: "GC-RC",  namePrefix: "GC 회복",         basePrice: 95000, itemCount: 6, count: 4 },
  ]},
  { category: "금연치료사업진찰료", subs: [
    { sub: "초진",     codePrefix: "SMK-IN", namePrefix: "금연 초진",        basePrice: 28000, itemCount: 7, count: 2 },
    { sub: "재진",     codePrefix: "SMK-FU", namePrefix: "금연 재진",        basePrice: 18500, itemCount: 7, count: 2 },
    { sub: "유지",     codePrefix: "SMK-MN", namePrefix: "금연 유지",        basePrice: 12000, itemCount: 7, count: 1 },
  ]},
];

// ── NAMED_ITEMS — explicit 명칭 사용 카테고리 (실제 클리닉 캡처 기반) ───────────────
// 일반 묶음·주사 (Dr.김현호) 는 실제 EMR 캡처에서 가져온 명칭을 그대로 사용.
// 사용자코드(code)는 클리닉이 직접 정한 짧은 식별자 패턴을 모사.
type NamedItem = {
  category: Exclude<SetMainLabel, "★ 즐겨찾기">;
  sub: string;
  code: string;
  name: string;
  price: number;
  count: number;
};
const NAMED_ITEMS: NamedItem[] = [
  // ─── 일반 묶음 > 진단명 (22) — 임상 진단명 기반 묶음 ───
  { category: "일반 묶음", sub: "진단명", code: "psr",  name: "Psoriasis",       price: 18500, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "hsv",  name: "HSV infection",   price: 22000, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "hord", name: "Hordeolum",       price:  8500, count: 2 },
  { category: "일반 묶음", sub: "진단명", code: "hzr",  name: "Herpes zoster",   price: 28000, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "pnc",  name: "Panic",           price: 14500, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "anm",  name: "Anemia",          price: 16800, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "nfl",  name: "NAFLD",           price: 19500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "dz",   name: "Dizziness",       price: 11200, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "hmh",  name: "Hemorrhoid",      price: 13500, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "stm",  name: "Stomatitis",      price:  9800, count: 2 },
  { category: "일반 묶음", sub: "진단명", code: "gt",   name: "Gout",            price: 17500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "prg",  name: "Pregnancy",       price:  8500, count: 2 },
  { category: "일반 묶음", sub: "진단명", code: "hth",  name: "Hyperthyroidism", price: 22500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "htn",  name: "HTN",             price: 15500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "uri",  name: "URI",             price:  9800, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "pne",  name: "Pneumonia",       price: 18500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "cnj",  name: "Conjunctivitis",  price:  9500, count: 2 },
  { category: "일반 묶음", sub: "진단명", code: "dl",   name: "DL",              price: 17500, count: 4 },
  { category: "일반 묶음", sub: "진단명", code: "uti",  name: "UTI",             price: 13500, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "dm",   name: "DM",              price: 22000, count: 5 },
  { category: "일반 묶음", sub: "진단명", code: "cys",  name: "Cystitis",        price: 12500, count: 3 },
  { category: "일반 묶음", sub: "진단명", code: "acn",  name: "Acne",            price: 14500, count: 3 },
  // ─── 일반 묶음 > 검사 (7) ───
  { category: "일반 묶음", sub: "검사",  code: "tst",  name: "test",            price: 12000, count: 2 },
  { category: "일반 묶음", sub: "검사",  code: "cbcd", name: "CBC+diff",        price: 28000, count: 3 },
  { category: "일반 묶음", sub: "검사",  code: "fut",  name: "f/u test",        price: 18500, count: 3 },
  { category: "일반 묶음", sub: "검사",  code: "obl",  name: "Obesity lab",     price: 42000, count: 5 },
  { category: "일반 묶음", sub: "검사",  code: "gdc",  name: "고당고검사",       price: 35000, count: 4 },
  { category: "일반 묶음", sub: "검사",  code: "gda",  name: "고당고 추가",      price: 12500, count: 2 },
  { category: "일반 묶음", sub: "검사",  code: "gdb",  name: "고당고 기본",      price: 28500, count: 3 },
  // ─── 일반 묶음 > 처방 (8) — histobulin 은 묶음코드 "hisglo" 로 캡처와 일치 ───
  { category: "일반 묶음", sub: "처방",  code: "hisglo", name: "histobulin",   price: 60000, count: 4 },
  { category: "일반 묶음", sub: "처방",  code: "prml",   name: "peramiflu",    price: 48000, count: 2 },
  { category: "일반 묶음", sub: "처방",  code: "giml",   name: "gi med L",     price:  8500, count: 3 },
  { category: "일반 묶음", sub: "처방",  code: "drm",    name: "Derma oint",   price:  7800, count: 2 },
  { category: "일반 묶음", sub: "처방",  code: "ivf",    name: "IV fluid",     price: 38000, count: 4 },
  { category: "일반 묶음", sub: "처방",  code: "des",    name: "DES",          price: 14500, count: 3 },
  { category: "일반 묶음", sub: "처방",  code: "osmd",   name: "os med",       price:  9200, count: 3 },
  { category: "일반 묶음", sub: "처방",  code: "pms",    name: "PMS",          price: 13500, count: 3 },
  // ─── 일반 묶음 > 기타 (3) ───
  { category: "일반 묶음", sub: "기타",  code: "ct",   name: "처치",              price: 18500, count: 3 },
  { category: "일반 묶음", sub: "기타",  code: "smk",  name: "Smoking cessation", price: 22000, count: 3 },
  { category: "일반 묶음", sub: "기타",  code: "hi",   name: "high",              price:  8500, count: 2 },

  // ─── 주사 (Dr.김현호) > 일반 (5) — 김현호 원장이 자주 사용하는 묶음 ───
  { category: "주사 (Dr.김현호)", sub: "일반",     code: "ivcp3",  name: "IVcold+(3)",   price: 48000, count: 4 },
  { category: "주사 (Dr.김현호)", sub: "일반",     code: "imsc",   name: "원내 IM,SC",    price: 22000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "일반",     code: "ivcold", name: "IVcold",        price: 38000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "일반",     code: "influp", name: "Influenza++",   price: 52000, count: 4 },
  { category: "주사 (Dr.김현호)", sub: "일반",     code: "agep",   name: "AGE+",          price: 42000, count: 3 },
  // ─── 주사 (Dr.김현호) > 주사재료 (32) — 상세 IV 카탈로그 ───
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivcp",   name: "IVcold+",       price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivcpp3", name: "IVcold++(3)",   price: 52000, count: 4 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdp2",  name: "IVD+2",         price: 38000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivth",   name: "IVthio",        price: 45000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ive",    name: "IVE",           price: 32000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdp",   name: "IVD+",          price: 35000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivzn",   name: "IVZn",          price: 38000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdp2b", name: "IVD+(2)",       price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdr1",  name: "IVDr1",         price: 48000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivcp3d", name: "IVcold+(3)D",   price: 55000, count: 4 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivd22",  name: "IVD2(2)",       price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "infl",   name: "Influenza",     price: 48000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivth2",  name: "IVthio(2)",     price: 52000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdg2",  name: "IVD+G(2)",      price: 48000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivig",   name: "IVIg",          price: 78000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdr",   name: "IVDr",          price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivnac",  name: "IVNAC",         price: 65000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivdp22", name: "IVD+2(2)",      price: 48000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ida",    name: "IDA",           price: 38000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivac",   name: "IVAC",          price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivd2",   name: "IVD2",          price: 38000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "lae5",   name: "Laennec 5",     price: 65000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivmb2",  name: "IVMB2",         price: 48000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivab",   name: "IVAB",          price: 38000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivalc",  name: "IValc",         price: 42000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "lae",    name: "Laennec",       price: 55000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivc",    name: "IVC",           price: 32000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "atp",    name: "ATP",           price: 28000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivb1",   name: "IVB1",          price: 35000, count: 2 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "ivmb22", name: "IVMB2(2)",      price: 52000, count: 3 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "hsto",   name: "Histobulin",    price: 58000, count: 4 },
  { category: "주사 (Dr.김현호)", sub: "주사재료", code: "imd",    name: "IMD",           price: 42000, count: 3 },
];

// 일부 starred 항목에 expand 시 보일 items 내용을 직접 매핑 (사용자코드 → 내용).
// 모든 항목에 채우진 않음 — 대표 몇 개만 풍부하게 보여서 expand UX 가 보이도록.
const ENRICHED_ITEMS: Record<string, { type?: SetItemElementType; name: string; price?: number }[]> = {
  // 실제 캡처 (histobulin 묶음) 내용 그대로 반영 — 상병 + 처방 2건.
  "hisglo": [
    { type: "진단", name: "J304 상세불명의 알레르기비염" },
    { type: "진단", name: "L508 기타 두드러기" },
    { type: "처방", name: "히스토불린주", price: 18000 },
    { type: "처방", name: "필터주사기",   price:   200 },
  ],
  "uri": [
    { type: "증상", name: "발열·인후통·기침" },
    { type: "진단", name: "J00 급성비인두염" },
    { type: "처방", name: "타이레놀이알서방정",  price: 2400 },
    { type: "처방", name: "코대원포르테시럽",    price: 6800 },
  ],
  "ivcp3": [
    { type: "증상", name: "감기 증상 — 발열·근육통" },
    { type: "처방", name: "비타민C 주사",         price: 12000 },
    { type: "처방", name: "감기 영양수액 (3종)",  price: 28000 },
    { type: "처방", name: "타이레놀 주사",        price:  6500 },
  ],
  "DX-HTN01": [
    { type: "증상", name: "혈압 상승 추적" },
    { type: "진단", name: "I10 본태성 고혈압" },
    { type: "처방", name: "노바스크정 5mg",     price: 480 },
    { type: "처방", name: "코자정 50mg",        price: 520 },
    { type: "특정내역", name: "JS009 산정특례" },
  ],
  // GC 검진 — 종합검진 풀패키지. 처방이 많은 묶음의 대표 예시 (스크롤 확인용).
  "GC-HC01": [
    { type: "증상", name: "정기 종합검진 — 가족력 + 만성질환 추적" },
    { type: "진단", name: "Z00.0 일반의학적 검사" },
    { type: "처방", name: "신장·체중·BMI 측정",        price:  5000 },
    { type: "처방", name: "혈압 측정",                  price:  3000 },
    { type: "처방", name: "흉부 X-ray PA",              price: 18000 },
    { type: "처방", name: "심전도 12-Lead",             price: 12000 },
    { type: "처방", name: "복부 초음파",                price: 80000 },
    { type: "처방", name: "갑상선 초음파",              price: 75000 },
    { type: "처방", name: "CBC 일반혈액검사",           price:  8000 },
    { type: "처방", name: "공복혈당",                   price:  4000 },
    { type: "처방", name: "당화혈색소 HbA1c",           price:  9000 },
    { type: "처방", name: "총콜레스테롤",               price:  6000 },
    { type: "처방", name: "HDL/LDL 콜레스테롤",         price:  8000 },
    { type: "처방", name: "트리글리세라이드",           price:  4500 },
    { type: "처방", name: "AST/ALT 간기능",             price:  5000 },
    { type: "처방", name: "BUN/Creatinine 신장기능",    price:  4500 },
    { type: "처방", name: "갑상선 호르몬 (TSH/FT4)",    price: 22000 },
    { type: "처방", name: "비타민 D",                   price: 18000 },
    { type: "처방", name: "소변 검사",                  price:  3000 },
    { type: "처방", name: "분변 잠혈 검사",             price:  5000 },
    { type: "특정내역", name: "JS001 종합건강검진" },
  ],
  // 일반 묶음 > 처방 > IV fluid — 다중 수액·전해질 조합 예시
  "ivf": [
    { type: "증상", name: "탈수 + 전해질 불균형" },
    { type: "처방", name: "0.9% 생리식염수 500ml",     price:  4500 },
    { type: "처방", name: "5% 포도당액 500ml",          price:  4800 },
    { type: "처방", name: "하트만액 1L",                price:  5200 },
    { type: "처방", name: "비타민 B 복합제 (수액 첨가)", price:  6800 },
    { type: "처방", name: "Mg 보충 주사",               price:  8500 },
    { type: "처방", name: "수액 셋트 + 카테터",         price:  3200 },
    { type: "처방", name: "고정 테이프",                price:   400 },
  ],
};

// setItems 빌더 — 1) NAMED_ITEMS (일반 묶음·주사) 먼저, 2) 나머지 카테고리는 SET_SEED 로 procedural.
// 각 대분류의 첫 항목은 자동으로 starred = true (즐겨찾기 노출).
const setItems: SetItem[] = (() => {
  const out: SetItem[] = [];
  let nextId = 1;
  const seenCats = new Set<string>();

  // 1) 실제 명칭이 정의된 카테고리 (일반 묶음, 주사)
  for (const n of NAMED_ITEMS) {
    const firstInCat = !seenCats.has(n.category);
    if (firstInCat) seenCats.add(n.category);
    const enriched = ENRICHED_ITEMS[n.code];
    out.push({
      id: nextId++,
      code: n.code,
      name: n.name,
      category: n.category,
      subCategory: n.sub,
      count: n.count,
      price: n.price,
      starred: firstInCat,
      ...(enriched ? { items: enriched } : {}),
    });
  }

  // 2) 나머지 카테고리는 procedural 시드로
  for (const main of SET_SEED) {
    let subIdx = 0;
    for (const sub of main.subs) {
      for (let i = 1; i <= sub.itemCount; i++) {
        const code = `${sub.codePrefix}${String(i).padStart(2, "0")}`;
        const priceVariance = (i - 1) * 800;
        const price = sub.basePrice + priceVariance;
        const starred = subIdx === 0 && i === 1;
        const enriched = ENRICHED_ITEMS[code];
        out.push({
          id: nextId++,
          code,
          name: `${sub.namePrefix} ${i}호`,
          category: main.category,
          subCategory: sub.sub,
          count: sub.count,
          price,
          starred,
          ...(enriched ? { items: enriched } : {}),
        });
      }
      subIdx++;
    }
  }
  return out;
})();

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

// (이전의 별도 "묶음" 탭(개별 처방 평탄 리스트)은 제거됨 — 세트가 곧 묶음으로 통합됨.
//  아래 BundleMainCategory / BUNDLE_CATEGORIES / bundleItems 정의는 더 이상 사용 안 되나
//  type 선언 호환을 위해 일단 유지. 추후 PR 에서 일괄 정리.)
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

// ── 묶음 상세 표시 helper ─────────────────────────────────────────────
// ENRICHED_ITEMS 에 정의되지 않은 묶음은 category/subCategory/count 로 procedural 항목 생성.
// Layout 3 의 split view 에서 모든 묶음이 우측 영역에 뭔가 보여지도록 fallback.
function deriveSetItems(item: SetItem): { type?: SetItemElementType; name: string; price?: number }[] {
  if (item.items && item.items.length > 0) return item.items;
  const result: { type?: SetItemElementType; name: string; price?: number }[] = [];
  const avg = Math.max(800, Math.floor(item.price / Math.max(item.count, 1)));
  if (item.category === "병명 묶음" || item.category === "증상 묶음") {
    result.push({ type: "진단", name: `${item.subCategory} 관련 진단` });
  }
  const itemCount = Math.max(item.count, 1);
  for (let i = 1; i <= itemCount; i++) {
    result.push({
      type: "처방",
      name: `${item.subCategory} 항목 ${i}호`,
      price: avg + (i - 1) * 250,
    });
  }
  return result;
}

// 유형별 (글자색, 셀 배경색) 매핑 — 내원이력·환자상세 모달·기존 expand 와 동일 톤.
const setTypeStyleOf = (t?: string): { color: string; bg: string } =>
  t === "증상"     ? { color: "var(--orange-700)", bg: "var(--status-warning-bg-subtle)" } :
  t === "진단"     ? { color: "var(--red-700)",    bg: "var(--status-error-bg-subtle)" } :
  t === "처방"     ? { color: "var(--green-700)",  bg: "var(--status-success-bg-subtle)" } :
  t === "특정내역" ? { color: "var(--violet-500)", bg: "var(--violet-050)" } :
                      { color: "var(--text-tertiary)", bg: "var(--bg-subtle)" };

// Layout 3 우측 상세 패널 — 선택된 묶음의 증상/진단/처방/특정내역 표시.
// 좁은 폭에 맞춘 컴팩트 테이블. 합계 행 sticky bottom.
function SetDetailView({ item }: { item: SetItem }) {
  const items = deriveSetItems(item);
  // 연속된 같은 유형끼리 그룹화 — 순서 유지
  type Group = { type: string; color: string; bg: string; items: typeof items };
  const groups: Group[] = [];
  for (const sub of items) {
    const last = groups[groups.length - 1];
    if (last && last.type === (sub.type ?? "—")) {
      last.items.push(sub);
    } else {
      const style = setTypeStyleOf(sub.type);
      groups.push({ type: sub.type ?? "—", color: style.color, bg: style.bg, items: [sub] });
    }
  }
  const sum = items.reduce((s, sub) => s + (sub.price ?? 0), 0);
  const hasPrice = items.some(s => s.price !== undefined);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* 우측 헤더 — 묶음 식별. sticky 로 스크롤 시 고정. */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0">
        <span className={`text-md flex-shrink-0 ${item.starred ? "text-[var(--orange-500)]" : "text-[var(--text-disabled)]"}`}>
          {item.starred ? "★" : "☆"}
        </span>
        <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0 truncate">{item.code}</span>
        <span className="text-xs font-bold text-[var(--text-main)] truncate flex-1 min-w-0">{item.name}</span>
        <button
          title="묶음 전체를 차트에 추가"
          onClick={() => alert(`'${item.name}' 묶음 전체(${items.length}건)를 차트에 추가`)}
          className="w-5 h-5 border border-[var(--line-default)] bg-white rounded-full flex items-center justify-center text-[var(--text-sub)] text-sm flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
          +
        </button>
      </div>
      {/* 내용 — 처방 多 시 스크롤 */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <tbody>
            {groups.map((g, gi) => (
              g.items.map((sub, i) => {
                const isLastRowOfGroup = i === g.items.length - 1;
                const isLastGroup = gi === groups.length - 1;
                const rowBorderClass = isLastRowOfGroup && !isLastGroup ? "border-b border-[var(--line-subtle)]" : "";
                return (
                  <tr key={`${gi}-${i}`} className={rowBorderClass}>
                    {i === 0 && (
                      <td
                        rowSpan={g.items.length}
                        onClick={() => alert(`'${g.type}' 카테고리 ${g.items.length}건을 차트에 추가\n— ${g.items.map(s => s.name).join(", ")}`)}
                        title={`${g.type} 카테고리 전체(${g.items.length}건) 차트에 추가`}
                        className="text-micro font-bold text-center align-middle w-9 whitespace-nowrap cursor-pointer hover:brightness-90 transition-all px-0.5"
                        style={{ color: g.color, background: g.bg }}
                      >
                        {g.type}
                      </td>
                    )}
                    <td
                      onClick={() => alert(`'${sub.name}' 차트에 추가`)}
                      title="클릭하여 차트에 추가"
                      className="text-xs text-[var(--text-main)] py-1 px-2 cursor-pointer hover:bg-[var(--bg-primary-subtle)] transition-colors"
                    >
                      {sub.name}
                    </td>
                    <td className="text-micro text-[var(--text-tertiary)] tabular-nums py-1 pr-2 text-right whitespace-nowrap">
                      {sub.price !== undefined ? `${sub.price.toLocaleString()}` : ""}
                    </td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>
      {/* 합계 — 가격 있는 항목 합산. 하단 고정. */}
      {hasPrice && (
        <div className="flex items-center justify-between px-2 py-1 bg-[var(--bg-subtle)] border-t border-[var(--line-default)] flex-shrink-0">
          <span className="text-xs font-bold text-[var(--text-main)]">합계</span>
          <span className="text-xs font-bold text-[var(--brand-primary)] tabular-nums">{sum.toLocaleString()}원</span>
        </div>
      )}
    </div>
  );
}

export function PanelE({
  quickMenuItems = INIT_QUICK_MENU,
  layout = 2,
  embedded = false,
  view = "all",
}: {
  quickMenuItems?: QuickMenuItem[];
  layout?: 1 | "1-a" | 2 | 3 | "dock";
  // dock 레이아웃: 헤더 (묶음/빠른메뉴 타이틀) 을 탭 라벨이 대신하므로 숨김.
  embedded?: boolean;
  // dock 레이아웃: 묶음 패널과 빠른메뉴 패널을 분리해서 표시.
  view?: "all" | "bundle" | "quick-menu";
} = {}) {
  // 묶음 영역 state (이전 "세트" 가 곧 묶음 — catalog 탭과 개별 처방 평탄 리스트는 제거됨)
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  // Layout 3 split view 전용 — 좌측 리스트에서 선택된 묶음 id. 우측 상세 패널의 source.
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [activeMain, setActiveMain] = useState("일반 묶음");
  const [activeSub, setActiveSub] = useState("전체");
  // 대·소분류 chip 펼침 상태 — false: 1줄 가로 스크롤, true: flex-wrap 으로 전체 노출
  const [mainExpanded, setMainExpanded] = useState(false);
  const [subExpanded,  setSubExpanded]  = useState(false);

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

  // (개별 처방 평탄 리스트 — bundleItems / BUNDLE_CATEGORIES 는 제거됨. 묶음 단일 카탈로그로 통합)

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

  // dock 레이아웃에서 view 별로 분리 렌더링.
  // view='bundle': 묶음만, view='quick-menu': 빠른메뉴만, view='all': 기존 PanelGroup.
  const showBundle = view !== "quick-menu";
  const showQuickPanel = view !== "bundle" && (showQuickMenu || view === "quick-menu");
  const showSharedMemoFooter = view === "all" && !showQuickMenu;

  return (
    <PanelGroup direction="vertical" className="w-full h-full">
      {/* 묶음처방 (상단) — Layout 1: 공유메모가 PanelB 로 이동했으므로 묶음·빠른메뉴가 풀공간 차지 */}
      {showBundle && (
      <Panel defaultSize={view === "bundle" ? 100 : (showQuickMenu ? 70 : 60)} minSize={25}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Header — 묶음 검색 + 신규 등록. 컴팩트화. embedded 면 타이틀 숨김 (탭 라벨로 식별). */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 border-b border-[var(--line-default)] flex-shrink-0">
          {!embedded && (
            <span className="text-sm font-medium text-[var(--text-main)] flex-shrink-0">묶음</span>
          )}
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7 flex-1 min-w-0">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[var(--text-tertiary)] truncate">묶음 검색</span>
          </div>
          <button className="w-6 h-6 border border-[var(--line-default)] rounded-[4px] flex items-center justify-center text-sm text-[var(--text-sub)] flex-shrink-0">⚙</button>
          <button
            onClick={() => setNewSetOpen(true)}
            title="현재 차트 내용으로 묶음 신규 등록"
            className="w-6 h-6 border border-[var(--line-default)] bg-white rounded-[4px] flex items-center justify-center text-[var(--text-sub)] text-lg hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors flex-shrink-0"
          >+</button>
        </div>

        {/* ────────── 묶음 (증상·진단·처방·특정내역 등 다양한 요소 포함) ────────── */}
        <>
            {/* 대분류 chips — 기본 1줄(가로 스크롤), 펼치면 wrap. 우측 토글 버튼. */}
            <div className="flex items-start gap-1 px-2.5 py-1 border-b border-[var(--line-default)] flex-shrink-0">
              <div className={`flex-1 min-w-0 flex gap-1 ${
                mainExpanded ? "flex-wrap" : "flex-nowrap overflow-x-auto chip-scroll"
              }`}>
                {MAIN_CATEGORIES.map((cat) => {
                  const active = activeMain === cat.label;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => { setActiveMain(cat.label); setActiveSub("전체"); }}
                      className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium border whitespace-nowrap transition-colors flex-shrink-0 ${
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
              <button
                onClick={() => setMainExpanded(v => !v)}
                title={mainExpanded ? "대분류 접기 — 1줄로 압축" : "대분류 펼치기 — 모든 분류를 한눈에"}
                aria-label={mainExpanded ? "대분류 접기" : "대분류 펼치기"}
                className="w-6 h-6 rounded-md text-[var(--text-sub)] border border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)] flex-shrink-0 inline-flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={`transition-transform ${mainExpanded ? "rotate-180" : ""}`}>
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* 중분류 chips — 동일한 패턴 (1줄 스크롤 ↔ wrap). 단, 소분류 갯수 ≤ 4 면 토글 숨김. */}
            <div className="flex items-start gap-1 px-2.5 py-1 bg-[var(--bg-base)] border-b border-[var(--line-default)] flex-shrink-0">
              <div className={`flex-1 min-w-0 flex gap-1 ${
                subExpanded ? "flex-wrap" : "flex-nowrap overflow-x-auto chip-scroll"
              }`}>
                {currentMain.subs.map(sub => {
                  const active = activeSub === sub.label;
                  return (
                    <button
                      key={sub.label}
                      onClick={() => setActiveSub(sub.label)}
                      className={`flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
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
              {currentMain.subs.length > 4 && (
                <button
                  onClick={() => setSubExpanded(v => !v)}
                  title={subExpanded ? "소분류 접기" : "소분류 펼치기"}
                  aria-label={subExpanded ? "소분류 접기" : "소분류 펼치기"}
                  className="w-6 h-6 rounded-md text-[var(--text-sub)] border border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)] flex-shrink-0 inline-flex items-center justify-center"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={`transition-transform ${subExpanded ? "rotate-180" : ""}`}>
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0">
              <span className="text-xs text-[var(--text-sub)]">
                {activeMain} <span className="text-[var(--text-tertiary)]">›</span> {activeSub} · <span className="font-bold text-[var(--text-main)]">{filteredSets.length}</span>개
              </span>
              <button className="text-xs text-[var(--text-sub)]">이름순 ▾</button>
            </div>

            {/* 묶음 List — Layout 3 은 좌우 split (좌: 코드+명칭 / 우: 선택 묶음의 상세).
                Layout 1·2 는 기존 stack expand/collapse 유지. */}
            {layout === 3 ? (() => {
              // 좌측 선택 — selectedSetId 가 현재 filter 결과에 없으면 첫 항목으로 fallback.
              const effectiveSelected = filteredSets.find(s => s.id === selectedSetId) ?? filteredSets[0];
              return (
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* 좌측: 코드 + 명칭 리스트 */}
                  <div className="w-[42%] min-w-[110px] flex-shrink-0 border-r border-[var(--line-default)] overflow-y-auto">
                    {filteredSets.length === 0 && (
                      <p className="text-xs text-[var(--text-tertiary)] py-3 text-center">조건에 맞는 묶음 없음</p>
                    )}
                    {filteredSets.map((item) => {
                      const active = effectiveSelected?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedSetId(item.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 border-b border-[var(--line-subtle)] cursor-pointer transition-colors ${
                            active
                              ? "bg-[var(--bg-primary-subtle)]"
                              : "hover:bg-[var(--bg-subtle)]"
                          }`}>
                          <span className={`text-sm flex-shrink-0 leading-none ${item.starred ? "text-[var(--orange-500)]" : "text-[var(--text-disabled)]"}`}>
                            {item.starred ? "★" : "☆"}
                          </span>
                          <span className="text-micro text-[var(--text-tertiary)] tabular-nums flex-shrink-0 truncate" style={{ maxWidth: "44px" }}>{item.code}</span>
                          <span className={`text-xs truncate flex-1 min-w-0 ${active ? "font-bold text-[var(--brand-primary)]" : "font-medium text-[var(--text-main)]"}`}>
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* 우측: 선택된 묶음 상세 */}
                  {effectiveSelected ? (
                    <SetDetailView item={effectiveSelected} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs text-[var(--text-tertiary)]">묶음을 선택하세요</span>
                    </div>
                  )}
                </div>
              );
            })() : (
            <div className="flex-1 overflow-y-auto">
              {filteredSets.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] py-3 text-center">조건에 맞는 묶음 없음</p>
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
                                      {/* 카테고리 라벨 셀 — 클릭 시 그 카테고리 전체 항목을 차트에 추가 (prototype: 토스트로만 안내) */}
                                      {i === 0 && (
                                        <td
                                          rowSpan={g.items.length}
                                          onClick={() => alert(`'${g.type}' 카테고리 ${g.items.length}건을 차트에 추가\n— ${g.items.map(s => s.name).join(", ")}`)}
                                          title={`${g.type} 카테고리 전체(${g.items.length}건) 차트에 추가`}
                                          className="text-xs font-bold text-center align-middle w-14 whitespace-nowrap cursor-pointer hover:brightness-90 transition-all"
                                          style={{ color: g.color, background: g.bg }}
                                        >
                                          {g.type}
                                        </td>
                                      )}
                                      {/* 개별 항목 셀 — 클릭 시 그 항목만 차트에 추가 */}
                                      <td
                                        onClick={() => alert(`'${sub.name}' 차트에 추가`)}
                                        title="클릭하여 차트에 추가"
                                        className="text-sm text-[var(--text-main)] py-1 px-2.5 cursor-pointer hover:bg-[var(--bg-primary-subtle)] transition-colors"
                                      >
                                        {sub.name}
                                      </td>
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
            )}
          </>

      </div>
      </Panel>
      )}

      {/* 빠른메뉴 — Layout 2 에서는 숨김 (showQuickMenu=false). Layout 1 에서는 공유메모가 PanelB 로 이동돼 비중 30% 로 확대.
          dock: view='quick-menu' 단독 패널로도 사용. */}
      {showQuickPanel && (
        <>
          {showBundle && <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />}
          <Panel defaultSize={view === "quick-menu" ? 100 : 30} minSize={10}>
            <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
              {/* 헤더 — 검색. 컴팩트화. embedded 면 타이틀 숨김. */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 border-b border-[var(--line-default)] flex-shrink-0">
                {!embedded && (
                  <span className="text-sm font-medium text-[var(--text-main)]">빠른메뉴</span>
                )}
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
          Layout 1 에서는 PanelB 의 SharedMemoCard 슬롯으로 이동되어 여기엔 표시 안 함.
          dock 레이아웃에서는 PanelE 가 view 별로 분리되어 공유메모 푸터를 사용하지 않음. */}
      {showSharedMemoFooter && (
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
