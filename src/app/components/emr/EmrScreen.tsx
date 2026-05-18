// 진료실 메인 화면 (App.tsx에서 분리, 라우팅 적용)
import { useState, useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { LNB, type LNBItem } from "./LNB";
import { TopBar } from "./TopBar";
import { DashboardScreen } from "./DashboardScreen";
import { EndOfDayReport } from "./EndOfDayReport";
import { PanelA } from "./PanelA";
import { PanelB, PatientInfoCard, AISummaryCard } from "./PanelB";
import { PanelC } from "./PanelC";
import { PanelD } from "./PanelD";
import { ClinicalNoteCard } from "./ClinicalNoteCard";
import { PanelE } from "./PanelE";
import { LabViewer } from "./LabViewer";
import { AIAssistant } from "./AIAssistant";
import type { TodayDiagnosis, TodayPrescription, HistoryDx, HistoryRx } from "./chartTypes";

const INIT_DX: TodayDiagnosis[] = [
  { code: "J00",   name: "급성비인두염[코감기]",         isMain: true },
  { code: "J20.9", name: "상세불명의 급성 기관지염" },
  { code: "I10",   name: "본태성(원발성) 고혈압" },
  { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
  // 사전점검 — 불완전상병 예시 (J06.9: 상세불명의 급성 상기도감염)
  { code: "J06.9", name: "상세불명의 급성 상기도감염",
    pcId: "pc-dx-incomplete-1",
    preCheck: { type: "incompleteDx", options: [
      { code: "J00",   name: "급성 비인두염[코감기]" },
      { code: "J02.9", name: "상세불명의 급성 인두염" },
      { code: "J03.9", name: "상세불명의 급성 편도염" },
      { code: "J04.0", name: "급성 후두염" },
      { code: "J04.1", name: "급성 기관염" },
      { code: "J05.0", name: "급성 폐쇄성 후두염[크룹]" },
    ] },
  },
];

const INIT_RX: TodayPrescription[] = [
  // 예약처방 → 원무 접수 시 미리 처방됨 (노란색 배경 + 시계 아이콘)
  { kind: "lab", code: "Bct03332", name: "폐활량검사", dose: "1", freq: 1, days: 1, method: "1일1회", exception: "18", claim: true, pay: true, price: 2500, billCode: "MM123", isInternal: false, fromReservation: true },

  // 검사 (lab tests) — 외부 수탁
  { kind: "lab", code: "glu",    name: "당검사[화학반응-장비측정][정량]",       dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 1550, billCode: "D3022", isInternal: false },
  { kind: "lab", code: "a1c",    name: "헤모글로빈A1C-[정밀면역검사]",          dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 8550, billCode: "D3063", isInternal: false },
  { kind: "lab", code: "tg",     name: "지질[화학반응-장비측정]-트리글리세라이드", dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 4410, billCode: "D2263", isInternal: false },
  { kind: "lab", code: "ldl",    name: "콜레스테롤-LDL콜레스테롤[화학반응-장비측정]", dose: "1", freq: 1, days: 1, method: "",  claim: true,  pay: true,  price: 7500, billCode: "D2614", isInternal: false },
  { kind: "lab", code: "rbc",    name: "일반혈액검사(CBC)-[혈구세포-장비측정]_적혈구수", dose: "1", freq: 1, days: 1, method: "", claim: true, pay: true, price: 1220, billCode: "D000201", isInternal: false },
  { kind: "lab", code: "alt",    name: "ALT (SGPT)[Serum]",                  dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 2180, billCode: "D1850", isInternal: false },
  { kind: "lab", code: "cr",     name: "크레아티닌[화학반응-장비측정]",        dose: "1", freq: 1, days: 1,  method: "",    claim: true,  pay: true,  price: 1960, billCode: "D2280", isInternal: false },

  // 약품 (drugs) — 원내
  { code: "tnjam",  name: "트라젠타정 5mg",             dose: "1", freq: 1, days: 20, method: "경구",  claim: true,  pay: true,  price: 161245,
    billCode: "642101", unit: "1 정", isInternal: false,
    isDur: true, durType: "prohibited", conflictCode: "gv022", durExtra: "가브스메트정 50/850mg",
    // 기초자료에서 "특정내역 필요" 로 설정된 처방 (병용금기 약제 처방사유) — 회색 알림 아이콘 노출
    requiresSpecial: true },
  { code: "gv022",  name: "가브스메트정 50/850mg",       dose: "1", freq: 1, days: 28, method: "경구",  claim: true,  pay: true,  price: 2000,
    billCode: "640002", unit: "1 정", isInternal: false,
    isDur: true, durType: "prohibited", conflictCode: "tnjam",  durExtra: "트라젠타정 5mg" },
  { code: "zm003",  name: "접종",                        dose: "1", freq: 1, days: 1,  method: "근육",  claim: true,  pay: false, payMethod: "수납없음", price: 3600, isInternal: true },
  { code: "000145", name: "물리치료",                    dose: "1", freq: 1, days: 1,  method: "—",     claim: true,  pay: true,  price: 3600, isInternal: true },
  { code: "000165", name: "푸르설타민주(마늘주사)",      dose: "1", freq: 1, days: 1,  method: "정맥",  claim: false, pay: true,  price: 1000, unit: "1 mL", isInternal: true },
  { code: "A0015",  name: "텔미사르탄·암로디핀베실산염", dose: "1", freq: 1, days: 14, method: "경구",  exception: "90", claim: true, pay: true, price: 2500, billCode: "650148", unit: "1 정", isInternal: false },
  { code: "aspirin100", name: "아스피린장용정 100mg",   dose: "1", freq: 1, days: 30, method: "경구",  claim: true,  pay: true,  price: 480, billCode: "651034", unit: "1 정", isInternal: false,
    isDur: true, durType: "diagnosis", durExtra: "관상동맥질환 [I25.1]" },
  { code: "C0012",  name: "클로르페니라민말레산염·슈도에페드린", dose: "1", freq: 1, days: 5,  method: "경구",  claim: true,  pay: true,  price: 800, billCode: "655401", unit: "1 정", isInternal: false, isPowder: true },
  { code: "B7502",  name: "비라토비캡슐 75mg",          dose: "1", freq: 1, days: 7,  method: "경구",  claim: true,  pay: true,  price: 3200, billCode: "642205", unit: "1 캡슐", isInternal: false },
  { code: "L4400",  name: "레비라정 500mg",              dose: "2", freq: 2, days: 7,  method: "경구",  claim: true,  pay: true,  price: 1800, billCode: "640187", unit: "1 정", isInternal: false },
  { code: "cn000",  name: "클렌부테롤·아크라이드정(암브록솔염산염)", dose: "0", freq: 1, days: 5, method: "경구", claim: true, pay: false, payMethod: "수납없음", price: 2500, unit: "1 정", isInternal: false,
    // 사전점검 — 용량 0 처방
    pcId: "pc-rx-zerodose-1",
    preCheck: { type: "zeroDose", suggested: "1" } },

  // 사전점검 — 마취과 전문의 초빙료 (전문의 정보 미입력)
  { code: "L0044", name: "마취과 전문의 초빙료(필요시 정맥내마취)", dose: "1", freq: 1, days: 1, method: "—", claim: true, pay: true, price: 75100, billCode: "L0044", isInternal: true,
    pcId: "pc-rx-anesthesiologist-1",
    preCheck: { type: "anesthesiologist", candidates: [
      { id: "as001", name: "김화타", license: "94871", rrn: "850904-2958374" },
      { id: "as002", name: "이마취", license: "73210", rrn: "780112-1429568" },
      { id: "as003", name: "박전문", license: "65488", rrn: "820627-2876511" },
    ] } },
];

function toTodayRx(r: HistoryRx): TodayPrescription {
  return {
    code: "",
    name: r.name,
    dose: r.dose,
    freq: parseInt(String(r.freq)) || 1,
    days: r.days,
    method: r.method || "경구",
    claim: true,
    pay: true,
    price: r.price,
    isNew: true,
  };
}

const INIT_SYMPTOM = "당뇨, 고혈압 정기 관리 중 (메트포르민·라미프릴). 이번 주 기침·콧물·발열 시작. 목 통증 동반. 9/20일자 알러지 검사 약 3~4주 소요, 결과 확인 필요. 복약 순응도 양호.";

const INIT_CLINICAL_NOTE = "다음 방문 시 HbA1c 재검 요청. 혈압 관리 강조. 금연 상담 필요. 체중 감량 목표 설정 (현재 72kg → 목표 68kg). 식이 조절 교육 완료.";

// 시연용 SOAP 스트림 청크 — 녹음 시작 후 1.5초 간격으로 차례대로 추가됨
const SOAP_STREAM_CHUNKS: { field: "S" | "O" | "A" | "P"; text: string }[] = [
  // S — 환자 호소 (주관적)
  { field: "S", text: "당뇨, 고혈압으로 정기 관리 중인 45세 여성. " },
  { field: "S", text: "지난 화요일부터 기침과 콧물 시작. " },
  { field: "S", text: "어제 저녁부터 미열(37.5도)과 목 통증 동반. " },
  { field: "S", text: "복용 중인 메트포르민, 텔미사르탄 순응도 양호. " },
  { field: "S", text: "9/20 시행한 알러지 검사 결과 아직 미확인 상태." },
  // O — 진찰 소견 (객관적)
  { field: "O", text: "BP 142/89 mmHg, HR 78, BT 37.6°C. " },
  { field: "O", text: "인후부 발적 관찰, 편도 비대 없음. " },
  { field: "O", text: "경부 림프절 비대 없음. " },
  { field: "O", text: "최근 HbA1c 7.2% (3개월 전), 공복혈당 128 mg/dL." },
  // A — 진단 (평가)
  { field: "A", text: "급성 비인두염 의증 (J00). " },
  { field: "A", text: "본태성 고혈압(I10) 안정. " },
  { field: "A", text: "제2형 당뇨(E11.9) 약간 조절 미흡 — HbA1c 추적. " },
  { field: "A", text: "알러지 검사 결과 추적 필요." },
  // P — 계획
  { field: "P", text: "대증치료 5일분 처방 (해열·진통·기침). " },
  { field: "P", text: "기존 만성질환 약 처방 유지. " },
  { field: "P", text: "1주일 내 알러지 결과 확인 후 후속 진료. " },
  { field: "P", text: "증상 악화 시 즉시 내원 안내." },
];

export type SoapDraft = { S: string; O: string; A: string; P: string };
const EMPTY_SOAP: SoapDraft = { S: "", O: "", A: "", P: "" };

export function EmrScreen() {
  const [todayDx, setTodayDx] = useState<TodayDiagnosis[]>(INIT_DX);
  const [todayRx, setTodayRx] = useState<TodayPrescription[]>(INIT_RX);
  const [todaySymptom, setTodaySymptom] = useState<string>(INIT_SYMPTOM);
  const [todayClinicalNote, setTodayClinicalNote] = useState<string>(INIT_CLINICAL_NOTE);
  const [layout, setLayout] = useState<1 | 2>(2);
  const [lnbActive, setLnbActive] = useState<LNBItem>("진료");
  // 오늘 내원 현황 모달 — 진료실에서만 노출. 상단 TopBar 의 버튼으로만 열림.
  const [showReport, setShowReport] = useState(false);
  const openReport  = () => { setShowReport(true); };
  const closeReport = () => { setShowReport(false); };

  // ── 진료 녹음 + STT SOAP 자동 작성 ──────────────────────────
  // 녹음 버튼 → setInterval 두 개 시작:
  //   recordTimer: 1초마다 경과 시간 +1
  //   streamTimer: 1.5초마다 SOAP_STREAM_CHUNKS의 다음 청크를 해당 필드에 append
  const [isRecording, setIsRecording]   = useState(false);
  const [recordSec,   setRecordSec]     = useState(0);
  const [soap,        setSoap]          = useState<SoapDraft>(EMPTY_SOAP);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamIdx   = useRef(0);

  const stopRecording = () => {
    if (recordTimer.current) { clearInterval(recordTimer.current); recordTimer.current = null; }
    if (streamTimer.current) { clearInterval(streamTimer.current); streamTimer.current = null; }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      showToast("녹음을 중지했습니다");
      return;
    }
    // 새 녹음 시작 — 이전 SOAP 초기화
    setIsRecording(true);
    setRecordSec(0);
    setSoap(EMPTY_SOAP);
    streamIdx.current = 0;
    recordTimer.current = setInterval(() => setRecordSec(s => s + 1), 1000);
    streamTimer.current = setInterval(() => {
      const i = streamIdx.current;
      if (i >= SOAP_STREAM_CHUNKS.length) {
        if (streamTimer.current) { clearInterval(streamTimer.current); streamTimer.current = null; }
        return;
      }
      const chunk = SOAP_STREAM_CHUNKS[i];
      streamIdx.current = i + 1;
      setSoap(prev => ({ ...prev, [chunk.field]: prev[chunk.field] + chunk.text }));
    }, 1500);
    showToast("녹음을 시작했습니다 — 진료 음성을 STT로 받아 SOAP을 자동 작성합니다");
  };

  // 컴포넌트 unmount 시 정리
  useEffect(() => () => stopRecording(), []);

  // AI SOAP을 증상란에 붙여넣기 — "S. ..." 형식으로 라벨 인라인 결합
  const pasteSoapToSymptom = () => {
    const lines: string[] = [];
    if (soap.S.trim()) lines.push(`S. ${soap.S.trim()}`);
    if (soap.O.trim()) lines.push(`O. ${soap.O.trim()}`);
    if (soap.A.trim()) lines.push(`A. ${soap.A.trim()}`);
    if (soap.P.trim()) lines.push(`P. ${soap.P.trim()}`);
    if (lines.length === 0) {
      showToast("아직 작성된 SOAP이 없습니다");
      return;
    }
    const formatted = lines.join("\n\n");
    setTodaySymptom(prev => prev ? `${prev}\n\n${formatted}` : formatted);
    showToast("AI SOAP을 증상란에 추가했습니다");
  };
  const [toast,   setToast]   = useState<string | null>(null);
  const [showLabViewer, setShowLabViewer] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const clearNew = () => {
    setTimeout(() => {
      setTodayDx(prev => prev.map(d => ({ ...d, isNew: false })));
      setTodayRx(prev => prev.map(r => ({ ...r, isNew: false })));
    }, 3000);
  };

  const repeatDx = (items: HistoryDx[]) => {
    const existing = new Set(todayDx.map(d => d.code));
    const toAdd = items.filter(d => !existing.has(d.code));
    if (toAdd.length === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    setTodayDx(prev => [...prev, ...toAdd.map(d => ({ ...d, isNew: true }))]);
    showToast(`진단 ${toAdd.length}건 추가됨`);
    clearNew();
  };

  const repeatRx = (items: HistoryRx[]) => {
    const existing = new Set(todayRx.map(r => r.name));
    const toAdd = items.filter(r => !existing.has(r.name));
    if (toAdd.length === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    setTodayRx(prev => [...prev, ...toAdd.map(toTodayRx)]);
    showToast(`처방 ${toAdd.length}건 추가됨`);
    clearNew();
  };

  const addSymptom = (text: string) => {
    if (!text.trim()) return;
    setTodaySymptom(prev => prev ? `${prev}\n${text}` : text);
    showToast("증상 추가됨");
  };

  const repeatAll = (dxItems: HistoryDx[], rxItems: HistoryRx[]) => {
    const exDx = new Set(todayDx.map(d => d.code));
    const exRx = new Set(todayRx.map(r => r.name));
    const addDx = dxItems.filter(d => !exDx.has(d.code));
    const addRx = rxItems.filter(r => !exRx.has(r.name));
    const total = addDx.length + addRx.length;
    if (total === 0) { showToast("이미 모두 오늘 차트에 있습니다"); return; }
    if (addDx.length > 0) setTodayDx(prev => [...prev, ...addDx.map(d => ({ ...d, isNew: true }))]);
    if (addRx.length > 0) setTodayRx(prev => [...prev, ...addRx.map(toTodayRx)]);
    showToast(`${total}건 오늘 차트에 추가됨`);
    clearNew();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-subtle)]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <LNB active={lnbActive} onChange={setLnbActive} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar는 진료실 등 차트 메뉴에서만 노출. 대시보드는 LNB만 노출. */}
        {lnbActive !== "대시보드" && (
          <TopBar
            onOpenLabViewer={() => setShowLabViewer(true)}
            onOpenReport={openReport}
            isRecording={isRecording}
            recordSec={recordSec}
            onToggleRecording={toggleRecording}
            layout={layout}
            onChangeLayout={setLayout}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          {lnbActive === "대시보드" ? (
            <DashboardScreen />
          ) : (
          <>
          {/* Main Area — 리사이저블 레이아웃 */}
          <div className="flex flex-1 overflow-hidden bg-[var(--bg-neutral)] relative">
            <PanelGroup direction="horizontal" className="flex-1">
              {/* LEFT: A(붙박이) + B + C — id로 펼쳐보기 portal 타깃 */}
              <Panel defaultSize={38} minSize={26} className="!overflow-visible">
                <div id="emr-left-panels" className="relative flex h-full overflow-hidden">
                  <PanelA />
                  {layout === 1 ? (
                    /* Layout 1: B 세로 스택 | C 내원이력 */
                    <PanelGroup direction="horizontal" className="flex-1">
                      <Panel defaultSize={45} minSize={28}>
                        <div className="py-1 pl-1 h-full">
                          <PanelB clinicalNote={todayClinicalNote} onChangeClinicalNote={setTodayClinicalNote} />
                        </div>
                      </Panel>
                      <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                      <Panel defaultSize={55} minSize={32}>
                        <div className="py-1 h-full">
                          <PanelC
                            onRepeatDx={repeatDx}
                            onRepeatRx={repeatRx}
                            onRepeatAll={repeatAll}
                            onAddSymptom={addSymptom}
                          />
                        </div>
                      </Panel>
                    </PanelGroup>
                  ) : (
                    /* Layout 2 (개선):
                         1) 환자정보 — 가로 전체폭 (최근 바이탈 컴팩트 인라인 포함)
                         2) AI 요약 | 임상메모 — 좌우 분할 (임상메모는 환자 누적 메모)
                         3) 내원이력 — 가로 전체폭 아래
                       모두 splitter로 조절 가능
                       wrapper는 py-1 + pl-1만 (오른쪽 패딩 제거) — PanelD 사이 간격을 D-E 사이와 동일하게 8px로 맞춤 */
                    <div className="flex-1 py-1 pl-1 min-w-0 min-h-0 overflow-hidden">
                      <PanelGroup direction="vertical" className="w-full h-full">
                        {/* 1단: 환자정보 (전체폭) — 푸터에 최근 바이탈 1줄 컴팩트 노출 */}
                        <Panel defaultSize={20} minSize={14}>
                          <PatientInfoCard />
                        </Panel>
                        <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                        {/* 2단: AI 요약 | 임상메모 (좌우) */}
                        <Panel defaultSize={20} minSize={12}>
                          <PanelGroup direction="horizontal">
                            <Panel defaultSize={40} minSize={25}>
                              <div className="h-full pr-0.5 pt-0.5"><AISummaryCard /></div>
                            </Panel>
                            <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                            <Panel defaultSize={60} minSize={35}>
                              <div className="h-full pl-0.5 pt-0.5">
                                <ClinicalNoteCard clinicalNote={todayClinicalNote} onChangeClinicalNote={setTodayClinicalNote} />
                              </div>
                            </Panel>
                          </PanelGroup>
                        </Panel>
                        <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
                        {/* 3단: 내원이력 (전체폭) */}
                        <Panel defaultSize={60} minSize={28}>
                          <div className="h-full pt-0.5">
                            <PanelC
                              onRepeatDx={repeatDx}
                              onRepeatRx={repeatRx}
                              onRepeatAll={repeatAll}
                              onAddSymptom={addSymptom}
                            />
                          </div>
                        </Panel>
                      </PanelGroup>
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* D: 오늘의 차트 — 채도 낮은 얇은 outline 으로 영역만 시사 (강조 X) */}
              <Panel defaultSize={42} minSize={26}>
                <div className="p-1 h-full">
                  <div className="h-full rounded-md overflow-hidden shadow-sm"
                    style={{ border: "1px solid var(--blue-200)" }}>
                    <PanelD
                      diagnoses={todayDx}
                      prescriptions={todayRx}
                      symptom={todaySymptom}
                      onChangeSymptom={setTodaySymptom}
                      isRecording={isRecording}
                      soap={soap}
                      onPasteSoap={pasteSoapToSymptom}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

              {/* E: 도구모음 (세트처방 + 빠른메뉴) */}
              <Panel defaultSize={20} minSize={12}>
                <div className="py-1 pr-1 h-full"><PanelE /></div>
              </Panel>
            </PanelGroup>
          </div>
          </>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[var(--bg-inverse)] text-white px-4 py-2.5 rounded-xl shadow-2xl pointer-events-none select-none">
          <span className="text-[var(--green-500)] text-xl">↩</span>
          <span className="text-md font-medium">{toast}</span>
        </div>
      )}

      {/* 검사결과 뷰어 — 전체 화면 오버레이 */}
      {showLabViewer && (
        <div className="fixed inset-0 z-[9990] bg-white">
          <LabViewer onClose={() => setShowLabViewer(false)} />
        </div>
      )}

      {/* AI 어시스턴트 패널 */}
      {showAI && (
        <AIAssistant
          onClose={() => setShowAI(false)}
        />
      )}

      {/* AI 플로팅 버튼 */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 z-[9994] w-[52px] h-[52px] bg-[var(--brand-primary-hover)] rounded-[24px] flex items-center justify-center shadow-lg hover:bg-[var(--brand-primary-pressed)] hover:scale-105 active:scale-95 transition-all duration-150"
          title="AI 어시스턴트 열기 (⌘K)"
        >
          <span className="text-white text-[18px] font-bold leading-none">✦</span>
        </button>
      )}

      {/* 오늘의 리포트 모달 — 진료실에서만 노출 */}
      {lnbActive === "진료" && showReport && (
        <EndOfDayReport onClose={closeReport} />
      )}
      {/* 하단 플로팅 "오늘 내원 현황" 버튼 제거 — 상단 TopBar 의 동일 액션 버튼만 유지 */}
    </div>
  );
}