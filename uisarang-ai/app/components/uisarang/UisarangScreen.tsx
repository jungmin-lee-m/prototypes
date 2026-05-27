import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { TitleBar } from "./TitleBar";
import { LeftSidebar } from "./LeftSidebar";
import { CenterPanel } from "./CenterPanel";
import { ChatPanelDocked, FloatingPanels } from "./ChatPanel";

export function UisarangScreen() {
  const [leftOpen, setLeftOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-subtle)] text-[var(--text-main)]">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <LeftSidebar onClose={() => setLeftOpen(false)} />
        ) : (
          <button
            onClick={() => setLeftOpen(true)}
            aria-label="패널 열기"
            className="flex w-10 shrink-0 items-start justify-center border-r border-[var(--line-subtle)] bg-[var(--bg-base)] pt-3 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}
        <CenterPanel />
        <ChatPanelDocked />
      </div>
      <FloatingPanels />
    </div>
  );
}
