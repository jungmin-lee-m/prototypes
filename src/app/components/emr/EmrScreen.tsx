// 진료실 메인 화면 (App.tsx에서 분리, 라우팅 적용)
import { useState, useRef } from "react";
import { LNB } from "./LNB";
import { TopBar } from "./TopBar";
import { PanelA } from "./PanelA";
import { PanelB } from "./PanelB";
import { PanelC } from "./PanelC";
import { PanelD } from "./PanelD";
import { PanelE } from "./PanelE";
import { INIT_QUICK_MENU, type QuickMenuItem, type QuickCategory } from "./PanelE";
import { LabViewer } from "./LabViewer";
import { AIAssistant } from "./AIAssistant";
import type { TodayDiagnosis, TodayPrescription, HistoryDx, HistoryRx } from "./chartTypes";

const INIT_DX: TodayDiagnosis[] = [
  { code: "J00",   name: "급성비인두염[코감기]",         isMain: true },
  { code: "J20.9", name: "상세불명의 급성 기관지염" },
  { code: "I10",   name: "본태성(원발성) 고혈압",         special: "V193" },
  { code: "E11.9", name: "제2형 당뇨병, 합병증 없음" },
];

const INIT_RX: TodayPrescription[] = [
  { code: "tnjam",  name: "트라젠타정 5mg",             dose: "1", freq: 1, days: 20, method: "경구",  claim: true,  pay: true,  price: 161245,
    isDur: true, durType: "prohibited", conflictCode: "gv022", durExtra: "가브스메트정 50/850mg" },
  { code: "gv022",  name: "가브스메트정 50/850mg",       dose: "1", freq: 1, days: 28, method: "경구",  claim: true,  pay: true,  price: 2000,
    isDur: true, durType: "prohibited", conflictCode: "tnjam",  durExtra: "트라젠타정 5mg" },
  { code: "zm003",  name: "접종",                        dose: "1", freq: 1, days: 1,  method: "근육",  claim: true,  pay: false, price: 3600 },
  { code: "000145", name: "물리치료",                    dose: "1", freq: 1, days: 1,  method: "—",     claim: true,  pay: true,  price: 3600 },
  { code: "000165", name: "푸르설타민주(마늘주사)",      dose: "1", freq: 1, days: 1,  method: "정맥",  claim: false, pay: true,  price: 1000 },
  { code: "A0015",  name: "텔미사르탄·암로디핀베실산염", dose: "1", freq: 1, days: 14, method: "경구",  exception: "90",  claim: true, pay: true, price: 2500 },
  { code: "aspirin100", name: "아스피린장용정 100mg",   dose: "1", freq: 1, days: 30, method: "경구",  claim: true,  pay: true,  price: 480,
    isDur: true, durType: "diagnosis", durExtra: "관상동맥질환 [I25.1]" },
  { code: "C0012",  name: "클로르페니라민말레산염·슈도에페드린", dose: "1", freq: 1, days: 5,  method: "경구",  claim: true,  pay: true,  price: 800 },
  { code: "B7502",  name: "비라토비캡슐 75mg",          dose: "1", freq: 1, days: 7,  method: "경구",  claim: true,  pay: true,  price: 3200 },
  { code: "L4400",  name: "레비라정 500mg",              dose: "2", freq: 2, days: 7,  method: "경구",  claim: true,  pay: true,  price: 1800 },
  { code: "cn000",  name: "클렌부테롤·아크라이드정(암브록솔염산염)", dose: "1", freq: 1, days: 5, method: "경구", claim: true, pay: false, price: 2500 },
  { code: "I10rx",  name: "본태성(원발성) 고혈압",       dose: "1", freq: 1, days: 28, method: "경구",  claim: true,  pay: true,  price: 1200 },
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

export function EmrScreen() {
  const [todayDx, setTodayDx] = useState<TodayDiagnosis[]>(INIT_DX);
  const [todayRx, setTodayRx] = useState<TodayPrescription[]>(INIT_RX);
  const [quickMenuItems, setQuickMenuItems] = useState<QuickMenuItem[]>(INIT_QUICK_MENU);
  const [toast,   setToast]   = useState<string | null>(null);
  const [showLabViewer, setShowLabViewer] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const addQuickMenu = (label: string, category: QuickCategory) => {
    setQuickMenuItems(prev => {
      // 동일 라벨 중복 방지(데모 재실행 시 누적 방지)
      if (prev.some(i => i.label === label)) return prev;
      return [...prev, { label, category, isNew: true }];
    });
    showToast(`빠른메뉴에 "${label}" 추가됨`);
    // 5초 후 NEW 표시 자동 해제
    setTimeout(() => {
      setQuickMenuItems(prev => prev.map(i => i.label === label ? { ...i, isNew: false } : i));
    }, 5000);
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F4F5]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <LNB />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onOpenLabViewer={() => setShowLabViewer(true)} />
        <div className="flex flex-1 overflow-hidden">
          {/* Main Area — 카드 레이아웃, 간격·둥근 모서리 */}
          <div className="flex flex-1 overflow-hidden bg-[#E8E9EE]">

            {/* ── LEFT GROUP: A + B + C (expanded overlay covers this area) ── */}
            <div id="emr-left-panels" className="relative flex flex-shrink-0 h-full overflow-hidden">
              {/* A: 붙박이 좌측 패널 */}
              <PanelA />
              {/* B + C: 카드형 패널 */}
              <div className="flex pt-1.5 pb-1.5 pl-1.5 gap-1.5 h-full">
                {/* B: 환자정보 + AI요약 + 바이탈 + 공유메모 */}
                <div className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-[#E8E9EE]">
                  <PanelB />
                </div>
                {/* C: 내원이력 */}
                <div className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <PanelC
                    onRepeatDx={repeatDx}
                    onRepeatRx={repeatRx}
                    onRepeatAll={repeatAll}
                  />
                </div>
              </div>
            </div>

            {/* ── D: 오늘의 차트 (flex-1) ── */}
            <div className="flex-1 min-w-0 p-1.5">
              <div className="h-full rounded-xl overflow-hidden shadow-sm"
                style={{ border: "2px solid #453EDC" }}>
                <PanelD
                  diagnoses={todayDx}
                  prescriptions={todayRx}
                />
              </div>
            </div>

            {/* E: 붙박이 우측 패널 */}
            <PanelE quickMenuItems={quickMenuItems} />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1E1F22] text-white px-4 py-2.5 rounded-xl shadow-2xl pointer-events-none select-none">
          <span className="text-[#4EAD0A] text-[15px]">↩</span>
          <span className="text-[12px] font-medium">{toast}</span>
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
          onAddQuickMenu={addQuickMenu}
        />
      )}

      {/* AI 플로팅 버튼 */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 z-[9994] w-[52px] h-[52px] bg-[#534ab7] rounded-[24px] flex items-center justify-center shadow-lg hover:bg-[#4338a8] hover:scale-105 active:scale-95 transition-all duration-150"
          title="AI 어시스턴트 열기 (⌘K)"
        >
          <span className="text-white text-[18px] font-bold leading-none">✦</span>
        </button>
      )}
    </div>
  );
}