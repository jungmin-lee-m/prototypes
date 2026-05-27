import { Minus, Square, X } from "lucide-react";

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2.5 17.5 16H2.5L10 2.5Z"
        stroke="var(--bg-service)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TitleBar() {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line-subtle)] bg-[var(--bg-base)] pl-3 pr-2">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-[14px] font-semibold text-[var(--text-main)]">의사랑 AI</span>
      </div>
      <div className="flex items-center text-[var(--icon-sub)]">
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--bg-subtle)]">
          <Minus className="h-4 w-4" />
        </button>
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--bg-subtle)]">
          <Square className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--red-500)] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
