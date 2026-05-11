// 오늘의 진료 리포트 — 진료실 마감 시점 모달
// 진료한 명세서를 자동 검토해 매출 / 매출 기회 / 실사 위험 / 환자 액션 4축으로 요약.
// 닫으면 진료실 우하단에 "다시 보기" 플로팅 버튼이 노출된다.
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
const TODAY_LABEL = "2026년 5월 7일 목요일";
const TODAY_PATIENT_COUNT = 32;
const LAST_CHART_TIME = "18:24";

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
  title, subtitle, accent, onHide, children,
}: {
  title: string;
  subtitle?: string;
  accent: string;            // 좌측 색상 띠
  onHide: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--line-default)] flex flex-col overflow-hidden">
      <div className="flex items-start gap-3 px-5 pt-4 pb-3 border-b border-[var(--line-subtle)]">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: accent }} />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[var(--text-main)]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onHide}
          title="이 카드 숨기기"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-sub)] flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path fill="currentColor" d="M11.5 1.5h-3l-.5 2.1a6.5 6.5 0 0 0-1.6.7L4.6 3.1 2.5 5.2 3.7 7a6.5 6.5 0 0 0-.7 1.6L1 9.1v3l2 .5c.2.6.4 1.1.7 1.6L2.5 16l2 2 1.8-1.2c.5.3 1 .5 1.6.7l.5 2h3l.5-2c.6-.2 1.1-.4 1.6-.7l1.8 1.2 2-2-1.2-1.8c.3-.5.5-1 .7-1.6l2-.5v-3l-2-.5a6.5 6.5 0 0 0-.7-1.6l1.2-1.8-2-2-1.8 1.2a6.5 6.5 0 0 0-1.6-.7l-.5-2zM10 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </button>
      </div>
      <div className="px-5 py-4 flex-1">{children}</div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 1 — 매출 (Revenue)
// ╚══════════════════════════════════════════════════════════════════════════════
function HourlyLine({ data, onAction }: {
  data: { h: string; v: number }[];
  onAction: (msg: string) => void;
}) {
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
        {/* vector-effect로 stroke가 viewBox 스트레치에 따라 얇아지지 않게 한다 */}
        <path d={path} stroke="var(--brand-primary)" strokeWidth="2.5" fill="none"
          vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="3" fill="white" stroke="var(--brand-primary)" strokeWidth="2"
              vectorEffect="non-scaling-stroke" />
            {/* 호버 영역 */}
            <rect x={p[0] - dx / 2} y="0" width={dx} height={h} fill="transparent"
              onMouseEnter={() => onAction(`${data[i].h}시 매출 ${KRW(data[i].v)}`)}
              style={{ cursor: "default" }} />
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] px-2">
        {data.map((d, i) => <span key={i}>{d.h}</span>)}
      </div>
    </div>
  );
}

function RevenueCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  const total = REVENUE.byKind.공단부담 + REVENUE.byKind.본인부담 + REVENUE.byKind.비급여;
  const seg = (v: number) => Math.round((v / total) * 100);
  // 공단부담 + 본인부담 = 급여 매출. 비급여는 별도.
  const segments: { label: keyof typeof REVENUE.byKind; pct: number; clr: string; group: "급여" | "비급여" }[] = [
    { label: "공단부담", pct: seg(REVENUE.byKind.공단부담), clr: "var(--brand-primary)", group: "급여"   },
    { label: "본인부담", pct: seg(REVENUE.byKind.본인부담), clr: "var(--blue-200)",       group: "급여"   },
    { label: "비급여",   pct: seg(REVENUE.byKind.비급여),   clr: "var(--orange-500)",     group: "비급여" },
  ];
  const insRevenue    = REVENUE.byKind.공단부담 + REVENUE.byKind.본인부담;
  const nonInsRevenue = REVENUE.byKind.비급여;
  const insPct = Math.round((insRevenue / total) * 100);
  return (
    <CardShell
      title="매출"
      subtitle="오늘 발생한 모든 청구·수납 합계"
      accent="var(--brand-primary)"
      onHide={onHide}
    >
      {/* 큰 숫자 */}
      <button
        onClick={() => onAction("청구 메뉴로 이동")}
        className="text-left w-full mb-3 group"
      >
        <p className="text-[28px] font-bold text-[var(--text-main)] leading-tight group-hover:text-[var(--brand-primary)] transition-colors">
          {KRW(REVENUE.total)}
        </p>
        <div className="flex items-center gap-3 mt-1 text-[12px]">
          <span className="font-medium text-[var(--green-500)]">+{REVENUE.vsYesterdayPct}% 어제 대비</span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <span className="font-medium text-[var(--green-500)]">+{REVENUE.vsWeekAvgPct}% 주 평균 대비</span>
        </div>
      </button>

      {/* 매출 구성 — 급여(공단부담+본인부담) / 비급여 그룹으로 표시 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">매출 구성 · 급여 {insPct}% / 비급여 {100 - insPct}%</span>
          <span className="text-[11px] text-[var(--text-tertiary)]">1인당 평균 {KRW(REVENUE.perPatientAvg)}</span>
        </div>
        {/* 스택 막대 — 급여 두 칸이 인접해 그룹처럼 보이고, 비급여는 시각적으로 분리 */}
        <div className="flex h-3 rounded-md overflow-hidden">
          {segments.map(s => (
            <div key={s.label} style={{ width: `${s.pct}%`, background: s.clr }} title={`${s.label} ${s.pct}% (${KRW(REVENUE.byKind[s.label])})`} />
          ))}
        </div>
        {/* 범례 — "급여 = 공단부담 + 본인부담" 관계가 한눈에 보이게 그룹화 */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="flex flex-col gap-1 p-2 rounded-md bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)]">급여</span>
              <span className="text-[11px] font-bold text-[var(--text-main)]">{KRW(insRevenue)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "var(--brand-primary)" }} />
              <span className="text-[10px] text-[var(--text-sub)] flex-1">공단부담</span>
              <span className="text-[10px] font-medium text-[var(--text-main)]">{KRW(REVENUE.byKind.공단부담)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "var(--blue-200)" }} />
              <span className="text-[10px] text-[var(--text-sub)] flex-1">본인부담</span>
              <span className="text-[10px] font-medium text-[var(--text-main)]">{KRW(REVENUE.byKind.본인부담)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-2 rounded-md bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)]">비급여</span>
              <span className="text-[11px] font-bold text-[var(--text-main)]">{KRW(nonInsRevenue)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: "var(--orange-500)" }} />
              <span className="text-[10px] text-[var(--text-sub)] flex-1">환자 전액 부담</span>
              <span className="text-[10px] font-medium text-[var(--text-main)]">{KRW(REVENUE.byKind.비급여)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 시간대별 라인 */}
      <div>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1">시간대별 매출 (포인트 호버)</p>
        <HourlyLine data={REVENUE.hourly} onAction={onAction} />
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 2 — 매출 기회 (Missed Revenue)
// ╚══════════════════════════════════════════════════════════════════════════════
function MissedRevenueCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell
      title="매출 기회"
      subtitle="오늘 진료에서 산정 가능했지만 놓친 매출"
      accent="var(--green-500)"
      onHide={onHide}
    >
      {/* 큰 숫자 */}
      <div className="mb-3">
        <p className="text-[28px] font-bold text-[var(--green-500)] leading-tight">{KRW(MISSED_TOTAL)}</p>
        <p className="text-[12px] text-[var(--text-sub)] mt-0.5">
          <span className="font-bold">{MISSED_ITEMS.length}건</span> 발견 · 회수 가능 금액
        </p>
      </div>

      {/* 항목 리스트 */}
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {MISSED_ITEMS.map(item => (
          <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--green-050)] text-[var(--green-700)]">
                    {item.category}
                  </span>
                  <span className="text-[13px] font-bold text-[var(--text-main)]">{item.patient}</span>
                </div>
                <p className="text-[12px] text-[var(--text-sub)] leading-relaxed">{item.reason}</p>
              </div>
              <span className="text-[13px] font-bold text-[var(--green-500)] flex-shrink-0">{KRW(item.amount)}</span>
            </div>
            {/* CTA — 우하단 정렬, secondary(SMS) 먼저 → primary(차트 수정) 가장 우측 */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => onAction(`${item.patient}에게 안내 SMS를 발송했습니다`)}
                className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >환자 SMS</button>
              <button
                onClick={() => onAction(`${item.patient} 차트 수정 화면으로 이동`)}
                className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                style={{ background: "var(--green-500)" }}
              >차트 수정</button>
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
  const counts = RISK_ITEMS.reduce<Record<RiskLevel, number>>(
    (acc, r) => ({ ...acc, [r.level]: (acc[r.level] ?? 0) + 1 }),
    { High: 0, Mid: 0, Low: 0 }
  );
  return (
    <CardShell
      title="실사 위험"
      subtitle="3축 룰(Missing·Duplicate·Mismatch) 자동 검토 결과"
      accent="var(--orange-500)"
      onHide={onHide}
    >
      {/* 큰 숫자 + 위험도 분포 */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <p className="text-[28px] font-bold text-[var(--orange-500)] leading-tight">{RISK_ITEMS.length}건</p>
          <p className="text-[12px] text-[var(--text-sub)]">
            <span className="font-bold text-[var(--red-500)]">High {counts.High}</span>
            <span className="text-[var(--text-tertiary)] mx-1">·</span>
            <span className="font-bold text-[var(--orange-500)]">Mid {counts.Mid}</span>
            {counts.Low > 0 && <>
              <span className="text-[var(--text-tertiary)] mx-1">·</span>
              <span className="font-bold text-[var(--text-sub)]">Low {counts.Low}</span>
            </>}
          </p>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">청구 전 수정 권장</p>
      </div>

      {/* 항목 리스트 */}
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {RISK_ITEMS.map(item => {
          const tone    = RISK_TONE[item.level];
          const tagTone = RISK_TAG_TONE[item.tag];
          return (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {/* chip 스타일 — solid 버튼과 시각 구별 */}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: tagTone.fg, background: tagTone.bg }}>
                      {item.tag}
                    </span>
                    <span className="text-[13px] font-bold text-[var(--text-main)]">{item.patient}</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-sub)] leading-relaxed">{item.detail}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ color: tone.fg, background: tone.bg }}>
                  {item.level}
                </span>
              </div>
              {/* CTA — 우하단 정렬, secondary 먼저 → primary 가장 우측 */}
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => onAction(`${item.tag} 자동 수정 미리보기:\n${item.patient} — ${item.detail}\n\n시스템이 제안한 수정안을 차트에 적용하시겠습니까?`)}
                  className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >자동 수정 제안</button>
                <button
                  onClick={() => onAction(`${item.patient} 차트로 이동`)}
                  className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                  style={{ background: "var(--orange-500)" }}
                >차트 열기</button>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카드 4 — 환자 액션 (Patient Action)
// ╚══════════════════════════════════════════════════════════════════════════════
function PatientActionCard({ onHide, onAction }: { onHide: () => void; onAction: (msg: string) => void }) {
  return (
    <CardShell
      title="환자 액션"
      subtitle="오늘 진료 결과 기반 후속 조치"
      accent="var(--brand-primary)"
      onHide={onHide}
    >
      <div className="flex flex-col divide-y divide-[var(--line-subtle)]">
        {PATIENT_ACTIONS.map(item => {
          const tone = ACTION_TYPE_CLR[item.type];
          return (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: tone.fg, background: tone.bg }}>
                  {item.type}
                </span>
                <span className="text-[13px] font-bold text-[var(--text-main)] flex-1 min-w-0 truncate">{item.title}</span>
                {item.meta && <span className="text-[12px] font-medium text-[var(--text-sub)] flex-shrink-0">{item.meta}</span>}
              </div>
              <p className="text-[12px] text-[var(--text-sub)] leading-relaxed mb-1.5">{item.detail}</p>
              {/* CTA — 우하단 정렬, secondary 먼저 → primary 가장 우측 */}
              <div className="flex items-center gap-1.5 justify-end">
                {item.type === "미수" && (
                  <>
                    <button onClick={() => onAction("미수 환자 리스트로 이동")}
                      className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">리스트</button>
                    <button onClick={() => onAction("미수 환자 3명에게 일괄 SMS 발송됨")}
                      className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                      style={{ background: "var(--brand-primary)" }}>일괄 SMS</button>
                  </>
                )}
                {item.type === "후속콜" && (
                  <>
                    <button onClick={() => onAction("정현우님 차트로 이동")}
                      className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">차트 열기</button>
                    <button onClick={() => onAction("정현우님에게 콜 발송 기록")}
                      className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                      style={{ background: "var(--brand-primary)" }}>콜 기록</button>
                  </>
                )}
                {item.type === "예약권유" && (
                  <button onClick={() => onAction("만성질환자 2명에게 예약 안내 SMS 발송")}
                    className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                    style={{ background: "var(--brand-primary)" }}>예약 SMS</button>
                )}
              </div>
            </div>
          );
        })}
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
      accent="var(--blue-700)"
      onHide={onHide}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 시간대별 진료 분포 */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[12px] font-medium text-[var(--text-tertiary)]">시간대별 진료 환자</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">총 {TODAY_PATIENT_COUNT}명</p>
          </div>
          <div className="flex justify-between gap-1 h-28">
            {HOURLY_PATIENTS.map((p, i) => (
              <button
                key={i}
                onClick={() => onAction(`${p.h}시 진료 ${p.c}명`)}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${p.h}시 ${p.c}명`}
              >
                <span className="text-[10px] font-medium text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity h-3 leading-none">
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
                <span className="text-[10px] text-[var(--text-tertiary)] leading-none">{p.h}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-tertiary)]">
            <span>피크 시간대 16시</span>
            <span>·</span>
            <span>점심 13시 가장 적음</span>
          </div>
        </div>

        {/* 급여/비급여 매출 비율 */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[12px] font-medium text-[var(--text-tertiary)]">급여 {insPct}% / 비급여 {100 - insPct}% 매출 비율</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">총 {KRW(total)}</p>
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
                {s.pct >= 12 && <span className="text-[10px] font-bold text-white">{s.pct}%</span>}
              </div>
            ))}
          </div>
          {/* 범례 — 급여 묶음 / 비급여 묶음으로 구조 표시 */}
          <div className="flex flex-col gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wide">급여</span>
                <span className="text-[12px] font-bold text-[var(--text-main)]">{KRW(insRevenue)}</span>
              </div>
              {segments.filter(s => s.group === "급여").map(s => (
                <div key={s.label} className="flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.clr }} />
                  <span className="text-[11px] text-[var(--text-sub)] flex-1">{s.label}</span>
                  <span className="text-[11px] font-medium text-[var(--text-main)]">{KRW(s.amount)}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wide">비급여</span>
                <span className="text-[12px] font-bold text-[var(--text-main)]">{KRW(nonInsRevenue)}</span>
              </div>
              {segments.filter(s => s.group === "비급여").map(s => (
                <div key={s.label} className="flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.clr }} />
                  <span className="text-[11px] text-[var(--text-sub)] flex-1">환자 전액 부담</span>
                  <span className="text-[11px] font-medium text-[var(--text-main)]">{KRW(s.amount)}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] w-8 text-right">{s.pct}%</span>
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
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const items = PRECHECK_SUMMARY;
  const pendingItems = items.filter(i => !appliedIds.has(i.id) && !skippedIds.has(i.id));

  const applyOne = (id: string) => {
    setAppliedIds(prev => { const n = new Set(prev); n.add(id); return n; });
    const item = items.find(i => i.id === id);
    if (item) onAction(`${item.patient} — "${item.masterTarget}" 반영 완료`);
  };
  const skipOne = (id: string) => {
    setSkippedIds(prev => { const n = new Set(prev); n.add(id); return n; });
  };
  const undoSkip = (id: string) => {
    setSkippedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
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
      subtitle="진료 중 수정한 결과를 기초자료에 반영 — 다음 진료부터 자동 적용됩니다"
      accent="var(--violet-500)"
      onHide={onHide}
    >
      {/* 헤더 — 카운트 + 일괄 반영 */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div>
          <p className="text-[22px] font-bold text-[var(--text-main)] leading-tight">
            {items.length}<span className="text-[14px] text-[var(--text-tertiary)] font-medium ml-1">건 점검·수정</span>
          </p>
          <p className="text-[12px] text-[var(--text-sub)] mt-0.5">
            <span className="font-bold text-[var(--green-500)]">{appliedIds.size}건 반영됨</span>
            <span className="text-[var(--text-tertiary)] mx-1">·</span>
            <span className="font-bold" style={{ color: pendingItems.length > 0 ? "var(--orange-500)" : "var(--text-tertiary)" }}>
              {pendingItems.length}건 대기
            </span>
            {skippedIds.size > 0 && (
              <>
                <span className="text-[var(--text-tertiary)] mx-1">·</span>
                <span className="text-[var(--text-tertiary)]">{skippedIds.size}건 건너뜀</span>
              </>
            )}
          </p>
        </div>
        <div className="flex-1" />
        <button onClick={applyAll}
          disabled={pendingItems.length === 0}
          className="h-9 px-4 text-[13px] font-bold rounded-md text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          style={{ background: "var(--brand-primary)" }}>
          ✓ 전체 일괄 반영 ({pendingItems.length})
        </button>
      </div>

      {/* 항목 리스트 */}
      <div className="rounded-lg border border-[var(--line-default)] overflow-hidden">
        {items.map((item, idx) => {
          const applied = appliedIds.has(item.id);
          const skipped = skippedIds.has(item.id);
          const tone    = PRECHECK_KIND_LABEL[item.kind];
          const isLast  = idx === items.length - 1;
          return (
            <div key={item.id}
              className={`px-4 py-3 ${!isLast ? "border-b border-[var(--line-subtle)]" : ""} ${
                applied ? "bg-[var(--status-success-bg-subtle)]/40" : skipped ? "bg-[var(--bg-subtle)] opacity-60" : "bg-white"
              }`}>
              <div className="flex items-start gap-3">
                {/* 좌측 칩 + 환자 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: tone.clr, background: tone.bg }}>
                      {tone.label}
                    </span>
                    <span className="text-[13px] font-bold text-[var(--text-main)]">{item.patient}</span>
                    {applied && (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded text-white"
                        style={{ background: "var(--green-500)" }}>
                        <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        기초자료 반영됨
                      </span>
                    )}
                    {skipped && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--line-default)] text-[var(--text-tertiary)]">
                        건너뜀
                      </span>
                    )}
                  </div>
                  {/* before → after */}
                  <p className="text-[12px] text-[var(--text-sub)] leading-relaxed">
                    <span className="text-[var(--text-tertiary)] line-through">{item.before}</span>
                    <span className="mx-1.5 text-[var(--text-tertiary)]">→</span>
                    <span className="font-medium text-[var(--text-main)]">{item.after}</span>
                  </p>
                  {/* 마스터 반영 대상 */}
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                    <span style={{ color: applied ? "var(--green-700)" : "var(--brand-primary)" }}>
                      ↳ {item.masterTarget}
                    </span>
                  </p>
                </div>

                {/* 액션 버튼 — 우측 정렬, primary가 가장 우측 */}
                <div className="flex items-center gap-1.5 flex-shrink-0 justify-end">
                  {!applied && !skipped && (
                    <>
                      <button onClick={() => skipOne(item.id)}
                        className="h-8 px-3 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)]">
                        건너뛰기
                      </button>
                      <button onClick={() => applyOne(item.id)}
                        className="h-8 px-3 text-[11px] font-bold rounded-md text-white shadow-sm hover:shadow-md"
                        style={{ background: "var(--brand-primary)" }}>
                        기초자료에 반영
                      </button>
                    </>
                  )}
                  {skipped && (
                    <button onClick={() => undoSkip(item.id)}
                      className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
                      되돌리기
                    </button>
                  )}
                  {applied && (
                    <button onClick={() => onAction(`${item.patient} — 차트로 이동해 점검 결과 확인`)}
                      className="h-8 px-3 text-[11px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
                      차트 확인
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 안내 */}
      {pendingItems.length === 0 && skippedIds.size === 0 && (
        <p className="mt-3 text-[12px] text-[var(--green-700)] flex items-center gap-1.5">
          <span>✓</span>
          모든 점검 결과가 기초자료에 반영되었습니다
        </p>
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
          <h3 className="text-[15px] font-bold text-[var(--text-main)]">위젯 표시 설정</h3>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-[16px]">✕</button>
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
                  <p className="text-[13px] font-bold text-[var(--text-main)]">{it.title}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{it.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--line-default)]">
          <button onClick={onClose}
            className="h-9 px-4 text-[13px] border border-[var(--line-default)] rounded-md bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button onClick={() => onSave(draft)}
            className="h-9 px-5 text-[13px] font-bold text-white rounded-md hover:opacity-90"
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
          className="w-6 h-6 flex items-center justify-center rounded-md text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white border border-transparent hover:border-[var(--line-default)] disabled:opacity-30 disabled:cursor-not-allowed">
          ↑
        </button>
        <button onClick={onMoveDown} disabled={isLast} title="아래로 이동"
          className="w-6 h-6 flex items-center justify-center rounded-md text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-white border border-transparent hover:border-[var(--line-default)] disabled:opacity-30 disabled:cursor-not-allowed">
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
        className="bg-[var(--bg-base)] rounded-2xl shadow-2xl w-[1080px] max-w-[96vw] max-h-[94vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── 영역 1. 헤더 ── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--line-default)] bg-white flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-[var(--text-main)]">오늘의 진료 리포트</h2>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
              {TODAY_LABEL} · 진료 환자 <b className="text-[var(--text-sub)]">{TODAY_PATIENT_COUNT}명</b> · 마지막 차트 {LAST_CHART_TIME}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onAction("리포트를 인쇄합니다")}
              className="h-8 px-3 text-[12px] font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]">
              🖨 인쇄
            </button>
            <button onClick={() => onAction("카카오톡 비즈메시지로 리포트가 발송됩니다")}
              className="h-8 px-3 text-[12px] font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]">
              💬 카톡 발송
            </button>
            <button onClick={onClose}
              className="h-8 w-8 text-[16px] text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded-md flex items-center justify-center">
              ✕
            </button>
          </div>
        </div>

        {/* ── 본문 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── 영역 2. 한 줄 요약 ── */}
          <div className="rounded-xl p-4 mb-5 border border-[var(--line-default)]"
            style={{ background: "linear-gradient(90deg, var(--bg-primary-subtle), white 80%)" }}>
            <p className="text-[13px] text-[var(--text-sub)] leading-relaxed">
              오늘 매출{" "}
              <b className="text-[15px] text-[var(--text-main)]">{KRW(REVENUE.total)}</b>
              {" "}<span className="text-[var(--green-500)] font-bold">(어제 대비 +{REVENUE.vsYesterdayPct}%)</span>
              {" · "}매출 기회 <b className="text-[var(--green-500)]">{MISSED_ITEMS.length}건</b>
              {" · "}실사 위험 <b className="text-[var(--orange-500)]">{RISK_ITEMS.length}건</b>
              {" · "}미수 발생 <b className="text-[var(--red-500)]">3건</b>
            </p>
          </div>

          {/* ── 영역 3. 카드 — 드래그하여 순서 변경 가능 / col-span에 따라 1열 또는 2열 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {visible.map((id, idx) => (
              <ReportCardWrapper
                key={id}
                span={WIDGET_SPAN[id]}
                isFirst={idx === 0}
                isLast={idx === visible.length - 1}
                onMoveUp={() => moveCard(id, -1)}
                onMoveDown={() => moveCard(id, +1)}
                onDragStart={handleDragStart(id)}
                onDragOver={handleDragOver(id)}
                onDrop={handleDrop(id)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                isDragOver={dragOverId === id}
                isDragging={dragId === id}
              >
                {renderWidget(id)}
              </ReportCardWrapper>
            ))}
          </div>

          {/* 모든 카드 숨겨졌을 때 안내 */}
          {hidden.size === ALL_REPORT_WIDGETS.length && (
            <div className="bg-white rounded-xl border border-dashed border-[var(--line-default)] py-10 text-center">
              <p className="text-[13px] text-[var(--text-sub)] mb-2">표시할 위젯이 없습니다</p>
              <button onClick={showAll}
                className="text-[12px] font-medium text-[var(--brand-primary)] hover:underline">
                숨겨진 위젯 다시 표시
              </button>
            </div>
          )}

          {/* 숨겨진 위젯 다시 표시 안내 */}
          {hidden.size > 0 && hidden.size < ALL_REPORT_WIDGETS.length && (
            <div className="mt-3 text-center">
              <button onClick={showAll}
                className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] hover:underline">
                숨겨진 위젯 표시 ({hidden.size})
              </button>
            </div>
          )}
        </div>

        {/* ── 영역 5. 하단 액션 ── */}
        <div className="flex items-center justify-between gap-2 px-6 py-3 border-t border-[var(--line-default)] bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onAction("주간 진료 리포트 화면으로 이동")}
              className="h-9 px-3 text-[12px] font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]">
              📊 주간 리포트 보기
            </button>
            <button onClick={() => setSettings(true)}
              className="h-9 px-3 text-[12px] font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]">
              ⚙ 위젯 설정
            </button>
          </div>
          <button onClick={onClose}
            className="h-9 px-5 text-[13px] font-bold rounded-md text-white hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}>
            확인
          </button>
        </div>
      </div>

      {/* 위젯 표시 설정 모달 (모달 위에 모달) */}
      {settings && (
        <WidgetSettingsModal
          hidden={hidden}
          onClose={() => setSettings(false)}
          onSave={next => { setHidden(next); setSettings(false); }}
        />
      )}
    </div>,
    document.body
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 플로팅 버튼 — 모달 닫힌 후 다시 보기
// ╚══════════════════════════════════════════════════════════════════════════════
export function EndOfDayReportFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="오늘의 리포트 다시 보기"
      className="fixed bottom-[80px] right-6 z-[9985] flex items-center gap-2 h-11 pl-3 pr-4 bg-white border border-[var(--line-default)] rounded-full shadow-lg hover:shadow-xl hover:border-[var(--brand-primary)] transition-all"
    >
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px]"
        style={{ background: "var(--brand-primary)" }}>📊</span>
      <span className="text-[12px] font-bold text-[var(--text-main)]">오늘의 리포트</span>
    </button>
  );
}
