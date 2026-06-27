import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useAutosave } from "../hooks/useAutosave";
import { LIMITS } from "../constants";
import EditorPlaceholder from "../components/editor/EditorPlaceholder";

/**
 * EditorContext — Centralized state for the note editor.
 *
 * Eliminates prop drilling by providing all editor state and actions
 * through a single context. Child components (EditorHeader, EditorToolbar,
 * EditorContent, NoteMetadata) read what they need via useEditor().
 *
 * What lives here:
 *   - Draft state (title, content)
 *   - Dirty detection
 *   - Autosave orchestration
 *   - Manual save logic
 *   - Keyboard shortcuts (Ctrl+S, Delete)
 *   - Focus management (autoFocusTitle)
 *   - Title ref for programmatic focus
 *
 * What stays in the Notes page:
 *   - Note selection (which note is active)
 *   - Save/delete handlers that call useNotes()
 *   - Confirmation dialogs
 *   - Error toasts
 */

const EditorContext = createContext(null);

export function EditorProvider({
  children,
  note,
  folderName,
  onSave,
  onDelete,
  onDirtyChange,
  autoFocusTitle,
  contextName,
  tab,
  onSaveSuccess,
}) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const titleRef = useRef(null);

  // ── Autosave ───────────────────────────────────────────────
  const autosave = useAutosave({
    onSave,
    delay: LIMITS.AUTOSAVE_DELAY_MS,
  });

  // ── Sync draft when selected note changes ──────────────────
  useEffect(() => {
    async function syncDraft() {
      if (note) {
        setDraftTitle(note.title || "");
        setDraftContent(note.content || "");
        autosave.cancel();
      }
    }
    syncDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // ── Dirty state ────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!note) return false;
    return (
      draftTitle !== (note.title || "") || draftContent !== (note.content || "")
    );
  }, [draftTitle, draftContent, note]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // ── Schedule autosave on draft change ───────────────────────
  useEffect(() => {
    if (isDirty) {
      autosave.schedule({
        noteId: note.id,
        url: note.url,
        isDraft: Boolean(note.isDraft),
        title: draftTitle,
        content: draftContent,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftTitle, draftContent, isDirty]);

  // ── Notify parent on successful save ───────────────────────
  useEffect(() => {
    if (autosave.saveStatus === "saved") {
      onSaveSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave.saveStatus]);

  // ── Focus title after creation ─────────────────────────────
  useEffect(() => {
    if (autoFocusTitle && note && titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current.focus();
        titleRef.current.select();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocusTitle, note?.id]);

  // ── Manual save ────────────────────────────────────────────
  const handleManualSave = useCallback(() => {
    if (!isDirty) return;
    autosave.saveNow({
      noteId: note.id,
      url: note.url,
      isDraft: Boolean(note.isDraft),
      title: draftTitle,
      content: draftContent,
    });
  }, [isDirty, note, draftTitle, draftContent, autosave]);

  // ── Ctrl/Cmd + S ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleManualSave]);

  // ── Delete key ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === "Delete" &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        onDelete?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDelete]);

  // ── Context value ──────────────────────────────────────────
  const value = useMemo(
    () => ({
      // Note data
      note,
      folderName,

      // Draft
      draftTitle,
      setDraftTitle,
      draftContent,
      setDraftContent,

      // State
      isDirty,
      saveStatus: autosave.saveStatus,

      // Actions
      onManualSave: handleManualSave,
      onDelete,

      // Focus
      titleRef,

      // Page context
      contextName,
      tab,
    }),
    [
      note,
      folderName,
      draftTitle,
      draftContent,
      isDirty,
      autosave.saveStatus,
      handleManualSave,
      onDelete,
      contextName,
      tab,
    ],
  );

  // When no note is selected, render the placeholder directly.
  // This enforces the invariant: editor components that require a note
  // (EditorHeader, EditorContent, NoteMetadata) are never rendered
  // when note is null. They can safely access note.* without null checks.
  if (!note) {
    return <EditorPlaceholder />;
  }

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

/**
 * useEditor — Access editor state from any child component.
 *
 * Must be used inside an EditorProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return ctx;
}
