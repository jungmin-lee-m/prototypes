// 오늘 내원 현황 — chart-prototype 의 derive helper · 그룹 상수 이식.
// SettledPatient 의 추가 derive 값 (그룹·청구·수납시각·주민번호·휴대폰·환자유형) 을 일관 함수로 제공.

// 환자 그룹 — 녹십자부속의원(사내의원) 운영 관점의 분류 = GC 그룹사 소속 단위.
// 모든 환자는 그룹사 직원/가족이므로 소속사로 분류된다.
export const PATIENT_GROUPS = [
  "그린벳",
  "에이블애너리틱스",
  "GCLabs(의료재단)",
  "GC녹십자",
  "GC녹십자MS",
  "MOGAM",
  "GC(홀딩스)",
  "GC녹십자EM",
  "GC Cell",
  "GCCL",
  "GC지놈",
];

/** 환자 → 그룹사 매핑 (mock). chartNo 해시로 결정적 분배 — 동일 차트번호는 항상 동일 그룹. */
export function deriveGroup(p: { chartNo: string }): string {
  const hash = p.chartNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PATIENT_GROUPS[hash % PATIENT_GROUPS.length];
}

/** 환자 → 청구 구분 매핑 (mock). 일반/자보 = 비청구, 그 외 = 청구. */
export function deriveClaim(p: { insType: string }): "청구" | "비청구" {
  return p.insType === "일반" ? "비청구" : "청구";
}

/** 환자 → 환자유형 — SettledPatient 의 tags 필드 직접 반환 (mock 데이터 그대로 사용). */
export function deriveTags(p: { tags?: string[] }): string[] {
  return p.tags ?? [];
}

/** HH:MM 에서 minutes 분 후의 HH:MM 반환. */
function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

/** 환자 → 주민등록번호 (mock, `YYMMDD-GNNNNNN`).
 * - 생년월일: 현재 연도 - age, 월/일은 chartNo 해시 기반
 * - 뒷자리 첫 숫자(G): 성별 + 출생세기 (1900s 남=1/여=2, 2000s 남=3/여=4)
 * - 표시 정책: 사유 모달(DownloadReasonModal)이 다운로드·출력 시 사용 목적 기록 → 화면 표시 마스킹 없음. */
export function deriveRrn(p: { age: number; gender: "남" | "여"; chartNo: string }): string {
  const today = new Date();
  const birthYear = today.getFullYear() - p.age;
  const yy = String(birthYear).slice(2).padStart(2, "0");
  const hash = p.chartNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const mm = String((hash % 12) + 1).padStart(2, "0");
  const dd = String((hash % 28) + 1).padStart(2, "0");
  const genderDigit = birthYear < 2000
    ? (p.gender === "남" ? "1" : "2")
    : (p.gender === "남" ? "3" : "4");
  const back6 = String((hash * 7919) % 1_000_000).padStart(6, "0");
  return `${yy}${mm}${dd}-${genderDigit}${back6}`;
}

/** 환자 → 핸드폰 (mock, 뒷자리 4 = `0000` 더미 컨벤션). */
export function derivePhone(p: { phone: string }): string {
  const parts = p.phone.split("-");
  if (parts.length === 3) {
    parts[2] = "0000";
    return parts.join("-");
  }
  return p.phone;
}

/** 환자 → 수납 완료 시각 (mock).
 * - 수납대기 환자: undefined
 * - 수납완료 환자: 진료(visitTime) + 5~14분 (chartNo 마지막 자리로 분산) */
export function deriveSettledTime(p: { visitTime: string; status?: "수납대기" | "수납완료"; chartNo: string }): string | undefined {
  if (p.status === "수납대기") return undefined;
  const tail = Number(p.chartNo.slice(-1)) || 5;
  const offset = 5 + tail;
  return addMinutes(p.visitTime, offset);
}

// 내원 현황 처방 필터용 처방 dictionary.
// EmrScreen 의 INIT_RX (오늘 차트 처방) 와 동일한 entry 들 + 임상 빈출 약품/시술 보강.
// 코드 / 명칭 / 청구코드 로 검색 가능 — 사용자코드 (e.g. "tnjam"), 한글명 ("트라젠타"), 청구코드 ("642101") 모두 매칭.
// helpers.ts 에 둔 이유: SettledPatientsTable → EndOfDayReport → EmrScreen 의존 chain 을 만들지 않기 위함.
// (EmrScreen.INIT_RX 를 import 하면 순환 참조 — helpers 는 EndOfDayReport 의 자식이므로)
export type RxDictEntry = {
  code: string;      // 사용자코드 (e.g. "tnjam", "glu")
  name: string;      // 명칭 (e.g. "트라젠타정 5mg")
  billCode?: string; // 청구코드 (e.g. "642101")
  kind?: "drug" | "lab" | "procedure";
};

export const RX_DICTIONARY: RxDictEntry[] = [
  // 약품 — EmrScreen INIT_RX 와 동일한 entry
  { code: "tnjam",  name: "트라젠타정 5mg",                          billCode: "642101", kind: "drug" },
  { code: "gv022",  name: "가브스메트정 50/850mg",                   billCode: "640002", kind: "drug" },
  { code: "A0015",  name: "텔미사르탄·암로디핀베실산염",              billCode: "650148", kind: "drug" },
  { code: "aspirin100", name: "아스피린장용정 100mg",                billCode: "651034", kind: "drug" },
  { code: "C0012",  name: "클로르페니라민말레산염·슈도에페드린",      billCode: "655401", kind: "drug" },
  { code: "B7502",  name: "비라토비캡슐 75mg",                       billCode: "642205", kind: "drug" },
  { code: "L4400",  name: "레비라정 500mg",                          billCode: "640187", kind: "drug" },
  { code: "cn000",  name: "클렌부테롤·아크라이드정(암브록솔염산염)", kind: "drug" },
  // 임상 빈출 약품 (보강)
  { code: "met500", name: "메트포르민서방정 500mg",                  billCode: "640501", kind: "drug" },
  { code: "amx500", name: "아목시실린캡슐 500mg",                    billCode: "611200", kind: "drug" },
  { code: "lor10",  name: "로라타딘정 10mg",                         billCode: "655100", kind: "drug" },
  { code: "ace500", name: "아세트아미노펜정 500mg",                  billCode: "641000", kind: "drug" },
  { code: "ibu200", name: "이부프로펜정 200mg",                      billCode: "641020", kind: "drug" },
  { code: "ome20",  name: "오메프라졸캡슐 20mg",                     billCode: "642301", kind: "drug" },
  { code: "amlo5",  name: "암로디핀정 5mg",                          billCode: "651010", kind: "drug" },
  { code: "loz50",  name: "로사르탄정 50mg",                         billCode: "651020", kind: "drug" },
  { code: "ato20",  name: "아토르바스타틴정 20mg",                   billCode: "651200", kind: "drug" },
  { code: "ces10",  name: "세티리진정 10mg",                         billCode: "655110", kind: "drug" },
  { code: "lev50",  name: "레보티록신정 50mcg",                      billCode: "642600", kind: "drug" },
  // 검사 — EmrScreen INIT_RX 와 동일
  { code: "glu",    name: "당검사[화학반응-장비측정][정량]",         billCode: "D3022",  kind: "lab" },
  { code: "a1c",    name: "헤모글로빈A1C-[정밀면역검사]",            billCode: "D3063",  kind: "lab" },
  { code: "tg",     name: "지질[화학반응-장비측정]-트리글리세라이드", billCode: "D2263", kind: "lab" },
  { code: "ldl",    name: "콜레스테롤-LDL콜레스테롤[화학반응-장비측정]", billCode: "D2614", kind: "lab" },
  { code: "rbc",    name: "일반혈액검사(CBC)-[혈구세포-장비측정]_적혈구수", billCode: "D000201", kind: "lab" },
  { code: "alt",    name: "ALT (SGPT)[Serum]",                       billCode: "D1850",  kind: "lab" },
  { code: "cr",     name: "크레아티닌[화학반응-장비측정]",            billCode: "D2280",  kind: "lab" },
  { code: "Bct03332", name: "폐활량검사",                            billCode: "MM123",  kind: "lab" },
  // 시술
  { code: "000145", name: "물리치료",                                 kind: "procedure" },
  { code: "000165", name: "푸르설타민주(마늘주사)",                   kind: "procedure" },
  { code: "zm003",  name: "접종",                                     kind: "procedure" },
  { code: "L0044",  name: "마취과 전문의 초빙료(필요시 정맥내마취)",  billCode: "L0044", kind: "procedure" },
];

/** 환자 → 오늘 처방 목록 (mock). chartNo 해시로 결정적 2~4개 entry 분배.
 *  실 시스템에서는 SettledPatient 데이터에 prescriptions 필드가 직접 있을 것. */
export function derivePrescriptions(p: { chartNo: string }): RxDictEntry[] {
  const hash = p.chartNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 2 + (hash % 3); // 2~4 entry
  const start = hash % RX_DICTIONARY.length;
  return Array.from({ length: count }, (_, i) => RX_DICTIONARY[(start + i) % RX_DICTIONARY.length]);
}

/** RX_DICTIONARY 에서 q 와 부분일치하는 entry 검색. 코드 / 명칭 / 청구코드 모두 매칭 (대소문자 무시).
 *  진단·처방 패널의 PrescSearchRow placeholder ("코드 또는 명칭 입력") 와 동일 정책. */
export function searchRxDictionary(q: string, limit = 20): RxDictEntry[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const hits = RX_DICTIONARY.filter(rx =>
    rx.code.toLowerCase().includes(term)
    || rx.name.toLowerCase().includes(term)
    || (rx.billCode?.toLowerCase().includes(term) ?? false)
  );
  return hits.slice(0, limit);
}
