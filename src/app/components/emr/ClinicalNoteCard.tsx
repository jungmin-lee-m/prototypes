// ── 임상메모 카드 — 환자 단위 누적 메모 ──────────────────────────────
// 차트별이 아니라 환자에게 누적되는 메모. 그래서 차트 영역(PanelD)이 아닌
// 환자 정보 패널(PanelB)에 위치해야 의미적으로 맞음.
//
// 기능:
// - 텍스트 편집 (textarea)
// - 고정된 문구 (pinned notes) — 텍스트 선택 후 "고정" 으로 추가
// - 즐겨찾기 상용구 (snippet chips) — 클릭 시 텍스트 추가
// - 텍스트 선택 시 floating 서식 툴바 + 상용구 등록 / 고정
// - 상용구 등록 모달

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  type Snippet,
  SnippetChips,
  SnippetRegisterModal,
  NOTE_SNIPPETS,
} from "./PanelD";

export function ClinicalNoteCard({
  clinicalNote = "",
  onChangeClinicalNote,
}: {
  clinicalNote?: string;
  onChangeClinicalNote?: (v: string) => void;
}) {
  // 고정된 문구 — 자주 보는 임상 정보 (탈모 상담 사유, 가족력 등)
  const [pinnedNotes, setPinnedNotes] = useState<{ id: string; text: string }[]>([
    { id: "p-init-1", text: "S>\n탈모 관련 상담 위해 방문" },
  ]);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editingPinDraft, setEditingPinDraft] = useState("");

  // 사용자가 등록한 상용구 (preset NOTE_SNIPPETS 와 합쳐서 노출)
  const [userNoteSnippets, setUserNoteSnippets] = useState<Snippet[]>([]);

  // 텍스트 선택 시 floating toolbar 위치
  const [noteSelection, setNoteSelection] = useState<{ text: string; toolbarTop: number; toolbarLeft: number } | null>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 상용구 등록 모달 — open 시 noteSelection 의 텍스트로 초기화
  const [snippetModal, setSnippetModal] = useState<{ text: string } | null>(null);

  // textarea 에서 텍스트 선택 시 floating 툴바 위치 계산
  const handleNoteSelection = () => {
    const ta = noteTextareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) { setNoteSelection(null); return; }
    const selectedText = clinicalNote.substring(start, end).trim();
    if (!selectedText) { setNoteSelection(null); return; }
    const rect = ta.getBoundingClientRect();
    setNoteSelection({
      text: selectedText,
      toolbarTop: rect.top - 44,
      toolbarLeft: rect.left + rect.width / 2,
    });
  };

  const dismissSelection = () => setNoteSelection(null);

  // 상용구 등록 — 모달 오픈
  const registerSnippet = () => {
    if (!noteSelection) return;
    setSnippetModal({ text: noteSelection.text });
    dismissSelection();
  };

  const handleSnippetSubmit = (data: { code: string; text: string; favorite: boolean; targets: string[] }) => {
    const newSnippet: Snippet = {
      id: `user-${Date.now()}`,
      name: data.code,
      text: data.text,
      favorite: data.favorite,
      targets: data.targets,
    };
    setUserNoteSnippets(prev => [...prev, newSnippet]);
    setSnippetModal(null);
  };

  // 문구 고정
  const pinSelection = () => {
    if (!noteSelection) return;
    setPinnedNotes(prev => [...prev, { id: `pin-${Date.now()}`, text: noteSelection.text }]);
    dismissSelection();
  };
  const unpin = (id: string) => setPinnedNotes(prev => prev.filter(p => p.id !== id));
  const startEditPin = (id: string, text: string) => { setEditingPinId(id); setEditingPinDraft(text); };
  const savePinEdit = () => {
    if (!editingPinId) return;
    setPinnedNotes(prev => prev.map(p => p.id === editingPinId ? { ...p, text: editingPinDraft } : p));
    setEditingPinId(null);
    setEditingPinDraft("");
  };
  const cancelPinEdit = () => { setEditingPinId(null); setEditingPinDraft(""); };

  return (
    <div className="bg-white rounded-md flex flex-col h-full overflow-hidden relative">
      {/* 헤더 — 환자 단위 누적 메모임을 명시하는 서브타이틀 */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-md font-bold text-[var(--text-main)]">임상메모</span>
          <span className="text-micro text-[var(--text-tertiary)]">환자 누적</span>
        </div>
      </div>

      {/* 고정된 문구 — 공유메모 공지와 동일한 orange tone (status-warning) */}
      {pinnedNotes.length > 0 && (
        <div className="px-2 pt-2 pb-1 flex flex-col gap-1.5 flex-shrink-0">
          {pinnedNotes.map(p => (
            <div key={p.id} className="relative bg-[var(--status-warning-bg-subtle)] rounded-md px-3 py-2 group">
              {editingPinId === p.id ? (
                <div className="flex flex-col gap-1.5">
                  <textarea
                    autoFocus
                    value={editingPinDraft}
                    onChange={e => setEditingPinDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) savePinEdit();
                      if (e.key === "Escape") cancelPinEdit();
                    }}
                    className="w-full min-h-[60px] text-sm text-[var(--text-main)] leading-[16px] px-2 py-1.5 border border-[var(--brand-primary)] rounded bg-white outline-none resize-none"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={cancelPinEdit}
                      className="h-6 px-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-sub)]">
                      취소
                    </button>
                    <button onClick={savePinEdit}
                      className="h-6 px-2.5 text-xs font-bold text-white bg-[var(--brand-primary)] rounded hover:opacity-90">
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--text-main)] leading-[16px] whitespace-pre-line pr-12">{p.text}</p>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditPin(p.id, p.text)} title="편집"
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/70 text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M11.3 2.3l2.4 2.4-8.5 8.5L2 13.5l.3-3.2 9-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </button>
                    <button onClick={() => unpin(p.id)} title="고정 해제"
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/70 text-[var(--text-tertiary)] hover:text-[var(--red-500)]">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 편집 가능 textarea */}
      <textarea
        ref={noteTextareaRef}
        value={clinicalNote}
        onChange={e => onChangeClinicalNote?.(e.target.value)}
        onSelect={handleNoteSelection}
        onMouseUp={handleNoteSelection}
        onKeyUp={handleNoteSelection}
        onBlur={() => setTimeout(() => setNoteSelection(null), 150)}
        placeholder="임상메모를 입력해주세요. ('/' 입력하여 상용구 검색, 텍스트를 선택하면 서식·상용구·고정 도구가 나타납니다)"
        className="flex-1 p-3 text-sm text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent overflow-y-auto"
      />

      {/* 즐겨찾기 상용구 — preset + 사용자 등록 */}
      <SnippetChips
        snippets={[...NOTE_SNIPPETS, ...userNoteSnippets]}
        onInsert={t => onChangeClinicalNote?.(clinicalNote ? `${clinicalNote}\n${t}` : t)}
      />

      {/* 선택 시 floating 서식 툴바 */}
      {noteSelection && createPortal(
        <div
          className="fixed z-[9998] bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-[var(--line-default)] flex items-center gap-0.5 px-1.5 py-1"
          style={{
            top: noteSelection.toolbarTop,
            left: noteSelection.toolbarLeft,
            transform: "translateX(-50%)",
          }}
          onMouseDown={e => e.preventDefault()}
        >
          <button title="굵게" className="w-7 h-7 flex items-center justify-center text-md font-bold text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">B</button>
          <button title="색상" className="w-7 h-7 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8" cy="8" r="2.5" fill="var(--brand-primary)" />
            </svg>
          </button>
          <button title="형광펜" className="w-7 h-7 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L4 10L11 3L13 5L6 12L3 13Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
          <button title="제목" className="w-7 h-7 flex items-center justify-center text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">H1</button>
          <button title="목록" className="w-7 h-7 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <button title="정렬" className="w-7 h-7 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 8h7M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <span className="w-px h-5 bg-[var(--line-default)] mx-0.5" />
          <button onClick={registerSnippet}
            title="선택 텍스트를 상용구로 등록"
            className="h-7 px-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-primary-subtle)] hover:text-[var(--brand-primary)] rounded transition-colors">
            상용구
          </button>
          <button onClick={pinSelection}
            title="선택 텍스트를 고정"
            className="h-7 px-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-primary-subtle)] hover:text-[var(--brand-primary)] rounded transition-colors">
            고정
          </button>
        </div>,
        document.body
      )}

      {/* 상용구 등록 모달 */}
      {snippetModal && (
        <SnippetRegisterModal
          initialText={snippetModal.text}
          defaultTarget="임상메모"
          onClose={() => setSnippetModal(null)}
          onSubmit={handleSnippetSubmit}
        />
      )}
    </div>
  );
}
