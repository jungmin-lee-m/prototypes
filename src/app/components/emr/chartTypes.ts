// Shared types for today's chart data (used across App, PanelC, EMRExpandedHistory, PanelD)

export type TodayDiagnosis = {
  code: string;
  name: string;
  isMain?: boolean;
  special?: string;
  isNew?: boolean;
  // 사전점검 — 불완전상병
  preCheck?: PreCheckIncompleteDx;
  // 사전점검 resolution 추적용 안정 id (코드가 바뀌어도 동일 row를 가리킴)
  pcId?: string;
};

export type DurType = 'prohibited' | 'age' | 'pregnancy' | 'duplicate' | 'dose' | 'diagnosis';

// ── 사전점검(PreCheck) — DUR과 별개의 인라인 경고 시스템 ─────────────────────
export type PreCheckType =
  | "incompleteDx"      // 불완전상병 — 완전상병 후보 중 선택
  | "anesthesiologist"  // 마취과 전문의 청구코드 — 전문의 정보 입력 필요
  | "zeroDose"          // 용량 0 — 용량 입력 필요
  | "departure"         // 출국자 — 비청구 내원일 전환 여부
  | "treatmentTime";    // 진료시간 주야공 불일치 — 진료일시 수정

export type PreCheckCompleteOption = { code: string; name: string };
export type PreCheckIncompleteDx = {
  type: "incompleteDx";
  options: PreCheckCompleteOption[];   // 후보 완전상병 리스트
};

export type Anesthesiologist = {
  id: string;
  name: string;
  license: string;
  rrn: string; // 주민등록번호 (마스킹)
};

export type PreCheckAnesthesiologist = {
  type: "anesthesiologist";
  candidates: Anesthesiologist[]; // 사전 등록된 전문의 리스트
};

export type PreCheckZeroDose = {
  type: "zeroDose";
  suggested?: string; // 권장 용량 (예: "1")
};

export type DayNightHoliday = "주" | "야" | "공"; // 주간/야간/공휴
export type PreCheckTreatmentTime = {
  type: "treatmentTime";
  chartZone: DayNightHoliday;       // 차트의 주야공 구분
  scheduleZone: DayNightHoliday;    // 진료일시의 주야공 구분
  scheduledAt: string;              // 현재 진료일시 (datetime-local 형식)
};

export type PreCheckDeparture = {
  type: "departure";
  departureDate: string;             // 출국 예정일
};

export type PayMethod = "수납없음" | "보험가" | "일반가" | "보험가비급여";

export type TodayPrescription = {
  kind?: "lab" | "drug";  // 검사(lab)면 원내 컬럼이 "수탁"/"원내" 텍스트, 그 외(drug 기본)는 체크박스
  code: string;          // 사용자코드 (e.g., glu, tnjam)
  name: string;          // 명칭
  dose: string;          // 용량
  freq: number;          // 일투
  days: number;          // 일수
  method: string;        // 용법 (경구/근육/amp/ap 등)
  special?: string;      // 특정내역 (legacy, deprecated — use specialDetail)
  // 특정내역 — 줄단위 등록. 코드는 JT019 같은 식별자, content 는 평문(JX999 인 경우 필수, 다른 코드는 옵션)
  specialDetail?: { code: string; content?: string };
  // 기초자료에서 "특정내역 필요" 로 플래그된 처방.
  // 이 플래그가 켜져있는데 specialDetail.content 가 비어있으면 회색 메모 아이콘으로 미입력 알림.
  // 의사가 진료실에서 모달을 열었다가 내용 없이 저장한 경우는 이 플래그와 별개로 specialDetail 를 clear 함.
  requiresSpecial?: boolean;
  exception?: string;    // 예외
  claim: boolean;        // 청구 여부 ("청" 칩으로 표시)
  pay: boolean;          // 수납 여부 (true면 기본, false면 "수납없음")
  payMethod?: PayMethod; // 수납방법 — 클릭 시 4개 옵션 사이클
  specimen?: string;     // 검체
  price: number;         // 단가
  unit?: string;         // 단위 (예: "1 정", "20 mL", "10 mL")
  billCode?: string;     // 청구코드 (예: D3022)
  isPowder?: boolean;    // 가루
  isInternal?: boolean;  // 원내(true) / 수탁(false)
  isReserved?: boolean;
  // 예약처방 → 원무 접수 시 미리 적용된 처방 (노란색 배경 + 시계 아이콘)
  fromReservation?: boolean;
  isDur?: boolean;
  durType?: DurType;
  durExtra?: string;
  conflictCode?: string; // code of the conflicting prescription (for 병용금기/중복처방)
  durReason?: string;
  isNew?: boolean;
  // 사전점검 — 처방 행에 붙는 경고 (마취과전문의 / 용량0 등)
  preCheck?: PreCheckAnesthesiologist | PreCheckZeroDose;
  // 사전점검 resolution 추적용 안정 id (속성 수정 후에도 동일 row를 가리킴)
  pcId?: string;
};

// History visit item types (from PanelC / EMRExpandedHistory)
export type HistoryDx = { code: string; name: string };
export type HistoryRx = {
  code?: string;       // 사용자코드 (option)
  name: string;
  dose: string;
  freq: string;
  days: number;
  price: number;
  method?: string;
  special?: string;    // 특정내역
  payMethod?: string;  // 수납방법 (예: "수납없음", "보험가")
  claim?: boolean;     // 청구 여부 (default true)
};