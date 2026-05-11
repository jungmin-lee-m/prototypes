// 메인 대시보드 — "오늘의 Task" 중심 + 사용자 자유 구성
// 별도의 "내 위젯" 영역 없음. 모든 콘텐츠가 통일된 위젯이며 의사가 추가/제거/순서 변경 가능.
// 기본 구성: 개별환자 task → 일괄 처리 task → 이번주 진료 → 5월 누적
import { useState } from "react";

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 타입
// ╚══════════════════════════════════════════════════════════════════════════════
type TaskCategory = "매출 기회" | "실사 위험" | "환자 케어";

type RiskLevel = "High" | "Mid" | "Low";

type TaskMeta =
  | { kind: "money"; label: string; amount: number; tone?: "gain" | "loss" }
  | { kind: "risk"; level: RiskLevel }
  | { kind: "count"; label: string; value: number; unit?: string }
  | { kind: "text"; label: string; value: string };

type TaskAction = { label: string; variant: "primary" | "secondary" | "ghost"; onAction: string };

type TaskSize = "single" | "batch";

interface Task {
  id: string;
  category: TaskCategory;
  size: TaskSize;
  tag?: string;
  title: string;
  patient?: string;
  shortLine?: string;
  reason: string;
  meta: TaskMeta[];
  actions: TaskAction[];
}

// task 상태:
//   open  — 기본 (알림 노출)
//   muted — "알림 받지 않기" 클릭 → 향후 동일 패턴 알림 차단 (회색 처리)
type TaskStatus = "open" | "muted";

// ── 위젯 ID — 기본 4개 + 카탈로그 ───────────────────────────────────────────
type WidgetId =
  | "single-tasks"
  | "batch-tasks"
  | "weekly-report"
  | "monthly-report"
  // 카탈로그 위젯 (선택해서 추가)
  | "timeDistribution" | "payMix" | "rxTop5" | "dxTop5" | "labTop5"
  | "avgConsultTime" | "newVsReturn" | "unpaidTrend" | "checkupProgress"
  | "hourlyRevenue" | "avgRevenuePerPatient";

interface WidgetDef {
  id: WidgetId;
  title: string;
  subtitle?: string;
  desc: string;
}

const WIDGET_CATALOG: WidgetDef[] = [
  // 기본 — 처음에 추가되어 있음
  { id: "single-tasks",   title: "개별 환자 task",      subtitle: "환자 1명 단위 task",     desc: "환자 1명에 대한 task가 한 줄씩 모여 있습니다" },
  { id: "batch-tasks",    title: "일괄 처리 task",      subtitle: "다수 환자/차트를 한 번에", desc: "여러 명에게 일괄 적용하는 큰 task" },
  { id: "weekly-report",  title: "이번 주 진료 리포트",  subtitle: "5/5 ~ 5/7",             desc: "주간 매출·환자 수·실사·기회 처리율" },
  { id: "monthly-report", title: "5월 누적 리포트",     subtitle: "2026년 5월",            desc: "월간 매출·환자 수·신환·기회 회수" },
  // 카탈로그
  { id: "timeDistribution",     title: "오늘 시간대별 진료 분포",  desc: "1시간 단위 진료 건수 분포" },
  { id: "payMix",               title: "오늘 급여/비급여 매출 비율", desc: "급여·비급여 매출 비중" },
  { id: "rxTop5",               title: "처방 빈도 Top 5",         desc: "이번 달 가장 자주 처방한 약품" },
  { id: "dxTop5",               title: "진단명 Top 5",            desc: "이번 달 가장 빈번한 진단명" },
  { id: "labTop5",              title: "검사 항목 Top 5",         desc: "이번 달 가장 자주 시행한 검사" },
  { id: "avgConsultTime",       title: "평균 진료 시간 추이",       desc: "최근 30일 평균 진료 시간" },
  { id: "newVsReturn",          title: "신환/재진 비율",           desc: "이번 달 신환 vs 재진 비율" },
  { id: "unpaidTrend",          title: "미수 추이 (30일)",         desc: "최근 30일 미수금 추이" },
  { id: "checkupProgress",      title: "건강검진 진행률",          desc: "검진 자격자 중 수검 비율" },
  { id: "hourlyRevenue",        title: "시간대별 매출 분포",        desc: "오늘 시간대별 매출 분포" },
  { id: "avgRevenuePerPatient", title: "진료비 평균 (1인당)",      desc: "이번 달 1인당 평균 진료비" },
];

const widgetById = (id: WidgetId): WidgetDef => WIDGET_CATALOG.find(w => w.id === id)!;

// 기본 표시 순서 — 사용자 요청
const DEFAULT_WIDGETS: WidgetId[] = ["single-tasks", "batch-tasks", "weekly-report", "monthly-report"];

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 더미 데이터
// ╚══════════════════════════════════════════════════════════════════════════════
const DOCTOR_NAME = "김의사";
const TODAY_DATE = "2026년 5월 7일 목요일";
const TODAY_PATIENTS = 38;
const PATIENT_DELTA_VS_YESTERDAY = 4;

const INITIAL_TASKS: Task[] = [
  // ── 매출 기회 ───────────────────────────────────────────────
  { id: "rev-1", category: "매출 기회", size: "single", tag: "정기 검사",
    patient: "김민수님(F/56)", shortLine: "만성질환관리료 산정 시점 도래 · HbA1c 89일 전",
    title: "김민수님(F/56) — 만성질환관리료 산정 시점 도래",
    reason: "마지막 HbA1c 검사 89일 전, 산정 가능일 D-1",
    meta: [{ kind: "money", label: "예상 가산", amount: 14500, tone: "gain" }],
    actions: [
      { label: "SMS",       variant: "primary",   onAction: "김민수님에게 만성질환관리료 안내 SMS를 발송했습니다" },
      { label: "차트 열기", variant: "secondary", onAction: "김민수님 차트로 이동" },
    ],
  },
  { id: "rev-2", category: "매출 기회", size: "single", tag: "처방 주기",
    patient: "박영희님(M/62)", shortLine: "골다공증 처방 주기 도래 · BMD 8개월 미실시",
    title: "박영희님(M/62) — 골다공증 약 처방 주기 도래",
    reason: "알렌드론산 마지막 처방 30일 전, 정기 BMD 미실시 8개월",
    meta: [{ kind: "money", label: "예상 매출", amount: 28000, tone: "gain" }],
    actions: [
      { label: "SMS",       variant: "primary",   onAction: "박영희님에게 재처방 안내 SMS를 발송했습니다" },
      { label: "차트 열기", variant: "secondary", onAction: "박영희님 차트로 이동" },
    ],
  },
  { id: "rev-3", category: "매출 기회", size: "single", tag: "공단 검진",
    patient: "이정우님(M/45)", shortLine: "공단 일반건강검진 자격 보유, 안내 미발송",
    title: "이정우님(M/45) — 공단 일반건강검진 미수검",
    reason: "2026년 검진 자격 보유, 안내 미발송, 마지막 방문 42일 전",
    meta: [{ kind: "money", label: "예상 매출", amount: 45000, tone: "gain" }],
    actions: [{ label: "검진 안내 SMS", variant: "primary", onAction: "이정우님에게 검진 안내 SMS를 발송했습니다" }],
  },
  { id: "rev-4", category: "매출 기회", size: "batch", tag: "일괄 도래",
    title: "만성질환자 14명 — 분기 검사 시점 일괄 도래",
    reason: "당뇨/고혈압 환자 중 직전 검사 90일 경과 14명",
    meta: [
      { kind: "count", label: "환자",     value: 14, unit: "명" },
      { kind: "money", label: "예상 매출", amount: 175000, tone: "gain" },
    ],
    actions: [
      { label: "환자 리스트 보기", variant: "primary",   onAction: "만성질환자 14명 리스트를 표시합니다" },
      { label: "일괄 SMS 발송",    variant: "secondary", onAction: "14명에게 일괄 SMS를 발송했습니다" },
    ],
  },
  { id: "rev-5", category: "매출 기회", size: "batch", tag: "코드 미입력",
    title: "어제 진료 7건 — 만성질환관리료 미산정 차트",
    reason: "산정 조건 충족했으나 코드 입력 안 됨",
    meta: [
      { kind: "count", label: "차트",                 value: 7, unit: "건" },
      { kind: "money", label: "누적 손실(회수 가능)",  amount: 98000, tone: "loss" },
    ],
    actions: [{ label: "수정 차트 일괄 열기", variant: "primary", onAction: "7건의 어제 차트를 순차로 엽니다" }],
  },

  // ── 실사 위험 ───────────────────────────────────────────────
  { id: "risk-1", category: "실사 위험", size: "batch", tag: "Missing",
    title: "어제 진료 12명 중 진단명 누락 3건",
    reason: "처방 입력은 됐으나 진단명 코드 비어있음",
    meta: [{ kind: "risk", level: "High" }, { kind: "count", label: "차트", value: 3, unit: "건" }],
    actions: [{ label: "해당 차트 일괄 열기", variant: "primary", onAction: "3건의 진단명 누락 차트를 엽니다" }],
  },
  { id: "risk-2", category: "실사 위험", size: "single", tag: "Duplicate",
    patient: "윤지영님", shortLine: "동일 검사(CBC) 2회 청구 의심 · 시간 간격 30분",
    title: "5/5 윤지영님 — 동일 검사(CBC) 2회 청구 의심",
    reason: "같은 날 동일 코드 청구, 시간 간격 30분",
    meta: [{ kind: "risk", level: "Mid" }],
    actions: [
      { label: "차트 확인",      variant: "primary",   onAction: "윤지영님 5/5 차트로 이동" },
      { label: "자동 수정 제안", variant: "secondary", onAction: "중복 청구 자동 수정 제안을 표시합니다" },
    ],
  },
  { id: "risk-3", category: "실사 위험", size: "single", tag: "Mismatch",
    patient: "어제 처방 1건", shortLine: "보험코드↔처방코드 불일치 · 환자 보험변경",
    title: "어제 처방 1건 — 보험코드↔처방코드 불일치",
    reason: "환자 보험변경 발생, 처방 측 미반영",
    meta: [{ kind: "risk", level: "High" }],
    actions: [
      { label: "차트 열기",   variant: "primary",   onAction: "해당 차트로 이동" },
      { label: "자동 매칭",   variant: "secondary", onAction: "보험코드 자동 매칭을 적용했습니다" },
    ],
  },
  { id: "risk-4", category: "실사 위험", size: "batch", tag: "질가산",
    title: "질가산 등급 알림 — 현재 2등급, 1등급까지 5건 보완 필요",
    reason: "심평원 지표 중 만성질환관리·환자교육 항목 미달",
    meta: [
      { kind: "text", label: "현재 등급", value: "2등급" },
      { kind: "text", label: "목표",     value: "1등급 (+5건)" },
    ],
    actions: [{ label: "보완 가이드 보기", variant: "primary", onAction: "질가산 등급 보완 가이드를 표시합니다" }],
  },

  // ── 환자 케어 ───────────────────────────────────────────────
  { id: "care-1", category: "환자 케어", size: "batch", tag: "미수",
    title: "미수 30일 초과 환자 5명",
    reason: "5명 합계 ₩482,000, 가장 오래된 미수 47일 전",
    meta: [
      { kind: "count", label: "환자",   value: 5,      unit: "명" },
      { kind: "money", label: "미수금", amount: 482000, tone: "loss" },
    ],
    actions: [
      { label: "환자 리스트 보기", variant: "primary",   onAction: "미수 환자 5명 리스트를 표시합니다" },
      { label: "일괄 SMS",         variant: "secondary", onAction: "5명에게 미수 안내 SMS를 발송했습니다" },
    ],
  },
  { id: "care-2", category: "환자 케어", size: "batch", tag: "후속 콜",
    title: "부작용 우려 약 신규 처방 후 후속 콜 권장 2건",
    reason: "정현우님(메트포르민 신규 처방 7일 경과), 강수진님(NSAIDs 장기처방 14일 경과)",
    meta: [{ kind: "count", label: "환자", value: 2, unit: "명" }],
    actions: [
      { label: "환자 리스트", variant: "primary",   onAction: "후속 콜 권장 환자 리스트를 표시합니다" },
      { label: "콜 기록",     variant: "secondary", onAction: "콜 로그 화면을 엽니다" },
    ],
  },
  { id: "care-3", category: "환자 케어", size: "batch", tag: "No-show 위험",
    title: "다음 주 No-show 위험 환자 3명",
    reason: "과거 No-show 이력 2회 이상 + 다음 주 예약 보유",
    meta: [{ kind: "count", label: "환자", value: 3, unit: "명" }],
    actions: [{ label: "리마인더 SMS 발송", variant: "primary", onAction: "3명에게 예약 리마인더 SMS를 발송했습니다" }],
  },
];

// 주간/월간 리포트 더미
const WEEKLY_REPORT = {
  weekLabel: "5/5 ~ 5/7 (이번 주)",
  revenue: 8420000,
  revenueDeltaPct: 12,
  patientCount: 124,
  riskFound: 9,
  riskResolved: 7,
  opportunityRate: 68,
};
const MONTHLY_REPORT = {
  monthLabel: "2026년 5월",
  revenue: 23150000,
  revenueDeltaYoyPct: 18,
  patientCount: 412,
  riskResolved: 24,
  opportunityRecovered: 1340000,
  newPatients: 47,
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카테고리 / 위험도 토큰
// ╚══════════════════════════════════════════════════════════════════════════════
const CATEGORY_TOKENS: Record<TaskCategory, { bg: string; fg: string; chip: string; chipFg: string; border: string }> = {
  "매출 기회": { bg: "var(--status-success-bg-subtle)", fg: "var(--green-500)",     chip: "var(--green-050)",         chipFg: "var(--green-700)",    border: "var(--green-200)"  },
  "실사 위험": { bg: "var(--status-warning-bg-subtle)", fg: "var(--orange-500)",    chip: "var(--orange-050)",        chipFg: "var(--orange-700)",   border: "var(--orange-200)" },
  "환자 케어": { bg: "var(--bg-primary-subtle)",        fg: "var(--brand-primary)", chip: "var(--bg-primary-subtle)", chipFg: "var(--brand-primary)", border: "var(--blue-200)"   },
};
const RISK_TOKENS: Record<RiskLevel, { bg: string; fg: string }> = {
  High: { bg: "var(--status-error-bg-subtle)",   fg: "var(--red-500)"    },
  Mid:  { bg: "var(--status-warning-bg-subtle)", fg: "var(--orange-500)" },
  Low:  { bg: "var(--bg-subtle)",                fg: "var(--text-sub)"   },
};
const fmtKRW = (n: number) => `₩${n.toLocaleString()}`;

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 영역 1 — 인사 헤더
// ╚══════════════════════════════════════════════════════════════════════════════
function GreetingHeader({ onOpenWidgetSettings }: { onOpenWidgetSettings: () => void }) {
  const deltaSign = PATIENT_DELTA_VS_YESTERDAY >= 0 ? "+" : "";
  const deltaColor = PATIENT_DELTA_VS_YESTERDAY >= 0 ? "var(--green-500)" : "var(--red-500)";
  return (
    <div className="bg-white rounded-xl border border-[var(--line-default)] px-6 py-5 flex items-center gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-[20px] font-bold text-[var(--text-main)] mb-1">
          {DOCTOR_NAME} 원장님, 좋은 아침입니다
        </h1>
        <p className="text-[14px] text-[var(--text-sub)]">{TODAY_DATE}</p>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-right">
          <p className="text-[12px] text-[var(--text-tertiary)] mb-0.5">오늘 예약</p>
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-[24px] font-bold text-[var(--text-main)] leading-none">{TODAY_PATIENTS}</span>
            <span className="text-[14px] text-[var(--text-sub)]">명</span>
            <span className="text-[12px] font-medium" style={{ color: deltaColor }}>
              {deltaSign}{PATIENT_DELTA_VS_YESTERDAY} vs 어제
            </span>
          </div>
        </div>
        <button
          onClick={onOpenWidgetSettings}
          title="위젯 추가/제거"
          className="w-9 h-9 rounded-lg border border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-sub)] flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path fill="currentColor" d="M11.5 1.5h-3l-.5 2.1a6.5 6.5 0 0 0-1.6.7L4.6 3.1 2.5 5.2 3.7 7a6.5 6.5 0 0 0-.7 1.6L1 9.1v3l2 .5c.2.6.4 1.1.7 1.6L2.5 16l2 2 1.8-1.2c.5.3 1 .5 1.6.7l.5 2h3l.5-2c.6-.2 1.1-.4 1.6-.7l1.8 1.2 2-2-1.2-1.8c.3-.5.5-1 .7-1.6l2-.5v-3l-2-.5a6.5 6.5 0 0 0-.7-1.6l1.2-1.8-2-2-1.8 1.2a6.5 6.5 0 0 0-1.6-.7l-.5-2zM10 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공통 — TaskMetaPill
// ╚══════════════════════════════════════════════════════════════════════════════
function TaskMetaPill({ meta }: { meta: TaskMeta }) {
  if (meta.kind === "money") {
    const fg = meta.tone === "loss" ? "var(--red-500)" : "var(--green-500)";
    const bg = meta.tone === "loss" ? "var(--status-error-bg-subtle)" : "var(--status-success-bg-subtle)";
    return (
      <span className="inline-flex items-baseline gap-1 px-2 py-1 rounded-md text-[12px]" style={{ background: bg }}>
        <span className="text-[var(--text-tertiary)]">{meta.label}</span>
        <span className="font-bold" style={{ color: fg }}>{fmtKRW(meta.amount)}</span>
      </span>
    );
  }
  if (meta.kind === "risk") {
    const t = RISK_TOKENS[meta.level];
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-bold" style={{ background: t.bg, color: t.fg }}>
        위험도 {meta.level}
      </span>
    );
  }
  if (meta.kind === "count") {
    return (
      <span className="inline-flex items-baseline gap-1 px-2 py-1 rounded-md text-[12px] bg-[var(--bg-subtle)]">
        <span className="text-[var(--text-tertiary)]">{meta.label}</span>
        <span className="font-bold text-[var(--text-main)]">{meta.value.toLocaleString()}{meta.unit ?? ""}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-1 px-2 py-1 rounded-md text-[12px] bg-[var(--bg-subtle)]">
      <span className="text-[var(--text-tertiary)]">{meta.label}</span>
      <span className="font-medium text-[var(--text-main)]">{meta.value}</span>
    </span>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ Task 카드 — Batch (큰 카드) / Compact (한 줄)
// ╚══════════════════════════════════════════════════════════════════════════════
function BatchTaskCard({
  task, status, onMute, onAction,
}: {
  task: Task; status: TaskStatus;
  onMute: () => void; onAction: (msg: string) => void;
}) {
  const tokens = CATEGORY_TOKENS[task.category];
  const muted = status === "muted";
  const countMeta   = task.meta.find(m => m.kind === "count")  as Extract<TaskMeta, { kind: "count" }> | undefined;
  const moneyMetas  = task.meta.filter(m => m.kind === "money") as Extract<TaskMeta, { kind: "money" }>[];
  const otherMetas  = task.meta.filter(m => m.kind !== "money" && m.kind !== "count");
  return (
    <div
      className={`bg-white rounded-xl border-[1.5px] px-5 py-4 transition-all ${
        muted ? "opacity-50 grayscale-[0.3]" : "hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      }`}
      style={{ borderColor: muted ? "var(--line-default)" : tokens.border }}
    >
      <div className="flex items-start gap-3">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: tokens.fg }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: tokens.chip, color: tokens.chipFg }}>
              {task.category}
            </span>
            {task.tag && (
              <span className="text-[11px] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)]">{task.tag}</span>
            )}
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: tokens.fg }}>일괄</span>
          </div>
          <div className="flex items-baseline gap-3 mb-1.5">
            {countMeta && (
              <span className="text-[28px] font-bold leading-none flex-shrink-0" style={{ color: tokens.fg }}>
                {countMeta.value}
                <span className="text-[14px] text-[var(--text-sub)] font-medium ml-0.5">{countMeta.unit}</span>
              </span>
            )}
            <h3 className="text-[15px] font-bold text-[var(--text-main)] leading-snug flex-1 min-w-0">{task.title}</h3>
          </div>
          <p className="text-[12px] text-[var(--text-sub)] mb-3 leading-relaxed">
            <span className="text-[var(--text-tertiary)]">근거 · </span>{task.reason}
          </p>
          {(moneyMetas.length + otherMetas.length) > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {moneyMetas.map((m, i) => <TaskMetaPill key={`m${i}`} meta={m} />)}
              {otherMetas.map((m, i) => <TaskMetaPill key={`o${i}`} meta={m} />)}
            </div>
          )}
          {/* 액션 영역 — 좌측: 알림 받지 않기(작게, ghost), 우측: 핵심 액션(크게) */}
          <div className="flex items-center gap-2 pt-1">
            <button disabled={muted} onClick={onMute}
              title="앞으로 이 패턴의 알림을 받지 않습니다"
              className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] disabled:cursor-not-allowed disabled:opacity-40">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M11.5 11H4.5l1-2V7a2.5 2.5 0 0 1 2.5-2.5h.5M12 9V7a4 4 0 0 0-4-4h-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              알림 받지 않기
            </button>
            <div className="flex-1" />
            {/* 핵심 액션 — 우하단. secondary가 먼저, primary가 가장 우측 */}
            {task.actions.filter(a => a.variant !== "primary").map((a, i) => (
              <button key={`s${i}`} disabled={muted} onClick={() => onAction(a.onAction)}
                className="h-9 px-3 text-[13px] font-medium rounded-md bg-white border border-[var(--line-default)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40">
                {a.label}
              </button>
            ))}
            {task.actions.filter(a => a.variant === "primary").map((a, i) => (
              <button key={`p${i}`} disabled={muted} onClick={() => onAction(a.onAction)}
                className="h-10 px-5 text-[13px] font-bold text-white rounded-md shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: tokens.fg }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactTaskRow({
  task, status, isLast, onMute, onAction,
}: {
  task: Task; status: TaskStatus; isLast: boolean;
  onMute: () => void; onAction: (msg: string) => void;
}) {
  const tokens = CATEGORY_TOKENS[task.category];
  const muted = status === "muted";
  const primary = task.actions.find(a => a.variant === "primary");
  const secondary = task.actions.find(a => a.variant === "secondary");
  const headlineMeta = task.meta.find(m => m.kind === "money") ?? task.meta.find(m => m.kind === "risk");
  return (
    <div className={`flex items-center gap-2 px-4 py-2 transition-colors ${
      !isLast ? "border-b border-[var(--line-subtle)]" : ""
    } ${muted ? "opacity-40 bg-[var(--bg-subtle)]" : "hover:bg-[var(--bg-subtle)]"}`}>
      {/* 좌측: 알림 받지 않기(작게) */}
      <button disabled={muted} onClick={onMute} title="알림 받지 않기"
        className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-sub)] hover:bg-white rounded-md disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M11.5 11H4.5l1-2V7a2.5 2.5 0 0 1 2.5-2.5h.5M12 9V7a4 4 0 0 0-4-4h-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tokens.fg }} />
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: tokens.chip, color: tokens.chipFg }}>
        {task.tag ?? task.category}
      </span>
      <span className="text-[13px] font-bold text-[var(--text-main)] flex-shrink-0 truncate max-w-[180px]">
        {task.patient ?? task.title}
      </span>
      <span className="text-[12px] text-[var(--text-sub)] flex-1 min-w-0 truncate">
        {task.shortLine ?? task.reason}
      </span>
      {headlineMeta && <span className="flex-shrink-0"><TaskMetaPill meta={headlineMeta} /></span>}
      {/* 우측: 액션 — secondary 먼저, primary 우측 끝 */}
      {secondary && (
        <button disabled={muted} onClick={() => onAction(secondary.onAction)} title={secondary.label}
          className="h-7 px-2 text-[11px] text-[var(--text-sub)] rounded-md hover:bg-white border border-transparent hover:border-[var(--line-default)] disabled:cursor-not-allowed flex-shrink-0">
          {secondary.label}
        </button>
      )}
      {primary && (
        <button disabled={muted} onClick={() => onAction(primary.onAction)}
          className="h-7 px-2.5 text-[11px] font-medium text-white rounded-md disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0"
          style={{ background: tokens.fg }}>
          {primary.label}
        </button>
      )}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ Task 위젯 (single / batch)
// ╚══════════════════════════════════════════════════════════════════════════════
function SingleTasksBody({
  tasks, statuses, onMute, onAction,
}: {
  tasks: Task[]; statuses: Record<string, TaskStatus>;
  onMute: (id: string) => void; onAction: (msg: string) => void;
}) {
  const list = tasks.filter(t => t.size === "single");
  if (list.length === 0) {
    return <EmptyTasks message="개별 환자 task가 없습니다" />;
  }
  return (
    <div className="bg-white rounded-xl border border-[var(--line-default)] overflow-hidden">
      {list.map((t, i) => (
        <CompactTaskRow
          key={t.id}
          task={t}
          status={statuses[t.id] ?? "open"}
          isLast={i === list.length - 1}
          onMute={() => onMute(t.id)}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

function BatchTasksBody({
  tasks, statuses, onMute, onAction,
}: {
  tasks: Task[]; statuses: Record<string, TaskStatus>;
  onMute: (id: string) => void; onAction: (msg: string) => void;
}) {
  const list = tasks.filter(t => t.size === "batch");
  if (list.length === 0) {
    return <EmptyTasks message="일괄 task가 없습니다" />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {list.map(t => (
        <BatchTaskCard
          key={t.id}
          task={t}
          status={statuses[t.id] ?? "open"}
          onMute={() => onMute(t.id)}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

function EmptyTasks({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--line-default)] py-10 flex flex-col items-center gap-2">
      <span className="text-[28px]">🎉</span>
      <p className="text-[13px] font-medium text-[var(--text-main)]">{message}</p>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 리포트 위젯
// ╚══════════════════════════════════════════════════════════════════════════════
function ReportStat({ label, value, sub, tone = "neutral" }: {
  label: string; value: string; sub?: string; tone?: "neutral" | "gain" | "loss";
}) {
  const subColor = tone === "gain" ? "var(--green-500)" : tone === "loss" ? "var(--red-500)" : "var(--text-tertiary)";
  return (
    <div>
      <p className="text-[11px] text-[var(--text-tertiary)] mb-1">{label}</p>
      <p className="text-[20px] font-bold text-[var(--text-main)] leading-tight">{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: subColor }}>{sub}</p>}
    </div>
  );
}

function WeeklyReportBody({ onAction }: { onAction: (msg: string) => void }) {
  const w = WEEKLY_REPORT;
  const wDeltaSign = w.revenueDeltaPct >= 0 ? "+" : "";
  const riskRate = w.riskFound === 0 ? 0 : Math.round((w.riskResolved / w.riskFound) * 100);
  return (
    <button onClick={() => onAction("주간 상세 리포트로 이동")}
      className="w-full bg-white rounded-xl border border-[var(--line-default)] p-5 text-left hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ReportStat label="누적 매출" value={fmtKRW(w.revenue)}
          sub={`${wDeltaSign}${w.revenueDeltaPct}% 전주 동기 대비`}
          tone={w.revenueDeltaPct >= 0 ? "gain" : "loss"} />
        <ReportStat label="진료 환자" value={`${w.patientCount}명`} />
        <ReportStat label="실사 위험" value={`${w.riskResolved}/${w.riskFound}`} sub={`해결 ${riskRate}%`} />
        <ReportStat label="기회 처리율" value={`${w.opportunityRate}%`} sub="이번 주 발견 task 중" />
      </div>
    </button>
  );
}

function MonthlyReportBody({ onAction }: { onAction: (msg: string) => void }) {
  const m = MONTHLY_REPORT;
  const mDeltaSign = m.revenueDeltaYoyPct >= 0 ? "+" : "";
  return (
    <button onClick={() => onAction("월간 상세 리포트로 이동")}
      className="w-full bg-white rounded-xl border border-[var(--line-default)] p-5 text-left hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ReportStat label="월 누적 매출" value={fmtKRW(m.revenue)}
          sub={`${mDeltaSign}${m.revenueDeltaYoyPct}% 작년 동월 대비`}
          tone={m.revenueDeltaYoyPct >= 0 ? "gain" : "loss"} />
        <ReportStat label="진료 환자" value={`${m.patientCount}명`} />
        <ReportStat label="실사 위험 해결" value={`${m.riskResolved}건`} />
        <ReportStat label="기회 회수" value={fmtKRW(m.opportunityRecovered)} sub={`신환 ${m.newPatients}명`} />
      </div>
    </button>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 카탈로그 위젯 본문 — chart/data만
// ╚══════════════════════════════════════════════════════════════════════════════
function RankList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-5 text-[11px] font-bold text-[var(--text-tertiary)]">{i + 1}</span>
          <span className="flex-1 text-[13px] text-[var(--text-main)] truncate">{it.label}</span>
          <span className="text-[12px] font-bold text-[var(--text-sub)]">{it.value}</span>
        </li>
      ))}
    </ol>
  );
}
function BigStat({ value, sub, tone = "neutral", caption }: {
  value: string; sub?: string; tone?: "neutral" | "gain" | "loss"; caption?: string;
}) {
  const subColor = tone === "gain" ? "var(--green-500)" : tone === "loss" ? "var(--red-500)" : "var(--text-tertiary)";
  return (
    <div className="py-3">
      <p className="text-[28px] font-bold text-[var(--text-main)] leading-tight">{value}</p>
      {sub && <p className="text-[12px] mt-1" style={{ color: subColor }}>{sub}</p>}
      {caption && <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{caption}</p>}
    </div>
  );
}
function Sparkline({ values, stroke, fill }: { values: number[]; stroke: string; fill: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 240, h = 80;
  const dx = w / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * dx;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return [x, y] as const;
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillD = `${pathD} L${w},${h} L0,${h} Z`;
  return (
    <div className="py-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" preserveAspectRatio="none">
        <path d={fillD} fill={fill} />
        <path d={pathD} stroke={stroke} strokeWidth="2.5" fill="none"
          vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">최근 30일</p>
    </div>
  );
}

function CatalogWidgetBody({ id }: { id: WidgetId }) {
  // 작은 통계 위젯들 — 흰 카드로 감싸서 일관된 폭 유지
  const inner = (() => {
    switch (id) {
      case "timeDistribution": {
        const bars = [3, 5, 8, 12, 9, 4, 6, 10, 7, 5];
        const max = Math.max(...bars);
        const labels = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
        return (
          <div className="flex justify-between gap-1 h-28 px-1">
            {bars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end">
                  <div className="w-full rounded-t" style={{ height: `${(v / max) * 100}%`, background: "var(--brand-primary)" }} />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{labels[i]}</span>
              </div>
            ))}
          </div>
        );
      }
      case "payMix": {
        const ins = 68, nonIns = 32;
        return (
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center gap-2">
              <span className="w-12 text-[12px] text-[var(--text-sub)]">급여</span>
              <div className="flex-1 h-5 rounded bg-[var(--bg-subtle)] overflow-hidden">
                <div className="h-full" style={{ width: `${ins}%`, background: "var(--brand-primary)" }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold text-[var(--text-main)]">{ins}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-[12px] text-[var(--text-sub)]">비급여</span>
              <div className="flex-1 h-5 rounded bg-[var(--bg-subtle)] overflow-hidden">
                <div className="h-full" style={{ width: `${nonIns}%`, background: "var(--orange-500)" }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold text-[var(--text-main)]">{nonIns}%</span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-2">총 매출 ₩2,480,000</p>
          </div>
        );
      }
      case "rxTop5":
        return <RankList items={[
          { label: "메트포르민 500mg", value: "48회" },
          { label: "리피토 10mg",       value: "36회" },
          { label: "텔미사르탄 80mg",    value: "31회" },
          { label: "알렌드론산 70mg",    value: "19회" },
          { label: "오메프라졸 20mg",    value: "17회" },
        ]} />;
      case "dxTop5":
        return <RankList items={[
          { label: "본태성 고혈압 (I10)",     value: "86건" },
          { label: "제2형 당뇨 (E11)",       value: "54건" },
          { label: "만성위염 (K29.5)",       value: "28건" },
          { label: "골다공증 (M81)",         value: "22건" },
          { label: "급성 상기도감염 (J06.9)", value: "18건" },
        ]} />;
      case "labTop5":
        return <RankList items={[
          { label: "HbA1c",         value: "41회" },
          { label: "지질패널",      value: "38회" },
          { label: "CBC",           value: "30회" },
          { label: "간기능검사",    value: "22회" },
          { label: "갑상선기능검사", value: "14회" },
        ]} />;
      case "avgConsultTime":
        return <BigStat value="6.2분" sub="전월 대비 -0.3분" tone="gain" caption="최근 30일 평균" />;
      case "newVsReturn": {
        const ratio = 18;
        return (
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center gap-2">
              <span className="w-12 text-[12px] text-[var(--text-sub)]">신환</span>
              <div className="flex-1 h-5 rounded bg-[var(--bg-subtle)] overflow-hidden">
                <div className="h-full" style={{ width: `${ratio}%`, background: "var(--green-500)" }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold text-[var(--text-main)]">{ratio}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-[12px] text-[var(--text-sub)]">재진</span>
              <div className="flex-1 h-5 rounded bg-[var(--bg-subtle)] overflow-hidden">
                <div className="h-full" style={{ width: `${100 - ratio}%`, background: "var(--brand-primary)" }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold text-[var(--text-main)]">{100 - ratio}%</span>
            </div>
          </div>
        );
      }
      case "unpaidTrend":
        return <Sparkline values={[42, 45, 48, 46, 51, 49, 52, 55, 53, 58, 56, 60]}
          stroke="var(--red-500)" fill="var(--status-error-bg-subtle)" />;
      case "checkupProgress":
        return <BigStat value="62%" sub="자격 320명 중 199명 수검" caption="2026년 진행률" />;
      case "hourlyRevenue": {
        const bars = [120, 240, 380, 410, 280, 90, 220, 360, 290, 180];
        const max = Math.max(...bars);
        const labels = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
        return (
          <div className="flex justify-between gap-1 h-28 px-1">
            {bars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end">
                  <div className="w-full rounded-t" style={{ height: `${(v / max) * 100}%`, background: "var(--green-500)" }} />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{labels[i]}</span>
              </div>
            ))}
          </div>
        );
      }
      case "avgRevenuePerPatient":
        return <BigStat value="₩56,200" sub="전월 ₩54,100 → +3.9%" tone="gain" caption="이번 달 1인당" />;
      default:
        return null;
    }
  })();
  return <div className="bg-white rounded-xl border border-[var(--line-default)] p-5">{inner}</div>;
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 위젯 래퍼 — 헤더(타이틀 + 컨트롤) + body
// ╚══════════════════════════════════════════════════════════════════════════════
function WidgetWrapper({
  def, isFirst, isLast, onMoveUp, onMoveDown, onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  isDragOver, isDragging,
  children,
}: {
  def: WidgetDef;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  isDragging: boolean;
  children: React.ReactNode;
}) {
  return (
    // 전체 위젯이 draggable. 헤더에 cursor-grab을 줘서 헤더에서 잡으면 자연스럽게 드래그됨.
    // body 영역의 버튼들은 클릭으로 동작하고, 클릭+이동 시에만 드래그가 시작된다.
    <section
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`group relative transition-all ${isDragging ? "opacity-40" : ""}`}
    >
      {/* 드롭 인디케이터 — drag-over 상태일 때 위쪽에 라인 */}
      {isDragOver && (
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full pointer-events-none z-10"
          style={{ background: "var(--brand-primary)" }} />
      )}

      <div className="flex items-center gap-2 mb-2 px-1 cursor-grab active:cursor-grabbing select-none">
        {/* 드래그 핸들 — 시각적 어포던스. 실제 드래그는 section 전체에서 가능 */}
        <span
          title="드래그하여 위치 변경"
          className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
            <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
          </svg>
        </span>
        <h2 className="text-[16px] font-bold text-[var(--text-main)]">{def.title}</h2>
        {def.subtitle && <span className="text-[12px] text-[var(--text-tertiary)]">· {def.subtitle}</span>}
        <div className="flex-1" />
        {/* 컨트롤 — hover 시 노출. 드래그 못 쓰는 환경 대비 */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} title="위로 이동"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[12px] text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed">
            ↑
          </button>
          <button onClick={onMoveDown} disabled={isLast} title="아래로 이동"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[12px] text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed">
            ↓
          </button>
          <button onClick={onRemove} title="위젯 제거"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[12px] text-[var(--text-tertiary)] hover:bg-[var(--status-error-bg-subtle)] hover:text-[var(--red-500)]">
            ✕
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 위젯 카탈로그 모달 — add/remove 토글
// ╚══════════════════════════════════════════════════════════════════════════════
function WidgetCatalogModal({
  selected, onClose, onSave,
}: {
  selected: WidgetId[];
  onClose: () => void;
  onSave: (next: WidgetId[]) => void;
}) {
  const [draft, setDraft] = useState<Set<WidgetId>>(new Set(selected));
  const toggle = (id: WidgetId) => setDraft(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  // 저장 시 selected 순서 보존, draft에 새로 추가된 위젯은 끝에 추가
  const handleSave = () => {
    const kept = selected.filter(id => draft.has(id));
    const added = [...draft].filter(id => !selected.includes(id));
    onSave([...kept, ...added]);
  };
  // 그룹 분류
  const MAIN: WidgetId[]    = ["single-tasks", "batch-tasks", "weekly-report", "monthly-report"];
  const ANALYTICS = WIDGET_CATALOG.filter(w => !MAIN.includes(w.id));
  const mainDefs  = WIDGET_CATALOG.filter(w => MAIN.includes(w.id));

  const Section = ({ title, items }: { title: string; items: WidgetDef[] }) => (
    <div>
      <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map(w => {
          const checked = draft.has(w.id);
          return (
            <label key={w.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "border-[var(--brand-primary)] bg-[var(--bg-primary-subtle)]"
                  : "border-[var(--line-default)] bg-white hover:bg-[var(--bg-subtle)]"
              }`}
              onClick={() => toggle(w.id)}>
              <span className={`w-4 h-4 rounded-[3px] border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                checked ? "border-[var(--brand-primary)]" : "border-[var(--text-disabled)]"
              }`} style={checked ? { background: "var(--brand-primary)" } : {}}>
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[var(--text-main)]">{w.title}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{w.desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[680px] max-w-[92vw] max-h-[88vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line-default)]">
          <div>
            <h3 className="text-[16px] font-bold text-[var(--text-main)]">대시보드 위젯</h3>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">표시할 위젯을 선택하세요. 순서는 대시보드에서 위/아래 화살표로 변경할 수 있습니다.</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-[18px]">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          <Section title="기본 위젯" items={mainDefs} />
          <Section title="분석 위젯" items={ANALYTICS} />
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[var(--line-default)] bg-[var(--bg-base)]">
          <p className="text-[12px] text-[var(--text-tertiary)]">{draft.size}개 선택됨</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="h-9 px-4 text-[13px] border border-[var(--line-default)] rounded-md bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
              취소
            </button>
            <button onClick={handleSave}
              className="h-9 px-5 text-[13px] font-bold text-white rounded-md hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}>
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 토스트
// ╚══════════════════════════════════════════════════════════════════════════════
function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[var(--text-main)] text-white px-5 py-3 rounded-xl shadow-2xl text-[13px]">
      {msg}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 메인 컴포넌트
// ╚══════════════════════════════════════════════════════════════════════════════
export function DashboardScreen() {
  const [taskStatus,   setTaskStatus]   = useState<Record<string, TaskStatus>>({});
  const [widgets,      setWidgets]      = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [showCatalog,  setShowCatalog]  = useState(false);
  const [toastMsg,     setToastMsg]     = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(prev => (prev === msg ? null : prev)), 2400);
  };

  // 모든 task가 항상 노출됨. "알림 받지 않기"로만 회색 처리.
  const visibleTasks = INITIAL_TASKS;

  const handleMute = (id: string) => {
    setTaskStatus(prev => {
      const cur = prev[id] ?? "open";
      const next: TaskStatus = cur === "muted" ? "open" : "muted";
      showToast(next === "muted" ? "이 패턴의 알림을 받지 않습니다" : "알림을 다시 받습니다");
      return { ...prev, [id]: next };
    });
  };
  const handleAction = (msg: string) => showToast(msg);

  // 위젯 순서/제거
  const moveWidget = (id: WidgetId, dir: -1 | 1) => {
    setWidgets(prev => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const removeWidget = (id: WidgetId) => {
    setWidgets(prev => prev.filter(w => w !== id));
    showToast("위젯을 제거했습니다");
  };
  const saveWidgets = (next: WidgetId[]) => {
    setWidgets(next);
    setShowCatalog(false);
    showToast("대시보드 구성이 저장되었습니다");
  };

  // 드래그 앤 드롭 — 위젯 헤더로 잡고 다른 위젯 위에 드롭하면 그 자리로 삽입.
  // - section 전체가 draggable이라 어디서 잡든 드래그 가능
  // - onDragEnd로 드롭 실패(취소) 시에도 상태 정리
  const [dragId,     setDragId]     = useState<WidgetId | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetId | null>(null);
  const onDragStart = (id: WidgetId) => (e: React.DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    // dataTransfer payload — Firefox 등 일부 브라우저는 이 값이 비어있으면 dragstart를 무시함
    try { e.dataTransfer.setData("text/plain", id); } catch {}
  };
  const onDragOver = (id: WidgetId) => (e: React.DragEvent) => {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId && dragOverId !== id) setDragOverId(id);
  };
  const onDragLeave = () => {
    // 드래그가 위젯 밖으로 나가면 인디케이터 끔
    setDragOverId(null);
  };
  const onDragEnd = () => {
    // 드롭 성공/실패와 무관하게 상태 정리
    setDragId(null);
    setDragOverId(null);
  };
  const onDrop = (targetId: WidgetId) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === targetId) {
      setDragId(null); setDragOverId(null);
      return;
    }
    setWidgets(prev => {
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

  const renderWidgetBody = (id: WidgetId) => {
    switch (id) {
      case "single-tasks":
        return <SingleTasksBody tasks={visibleTasks} statuses={taskStatus}
          onMute={handleMute} onAction={handleAction} />;
      case "batch-tasks":
        return <BatchTasksBody tasks={visibleTasks} statuses={taskStatus}
          onMute={handleMute} onAction={handleAction} />;
      case "weekly-report":
        return <WeeklyReportBody onAction={handleAction} />;
      case "monthly-report":
        return <MonthlyReportBody onAction={handleAction} />;
      default:
        return <CatalogWidgetBody id={id} />;
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--bg-base)]">
      <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-5">
        {/* 인사 헤더 */}
        <GreetingHeader onOpenWidgetSettings={() => setShowCatalog(true)} />

        {/* 위젯 리스트 — 헤더 영역(점 6개·타이틀)을 잡고 다른 위젯 위로 드래그. ↑↓ 버튼도 사용 가능. */}
        {widgets.map((id, i) => {
          const def = widgetById(id);
          return (
            <WidgetWrapper
              key={id}
              def={def}
              isFirst={i === 0}
              isLast={i === widgets.length - 1}
              onMoveUp={() => moveWidget(id, -1)}
              onMoveDown={() => moveWidget(id, +1)}
              onRemove={() => removeWidget(id)}
              onDragStart={onDragStart(id)}
              onDragOver={onDragOver(id)}
              onDrop={onDrop(id)}
              onDragEnd={onDragEnd}
              onDragLeave={onDragLeave}
              isDragOver={dragOverId === id}
              isDragging={dragId === id}
            >
              {renderWidgetBody(id)}
            </WidgetWrapper>
          );
        })}

        {/* + 위젯 추가 — 항상 마지막에 노출 */}
        <button onClick={() => setShowCatalog(true)}
          className="bg-white rounded-xl border-2 border-dashed border-[var(--line-default)] p-6 flex items-center justify-center gap-2 text-[var(--text-tertiary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
          <span className="text-[18px] leading-none">＋</span>
          <span className="text-[13px] font-medium">위젯 추가</span>
        </button>

        {widgets.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-[var(--line-default)] py-16 flex flex-col items-center gap-2">
            <span className="text-[28px]">📋</span>
            <p className="text-[13px] text-[var(--text-sub)]">표시할 위젯이 없습니다</p>
            <button onClick={() => setShowCatalog(true)}
              className="text-[12px] font-medium text-[var(--brand-primary)] hover:underline">
              위젯 추가하기
            </button>
          </div>
        )}
      </div>

      {/* 카탈로그 모달 */}
      {showCatalog && (
        <WidgetCatalogModal
          selected={widgets}
          onClose={() => setShowCatalog(false)}
          onSave={saveWidgets}
        />
      )}

      {/* 토스트 */}
      <Toast msg={toastMsg} />
    </div>
  );
}
