// 오늘의 진료 리포트 — 진료실 마감 시점 모달
// 진료한 명세서를 자동 검토해 매출 / 매출 기회 / 실사 위험 / 환자 액션 4축으로 요약.
// 닫으면 진료실 우하단에 "다시 보기" 플로팅 버튼이 노출된다.
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
// chart-prototype 의 SettledPatientsTable 이식본 — 좌측 환자 목록 표 영역.
import { SettledPatientsTable } from "./today-report/SettledPatientsTable";

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 타입
// ╚══════════════════════════════════════════════════════════════════════════════
type WidgetKey = "revenue" | "missed" | "risk" | "action" | "distribution" | "precheck";

// 사전점검(PreCheck) 정리 — 진료 중 수정한 결과를 기초자료에 일괄 반영하는 영역
type PreCheckKind =
  | "incompleteDx"      // 불완전상병
  | "anesthesiologist"  // 마취과 전문의
  | "zeroDose"          // 용량 0
  | "durDiagnosis"      // DUR — 상병 필요
  | "durDose"           // DUR — 용량주의
  | "durProhibited";    // DUR — 병용금기 대체

interface PreCheckSummaryItem {
  id: string;
  kind: PreCheckKind;
  patient: string;          // "김민수님(F/56)"
  before: string;           // "J06.9 상세불명의 급성 상기도감염"
  after: string;            // "J00 급성 비인두염"
  masterTarget: string;     // 기초자료 반영 대상 설명 (예: "상병 기초자료에 매핑 저장")
  appliedAtChart?: boolean; // 진료 중 이미 마스터 반영 클릭한 경우
}

type RiskLevel = "High" | "Mid" | "Low";
type RiskTag = "Missing" | "Duplicate" | "Mismatch";

// 한글 라벨 매핑
const RISK_LEVEL_KO: Record<RiskLevel, string> = {
  High: "높은 위험",
  Mid:  "중간 위험",
  Low:  "낮은 위험",
};
const RISK_TAG_KO: Record<RiskTag, string> = {
  Missing:   "누락",
  Duplicate: "중복",
  Mismatch:  "불일치",
};

interface MissedItem {
  id: string;
  patient: string;       // 환자명 + 성/연령
  reason: string;        // 한 줄 사유
  amount: number;        // 회수 가능 금액
  category: "가산항목" | "정기검사" | "공단검진" | "권유미실행";
}

interface RiskItem {
  id: string;
  tag: RiskTag;
  patient: string;
  detail: string;
  level: RiskLevel;
}

type PatientActionType = "미수" | "후속콜" | "예약권유";
interface PatientActionItem {
  id: string;
  type: PatientActionType;
  title: string;
  detail: string;
  meta?: string;        // ex. ₩45,000
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 더미 데이터 (개원의 1일 평균 매출 200~300만원 기준)
// ╚══════════════════════════════════════════════════════════════════════════════
// 진료중 환자 수 — 일과 종료 시점 가정시 0. 진행 중 리포트일 땐 양수.
const TODAY_IN_TREATMENT_COUNT = 0;
// TODAY_PATIENT_COUNT 는 SETTLED_PATIENTS 선언 후 derived (line 233 부근).
const LAST_CHART_TIME = "18:24";

// 오늘 진료받은 환자 목록 (수납대기 + 수납완료 모두 포함, 조회결과 표용)
// 컬럼: 차트번호, 환자정보(이름·성별·나이·신환·휴대폰·보험), 진료정보(시간·외래·초/재진·담당의·본인확인),
//      진료비 산정내역(총액·공단·본인·비급여), 결제정보(카드·현금·미수·결제상태)
// 결제상태: "수납대기" = 진료 끝났지만 결제 아직 / "수납완료" = 결제까지 완료. 미지정시 "수납완료" 로 간주.
export type SettledPatient = {
  chartNo: string;
  name: string;
  gender: "남" | "여";
  age: number;
  isNew: boolean;             // 신환여부 — 첫 방문 환자
  phone: string;
  insType: "건강보험" | "의료급여" | "산재" | "일반";
  visitTime: string;          // HH:MM
  visitKind: "외래" | "입원";
  isFirstVisit: boolean;      // 초진(true) / 재진(false)
  doctor: string;
  selfVerified: boolean;      // 본인확인
  tags: string[];             // 환자유형 — 병원 커스텀 태그 (VIP/만성질환/임산부/단골 등)
  total: number;              // 진료비 총액
  nhis: number;               // 공단부담금
  selfPay: number;            // 본인부담금
  noPay: number;              // 비급여
  card: number;
  cash: number;
  unpaid: number;             // 미수 (수납완료 후 일부 미수금)
  status?: "수납대기" | "수납완료";  // 결제 상태. 미지정시 "수납완료" 로 간주.
};

// 병원 커스텀 환자 태그 — 실제 EMR 에서는 병원별로 등록·관리되는 마스터 데이터
export const PATIENT_TAGS = ["VIP", "만성질환", "임산부", "단골", "알러지주의", "보호자동반", "장기처방"];

export const SETTLED_PATIENTS: SettledPatient[] = [
  // ── 오전 (09~12시) ──
  { chartNo: "302", name: "윤태석", gender: "남", age: 58, isNew: false, phone: "010-7788-2233", insType: "건강보험",
    visitTime: "09:08", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["만성질환", "장기처방"],
    total: 23150, nhis: 16800, selfPay: 6350, noPay: 0, card: 6350, cash: 0, unpaid: 0 },
  { chartNo: "415", name: "한지원", gender: "여", age: 45, isNew: false, phone: "010-2244-3366", insType: "건강보험",
    visitTime: "09:22", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: true,
    tags: ["VIP", "단골"],
    total: 31840, nhis: 22240, selfPay: 9600, noPay: 0, card: 9600, cash: 0, unpaid: 0 },
  { chartNo: "098", name: "정민수", gender: "남", age: 27, isNew: true, phone: "010-5566-7788", insType: "건강보험",
    visitTime: "09:45", visitKind: "외래", isFirstVisit: true, doctor: "김지혜", selfVerified: true,
    tags: [],
    total: 15400, nhis: 10780, selfPay: 4620, noPay: 0, card: 4620, cash: 0, unpaid: 0 },
  { chartNo: "222", name: "김세나", gender: "여", age: 35, isNew: false, phone: "010-6700-4572", insType: "건강보험",
    visitTime: "10:05", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: false,
    tags: ["VIP"],
    total: 501640, nhis: 1540, selfPay: 100, noPay: 500000, card: 500400, cash: 0, unpaid: 0 },
  { chartNo: "186", name: "장미경", gender: "여", age: 51, isNew: false, phone: "010-9911-2233", insType: "건강보험",
    visitTime: "10:28", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["단골"],
    total: 12450, nhis: 8910, selfPay: 3540, noPay: 0, card: 3540, cash: 0, unpaid: 0 },
  { chartNo: "367", name: "박재훈", gender: "남", age: 41, isNew: false, phone: "010-1212-5656", insType: "산재",
    visitTime: "10:51", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: true,
    tags: [],
    total: 64200, nhis: 64200, selfPay: 0, noPay: 0, card: 0, cash: 0, unpaid: 0 },
  { chartNo: "549", name: "신유리", gender: "여", age: 22, isNew: true, phone: "010-3737-8989", insType: "일반",
    visitTime: "11:14", visitKind: "외래", isFirstVisit: true, doctor: "이지원", selfVerified: true,
    tags: [],
    total: 48500, nhis: 0, selfPay: 0, noPay: 48500, card: 48500, cash: 0, unpaid: 0 },
  { chartNo: "271", name: "조성현", gender: "남", age: 38, isNew: false, phone: "010-4848-2929", insType: "건강보험",
    visitTime: "11:36", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["알러지주의"],
    total: 19820, nhis: 14070, selfPay: 5750, noPay: 0, card: 5750, cash: 0, unpaid: 0 },
  { chartNo: "483", name: "김두경", gender: "남", age: 34, isNew: true, phone: "—", insType: "건강보험",
    visitTime: "11:55", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: false,
    tags: [],
    total: 20430, nhis: 14330, selfPay: 6100, noPay: 0, card: 6100, cash: 0, unpaid: 0 },

  // ── 오후 (12~15시) ──
  { chartNo: "481", name: "김겸진", gender: "여", age: 33, isNew: false, phone: "—", insType: "건강보험",
    visitTime: "12:33", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: false,
    tags: ["임산부"],
    total: 17610, nhis: 12410, selfPay: 5200, noPay: 0, card: 5200, cash: 0, unpaid: 0 },
  { chartNo: "236", name: "이진영", gender: "여", age: 62, isNew: false, phone: "010-5421-1212", insType: "건강보험",
    visitTime: "12:39", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: false,
    tags: ["만성질환", "보호자동반"],
    total: 17610, nhis: 12410, selfPay: 5200, noPay: 0, card: 5200, cash: 0, unpaid: 0 },
  { chartNo: "612", name: "황도현", gender: "남", age: 49, isNew: false, phone: "010-8282-1010", insType: "건강보험",
    visitTime: "13:02", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: true,
    tags: [],
    total: 25340, nhis: 18130, selfPay: 7210, noPay: 0, card: 7210, cash: 0, unpaid: 0 },
  { chartNo: "157", name: "박서영", gender: "여", age: 28, isNew: false, phone: "010-2233-1199", insType: "건강보험",
    visitTime: "13:50", visitKind: "외래", isFirstVisit: true, doctor: "김다영", selfVerified: true,
    tags: ["임산부"],
    total: 18630, nhis: 14730, selfPay: 3900, noPay: 0, card: 3900, cash: 0, unpaid: 0 },
  { chartNo: "428", name: "최서아", gender: "여", age: 19, isNew: true, phone: "010-3434-6767", insType: "건강보험",
    visitTime: "14:08", visitKind: "외래", isFirstVisit: true, doctor: "김지혜", selfVerified: true,
    tags: [],
    total: 21560, nhis: 15090, selfPay: 6470, noPay: 0, card: 0, cash: 6470, unpaid: 0 },
  { chartNo: "591", name: "임재현", gender: "남", age: 53, isNew: false, phone: "010-1313-9494", insType: "건강보험",
    visitTime: "14:21", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["VIP", "장기처방"],
    total: 132840, nhis: 28430, selfPay: 14410, noPay: 90000, card: 104410, cash: 0, unpaid: 0 },
  { chartNo: "204", name: "백지혜", gender: "여", age: 31, isNew: false, phone: "010-7676-4242", insType: "건강보험",
    visitTime: "14:45", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: true,
    tags: ["단골"],
    total: 16280, nhis: 11400, selfPay: 4880, noPay: 0, card: 4880, cash: 0, unpaid: 0 },
  { chartNo: "619", name: "최준호", gender: "남", age: 47, isNew: false, phone: "010-9876-5432", insType: "건강보험",
    visitTime: "15:12", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: true,
    tags: ["만성질환"],
    total: 87420, nhis: 35400, selfPay: 12020, noPay: 40000, card: 52020, cash: 0, unpaid: 0 },

  // ── 오후 (15~18시) ──
  { chartNo: "317", name: "오민재", gender: "남", age: 8, isNew: false, phone: "010-5050-3030", insType: "건강보험",
    visitTime: "15:30", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["보호자동반"],
    total: 13720, nhis: 9810, selfPay: 3910, noPay: 0, card: 3910, cash: 0, unpaid: 0 },
  { chartNo: "445", name: "송지아", gender: "여", age: 26, isNew: true, phone: "010-2424-8585", insType: "일반",
    visitTime: "15:48", visitKind: "외래", isFirstVisit: true, doctor: "이지원", selfVerified: true,
    tags: [],
    total: 78000, nhis: 0, selfPay: 0, noPay: 78000, card: 78000, cash: 0, unpaid: 0 },
  { chartNo: "138", name: "강채원", gender: "여", age: 64, isNew: false, phone: "010-6262-9191", insType: "의료급여",
    visitTime: "16:04", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: false,
    tags: ["만성질환"],
    total: 28950, nhis: 28950, selfPay: 0, noPay: 0, card: 0, cash: 0, unpaid: 0 },
  { chartNo: "403", name: "오오름", gender: "남", age: 35, isNew: false, phone: "010-5555-8888", insType: "건강보험",
    visitTime: "16:21", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: false,
    tags: [],
    total: 17610, nhis: 12410, selfPay: 5200, noPay: 0, card: 5200, cash: 0, unpaid: 0 },
  { chartNo: "528", name: "강민서", gender: "여", age: 19, isNew: true, phone: "010-3344-7788", insType: "일반",
    visitTime: "16:48", visitKind: "외래", isFirstVisit: true, doctor: "이지원", selfVerified: true,
    tags: [],
    total: 35000, nhis: 0, selfPay: 0, noPay: 35000, card: 35000, cash: 0, unpaid: 0 },
  { chartNo: "262", name: "유서준", gender: "남", age: 12, isNew: false, phone: "010-9494-5151", insType: "건강보험",
    visitTime: "17:02", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: false,
    tags: ["보호자동반"],
    total: 11340, nhis: 8050, selfPay: 3290, noPay: 0, card: 0, cash: 3290, unpaid: 0 },
  { chartNo: "578", name: "고은별", gender: "여", age: 37, isNew: false, phone: "010-7373-6262", insType: "건강보험",
    visitTime: "17:18", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: true,
    tags: ["단골"],
    total: 42180, nhis: 22640, selfPay: 9540, noPay: 10000, card: 19540, cash: 0, unpaid: 0 },
  { chartNo: "350", name: "권혁진", gender: "남", age: 60, isNew: false, phone: "010-5959-2727", insType: "건강보험",
    visitTime: "17:35", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: false,
    tags: ["만성질환", "장기처방"],
    total: 26730, nhis: 19080, selfPay: 7650, noPay: 0, card: 7650, cash: 0, unpaid: 0 },
  { chartNo: "112", name: "심수빈", gender: "여", age: 24, isNew: false, phone: "010-1818-3939", insType: "건강보험",
    visitTime: "17:50", visitKind: "외래", isFirstVisit: false, doctor: "김다영", selfVerified: true,
    tags: [],
    total: 14820, nhis: 10580, selfPay: 4240, noPay: 0, card: 4240, cash: 0, unpaid: 0 },
  { chartNo: "697", name: "노현우", gender: "남", age: 44, isNew: false, phone: "010-2020-4141", insType: "건강보험",
    visitTime: "18:05", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: false,
    tags: ["알러지주의"],
    total: 22340, nhis: 15880, selfPay: 6460, noPay: 0, card: 0, cash: 0, unpaid: 22340 },
  { chartNo: "234", name: "황세진", gender: "여", age: 39, isNew: false, phone: "010-3232-7878", insType: "건강보험",
    visitTime: "18:14", visitKind: "외래", isFirstVisit: false, doctor: "김지혜", selfVerified: true,
    tags: ["단골"],
    total: 19450, nhis: 13780, selfPay: 5670, noPay: 0, card: 5670, cash: 0, unpaid: 0 },
  { chartNo: "501", name: "남도윤", gender: "남", age: 16, isNew: true, phone: "010-4747-3636", insType: "건강보험",
    visitTime: "18:22", visitKind: "외래", isFirstVisit: true, doctor: "김다영", selfVerified: false,
    tags: ["보호자동반"],
    total: 17890, nhis: 12640, selfPay: 5250, noPay: 0, card: 0, cash: 5250, unpaid: 0 },

  // ── 수납대기 — 진료는 끝났지만 아직 결제 안 한 환자 (card·cash·unpaid 모두 0) ──
  { chartNo: "618", name: "정태우", gender: "남", age: 52, isNew: false, phone: "010-8281-4422", insType: "건강보험",
    visitTime: "17:58", visitKind: "외래", isFirstVisit: false, doctor: "이지원", selfVerified: false,
    tags: ["만성질환"],
    total: 24350, nhis: 17220, selfPay: 7130, noPay: 0, card: 0, cash: 0, unpaid: 0, status: "수납대기" },
  { chartNo: "729", name: "홍서연", gender: "여", age: 29, isNew: true, phone: "010-3914-6628", insType: "일반",
    visitTime: "18:28", visitKind: "외래", isFirstVisit: true, doctor: "김지혜", selfVerified: true,
    tags: [],
    total: 45600, nhis: 0, selfPay: 0, noPay: 45600, card: 0, cash: 0, unpaid: 0, status: "수납대기" },
];

// 오늘 진료환자 총수 — 데이터에서 derived (수납대기 + 수납완료 + 진료중)
const TODAY_PATIENT_COUNT = SETTLED_PATIENTS.length + TODAY_IN_TREATMENT_COUNT;

// 수납완료 환자 집계 — 요약 카드에 사용
const SETTLED_TOTAL = SETTLED_PATIENTS.reduce((s, p) => s + p.total, 0);
const SETTLED_NHIS = SETTLED_PATIENTS.reduce((s, p) => s + p.nhis, 0);
const SETTLED_SELF = SETTLED_PATIENTS.reduce((s, p) => s + p.selfPay, 0);
const SETTLED_NOPAY = SETTLED_PATIENTS.reduce((s, p) => s + p.noPay, 0);
const SETTLED_FIRST_VISIT = SETTLED_PATIENTS.filter(p => p.isFirstVisit).length;
const SETTLED_REVISIT = SETTLED_PATIENTS.length - SETTLED_FIRST_VISIT;
const SETTLED_NEW = SETTLED_PATIENTS.filter(p => p.isNew).length;

// 매출
// 본인부담은 급여의 일부이므로 "급여"와 나란히 두면 안 됨.
// 정확한 3분할: 공단부담(NHIS 지급) / 본인부담(급여 내 환자 자부담) / 비급여(환자 100%)
// → 공단부담 + 본인부담 = 급여 매출, 그 외가 비급여 매출
const REVENUE = {
  total: 2_847_000,
  vsYesterdayPct: 12,
  vsWeekAvgPct: 8,
  byKind: { 공단부담: 1_500_000, 본인부담: 627_000, 비급여: 720_000 },
  // 9시~18시 시간대별 매출 (10개 포인트)
  hourly: [
    { h: "09", v: 180_000 },
    { h: "10", v: 320_000 },
    { h: "11", v: 410_000 },
    { h: "12", v: 220_000 },
    { h: "13", v: 90_000  },
    { h: "14", v: 280_000 },
    { h: "15", v: 365_000 },
    { h: "16", v: 480_000 },
    { h: "17", v: 320_000 },
    { h: "18", v: 182_000 },
  ],
  perPatientAvg: Math.round(2_847_000 / 32),
};

// 시간대별 진료 분포 (환자 수, 9~18시 합계 = TODAY_PATIENT_COUNT)
const HOURLY_PATIENTS: { h: string; c: number }[] = [
  { h: "09", c: 2 }, { h: "10", c: 4 }, { h: "11", c: 5 }, { h: "12", c: 3 },
  { h: "13", c: 1 }, { h: "14", c: 3 }, { h: "15", c: 4 }, { h: "16", c: 5 },
  { h: "17", c: 3 }, { h: "18", c: 2 },
];

// 매출 기회
const MISSED_TOTAL = 98_000;
const MISSED_ITEMS: MissedItem[] = [
  { id: "m1", patient: "김민수님(F/56)",  reason: "산정 조건 충족했으나 만성질환관리료 코드 미입력",                  amount: 14_500, category: "가산항목" },
  { id: "m2", patient: "박영희님(M/62)",  reason: "골다공증 정기 BMD 검사 시점이었으나 권유 미실행",                amount: 28_000, category: "정기검사" },
  { id: "m3", patient: "이정우님(M/45)",  reason: "공단 일반건강검진 자격 보유, 안내 가능했음",                       amount: 45_000, category: "공단검진" },
  { id: "m4", patient: "정현우님(M/38)",  reason: "만성위염(K29.5) 환자, 헬리코박터 검사 권유 미실행",                amount: 10_500, category: "권유미실행" },
];

// 실사 위험
const RISK_ITEMS: RiskItem[] = [
  { id: "r1", tag: "Missing",   patient: "윤지영님(F/41)", detail: "비급여 시술 처방, 동의서 미기록",            level: "High" },
  { id: "r2", tag: "Mismatch",  patient: "강수진님(F/52)", detail: "보험변경 후 처방코드 미반영",                level: "High" },
  { id: "r3", tag: "Duplicate", patient: "정현우님(M/38)", detail: "동일 검사(CBC) 2회 청구 의심, 시간 간격 30분", level: "Mid"  },
];

// 환자 액션
const PATIENT_ACTIONS: PatientActionItem[] = [
  { id: "p1", type: "미수",     title: "신규 미수 3건",                            detail: "김OO ₩45,000 / 이OO ₩32,000 / 박OO ₩28,000", meta: "총 ₩105,000" },
  { id: "p2", type: "후속콜",    title: "메트포르민 신규 처방 후 콜 권장 1건",         detail: "정현우님 (처방 7일차)", meta: "부작용 우려약" },
  { id: "p3", type: "예약권유",   title: "다음 예약 없는 만성질환자 2명",              detail: "김민수님(당뇨, I10/E11), 박영희님(고혈압, I10)", meta: "" },
];

// 사전점검 정리 — 오늘 진료 32건 중 사전점검을 통해 수정된 항목들
const PRECHECK_SUMMARY: PreCheckSummaryItem[] = [
  {
    id: "pc1", kind: "incompleteDx",
    patient: "김민수님(F/56)",
    before: "J06.9 상세불명의 급성 상기도감염",
    after:  "J00 급성 비인두염[코감기]",
    masterTarget: "상병 기초자료에 매핑 저장 (J06.9 → J00)",
  },
  {
    id: "pc2", kind: "zeroDose",
    patient: "박영희님(M/62)",
    before: "클렌부테롤·아크라이드정 — 용량 0",
    after:  "용량 1정",
    masterTarget: "약품 기초자료에 권장 용량 갱신",
  },
  {
    id: "pc3", kind: "anesthesiologist",
    patient: "이정우님(M/45)",
    before: "마취과 전문의 정보 누락",
    after:  "김화타(면허 94871) 입력",
    masterTarget: "기본 마취과 전문의로 설정",
    appliedAtChart: true, // 진료 중 모달 체크박스로 이미 반영
  },
  {
    id: "pc4", kind: "durDiagnosis",
    patient: "정현우님(M/38)",
    before: "아스피린장용정 100mg — 관상동맥질환 상병 누락",
    after:  "I25.1 죽상경화성 심장병 추가",
    masterTarget: "약품 기초자료(아스피린)에 상병 자동 추가",
  },
  {
    id: "pc5", kind: "durDose",
    patient: "윤지영님(F/41)",
    before: "트라젠타정 5mg — 권장 최대 초과",
    after:  "용량 0.5정으로 조정",
    masterTarget: "약품 기초자료에 용량 가이드 갱신",
  },
  {
    id: "pc6", kind: "durProhibited",
    patient: "강수진님(F/52)",
    before: "트라젠타정 ↔ 가브스메트정 병용금기",
    after:  "시타글립틴정 100mg(자누비아)으로 대체",
    masterTarget: "약품 기초자료에 대체 처방 등록",
    appliedAtChart: true,
  },
  {
    id: "pc7", kind: "incompleteDx",
    patient: "최은주님(F/68)",
    before: "K30 소화불량",
    after:  "K30.0 기능성 소화불량",
    masterTarget: "상병 기초자료에 매핑 저장 (K30 → K30.0)",
  },
];

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 유틸
// ╚══════════════════════════════════════════════════════════════════════════════
const KRW = (n: number) => `₩${n.toLocaleString()}`;

const PRECHECK_KIND_LABEL: Record<PreCheckKind, { label: string; clr: string; bg: string }> = {
  incompleteDx:      { label: "불완전상병",  clr: "var(--orange-500)",  bg: "var(--status-warning-bg-subtle)" },
  anesthesiologist:  { label: "마취과 전문의", clr: "var(--blue-700)",   bg: "var(--bg-primary-subtle)" },
  zeroDose:          { label: "용량 0",      clr: "var(--orange-500)",  bg: "var(--status-warning-bg-subtle)" },
  durDiagnosis:      { label: "상병 필요",   clr: "var(--red-500)",     bg: "var(--status-error-bg-subtle)" },
  durDose:           { label: "용량주의",    clr: "var(--orange-500)",  bg: "var(--status-warning-bg-subtle)" },
  durProhibited:     { label: "병용금기 대체", clr: "var(--red-500)",   bg: "var(--status-error-bg-subtle)" },
};

const RISK_TONE: Record<RiskLevel, { fg: string; bg: string }> = {
  High: { fg: "var(--red-500)",    bg: "var(--status-error-bg-subtle)" },
  Mid:  { fg: "var(--orange-500)", bg: "var(--status-warning-bg-subtle)" },
  Low:  { fg: "var(--text-sub)",   bg: "var(--bg-subtle)" },
};

// 태그는 chip 스타일 (연한 배경 + 진한 글자) — solid 버튼과 시각 구별
const RISK_TAG_TONE: Record<RiskTag, { fg: string; bg: string }> = {
  Missing:   { fg: "var(--red-700)",    bg: "var(--status-error-bg-subtle)"   },
  Duplicate: { fg: "var(--orange-700)", bg: "var(--status-warning-bg-subtle)" },
  Mismatch:  { fg: "var(--blue-700)",   bg: "var(--bg-primary-subtle)"        },
};

const ACTION_TYPE_CLR: Record<PatientActionType, { fg: string; bg: string }> = {
  미수:     { fg: "var(--red-500)",       bg: "var(--status-error-bg-subtle)" },
  후속콜:    { fg: "var(--brand-primary)", bg: "var(--bg-primary-subtle)" },
  예약권유:   { fg: "var(--green-500)",     bg: "var(--status-success-bg-subtle)" },
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공통 — 카드 셸
// ╚══════════════════════════════════════════════════════════════════════════════
function CardShell({
  title, subtitle, onHide, children,
}: {
  title: string;
  subtitle?: string;
  /** 색상 띠 — 더 이상 사용 안 함 (시각 노이즈 축소). 호환성 유지를 위해 prop 만 받음. */
  accent?: string;
  onHide: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--line-default)] flex flex-col overflow-hidden">
      <div className="flex items-start gap-2 px-4 pt-3 pb-2 border-b border-[var(--line-subtle)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-md font-bold text-[var(--text-main)]">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onHide}
          title="이 카드 숨기기"
          className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-sub)] flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3 flex-1">{children}</div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 1 — 매출 (Revenue)
// ╚══════════════════════════════════════════════════════════════════════════════
function HourlyLine({ data }: {
  data: { h: string; v: number }[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.v));
  const min = Math.min(...data.map(d => d.v));
  const w = 320, h = 80, padX = 8, padY = 8;
  const inner = { w: w - padX * 2, h: h - padY * 2 };
  const dx = inner.w / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = padX + i * dx;
    const y = padY + inner.h - ((d.v - min) / (max - min || 1)) * inner.h;
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillPath = `${path} L${padX + inner.w},${padY + inner.h} L${padX},${padY + inner.h} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
        <path d={fillPath} fill="var(--bg-primary-subtle)" />
        <path d={path} stroke="var(--brand-primary)" strokeWidth="2.5" fill="none"
          vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const isHover = hoverIdx === i;
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={isHover ? 4 : 3} fill="white" stroke="var(--brand-primary)" strokeWidth="2"
                vectorEffect="non-scaling-stroke" />
              {/* 호버 영역 — alert 대신 hoverIdx state 만 토글 */}
              <rect x={p[0] - dx / 2} y="0" width={dx} height={h} fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "default" }} />
            </g>
          );
        })}
      </svg>

      {/* 인라인 툴팁 — 호버된 포인트 위에 노출 */}
      {hoverIdx !== null && (
        <div
          className="absolute -top-1 pointer-events-none px-2 py-1 bg-[var(--bg-inverse)] text-white rounded text-xs whitespace-nowrap shadow-md"
          style={{
            left: `${(pts[hoverIdx][0] / w) * 100}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {data[hoverIdx].h}시 · {KRW(data[hoverIdx].v)}
        </div>
      )}

      <div className="flex justify-between text-xs text-[var(--text-tertiary)] px-2">
        {data.map((d, i) => <span key={i}>{d.h}</span>)}
      </div>
    </div>
  );
}

function RevenueCard({ onHide }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell title="시간대별 매출" onHide={onHide}>
      <HourlyLine data={REVENUE.hourly} />
      <p className="text-xs text-[var(--text-tertiary)] mt-2 text-center">포인트에 마우스 올려 시간별 매출 확인</p>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 2 — 매출 기회 (Missed Revenue)
// ╚══════════════════════════════════════════════════════════════════════════════
function MissedRevenueCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell title="매출 기회" subtitle={`${MISSED_ITEMS.length}건 · ${KRW(MISSED_TOTAL)}`} onHide={onHide}>
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {MISSED_ITEMS.map(item => (
          <div key={item.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <TagBadge>{item.category}</TagBadge>
                <span className="text-sm font-bold text-[var(--text-main)] truncate">{item.patient}</span>
              </div>
              <span className="text-sm font-bold text-[var(--text-main)] tabular-nums flex-shrink-0">{KRW(item.amount)}</span>
            </div>
            <p className="text-sm text-[var(--text-sub)] mb-1.5">{item.reason}</p>
            <div className="flex items-center gap-1.5 justify-end">
              <button onClick={() => onAction(`${item.patient}에게 안내 SMS를 발송했습니다`)}
                className="h-6 px-2 text-xs rounded text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]">
                SMS
              </button>
              <button onClick={() => onAction(`${item.patient} 차트 수정 화면으로 이동`)}
                className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90">
                차트 수정
              </button>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 3 — 실사 위험 (Compliance Risk)
// ╚══════════════════════════════════════════════════════════════════════════════
function RiskCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell title="실사 위험" subtitle={`${RISK_ITEMS.length}건 · 청구 전 검토 권장`} onHide={onHide}>
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {RISK_ITEMS.map(item => (
          <div key={item.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <TagBadge>{RISK_TAG_KO[item.tag]}</TagBadge>
                <span className="text-sm font-bold text-[var(--text-main)] truncate">{item.patient}</span>
              </div>
              <span className={`text-xs flex-shrink-0 ${item.level === "High" ? "font-bold text-[var(--red-500)]" : "text-[var(--text-sub)]"}`}>
                {RISK_LEVEL_KO[item.level]}
              </span>
            </div>
            <p className="text-sm text-[var(--text-sub)] mb-1.5">{item.detail}</p>
            <div className="flex items-center gap-1.5 justify-end">
              <button onClick={() => onAction(`${RISK_TAG_KO[item.tag]} 자동 수정 미리보기`)}
                className="h-6 px-2 text-xs rounded text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]">
                자동 수정
              </button>
              <button onClick={() => onAction(`${item.patient} 차트로 이동`)}
                className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90">
                차트 열기
              </button>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 4 — 환자 액션 (Patient Action)
// ╚══════════════════════════════════════════════════════════════════════════════
function PatientActionCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell title="환자 액션" subtitle="진료 결과 기반 후속 조치" onHide={onHide}>
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {PATIENT_ACTIONS.map(item => (
          <div key={item.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-center gap-1.5 mb-1">
              <TagBadge>{item.type}</TagBadge>
              <span className="text-sm font-bold text-[var(--text-main)] flex-1 min-w-0 truncate">{item.title}</span>
              {item.meta && <span className="text-xs text-[var(--text-sub)] flex-shrink-0">{item.meta}</span>}
            </div>
            <p className="text-sm text-[var(--text-sub)] mb-1.5">{item.detail}</p>
            <div className="flex items-center gap-1.5 justify-end">
              {item.type === "미수" && (
                <>
                  <button onClick={() => onAction("미수 환자 리스트로 이동")}
                    className="h-6 px-2 text-xs rounded text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]">리스트</button>
                  <button onClick={() => onAction("미수 환자 일괄 SMS 발송")}
                    className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90">일괄 SMS</button>
                </>
              )}
              {item.type === "후속콜" && (
                <>
                  <button onClick={() => onAction("차트 열기")}
                    className="h-6 px-2 text-xs rounded text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]">차트</button>
                  <button onClick={() => onAction("콜 기록")}
                    className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90">콜 기록</button>
                </>
              )}
              {item.type === "예약권유" && (
                <button onClick={() => onAction("예약 안내 SMS 발송")}
                  className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90">예약 SMS</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 5 — 오늘의 진료 분포 (시간대별 진료 환자수 + 급여/비급여 매출 비율)
// ║ 대시보드의 "시간대별 진료 분포" + "급여/비급여 매출 비율" 위젯이 리포트에도 노출.
// ╚══════════════════════════════════════════════════════════════════════════════
function DistributionCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  const maxC = Math.max(...HOURLY_PATIENTS.map(p => p.c));
  const total = REVENUE.byKind.공단부담 + REVENUE.byKind.본인부담 + REVENUE.byKind.비급여;
  const seg = (v: number) => Math.round((v / total) * 100);
  // 공단부담 + 본인부담 = 급여. 비급여는 별도.
  const segments: { label: keyof typeof REVENUE.byKind; pct: number; clr: string; amount: number; group: "급여" | "비급여" }[] = [
    { label: "공단부담", pct: seg(REVENUE.byKind.공단부담), clr: "var(--brand-primary)", amount: REVENUE.byKind.공단부담, group: "급여"   },
    { label: "본인부담", pct: seg(REVENUE.byKind.본인부담), clr: "var(--blue-200)",       amount: REVENUE.byKind.본인부담, group: "급여"   },
    { label: "비급여",   pct: seg(REVENUE.byKind.비급여),   clr: "var(--orange-500)",     amount: REVENUE.byKind.비급여,   group: "비급여" },
  ];
  const insRevenue    = REVENUE.byKind.공단부담 + REVENUE.byKind.본인부담;
  const nonInsRevenue = REVENUE.byKind.비급여;
  const insPct = Math.round((insRevenue / total) * 100);

  return (
    <CardShell
      title="오늘의 진료 분포"
      subtitle="시간대별 환자 수 + 급여/비급여 매출 비율"
      onHide={onHide}
    >
      <div className="flex flex-col gap-4">
        {/* 시간대별 진료 분포 */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-md font-medium text-[var(--text-tertiary)]">시간대별 진료 환자</p>
            <p className="text-sm text-[var(--text-tertiary)]">총 {TODAY_PATIENT_COUNT}명</p>
          </div>
          <div className="flex justify-between gap-1 h-28">
            {HOURLY_PATIENTS.map((p, i) => (
              <button
                key={i}
                onClick={() => onAction(`${p.h}시 진료 ${p.c}명`)}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${p.h}시 ${p.c}명`}
              >
                <span className="text-xs font-medium text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity h-3 leading-none">
                  {p.c}
                </span>
                <div className="flex-1 w-full flex items-end min-h-[20px]">
                  <div
                    className="w-full rounded-t group-hover:opacity-80 transition-opacity"
                    style={{
                      height: `${Math.max(8, (p.c / maxC) * 100)}%`,
                      background: "var(--brand-primary)",
                    }}
                  />
                </div>
                <span className="text-xs text-[var(--text-tertiary)] leading-none">{p.h}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-[var(--text-tertiary)]">
            <span>피크 시간대 16시</span>
            <span>·</span>
            <span>점심 13시 가장 적음</span>
          </div>
        </div>

        {/* 급여/비급여 매출 비율 */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-md font-medium text-[var(--text-tertiary)]">급여 {insPct}% / 비급여 {100 - insPct}% 매출 비율</p>
            <p className="text-sm text-[var(--text-tertiary)]">총 {KRW(total)}</p>
          </div>
          {/* 스택 막대 — 급여(공단부담+본인부담)와 비급여 사이에 시각적 구분 */}
          <div className="flex h-7 rounded-md overflow-hidden mb-2.5">
            {segments.map((s, i) => (
              <div key={s.label}
                className="flex items-center justify-center"
                style={{
                  width: `${s.pct}%`,
                  background: s.clr,
                  // 급여 그룹과 비급여 그룹 사이에 흰색 디바이더
                  ...(i > 0 && segments[i - 1].group !== s.group ? { borderLeft: "2px solid white" } : {}),
                }}
                title={`${s.label} ${s.pct}% (${KRW(s.amount)})`}>
                {s.pct >= 12 && <span className="text-xs font-bold text-white">{s.pct}%</span>}
              </div>
            ))}
          </div>
          {/* 범례 — 급여 묶음 / 비급여 묶음으로 구조 표시 */}
          <div className="flex flex-col gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">급여</span>
                <span className="text-md font-bold text-[var(--text-main)]">{KRW(insRevenue)}</span>
              </div>
              {/* 비율 %는 상단 스택 막대에서 이미 표시되므로 금액만 표기 — 중복 제거 */}
              {segments.filter(s => s.group === "급여").map(s => (
                <div key={s.label} className="flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.clr }} />
                  <span className="text-sm text-[var(--text-sub)] flex-1">{s.label}</span>
                  <span className="text-sm font-medium text-[var(--text-main)]">{KRW(s.amount)}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">비급여</span>
                <span className="text-md font-bold text-[var(--text-main)]">{KRW(nonInsRevenue)}</span>
              </div>
              {segments.filter(s => s.group === "비급여").map(s => (
                <div key={s.label} className="flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.clr }} />
                  <span className="text-sm text-[var(--text-sub)] flex-1">환자 전액 부담</span>
                  <span className="text-sm font-medium text-[var(--text-main)]">{KRW(s.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 6 — 사전점검 정리 (전체폭, 진료시점에 수정한 결과를 기초자료에 일괄 반영)
// ╚══════════════════════════════════════════════════════════════════════════════
function PreCheckSummaryCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  // 진료 중 이미 반영한 항목은 appliedAtChart=true. 나머지는 리포트 시점에 반영하도록 한다.
  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    () => new Set(PRECHECK_SUMMARY.filter(i => i.appliedAtChart).map(i => i.id))
  );
  // skippedIds 는 더 이상 사용 안 함 (건너뛰기 버튼 제거) — 호환을 위해 빈 셋만 유지
  const skippedIds = new Set<string>();

  const items = PRECHECK_SUMMARY;
  const pendingItems = items.filter(i => !appliedIds.has(i.id) && !skippedIds.has(i.id));

  const applyOne = (id: string) => {
    setAppliedIds(prev => { const n = new Set(prev); n.add(id); return n; });
    const item = items.find(i => i.id === id);
    if (item) onAction(`${item.patient} — "${item.masterTarget}" 반영 완료`);
  };
  const applyAll = () => {
    if (pendingItems.length === 0) return;
    setAppliedIds(prev => {
      const n = new Set(prev);
      pendingItems.forEach(i => n.add(i.id));
      return n;
    });
    onAction(`${pendingItems.length}건의 점검 결과를 기초자료에 일괄 반영했습니다`);
  };

  return (
    <CardShell
      title="사전점검 정리"
      subtitle="진료 중 수정한 결과를 기초자료에 반영"
      onHide={onHide}
    >
      {/* 헤더 — 카운트 + 일괄 반영 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm text-[var(--text-sub)]">
          <span className="font-bold text-[var(--text-main)]">{items.length}건</span> 점검 ·
          <span className="text-[var(--text-sub)] ml-1">반영 {appliedIds.size}</span>
          <span className="text-[var(--text-tertiary)] mx-1">/</span>
          <span className="text-[var(--text-sub)]">대기 {pendingItems.length}</span>
        </p>
        <button onClick={applyAll}
          disabled={pendingItems.length === 0}
          className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
          전체 반영 ({pendingItems.length})
        </button>
      </div>

      {/* 항목 리스트 */}
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {items.map(item => {
          const applied = appliedIds.has(item.id);
          const skipped = skippedIds.has(item.id);
          return (
            <div key={item.id}
              className={`py-2 first:pt-0 last:pb-0 ${skipped ? "opacity-60" : ""}`}>
              {/* 환자 + 태그 */}
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <TagBadge>{PRECHECK_KIND_LABEL[item.kind].label}</TagBadge>
                <span className="text-sm font-bold text-[var(--text-main)]">{item.patient}</span>
                {applied && (
                  <span className="text-xs text-[var(--green-700)]">✓ 반영됨</span>
                )}
              </div>
              {/* before → after */}
              <p className="text-sm text-[var(--text-sub)] mb-0.5">
                <span className="text-[var(--text-tertiary)] line-through">{item.before}</span>
                <span className="mx-1 text-[var(--text-tertiary)]">→</span>
                <span className="font-medium text-[var(--text-main)]">{item.after}</span>
              </p>
              {/* 마스터 반영 대상 */}
              <p className="text-xs text-[var(--text-tertiary)] mb-1.5">↳ {item.masterTarget}</p>

              {/* 액션 버튼 — 상하 stack, '건너뛰기' 제거 */}
              <div className="flex flex-col gap-1.5">
                {!applied && !skipped && (
                  <button onClick={() => applyOne(item.id)}
                    className="h-6 px-2 text-xs rounded text-white bg-[var(--brand-primary)] hover:opacity-90 w-full">
                    기초자료에 반영
                  </button>
                )}
                {applied && (
                  <button onClick={() => onAction(`${item.patient} — 차트로 이동해 점검 결과 확인`)}
                    className="h-6 px-2 text-xs rounded text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)] w-full">
                    차트 확인
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendingItems.length === 0 && (
        <p className="mt-2 text-xs text-[var(--text-sub)]">✓ 모든 점검 결과가 반영되었습니다</p>
      )}
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 위젯 설정 모달 (5개 카드 일괄 토글)
// ╚══════════════════════════════════════════════════════════════════════════════
function WidgetSettingsModal({
  hidden, onClose, onSave,
}: {
  hidden: Set<WidgetKey>;
  onClose: () => void;
  onSave: (next: Set<WidgetKey>) => void;
}) {
  const [draft, setDraft] = useState<Set<WidgetKey>>(new Set(hidden));
  const ITEMS: { id: WidgetKey; title: string; desc: string }[] = [
    { id: "revenue",      title: "매출",            desc: "오늘 매출 총액·구성·시간대별 흐름" },
    { id: "missed",       title: "매출 기회",        desc: "산정 가능했으나 놓친 가산항목·검사 권유" },
    { id: "risk",         title: "실사 위험",        desc: "Missing·Duplicate·Mismatch 자동 검토 결과" },
    { id: "action",       title: "환자 액션",        desc: "미수·후속 콜·예약 권유" },
    { id: "distribution", title: "오늘의 진료 분포",  desc: "시간대별 환자수 + 급여/비급여 매출 비율" },
    { id: "precheck",     title: "사전점검 정리",    desc: "진료 중 수정한 결과를 기초자료에 일괄 반영" },
  ];
  const toggle = (id: WidgetKey) => setDraft(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[92vw]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line-default)]">
          <h3 className="text-xl font-bold text-[var(--text-main)]">위젯 표시 설정</h3>
          {/* 우상단 ✕ — 팝업 정책 필수. */}
          <button onClick={onClose} aria-label="닫기" title="닫기"
            className="w-7 h-7 inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          {ITEMS.map(it => {
            const visible = !draft.has(it.id);
            return (
              <label key={it.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  visible
                    ? "border-[var(--brand-primary)] bg-[var(--bg-primary-subtle)]"
                    : "border-[var(--line-default)] bg-white"
                }`}
                onClick={() => toggle(it.id)}>
                <span className={`w-4 h-4 rounded-[3px] border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  visible ? "border-[var(--brand-primary)]" : "border-[var(--text-disabled)]"
                }`}
                  style={visible ? { background: "var(--brand-primary)" } : {}}>
                  {visible && (
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-[var(--text-main)]">{it.title}</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{it.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
        {/* Footer — CTA 만 (정책 §4: [취소] 사용 안 함). 닫으려면 우상단 ✕. */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--line-default)]">
          <button onClick={() => onSave(draft)}
            className="h-9 px-5 text-lg font-bold text-white rounded-md hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}>
            적용
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 메인 모달
// ╚══════════════════════════════════════════════════════════════════════════════
// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 래퍼 — 드래그 핸들 + ↑↓ 컨트롤. 카드 본문(CardShell)은 그대로 유지.
// ║ 드롭 인디케이터는 위젯 위쪽 외곽에 brand-primary 라인.
// ╚══════════════════════════════════════════════════════════════════════════════
function ReportCardWrapper({
  span, isFirst, isLast, onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  isDragOver, isDragging,
  children,
}: {
  span: 1 | 2;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  isDragging: boolean;
  children: React.ReactNode;
}) {
  // 카드 전체가 draggable. 좌측 핸들은 시각적 어포던스이며 cursor-grab 영역이다.
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`relative group transition-all ${span === 2 ? "lg:col-span-2" : ""} ${isDragging ? "opacity-40" : ""}`}
    >
      {/* 드롭 인디케이터 */}
      {isDragOver && (
        <div className="absolute -top-1.5 left-0 right-0 h-1 rounded-full pointer-events-none z-10"
          style={{ background: "var(--brand-primary)" }} />
      )}
      {/* 드래그 어포던스 + ↑↓ — hover 시 노출. 카드 좌상단 외부에 위치. */}
      <div className="absolute -left-7 top-3 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span title="카드 전체를 잡고 드래그하여 위치 변경"
          className="cursor-grab active:cursor-grabbing w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white rounded-md border border-transparent hover:border-[var(--line-default)] hover:shadow-sm">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
            <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
          </svg>
        </span>
        <button onClick={onMoveUp} disabled={isFirst} title="위로 이동"
          className="w-6 h-6 flex items-center justify-center rounded-md text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white border border-transparent hover:border-[var(--line-default)] disabled:opacity-30 disabled:cursor-not-allowed">
          ↑
        </button>
        <button onClick={onMoveDown} disabled={isLast} title="아래로 이동"
          className="w-6 h-6 flex items-center justify-center rounded-md text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white border border-transparent hover:border-[var(--line-default)] disabled:opacity-30 disabled:cursor-not-allowed">
          ↓
        </button>
      </div>
      {children}
    </div>
  );
}

// 카드별 col-span 정의 (full-width = 2)
const WIDGET_SPAN: Record<WidgetKey, 1 | 2> = {
  revenue: 1, missed: 1, risk: 1, action: 1,
  distribution: 2, precheck: 2,
};
const DEFAULT_REPORT_ORDER: WidgetKey[] = ["revenue", "missed", "risk", "action", "distribution", "precheck"];
const ALL_REPORT_WIDGETS: WidgetKey[] = ["revenue", "missed", "risk", "action", "distribution", "precheck"];

export function EndOfDayReport({ onClose }: { onClose: () => void }) {
  const [hidden,   setHidden]   = useState<Set<WidgetKey>>(new Set());
  const [order,    setOrder]    = useState<WidgetKey[]>(DEFAULT_REPORT_ORDER);
  const [settings, setSettings] = useState(false);
  const [show,     setShow]     = useState(false);

  // 페이드인
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  // ESC = 닫기 (정책 §4.5: 팝업 닫기 동작과 동일). 데이터 조회 팝업이라 미저장 이탈 없이 즉시 닫음.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const hide = (k: WidgetKey) => setHidden(prev => { const n = new Set(prev); n.add(k); return n; });
  const showAll = () => setHidden(new Set());

  const onAction = (msg: string) => alert(msg);

  // 드래그 앤 드롭 — 카드 전체가 draggable. 다른 카드 위에 드롭하면 그 자리로 이동.
  const [dragId,     setDragId]     = useState<WidgetKey | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetKey | null>(null);
  const handleDragStart = (id: WidgetKey) => (e: React.DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", id); } catch {}
  };
  const handleDragOver = (id: WidgetKey) => (e: React.DragEvent) => {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId && dragOverId !== id) setDragOverId(id);
  };
  const handleDragLeave = () => setDragOverId(null);
  const handleDragEnd   = () => { setDragId(null); setDragOverId(null); };
  const handleDrop = (targetId: WidgetKey) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === targetId) {
      setDragId(null); setDragOverId(null);
      return;
    }
    setOrder(prev => {
      const fromIdx = prev.indexOf(dragId);
      const toIdx   = prev.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDragId(null); setDragOverId(null);
  };
  // 위/아래 이동 (방문성 보강)
  const moveCard = (id: WidgetKey, dir: -1 | 1) => {
    setOrder(prev => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // 위젯 키 → 컴포넌트 렌더
  const renderWidget = (id: WidgetKey) => {
    switch (id) {
      case "revenue":      return <RevenueCard         onHide={() => hide(id)} onAction={onAction} />;
      case "missed":       return <MissedRevenueCard   onHide={() => hide(id)} onAction={onAction} />;
      case "risk":         return <RiskCard            onHide={() => hide(id)} onAction={onAction} />;
      case "action":       return <PatientActionCard   onHide={() => hide(id)} onAction={onAction} />;
      case "distribution": return <DistributionCard    onHide={() => hide(id)} onAction={onAction} />;
      case "precheck":     return <PreCheckSummaryCard onHide={() => hide(id)} onAction={onAction} />;
    }
  };

  const visible = order.filter(id => !hidden.has(id));

  return createPortal(
    <div className={`fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 transition-opacity duration-150 ${
      show ? "opacity-100" : "opacity-0"
    }`} onClick={onClose}>
      <div
        className="bg-[var(--bg-base)] rounded-2xl shadow-2xl w-[1440px] max-w-[97vw] max-h-[94vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── 영역 1. 헤더 — 카톡 발송·인쇄 버튼 제거됨. 출력은 좌측 표의 [출력] 액션이 대체. ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--line-default)] bg-white flex-shrink-0">
          <h2 className="text-[18px] font-bold text-[var(--text-main)]">내원 현황</h2>
          {/* 우상단 ✕ — 팝업 정책 필수. SVG 통일. */}
          <button onClick={onClose} aria-label="닫기" title="닫기"
            className="h-8 w-8 text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded-md flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── 본문 — 좌(표 ~74%) / 우(리포트 ~26%) 좌우 분할 ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ── LEFT: 수납완료 환자 목록 표 ── */}
          <div className="flex-[2.8] flex flex-col min-w-0 border-r border-[var(--line-default)]">
            <SettledPatientsTable />
          </div>

          {/* ── RIGHT: 리포트 (간략) ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[var(--bg-subtle)]">
            <CompactReportPanel
              visible={visible}
              renderWidget={renderWidget}
            />
          </div>
        </div>

        {/* 하단 액션 영역 제거 — 정책 §4: 팝업 하단의 [확인]/[닫기] 단독 버튼 사용 금지.
            데이터 조회 팝업이므로 별도 CTA 가 없고, 닫기는 우상단 ✕ 또는 ESC 로 한다. */}
      </div>
    </div>,
    document.body
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 수납완료 환자 목록 표 — 좌측 메인 영역 (조회결과 표 형태)
// ╚══════════════════════════════════════════════════════════════════════════════
type GenderFilter = "전체" | "남" | "여";
type VisitKindFilter = "전체" | "외래" | "입원";
type VisitorTypeFilter = "전체" | "신환" | "구환";  // 신환여부 — 첫방문 환자 vs 재방문
type VisitOrderFilter = "전체" | "초진" | "재진";   // 초/재진 — 해당 진료과/병원 내 진료 차수
type PayStatusFilter = "전체" | "수납대기" | "수납완료"; // 결제 상태 — 수납대기/수납완료
type NationFilter = "전체" | "내국인" | "외국인";
// 정렬 가능 컬럼 키
type SortKey = "name" | "gender" | "visitTime" | "total" | "nhis" | "selfPay" | "noPay";

// 담당의별 집계 — 우측 현황 요약 표용
type DoctorSummary = {
  label: string;          // "종합" 또는 담당의 이름
  count: number;
  외래: number; 입원: number;
  초진: number; 재진: number;
  신환: number; 구환: number;
  total: number; nhis: number; selfPay: number; noPay: number;
  rxOut: number;          // 원외처방 발급 (mock)
};
const computeDoctorSummary = (patients: SettledPatient[]): DoctorSummary[] => {
  const empty = (label: string): DoctorSummary => ({
    label, count: 0, 외래: 0, 입원: 0, 초진: 0, 재진: 0, 신환: 0, 구환: 0,
    total: 0, nhis: 0, selfPay: 0, noPay: 0, rxOut: 0,
  });
  const groups: Record<string, DoctorSummary> = {};
  const all = empty("종합");
  // 환자 → 담당의 → 누적
  for (const p of patients) {
    if (!groups[p.doctor]) groups[p.doctor] = empty(p.doctor);
    const g = groups[p.doctor];
    [g, all].forEach(s => {
      s.count++;
      if (p.visitKind === "외래") s.외래++; else s.입원++;
      if (p.isFirstVisit) s.초진++; else s.재진++;
      if (p.isNew) s.신환++; else s.구환++;
      s.total += p.total;
      s.nhis += p.nhis;
      s.selfPay += p.selfPay;
      s.noPay += p.noPay;
    });
  }
  // 원외처방 mock — 비급여 큰 환자가 원외 처방 경향이라 가정 (prototype)
  for (const p of patients) {
    if (p.noPay > 30000 || !p.isFirstVisit) {
      const g = groups[p.doctor]; if (g) g.rxOut++;
      all.rxOut++;
    }
  }
  return [all, ...Object.values(groups)];
};

// 기존 인라인 정의 — chart-prototype 버전(today-report/SettledPatientsTable.tsx) 으로 대체됨.
// dead code 로 남겨두되 함수명을 `_DeprecatedSettledPatientsTable` 로 변경해서 이름 충돌 방지.
function _DeprecatedSettledPatientsTable() {
  // ── 필터 state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [visitKind, setVisitKind] = useState<VisitKindFilter>("전체");
  const [insType, setInsType] = useState<string>("전체");
  const [doctor, setDoctor] = useState<string>("전체");
  const [room, setRoom] = useState<string>("전체");
  const [gender, setGender] = useState<GenderFilter>("전체");
  // 신환여부 — 신환(첫방문) / 구환(재방문). 환자유형(태그) 와는 다른 필드.
  const [visitorType, setVisitorType] = useState<VisitorTypeFilter>("전체");
  // 초/재진 — 해당 진료과 기준 초진/재진. isFirstVisit 필드와 매핑.
  const [visitOrder, setVisitOrder] = useState<VisitOrderFilter>("전체");
  // 결제상태 — 수납대기 / 수납완료. status 필드와 매핑 (미지정시 수납완료).
  const [payStatus, setPayStatus] = useState<PayStatusFilter>("전체");
  // 환자유형 — 병원 커스텀 태그 (VIP/만성질환/임산부 등). 다중 선택 가능.
  const [patientTags, setPatientTags] = useState<Set<string>>(new Set());
  const [nation, setNation] = useState<NationFilter>("전체");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  // 조회 날짜 — 단일 일자만 선택 가능 (날짜 picker)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  // 컬럼 정렬 — 같은 컬럼 클릭하면 방향 토글, 다른 컬럼 클릭하면 그 키로 asc
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  // 행 선택 — 빠른 문자 발송 등 일괄 액션 대상 (chartNo 기준 Set)
  const [selectedChartNos, setSelectedChartNos] = useState<Set<string>>(new Set());
  const toggleSelection = (chartNo: string) => {
    setSelectedChartNos(prev => {
      const next = new Set(prev);
      if (next.has(chartNo)) next.delete(chartNo); else next.add(chartNo);
      return next;
    });
  };

  // ── 필터 옵션 (data 기반) ───────────────────────────────────
  const ALL_INS = ["전체", ...Array.from(new Set(SETTLED_PATIENTS.map(p => p.insType)))];
  const ALL_DOCTORS = ["전체", ...Array.from(new Set(SETTLED_PATIENTS.map(p => p.doctor)))];
  const ALL_ROOMS = ["전체", "1진료실", "2진료실", "3진료실", "건강검진실"];

  // ── filter 적용 ─────────────────────────────────────────────
  const filtered = SETTLED_PATIENTS.filter(p => {
    // 환자명 검색 (이름·휴대폰·차트번호)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hit = p.name.toLowerCase().includes(q)
        || p.phone.toLowerCase().includes(q)
        || p.chartNo.includes(q);
      if (!hit) return false;
    }
    if (visitKind !== "전체" && p.visitKind !== visitKind) return false;
    if (insType !== "전체" && p.insType !== insType) return false;
    if (doctor !== "전체" && p.doctor !== doctor) return false;
    if (gender !== "전체" && p.gender !== gender) return false;
    // 신환여부
    if (visitorType === "신환" && !p.isNew) return false;
    if (visitorType === "구환" && p.isNew) return false;
    // 초/재진
    if (visitOrder === "초진" && !p.isFirstVisit) return false;
    if (visitOrder === "재진" && p.isFirstVisit) return false;
    // 결제상태 — status 미지정시 수납완료로 간주
    const effectiveStatus: "수납대기" | "수납완료" = p.status ?? "수납완료";
    if (payStatus !== "전체" && effectiveStatus !== payStatus) return false;
    // 환자유형 태그 — 선택된 태그 중 하나라도 매칭되면 통과 (OR)
    if (patientTags.size > 0 && !p.tags.some(t => patientTags.has(t))) return false;
    // 진료실 / 내외국인 / 날짜 — 데이터 없음 → 항상 통과 (prototype)
    void room; void nation; void selectedDate;
    if (ageMin && p.age < Number(ageMin)) return false;
    if (ageMax && p.age > Number(ageMax)) return false;
    // 진료비 범위 — 총액 기준 (진료비기준 select 제거됨)
    if (amountMin && p.total < Number(amountMin)) return false;
    if (amountMax && p.total > Number(amountMax)) return false;
    return true;
  });

  // 정렬 — sortKey 가 있을 때만 적용
  const sorted = sortKey ? [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":      cmp = a.name.localeCompare(b.name, "ko"); break;
      case "gender":    cmp = a.gender.localeCompare(b.gender); break;
      case "visitTime": cmp = a.visitTime.localeCompare(b.visitTime); break;
      case "total":     cmp = a.total - b.total; break;
      case "nhis":      cmp = a.nhis - b.nhis; break;
      case "selfPay":   cmp = a.selfPay - b.selfPay; break;
      case "noPay":     cmp = a.noPay - b.noPay; break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;

  // 합계 — filter 된 결과 기준
  const sumTotal = filtered.reduce((s, p) => s + p.total, 0);
  const sumNhis = filtered.reduce((s, p) => s + p.nhis, 0);
  const sumSelf = filtered.reduce((s, p) => s + p.selfPay, 0);
  const sumNoPay = filtered.reduce((s, p) => s + p.noPay, 0);
  const sumCard = filtered.reduce((s, p) => s + p.card, 0);
  const sumCash = filtered.reduce((s, p) => s + p.cash, 0);
  const sumUnpaid = filtered.reduce((s, p) => s + p.unpaid, 0);

  const resetFilters = () => {
    setSearch("");
    setVisitKind("전체");
    setInsType("전체");
    setDoctor("전체");
    setRoom("전체");
    setGender("전체");
    setVisitorType("전체");
    setVisitOrder("전체");
    setPayStatus("전체");
    setPatientTags(new Set());
    setNation("전체");
    setAgeMin(""); setAgeMax("");
    setAmountMin(""); setAmountMax("");
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // 활성 필터 개수 (필터 적용 여부 시각화) — 날짜는 항상 선택돼 있으므로 제외
  const activeFilterCount = [
    search.trim() && "검색",
    visitKind !== "전체" && "진료유형",
    insType !== "전체" && "보험",
    doctor !== "전체" && "담당의",
    room !== "전체" && "진료실",
    gender !== "전체" && "성별",
    visitorType !== "전체" && "신환여부",
    visitOrder !== "전체" && "초/재진",
    payStatus !== "전체" && "결제상태",
    patientTags.size > 0 && "환자유형",
    nation !== "전체" && "내외국인",
    (ageMin || ageMax) && "나이",
    (amountMin || amountMax) && "진료비",
  ].filter(Boolean).length;

  // 진료환자 내역 — 진료중 / 수납대기 / 수납완료. 데이터에서 직접 카운트 (status 미지정 = 수납완료).
  const awaitingPayCount = SETTLED_PATIENTS.filter(p => p.status === "수납대기").length;
  const settledCount = SETTLED_PATIENTS.length - awaitingPayCount;
  const inTreatmentCount = TODAY_IN_TREATMENT_COUNT;
  const todayPatientCount = SETTLED_PATIENTS.length + inTreatmentCount;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── 필터 바 ── */}
      <SettledFilterBar
        search={search} setSearch={setSearch}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        visitKind={visitKind} setVisitKind={setVisitKind}
        insType={insType} setInsType={setInsType}
        doctor={doctor} setDoctor={setDoctor}
        room={room} setRoom={setRoom}
        gender={gender} setGender={setGender}
        visitorType={visitorType} setVisitorType={setVisitorType}
        visitOrder={visitOrder} setVisitOrder={setVisitOrder}
        payStatus={payStatus} setPayStatus={setPayStatus}
        patientTags={patientTags} setPatientTags={setPatientTags}
        nation={nation} setNation={setNation}
        ageMin={ageMin} setAgeMin={setAgeMin}
        ageMax={ageMax} setAgeMax={setAgeMax}
        amountMin={amountMin} setAmountMin={setAmountMin}
        amountMax={amountMax} setAmountMax={setAmountMax}
        allIns={ALL_INS} allDoctors={ALL_DOCTORS} allRooms={ALL_ROOMS}
        activeFilterCount={activeFilterCount}
        onReset={resetFilters}
      />

      {/* 표 헤더 — 진료환자 내역(수납대기/수납완료) + 마지막 차트 + 표 결과 건수 + 액션 (빠른 문자 발송 등).
          날짜는 필터 바의 조회날짜와 중복되므로 여기서는 생략. */}
      <div className="flex items-center justify-between gap-3 px-6 py-2 bg-white border-b border-[var(--line-default)] flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* 진료환자 내역 — 진료중 / 수납대기 / 수납완료 명시적으로 분해 (사용자가 합을 추정할 필요 없도록) */}
          <span className="text-md text-[var(--text-tertiary)] whitespace-nowrap">
            진료 환자 <b className="text-[var(--text-main)]">{todayPatientCount}명</b>
            <span className="text-[var(--text-tertiary)]"> (</span>
            {inTreatmentCount > 0 && <><b className="text-[var(--text-sub)]">진료중 {inTreatmentCount}</b><span> · </span></>}
            <b className={awaitingPayCount > 0 ? "text-[var(--orange-700)]" : "text-[var(--text-sub)]"}>수납대기 {awaitingPayCount}</b>
            <span> · </span>
            <b className="text-[var(--text-sub)]">수납완료 {settledCount}</b>
            <span className="text-[var(--text-tertiary)]">)</span>
          </span>
          <span className="w-px h-4 bg-[var(--line-default)] flex-shrink-0" />
          {/* 마지막 차트 시각 — 오늘 마지막으로 작성된 차트 시간 */}
          <span className="text-md text-[var(--text-tertiary)] whitespace-nowrap">마지막 차트 <b className="text-[var(--text-sub)] tabular-nums">{LAST_CHART_TIME}</b></span>
          <span className="w-px h-4 bg-[var(--line-default)] flex-shrink-0" />
          {/* 표 결과 건수 — filter 적용 결과 (수납대기+수납완료 총수와 다를 수 있음) */}
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">표 {filtered.length}건</span>
          {activeFilterCount > 0 && (
            <span className="text-xs text-[var(--brand-primary)] whitespace-nowrap">· 필터 {activeFilterCount}개</span>
          )}
          {selectedChartNos.size > 0 && (
            <span className="text-xs text-[var(--brand-primary)] whitespace-nowrap">· {selectedChartNos.size}명 선택</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">엑셀저장</button>
          <span className="text-[var(--text-tertiary)]">·</span>
          <button
            disabled={selectedChartNos.size === 0}
            className={`text-xs ${
              selectedChartNos.size === 0
                ? "text-[var(--text-disabled)] cursor-not-allowed"
                : "text-[var(--brand-primary)] font-medium hover:underline"
            }`}>
            빠른 문자 발송{selectedChartNos.size > 0 && ` (${selectedChartNos.size})`}
          </button>
        </div>
      </div>

      {/* 표 본문 — 좌우 패딩 추가, 컬럼 축소로 가로 스크롤 제거. 좌우 px-4 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
        {/* 표 — table-fixed + 컬럼별 세로 구분선 (연한 라인).
            마지막 셀에는 우측 보더 X (last:border-r-0). border-[var(--line-subtle)] 로 연하게. */}
        <table className="w-full border-collapse table-fixed [&_th]:border-r [&_td]:border-r [&_th]:border-[var(--line-subtle)] [&_td]:border-[var(--line-subtle)] [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
          {/* 컬럼 너비 — 체크박스(28)/번호(48) → 이름(60)/성별(36)/나이(36)/보험(56) → 시간(48)/초·재(40)/담당의(60) → 총액·공단·본인·비급여 → 카드·현금·미수.
              이름·성별·보험·담당의를 줄여 결제 3분할 + 체크박스를 위한 공간을 확보. */}
          <colgroup>
            <col style={{ width: "28px" }} />
            <col style={{ width: "48px" }} />
            <col style={{ width: "60px" }} />
            <col style={{ width: "36px" }} />
            <col style={{ width: "36px" }} />
            <col style={{ width: "56px" }} />
            <col style={{ width: "48px" }} />
            <col style={{ width: "40px" }} />
            <col style={{ width: "60px" }} />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead className="sticky top-0 z-10">
            {/* 그룹 헤더 — 체크박스 / 환자정보(번호~보험) / 진료정보(시간~담당의) / 진료비 산정(총액~비급여) / 결제(카드~미수) */}
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
              <th className="px-1 py-1.5" />
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap" colSpan={5}>환자정보</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap" colSpan={3}>진료정보</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap" colSpan={4}>진료비 산정</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-left whitespace-nowrap" colSpan={3}>결제</th>
            </tr>
            {/* 컬럼 헤더 — checkbox / 번호 / 이름 / 성별 / 나이 / 보험 / 시간 / 초·재 / 담당의 / 총액·공단·본인·비급여 / 카드·현금·미수 */}
            <tr className="bg-white border-b border-[var(--line-default)]">
              <th className="px-1 py-1.5 text-center w-7">
                <input
                  type="checkbox"
                  checked={sorted.length > 0 && sorted.every(p => selectedChartNos.has(p.chartNo))}
                  ref={el => {
                    if (el) {
                      const someSelected = sorted.some(p => selectedChartNos.has(p.chartNo));
                      const allSelected = sorted.length > 0 && sorted.every(p => selectedChartNos.has(p.chartNo));
                      el.indeterminate = someSelected && !allSelected;
                    }
                  }}
                  onChange={() => {
                    setSelectedChartNos(prev => {
                      const allSelected = sorted.length > 0 && sorted.every(p => prev.has(p.chartNo));
                      if (allSelected) {
                        // 전체 선택 상태면 해제
                        const next = new Set(prev);
                        sorted.forEach(p => next.delete(p.chartNo));
                        return next;
                      } else {
                        // 일부 또는 미선택 → 전체 선택
                        const next = new Set(prev);
                        sorted.forEach(p => next.add(p.chartNo));
                        return next;
                      }
                    });
                  }}
                  className="cursor-pointer accent-[var(--brand-primary)]"
                />
              </th>
              {/* 텍스트/식별자 컬럼은 모두 가운데 정렬 (사용자 요청). 차트번호는 식별자라 가운데, 숫자 amount 컬럼은 우측 유지 */}
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">차트번호</th>
              <SortableTh align="center" active={sortKey === "name"}      dir={sortDir} onClick={() => toggleSort("name")}>이름</SortableTh>
              <SortableTh align="center" active={sortKey === "gender"}    dir={sortDir} onClick={() => toggleSort("gender")}>성별</SortableTh>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">나이</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">보험</th>
              <SortableTh align="center" active={sortKey === "visitTime"} dir={sortDir} onClick={() => toggleSort("visitTime")}>시간</SortableTh>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">초/재</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-center whitespace-nowrap">담당의</th>
              <SortableTh align="right"  active={sortKey === "total"}     dir={sortDir} onClick={() => toggleSort("total")}>총액</SortableTh>
              <SortableTh align="right"  active={sortKey === "nhis"}      dir={sortDir} onClick={() => toggleSort("nhis")}>공단</SortableTh>
              <SortableTh align="right"  active={sortKey === "selfPay"}   dir={sortDir} onClick={() => toggleSort("selfPay")}>본인</SortableTh>
              <SortableTh align="right"  active={sortKey === "noPay"}     dir={sortDir} onClick={() => toggleSort("noPay")}>비급여</SortableTh>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">카드</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">현금</th>
              <th className="text-xs font-medium text-[var(--text-tertiary)] px-1 py-1.5 text-right whitespace-nowrap">미수</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={16} className="text-sm text-[var(--text-tertiary)] text-center py-12">
                  조건에 맞는 환자가 없습니다 — 필터를 조정해보세요
                </td>
              </tr>
            )}
            {sorted.map((p) => {
              const checked = selectedChartNos.has(p.chartNo);
              return (
                <tr
                  key={p.chartNo}
                  className={`border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)] ${checked ? "bg-[var(--bg-primary-subtle)]" : ""}`}
                >
                  {/* 체크박스 — 행 선택 (빠른 문자 발송 등 일괄 액션) */}
                  <td className="px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelection(p.chartNo)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer accent-[var(--brand-primary)]"
                    />
                  </td>
                  {/* 텍스트/식별자 셀은 중앙정렬 (사용자 요청). amount 셀은 우측정렬 유지. */}
                  <td className="text-sm text-[var(--text-main)] px-1 py-1.5 tabular-nums text-center">{p.chartNo}</td>
                  <td className="text-sm text-[var(--text-main)] px-1 py-1.5 truncate text-center" title={`${p.name}${p.status === "수납대기" ? " (수납대기)" : ""}`}>
                    {p.status === "수납대기" && (
                      <span className="inline-block mr-1 px-1 rounded-sm text-micro font-bold text-[var(--orange-700)] bg-[var(--orange-050)] border border-[var(--orange-200)] align-middle leading-none py-0.5">대기</span>
                    )}
                    {p.name}
                    {p.isNew && <span className="ml-0.5 text-micro text-[var(--brand-primary)] font-bold">N</span>}
                  </td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-center">{p.gender}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-center tabular-nums">{p.age}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 truncate text-center" title={p.insType}>{p.insType}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-center tabular-nums">{p.visitTime}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-center">{p.isFirstVisit ? "초" : "재"}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 truncate text-center" title={p.doctor}>{p.doctor}</td>
                  <td className="text-sm font-medium text-[var(--text-main)] px-1 py-1.5 text-right tabular-nums">{p.total.toLocaleString()}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-right tabular-nums">{p.nhis.toLocaleString()}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-right tabular-nums">{p.selfPay.toLocaleString()}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-right tabular-nums">{p.noPay > 0 ? p.noPay.toLocaleString() : "—"}</td>
                  {/* 결제 — 카드 / 현금 / 미수 분리 (복합결제 표현). 0 은 — 표기, 미수는 빨강 강조. */}
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-right tabular-nums">{p.card > 0 ? p.card.toLocaleString() : "—"}</td>
                  <td className="text-sm text-[var(--text-sub)] px-1 py-1.5 text-right tabular-nums">{p.cash > 0 ? p.cash.toLocaleString() : "—"}</td>
                  <td className={`text-sm px-1 py-1.5 text-right tabular-nums ${p.unpaid > 0 ? "text-[var(--red-500)] font-bold" : "text-[var(--text-sub)]"}`}>
                    {p.unpaid > 0 ? p.unpaid.toLocaleString() : "—"}
                  </td>
                </tr>
              );
            })}
            {/* 합계 행 — filter 된 결과 기준 (체크박스 컬럼 포함 colSpan 9) */}
            {filtered.length > 0 && (
              <tr className="bg-[var(--bg-subtle)] border-t-2 border-[var(--line-default)] sticky bottom-0">
                <td className="text-sm font-bold text-[var(--text-main)] px-1 py-2" colSpan={9}>합계 ({filtered.length}건)</td>
                <td className="text-sm font-bold text-[var(--text-main)] px-1 py-2 text-right tabular-nums">{sumTotal.toLocaleString()}</td>
                <td className="text-sm font-bold text-[var(--text-sub)] px-1 py-2 text-right tabular-nums">{sumNhis.toLocaleString()}</td>
                <td className="text-sm font-bold text-[var(--text-sub)] px-1 py-2 text-right tabular-nums">{sumSelf.toLocaleString()}</td>
                <td className="text-sm font-bold text-[var(--text-sub)] px-1 py-2 text-right tabular-nums">{sumNoPay.toLocaleString()}</td>
                <td className="text-sm font-bold text-[var(--text-sub)] px-1 py-2 text-right tabular-nums">{sumCard > 0 ? sumCard.toLocaleString() : "—"}</td>
                <td className="text-sm font-bold text-[var(--text-sub)] px-1 py-2 text-right tabular-nums">{sumCash > 0 ? sumCash.toLocaleString() : "—"}</td>
                <td className={`text-sm font-bold px-1 py-2 text-right tabular-nums ${sumUnpaid > 0 ? "text-[var(--red-500)]" : "text-[var(--text-sub)]"}`}>
                  {sumUnpaid > 0 ? sumUnpaid.toLocaleString() : "—"}
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
// ║ 수납완료 환자 필터 바 — 표 상단의 컴팩트 필터
// ╚══════════════════════════════════════════════════════════════════════════════
function SettledFilterBar(props: {
  search: string; setSearch: (v: string) => void;
  selectedDate: string; setSelectedDate: (v: string) => void;
  visitKind: VisitKindFilter; setVisitKind: (v: VisitKindFilter) => void;
  insType: string; setInsType: (v: string) => void;
  doctor: string; setDoctor: (v: string) => void;
  room: string; setRoom: (v: string) => void;
  gender: GenderFilter; setGender: (v: GenderFilter) => void;
  visitorType: VisitorTypeFilter; setVisitorType: (v: VisitorTypeFilter) => void;
  visitOrder: VisitOrderFilter; setVisitOrder: (v: VisitOrderFilter) => void;
  payStatus: PayStatusFilter; setPayStatus: (v: PayStatusFilter) => void;
  patientTags: Set<string>; setPatientTags: (v: Set<string>) => void;
  nation: NationFilter; setNation: (v: NationFilter) => void;
  ageMin: string; setAgeMin: (v: string) => void;
  ageMax: string; setAgeMax: (v: string) => void;
  amountMin: string; setAmountMin: (v: string) => void;
  amountMax: string; setAmountMax: (v: string) => void;
  allIns: string[]; allDoctors: string[]; allRooms: string[];
  activeFilterCount: number;
  onReset: () => void;
}) {
  const inputCls = "h-7 px-2 text-sm border border-[var(--line-default)] rounded outline-none focus:border-[var(--brand-primary)] bg-white";
  const selectCls = `${inputCls} pr-6 appearance-none bg-[image:linear-gradient(45deg,transparent_50%,var(--text-tertiary)_50%),linear-gradient(135deg,var(--text-tertiary)_50%,transparent_50%)] bg-[position:calc(100%-10px)_50%,calc(100%-6px)_50%] bg-[size:4px_4px,4px_4px] bg-no-repeat`;
  const labelCls = "text-xs text-[var(--text-tertiary)] font-medium flex-shrink-0";

  // 환자유형 태그 토글
  const toggleTag = (tag: string) => {
    const next = new Set(props.patientTags);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    props.setPatientTags(next);
  };

  const today = new Date().toISOString().slice(0, 10);
  const isToday = props.selectedDate === today;
  // 조회날짜의 요일 — date 인풋이 요일을 안 보여주니 옆에 별도 표시. "(화)" 형태.
  const selectedWeekday = (() => {
    const d = new Date(props.selectedDate);
    if (Number.isNaN(d.getTime())) return "";
    return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  })();

  return (
    <div className="bg-[var(--bg-base)] border-b border-[var(--line-default)] flex-shrink-0">
      {/* Row 1 — 조회날짜 (좌) | 환자검색 (우, flex-1) | 초기화. 표 상단 요약 라인의 날짜와 동일하게 동기화됨. */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line-subtle)]">
        <span className={labelCls}>조회날짜</span>
        <input
          type="date"
          value={props.selectedDate}
          max={today}
          onChange={e => props.setSelectedDate(e.target.value)}
          className={`${inputCls} tabular-nums`}
        />
        {/* 요일 표시 — date 인풋이 요일을 자체 노출하지 않으므로 옆에 보조 텍스트로 명시 */}
        {selectedWeekday && (
          <span className="text-sm text-[var(--text-sub)] font-medium whitespace-nowrap">({selectedWeekday})</span>
        )}
        <button
          onClick={() => props.setSelectedDate(today)}
          disabled={isToday}
          className={`h-7 px-2 text-sm rounded transition-colors ${
            isToday
              ? "text-[var(--text-disabled)] cursor-not-allowed"
              : "text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
          }`}
        >
          오늘
        </button>
        <span className="w-px h-5 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] flex-shrink-0">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={props.search}
            onChange={e => props.setSearch(e.target.value)}
            placeholder="환자 검색 (이름·휴대폰·차트번호)"
            className="flex-1 min-w-0 h-7 text-sm outline-none bg-transparent placeholder:text-[var(--text-tertiary)]"
          />
        </div>
        <span className="w-px h-5 bg-[var(--line-default)]" />
        <button
          onClick={props.onReset}
          disabled={props.activeFilterCount === 0}
          className={`h-7 px-2.5 text-sm rounded flex items-center gap-1 transition-colors flex-shrink-0 ${
            props.activeFilterCount === 0
              ? "text-[var(--text-disabled)] cursor-not-allowed"
              : "text-[var(--text-sub)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]"
          }`}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8a5 5 0 1 1 1.5 3.5M3 4v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          초기화
        </button>
      </div>

      {/* Row 2 — 결제상태 / 진료유형 / 보험 / 담당의 / 진료실 */}
      <div className="flex items-center gap-3 px-3 py-1.5 flex-wrap border-b border-[var(--line-subtle)]">
        {/* 결제상태 — 수납대기/수납완료. 표 좌측에 두 그룹 모두 표시되므로 빠르게 필터링 가능. */}
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>결제상태</span>
          {(["전체", "수납대기", "수납완료"] as const).map(v => (
            <RadioPill key={v} active={props.payStatus === v} onClick={() => props.setPayStatus(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>진료유형</span>
          {(["전체", "외래", "입원"] as const).map(v => (
            <RadioPill key={v} active={props.visitKind === v} onClick={() => props.setVisitKind(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>보험</span>
          <select value={props.insType} onChange={e => props.setInsType(e.target.value)} className={selectCls}>
            {props.allIns.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>담당의</span>
          <select value={props.doctor} onChange={e => props.setDoctor(e.target.value)} className={selectCls}>
            {props.allDoctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>진료실</span>
          <select value={props.room} onChange={e => props.setRoom(e.target.value)} className={selectCls}>
            {props.allRooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Row 3 — 성별 / 신환여부 / 내외국인 / 나이 / 진료비 */}
      <div className="flex items-center gap-3 px-3 py-1.5 flex-wrap border-b border-[var(--line-subtle)]">
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>성별</span>
          {(["전체", "남", "여"] as const).map(v => (
            <RadioPill key={v} active={props.gender === v} onClick={() => props.setGender(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>신환여부</span>
          {(["전체", "신환", "구환"] as const).map(v => (
            <RadioPill key={v} active={props.visitorType === v} onClick={() => props.setVisitorType(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        {/* 초/재진 — 신환여부와 다른 축. 신환=병원 첫 방문, 초진=해당 진료과 첫 진료 */}
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>초/재진</span>
          {(["전체", "초진", "재진"] as const).map(v => (
            <RadioPill key={v} active={props.visitOrder === v} onClick={() => props.setVisitOrder(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>내/외국인</span>
          {(["전체", "내국인", "외국인"] as const).map(v => (
            <RadioPill key={v} active={props.nation === v} onClick={() => props.setNation(v)}>{v}</RadioPill>
          ))}
        </div>
        <span className="w-px h-4 bg-[var(--line-default)]" />
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>만나이</span>
          <input type="text" inputMode="numeric" value={props.ageMin} onChange={e => props.setAgeMin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0" className={`${inputCls} w-12 tabular-nums text-center`} />
          <span className="text-xs text-[var(--text-tertiary)]">~</span>
          <input type="text" inputMode="numeric" value={props.ageMax} onChange={e => props.setAgeMax(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="120" className={`${inputCls} w-12 tabular-nums text-center`} />
          <span className="text-xs text-[var(--text-tertiary)]">세</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={labelCls}>진료비</span>
          <input type="text" inputMode="numeric" value={props.amountMin} onChange={e => props.setAmountMin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0" className={`${inputCls} w-20 tabular-nums text-right`} />
          <span className="text-xs text-[var(--text-tertiary)]">~</span>
          <input type="text" inputMode="numeric" value={props.amountMax} onChange={e => props.setAmountMax(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="999,999" className={`${inputCls} w-20 tabular-nums text-right`} />
          <span className="text-xs text-[var(--text-tertiary)]">원</span>
        </div>
      </div>

      {/* Row 4 — 환자유형 (병원 커스텀 태그, 다중 선택) */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap">
        <span className={labelCls}>환자유형</span>
        {PATIENT_TAGS.map(tag => {
          const active = props.patientTags.has(tag);
          return (
            <button key={tag}
              onClick={() => toggleTag(tag)}
              className={`h-6 px-2 text-sm rounded transition-colors ${
                active
                  ? "bg-[var(--brand-primary)] text-white font-medium"
                  : "bg-white text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
              }`}>
              {tag}
            </button>
          );
        })}
        {props.patientTags.size > 0 && (
          <button
            onClick={() => props.setPatientTags(new Set())}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-sub)] ml-1">
            태그 해제
          </button>
        )}
      </div>
    </div>
  );
}

// 라디오 형태 pill 버튼
function RadioPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`h-6 px-2 text-sm rounded transition-colors ${
        active
          ? "bg-[var(--brand-primary)] text-white font-medium"
          : "bg-white text-[var(--text-sub)] border border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
      }`}>
      {children}
    </button>
  );
}

// 작은 회색 뱃지 — 카테고리/타입/태그용 (색깔 사용 X, 회색 톤만)
function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-[var(--line-default)] whitespace-nowrap flex-shrink-0">
      {children}
    </span>
  );
}

// 정렬 가능한 표 헤더 — 활성 시 화살표 + 브랜드 컬러
function SortableTh({
  children, align, active, dir, onClick,
}: {
  children: React.ReactNode;
  align: "left" | "center" | "right";
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <th className="px-2 py-1.5 whitespace-nowrap">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-1 ${justify} text-xs font-medium transition-colors ${
          active ? "text-[var(--brand-primary)] font-bold" : "text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
        }`}
      >
        {children}
        {active ? (
          <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className={`transition-transform ${dir === "desc" ? "rotate-180" : ""}`}>
            <path d="M4 1.5L6.5 5L1.5 5L4 1.5Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 8 8" fill="none" className="opacity-30">
            <path d="M2 3L4 1L6 3M2 5L4 7L6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </button>
    </th>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 우측 패널 — 매출 요약 (담당의별 포함) + 위젯. 알림/색상 단순화.
// ╚══════════════════════════════════════════════════════════════════════════════
function CompactReportPanel({
  visible,
  renderWidget,
}: {
  visible: WidgetKey[];
  renderWidget: (id: WidgetKey) => React.ReactNode;
}) {
  const summary = computeDoctorSummary(SETTLED_PATIENTS);
  const overall = summary[0];
  const perDoctor = summary.slice(1);

  return (
    <div className="px-3 py-3 flex flex-col gap-2.5">
      {/* ── 매출 요약 — 총액 + 구성 + 담당의별 분류를 한 카드로 통합 ── */}
      <div className="bg-white rounded-lg border border-[var(--line-default)] p-3.5">
        <div className="flex items-baseline justify-between mb-2.5">
          <span className="text-md font-bold text-[var(--text-main)]">오늘 매출</span>
          <span className="text-lg font-bold text-[var(--text-main)] tabular-nums">{KRW(REVENUE.total)}</span>
        </div>

        {/* 매출 구성 */}
        <div className="flex flex-col gap-1 text-sm border-b border-[var(--line-subtle)] pb-2 mb-2">
          <SummaryLine label="공단부담" value={REVENUE.byKind.공단부담} />
          <SummaryLine label="본인부담" value={REVENUE.byKind.본인부담} />
          <SummaryLine label="비급여"   value={REVENUE.byKind.비급여} />
        </div>

        {/* 담당의별 — 매출 요약 안에 통합 */}
        <div className="text-xs text-[var(--text-tertiary)] mb-1.5">담당의별</div>
        <div className="flex flex-col gap-0.5 text-sm">
          <DoctorRow s={overall} bold />
          {perDoctor.map(s => <DoctorRow key={s.label} s={s} />)}
        </div>
      </div>

      {/* ── 진료 현황 — 환자 수 / 초·재진 / 신환 / 원외처방 ── */}
      <div className="bg-white rounded-lg border border-[var(--line-default)] p-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-md font-bold text-[var(--text-main)]">진료 현황</span>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{overall.count}명</span>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <SummaryLine label="초진 / 재진" suffix="명" value={0} valueDisplay={`${overall.초진} / ${overall.재진}`} />
          <SummaryLine label="신환" suffix="명" value={overall.신환} />
          <SummaryLine label="원외처방 발급" suffix="건" value={overall.rxOut} />
          <SummaryLine label="평균 진료비" value={Math.round(overall.total / Math.max(1, overall.count))} />
        </div>
      </div>

      {/* ── 위젯 영역 — 사용자가 표시 설정한 위젯만 노출 ── */}
      {visible.length > 0 && (
        <div className="flex flex-col gap-2">
          {visible.map((id) => (
            <div key={id} className="[&>div]:rounded-lg [&>div]:shadow-none [&>div]:border [&>div]:border-[var(--line-default)]">
              {renderWidget(id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 담당의 한 줄 요약 — 매출 요약 카드 안에 통합되어 사용
function DoctorRow({ s, bold }: { s: DoctorSummary; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "font-bold text-[var(--text-main)]" : "text-[var(--text-sub)]"}`}>
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{s.label}</span>
        <span className={`text-xs tabular-nums ${bold ? "text-[var(--text-sub)] font-normal" : "text-[var(--text-tertiary)]"}`}>{s.count}건</span>
      </span>
      <span className="tabular-nums flex-shrink-0">{s.total.toLocaleString()}원</span>
    </div>
  );
}

// 단순 라벨/금액 줄 — valueDisplay 로 텍스트 override 가능
function SummaryLine({ label, value, suffix = "원", valueDisplay }: { label: string; value: number; suffix?: string; valueDisplay?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-sub)]">{label}</span>
      <span className="tabular-nums text-[var(--text-main)]">
        {valueDisplay ?? `${value.toLocaleString()}${suffix}`}
      </span>
    </div>
  );
}

// 하단 플로팅 "오늘 내원 현황" 버튼(EndOfDayReportFab) 은 제거됨 — 진입점은 상단 TopBar 의 동일 버튼 하나로 단일화.
