// 환자 검색 — chart-prototype/_mock/patient-search.ts 의 mock 데이터·검색 로직 그대로 이식.
// TopBar 환자검색바에서 차트번호·이름·생년월일(주민 앞 6자리)·휴대폰번호로 검색.
// 검색 결과에 당일 예약/당일 내원 뱃지 표기.

export type SearchablePatient = {
  chartNo: string;
  name: string;
  sex: "남" | "여";
  age: number;
  /** 생년월일 = 주민등록번호 앞 6자리 (YYMMDD) — 생년월일 검색 키 */
  birth: string;
  /** 주민등록번호 뒷 첫자리 (성별/세기) — 표시용 */
  rrnBackFirst: string;
  /** 휴대폰 (뒷 4자리 0000 더미) */
  phone: string;
  insurance: "건강보험" | "의료급여" | "산재" | "일반";
  /** 최근 내원일 (YYYY-MM-DD). 신환은 undefined */
  lastVisit?: string;
  /** 당일 예약 있음 */
  hasReservationToday?: boolean;
  /** 당일 이미 내원함 */
  visitedToday?: boolean;
};

// 오늘(프로토타입 기준) 환자 검색 풀 — 다양한 상태 조합.
// 김민지(chartNo 738) 가 검색 테스트의 메인 시나리오:
//   - "김민지" 풀네임 검색
//   - "김민" 부분 검색 — 김민지·김민호·김민준·김민서 4명 동시 매칭
//   - "김" 검색 — 김씨 다수 매칭
//   - 차트번호 "738" 직접 검색
//   - 김민지 lastVisit = 2026-03-12 → PanelC 의 default activeDate "26-03-12" 와 매칭
//     → 직전차트 모드 진입 시 해당 행이 자연스럽게 강조됨.
//   - 김민지 hasReservationToday=true · visitedToday=true → 양쪽 뱃지 노출
export const SEARCHABLE_PATIENTS: SearchablePatient[] = [
  // ── 김민지 시나리오 (메인 테스트 케이스) ─────────────────────
  { chartNo: "738",  name: "김민지", sex: "여", age: 28, birth: "970815", rrnBackFirst: "2", phone: "010-5567-1234", insurance: "건강보험", lastVisit: "2026-03-12", hasReservationToday: true, visitedToday: true },

  // ── "김민" 부분 검색 결과 매칭용 동명이인 ─────────────────
  { chartNo: "245",  name: "김민호", sex: "남", age: 42, birth: "820604", rrnBackFirst: "1", phone: "010-4421-7788", insurance: "건강보험", lastVisit: "2026-05-21" },
  { chartNo: "881",  name: "김민준", sex: "남", age: 35, birth: "891118", rrnBackFirst: "1", phone: "010-9988-3344", insurance: "건강보험", lastVisit: "2026-02-08" },
  { chartNo: "412",  name: "김민서", sex: "여", age: 19, birth: "060427", rrnBackFirst: "4", phone: "010-2255-6677", insurance: "건강보험", lastVisit: "2026-04-30", hasReservationToday: true },

  // ── "김" 검색 매칭용 추가 김씨 ───────────────────────────
  { chartNo: "415",  name: "김서연", sex: "여", age: 34, birth: "920411", rrnBackFirst: "2", phone: "010-5512-0000", insurance: "건강보험", lastVisit: "2026-04-18", hasReservationToday: true },
  { chartNo: "657",  name: "김지훈", sex: "남", age: 47, birth: "771012", rrnBackFirst: "1", phone: "010-6677-2233", insurance: "건강보험", lastVisit: "2026-05-15" },
  { chartNo: "923",  name: "김도현", sex: "남", age: 31, birth: "930722", rrnBackFirst: "1", phone: "010-3344-9988", insurance: "산재", lastVisit: "2026-05-29", visitedToday: true },

  // ── 그 외 다양한 환자 (다른 성씨 검색 테스트) ────────────
  { chartNo: "11",   name: "이정민", sex: "여", age: 30, birth: "960102", rrnBackFirst: "2", phone: "010-7788-0000", insurance: "건강보험", lastVisit: "2026-05-29", hasReservationToday: true, visitedToday: true },
  { chartNo: "302",  name: "윤태석", sex: "남", age: 58, birth: "680809", rrnBackFirst: "1", phone: "010-2233-0000", insurance: "건강보험", lastVisit: "2026-05-29", visitedToday: true },
  { chartNo: "087",  name: "박준호", sex: "남", age: 45, birth: "810620", rrnBackFirst: "1", phone: "010-9081-0000", insurance: "건강보험", lastVisit: "2026-03-02" },
  { chartNo: "523",  name: "최은지", sex: "여", age: 27, birth: "990315", rrnBackFirst: "2", phone: "010-3344-0000", insurance: "건강보험", lastVisit: "2026-05-12", hasReservationToday: true },
  { chartNo: "164",  name: "정우성", sex: "남", age: 52, birth: "740128", rrnBackFirst: "1", phone: "010-7702-0000", insurance: "의료급여", lastVisit: "2026-05-29", visitedToday: true },
  { chartNo: "208",  name: "한지민", sex: "여", age: 39, birth: "870922", rrnBackFirst: "2", phone: "010-6614-0000", insurance: "건강보험", lastVisit: "2026-02-25" },
  { chartNo: "351",  name: "강민석", sex: "남", age: 63, birth: "631105", rrnBackFirst: "1", phone: "010-1190-0000", insurance: "건강보험", lastVisit: "2026-05-20" },
  { chartNo: "499",  name: "오세훈", sex: "남", age: 41, birth: "850712", rrnBackFirst: "1", phone: "010-4456-0000", insurance: "산재", lastVisit: "2026-05-28", hasReservationToday: true },
  { chartNo: "612",  name: "임수정", sex: "여", age: 48, birth: "780330", rrnBackFirst: "2", phone: "010-8823-0000", insurance: "건강보험", lastVisit: "2026-01-14" },
  { chartNo: "077",  name: "신동엽", sex: "남", age: 50, birth: "760519", rrnBackFirst: "1", phone: "010-3091-0000", insurance: "건강보험", lastVisit: "2026-05-29", visitedToday: true },
];

/** 주민등록번호 표시용 (앞6-뒷첫자리 + 마스킹). 예: 960102-2****** */
export function displayRrn(p: SearchablePatient): string {
  return `${p.birth}-${p.rrnBackFirst}******`;
}

// ── 환자별 mock 차트 데이터 ───────────────────────────────────────
// TopBar 검색에서 선택된 환자별로 내원이력·오늘 차트·바이탈 등이 다르게 보여야 함.
// chartNo 기반 lookup. 데이터 없는 환자는 빈 상태로 표시 (신환 느낌).
// 황미진(100236) 은 기본 환자이므로 별도 mock 없이 PanelC/PanelD 내장 데이터를 그대로 사용.

export type MockPatientChart = {
  /** 내원이력 — PanelC 의 visitHistory 구조. date 는 YY-MM-DD. */
  visits: Array<{
    id: string;
    date: string;
    time?: string;
    visitType: "재진" | "초진";
    insType: "건강보험" | "의료급여" | "산재" | "일반" | "직장";
    symptom: string;
    diagnoses: Array<{ code: string; name: string }>;
    prescriptions: Array<{ code: string; name: string; dose: string; freq: string; days: number; price: number; method: string }>;
    tags?: string[];
    prescTypes?: ("영" | "초" | "내" | "혈" | "기" | "주" | "물" | "방" | "검")[];
    amount?: string;
  }>;
  /** 오늘 새로 시작하는 차트의 초기 상태 — todayDx, todayRx, symptom */
  todayDx: Array<{ code: string; name: string; isMain?: boolean }>;
  todayRx: Array<{ code: string; name: string; dose: string; freq: number; days: number; method: string; claim: boolean; pay: boolean; price: number; isInternal?: boolean }>;
  todaySymptom: string;
  /** 차트정보 — D1 헤더에 노출되는 진료일자·접수메모 (PanelD intake) */
  chartInfo: {
    visitDate: string;        // 예: "2026.03.12 (목)"
    intakeMemo: string;       // 예: "철분 보충 필요 — 정기 결과 확인" or ""
    insuranceType?: string;
    visitNumber?: "초진" | "재진";
    doctor?: string;
  };
  /** 공유메모 — PanelB SharedMemoCard 에 노출 */
  sharedMemo: string;
};

// 김민지 (chartNo 738) — 직전차트 mock. 26-03-12 visit 1건만 (직전차트 모드 default date 와 매칭).
const KIM_MIN_JI_CHART: MockPatientChart = {
  visits: [
    {
      id: "26-03-12",
      date: "26-03-12",
      time: "10:25",
      visitType: "재진",
      insType: "건강보험",
      symptom: "월경통, 어지러움 — 빈혈 의심으로 혈액검사 의뢰.",
      diagnoses: [
        { code: "N94.6", name: "월경통, 상세불명" },
        { code: "D50.9", name: "철결핍성 빈혈, 상세불명" },
      ],
      prescriptions: [
        { code: "fer60",  name: "철분제 (페로글리신산 60mg)", dose: "1", freq: "1", days: 30, price: 800, method: "경구" },
        { code: "ibu400", name: "이부프로펜정 400mg",         dose: "1", freq: "3", days: 5,  price: 600, method: "경구" },
        { code: "cbc",    name: "전혈구검사(CBC)",           dose: "1", freq: "1", days: 1,  price: 9000, method: "-" },
      ],
      tags: ["검"],
      prescTypes: ["혈"],
      amount: "₩28,400",
    },
  ],
  todayDx: [],
  todayRx: [],
  todaySymptom: "",
  chartInfo: {
    visitDate: "2026.03.12 (목)",
    intakeMemo: "철분 보충 후 6주 경과 — CBC 재검 결과 확인",
    insuranceType: "건강보험",
    visitNumber: "재진",
    doctor: "이의사",
  },
  sharedMemo: "철분제 복용 중. 식이 상담 필요. 가족력: 빈혈(모친).",
};

/**
 * 환자별 mock 차트 데이터 조회. 황미진(100236) 은 PanelC/PanelD 의 내장 데이터를 사용하므로
 * 이 함수는 반환하지 않음 — undefined 가 곧 "default 환자 데이터 사용" 의미.
 */
export function getMockPatientChart(chartNo: string): MockPatientChart | undefined {
  if (chartNo === "738") return KIM_MIN_JI_CHART;
  return undefined;
}

/**
 * 환자 검색 — 차트번호·이름·생년월일(주민 앞 6자리)·휴대폰번호 부분 일치.
 * - 숫자/하이픈 쿼리: 차트번호·생년월일·휴대폰(숫자만 비교)
 * - 그 외(한글 등): 이름
 * 빈 쿼리는 빈 배열.
 */
export function searchPatients(query: string): SearchablePatient[] {
  const q = query.trim();
  if (!q) return [];

  const digits = q.replace(/[^0-9]/g, "");
  const isNumeric = digits.length > 0 && /^[0-9-]+$/.test(q);

  return SEARCHABLE_PATIENTS.filter((p) => {
    if (isNumeric) {
      const phoneDigits = p.phone.replace(/[^0-9]/g, "");
      return (
        p.chartNo.includes(digits) ||
        p.birth.includes(digits) ||
        phoneDigits.includes(digits)
      );
    }
    return p.name.toLowerCase().includes(q.toLowerCase());
  });
}
