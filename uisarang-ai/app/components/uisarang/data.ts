export type OutStatus = "진료중" | "응급" | "검사" | "보류" | "시술";
export type PaymentStatus = "수납대기" | "수납완료";

export type QueuePatient = {
  chartNo: string;
  name: string;
  sex: "남" | "여";
  age: number;
  time: string; // 접수시간 / 예약시간
  insurance: "건강보험" | "일반" | "의료급여"; // 보험구분
  memo: string; // 접수메모(특기사항)
  isNew?: boolean; // 신환여부
  status?: OutStatus; // 외래 환자 상태
  payment?: PaymentStatus; // 완료 환자 수납 상태
};

// 외래(대기) 환자
export const outpatients: QueuePatient[] = [
  { chartNo: "100231", name: "조성진", sex: "남", age: 52, time: "09:42", insurance: "건강보험", memo: "혈압약 재처방 요청" },
  { chartNo: "100232", name: "김영철", sex: "남", age: 52, time: "09:50", insurance: "건강보험", memo: "두통·어지럼증 1주째 지속", isNew: true, status: "응급" },
  { chartNo: "100233", name: "이수진", sex: "여", age: 30, time: "10:02", insurance: "일반", memo: "감기, 인후통", isNew: true, status: "검사" },
  { chartNo: "100234", name: "박지민", sex: "여", age: 28, time: "10:08", insurance: "건강보험", memo: "정기 검진 결과 상담", status: "진료중" },
  { chartNo: "100235", name: "최민수", sex: "남", age: 45, time: "10:15", insurance: "일반", memo: "허리 통증 지속", status: "보류" },
  { chartNo: "100236", name: "한정우", sex: "남", age: 38, time: "10:21", insurance: "건강보험", memo: "사마귀 제거 시술", status: "시술" },
];

// 예약 환자
export const reservations: QueuePatient[] = [
  { chartNo: "100251", name: "정해인", sex: "남", age: 41, time: "11:00", insurance: "건강보험", memo: "고혈압 정기 처방" },
  { chartNo: "100252", name: "한소희", sex: "여", age: 29, time: "11:30", insurance: "일반", memo: "건강검진 결과 상담", isNew: true },
  { chartNo: "100253", name: "김도윤", sex: "남", age: 8, time: "13:00", insurance: "건강보험", memo: "예방접종" },
  { chartNo: "100254", name: "이서연", sex: "여", age: 55, time: "14:00", insurance: "건강보험", memo: "당뇨 추적 관찰" },
];

// 완료 환자
export const completed: QueuePatient[] = [
  { chartNo: "100221", name: "김영철", sex: "남", age: 52, time: "09:05", insurance: "건강보험", memo: "고지혈증 정기 검진", payment: "수납완료" },
  { chartNo: "100222", name: "이수민", sex: "여", age: 30, time: "09:12", insurance: "일반", memo: "복통, 소화불량", payment: "수납대기" },
  { chartNo: "100223", name: "박준호", sex: "남", age: 45, time: "09:20", insurance: "건강보험", memo: "당뇨 관리", payment: "수납완료" },
];

export const currentPatient = {
  chartNo: "19283726",
  name: "김메디",
  ssn: "850312-2******",
  age: 41,
  sex: "여" as const,
  insurance: "건강보험",
  phone: "010-2845-1932",
  memo: "두통, 어지럼증이 일주일째 지속, 혈압약 규칙적으로 복용하고 있음",
};

export type TranscriptLine = {
  time: string;
  speaker: "doctor" | "patient";
  text: string;
};

export const transcript: TranscriptLine[] = [
  { time: "0:00", speaker: "doctor", text: "김영철 님, 어서오세요. 어디가 불편하셔서 오셨나요?" },
  { time: "0:08", speaker: "patient", text: "네, 1주일 전부터 두통이 심하고 어지러워요. 특히 아침에 일어날 때 심해요." },
  { time: "0:22", speaker: "doctor", text: "혈압약은 잘 드시고 계시죠? 암로디핀 5mg이요." },
  { time: "0:31", speaker: "patient", text: "네, 매일 아침에 먹고 있어요. 근데 요즘 기침도 많이 해요. 3주 됐어요" },
  { time: "0:46", speaker: "doctor", text: "기침에 가래는 있으세요?" },
  { time: "0:49", speaker: "patient", text: "가래는 없는데 마른기침이 계속 나와요. 밤에 잠도 잘 못자요." },
  { time: "1:05", speaker: "doctor", text: "수면은 어떠세요? 몇 시쯤 깨시나요?" },
  { time: "1:12", speaker: "patient", text: "새벽 2시쯤 두통 때문에 깨요. 다시 잠들기도 어렵고요." },
  { time: "3:41", speaker: "doctor", text: "스트레스 받는 일이 있으세요?" },
  { time: "3:48", speaker: "patient", text: "회사에서 프로젝트가 많아서 야근이 잦아요." },
];

export const favorites: string[] = [
  "환자에게 처방 가능한 약물 종류는?",
  "고혈압 1차 치료 방법을 알려 주세요.",
  "고혈압 환자를 위한 식이요법 추천은 무엇인가요?",
  "고혈압과 관련된 운동 요법은 어떤 것이 있나요?",
  "고혈압 환자에게 적합한 차 종류는 무엇인가요?",
];

export type Diagnosis = {
  id: string;
  userCode: string; // 사용자코드
  name: string; // 명칭
  ai?: boolean;
};

export const diagnoses: Diagnosis[] = [
  { id: "dx1", userCode: "I10", name: "본태성 (원발성) 고혈압", ai: true },
  { id: "dx2", userCode: "G44.2", name: "긴장성 두통" },
  { id: "dx3", userCode: "R51", name: "두통", ai: true },
];

export type Prescription = {
  id: string;
  userCode: string; // 사용자코드
  name: string; // 명칭
  dose: string; // 용량
  perDay: string; // 일투
  days: string; // 일수
  ai?: boolean;
};

export const prescriptions: Prescription[] = [
  { id: "rx1", userCode: "AML5", name: "암로디핀베실산염 5mg 정", dose: "1정", perDay: "1회", days: "30일", ai: true },
  { id: "rx2", userCode: "AML10", name: "암로디핀베실산염 10mg 정", dose: "1정", perDay: "1회", days: "30일", ai: true },
  { id: "rx3", userCode: "IBU400", name: "이부프로펜 400mg 정", dose: "1정", perDay: "3회", days: "7일" },
  { id: "rx4", userCode: "HCT25", name: "히드로클로로티아지드 25mg 정", dose: "1정", perDay: "1회", days: "30일", ai: true },
  { id: "rx5", userCode: "RAM5", name: "라미프릴 5mg 정", dose: "1정", perDay: "1회", days: "30일" },
];

export const soap = {
  s: "52세 남성. 1주일 전부터 두통 및 어지럼증 지속 호소.\n혈압약(암로디핀 5mg) 규칙적 복용 중.",
  o: "BP 142/90 mmHg, T 36.6°C. 체중 78kg.\n신경학적 검사 정상. 경부 긴장 소견.",
  a: "1. 본태성 고혈압(I10) — 현 약물로 조절 불량\n2. 긴장성 두통(G44.2) — 스트레스 관련",
  p: "1. 암로디핀 5mg → 10mg 증량 (1T QD)\n2. 이부프로펜 400mg 추가 (필요시 1T TID, 7일)",
};
