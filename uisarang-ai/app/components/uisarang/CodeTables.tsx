import { useState } from "react";
import { Sparkles, Send, Check } from "lucide-react";
import { cn } from "../ui/utils";
import { diagnoses, prescriptions } from "./data";

function UserCode({ code }: { code: string }) {
  return (
    <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--line-default)] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[var(--text-tertiary)]">
      {code}
    </span>
  );
}

function SendState({ sent }: { sent: boolean }) {
  return sent ? (
    <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-[var(--status-success-text-main)]">
      <Check className="h-3.5 w-3.5" />
      전송됨
    </span>
  ) : (
    <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-[var(--text-service-primary)] opacity-0 transition-opacity group-hover:opacity-100">
      <Send className="h-3 w-3" />
      전송
    </span>
  );
}

export function CodeTables() {
  const [sentDx, setSentDx] = useState<Set<string>>(new Set());
  const [sentRx, setSentRx] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, fn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    fn(next);
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
      <div className="flex items-center gap-2 border-b border-[var(--line-subtle)] px-4 py-2.5">
        <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
        <span className="text-[14px] font-semibold text-[var(--text-main)]">상병·처방 추천</span>
        <span className="text-[12px] text-[var(--text-tertiary)]">클릭하여 전송</span>
      </div>

      <div className="px-3 py-3">
        {/* 상병 목록 */}
        <div className="mb-1 px-1 text-[12px] font-medium text-[var(--text-tertiary)]">상병</div>
        <div className="mb-3">
          {diagnoses.map((d) => {
            const sent = sentDx.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggle(sentDx, setSentDx, d.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors",
                  sent ? "bg-[var(--status-success-bg-subtle)]" : "hover:bg-[var(--bg-subtle)]",
                )}
              >
                <UserCode code={d.userCode} />
                <span className="flex min-w-0 flex-1 items-center gap-1 text-[13px] text-[var(--text-main)]">
                  {d.ai && (
                    <Sparkles className="h-3 w-3 shrink-0 text-[var(--text-service-primary)]" />
                  )}
                  <span className="truncate">{d.name}</span>
                </span>
                <SendState sent={sent} />
              </button>
            );
          })}
        </div>

        {/* 처방 목록 */}
        <div className="mb-1 px-1 text-[12px] font-medium text-[var(--text-tertiary)]">처방</div>
        <div>
          {prescriptions.map((p) => {
            const sent = sentRx.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(sentRx, setSentRx, p.id)}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors",
                  sent ? "bg-[var(--status-success-bg-subtle)]" : "hover:bg-[var(--bg-subtle)]",
                )}
              >
                <UserCode code={p.userCode} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[13px] text-[var(--text-main)]">
                    {p.ai && (
                      <Sparkles className="h-3 w-3 shrink-0 text-[var(--text-service-primary)]" />
                    )}
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-tertiary)]">
                    <span>
                      용량 <b className="font-medium text-[var(--text-sub)]">{p.dose}</b>
                    </span>
                    <span>
                      일투 <b className="font-medium text-[var(--text-sub)]">{p.perDay}</b>
                    </span>
                    <span>
                      일수 <b className="font-medium text-[var(--text-sub)]">{p.days}</b>
                    </span>
                  </span>
                </span>
                <span className="pt-0.5">
                  <SendState sent={sent} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
