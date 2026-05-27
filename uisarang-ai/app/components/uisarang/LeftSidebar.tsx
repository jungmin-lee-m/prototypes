import { useState } from "react";
import { Plus, Mic, PanelLeft } from "lucide-react";
import { cn } from "../ui/utils";
import { outpatients, reservations, completed, type QueuePatient } from "./data";

type Tab = "외래" | "예약" | "완료";

const statusStyle: Record<string, string> = {
  진료중: "bg-[var(--brand-primary)] text-white",
  응급: "bg-[var(--red-500)] text-white",
  검사: "bg-[var(--bg-primary-subtle)] text-[var(--text-link)]",
  보류: "bg-[var(--bg-neutral)] text-[var(--text-sub)]",
  시술: "bg-[var(--bg-service-subtle)] text-[var(--text-service-primary)]",
  수납대기: "bg-[var(--status-warning-bg-subtle)] text-[var(--status-warning-text-main)]",
  수납완료: "bg-[var(--status-success-bg-subtle)] text-[var(--status-success-text-main)]",
};

function StatusBadge({ status, fade }: { status: string; fade?: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold",
        statusStyle[status] ?? "bg-[var(--bg-neutral)] text-[var(--text-sub)]",
        fade && "transition-opacity group-hover:opacity-0",
      )}
    >
      {status}
    </span>
  );
}

function PatientRow({
  p,
  status,
  callable,
  onCall,
}: {
  p: QueuePatient;
  status?: string;
  callable?: boolean;
  onCall?: (chartNo: string) => void;
}) {
  const active = status === "진료중";
  const showCall = callable && !active;

  return (
    <div
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-1 rounded-[var(--radius-md)] px-3 py-2 transition-colors",
        active ? "bg-[var(--bg-primary-subtle)]" : "hover:bg-[var(--bg-subtle)]",
      )}
    >
      {/* 차트번호 · 이름 · 나이/성별 · 신환 · 상태 */}
      <div className="flex items-center gap-1.5">
        <span className="rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 text-[10px] tabular-nums text-[var(--text-tertiary)]">
          {p.chartNo}
        </span>
        <span className="text-[13px] font-semibold text-[var(--text-main)]">{p.name}</span>
        <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {p.sex}/{p.age}
        </span>
        {p.isNew && (
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--violet-200)] text-[10px] font-semibold text-[var(--text-service-primary)]">
            N
          </span>
        )}
        {status && <StatusBadge status={status} fade={showCall} />}
      </div>

      {/* 접수시간 | 보험구분 | 특기사항 */}
      <div className="flex items-center gap-1 text-[11px]">
        <span className="shrink-0 tabular-nums text-[var(--text-tertiary)]">{p.time}</span>
        <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />
        <span className="shrink-0 text-[var(--text-tertiary)]">{p.insurance}</span>
        <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />
        <span className="truncate text-[var(--text-sub)]">{p.memo}</span>
      </div>

      {/* 호버 시 호출 버튼 */}
      {showCall && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCall?.(p.chartNo);
          }}
          className="absolute right-2 top-1.5 rounded-[var(--radius-md)] bg-[var(--bg-service)] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          호출하기
        </button>
      )}
    </div>
  );
}

export function LeftSidebar({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("외래");
  const [width, setWidth] = useState(290);
  const [inService, setInService] = useState<Set<string>>(new Set());

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => setWidth(Math.min(460, Math.max(240, ev.clientX)));
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
  };

  const call = (chartNo: string) => setInService((s) => new Set(s).add(chartNo));

  const tabs: { key: Tab; count: number }[] = [
    { key: "외래", count: outpatients.length },
    { key: "예약", count: reservations.length },
    { key: "완료", count: completed.length },
  ];

  return (
    <aside
      style={{ width }}
      className="relative flex shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--bg-base)]"
    >
      {/* New conversation + 패널 닫기 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <button className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[14px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
          <Plus className="h-4 w-4 text-[var(--text-service-primary)]" />새 대화
        </button>
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          className="rounded-[var(--radius-md)] p-1.5 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Active recording */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-service-subtle)] px-3 py-2.5">
          <Mic className="h-4 w-4 text-[var(--text-service-primary)]" />
          <span className="truncate text-[13px] font-medium text-[var(--text-main)]">
            김메디 님과의 대화
          </span>
          <span className="ml-auto whitespace-nowrap text-[12px] font-medium text-[var(--red-500)]">
            녹음 중 5:54
          </span>
        </div>
      </div>

      {/* Tabs: 외래 / 예약 / 완료 */}
      <div className="px-3 pb-2">
        <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-1">
          {tabs.map(({ key, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-sm)] py-1.5 text-[13px] font-medium transition-colors",
                tab === key
                  ? "bg-[var(--bg-base)] text-[var(--text-service-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)]",
              )}
            >
              {key}
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  tab === key ? "text-[var(--text-service-primary)]" : "text-[var(--text-tertiary)]",
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {tab === "외래" &&
          outpatients.map((p) => (
            <PatientRow
              key={p.chartNo}
              p={p}
              status={inService.has(p.chartNo) ? "진료중" : p.status}
              callable
              onCall={call}
            />
          ))}
        {tab === "예약" &&
          reservations.map((p) => <PatientRow key={p.chartNo} p={p} />)}
        {tab === "완료" &&
          completed.map((p) => <PatientRow key={p.chartNo} p={p} status={p.payment} />)}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2 border-t border-[var(--line-subtle)] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-service-subtle)] text-[12px] font-semibold text-[var(--text-service-primary)]">
          김
        </span>
        <span className="text-[13px] font-medium text-[var(--text-main)]">김유비</span>
        <span className="text-[12px] text-[var(--text-tertiary)]">메디아이의원</span>
      </div>

      {/* 리사이즈 핸들 */}
      <div
        onMouseDown={startResize}
        className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-[var(--bg-service)]/30"
      />
    </aside>
  );
}
