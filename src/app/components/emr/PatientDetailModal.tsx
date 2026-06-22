// 환자 자세히보기 모달 — 진료실에서 환자명 클릭 등 다양한 진입점에서 열림
//
// 구조:
//   - Header (상시 노출): 식별(차트번호·이름·알러지·보험) / 진료 컨텍스트(좌) / 원무 컨텍스트(우)
//   - Tabs: 기본정보 ⭐ / 내원이력 / 바이탈 / 파일 / 약물 / 예약
//
// 진입점 별 첫 탭:
//   - 환자명 클릭 → "기본정보"
//   - 내원이력 자세히보기 → "내원이력"
//   - 약물 알러지 칩 클릭 → "처방금지"
//   - 등등 — initialTab prop 으로 제어
//
// 1단계 구현 범위: Header + 기본정보 탭. 다른 탭은 "준비 중" placeholder.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BannedDrug } from "./PanelD";
import type { HistoryDx, HistoryRx } from "./chartTypes";

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 타입 정의
// ╚══════════════════════════════════════════════════════════════════════════════
export type PatientDetailTab =
  | "기본정보"
  | "내원이력"
  | "바이탈"
  | "파일"
  | "처방금지"
  | "예약이력";

// 기본정보 탭 내부의 sub-section 식별자 — 헤더 chip 클릭 시 해당 섹션으로 스크롤.
export type BasicInfoFocus = "insurance" | "checkup";

// 환자 자세히보기 상세 정보 모델 — PanelA 의 Patient 보다 풍부.
// 실제로는 PanelA Patient + 원무·보험·가족 정보를 합친 형태.
export type PatientDetail = {
  // 식별
  chartNo: string;
  name: string;
  birth: string;            // "1980-07-15"
  gender: "남" | "여";
  rrn: string;              // 주민번호 (마스킹된 형태로 저장 가능)
  phone: string;
  homePhone?: string;
  emergencyPhone?: string;
  address?: string;
  occupation?: string;

  // 임상 상태 — 처방 안전성 판단에 영향. 임산부는 약물 처방 시 카테고리 검증 필요.
  // gender === "여" 일 때만 의미를 가짐.
  isPregnant?: boolean;
  pregnancyWeeks?: number;        // 임신 주수 (1~42 정도. isPregnant=true 일 때만 사용)

  // 원내 분류
  patientGroup?: string;        // 환자그룹 (병원 자체 분류 — VIP·만성·임직원 등)
  patientTypes: string[];       // 환자유형 태그 (만성질환·고혈압·당뇨 등 다중 가능)
  // 공유메모 — 진료실의 PanelMemo 와 동일한 채팅형 메모. 환자에 묶인 다자간 메시지.
  sharedMemos: {
    id: number;
    author: string;
    authorRole?: "원장" | "간호사" | "데스크" | "기타";
    message: string;            // \n 허용
    timestamp: string;          // "3/14 11:20"
  }[];
  // 상단 고정 공지 (optional) — PanelMemo 의 공지 아코디언과 동일 개념
  notice?: {
    message: string;
    author: string;
    timestamp: string;
  };

  // 안전 정보
  // 처방금지 약품 — 약물 탭에서 CRUD. 헤더 칩 카운트도 bannedDrugs.length 사용.
  // 진료실 BannedDrug 와 동일 shape (PanelD 에서 export) — 추후 환자별 공유 가능.
  bannedDrugs: BannedDrug[];

  // 보험 정보
  insurance: {
    type: "건강보험" | "의료급여" | "산재" | "일반";
    isVerified: boolean;        // 수진자조회 결과 — 자격 확인 여부
    verifiedAt?: string;        // 마지막 자격 확인 일시 (YYYY-MM-DD HH:MM)
    coverageRate: number;       // 본인부담률 (%, 예: 30 / 5 (산정특례) 등)
    cardNumber?: string;        // 보험증 번호
    coverageStart?: string;     // 자격 시작일
    coverageEnd?: string;       // 자격 종료일
    specialCoverage?: {         // 산정특례
      code: string;             // 등록 코드 (예: V193)
      diseaseName: string;      // 등록 질환명
      startDate: string;        // 시작일
      endDate: string;          // 만료일
    };
  };

  // 공단검진 — 국민건강보험공단 검진 대상·수검 내역. 검진 종류별로 행 단위 관리.
  nationalScreenings: {
    type: string;               // "일반건강검진", "위암검진", "자궁경부암검진", "대장암검진" 등
    targetYear: number;         // 대상 년도
    status: "대상" | "수검완료" | "미대상";
    lastCheckedAt?: string;     // 마지막 수검일 (있을 때만)
  }[];

  // 가족 정보 — 표 컬럼: 차트번호 / 이름 / 성별·나이 / 휴대폰 / 관계 + 환자 상세보기 액션
  family: {
    chartNo?: string;           // 가족 차트번호 (있으면 "환자 상세보기" 활성)
    name: string;
    relation: string;           // "딸" "배우자" "부" "모" 등
    birth?: string;             // ISO date "2007-05-12"
    phone?: string;
    age?: number;
    gender?: "남" | "여";        // 성별 (표에 "여/45" 형태로 노출)
  }[];

  // 원무 요약 (헤더 우측 노출)
  admin: {
    unpaidAmount: number;       // 미수금 합계
    isSelfVerified: boolean;    // 본인확인 완료 여부
    visitCount: number;         // 누적 방문 횟수
  };

  // 방문 컨텍스트 (헤더 좌측 노출)
  lastVisit?: string;           // 최근 내원일 "2026-04-12"
  nextAppointment?: string;     // 예약일 "2026-05-20"

  // 내원 이력 — 내원이력 탭에서 사용 (date desc 정렬 가정)
  visits: VisitRecord[];

  // 바이탈 기록 — 바이탈 탭에서 사용 (measuredAt desc 정렬 가정)
  vitals: VitalRecord[];

  // 예약 이력 — 예약이력 탭에서 사용. 과거 + 미래 예약 모두 포함, scheduledAt desc 정렬 가정.
  appointments: Appointment[];
};

// 내원 1회 분 — 좌측 목록(요약) + 우측 상세(증상·병명·처방·수납)
export type VisitRecord = {
  id: string;
  date: string;                 // "2026-04-12"
  visitTime?: string;           // "16:06"
  visitKind: "외래" | "입원";   // 외래/입원 구분 (현재 표에선 미노출, 추후 사용)
  visitOrder: "초진" | "재진";   // 초/재진 — 표의 "초재진" 컬럼에 노출
  insType: "건강보험" | "의료급여" | "산재" | "일반";  // 그 회차의 보험 정보
  doctor: string;
  result: "계속" | "종결";       // 진료결과
  starred?: boolean;            // 관심 표시
  reviewed?: boolean;           // 리뷰 완료
  // 처방 구분 약식 (주/물/방 등 — 자유 텍스트, 좌측 목록에 짧게 노출)
  prescriptionTag?: string;
  medCount?: number;            // 약 건수
  // 가산 flags — 초/야/휼/비 (사진 컬럼명)
  surcharges?: { 초?: boolean; 야?: boolean; 휼?: boolean; 비?: boolean };
  exception?: string;           // 예외사유 (자유 텍스트)

  // 상세 (우측 패널)
  symptoms?: string;            // 증상 자유 텍스트
  diagnoses: { code: string; name: string }[];   // 병명
  prescriptions: {                                // 처방
    code: string;
    name: string;
    dose?: string;              // 용량 (예: "1", "2.5")
    perDay?: string;            // 1일 투여 횟수
    days?: string;              // 일수
    unitPrice?: number;         // 단가 (원). 행별 표시 — 보험수가/판매단가 기준.
    flag?: "보" | "청" | "일" | "비"; // 보험/청구/일반/비급여 등 우측 작은 칩
  }[];

  // 수납 — 환자 부담 / 감액 / 수납액 / 미수금 / 환불금으로 분해
  payment: {
    patientTotal: number;       // 환자 부담 총액 (보험 차감 후 환자 몫)
    discount: number;           // 감액 (카드/보훈/사회복지 등)
    paid: number;               // 수납액 (실제 받은 금액)
    unpaid: number;             // 미수금
    refund: number;             // 환불금
    status: "수납완료" | "수납대기" | "부분수납";
    method?: "카드" | "현금" | "복합";
    paidAt?: string;            // 수납일시 (YYYY-MM-DD HH:MM)
  };

  // 이미지·메모 — 펼쳐보기 sub-tab "이미지"/"메모" 에 대응
  images?: { id: string; name: string }[];
  memo?: string;
};

// 예약 한 건 — 예약이력 탭의 표 한 행에 대응
export type AppointmentStatus = "예약" | "완료" | "노쇼" | "취소";
export type Appointment = {
  id: string;
  scheduledAt: string;        // "2026-06-15 14:30"
  room: string;               // "1진료실" "건강검진실"
  doctor: string;
  type: string;               // "외래" / "검진" / "물리치료" / "처치" 등
  memo: string;
  status: AppointmentStatus;
  // 수정 이력 — 누가 / 언제 / 무엇을 변경
  history: {
    timestamp: string;
    actor: string;
    action: string;
  }[];
};

// 바이탈 측정 한 행 — 측정일시 + 9개 측정 항목.
export type VitalRecord = {
  id: string;
  measuredAt: string;        // "2026-05-19 09:42"
  systolic?: number;         // 수축기 혈압 (mmHg)
  diastolic?: number;        // 이완기 혈압 (mmHg)
  pulse?: number;            // 맥박 (bpm)
  temperature?: number;      // 체온 (°C)
  bloodSugar?: number;       // 혈당 (mg/dL)
  weight?: number;           // 체중 (kg)
  height?: number;           // 신장 (cm)
  bmi?: number;              // BMI
  waist?: number;            // 허리둘레 (cm)
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 더미 데이터 — 1단계용. 추후 patientId 기반 lookup 으로 대체.
// ╚══════════════════════════════════════════════════════════════════════════════
const DUMMY_PATIENT: PatientDetail = {
  chartNo: "100236",
  name: "황미진",
  birth: "1980-07-15",
  gender: "여",
  rrn: "800715-2******",
  phone: "010-1234-5678",
  homePhone: "02-555-1234",
  emergencyPhone: "010-9876-5432 (배우자)",
  address: "서울특별시 강남구 테헤란로 123, 4층 401호",
  occupation: "회사원",

  patientGroup: "GC Cell",
  patientTypes: ["만성질환", "고혈압", "당뇨"],
  sharedMemos: [
    { id: 1, author: "이간호사", authorRole: "간호사", message: "자보 서류 제출 완료 확인", timestamp: "3/14 11:20" },
    { id: 2, author: "박데스크", authorRole: "데스크", message: "보험사 담당자 연락처:\n010-9999-8888 (홍길동)", timestamp: "3/15 14:00" },
    { id: 3, author: "김원장", authorRole: "원장",   message: "임신성 당뇨 과거력 있음. 카페인 제한 권고.", timestamp: "3/16 09:42" },
    { id: 4, author: "이간호사", authorRole: "간호사", message: "다음 방문 시 공복혈당 재측정 필요", timestamp: "4/02 10:15" },
  ],
  notice: {
    message: "건보/자보 동시 진행 환자 — 차트 분리하여 청구",
    author: "김원장",
    timestamp: "3/12 10:00",
  },

  bannedDrugs: [
    {
      id: "bd-dummy-1",
      registeredAt: "1995-03-15",
      drugName: "페니실린",
      ingredientCode: "PEN-000001",
      memo: "두드러기·아나필락시스 (1995)",
      banSameIngredient: true,
      allowPrescribe: false,
    },
    {
      id: "bd-dummy-2",
      registeredAt: "2010-09-08",
      drugName: "아스피린",
      ingredientCode: "ASA-000045",
      memo: "위장출혈 과거력",
      banSameIngredient: false,
      allowPrescribe: false,
    },
  ],

  insurance: {
    type: "건강보험",
    isVerified: true,
    verifiedAt: "2026-05-07 09:14",
    coverageRate: 30,
    cardNumber: "1-1234567890",
    coverageStart: "2024-01-01",
    coverageEnd: "2026-12-31",
    specialCoverage: {
      code: "V193",
      diseaseName: "본태성 고혈압 (산정특례)",
      startDate: "2025-07-01",
      endDate: "2026-06-30",
    },
  },

  nationalScreenings: [
    { type: "일반건강검진",     targetYear: 2026, status: "대상",     lastCheckedAt: "2024-08-15" },
    { type: "위암검진",         targetYear: 2026, status: "대상",     lastCheckedAt: "2024-08-15" },
    { type: "자궁경부암검진",   targetYear: 2026, status: "수검완료", lastCheckedAt: "2026-02-10" },
  ],

  family: [
    { chartNo: "100412", name: "김허나", relation: "자녀",   birth: "2007-05-12", phone: "010-2424-8585", age: 19, gender: "여" },
    { chartNo: "100089", name: "박혜은", relation: "배우자", birth: "1977-12-30", phone: "010-9876-5432", age: 48, gender: "여" },
  ],

  admin: {
    unpaidAmount: 12300,
    isSelfVerified: true,
    visitCount: 24,
  },

  lastVisit: "2026-04-12",
  nextAppointment: "2026-05-20",

  visits: [
    {
      id: "v-2026-04-12",
      date: "2026-04-12", visitTime: "16:06", visitKind: "외래", visitOrder: "재진", insType: "건강보험", doctor: "김다영",
      result: "계속", starred: false, reviewed: true,
      prescriptionTag: "주/물/방", medCount: 5,
      surcharges: { 초: false, 야: false },
      symptoms: "허리통증, 엉덩이도 아픔\nBoth L45S1 mbb\nBoth psoas\n수요일 진료",
      diagnoses: [
        { code: "M5457-2", name: "아래허리긴장, 요천추부" },
        { code: "M51.1",   name: "신경뿌리병증을 동반한 요추 및 기타 추간판 장애" },
        { code: "M13.98",  name: "상세불명의 관절염, 기타 부분" },
        { code: "K21.9",   name: "식도염을 동반하지 않은 위-식도역류병" },
      ],
      prescriptions: [
        { code: "ceremin",  name: "쎄레민캡슐100mg(내복)",                    dose: "2",   perDay: "2", days: "1", unitPrice: 120,    flag: "보" },
        { code: "epesi",    name: "에페시나정",                              dose: "2",   perDay: "2", days: "1", unitPrice: 95,     flag: "보" },
        { code: "rabe10",   name: "라베졸정10mg",                            dose: "2",   perDay: "2", days: "1", unitPrice: 180,    flag: "보" },
        { code: "lyrica75", name: "리리카캡슐75mg(내복)",                     dose: "2",   perDay: "2", days: "1", unitPrice: 540,    flag: "보" },
        { code: "lmbb2",    name: "척수신경총,신경근및신경절차단술-후지내측지", dose: "2.5", perDay: "1", days: "1", unitPrice: 28400,  flag: "보" },
      ],
      payment: { patientTotal: 86500, discount: 2000, paid: 84500, unpaid: 0, refund: 0, status: "수납완료", method: "카드", paidAt: "2026-04-12 16:35" },
      images: [{ id: "img-1", name: "MRI L-spine.png" }, { id: "img-2", name: "X-ray AP.png" }],
      memo: "주사 후 안정. 다음주 재진 예정.",
    },
    {
      id: "v-2026-03-22",
      date: "2026-03-22", visitTime: "10:14", visitKind: "외래", visitOrder: "재진", insType: "건강보험", doctor: "이지원",
      result: "계속", starred: true, reviewed: true,
      prescriptionTag: "주/물", medCount: 3,
      symptoms: "허리통증 지속, 좌측 둔부 방사통",
      diagnoses: [
        { code: "M5457-2", name: "아래허리긴장, 요천추부" },
        { code: "M51.1",   name: "신경뿌리병증을 동반한 요추 추간판 장애" },
      ],
      prescriptions: [
        { code: "ceremin", name: "쎄레민캡슐100mg(내복)", dose: "2", perDay: "2", days: "5", unitPrice: 120,  flag: "보" },
        { code: "epesi",   name: "에페시나정",            dose: "2", perDay: "2", days: "5", unitPrice: 95,   flag: "보" },
        { code: "exer",    name: "단순운동치료[1일당]",     dose: "1", perDay: "1", days: "1", unitPrice: 6800, flag: "보" },
      ],
      payment: { patientTotal: 27800, discount: 0, paid: 27800, unpaid: 0, refund: 0, status: "수납완료", method: "카드", paidAt: "2026-03-22 10:48" },
    },
    {
      id: "v-2026-02-14",
      date: "2026-02-14", visitTime: "14:30", visitKind: "외래", visitOrder: "재진", insType: "건강보험", doctor: "김지혜",
      result: "계속", reviewed: false,
      prescriptionTag: "주/물/방", medCount: 5,
      symptoms: "고혈압 정기 진료, 혈압 142/90",
      diagnoses: [
        { code: "I10",   name: "본태성(원발성) 고혈압" },
        { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
      ],
      prescriptions: [
        { code: "novasc5", name: "노바스크정5mg",   dose: "1", perDay: "1", days: "30", unitPrice: 480, flag: "보" },
        { code: "metf500", name: "메트포민정500mg", dose: "1", perDay: "2", days: "30", unitPrice: 65,  flag: "보" },
      ],
      payment: { patientTotal: 12300, discount: 0, paid: 0, unpaid: 12300, refund: 0, status: "수납대기" },
      memo: "혈압 약 복용 잘 하고 있음. 다음 방문 시 공복혈당 재측정.",
    },
    {
      id: "v-2026-01-08",
      date: "2026-01-08", visitTime: "09:42", visitKind: "외래", visitOrder: "재진", insType: "일반", doctor: "김다영",
      result: "계속", reviewed: true,
      prescriptionTag: "주", medCount: 2,
      symptoms: "감기, 인후통",
      diagnoses: [
        { code: "J00",   name: "급성비인두염[코감기]" },
        { code: "J20.9", name: "상세불명의 급성 기관지염" },
      ],
      prescriptions: [
        { code: "tyler",   name: "타이레놀이알서방정",  dose: "1",  perDay: "3", days: "3", unitPrice: 80,  flag: "보" },
        { code: "codepf",  name: "코대원포르테시럽",    dose: "10", perDay: "3", days: "3", unitPrice: 320, flag: "보" },
      ],
      payment: { patientTotal: 9600, discount: 0, paid: 9600, unpaid: 0, refund: 0, status: "수납완료", method: "현금", paidAt: "2026-01-08 10:05" },
    },
    {
      id: "v-2025-12-19",
      date: "2025-12-19", visitTime: "15:20", visitKind: "외래", visitOrder: "초진", insType: "건강보험", doctor: "이지원",
      result: "계속", reviewed: true,
      prescriptionTag: "주/방", medCount: 3,
      symptoms: "고혈압 추적관찰. 일부 약 처방 변경으로 환불 발생.",
      diagnoses: [{ code: "I10", name: "본태성(원발성) 고혈압" }],
      prescriptions: [
        { code: "novasc5", name: "노바스크정5mg", dose: "1", perDay: "1", days: "60", unitPrice: 480, flag: "보" },
      ],
      payment: { patientTotal: 20200, discount: 2000, paid: 13200, unpaid: 5000, refund: 0, status: "부분수납", method: "카드", paidAt: "2025-12-19 15:50" },
      images: [{ id: "img-3", name: "혈압 그래프.png" }],
    },
  ],

  // 바이탈 — 최근 → 과거 순. 일부 항목은 미측정 (undefined) 으로 비워둠.
  vitals: [
    { id: "vt-1", measuredAt: "2026-05-15 14:20", systolic: 142, diastolic: 88, pulse: 76, temperature: 36.5, bloodSugar: 115, weight: 62.1, height: 162, bmi: 23.7, waist: 85.4 },
    { id: "vt-2", measuredAt: "2026-05-08 10:15", systolic: 138, diastolic: 86, pulse: 72, temperature: 36.4, weight: 62.0, height: 162, bmi: 23.6, waist: 85.0 },
    { id: "vt-3", measuredAt: "2026-04-12 16:00", systolic: 145, diastolic: 92, pulse: 80, temperature: 36.6, bloodSugar: 124, weight: 62.3, height: 162, bmi: 23.7 },
    { id: "vt-4", measuredAt: "2026-03-22 10:10", systolic: 140, diastolic: 88, pulse: 74, temperature: 36.5, weight: 62.5, height: 162, bmi: 23.8 },
    { id: "vt-5", measuredAt: "2026-02-14 14:25", systolic: 142, diastolic: 90, pulse: 78, temperature: 36.7, bloodSugar: 132, weight: 62.4, height: 162, bmi: 23.8, waist: 85.8 },
  ],

  // 예약 이력 — 미래(예정) + 과거(완료/노쇼/취소) 혼합. action 은 간략 표기.
  appointments: [
    {
      id: "appt-1",
      scheduledAt: "2026-05-20 14:00",
      room: "1진료실",
      doctor: "김다영",
      type: "외래",
      memo: "혈압 약 처방 갱신",
      status: "예약",
      history: [
        { timestamp: "2026-04-12 16:35", actor: "박데스크", action: "예약" },
      ],
    },
    {
      id: "appt-2",
      scheduledAt: "2026-04-12 16:00",
      room: "1진료실",
      doctor: "김다영",
      type: "외래",
      memo: "허리통증 추적관찰",
      status: "완료",
      history: [
        { timestamp: "2026-03-22 10:48", actor: "박데스크", action: "예약" },
        { timestamp: "2026-04-12 16:35", actor: "김다영",   action: "예약 → 완료" },
      ],
    },
    {
      id: "appt-3",
      scheduledAt: "2026-03-22 10:00",
      room: "2진료실",
      doctor: "이지원",
      type: "외래",
      memo: "MRI 결과 확인",
      status: "완료",
      history: [
        { timestamp: "2026-02-14 14:55", actor: "박데스크", action: "예약" },
        { timestamp: "2026-03-22 10:14", actor: "이지원",   action: "예약 → 완료" },
      ],
    },
    {
      id: "appt-4",
      scheduledAt: "2026-03-08 11:00",
      room: "건강검진실",
      doctor: "김지혜",
      type: "검진",
      memo: "건강검진 (공복 8시간)",
      status: "노쇼",
      history: [
        { timestamp: "2026-02-10 09:30", actor: "박데스크", action: "예약" },
        { timestamp: "2026-03-08 12:15", actor: "박데스크", action: "예약 → 노쇼" },
      ],
    },
    {
      id: "appt-5",
      scheduledAt: "2026-02-28 15:30",
      room: "1진료실",
      doctor: "김다영",
      type: "물리치료",
      memo: "허리 견인",
      status: "취소",
      history: [
        { timestamp: "2026-02-14 14:55", actor: "박데스크", action: "예약" },
        { timestamp: "2026-02-27 18:20", actor: "이데스크", action: "14:00 → 15:30" },
        { timestamp: "2026-02-28 09:10", actor: "환자 본인", action: "예약 → 취소" },
      ],
    },
    {
      id: "appt-6",
      scheduledAt: "2026-02-14 14:30",
      room: "1진료실",
      doctor: "김지혜",
      type: "외래",
      memo: "고혈압 정기 진료",
      status: "완료",
      history: [
        { timestamp: "2026-01-15 11:00", actor: "박데스크", action: "예약" },
        { timestamp: "2026-02-14 14:55", actor: "김지혜",   action: "예약 → 완료" },
      ],
    },
  ],
};

// ── 김허나 (황미진의 딸) — 가족 환자명 클릭 시 노출되는 별도 환자 ────────────
const PATIENT_KIMHEONA: PatientDetail = {
  chartNo: "100412",
  name: "김허나",
  birth: "2007-05-12",
  gender: "여",
  rrn: "070512-4******",
  phone: "010-2424-8585",
  homePhone: "02-555-1234",
  emergencyPhone: "010-1234-5678 (어머니 황미진)",
  address: "서울특별시 강남구 테헤란로 123, 4층 401호",
  occupation: "학생 (대학교 2학년)",

  patientGroup: "GC Cell",
  patientTypes: ["일반"],

  sharedMemos: [
    { id: 1, author: "박데스크", authorRole: "데스크", message: "보호자(어머니 황미진) 동반 진료", timestamp: "3/20 14:00" },
  ],

  bannedDrugs: [],

  insurance: {
    type: "건강보험",
    isVerified: true,
    verifiedAt: "2026-05-15 11:20",
    coverageRate: 30,
    cardNumber: "1-1234567890",  // 어머니 직장보험의 피부양자
    coverageStart: "2024-01-01",
    coverageEnd: "2026-12-31",
    // 산정특례 없음
  },

  nationalScreenings: [
    { type: "학생건강검진", targetYear: 2025, status: "수검완료", lastCheckedAt: "2025-04-10" },
  ],

  family: [
    { chartNo: "100236", name: "황미진", relation: "부모", age: 45, birth: "1980-07-15", phone: "010-1234-5678", gender: "여" },
    { chartNo: "100089", name: "박혜은", relation: "기타", age: 48, birth: "1977-12-30", phone: "010-9876-5432", gender: "여" },
  ],

  admin: {
    unpaidAmount: 0,
    isSelfVerified: true,
    visitCount: 4,
  },

  lastVisit: "2026-03-20",
  nextAppointment: undefined,

  visits: [
    {
      id: "kh-v-2026-03-20",
      date: "2026-03-20", visitTime: "14:00", visitKind: "외래", visitOrder: "재진", insType: "건강보험", doctor: "이지원",
      result: "계속", starred: false, reviewed: true,
      prescriptionTag: "주",
      medCount: 2,
      symptoms: "감기 증상 — 인후통, 미열",
      diagnoses: [
        { code: "J00", name: "급성비인두염[코감기]" },
      ],
      prescriptions: [
        { code: "tyler",   name: "타이레놀이알서방정",  dose: "1",  perDay: "3", days: "3", unitPrice: 80,  flag: "보" },
        { code: "codepf",  name: "코대원포르테시럽",    dose: "10", perDay: "3", days: "3", unitPrice: 320, flag: "보" },
      ],
      payment: { patientTotal: 8500, discount: 0, paid: 8500, unpaid: 0, refund: 0, status: "수납완료", method: "카드", paidAt: "2026-03-20 14:30" },
    },
    {
      id: "kh-v-2025-11-04",
      date: "2025-11-04", visitTime: "10:30", visitKind: "외래", visitOrder: "재진", insType: "건강보험", doctor: "김지혜",
      result: "계속", reviewed: true,
      prescriptionTag: "주",
      medCount: 1,
      symptoms: "독감 예방접종",
      diagnoses: [],
      prescriptions: [
        { code: "flu4v", name: "독감 4가 백신", dose: "1", perDay: "1", days: "1", unitPrice: 35000, flag: "비" },
      ],
      payment: { patientTotal: 35000, discount: 0, paid: 35000, unpaid: 0, refund: 0, status: "수납완료", method: "카드", paidAt: "2025-11-04 10:55" },
    },
  ],

  vitals: [
    { id: "kh-vt-1", measuredAt: "2026-03-20 14:05", systolic: 110, diastolic: 70, pulse: 78, temperature: 37.2, weight: 53.0, height: 164, bmi: 19.7 },
    { id: "kh-vt-2", measuredAt: "2025-11-04 10:35", systolic: 108, diastolic: 68, pulse: 72, temperature: 36.5, weight: 52.5, height: 164, bmi: 19.5 },
  ],

  appointments: [
    {
      id: "kh-appt-1",
      scheduledAt: "2026-03-20 14:00",
      room: "2진료실",
      doctor: "이지원",
      type: "외래",
      memo: "감기 진료",
      status: "완료",
      history: [
        { timestamp: "2026-03-19 17:30", actor: "박데스크", action: "예약" },
        { timestamp: "2026-03-20 14:35", actor: "이지원",   action: "예약 → 완료" },
      ],
    },
  ],
};

// 환자 ID → 환자 상세정보 매핑. PatientDetailModal 에서 patientId 로 lookup.
// 등록되지 않은 ID 는 DUMMY_PATIENT (황미진) 로 fallback.
const DUMMY_PATIENTS: Record<string, PatientDetail> = {
  "100236": DUMMY_PATIENT,        // 황미진
  "100412": PATIENT_KIMHEONA,     // 김허나 (딸)
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 유틸
// ╚══════════════════════════════════════════════════════════════════════════════
// 생년월일 ISO → "만 나이" 계산
const calcAge = (birthISO: string): number => {
  const b = new Date(birthISO);
  if (Number.isNaN(b.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};

// ISO 날짜를 "YYYY.MM.DD" 로 포맷
const fmtDate = (iso: string): string => iso.replaceAll("-", ".");

// 산정특례 만료까지 남은 일수
const daysUntil = (iso: string): number => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 메인 컴포넌트
// ╚══════════════════════════════════════════════════════════════════════════════
export function PatientDetailModal({
  patientId,
  initialTab = "기본정보",
  onClose,
  onJumpToPatient,
  onRepeatRx,
  onRepeatDx,
  onRepeatAll,
  currentChartName,
  currentChartNo,
  initialPersonalEdit = false,
}: {
  patientId?: string;
  initialTab?: PatientDetailTab;
  onClose: () => void;
  // 가족 이름 클릭 시 다른 환자의 상세정보 팝업으로 점프. EmrScreen 의 openPatientDetail 에 연결.
  onJumpToPatient?: (chartNo: string, initialTab: PatientDetailTab) => void;
  // 내원이력 탭의 처방·진단 행 클릭 시 현재 열린 차트(EmrScreen 의 todayRx/Dx)에 추가.
  // PanelC 의 onRepeatRx/Dx/All 과 동일한 시그니처·동작 — 모달에서도 동일하게 리피트 가능.
  onRepeatRx?: (items: HistoryRx[]) => void;
  onRepeatDx?: (items: HistoryDx[]) => void;
  onRepeatAll?: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  // 현재 차트 정보 — 모달의 환자와 다를 때 안내 배너에 사용 ("→ {currentChartName} 차트에 추가").
  currentChartName?: string;
  currentChartNo?: string;
  // 모달 진입 시 인적사항 섹션 자동 편집 — PanelB 편집 아이콘에서 진입할 때 사용.
  initialPersonalEdit?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<PatientDetailTab>(initialTab);
  const [show, setShow] = useState(false);
  // 기본정보 탭 내 특정 섹션으로 스크롤 — 헤더의 보험정보/공단검진 chip 클릭 시 활용.
  // null 이면 스크롤 동작 없음. 한 번 적용된 후 자동으로 null 로 리셋되어 다시 같은 chip 을 눌러도 재트리거.
  const [basicInfoFocus, setBasicInfoFocus] = useState<BasicInfoFocus | null>(null);
  // 모달 진입 시 인적사항 자동 편집 모드 — 한 번 적용 후 false 로 리셋되어 같은 환자를 재오픈해도 다시 작동.
  const [personalEditTrigger, setPersonalEditTrigger] = useState<boolean>(initialPersonalEdit);
  // 환자 ID 로 lookup. 등록되지 않은 ID 는 기본 황미진 데이터로 fallback.
  const p = (patientId && DUMMY_PATIENTS[patientId]) || DUMMY_PATIENT;
  // 모달의 환자가 현재 진료 중인 차트와 다른지 — 다르면 "→ 현재차트로 추가" 안내 노출
  const isDifferentChart = !!currentChartNo && currentChartNo !== p.chartNo;

  // ── 모달리스 팝업 위치 (드래그 가능) ──
  // 처음엔 화면 중앙에 위치. 사용자가 헤더를 잡고 드래그하면 위치 갱신.
  // 팝업이 떠 있어도 하단 차트(PanelD 등) 인터렉션 가능 — 외곽은 pointer-events-none.
  const POPUP_W = 1200;
  const POPUP_H_RATIO = 0.85;
  const computeCenterPos = () => {
    if (typeof window === "undefined") return { x: 50, y: 50 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(POPUP_W, vw * 0.95);
    const h = Math.min(vh * POPUP_H_RATIO, vh * 0.92);
    return { x: Math.max(8, (vw - w) / 2), y: Math.max(8, (vh - h) / 2) };
  };
  const [pos, setPos] = useState(computeCenterPos);
  const [dragging, setDragging] = useState(false);
  // 드래그 시작 시 마우스↔팝업 좌상단 offset 을 기록 — mousemove 동안 일정하게 유지.
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setDragging(true);
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(POPUP_W, vw * 0.95);
      const h = Math.min(vh * POPUP_H_RATIO, vh * 0.92);
      // 화면 안에 일정 부분(60px)은 항상 보이도록 클램프 — 완전히 화면 밖으로 끌고가는 것 방지.
      const minVisible = 60;
      const nx = Math.min(vw - minVisible, Math.max(minVisible - w, e.clientX - dragOffset.current.dx));
      const ny = Math.min(vh - minVisible, Math.max(0, e.clientY - dragOffset.current.dy));
      setPos({ x: nx, y: ny });
    };
    const handleUp = () => setDragging(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  // 창 크기 변경 시 팝업이 화면 밖으로 밀려나면 다시 보이도록 클램프
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(POPUP_W, vw * 0.95);
      const h = Math.min(vh * POPUP_H_RATIO, vh * 0.92);
      setPos(prev => ({
        x: Math.min(vw - 60, Math.max(60 - w, prev.x)),
        y: Math.min(vh - 60, Math.max(0, prev.y)),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 페이드 인 애니메이션
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 10);
    return () => window.clearTimeout(id);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const TABS: PatientDetailTab[] = ["기본정보", "내원이력", "바이탈", "파일", "처방금지", "예약이력"];

  return createPortal(
    // ── 모달리스 외곽 ──
    // pointer-events-none 으로 클릭이 통과되어 하단 차트(PanelD 등)와 인터렉션 가능.
    // 배경 dim 없음. 팝업 본체만 pointer-events-auto.
    <div className="fixed inset-0 z-[9990] pointer-events-none">
      <div
        // 절대 위치 + 드래그 가능. 크기는 고정 (px), 화면 좁아지면 max-w/max-h 로 제한.
        // transition-opacity 만 적용 (transform/left/top 은 드래그에 영향 안 가도록 제외).
        style={{
          left: pos.x,
          top: pos.y,
          width: Math.min(POPUP_W, typeof window !== "undefined" ? window.innerWidth * 0.95 : POPUP_W),
          height: typeof window !== "undefined" ? Math.min(window.innerHeight * POPUP_H_RATIO, window.innerHeight * 0.92) : 800,
        }}
        className={`absolute pointer-events-auto bg-[var(--bg-base)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-[var(--line-default)] overflow-hidden flex flex-col transition-opacity duration-150 ${
          show ? "opacity-100" : "opacity-0"
        } ${dragging ? "select-none" : ""}`}
      >
        {/* ── 헤더 — 타이틀 row 가 드래그 핸들 ──
            onChipClick(tab, focus?): 탭 이동 + 선택적으로 기본정보 탭 내 sub-section 으로 스크롤. */}
        <PatientDetailHeader
          p={p}
          onClose={onClose}
          onChipClick={(target, focus) => {
            setActiveTab(target);
            if (focus) setBasicInfoFocus(focus);
          }}
          onTitleMouseDown={handleDragStart}
          dragging={dragging}
        />

        {/* ── 탭 바 ── */}
        <div className="flex items-center px-3 bg-white border-b border-[var(--line-default)] flex-shrink-0">
          {TABS.map(t => {
            const active = t === activeTab;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative h-8 px-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}
              >
                {t}
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[var(--brand-primary)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 탭 본문 — overflow 는 각 탭이 자체 관리 (기본정보의 좌측 stack vs 우측 chat 처럼) ── */}
        <div className="flex-1 min-h-0 bg-[var(--bg-subtle)]">
          {activeTab === "기본정보" && (
            <BasicInfoTab
              p={p}
              onJumpToPatient={onJumpToPatient}
              focusSection={basicInfoFocus}
              onFocusConsumed={() => setBasicInfoFocus(null)}
              initialPersonalEdit={personalEditTrigger}
              onInitialPersonalEditConsumed={() => setPersonalEditTrigger(false)}
            />
          )}
          {activeTab === "내원이력" && (
            <VisitHistoryTab
              p={p}
              onRepeatRx={onRepeatRx}
              onRepeatDx={onRepeatDx}
              onRepeatAll={onRepeatAll}
              isDifferentChart={isDifferentChart}
              currentChartName={currentChartName}
              onCloseAfterRepeat={onClose}
            />
          )}
          {activeTab === "바이탈" && <VitalsTab p={p} />}
          {activeTab === "처방금지" && <BannedDrugsTab p={p} />}
          {activeTab === "예약이력" && <AppointmentsTab p={p} />}
          {activeTab !== "기본정보" && activeTab !== "내원이력" && activeTab !== "바이탈" && activeTab !== "처방금지" && activeTab !== "예약이력" && <PlaceholderTab name={activeTab} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 헤더 — 식별 + 진료 컨텍스트(좌) + 원무 컨텍스트(우)
// ╚══════════════════════════════════════════════════════════════════════════════
function PatientDetailHeader({
  p,
  onClose,
  onChipClick,
  onTitleMouseDown,
  dragging,
}: {
  p: PatientDetail;
  onClose: () => void;
  // 두 번째 인자(focus) 가 지정되면 해당 sub-section 으로 자동 스크롤. 기본정보 탭 한정.
  onChipClick: (tab: PatientDetailTab, focus?: BasicInfoFocus) => void;
  // 모달리스 팝업 — 타이틀 row 를 잡고 드래그할 수 있도록 mousedown 을 부모로 전달.
  onTitleMouseDown?: (e: React.MouseEvent) => void;
  dragging?: boolean;
}) {
  const age = calcAge(p.birth);
  const sc = p.insurance.specialCoverage;
  const scDaysLeft = sc ? daysUntil(sc.endDate) : null;
  const scExpiring = scDaysLeft !== null && scDaysLeft <= 60 && scDaysLeft >= 0;

  return (
    <div className="flex-shrink-0 border-b border-[var(--line-default)] bg-white">
      {/* Title row — 팝업 제목 + 닫기만. 편집 아이콘 제거.
          드래그 핸들 — 이 row 를 잡고 끌면 팝업 이동. cursor 가 move 로 표시되어 어포던스 제공.
          닫기 버튼은 mousedown 을 stopPropagation 해서 드래그 시작과 충돌 방지. */}
      <div
        onMouseDown={onTitleMouseDown}
        className={`flex items-center justify-between px-4 h-9 border-b border-[var(--line-subtle)] select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        } bg-[var(--bg-subtle)]`}
        title="드래그하여 팝업 이동"
      >
        <div className="flex items-center gap-2">
          {/* drag handle 아이콘 — ⋮⋮ 모양으로 어디를 잡으면 되는지 시각적 단서 */}
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="text-[var(--text-tertiary)]">
            <circle cx="2" cy="3" r="1" fill="currentColor"/>
            <circle cx="8" cy="3" r="1" fill="currentColor"/>
            <circle cx="2" cy="7" r="1" fill="currentColor"/>
            <circle cx="8" cy="7" r="1" fill="currentColor"/>
            <circle cx="2" cy="11" r="1" fill="currentColor"/>
            <circle cx="8" cy="11" r="1" fill="currentColor"/>
          </svg>
          <h2 className="text-md font-bold text-[var(--text-main)]">환자 상세정보</h2>
        </div>
        {/* 우상단 ✕ — 모달리스 팝업도 정책 §4 ✕ 필수. SVG 통일. */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          aria-label="닫기"
          title="닫기 (ESC)"
          className="w-6 h-6 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body — 3-col: 환자 식별(좌) | 진료 컨텍스트(중) | 원무 컨텍스트(우).
          기존엔 식별이 빈 공간을 많이 차지했는데, 이제 우측에 요약 정보를 같이 두어 공간 효율화. */}
      <div className="flex">
        {/* 좌측: 환자 식별 stack — 헤더 전체와 동일하게 흰색 배경으로 통일.
            기존엔 bg-subtle 로 "ID 카드"영역을 시각적으로 분리했지만, 사용자 피드백으로 통일감 우선. */}
        <div className="flex-[3] px-4 py-2.5 flex flex-col gap-1 border-r border-[var(--line-subtle)] min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{p.chartNo}</span>
            <span className="text-[17px] font-bold text-[var(--text-main)]">{p.name}</span>
            {/* 알러지·금기약물 칩 — 안전 critical, 진료 전 항상 확인 필요 */}
            {p.bannedDrugs.length > 0 && (
              <button
                onClick={() => onChipClick("처방금지")}
                title={`처방금지·알러지 약물 ${p.bannedDrugs.length}건 — 클릭하여 처방금지 탭으로 이동`}
                className="flex items-center gap-0.5 h-5 px-1.5 rounded-sm bg-[var(--status-error-bg-subtle)] border border-[var(--status-error-line)] hover:brightness-95 transition"
              >
                <span className="text-xs text-[var(--red-500)]">🚫</span>
                <span className="text-xs font-bold text-[var(--status-error-text-main)] tabular-nums">{p.bannedDrugs.length}</span>
              </button>
            )}
            {/* 보험정보 칩 — 클릭 시 기본정보 탭의 보험정보 섹션으로 이동 + 스크롤.
                PanelB 의 보험정보 chip 과 동일한 시각 패턴 (text-brand + 얇은 outline). */}
            <button
              onClick={() => onChipClick("기본정보", "insurance")}
              title="보험정보 — 기본정보 탭의 보험정보 섹션으로 이동"
              className="flex items-center gap-1 h-5 px-1.5 rounded-sm bg-white border border-[var(--blue-200)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-colors group/inschip"
            >
              <span className="text-xs font-medium text-[var(--brand-primary)] group-hover/inschip:text-white">{p.insurance.type}</span>
            </button>
            {/* 공단검진 칩 — 클릭 시 기본정보 탭의 공단검진 섹션으로 이동 + 스크롤.
                PanelB 의 공단검진 chip 과 동일한 emphasized 패턴 (bg-primary-subtle + bold). */}
            {p.nationalScreenings.length > 0 && (
              <button
                onClick={() => onChipClick("기본정보", "checkup")}
                title={`공단검진 ${p.nationalScreenings.length}건 — 기본정보 탭의 공단검진 섹션으로 이동`}
                className="flex items-center gap-1 h-5 px-1.5 rounded-sm bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors group/chkchip"
              >
                <span className="text-xs font-bold text-[var(--brand-primary)] group-hover/chkchip:text-white">공단검진 {p.nationalScreenings.length}</span>
              </button>
            )}
          </div>
          {/* 값 텍스트들 — text-main + font-medium 으로 위계 상승 (기존 text-sub 보다 강조) */}
          <div className="text-sm font-medium text-[var(--text-main)] tabular-nums">
            {fmtDate(p.birth)} <span className="font-normal text-[var(--text-tertiary)]">·</span> 만 {age}세 <span className="font-normal text-[var(--text-tertiary)]">·</span> {p.gender}
          </div>
          <div className="text-sm font-medium text-[var(--text-main)] tabular-nums">{p.phone}</div>
          <div className="text-xs font-medium text-[var(--text-sub)] tabular-nums">{p.rrn}</div>
        </div>

        {/* 중간: 진료 컨텍스트 */}
        <div className="flex-[4] px-4 py-2 grid grid-cols-[64px_1fr] gap-y-1 gap-x-2 items-center border-r border-[var(--line-subtle)] min-w-0">
          <span className="text-xs text-[var(--text-tertiary)]">최근내원</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.lastVisit ? fmtDate(p.lastVisit) : "—"}</span>

          <span className="text-xs text-[var(--text-tertiary)]">예약일</span>
          <button
            onClick={() => onChipClick("예약이력")}
            className={`text-sm text-left tabular-nums hover:underline ${
              p.nextAppointment ? "text-[var(--red-500)] font-medium" : "text-[var(--text-tertiary)]"
            }`}
            title="예약 탭으로 이동"
          >
            {p.nextAppointment ? fmtDate(p.nextAppointment) : "예약 없음"}
          </button>

          <span className="text-xs text-[var(--text-tertiary)]">환자그룹</span>
          <span className="text-sm text-[var(--text-main)]">{p.patientGroup ?? "—"}</span>

          <span className="text-xs text-[var(--text-tertiary)]">환자유형</span>
          <div className="flex items-center gap-1 flex-wrap">
            {p.patientTypes.length === 0
              ? <span className="text-sm text-[var(--text-tertiary)]">—</span>
              : p.patientTypes.map(t => (
                <span key={t} className="px-1.5 h-[18px] rounded-sm bg-[var(--bg-primary-subtle)] text-xs text-[var(--brand-primary)] flex items-center font-medium">
                  {t}
                </span>
              ))}
          </div>

          <span className="text-xs text-[var(--text-tertiary)]">가족</span>
          <div className="flex items-center gap-1 flex-wrap text-sm text-[var(--text-main)]">
            {p.family.length === 0
              ? <span className="text-[var(--text-tertiary)]">—</span>
              : p.family.map((f, i) => (
                <span key={i} className="text-sm">
                  {/* 가족 이름 폰트 — 다른 필드 텍스트와 동일한 text-sm 명시. base button 의 16px 기본값을 덮어씀. */}
                  <button
                    className="text-sm hover:underline hover:text-[var(--brand-primary)]"
                    title={f.chartNo ? `차트 ${f.chartNo} 로 이동` : ""}
                  >
                    {f.name}
                  </button>
                  <span className="text-[var(--text-tertiary)]"> ({f.relation})</span>
                  {i < p.family.length - 1 && <span className="text-[var(--text-tertiary)]"> · </span>}
                </span>
              ))}
          </div>
        </div>

        {/* 우측: 원무 컨텍스트 */}
        <div className="flex-[3] px-4 py-2 grid grid-cols-[64px_1fr] gap-y-1 gap-x-2 items-center min-w-0">
          <span className="text-xs text-[var(--text-tertiary)]">미수금</span>
          <button
            onClick={() => onChipClick("내원이력")}
            className={`text-left tabular-nums hover:underline ${
              p.admin.unpaidAmount > 0
                ? "text-sm font-bold text-[var(--red-500)]"
                : "text-sm text-[var(--text-sub)]"
            }`}
            title={p.admin.unpaidAmount > 0 ? "내원이력 탭의 미수 회차로 이동" : ""}
          >
            ₩{p.admin.unpaidAmount.toLocaleString()}
            {p.admin.unpaidAmount > 0 && " ⚠"}
          </button>

          <span className="text-xs text-[var(--text-tertiary)]">본인확인</span>
          <span className={`text-sm font-medium ${p.admin.isSelfVerified ? "text-[var(--green-700)]" : "text-[var(--text-tertiary)]"}`}>
            {p.admin.isSelfVerified ? "✓ 확인됨" : "미확인"}
          </span>

          <span className="text-xs text-[var(--text-tertiary)]">본인부담률</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.insurance.coverageRate}%</span>

          <span className="text-xs text-[var(--text-tertiary)]">산정특례</span>
          {sc ? (
            <button
              onClick={() => onChipClick("기본정보")}
              className={`text-left tabular-nums hover:underline ${
                scExpiring ? "text-sm font-medium text-[var(--orange-700)]" : "text-sm text-[var(--text-sub)]"
              }`}
              title="기본정보 탭의 보험 섹션으로 이동"
            >
              D-{scDaysLeft} {scExpiring && "⚠"}
            </button>
          ) : (
            <span className="text-sm text-[var(--text-tertiary)]">미등록</span>
          )}

          <span className="text-xs text-[var(--text-tertiary)]">누적 방문</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.admin.visitCount}회</span>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 1. 기본정보
// ╚══════════════════════════════════════════════════════════════════════════════
function BasicInfoTab({
  p,
  onJumpToPatient,
  focusSection,
  onFocusConsumed,
  initialPersonalEdit,
  onInitialPersonalEditConsumed,
}: {
  p: PatientDetail;
  onJumpToPatient?: (chartNo: string, initialTab: PatientDetailTab) => void;
  // 헤더 chip 클릭 시 해당 섹션으로 자동 스크롤. 적용 후 onFocusConsumed 로 리셋되어
  // 같은 chip 을 다시 눌렀을 때도 재스크롤 가능.
  focusSection?: BasicInfoFocus | null;
  onFocusConsumed?: () => void;
  // 모달 오픈 시 인적사항 섹션 자동 편집 모드 — PanelB 편집 아이콘 진입점에서 사용.
  initialPersonalEdit?: boolean;
  onInitialPersonalEditConsumed?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const insuranceRef = useRef<HTMLDivElement>(null);
  const checkupRef = useRef<HTMLDivElement>(null);

  // focusSection 변경 → 해당 ref 로 스크롤 + 1초간 outline 강조 후 부모 state 리셋.
  // scrollIntoView 의 smooth 동작이 끝날 시간을 충분히 주기 위해 약간의 delay 사용.
  const [highlighted, setHighlighted] = useState<BasicInfoFocus | null>(null);
  useEffect(() => {
    if (!focusSection) return;
    const target = focusSection === "insurance" ? insuranceRef.current : checkupRef.current;
    if (target && scrollRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setHighlighted(focusSection);
    const hideTimer = window.setTimeout(() => setHighlighted(null), 1200);
    const consumeTimer = window.setTimeout(() => onFocusConsumed?.(), 50);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(consumeTimer);
    };
  }, [focusSection, onFocusConsumed]);

  return (
    // 좌(주요 정보 4섹션, 자체 스크롤) | 우(공유메모). 좌측에 더 많은 공간 — 가족 표 컬럼 겹침 해소.
    <div className="p-2 grid grid-cols-[3fr_1fr] gap-2 h-full min-h-0 overflow-hidden">
      {/* ── 좌측: 인적사항·기타정보 (2-col) → 보험 → 공단검진. 길어지면 자체 스크롤. ── */}
      <div ref={scrollRef} className="flex flex-col gap-2 min-w-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          <PersonalInfoSection
            p={p}
            initialEdit={initialPersonalEdit}
            onInitialEditConsumed={onInitialPersonalEditConsumed}
          />
          <EtcInfoSection p={p} onJumpToPatient={onJumpToPatient} />
        </div>

      {/* 보험정보 — 좌측 컬럼 내부의 full-width. 헤더 chip 으로 점프 시 outline 강조. */}
      <div
        ref={insuranceRef}
        className={`rounded-md transition-shadow ${
          highlighted === "insurance" ? "ring-2 ring-[var(--brand-primary)] ring-offset-1" : ""
        }`}
      >
        <SectionCard
          title="보험정보"
          actionLabel="재조회"
          actionIcon="↻"
        >
          {/* ── Row 1: 자격 (보험 chip + 본인부담 + 자격 확인) ──
                정보 밀도 우선 — 4-col Field grid 대신 한 줄 inline 으로 압축. */}
          <div className="flex items-center gap-2.5 py-1 flex-wrap">
            <span className="inline-flex items-center h-[20px] px-1.5 text-xs font-bold rounded-sm bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border border-[var(--blue-200)]">
              {p.insurance.type}
            </span>
            <span className="text-sm text-[var(--text-main)]">
              본인부담 <strong className="font-bold tabular-nums">{p.insurance.coverageRate}%</strong>
            </span>
            <div className="flex-1" />
            {p.insurance.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--green-700)]">
                <span className="text-sm leading-none">✓</span>
                자격 확인됨
                {p.insurance.verifiedAt && (
                  <span className="text-[var(--text-tertiary)] tabular-nums font-normal">· {p.insurance.verifiedAt}</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--red-500)]">
                <span className="text-sm leading-none">⚠</span>
                자격 미확인
              </span>
            )}
          </div>

          {/* ── Row 2: 보험증 + 적용 기간 — 좌측 라벨/값, 우측 라벨/값 한 줄 ── */}
          <div className="flex items-center gap-2 py-1 border-t border-[var(--line-subtle)] text-sm">
            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">보험증</span>
            <span className="text-[var(--text-main)] tabular-nums">{p.insurance.cardNumber ?? "—"}</span>
            <div className="flex-1" />
            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">적용기간</span>
            <span className="text-[var(--text-main)] tabular-nums">
              {p.insurance.coverageStart ? fmtDate(p.insurance.coverageStart) : "—"}
              <span className="text-[var(--text-tertiary)] mx-0.5">~</span>
              {p.insurance.coverageEnd ? fmtDate(p.insurance.coverageEnd) : "—"}
            </span>
          </div>

          {/* ── Row 3: 산정특례 — 별도 헤더/카드 없이 한 줄로 압축.
                등록 안 됨이면 "등록 없음 + [+ 등록]". 등록되어 있으면 코드·질환·기간·만료 임박 표시. ── */}
          <div className="flex items-center gap-2 py-1 border-t border-[var(--line-subtle)] text-sm flex-wrap">
            <span className="text-xs font-bold text-[var(--text-main)] flex-shrink-0">산정특례</span>
            {p.insurance.specialCoverage ? (
              (() => {
                const sc = p.insurance.specialCoverage;
                const dLeft = daysUntil(sc.endDate);
                const expiring = dLeft <= 60;
                return (
                  <>
                    <span className="inline-flex items-center h-[18px] px-1 rounded-sm bg-[var(--bg-subtle)] text-xs text-[var(--text-sub)] font-medium border border-[var(--line-default)]">
                      {sc.code}
                    </span>
                    <span className="text-[var(--text-main)] truncate min-w-0">{sc.diseaseName}</span>
                    <div className="flex-1" />
                    <span className="text-xs tabular-nums text-[var(--text-sub)]">
                      {fmtDate(sc.startDate)} <span className="text-[var(--text-tertiary)]">~</span> {fmtDate(sc.endDate)}
                    </span>
                    <span className={`text-xs font-bold tabular-nums px-1.5 h-[18px] inline-flex items-center rounded-sm ${
                      expiring
                        ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border border-[var(--orange-200)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--line-default)]"
                    }`}>
                      D-{dLeft}
                    </span>
                    <button className="text-xs text-[var(--brand-primary)] hover:underline flex-shrink-0">수정</button>
                  </>
                );
              })()
            ) : (
              <>
                <span className="text-xs text-[var(--text-tertiary)]">등록 없음</span>
                <div className="flex-1" />
                <button className="text-xs text-[var(--brand-primary)] hover:underline flex-shrink-0">+ 등록</button>
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* 공단검진 — 보험정보와 보조적 정보. 검진 종류별로 행 단위 노출. 헤더 chip 으로 점프 시 outline 강조. */}
      <div
        ref={checkupRef}
        className={`rounded-md transition-shadow ${
          highlighted === "checkup" ? "ring-2 ring-[var(--brand-primary)] ring-offset-1" : ""
        }`}
      >
        <SectionCard
          title="공단검진"
          actionLabel="재조회"
          actionIcon="↻"
        >
          {p.nationalScreenings.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)]">조회된 공단검진 없음</p>
          ) : (
            <div className="divide-y divide-[var(--line-subtle)]">
              {p.nationalScreenings.map((s, i) => {
                // 상태 → 색상 매핑. 대상=blue, 수검완료=green, 미대상=gray.
                const statusStyle =
                  s.status === "대상"     ? "text-[var(--status-info-text-main)] bg-[var(--status-info-bg-subtle)] border-[var(--status-info-line)]" :
                  s.status === "수검완료" ? "text-[var(--green-700)] bg-[var(--status-success-bg-subtle)] border-[var(--status-success-line)]" :
                                            "text-[var(--text-tertiary)] bg-[var(--bg-subtle)] border-[var(--line-default)]";
                // "+오더" 버튼은 PanelB 의 공단검진 팝오버와 동일한 동작·스타일.
                // 상태가 "대상" 인 경우에만 활성화 — 미대상/수검완료는 추가할 의미가 없으므로 disabled.
                const orderEnabled = s.status === "대상";
                return (
                  <div key={i} className="flex items-center py-1.5 gap-3">
                    <span className="text-sm text-[var(--text-main)] w-32 flex-shrink-0">{s.type}</span>
                    <span className="text-xs text-[var(--text-sub)] tabular-nums w-20 flex-shrink-0">{s.targetYear}년</span>
                    <span className={`text-xs font-medium px-1.5 h-[18px] rounded-sm border inline-flex items-center ${statusStyle}`}>
                      {s.status === "수검완료" && "✓ "}{s.status}
                    </span>
                    <div className="flex-1" />
                    {s.lastCheckedAt && (
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                        최종 {fmtDate(s.lastCheckedAt)}
                      </span>
                    )}
                    {/* + 오더 — PanelB 공단검진 팝오버와 동일한 액션. prototype: placeholder. */}
                    <button
                      disabled={!orderEnabled}
                      title={
                        orderEnabled
                          ? `${s.type} 오더 추가 — 현재 차트의 처방에 추가`
                          : `${s.status} 상태는 오더 추가 불가`
                      }
                      className="text-xs font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[3px] px-1.5 py-0.5 hover:bg-[var(--brand-primary)] hover:text-white transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--brand-primary)]"
                    >
                      + 오더
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* 가족정보 카드는 기타정보 sub-section 으로 통합됨 (위 SectionCard "기타정보" 참고) */}
      </div> {/* end of 좌측 컬럼 flex-col */}

      {/* ── 우측: 공유메모 — 채팅 세로 스택. 탭 본문 높이 전체 사용. ── */}
      <SharedMemoCard memos={p.sharedMemos} notice={p.notice} />
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공유메모 — 진료실 PanelMemo 와 동일 패턴, 세로 chat 스택 + 공지 + 입력
// ╚══════════════════════════════════════════════════════════════════════════════
// 작성자 역할 → 아바타 색상 매핑 (PanelMemo 와 동일 톤)
const ROLE_COLORS: Record<NonNullable<PatientDetail["sharedMemos"][number]["authorRole"]>, { bg: string; fg: string }> = {
  원장:   { bg: "var(--violet-050)", fg: "var(--violet-500)" },
  간호사: { bg: "var(--bg-primary-subtle)", fg: "var(--blue-500)" },
  데스크: { bg: "var(--status-warning-bg-subtle)", fg: "var(--orange-500)" },
  기타:   { bg: "var(--bg-subtle)", fg: "var(--text-sub)" },
};

function SharedMemoCard({
  memos,
  notice,
}: {
  memos: PatientDetail["sharedMemos"];
  notice?: PatientDetail["notice"];
}) {
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <div className="bg-white border border-[var(--line-default)] rounded-md flex flex-col min-h-0 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-subtle)] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-[var(--text-main)]">공유메모</h3>
          {memos.length > 0 && (
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{memos.length}건</span>
          )}
        </div>
        <button className="text-xs text-[var(--brand-primary)] hover:underline">전체보기</button>
      </div>

      {/* 공지 아코디언 (있을 때만) */}
      {notice && (
        <div className="border-b border-[var(--line-subtle)] flex-shrink-0">
          <button
            onClick={() => setNoticeOpen(v => !v)}
            className="w-full bg-[var(--status-warning-bg-subtle)] flex items-center justify-between px-2 py-1"
          >
            <span className="text-xs font-medium text-[var(--orange-700)]">📌 공지 1건</span>
            <span className="text-xs text-[var(--orange-700)]">{noticeOpen ? "▲" : "▼"}</span>
          </button>
          {noticeOpen && (
            <div className="bg-[var(--status-warning-bg-subtle)] px-3 py-1.5">
              <p className="text-sm text-[var(--text-main)] leading-snug whitespace-pre-line">{notice.message}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-medium text-[var(--orange-700)]">{notice.author}</span>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{notice.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 채팅 메시지 스택 — 세로로 길게, 스크롤 */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-2.5 py-2">
        {memos.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] text-center py-6">등록된 메모 없음</p>
        ) : (
          memos.map(m => {
            const colors = ROLE_COLORS[m.authorRole ?? "기타"];
            const initial = m.author.charAt(0);
            return (
              <div key={m.id} className="flex items-start gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                >
                  {initial}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium" style={{ color: colors.fg }}>{m.author}</span>
                  <div className="bg-[var(--bg-subtle)] rounded-[8px] rounded-tl-[2px] px-2 py-1 mt-0.5">
                    <p className="text-sm text-[var(--text-main)] leading-snug whitespace-pre-line break-words">{m.message}</p>
                  </div>
                  <span className="text-micro text-[var(--text-tertiary)] mt-0.5 tabular-nums">{m.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-[var(--line-subtle)] px-2 py-1.5 flex-shrink-0">
        <div className="flex items-end gap-1.5">
          <input
            type="text"
            placeholder="메모 입력..."
            className="flex-1 h-7 px-2 text-sm border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] bg-white placeholder:text-[var(--text-placeholder)]"
          />
          <button className="h-7 px-2.5 rounded-md bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors text-xs font-bold">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 2. 내원이력 — 상단 검색바 + 좌(내원일 목록 표) + 우(선택된 내원일 상세)
// ║   검색은 전체 내원일 횡단(코드/명칭). 매치 visit 만 좌측에 노출.
// ║   참고 사진의 중앙 패널(접수기본정보·추가보험정보·환자정보)는 제외.
// ╚══════════════════════════════════════════════════════════════════════════════
// 진료실의 내원이력 펼쳐보기와 동일한 카테고리 셋 + "전체"
// 보기 필터 sub-tab — 메모는 처방의 지시메모로 포함되므로 별도 카테고리에서 제거.
const VISIT_SUB_TABS = ["전체", "증상", "진단", "처방", "이미지"] as const;
type VisitSubTab = typeof VISIT_SUB_TABS[number];

// 한 visit 에 query 가 매치되는지 — 증상·진단·처방·이미지 횡단 검색 (메모 카테고리 제거됨).
// sub-tab 은 우측 패널의 표시 필터로만 사용되고, visit 필터링은 OR 전체 검색.
function visitMatchesQuery(v: VisitRecord, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    (v.symptoms ?? "").toLowerCase().includes(lower) ||
    v.diagnoses.some(d => d.code.toLowerCase().includes(lower) || d.name.toLowerCase().includes(lower)) ||
    v.prescriptions.some(rx => rx.code.toLowerCase().includes(lower) || rx.name.toLowerCase().includes(lower)) ||
    (v.images ?? []).some(img => img.name.toLowerCase().includes(lower))
  );
}

function VisitHistoryTab({
  p,
  onRepeatRx,
  onRepeatDx,
  onRepeatAll,
  isDifferentChart,
  currentChartName,
  onCloseAfterRepeat,
}: {
  p: PatientDetail;
  onRepeatRx?: (items: HistoryRx[]) => void;
  onRepeatDx?: (items: HistoryDx[]) => void;
  onRepeatAll?: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  isDifferentChart?: boolean;
  currentChartName?: string;
  onCloseAfterRepeat?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [subTab, setSubTab] = useState<VisitSubTab>("전체");
  const q = search.trim();

  // 검색은 모든 필드 횡단. sub-tab 은 우측 패널의 표시 필터로만 작용.
  const filteredVisits = p.visits.filter(v => visitMatchesQuery(v, q));
  const [selectedId, setSelectedId] = useState<string | null>(p.visits[0]?.id ?? null);

  // 검색 결과에서 현재 선택이 빠지면 첫 항목으로 이동
  useEffect(() => {
    if (filteredVisits.length === 0) return;
    if (!filteredVisits.some(v => v.id === selectedId)) {
      setSelectedId(filteredVisits[0].id);
    }
  }, [filteredVisits, selectedId]);

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col bg-white">
      {/* ── 상단: 전역 검색 (sub-tab 은 우측 패널 상단으로 이동됨) ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="전체 내원일에서 코드 또는 명칭 검색"
          className="flex-1 h-7 px-2 text-sm border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] bg-white placeholder:text-[var(--text-placeholder)]"
        />
        {q && (
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
            {filteredVisits.length}/{p.visits.length}건
          </span>
        )}
      </div>

      {/* ── 본문: 좌(내원일 목록) | 우(모든 내원일 상세 — 세로 스택, 스크롤 가능)
            진료실 PanelC 내원이력과 동일한 패턴: 좌측에서 클릭하면 우측에서 해당 내원일로 스크롤.
            우측 스크롤 시 가시 영역의 내원일이 좌측에서 자동 강조됨. ── */}
      <div className="flex-1 min-h-0 flex">
        <VisitListPane
          visits={filteredVisits}
          totalCount={p.visits.length}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="flex-1 min-w-0 flex flex-col border-l border-[var(--line-default)]">
          {filteredVisits.length > 0 ? (
            <VisitDetailPanel
              visits={filteredVisits}
              selectedId={selectedId}
              onSelectedChange={setSelectedId}
              subTab={subTab}
              setSubTab={setSubTab}
              query={q}
              onRepeatRx={onRepeatRx}
              onRepeatDx={onRepeatDx}
              onRepeatAll={onRepeatAll}
              isDifferentChart={isDifferentChart}
              currentChartName={currentChartName}
              onCloseAfterRepeat={onCloseAfterRepeat}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-tertiary)]">
              {q ? "검색 결과 없음" : "내원이력 없음"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitListPane({
  visits,
  totalCount,
  selectedId,
  onSelect,
}: {
  visits: VisitRecord[];
  totalCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // 수납 상태 → 컬러 텍스트 (뱃지 X)
  const payTextColor = (s: VisitRecord["payment"]["status"]) =>
    s === "수납완료" ? "var(--green-700)" :
    s === "수납대기" ? "var(--orange-700)" :
                       "var(--brand-primary)"; // 부분수납

  // 0 이거나 음수면 —, 양수면 콤마 포맷
  const fmtAmount = (n: number, options?: { highlightColor?: string }): React.ReactNode => {
    if (!n) return <span className="text-[var(--text-tertiary)]">—</span>;
    const color = options?.highlightColor ?? "var(--text-main)";
    return <span style={{ color }}>{n.toLocaleString()}</span>;
  };

  return (
    <div className="flex-[1.55] min-w-0 flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <h3 className="text-sm font-bold text-[var(--text-main)]">
          내원일 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({visits.length}{visits.length !== totalCount && `/${totalCount}`}건)</span>
        </h3>
      </div>
      <div className="flex-1 overflow-auto">
        {/* 컬럼: 내원일 / 초재진 / 보험 / 처방 / 약 / 진료의 / 수납상태 / 환자부담 / 감액 / 수납액 / 미수금 / 환불금
            ★·○·가산료(초·야·휴·비) 컬럼 제거. */}
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1.5 py-1.5 text-left whitespace-nowrap">내원일시</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">초재진</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1.5 py-1.5 text-left whitespace-nowrap">보험</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap">처방</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center w-6" title="약 건수">약</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1.5 py-1.5 text-left whitespace-nowrap">진료의</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">수납 상태</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap" title="환자 부담 총액">환자부담</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">감액</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">수납액</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">미수금</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">환불금</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => {
              const isSelected = v.id === selectedId;
              const py = v.payment;
              return (
                <tr
                  key={v.id}
                  onClick={() => onSelect(v.id)}
                  className={`border-b border-[var(--line-subtle)] cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-primary-subtle)] outline outline-1 -outline-offset-1 outline-[var(--brand-primary)]"
                      : "hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <td className="px-1.5 py-1 text-[var(--text-main)] tabular-nums whitespace-nowrap">{v.date.slice(2)}{v.visitTime && ` ${v.visitTime}`}</td>
                  <td className="px-1 py-1 text-[var(--text-sub)] text-center whitespace-nowrap">{v.visitOrder}</td>
                  <td className="px-1.5 py-1 text-[var(--text-sub)] whitespace-nowrap">{v.insType}</td>
                  <td className="px-1 py-1 text-[var(--text-sub)] whitespace-nowrap">{v.prescriptionTag ?? "—"}</td>
                  <td className="px-1 py-1 text-[var(--text-sub)] text-center tabular-nums">{v.medCount ?? "—"}</td>
                  <td className="px-1.5 py-1 text-[var(--text-sub)] whitespace-nowrap">{v.doctor}</td>
                  <td className="px-1 py-1 text-center whitespace-nowrap">
                    <span className="text-xs font-medium" style={{ color: payTextColor(py.status) }}>{py.status}</span>
                  </td>
                  <td className="px-1 py-1 text-right tabular-nums whitespace-nowrap">{fmtAmount(py.patientTotal)}</td>
                  <td className="px-1 py-1 text-right tabular-nums whitespace-nowrap">{fmtAmount(py.discount)}</td>
                  <td className="px-1 py-1 text-right tabular-nums whitespace-nowrap">{fmtAmount(py.paid)}</td>
                  <td className="px-1 py-1 text-right tabular-nums whitespace-nowrap">{fmtAmount(py.unpaid, { highlightColor: py.unpaid > 0 ? "var(--red-500)" : undefined })}</td>
                  <td className="px-1 py-1 text-right tabular-nums whitespace-nowrap">{fmtAmount(py.refund)}</td>
                </tr>
              );
            })}
            {visits.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">검색 결과 없음</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// VisitRecord.prescriptions (모달 데이터) → HistoryRx (오늘 차트 처방 데이터) 변환.
// 모달 데이터는 dose/perDay/days 가 string|undefined, HistoryRx 는 dose/freq:string + days:number 가 필수.
// 가격 정보는 모달 데이터에 없으므로 0 으로 채움 (1단계 prototype: 청구 계산 분리됨).
function visitRxToHistoryRx(rx: VisitRecord["prescriptions"][number]): HistoryRx {
  const daysNum = rx.days ? Number(rx.days) || 1 : 1;
  return {
    code: rx.code,
    name: rx.name,
    dose: rx.dose ?? "1",
    freq: rx.perDay ?? "1",
    days: daysNum,
    price: 0,
  };
}

function VisitDetailPanel({
  visits,
  selectedId,
  onSelectedChange,
  subTab,
  setSubTab,
  query,
  onRepeatRx,
  onRepeatDx,
  onRepeatAll,
  isDifferentChart,
  currentChartName,
  onCloseAfterRepeat,
}: {
  visits: VisitRecord[];
  selectedId: string | null;
  onSelectedChange: (id: string) => void;
  subTab: VisitSubTab;
  setSubTab: (v: VisitSubTab) => void;
  query: string;
  onRepeatRx?: (items: HistoryRx[]) => void;
  onRepeatDx?: (items: HistoryDx[]) => void;
  onRepeatAll?: (dxItems: HistoryDx[], rxItems: HistoryRx[]) => void;
  isDifferentChart?: boolean;
  currentChartName?: string;
  onCloseAfterRepeat?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // 좌측 클릭 → 우측 스크롤. 우측 스크롤로 인한 selectedId 갱신을 좌측 클릭 이벤트로 오해하지 않도록
  // suppressScrollSync 가드. selectedId 가 외부에서 바뀐 직후 스크롤이 발생하지만 그건 우리가 의도한 스크롤임.
  const suppressScrollSync = useRef(false);

  // selectedId 변경 시 → 해당 visit block 으로 스크롤
  useEffect(() => {
    if (!selectedId) return;
    const el = blockRefs.current[selectedId];
    if (!el || !scrollRef.current) return;
    suppressScrollSync.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // smooth 스크롤이 끝날 시간을 두고 가드 해제
    const t = window.setTimeout(() => { suppressScrollSync.current = false; }, 500);
    return () => window.clearTimeout(t);
  }, [selectedId]);

  // 스크롤 시 가시 영역의 visit 을 좌측 목록에 반영 — PanelC 와 동일한 패턴
  const handleScroll = () => {
    if (suppressScrollSync.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    // 컨테이너 상단 30px 안쪽에 들어온 첫 visit 을 active 로 간주
    const threshold = containerTop + 30;
    let nextActive: string | null = null;
    for (const v of visits) {
      const el = blockRefs.current[v.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= threshold) nextActive = v.id;
      else break;
    }
    if (nextActive && nextActive !== selectedId) onSelectedChange(nextActive);
  };

  // 카테고리 필터 — sub-tab 으로 결정. 메모 카테고리는 제거됨 (지시메모는 처방 자체에 포함).
  const showSymptoms      = subTab === "전체" || subTab === "증상";
  const showDiagnoses     = subTab === "전체" || subTab === "진단";
  const showPrescriptions = subTab === "전체" || subTab === "처방";
  const showImages        = subTab === "전체" || subTab === "이미지";

  const q = query.trim().toLowerCase();

  // 리피트 핸들러 — 행 클릭 시 현재 차트(EmrScreen 의 todayRx/Dx)에 추가
  const handleRepeatOneRx = (rx: VisitRecord["prescriptions"][number]) => {
    if (!onRepeatRx) return;
    onRepeatRx([visitRxToHistoryRx(rx)]);
    if (isDifferentChart && onCloseAfterRepeat) onCloseAfterRepeat();
  };
  const handleRepeatOneDx = (d: { code: string; name: string }) => {
    if (!onRepeatDx) return;
    onRepeatDx([{ code: d.code, name: d.name }]);
    if (isDifferentChart && onCloseAfterRepeat) onCloseAfterRepeat();
  };
  const handleRepeatAllVisit = (v: VisitRecord) => {
    if (!onRepeatAll) return;
    const dxItems: HistoryDx[] = v.diagnoses.map(d => ({ code: d.code, name: d.name }));
    const rxItems: HistoryRx[] = v.prescriptions.map(visitRxToHistoryRx);
    if (dxItems.length === 0 && rxItems.length === 0) return;
    onRepeatAll(dxItems, rxItems);
    if (isDifferentChart && onCloseAfterRepeat) onCloseAfterRepeat();
  };

  // 보험 → 칩 스타일 매핑
  const insChipClass = (t: VisitRecord["insType"]) =>
    t === "건강보험" ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border-[var(--blue-200)]" :
    t === "의료급여" ? "bg-[var(--status-success-bg-subtle)] text-[var(--green-700)] border-[var(--green-200)]" :
    t === "산재"     ? "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border-[var(--orange-200)]" :
                       "bg-[var(--bg-subtle)] text-[var(--text-sub)] border-[var(--line-default)]";

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {/* ── 안내 배너 — 모달 환자가 현재 차트와 다를 때 노출. 클릭 시 추가되는 동작 안내. ── */}
      {isDifferentChart && currentChartName && onRepeatRx && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary-subtle)] border-b border-[var(--brand-primary)]/30 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[var(--brand-primary)] flex-shrink-0">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            <text x="8" y="11" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">i</text>
          </svg>
          <span className="text-xs text-[var(--text-main)] flex-1 leading-tight">
            처방·진단 행을 클릭하면 <strong className="text-[var(--brand-primary)]">{currentChartName}</strong> 차트의 오늘 처방에 추가됩니다.
            각 내원 헤더에 마우스를 올리면 <strong>↩</strong> 아이콘으로 전체 리피트 가능.
          </span>
        </div>
      )}

      {/* 우측 상단 sub-tab — 카테고리 필터 (전체/증상/진단/처방/이미지/메모) */}
      <div className="px-3 flex items-center overflow-x-auto border-b border-[var(--line-default)] flex-shrink-0">
        {VISIT_SUB_TABS.map(t => {
          const active = t === subTab;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`relative h-8 px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
              }`}
            >
              {t}
              {active && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[var(--brand-primary)]" />}
            </button>
          );
        })}
      </div>

      {/* ── 본문 — 모든 visit 을 세로로 누적. 각 visit 은 sticky 헤더 + 콘텐츠 그룹 ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {visits.map(v => {
          // visit 별 콘텐츠 필터링 (검색어 + sub-tab). 메모는 처방 단위로 흡수되어 별도 카테고리 없음.
          const symptomMatch = q ? (v.symptoms ?? "").toLowerCase().includes(q) : true;
          const diagFiltered = q
            ? v.diagnoses.filter(d => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q))
            : v.diagnoses;
          const rxFiltered = q
            ? v.prescriptions.filter(rx => rx.code.toLowerCase().includes(q) || rx.name.toLowerCase().includes(q))
            : v.prescriptions;
          const imageFiltered = q
            ? (v.images ?? []).filter(img => img.name.toLowerCase().includes(q))
            : (v.images ?? []);

          const hasSymptom   = showSymptoms && v.symptoms && symptomMatch;
          const hasDiagnoses = showDiagnoses && diagFiltered.length > 0;
          const hasRx        = showPrescriptions && rxFiltered.length > 0;
          const hasImages    = showImages && imageFiltered.length > 0;
          const anyContent   = hasSymptom || hasDiagnoses || hasRx || hasImages;

          const isSelected = v.id === selectedId;
          return (
            <div
              key={v.id}
              ref={el => { blockRefs.current[v.id] = el; }}
              className="border-b-[3px] border-[var(--bg-neutral)] group/visit"
            >
              {/* ── Visit 헤더 — 내원일시 / 초재진 / 보험정보 / 수납액 (+ 전체 리피트 hover 아이콘) ──
                    sticky top-0: 스크롤하면서 현재 보고 있는 내원일이 상단에 고정.
                    전체 리피트 버튼은 visit 블록 호버 시에만 노출되는 아이콘 버튼. */}
              <div
                className={`sticky top-0 z-[5] flex items-center gap-3 px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0 ${
                  isSelected ? "bg-[var(--bg-primary-subtle)]" : "bg-[var(--bg-subtle)]"
                }`}
              >
                <span className="text-sm font-bold text-[var(--text-main)] tabular-nums whitespace-nowrap">
                  {v.date}{v.visitTime && ` ${v.visitTime}`}
                </span>
                <span className="text-xs px-1.5 h-[18px] inline-flex items-center rounded-sm bg-white border border-[var(--line-default)] text-[var(--text-sub)] flex-shrink-0">
                  {v.visitOrder}
                </span>
                <span className={`text-xs px-1.5 h-[18px] inline-flex items-center rounded-sm border flex-shrink-0 ${insChipClass(v.insType)}`}>
                  {v.insType}
                </span>
                <div className="flex-1" />
                <div className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="text-xs text-[var(--text-tertiary)]">수납액</span>
                  <span className={`text-sm font-bold tabular-nums ${v.payment.paid > 0 ? "text-[var(--text-main)]" : "text-[var(--text-tertiary)]"}`}>
                    {v.payment.paid > 0 ? `${v.payment.paid.toLocaleString()}원` : "—"}
                  </span>
                </div>
                {onRepeatAll && (v.diagnoses.length > 0 || v.prescriptions.length > 0) && (
                  <button
                    onClick={() => handleRepeatAllVisit(v)}
                    title={isDifferentChart && currentChartName
                      ? `이 내원의 진단·처방 전체를 ${currentChartName} 차트에 추가`
                      : "이 내원의 진단·처방 전체를 오늘 차트에 추가"
                    }
                    aria-label="이 내원 전체 리피트"
                    className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[3px] hover:bg-[var(--brand-primary)] hover:text-white transition-all flex-shrink-0 opacity-0 group-hover/visit:opacity-100 leading-none"
                  >
                    ↩
                  </button>
                )}
              </div>

              {/* ── 본문 — 증상 / 진단 / 처방 / 이미지 / 메모 그룹 (해당 visit 만) ── */}
              {hasSymptom && (
                <DetailGroup label="증상" labelBg="var(--status-warning-bg-subtle)" labelColor="var(--orange-700)">
                  <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap leading-relaxed">{v.symptoms}</p>
                </DetailGroup>
              )}

              {hasDiagnoses && (
                <DetailGroup label="진단" labelBg="var(--status-error-bg-subtle)" labelColor="var(--red-700)">
                  <div className="divide-y divide-[var(--line-subtle)]">
                    {diagFiltered.map((d, i) => {
                      const clickable = !!onRepeatDx;
                      return (
                        <div
                          key={i}
                          onClick={clickable ? () => handleRepeatOneDx(d) : undefined}
                          title={clickable ? `${d.code} 리피트${isDifferentChart && currentChartName ? ` → ${currentChartName} 차트로 추가` : ""}` : undefined}
                          className={`flex items-center gap-3 py-1 relative group/dxrow ${
                            clickable ? "cursor-pointer hover:bg-[var(--status-success-bg-subtle)] -mx-2 px-2 rounded-sm" : ""
                          }`}
                        >
                          <span className="text-sm tabular-nums text-[var(--text-main)] w-32 flex-shrink-0">{d.code}</span>
                          <span className="text-sm text-[var(--text-main)] flex-1 min-w-0">{d.name}</span>
                          {clickable && (
                            <span className="text-micro text-[var(--green-500)] opacity-0 group-hover/dxrow:opacity-100 pointer-events-none whitespace-nowrap">↩ 리피트</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DetailGroup>
              )}

              {hasRx && (
                <DetailGroup label="처방" labelBg="var(--status-success-bg-subtle)" labelColor="var(--green-700)">
                  {/* 컬럼 widths — VisitDetailPanel 폭이 좁아 (~460px) 처방명이 flex shrink 로 0 되는 문제 방지.
                      수량(용량/일투/일수) 은 1~2자 숫자만 들어가서 w-7(28px) 로 압축, 단가 w-14(56px), 수납 w-9(36px).
                      gap-1.5 로 컬럼 간격 최소화 → 처방명에 최대한 공간 확보. */}
                  <div className="divide-y divide-[var(--line-subtle)]">
                    {/* 헤더 — 셀과 동일한 width / alignment 사용해 픽셀 단위 정합. */}
                    <div className="flex items-center gap-1.5 py-1 text-micro text-[var(--text-tertiary)] font-medium">
                      <span className="w-14 flex-shrink-0">코드</span>
                      <span className="flex-1 min-w-0">처방명</span>
                      <span className="text-right w-7 flex-shrink-0 tabular-nums">용량</span>
                      <span className="text-right w-7 flex-shrink-0 tabular-nums">일투</span>
                      <span className="text-right w-7 flex-shrink-0 tabular-nums">일수</span>
                      <span className="text-right w-14 flex-shrink-0 tabular-nums">단가</span>
                      <span className="text-center w-9 flex-shrink-0">수납</span>
                    </div>
                    {rxFiltered.map((rx, i) => {
                      const clickable = !!onRepeatRx;
                      // 수납방법 라벨 — 보(보험가) / 일(일반가) / 청(청구) / 비(비급여)
                      const payLabel: Record<string, { full: string; cls: string }> = {
                        "보": { full: "보험가",   cls: "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)]" },
                        "일": { full: "일반가",   cls: "bg-[var(--bg-subtle)] text-[var(--text-sub)]" },
                        "청": { full: "청구",     cls: "bg-[var(--status-success-bg-subtle)] text-[var(--green-700)]" },
                        "비": { full: "비급여",   cls: "bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)]" },
                      };
                      const pay = rx.flag ? payLabel[rx.flag] : undefined;
                      return (
                        <div
                          key={i}
                          onClick={clickable ? () => handleRepeatOneRx(rx) : undefined}
                          title={clickable ? `${rx.name} 리피트${isDifferentChart && currentChartName ? ` → ${currentChartName} 차트로 추가` : ""}` : undefined}
                          className={`flex items-center gap-1.5 py-1 relative group/rxrow ${
                            clickable ? "cursor-pointer hover:bg-[var(--status-success-bg-subtle)] -mx-2 px-2 rounded-sm" : ""
                          }`}
                        >
                          <span className="text-xs font-mono text-[var(--text-sub)] w-14 flex-shrink-0 truncate" title={rx.code}>{rx.code}</span>
                          <span className="text-sm text-[var(--text-main)] flex-1 min-w-0 truncate" title={rx.name}>{rx.name}</span>
                          <span className="text-sm text-right tabular-nums text-[var(--text-main)] w-7 flex-shrink-0">{rx.dose ?? "—"}</span>
                          <span className="text-sm text-right tabular-nums text-[var(--text-main)] w-7 flex-shrink-0">{rx.perDay ?? "—"}</span>
                          <span className="text-sm text-right tabular-nums text-[var(--text-main)] w-7 flex-shrink-0">{rx.days ?? "—"}</span>
                          <span className="text-sm text-right tabular-nums text-[var(--text-main)] w-14 flex-shrink-0">
                            {typeof rx.unitPrice === "number" ? rx.unitPrice.toLocaleString() : "—"}
                          </span>
                          <span className="w-9 flex-shrink-0 flex items-center justify-center">
                            {pay ? (
                              <span title={pay.full}
                                className={`text-micro px-1 h-4 rounded-sm inline-flex items-center font-bold ${pay.cls}`}>
                                {rx.flag}
                              </span>
                            ) : "—"}
                          </span>
                          {/* 리피트 — 호버 시에만 노출, 절대 위치 아이콘만 (텍스트 제거).
                              row 의 relative 기준 우측 상단에 floating. 행 가로 layout 점유 없음. */}
                          {clickable && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/rxrow:opacity-100 pointer-events-none transition-opacity">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green-500)] text-white shadow-sm">
                                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                                  <path d="M3.5 5.5L3.5 4C3.5 3.4 4 3 4.5 3L11.5 3C12 3 12.5 3.4 12.5 4L12.5 10.5C12.5 11 12 11.5 11.5 11.5L7 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                  <path d="M9 9L7 11.5L9 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                </svg>
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DetailGroup>
              )}

              {hasImages && (
                <DetailGroup label="이미지" labelBg="var(--bg-primary-subtle)" labelColor="var(--blue-700)">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {imageFiltered.map(img => (
                      <button
                        key={img.id}
                        title={`${img.name} — 클릭하여 미리보기 (1단계 placeholder)`}
                        className="flex items-center gap-1 h-6 px-2 rounded-sm bg-[var(--bg-subtle)] border border-[var(--line-default)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] transition-colors"
                      >
                        <span className="text-xs">🖼</span>
                        <span className="text-xs text-[var(--text-sub)] truncate max-w-[160px]">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </DetailGroup>
              )}

              {!anyContent && (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-6">
                  {q ? "이 내원일에 검색 결과 없음" : `${subTab} 기록 없음`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 우측 상세 패널의 카테고리별 그룹 — 좌측에 컬러 라벨 셀, 우측에 컨텐츠
function DetailGroup({
  label,
  labelBg,
  labelColor,
  children,
}: {
  label: string;
  labelBg: string;
  labelColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex border-b border-[var(--line-default)]">
      <div
        className="flex-shrink-0 w-14 flex items-center justify-center text-sm font-bold py-2 px-2"
        style={{ background: labelBg, color: labelColor }}
      >
        {label}
      </div>
      <div className="flex-1 min-w-0 px-2 py-1.5 bg-white">
        {children}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 3. 바이탈 — 표 형식 과거 기록 + 상단 inline-add 행 + "바이탈 설정" 팝업
// ╚══════════════════════════════════════════════════════════════════════════════

// 바이탈 컬럼 정의 — key, label, 단위, 입력 폭. "바이탈 설정" 에서 표시/숨김 토글 가능.
type VitalColumnKey = "systolic" | "diastolic" | "pulse" | "temperature" | "bloodSugar" | "weight" | "height" | "bmi" | "waist";
type VitalColumnSpec = {
  key: VitalColumnKey;
  label: string;
  short: string;            // 표 헤더용 짧은 라벨 (좁은 컬럼에 맞춤)
  unit: string;
  step?: string;
};
const VITAL_COLUMNS: VitalColumnSpec[] = [
  { key: "systolic",    label: "수축기 혈압", short: "수축기",   unit: "mmHg" },
  { key: "diastolic",   label: "이완기 혈압", short: "이완기",   unit: "mmHg" },
  { key: "pulse",       label: "맥박",        short: "맥박",     unit: "bpm" },
  { key: "temperature", label: "체온",        short: "체온",     unit: "°C", step: "0.1" },
  { key: "bloodSugar",  label: "혈당",        short: "혈당",     unit: "mg/dL" },
  { key: "weight",      label: "체중",        short: "체중",     unit: "kg", step: "0.1" },
  { key: "height",      label: "신장",        short: "신장",     unit: "cm", step: "0.1" },
  { key: "bmi",         label: "BMI",         short: "BMI",      unit: "", step: "0.1" },
  { key: "waist",       label: "허리둘레",    short: "허리",     unit: "cm", step: "0.1" },
];

function VitalsTab({ p }: { p: PatientDetail }) {
  // 로컬 state — 추후 실제 저장 로직 연결. 1단계는 로컬에만 누적.
  const [vitals, setVitals] = useState<VitalRecord[]>(p.vitals);

  // 표시할 컬럼 — "바이탈 설정" 팝업에서 토글. 기본은 모든 컬럼 노출.
  const [visibleCols, setVisibleCols] = useState<Set<VitalColumnKey>>(
    new Set(VITAL_COLUMNS.map(c => c.key))
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 상단 inline-add 행의 입력 state
  const emptyDraft: Partial<VitalRecord> = {};
  const [draft, setDraft] = useState<Partial<VitalRecord>>(emptyDraft);
  // 측정일시 default — 현재 시각 ("YYYY-MM-DD HH:MM")
  const nowDateTime = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [draftAt, setDraftAt] = useState<string>(nowDateTime());

  const setDraftField = (key: VitalColumnKey, val: string) => {
    const num = val.trim() === "" ? undefined : Number(val);
    setDraft(d => ({ ...d, [key]: Number.isNaN(num) ? undefined : num }));
  };

  // 새 측정 추가
  const addVital = () => {
    // 최소 1개 필드라도 입력해야 추가
    const hasAny = VITAL_COLUMNS.some(c => draft[c.key] !== undefined);
    if (!hasAny) return;
    const newRec: VitalRecord = {
      id: `vt-${Date.now()}`,
      measuredAt: draftAt || nowDateTime(),
      ...draft,
    };
    setVitals(prev => [newRec, ...prev]);
    setDraft(emptyDraft);
    setDraftAt(nowDateTime());
  };

  const deleteVital = (id: string) => {
    setVitals(prev => prev.filter(v => v.id !== id));
  };

  const visibleColumns = VITAL_COLUMNS.filter(c => visibleCols.has(c.key));
  const hasDraft = VITAL_COLUMNS.some(c => draft[c.key] !== undefined);

  return (
    <div className="h-full min-h-0 flex flex-col bg-white relative">
      {/* 헤더 — 총 건수 + 바이탈 설정 버튼 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <h3 className="text-sm font-bold text-[var(--text-main)]">
          바이탈 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({vitals.length}건)</span>
        </h3>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1 h-7 px-2 text-xs font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-md hover:bg-[var(--bg-primary-subtle)] transition-colors"
        >
          <span>⚙</span> 바이탈 설정
        </button>
      </div>

      {/* 표 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">측정일시</th>
              {visibleColumns.map(c => (
                <th key={c.key} className="text-xs font-medium text-[var(--text-tertiary)] px-1.5 py-1.5 text-right whitespace-nowrap" title={`${c.label}${c.unit ? ` (${c.unit})` : ""}`}>
                  {c.short}
                  {c.unit && <span className="ml-0.5 text-[var(--text-tertiary)] font-normal">({c.unit})</span>}
                </th>
              ))}
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center w-16 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {/* 신규 입력 행 — 모든 셀이 input. 과거 기록 영역과는 얇은 회색 구분선으로 분리 (강조 제거). */}
            <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg-primary-subtle)]/30">
              <td className="px-2 py-1">
                <input
                  type="datetime-local"
                  value={draftAt.replace(" ", "T")}
                  onChange={e => setDraftAt(e.target.value.replace("T", " "))}
                  className="h-6 px-1 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] tabular-nums w-36"
                />
              </td>
              {visibleColumns.map(c => (
                <td key={c.key} className="px-1.5 py-1">
                  <input
                    type="number"
                    step={c.step}
                    value={draft[c.key] ?? ""}
                    onChange={e => setDraftField(c.key, e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVital(); } }}
                    placeholder="—"
                    className="h-6 w-full px-1 text-xs text-right tabular-nums border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                  />
                </td>
              ))}
              <td className="px-1 py-1 text-center">
                <button
                  onClick={addVital}
                  disabled={!hasDraft}
                  className={`h-6 px-2 text-xs font-bold rounded-sm transition-colors ${
                    hasDraft
                      ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                      : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
                  }`}
                >
                  추가
                </button>
              </td>
            </tr>

            {/* 과거 기록 */}
            {vitals.map(v => (
              <tr key={v.id} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                <td className="px-2 py-1 text-xs text-[var(--text-main)] tabular-nums whitespace-nowrap">{v.measuredAt}</td>
                {visibleColumns.map(c => {
                  const val = v[c.key];
                  return (
                    <td key={c.key} className="px-1.5 py-1 text-xs text-[var(--text-main)] text-right tabular-nums whitespace-nowrap">
                      {val !== undefined ? val : <span className="text-[var(--text-tertiary)]">—</span>}
                    </td>
                  );
                })}
                <td className="px-1 py-1 text-center">
                  <button
                    onClick={() => deleteVital(v.id)}
                    title="삭제"
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red-500)] transition-colors"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {vitals.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">
                  기록된 바이탈 없음 — 위 입력 행에서 새 측정을 추가하세요
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 바이탈 설정 sub-modal */}
      {settingsOpen && (
        <VitalSettingsModal
          visibleCols={visibleCols}
          onSave={cols => { setVisibleCols(cols); setSettingsOpen(false); }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 바이탈 설정 모달 — 컬럼 표시/숨김 토글 (기초자료 관리 패턴)
// ╚══════════════════════════════════════════════════════════════════════════════
function VitalSettingsModal({
  visibleCols,
  onSave,
  onClose,
}: {
  visibleCols: Set<VitalColumnKey>;
  onSave: (cols: Set<VitalColumnKey>) => void;
  onClose: () => void;
}) {
  // 로컬 draft — 저장 누르기 전까진 부모 상태 갱신 안 됨
  const [draft, setDraft] = useState<Set<VitalColumnKey>>(new Set(visibleCols));
  const toggle = (key: VitalColumnKey) => {
    const next = new Set(draft);
    if (next.has(key)) next.delete(key); else next.add(key);
    setDraft(next);
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[360px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <h3 className="text-sm font-bold text-[var(--text-main)]">바이탈 설정</h3>
          {/* 우상단 ✕ — 정책 §4 필수. SVG. */}
          <button
            onClick={onClose}
            aria-label="닫기"
            title="닫기"
            className="w-5 h-5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 컬럼 토글 리스트 */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">표에 표시할 컬럼을 선택하세요.</p>
          {VITAL_COLUMNS.map(c => (
            <label key={c.key} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[var(--bg-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.has(c.key)}
                onChange={() => toggle(c.key)}
                className="accent-[var(--brand-primary)]"
              />
              <span className="text-sm text-[var(--text-main)]">{c.label}</span>
              {c.unit && <span className="text-xs text-[var(--text-tertiary)]">({c.unit})</span>}
            </label>
          ))}

          {/* 추가 항목 등록 — 기초자료 관리 placeholder */}
          <button className="mt-2 h-7 text-xs text-[var(--brand-primary)] hover:underline text-left px-1">
            + 사용자 정의 항목 추가 (산소포화도·호흡수 등)
          </button>
        </div>

        {/* 액션 — CTA 만 (정책 §4: [취소] 사용 안 함, 닫기는 ✕). */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button
            onClick={() => onSave(draft)}
            className="h-7 px-3 text-xs font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 4. 약물 — 처방금지 약품 표 형식 (바이탈 탭과 동일 패턴)
// ║   상단에 inline-add 행, 아래에 등록된 약품 목록. 진료실 BannedDrug 기능 셋과 동일.
// ╚══════════════════════════════════════════════════════════════════════════════
function BannedDrugsTab({ p }: { p: PatientDetail }) {
  // 로컬 state — 추후 EmrScreen 의 bannedDrugs 와 양방향 동기화 가능 (현재는 prototype 로컬 누적).
  const [drugs, setDrugs] = useState<BannedDrug[]>(p.bannedDrugs);

  // 상단 inline-add 행 입력 state
  const emptyDraft = { drugName: "", ingredientCode: "", memo: "", banSameIngredient: false, allowPrescribe: false };
  const [draft, setDraft] = useState(emptyDraft);

  // 오늘 일자 YYYY-MM-DD
  const todayStr = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const addDrug = () => {
    if (!draft.drugName.trim()) return;  // 약품명 필수
    const newRec: BannedDrug = {
      id: `bd-${Date.now()}`,
      registeredAt: todayStr(),
      drugName: draft.drugName.trim(),
      ingredientCode: draft.ingredientCode.trim(),
      memo: draft.memo.trim(),
      banSameIngredient: draft.banSameIngredient,
      allowPrescribe: draft.allowPrescribe,
    };
    setDrugs(prev => [newRec, ...prev]);
    setDraft(emptyDraft);
  };

  const deleteDrug = (id: string) => {
    setDrugs(prev => prev.filter(d => d.id !== id));
  };

  const updateDrug = (id: string, patch: Partial<BannedDrug>) => {
    setDrugs(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <h3 className="text-sm font-bold text-[var(--text-main)]">
          처방금지 약품 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({drugs.length}건)</span>
        </h3>
      </div>

      {/* 표 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">등록일</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">약품명</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">주성분코드</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">메모</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center whitespace-nowrap" title="주성분코드가 같은 다른 약품도 함께 처방금지">동일성분<br/>금지</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center whitespace-nowrap" title="처방금지 등록되어 있어도 예외적으로 처방 허용">처방<br/>가능</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center w-12 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {/* 신규 입력 행 — 모든 셀이 input */}
            <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg-primary-subtle)]/30">
              <td className="px-2 py-1 text-xs text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">{todayStr()}</td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={draft.drugName}
                  onChange={e => setDraft(d => ({ ...d, drugName: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDrug(); } }}
                  placeholder="약품명 입력 *"
                  className="h-6 w-full px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={draft.ingredientCode}
                  onChange={e => setDraft(d => ({ ...d, ingredientCode: e.target.value }))}
                  placeholder="자동 매칭"
                  className="h-6 w-full px-1.5 text-xs tabular-nums border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={draft.memo}
                  onChange={e => setDraft(d => ({ ...d, memo: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDrug(); } }}
                  placeholder="알러지 반응 / 부작용 이력 등"
                  className="h-6 w-full px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
                />
              </td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={draft.banSameIngredient}
                  onChange={e => setDraft(d => ({ ...d, banSameIngredient: e.target.checked }))}
                  className="accent-[var(--brand-primary)] cursor-pointer"
                />
              </td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={draft.allowPrescribe}
                  onChange={e => setDraft(d => ({ ...d, allowPrescribe: e.target.checked }))}
                  className="accent-[var(--brand-primary)] cursor-pointer"
                />
              </td>
              <td className="px-1 py-1 text-center">
                <button
                  onClick={addDrug}
                  disabled={!draft.drugName.trim()}
                  className={`h-6 px-2 text-xs font-bold rounded-sm transition-colors ${
                    draft.drugName.trim()
                      ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                      : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
                  }`}
                >
                  추가
                </button>
              </td>
            </tr>

            {/* 등록된 약품 행들 */}
            {drugs.map(d => (
              <tr key={d.id} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums whitespace-nowrap">{d.registeredAt}</td>
                <td className="px-2 py-1 text-xs font-medium text-[var(--text-main)] whitespace-nowrap">{d.drugName}</td>
                <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums whitespace-nowrap">{d.ingredientCode || "—"}</td>
                <td className="px-2 py-1 text-xs text-[var(--text-sub)]">{d.memo || <span className="text-[var(--text-tertiary)]">—</span>}</td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={d.banSameIngredient}
                    onChange={e => updateDrug(d.id, { banSameIngredient: e.target.checked })}
                    title="동일성분 금지 토글"
                    className="accent-[var(--brand-primary)] cursor-pointer"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={d.allowPrescribe}
                    onChange={e => updateDrug(d.id, { allowPrescribe: e.target.checked })}
                    title="처방가능 (예외 허용) 토글"
                    className="accent-[var(--brand-primary)] cursor-pointer"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <button
                    onClick={() => deleteDrug(d.id)}
                    title="삭제"
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red-500)] transition-colors"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {drugs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">
                  등록된 처방금지 약품 없음 — 위 입력 행에서 새 약품을 추가하세요
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 5. 예약이력 — 표 형식 (예약일시 / 예약실 / 진료의 / 예약유형 / 메모 / 상태)
// ║   행별 액션: 수정이력 보기 / 상태 변경 / 예약 수정 / 취소·복구
// ╚══════════════════════════════════════════════════════════════════════════════
const ALL_APPT_STATUSES: AppointmentStatus[] = ["예약", "완료", "노쇼", "취소"];

// 상태별 컬러 톤 (text + bg + border)
const apptStatusStyle = (s: AppointmentStatus): { color: string; bg: string; border: string } =>
  s === "예약"  ? { color: "var(--brand-primary)", bg: "var(--bg-primary-subtle)",  border: "var(--blue-200)" } :
  s === "완료"  ? { color: "var(--green-700)",     bg: "var(--status-success-bg-subtle)", border: "var(--status-success-line)" } :
  s === "노쇼"  ? { color: "var(--orange-700)",    bg: "var(--status-warning-bg-subtle)", border: "var(--status-warning-line)" } :
                  { color: "var(--text-tertiary)", bg: "var(--bg-subtle)",          border: "var(--line-default)" };  // 취소

// 예약유형별 컬러 — 도트 + 텍스트 색상. 추후 병원 마스터에서 등록한 컬러로 대체 예정.
const APPT_TYPE_COLORS: Record<string, string> = {
  "외래":     "var(--brand-primary)",   // blue
  "검진":     "var(--violet-500)",      // violet
  "물리치료": "var(--green-700)",       // green
  "처치":     "var(--orange-700)",      // orange
  "주사":     "var(--red-500)",         // red
};
const apptTypeColor = (type: string): string =>
  APPT_TYPE_COLORS[type] ?? "var(--text-sub)";  // 미등록 유형은 기본 톤

// 현재 시각 문자열 — 이력 항목에 stamp 용
const nowStamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function AppointmentsTab({ p }: { p: PatientDetail }) {
  // 로컬 state — 1단계 prototype 은 로컬 누적. 추후 서버 동기화.
  const [appointments, setAppointments] = useState<Appointment[]>(p.appointments);

  // sub-modal state
  const [historyFor, setHistoryFor] = useState<Appointment | null>(null);
  const [editing, setEditing]       = useState<Appointment | null>(null);

  // 상태 변경 — 이력에 간략 표기 (예: "예약 → 취소")
  const changeStatus = (id: string, next: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (a.status === next) return a;
      return {
        ...a,
        status: next,
        history: [
          ...a.history,
          { timestamp: nowStamp(), actor: "현재 사용자", action: `${a.status} → ${next}` },
        ],
      };
    }));
  };

  // 예약 내용 수정 — 변경된 필드만 간략 표기로 이력 기록
  // ex) 날짜만 바뀌면 "2026-05-20 → 2026-05-21", 시간만 바뀌면 "14:00 → 15:30"
  const saveEdit = (id: string, patch: Partial<Pick<Appointment, "scheduledAt" | "room" | "doctor" | "type" | "memo">>) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const changes: string[] = [];
      if (patch.scheduledAt && patch.scheduledAt !== a.scheduledAt) {
        // 날짜·시간 부분 분리해서 바뀐 부분만 노출
        const [oldDate, oldTime = ""] = a.scheduledAt.split(" ");
        const [newDate, newTime = ""] = patch.scheduledAt.split(" ");
        if (oldDate === newDate && oldTime !== newTime) changes.push(`${oldTime} → ${newTime}`);
        else if (oldDate !== newDate && oldTime === newTime) changes.push(`${oldDate} → ${newDate}`);
        else changes.push(`${a.scheduledAt} → ${patch.scheduledAt}`);
      }
      if (patch.room && patch.room !== a.room) changes.push(`${a.room} → ${patch.room}`);
      if (patch.doctor && patch.doctor !== a.doctor) changes.push(`${a.doctor} → ${patch.doctor}`);
      if (patch.type && patch.type !== a.type) changes.push(`${a.type} → ${patch.type}`);
      if (patch.memo !== undefined && patch.memo !== a.memo) changes.push("메모 변경");
      if (changes.length === 0) return a;
      return {
        ...a,
        ...patch,
        history: [
          ...a.history,
          { timestamp: nowStamp(), actor: "현재 사용자", action: changes.join(" / ") },
        ],
      };
    }));
    setEditing(null);
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-white relative">
      {/* 헤더 — 총 건수 + 상태별 카운트 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <h3 className="text-sm font-bold text-[var(--text-main)]">
          예약 이력 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({appointments.length}건)</span>
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {ALL_APPT_STATUSES.map(s => {
            const cnt = appointments.filter(a => a.status === s).length;
            const sty = apptStatusStyle(s);
            return (
              <span key={s} className="tabular-nums" style={{ color: sty.color }}>
                {s} {cnt}
              </span>
            );
          })}
        </div>
      </div>

      {/* 표 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">예약일시</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">예약실</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">진료의</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">예약유형</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left">예약메모</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-center whitespace-nowrap">예약상태</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1.5 text-left whitespace-nowrap">수정이력</th>
              {/* 액션 컬럼 — 헤더 없음 (수정/취소/복구 outlined 버튼들) */}
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">등록된 예약 없음</td>
              </tr>
            ) : (
              appointments.map(a => {
                const sty = apptStatusStyle(a.status);
                const isCancelled = a.status === "취소";
                const isActive = a.status === "예약";
                // 가장 최근 수정이력 — 마지막 항목
                const latest = a.history[a.history.length - 1];
                return (
                  <tr key={a.id} className={`border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)] ${isCancelled ? "opacity-60" : ""}`}>
                    <td className="px-2 py-1 text-[var(--text-main)] tabular-nums whitespace-nowrap">
                      <span className={isCancelled ? "line-through" : ""}>{a.scheduledAt}</span>
                    </td>
                    <td className="px-2 py-1 text-[var(--text-sub)] whitespace-nowrap">{a.room}</td>
                    <td className="px-2 py-1 text-[var(--text-sub)] whitespace-nowrap">{a.doctor}</td>
                    {/* 예약유형 — 도트 + 유형 색상 텍스트 */}
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: apptTypeColor(a.type) }}
                          aria-hidden
                        />
                        <span className="font-medium" style={{ color: apptTypeColor(a.type) }}>{a.type}</span>
                      </span>
                    </td>
                    {/* 예약메모 — 폭 가장 넓게. max-width 제거하여 남은 공간 모두 차지. 내용 길면 truncate. */}
                    <td className="px-2 py-1 text-[var(--text-sub)] truncate w-full" title={a.memo}>
                      {a.memo || <span className="text-[var(--text-tertiary)]">—</span>}
                    </td>
                    {/* 예약상태 — 순수 뱃지 */}
                    <td className="px-2 py-1 text-center whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-1.5 h-[20px] rounded-sm border text-xs font-medium tabular-nums"
                        style={{ color: sty.color, backgroundColor: sty.bg, borderColor: sty.border }}
                      >
                        {a.status}
                      </span>
                    </td>
                    {/* 수정이력 — 최신 1건 미리보기. 텍스트 버튼으로 클릭 시 history 모달. */}
                    <td className="px-2 py-1 whitespace-nowrap max-w-[220px]">
                      {latest ? (
                        <button
                          onClick={() => setHistoryFor(a)}
                          title="전체 수정이력 보기"
                          className="text-xs text-[var(--text-sub)] hover:text-[var(--brand-primary)] hover:underline truncate block max-w-full text-left"
                        >
                          <span className="tabular-nums text-[var(--text-tertiary)]">{latest.timestamp.slice(0, 10)}</span>
                          <span className="mx-1 text-[var(--text-tertiary)]">·</span>
                          <span className="font-medium">{latest.actor}</span>
                          <span className="mx-1 text-[var(--text-tertiary)]">·</span>
                          <span>{latest.action}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>
                    {/* 액션 — outlined 버튼 (fill X, plain text X). 상태별 조건부 노출. */}
                    <td className="px-2 py-1 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {isActive && (
                          <>
                            <button
                              onClick={() => setEditing(a)}
                              title="예약 내용 수정"
                              className="h-6 px-2 text-xs font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-sm hover:bg-[var(--bg-primary-subtle)] transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => changeStatus(a.id, "취소")}
                              title="예약 취소"
                              className="h-6 px-2 text-xs font-medium text-[var(--red-500)] border border-[var(--red-500)] rounded-sm hover:bg-[var(--status-error-bg-subtle)] transition-colors"
                            >
                              취소
                            </button>
                          </>
                        )}
                        {isCancelled && (
                          <button
                            onClick={() => changeStatus(a.id, "예약")}
                            title="예약 복구"
                            className="h-6 px-2 text-xs font-medium text-[var(--green-700)] border border-[var(--green-700)] rounded-sm hover:bg-[var(--status-success-bg-subtle)] transition-colors"
                          >
                            복구
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 수정 이력 모달 */}
      {historyFor && (
        <AppointmentHistoryModal a={historyFor} onClose={() => setHistoryFor(null)} />
      )}

      {/* 예약 수정 모달 */}
      {editing && (
        <AppointmentEditModal
          a={editing}
          onSave={patch => saveEdit(editing.id, patch)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 예약 수정 이력 sub-modal — 시간순 timeline
// ╚══════════════════════════════════════════════════════════════════════════════
function AppointmentHistoryModal({ a, onClose }: { a: Appointment; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[460px] max-h-[80%] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">예약 수정 이력</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 tabular-nums">{a.scheduledAt} · {a.room} · {a.doctor}</p>
          </div>
          {/* 우상단 ✕ — 정책 §4 필수. */}
          <button onClick={onClose} aria-label="닫기" title="닫기"
            className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {a.history.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] text-center py-4">이력 없음</p>
          ) : (
            <div className="flex flex-col gap-2">
              {a.history.map((h, i) => (
                <div key={i} className="border-l-2 border-[var(--brand-primary)] pl-3 py-1">
                  <p className="text-xs text-[var(--text-tertiary)] tabular-nums">{h.timestamp} · {h.actor}</p>
                  <p className="text-sm text-[var(--text-main)] mt-0.5">{h.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 하단 [닫기] 단독 버튼 제거 — 정책 §4: 팝업 닫기는 ✕로. 데이터 조회 팝업이라 CTA 없음. */}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 예약 수정 sub-modal — 예약일시 / 예약실 / 진료의 / 예약유형 / 메모
// ╚══════════════════════════════════════════════════════════════════════════════
function AppointmentEditModal({
  a,
  onSave,
  onClose,
}: {
  a: Appointment;
  onSave: (patch: Partial<Pick<Appointment, "scheduledAt" | "room" | "doctor" | "type" | "memo">>) => void;
  onClose: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState(a.scheduledAt);
  const [room, setRoom] = useState(a.room);
  const [doctor, setDoctor] = useState(a.doctor);
  const [type, setType] = useState(a.type);
  const [memo, setMemo] = useState(a.memo);

  const submit = () => {
    onSave({ scheduledAt, room, doctor, type, memo });
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[420px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <h3 className="text-sm font-bold text-[var(--text-main)]">예약 수정</h3>
          {/* 우상단 ✕ — 정책 §4 필수. */}
          <button onClick={onClose} aria-label="닫기" title="닫기"
            className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <EditRow label="예약일시">
            <input
              type="datetime-local"
              value={scheduledAt.replace(" ", "T")}
              onChange={e => setScheduledAt(e.target.value.replace("T", " "))}
              className="h-7 w-full px-2 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] tabular-nums"
            />
          </EditRow>
          <EditRow label="예약실">
            <select value={room} onChange={e => setRoom(e.target.value)}
              className="h-7 w-full px-2 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)]"
            >
              {["1진료실", "2진료실", "3진료실", "건강검진실", "물리치료실"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </EditRow>
          <EditRow label="진료의">
            <select value={doctor} onChange={e => setDoctor(e.target.value)}
              className="h-7 w-full px-2 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)]"
            >
              {["김다영", "이지원", "김지혜"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </EditRow>
          <EditRow label="예약유형">
            <select value={type} onChange={e => setType(e.target.value)}
              className="h-7 w-full px-2 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)]"
            >
              {["외래", "검진", "물리치료", "처치", "주사"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </EditRow>
          <EditRow label="메모">
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="예약 메모"
              className="h-7 w-full px-2 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
            />
          </EditRow>
        </div>
        {/* 액션 — CTA 만 (정책 §4: [취소] 사용 안 함, 닫기는 ✕). */}
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button onClick={submit} className="h-7 px-3 text-xs font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md">저장</button>
        </div>
      </div>
    </div>
  );
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 다른 탭들 — 1단계는 placeholder
// ╚══════════════════════════════════════════════════════════════════════════════
function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-[var(--text-tertiary)]">
      <span className="text-3xl mb-2">🚧</span>
      <p className="text-sm font-medium">{name} 탭 — 준비 중</p>
      <p className="text-xs mt-1">2단계 이후 구현 예정</p>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공통 UI 컴포넌트
// ╚══════════════════════════════════════════════════════════════════════════════
function SectionCard({
  title,
  actionLabel,
  actionIcon,
  actions,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionIcon?: string;
  actions?: React.ReactNode;       // 편집/저장/취소 등 커스텀 액션 묶음 (있으면 actionLabel 무시)
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[var(--line-default)] rounded-md flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-main)]">{title}</h3>
        {actions ?? (actionLabel && (
          <button onClick={onAction} className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1">
            {actionIcon && <span>{actionIcon}</span>}
            {actionLabel}
          </button>
        ))}
      </div>
      <div className="px-3 py-2 flex-1">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {children ?? <span className="text-sm text-[var(--text-main)]">{value ?? "—"}</span>}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 편집 가능 Field — editing=true 면 <input>, false 면 <span> 으로 디스플레이
// ╚══════════════════════════════════════════════════════════════════════════════
function EditableField({
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: "text" | "date" | "tel";
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5 min-h-[24px]">
      <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-6 px-1.5 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        ) : (
          <span className="text-sm text-[var(--text-main)] truncate block">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 편집 액션 그룹 — 편집 / 저장 + 취소 토글
// ╚══════════════════════════════════════════════════════════════════════════════
function EditActions({
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!editing) {
    return (
      <button onClick={onEdit} className="text-xs text-[var(--brand-primary)] hover:underline">
        편집
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={onCancel} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)]">
        취소
      </button>
      <button onClick={onSave} className="text-xs text-[var(--brand-primary)] font-bold hover:underline">
        저장
      </button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 인적사항 섹션 — 편집 모드 토글
// ╚══════════════════════════════════════════════════════════════════════════════
type PersonalForm = {
  name: string; rrn: string; birth: string; gender: "남" | "여";
  phone: string; homePhone: string; emergencyPhone: string; address: string; occupation: string;
};
const personalFromPatient = (p: PatientDetail): PersonalForm => ({
  name: p.name, rrn: p.rrn, birth: p.birth, gender: p.gender,
  phone: p.phone, homePhone: p.homePhone ?? "", emergencyPhone: p.emergencyPhone ?? "",
  address: p.address ?? "", occupation: p.occupation ?? "",
});

// 주민번호 → 성별 자동 도출.
// 한국 주민번호 7번째 자리(하이픈 뒤 첫 숫자)로 결정:
//   1,3,5,9 → 남자 / 2,4,6,0 → 여자 / (5·6: 외국인, 9·0: 1800년대 출생 legacy)
// 7자리 미만이면 null 반환 — 호출 측에서 기존 값 유지.
function genderFromRrn(rrn: string): "남" | "여" | null {
  const digits = rrn.replace(/[^0-9]/g, "");
  if (digits.length < 7) return null;
  const code = digits[6];
  if (code === "1" || code === "3" || code === "5" || code === "9") return "남";
  if (code === "2" || code === "4" || code === "6" || code === "0") return "여";
  return null;
}

function PersonalInfoSection({
  p,
  // 모달 진입 시 자동 편집 모드 시작 — PanelB 의 편집 아이콘 클릭 시 사용.
  initialEdit,
  onInitialEditConsumed,
}: {
  p: PatientDetail;
  initialEdit?: boolean;
  onInitialEditConsumed?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PersonalForm>(() => personalFromPatient(p));

  const startEdit = () => { setForm(personalFromPatient(p)); setEditing(true); };
  const cancel    = () => { setForm(personalFromPatient(p)); setEditing(false); };
  const save      = () => {
    // 1단계 prototype — 실제 저장 로직 없음. 로컬 state 유지.
    console.log("[저장] 인적사항:", form);
    setEditing(false);
  };
  const set = <K extends keyof PersonalForm>(k: K, v: PersonalForm[K]) => setForm(f => ({ ...f, [k]: v }));

  // 주민번호 변경 시 성별 자동 갱신 — 7자리 도달 시 도출되는 성별이 form.gender 와 다르면 업데이트
  const setRrn = (v: string) => {
    setForm(f => {
      const next: PersonalForm = { ...f, rrn: v };
      const derived = genderFromRrn(v);
      if (derived && derived !== f.gender) next.gender = derived;
      return next;
    });
  };

  // initialEdit=true 로 진입 시 한 번만 편집 모드 시작 → 부모에게 consume 알림
  useEffect(() => {
    if (initialEdit && !editing) {
      startEdit();
      onInitialEditConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEdit]);

  return (
    <SectionCard
      title="인적사항"
      actions={<EditActions editing={editing} onEdit={startEdit} onSave={save} onCancel={cancel} />}
    >
      <EditableField label="이름"       value={form.name}            editing={editing} onChange={v => set("name", v)} />
      <EditableField label="주민번호"   value={form.rrn}             editing={editing} onChange={setRrn} placeholder="800715-2058134" />
      <EditableField label="생년월일"   value={form.birth}           editing={editing} type="date" onChange={v => set("birth", v)} />
      {/* 성별 — 주민번호에서 자동 도출. 편집 모드에서도 read-only 표시. */}
      <div className="flex items-center gap-2 py-0.5 min-h-[24px]">
        <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">성별</span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="text-sm text-[var(--text-main)]">{form.gender || "—"}</span>
          {editing && (
            <span className="text-micro text-[var(--text-tertiary)] italic">
              주민번호 자동 추출
            </span>
          )}
        </div>
      </div>
      <EditableField label="휴대폰"     value={form.phone}           editing={editing} type="tel" onChange={v => set("phone", v)} />
      <EditableField label="자택"       value={form.homePhone}       editing={editing} type="tel" onChange={v => set("homePhone", v)} />
      <EditableField label="비상연락처" value={form.emergencyPhone}  editing={editing} type="tel" onChange={v => set("emergencyPhone", v)} />
      <EditableField label="주소"       value={form.address}         editing={editing} onChange={v => set("address", v)} />
      <EditableField label="직업"       value={form.occupation}      editing={editing} onChange={v => set("occupation", v)} />
    </SectionCard>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 기타정보 섹션 — 환자그룹·환자유형(태그)·가족. 모든 필드 항상 인라인 편집.
// ║   섹션-level 편집 토글 제거. 각 필드가 즉시 commit.
// ╚══════════════════════════════════════════════════════════════════════════════
function EtcInfoSection({ p, onJumpToPatient }: { p: PatientDetail; onJumpToPatient?: (chartNo: string, initialTab: PatientDetailTab) => void }) {
  // 환자그룹·환자유형 — 변경 시 즉시 commit (섹션 단위 save/cancel 없음)
  const [patientGroup, setPatientGroup] = useState<string>(p.patientGroup ?? "");
  const [patientTypes, setPatientTypes] = useState<string[]>([...p.patientTypes]);
  const [newTag, setNewTag] = useState("");

  // 임산부 — 인라인 편집 (체크/주수 입력 즉시 commit, 별도 편집 토글 없음).
  // 여성에게만 의미가 있으므로 gender === "여" 일 때만 row 노출.
  const [isPregnant, setIsPregnant] = useState<boolean>(p.isPregnant ?? false);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<string>(
    p.pregnancyWeeks ? String(p.pregnancyWeeks) : ""
  );

  // 가족 — 별도 관리. 행 추가/삭제/관계 편집 즉시 반영.
  const [family, setFamily] = useState<PatientDetail["family"]>(() => p.family.map(f => ({ ...f })));
  // 신규 가족 등록 모달 — 후보 환자가 있으면 prefill 로 열림
  const [familyAddOpen, setFamilyAddOpen] = useState<{ prefill?: DirectoryEntry } | null>(null);
  // 관계 인라인 편집 — 어느 행 인덱스가 편집 중인지, draft 값
  const [editingRelIdx, setEditingRelIdx] = useState<number | null>(null);
  const [relDraft, setRelDraft] = useState("");
  // 가족 후보 — 가족 헤더 옆 배지로 노출. 호버 시 위쪽으로 popover 가 떠서 후보 목록 표시.
  const [candidatesHover, setCandidatesHover] = useState(false);

  const addTag = () => {
    const t = newTag.trim();
    if (!t || patientTypes.includes(t)) return;
    setPatientTypes(prev => [...prev, t]);
    setNewTag("");
  };
  const removeTag = (t: string) =>
    setPatientTypes(prev => prev.filter(x => x !== t));

  // 가족 후보 — 보험증 또는 휴대폰이 환자와 같은 디렉터리 환자.
  // 이미 가족에 등록된 chartNo 와 환자 본인은 제외.
  const familyChartNos = new Set(family.map(f => f.chartNo).filter(Boolean) as string[]);
  const candidates = PATIENT_DIRECTORY.filter(d => {
    if (d.chartNo === p.chartNo) return false;           // 본인 제외
    if (familyChartNos.has(d.chartNo)) return false;     // 이미 등록된 가족 제외
    const cardMatch = !!p.insurance.cardNumber && d.insuranceCard === p.insurance.cardNumber;
    const phoneMatch = d.phone === p.phone;
    return cardMatch || phoneMatch;
  }).map(d => ({
    ...d,
    matchReason:
      d.insuranceCard === p.insurance.cardNumber && d.phone === p.phone ? "보험증·핸드폰" :
      d.insuranceCard === p.insurance.cardNumber ? "보험증" :
      "핸드폰",
  }));

  // 가족 CRUD — 모두 즉시 반영
  const addFamilyMember = (m: PatientDetail["family"][number]) => {
    setFamily(prev => [...prev, m]);
    setFamilyAddOpen(null);
  };
  const removeFamily = (i: number) =>
    setFamily(prev => prev.filter((_, idx) => idx !== i));

  // 관계 인라인 편집 — 드롭다운(<select>)으로 변경. 변경 시 즉시 commit.
  const beginEditRel = (i: number, currentRel: string) => {
    setEditingRelIdx(i);
    setRelDraft(currentRel);
  };
  const commitEditRelWith = (idx: number, next: string) => {
    if (!next) { setEditingRelIdx(null); return; }
    setFamily(prev => prev.map((m, i) => i === idx ? { ...m, relation: next } : m));
    setEditingRelIdx(null);
  };
  const cancelEditRel = () => setEditingRelIdx(null);

  // 가족 이름 클릭 → 해당 환자 상세보기 팝업 (내원이력 탭으로 열림).
  // onJumpToPatient 콜백이 있으면 호출, 없으면 alert 으로 fallback.
  const viewPatientInfo = (member: PatientDetail["family"][number]) => {
    if (member.chartNo && onJumpToPatient) {
      onJumpToPatient(member.chartNo, "내원이력");
      return;
    }
    window.alert(`${member.name} (차트 ${member.chartNo ?? "—"}) — 차트번호 없거나 등록 안 됨`);
  };

  return (
    <SectionCard title="기타정보">
      {/* 환자그룹 — 드롭다운 인라인 편집. 변경 즉시 commit. */}
      <div className="flex items-center gap-2 py-0.5 min-h-[24px]">
        <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">환자그룹</span>
        <div className="flex-1 min-w-0">
          <select
            value={PATIENT_GROUPS.includes(patientGroup as (typeof PATIENT_GROUPS)[number]) ? patientGroup : ""}
            onChange={e => setPatientGroup(e.target.value)}
            title="환자그룹 선택"
            className="h-6 px-1.5 text-sm border border-transparent rounded-sm bg-transparent outline-none hover:border-[var(--line-default)] focus:border-[var(--brand-primary)] focus:bg-white cursor-pointer"
          >
            <option value="">— 선택 —</option>
            {PATIENT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* 환자유형 — 칩 형태. 항상 ✕ + 추가 input 노출 (섹션 편집 모드 없음). */}
      <div className="flex items-start gap-2 py-0.5 min-h-[24px]">
        <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0 pt-0.5">환자유형</span>
        <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
          {patientTypes.length === 0 && (
            <span className="text-sm text-[var(--text-tertiary)]">없음</span>
          )}
          {patientTypes.map(t => (
            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 h-[18px] rounded-sm bg-[var(--bg-primary-subtle)] text-xs text-[var(--brand-primary)] font-medium">
              {t}
              <button
                onClick={() => removeTag(t)}
                className="ml-0.5 w-3 h-3 flex items-center justify-center text-[10px] leading-none hover:text-[var(--red-500)]"
                title={`${t} 태그 삭제`}
              >
                ✕
              </button>
            </span>
          ))}
          {/* 새 태그 추가 input — 항상 노출 */}
          <div className="inline-flex items-center gap-1">
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="+ 태그 추가"
              className="h-[18px] w-24 px-1 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-tertiary)]"
            />
            {newTag.trim() && (
              <button
                onClick={addTag}
                className="text-xs text-[var(--brand-primary)] hover:underline"
              >
                추가
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 임산부 — 인라인 편집 (즉시 commit). 여성에게만 의미 있어 gender 조건부 노출.
          체크박스로 임산부 여부 토글 → 체크 시 우측에 주수 input 등장. */}
      {p.gender === "여" && (
        <div className="flex items-center gap-2 py-0.5 min-h-[24px]">
          <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">임산부</span>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPregnant}
                onChange={e => {
                  setIsPregnant(e.target.checked);
                  // 체크 해제 시 주수도 함께 비움 — 데이터 정합성
                  if (!e.target.checked) setPregnancyWeeks("");
                }}
                className="w-3.5 h-3.5 accent-[var(--brand-primary)] cursor-pointer"
              />
              <span className="text-[var(--text-main)]">임산부</span>
            </label>
            {isPregnant ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="42"
                  value={pregnancyWeeks}
                  onChange={e => setPregnancyWeeks(e.target.value)}
                  onFocus={e => e.target.select()}
                  placeholder="주수"
                  className="w-14 h-6 px-1.5 text-sm text-center border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)] tabular-nums"
                />
                <span className="text-xs text-[var(--text-sub)]">주</span>
                {pregnancyWeeks && (
                  // 입력된 주수를 우측에 orange 배지로도 노출 — 한 줄에서 인지 강조
                  <span className="ml-1 text-micro font-bold px-1.5 py-0.5 rounded-sm bg-[var(--status-warning-bg-subtle)] text-[var(--orange-700)] border border-[var(--orange-200)] tabular-nums">
                    임신 {pregnancyWeeks}주
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-[var(--text-tertiary)]">— 해당없음</span>
            )}
          </div>
        </div>
      )}

      {/* 가족 sub-section — 섹션 편집 모드와 무관하게 항상 인터랙티브.
          + 추가, 환자 상세보기, 관계 인라인 편집, 삭제 모두 즉시 동작.
          컬럼: 차트번호 / 이름 / 성별·나이 / 휴대폰 / 관계 + 액션. 생년월일 컬럼 제거로 가로 스크롤 방지. */}
      <div className="pt-2 mt-2 border-t border-[var(--line-subtle)]">
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-[var(--text-main)]">
              가족 <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">({family.length}명)</span>
            </span>
            {/* 가족 후보 알림 배지 — 호버 시 위쪽으로 popover 가 떠서 후보 목록 표시.
                보험증/핸드폰 일치 환자가 자동 추천됨. */}
            {candidates.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setCandidatesHover(true)}
                onMouseLeave={() => setCandidatesHover(false)}
              >
                <span
                  className="inline-flex items-center gap-0.5 h-[18px] px-1.5 rounded-full bg-[var(--bg-primary-subtle)] border border-[var(--blue-200)] text-[var(--brand-primary)] cursor-help"
                  title={`가족 후보 ${candidates.length}명`}
                  aria-describedby="family-candidates-popover"
                >
                  <span className="text-[10px] leading-none">💡</span>
                  <span className="text-micro font-bold tabular-nums">{candidates.length}</span>
                </span>
                {candidatesHover && (
                  <div
                    id="family-candidates-popover"
                    role="tooltip"
                    className="absolute bottom-full left-0 mb-1.5 z-20 w-[340px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--line-default)] overflow-hidden"
                  >
                    <div className="flex items-baseline gap-1.5 px-3 py-1.5 border-b border-[var(--line-subtle)] bg-[var(--bg-subtle)]">
                      <span className="text-xs font-bold text-[var(--text-main)]">가족 후보</span>
                      <span className="text-xs font-normal text-[var(--text-tertiary)] tabular-nums">{candidates.length}명</span>
                      <span className="text-micro text-[var(--text-tertiary)] ml-auto">보험증·핸드폰 일치</span>
                    </div>
                    <div className="flex flex-col py-1 max-h-[260px] overflow-y-auto">
                      {candidates.map(c => (
                        <button
                          key={c.chartNo}
                          onClick={() => { setCandidatesHover(false); setFamilyAddOpen({ prefill: c }); }}
                          className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--bg-primary-subtle)] text-left transition-colors group/cand"
                          title={`${c.name} 가족으로 등록`}
                        >
                          <span className="text-xs text-[var(--text-tertiary)] tabular-nums w-14 flex-shrink-0">{c.chartNo}</span>
                          <span className="text-sm font-medium text-[var(--text-main)] flex-shrink-0">{c.name}</span>
                          <span className="text-xs text-[var(--text-sub)] tabular-nums flex-shrink-0">{c.gender}/{calcAge(c.birth)}</span>
                          <div className="flex-1" />
                          <span className="text-micro font-medium text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] border border-[var(--blue-200)] px-1 rounded-sm flex-shrink-0">
                            {c.matchReason}
                          </span>
                          <span className="text-xs text-[var(--brand-primary)] font-medium flex-shrink-0 opacity-0 group-hover/cand:opacity-100 transition-opacity">+ 등록</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setFamilyAddOpen({})}
            className="text-xs text-[var(--brand-primary)] hover:underline flex-shrink-0"
          >
            + 가족 추가
          </button>
        </div>
        {/* 가족 표 — 컬럼 폭 재조정으로 텍스트 겹침 방지.
            차트번호 64 / 이름 (auto) / 성별·나이 56 / 휴대폰 108 / 관계 72 / 액션 40.
            액션은 삭제만 — 환자 상세보기는 이름 클릭으로 이동. */}
        {family.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] py-1">등록된 가족 없음 — 우측 상단의 “+ 가족 추가” 로 등록</p>
        ) : (
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col style={{ width: "64px" }} />   {/* 차트번호 */}
              <col />                              {/* 이름 (남는 폭) */}
              <col style={{ width: "56px" }} />   {/* 성별/나이 */}
              <col style={{ width: "108px" }} />  {/* 휴대폰 — 010-1234-5678 한 줄 */}
              <col style={{ width: "72px" }} />   {/* 관계 */}
              <col style={{ width: "40px" }} />   {/* 액션 (삭제) */}
            </colgroup>
            <thead>
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                <th className="text-xs font-medium text-[var(--text-tertiary)] text-left px-2 py-1 whitespace-nowrap">차트번호</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] text-left px-2 py-1 whitespace-nowrap">이름</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] text-left px-2 py-1 whitespace-nowrap">성별/나이</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] text-left px-2 py-1 whitespace-nowrap">휴대폰</th>
                <th className="text-xs font-medium text-[var(--text-tertiary)] text-left px-2 py-1 whitespace-nowrap">관계</th>
                <th className="px-2 py-1" />{/* 액션 컬럼 헤더 없음 */}
              </tr>
            </thead>
            <tbody>
              {family.map((f, i) => {
                const isEditingRel = editingRelIdx === i;
                // 성별/나이 — gender 와 age 둘 다 있으면 "여/45" 형식. 하나만 있으면 그것만.
                const genderAge = f.gender && f.age !== undefined
                  ? `${f.gender}/${f.age}`
                  : f.gender ?? (f.age !== undefined ? `${f.age}세` : "—");
                return (
                  <tr key={i} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                    <td className="px-2 py-1 tabular-nums text-xs text-[var(--text-tertiary)] truncate">{f.chartNo ?? "—"}</td>
                    {/* 이름 — 클릭하면 환자 상세정보 팝업의 내원이력 탭으로 점프 */}
                    <td className="px-2 py-1 truncate">
                      <button
                        onClick={() => viewPatientInfo(f)}
                        disabled={!f.chartNo}
                        title={f.chartNo ? `${f.name} 환자 상세보기 (내원이력)` : "차트번호 없음"}
                        className={`text-sm font-medium truncate text-left ${
                          f.chartNo
                            ? "text-[var(--text-main)] hover:text-[var(--brand-primary)] hover:underline"
                            : "text-[var(--text-main)] cursor-default"
                        }`}
                      >
                        {f.name}
                      </button>
                    </td>
                    <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums">{genderAge}</td>
                    <td className="px-2 py-1 text-xs text-[var(--text-sub)] tabular-nums truncate">{f.phone ?? "—"}</td>
                    {/* 관계 — 클릭 시 드롭다운(<select>). 선택 즉시 commit. */}
                    <td className="px-2 py-1 text-xs">
                      {isEditingRel ? (
                        <select
                          autoFocus
                          value={FAMILY_RELATIONS.includes(relDraft as FamilyRelation) ? relDraft : ""}
                          onChange={e => commitEditRelWith(i, e.target.value)}
                          onBlur={cancelEditRel}
                          onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); cancelEditRel(); } }}
                          className="h-6 w-full px-1 text-xs border border-[var(--brand-primary)] rounded-sm bg-white outline-none"
                        >
                          <option value="">— 선택 —</option>
                          {FAMILY_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => beginEditRel(i, f.relation)}
                          title="관계 변경 — 부모/조부모/자녀/배우자/기타"
                          className="text-xs text-[var(--text-sub)] hover:text-[var(--brand-primary)] hover:underline inline-flex items-center gap-0.5"
                        >
                          {f.relation || <span className="text-[var(--text-tertiary)]">—</span>}
                          <span className="text-micro text-[var(--text-tertiary)]">▾</span>
                        </button>
                      )}
                    </td>
                    {/* 액션 — 삭제만. 환자 상세보기는 이름 클릭으로 이동. */}
                    <td className="px-1 py-1 text-right">
                      <button
                        onClick={() => removeFamily(i)}
                        title="가족 행 삭제"
                        className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red-500)]"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 가족 후보 영역은 위쪽 가족 헤더 옆 배지 (호버 popover) 로 이동됨. */}
      </div>

      {/* 가족 추가 sub-modal — prefill 있으면 검색 단계 skip, 관계만 선택. */}
      {familyAddOpen && (
        <FamilyAddModal
          prefill={familyAddOpen.prefill}
          onSave={addFamilyMember}
          onClose={() => setFamilyAddOpen(null)}
        />
      )}
    </SectionCard>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 가족 추가 sub-modal — 원내 환자 검색 + 관계 드롭다운만 (수동 입력 제거)
// ╚══════════════════════════════════════════════════════════════════════════════
// 원내 환자 디렉터리 mock — 실제로는 검색 API 호출. prototype 은 클라이언트 필터.
// insuranceCard 동일 + phone 동일 매칭으로 "가족 후보" 자동 추천에 활용.
type DirectoryEntry = {
  chartNo: string;
  name: string;
  birth: string;
  phone: string;
  gender: "남" | "여";
  insuranceCard: string;
};
const PATIENT_DIRECTORY: DirectoryEntry[] = [
  { chartNo: "100412", name: "김허나",  birth: "2007-05-12", phone: "010-2424-8585", gender: "여", insuranceCard: "1-1234567890" }, // 황미진 피부양자
  { chartNo: "100089", name: "박혜은",  birth: "1977-12-30", phone: "010-9876-5432", gender: "여", insuranceCard: "1-1234567890" }, // 황미진 배우자
  { chartNo: "100543", name: "황민철",  birth: "1948-09-18", phone: "010-3333-1111", gender: "남", insuranceCard: "1-1234567890" }, // 황미진 보험증 매칭 → 시아버지 후보
  { chartNo: "100762", name: "황도연",  birth: "1975-03-04", phone: "010-1234-5678", gender: "여", insuranceCard: "2-9876543210" }, // 황미진 전화 매칭 → 가족 후보
  { chartNo: "100815", name: "김재훈",  birth: "1980-11-22", phone: "010-4567-1234", gender: "남", insuranceCard: "3-1111222233" },
  { chartNo: "100948", name: "이서준",  birth: "1995-08-14", phone: "010-5555-3333", gender: "남", insuranceCard: "4-5555666677" },
  { chartNo: "101023", name: "최민지",  birth: "1972-02-09", phone: "010-2233-4455", gender: "여", insuranceCard: "5-8888999900" },
];

// 가족 관계 옵션 — 가족 추가 시 선택 가능한 관계 종류 (드롭다운)
const FAMILY_RELATIONS = ["부모", "조부모", "자녀", "배우자", "기타"] as const;
type FamilyRelation = typeof FAMILY_RELATIONS[number];

// 환자그룹 옵션 — 병원 자체 분류. 1개만 선택 가능 (드롭다운).
// 추후 병원 마스터에서 등록·관리되는 데이터.
const PATIENT_GROUPS = ["GC Cell", "일반", "VIP", "단골", "임직원", "보훈", "산재", "기타"] as const;

function FamilyAddModal({
  prefill,
  onSave,
  onClose,
}: {
  prefill?: DirectoryEntry;  // 가족 후보 클릭 시 미리 환자 선택된 상태로 열림
  onSave: (m: PatientDetail["family"][number]) => void;
  onClose: () => void;
}) {
  // 검색 + 선택된 환자 + 관계 — 모달의 모든 입력은 이 3개만.
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<DirectoryEntry | null>(prefill ?? null);
  const [relation, setRelation] = useState<FamilyRelation | "">("");

  // 검색 결과 — 차트번호 또는 이름 부분 매칭
  const q = search.trim().toLowerCase();
  const matches = q && !picked
    ? PATIENT_DIRECTORY.filter(p => p.chartNo.includes(q) || p.name.toLowerCase().includes(q)).slice(0, 6)
    : [];

  const canSubmit = picked !== null && relation !== "";

  const submit = () => {
    if (!canSubmit || !picked) return;
    onSave({
      chartNo: picked.chartNo,
      name: picked.name,
      relation,
      birth: picked.birth,
      phone: picked.phone,
      age: calcAge(picked.birth),
      gender: picked.gender,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[460px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line-default)]">
          <h3 className="text-sm font-bold text-[var(--text-main)]">가족 추가</h3>
          {/* 우상단 ✕ — 정책 §4 필수. */}
          <button onClick={onClose} aria-label="닫기" title="닫기"
            className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 1단계: 원내 환자 검색 (picked 가 없을 때만) */}
        {!picked && (
          <div className="px-4 pt-3 pb-2 relative">
            <p className="text-xs font-bold text-[var(--text-main)] mb-1">원내 환자 검색</p>
            <p className="text-micro text-[var(--text-tertiary)] mb-2">차트번호 또는 이름으로 검색 후 환자를 선택하세요.</p>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 차트번호 또는 이름"
              className="h-8 w-full px-2 text-sm border border-[var(--line-default)] rounded-md bg-white outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--brand-primary)]"
            />
            {/* 검색 결과 list */}
            {matches.length > 0 && (
              <div className="mt-1 border border-[var(--line-default)] rounded-md max-h-[240px] overflow-y-auto">
                {matches.map(p => (
                  <button
                    key={p.chartNo}
                    onClick={() => setPicked(p)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--bg-subtle)] border-b border-[var(--line-subtle)] last:border-b-0"
                  >
                    <span className="text-xs text-[var(--text-tertiary)] tabular-nums w-14 flex-shrink-0">{p.chartNo}</span>
                    <span className="text-sm font-medium text-[var(--text-main)] flex-shrink-0">{p.name}</span>
                    <span className="text-xs text-[var(--text-sub)] tabular-nums">{p.gender}/{calcAge(p.birth)}</span>
                    <span className="text-xs text-[var(--text-tertiary)] tabular-nums ml-auto">{p.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {q && matches.length === 0 && (
              <p className="text-micro text-[var(--text-tertiary)] mt-1">일치하는 환자 없음</p>
            )}
          </div>
        )}

        {/* 2단계: 선택된 환자 정보 + 관계 드롭다운 */}
        {picked && (
          <div className="px-4 pt-3 pb-3 flex flex-col gap-3">
            {/* 선택된 환자 카드 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--bg-primary-subtle)] border border-[var(--blue-200)]">
              <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{picked.chartNo}</span>
              <span className="text-sm font-bold text-[var(--text-main)]">{picked.name}</span>
              <span className="text-xs text-[var(--text-sub)] tabular-nums">{picked.gender}/{calcAge(picked.birth)}</span>
              <span className="text-xs text-[var(--text-tertiary)] tabular-nums ml-auto">{picked.phone}</span>
              <button
                onClick={() => setPicked(null)}
                title="다시 검색"
                className="text-xs text-[var(--brand-primary)] hover:underline flex-shrink-0"
              >
                다시 검색
              </button>
            </div>

            {/* 관계 드롭다운 — 부모 / 조부모 / 자녀 / 배우자 / 기타 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">관계 *</span>
              <select
                value={relation}
                onChange={e => setRelation(e.target.value as FamilyRelation)}
                className="h-8 flex-1 px-2 text-sm border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="">— 선택 —</option>
                {FAMILY_RELATIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 액션 — CTA 만 (정책 §4: [취소] 사용 안 함, 닫기는 ✕). */}
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-[var(--line-default)] bg-[var(--bg-subtle)]">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`h-7 px-3 text-xs font-bold rounded-md transition-colors ${
              canSubmit
                ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                : "bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            추가
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
