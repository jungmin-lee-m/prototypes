import { useState } from "react";
import { Sparkles, SendHorizontal, BarChart3, X, ClipboardList } from "lucide-react";
import { cn } from "../ui/utils";
import { CodeTables } from "./CodeTables";

function ChatContent() {
  return (
    <div className="px-5 py-6">
      <h2 className="flex items-center justify-center gap-2 pb-5 text-center text-[18px] font-semibold text-[var(--text-main)]">
        <Sparkles className="h-5 w-5 text-[var(--text-service-primary)]" />
        AI에게 질문해보세요.
      </h2>

      {/* 질문 입력 */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] p-3 shadow-sm">
        <p className="min-h-[40px] text-[14px] text-[var(--text-placeholder)]">
          무엇이든 질문하세요.
        </p>
        <div className="flex justify-end">
          <button className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-service)] text-white">
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 모드 칩 */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <span className="flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--line-default)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-main)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--text-service-primary)]" />
          AI 어시스턴트
        </span>
        <span className="flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--line-default)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-main)]">
          <BarChart3 className="h-3.5 w-3.5 text-[var(--text-service-primary)]" />
          의사랑 인사이트
        </span>
      </div>
    </div>
  );
}

/** 넓은 화면: 우측 — 상병·처방 추천(상단) + 질문영역(하단) */
export function ChatPanelDocked() {
  return (
    <aside className="hidden w-[420px] shrink-0 flex-col border-l border-[var(--line-subtle)] bg-[var(--bg-base)] min-[1200px]:flex">
      <div className="min-h-0 flex-1 overflow-y-auto border-b border-[var(--line-default)] p-3">
        <CodeTables />
      </div>
      <div className="shrink-0">
        <ChatContent />
      </div>
    </aside>
  );
}

type IconType = React.ComponentType<{ className?: string }>;

function FloatingCard({
  icon: Icon,
  title,
  onClose,
  children,
}: {
  icon: IconType;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-[5.5rem] right-5 z-50 flex h-[560px] max-h-[72vh] w-[400px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line-default)] bg-[var(--bg-base)] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--text-main)]">
          <Icon className="h-4 w-4 text-[var(--text-service-primary)]" />
          {title}
        </span>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-sm)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function Fab({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: IconType;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105",
        active ? "bg-[var(--violet-700)]" : "bg-[var(--bg-service)]",
      )}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

/** 좁은 화면: 상병·처방 추천 + 질문영역을 플로팅 버튼으로 접기 */
export function FloatingPanels() {
  const [open, setOpen] = useState<null | "codes" | "chat">(null);
  const toggle = (k: "codes" | "chat") => setOpen((o) => (o === k ? null : k));

  return (
    <div className="min-[1200px]:hidden">
      {open === "codes" && (
        <FloatingCard icon={ClipboardList} title="상병·처방 추천" onClose={() => setOpen(null)}>
          <div className="p-3">
            <CodeTables />
          </div>
        </FloatingCard>
      )}
      {open === "chat" && (
        <FloatingCard icon={Sparkles} title="AI 어시스턴트" onClose={() => setOpen(null)}>
          <ChatContent />
        </FloatingCard>
      )}

      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
        <Fab
          active={open === "codes"}
          onClick={() => toggle("codes")}
          label="상병·처방 추천"
          icon={ClipboardList}
        />
        <Fab active={open === "chat"} onClick={() => toggle("chat")} label="AI 어시스턴트" icon={Sparkles} />
      </div>
    </div>
  );
}
