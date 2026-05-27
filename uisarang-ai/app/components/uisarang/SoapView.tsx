import { useState } from "react";
import { RefreshCw, Copy, Send, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { soap } from "./data";

function SoapBlock({ letter, text }: { letter: string; text: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 text-[13px] font-semibold text-[var(--text-service-primary)]">
        {letter}
      </div>
      <p className="whitespace-pre-line text-[13px] leading-relaxed text-[var(--text-main)]">
        {text}
      </p>
    </div>
  );
}

export function SoapView() {
  const [mode, setMode] = useState<"summary" | "detail">("summary");
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
          <span className="text-[14px] font-semibold text-[var(--text-main)]">SOAP</span>
          <div className="ml-1 flex rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-0.5">
            {(
              [
                ["summary", "요약"],
                ["detail", "상세"],
              ] as ["summary" | "detail", string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-1 text-[12px] font-medium transition-colors",
                  mode === k
                    ? "bg-[var(--bg-base)] text-[var(--text-main)] shadow-sm"
                    : "text-[var(--text-tertiary)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[var(--icon-sub)]">
          <button className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--bg-subtle)]">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--bg-subtle)]">
            <Copy className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--bg-service)] px-2.5 py-1 text-[12px] font-medium text-white">
            <Send className="h-3 w-3" />
            의사랑에 전송
          </button>
        </div>
      </div>
      <div className="px-4 py-3">
        <SoapBlock letter="S" text={soap.s} />
        <SoapBlock letter="O" text={soap.o} />
        <SoapBlock letter="A" text={soap.a} />
        <SoapBlock letter="P" text={soap.p} />
      </div>
    </section>
  );
}
