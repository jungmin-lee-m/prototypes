import { Sparkles, AudioLines, Pause } from "lucide-react";
import { currentPatient } from "./data";
import { SoapView } from "./SoapView";

function Divider() {
  return <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />;
}

function PatientHeader() {
  const p = currentPatient;
  return (
    <div className="shrink-0 border-b border-[var(--line-subtle)] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
        <span className="rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 py-0.5 text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {p.chartNo}
        </span>
        <span className="text-[14px] font-semibold text-[var(--text-main)]">{p.name}</span>
        <Divider />
        <span className="tabular-nums text-[var(--text-sub)]">{p.ssn}</span>
        <Divider />
        <span className="text-[var(--text-sub)]">
          {p.age}세/{p.sex}
        </span>
        <Divider />
        <span className="rounded-[var(--radius-sm)] bg-[var(--status-warning-bg-subtle)] px-1 py-0.5 text-[11px] font-medium text-[var(--status-warning-text-main)]">
          {p.insurance}
        </span>
        <Divider />
        <span className="tabular-nums text-[var(--text-sub)]">{p.phone}</span>
      </div>

      <div className="mt-1.5 truncate text-[12px] text-[var(--text-sub)]">{p.memo}</div>
    </div>
  );
}

function PastRecordSummary() {
  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--bg-service-subtle)] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
        <span className="text-[14px] font-semibold text-[var(--text-service-bold)]">
          과거 기록 요약
        </span>
        <button className="ml-auto text-[12px] font-medium text-[var(--text-service-primary)]">
          자세히
        </button>
      </div>
      <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--text-main)]">
        <li className="flex gap-2">
          <span className="text-[var(--text-service-primary)]">•</span>
          BMI 26.8 — 비만 전단계, 체중 관리 필요
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--text-service-primary)]">•</span>
          고혈압 12년 · 당뇨 4년 — 만성질환 관리 강화 권고
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--text-service-primary)]">•</span>
          현재 복용: 암로디핀 5mg 단독 → 최근 혈압 조절 불량
        </li>
        <li className="flex gap-2 font-medium text-[var(--status-warning-text-main)]">
          <span>•</span>
          페니실린 알레르기 — 처방 시 주의
        </li>
      </ul>
    </section>
  );
}

function RecordingStatus() {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-[var(--gray-800)] bg-[var(--gray-900)] px-6 py-3 text-white">
      <span className="flex items-center gap-2 text-[13px] font-medium">
        <AudioLines className="h-4 w-4" />
        녹음 중
        <span className="tabular-nums text-[var(--gray-200)]">3:57</span>
      </span>
      <button className="flex items-center gap-1.5 text-[13px] text-[var(--gray-200)] hover:text-white">
        <Pause className="h-4 w-4" />
        일시정지
      </button>
    </div>
  );
}

export function CenterPanel() {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[var(--bg-subtle)]">
      <div className="bg-[var(--bg-base)]">
        <PatientHeader />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 py-3">
          <PastRecordSummary />
          <SoapView />
        </div>
      </div>

      <RecordingStatus />
    </main>
  );
}
