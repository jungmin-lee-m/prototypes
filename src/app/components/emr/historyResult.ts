// ── 내원이력 결과 컬럼 helpers ─────────────────────────────────────────────
// PanelC (접힘) 와 EMRExpandedHistory (펼침) 가 같은 분류 로직을 공유.
// PanelC ↔ EMRExpandedHistory 간 순환 import 회피를 위해 별도 파일로 분리.

// 검사 처방 판별 — 약품이 아닌 검사/영상/판독 종류는 검사결과 노출 대상.
// name 키워드 또는 method 가 "-" (검사는 보통 용법 없음) 인 경우 true.
export const isLabRx = (rx: { name: string; method?: string }): boolean => {
  if (rx.method === "-" || rx.method === "검사") return true;
  return /검사|CBC|CRP|X-?ray|MRI|CT|초음파|EKG|심전도|골밀도|내시경|소변|혈청|혈액|배양|판독|영상|HbA1c|콜레스테롤|eGFR|공복혈당|IgE/i.test(rx.name);
};

// PACS 대상 검사 — 방사선 영상 + 장비 연동 이미지 결과 검사.
//   방사선 영상: X-ray, CT, MRI, 초음파, 내시경, 영상, 방사선, 투시
//   장비 이미지: EKG/심전도(트레이스), Holter, 골밀도/DEXA, 폐기능/PFT(차트), 안저/fundus, 청력 audiogram
export const isImagingLab = (rx: { name: string }): boolean =>
  /X-?ray|MRI|CT|초음파|sonography|내시경|EGD|colonoscopy|영상|방사선|투시|EKG|ECG|심전도|Holter|골밀도|DEXA|폐기능|PFT|안저|fundus|청력|audiometry/i.test(rx.name);

// 소견검사 (LabViewer) — 텍스트성 정성 결과 (배양·판독 텍스트·정성검사).
// 영상·장비 이미지는 isImagingLab 으로 분기되어 PACS 로 감.
export const isFindingLab = (rx: { name: string }): boolean =>
  /판독|소견|배양|culture|정성|qualitative/i.test(rx.name);

// 처치 판별 — 약/검사가 아닌 행위성 항목 (물리치료·도수·주사·드레싱 등).
// 결과 컬럼에서 약과 동일한 다중 신호 사용.
export const isProcedure = (rx: { name: string; method?: string }): boolean => {
  if (/물리치료|도수|침|뜸|봉합|드레싱|처치|시술|마사지|견인/.test(rx.name)) return true;
  if (/정맥|근육|피하/i.test(rx.method ?? "")) return true;
  if (/주사|infusion|injection/i.test(rx.name)) return true;
  return false;
};

// 검사 처방 행에 인라인 표시할 검사결과 (mock). 4-tier 분류:
//   numeric: 수치 + 단위 — 클릭 시 LabViewer
//   finding: 결과보기 버튼 — 클릭 시 LabViewer (소견·배양 등 텍스트성)
//   imaging: 결과보기 버튼 — 클릭 시 PACS 팝업 (영상 + 장비 이미지)
//   pending: 아직 결과 미입력 → 의사가 직접 입력 (결과 입력 버튼)
export type LabResult =
  | { kind: "numeric"; display: string }
  | { kind: "finding" }
  | { kind: "imaging" }
  | { kind: "pending" };

// 약·처치 행에 인라인 표시할 다중 신호 (mock).
//   dur: 처방 당시 DUR 경고 (병용·임부·연령 금기)
//   new: 이 환자에게 신규 처방 (이전 내원에 없던 약·처치)
//   changed: 이전 대비 용량·일수 변경
//   procRound: 시술 회차 (예: 도수치료 5회차) — 처치만
export type RxSignal =
  | { kind: "dur"; flavor: "병용" | "임부" | "연령" }
  | { kind: "new" }
  | { kind: "changed"; label: string }
  | { kind: "procRound"; round: number };

// rx + 진료일자 → deterministic 신호 (mock). 같은 약/처치라도 다른 visit 에서 다른 신호 가능.
export const rxSignalFor = (
  rx: { code?: string; name: string; method?: string },
  visitDate: string,
): RxSignal | null => {
  if (isLabRx(rx)) return null;  // 검사는 labResult 로 별도 처리
  const seed = [...((rx.code ?? rx.name) + visitDate)].reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = seed % 20;
  const isProc = isProcedure(rx);
  // 처치: 회차 신호 우선
  if (isProc && r >= 0 && r <= 2) return { kind: "procRound", round: (seed % 9) + 1 };
  if (r === 3) return { kind: "dur", flavor: "병용" };
  if (r === 4) return { kind: "dur", flavor: "연령" };
  if (r === 5) return { kind: "new" };
  if (r === 6) return { kind: "changed", label: "↑ 1→2정" };
  if (r === 7) return { kind: "changed", label: "↑ 30→60일" };
  if (r === 8 && !isProc) return { kind: "changed", label: "↓ 5→2.5mg" };
  return null;
};

// 검사 결과 입력 대기 여부 — 최근 진료 (26년) 의 일부 검사가 pending 상태로 mock.
export const isPendingLabResult = (
  rx: { code?: string; name: string; method?: string },
  visitDate: string,
): boolean => {
  if (!isLabRx(rx)) return false;
  // 영상·장비검사는 PACS 자체에 결과가 들어와있다고 가정 — pending 은 수치·소견 검사에서만
  if (isImagingLab(rx)) return false;
  // 최근 진료 일부만 pending (한 진료 안에서 ~15% 정도)
  if (!visitDate.startsWith("26-0")) return false;
  const seed = [...((rx.code ?? rx.name) + visitDate)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return seed % 7 === 0;
};

// 코드 → 알려진 수치 매핑 (캡쳐 화면 값 기준).
const KNOWN_LAB_VALUES: Record<string, string> = {
  glu:    "94 mg/dL",
  a1c:    "7.2 %",
  tg:     "187 mg/dL",
  ldl:    "138 mg/dL",
  rbc:    "4.62 ×10⁶/μL",
  alt:    "42 U/L",
  cr:     "0.92 mg/dL",
  cbc:    "5.8 ×10³/μL",
  crp:    "0.3 mg/L",
  Bct033: "양호",
};

// labResultFor — visitDate 를 함께 받아 pending 여부 판별. (visitDate 무시하면 항상 결과 있는 것으로 취급)
export const labResultFor = (
  rx: { code?: string; name: string; method?: string },
  visitDate?: string,
): LabResult | null => {
  if (!isLabRx(rx)) return null;
  // pending — 의사가 직접 입력해야 하는 미입력 상태. 영상·장비검사는 PACS 가 다루므로 제외.
  if (visitDate && isPendingLabResult(rx, visitDate)) return { kind: "pending" };
  if (isImagingLab(rx)) return { kind: "imaging" };
  if (isFindingLab(rx)) return { kind: "finding" };
  // 수치형 — 알려진 코드 우선, 없으면 deterministic hash 로 mock 생성
  const code = rx.code ?? rx.name;
  if (code && KNOWN_LAB_VALUES[code]) return { kind: "numeric", display: KNOWN_LAB_VALUES[code] };
  const hash = [...code].reduce((s, c) => s + c.charCodeAt(0), 0);
  return { kind: "numeric", display: `${hash % 100}.${hash % 10}` };
};
