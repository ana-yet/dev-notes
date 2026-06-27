import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/ui";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Toast from "../components/ui/Toast";
import NotesToolbar from "../components/notes/NotesToolbar";
import NotesFilters from "../components/notes/NotesFilters";
import NotesList from "../components/notes/NotesList";
import NoteEditor from "../components/editor/NoteEditor";
import { EditorProvider } from "../contexts/EditorContext";
import { useNotes } from "../hooks/useNotes";
import { useFolders } from "../hooks/useFolders";
import logger from "../utils/logger";

const log = logger.create("Notes");

/**
 * Notes — Main note-taking page with single-pane navigation flow.
 * Maximizes horizontal layout in side panels by swapping list and editor views.
 */
export default function Notes() {
  const {
    notes,
    loading,
    error,
    searchNotes,
    updateNote,
    createNote,
    deleteNote,
  } = useNotes();
  const { folders } = useFolders();

  const [searchResults, setSearchResults] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [autoFocusTitle, setAutoFocusTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pendingSwitchIdRef = useRef(null);

  // ── Search ─────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (query) => {
      if (!query || !query.trim()) {
        setSearchResults(null);
        setSearchActive(false);
        return;
      }

      const { data, error: err } = await searchNotes(query);
      if (!err) {
        setSearchResults(data);
        setSearchActive(true);
      }
    },
    [searchNotes],
  );

  // ── Create note ────────────────────────────────────────────
  const handleCreateNote = useCallback(async () => {
    if (creating) return;

    setCreating(true);
    setSaveError(null);

    const { data, error: err } = await createNote({
      title: "Untitled Note",
      content: "",
    });

    setCreating(false);

    if (err) {
      log.error("Create failed:", err);
      setSaveError(err);
      return;
    }

    // Select the new note and focus the title
    setSelectedNoteId(data.id);
    setAutoFocusTitle(true);
    setTimeout(() => setAutoFocusTitle(false), 200);
  }, [creating, createNote]);

  // ── Delete note (move to Trash) ────────────────────────────
  const handleDeleteRequest = useCallback(() => {
    if (!selectedNoteId) return;
    setShowDeleteConfirm(true);
  }, [selectedNoteId]);

  const handleConfirmDelete = useCallback(async () => {
    setShowDeleteConfirm(false);
    if (!selectedNoteId) return;

    const { error: err } = await deleteNote(selectedNoteId);
    if (err) {
      setSaveError(err);
    } else {
      setSelectedNoteId(null); // Clear selection after moving to trash
    }
  }, [selectedNoteId, deleteNote]);

  // ── Ctrl/Cmd + N keyboard shortcut ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCreateNote]);

  // ── Note selection with dirty check ────────────────────────
  const handleSelectNote = useCallback(
    (noteId) => {
      if (noteId === selectedNoteId) return;

      if (isEditorDirty) {
        pendingSwitchIdRef.current = noteId;
        setShowConfirm(true);
      } else {
        setSelectedNoteId(noteId);
      }
    },
    [selectedNoteId, isEditorDirty],
  );

  // ── Escape to go back ──────────────────────────────────────
  const isEditing = selectedNoteId !== null;
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        ) {
          return;
        }
        handleSelectNote(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isEditing, handleSelectNote]);

  const handleConfirmDiscard = () => {
    setShowConfirm(false);
    const pendingId = pendingSwitchIdRef.current;
    pendingSwitchIdRef.current = null;
    setSelectedNoteId(pendingId);
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    pendingSwitchIdRef.current = null;
  };

  // ── Derived data ───────────────────────────────────────────
  const displayNotes = searchActive ? searchResults : notes;
  const noteCount = searchActive ? searchResults?.length : notes.length;

  const selectedNote = useMemo(
    () => (displayNotes || []).find((n) => n.id === selectedNoteId) || null,
    [displayNotes, selectedNoteId],
  );

  const folderMap = useMemo(() => {
    const map = {};
    for (const folder of folders) {
      map[folder.id] = folder.name;
    }
    return map;
  }, [folders]);

  const selectedFolderName = selectedNote
    ? folderMap[selectedNote.folderId]
    : null;

  // ── Save handler ───────────────────────────────────────────
  const handleSave = useCallback(
    async ({ title, content }) => {
      if (!selectedNoteId) return { error: "No note selected" };

      const trimmedTitle = title.trim();
      const finalTitle = trimmedTitle || "Untitled Note";
      const finalContent = content;

      if (
        selectedNote &&
        finalTitle === (selectedNote.title || "") &&
        finalContent === (selectedNote.content || "")
      ) {
        log.info("Save skipped — no changes after trimming");
        return { data: null, error: null };
      }

      setSaveError(null);

      const { data, error: err } = await updateNote(selectedNoteId, {
        title: finalTitle,
        content: finalContent,
      });

      if (err) {
        log.error("Save failed:", err);
        setSaveError(err);
      } else {
        log.info("Note saved:", selectedNoteId);
      }

      return { data, error: err };
    },
    [selectedNoteId, selectedNote, updateNote],
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {!isEditing ? (
        /* List View Pane */
        <>
          <div className="px-4 pt-4 pb-0">
            <PageHeader
              title="Workspace"
              description={
                !loading && noteCount > 0
                  ? `${noteCount} note${noteCount !== 1 ? "s" : ""}`
                  : undefined
              }
            />
          </div>

          <NotesToolbar
            onSearch={handleSearch}
            onCreateNote={handleCreateNote}
            creating={creating}
          />
          <NotesFilters />

          <div className="flex-1 overflow-y-auto px-4 py-2 pb-6">
            <NotesList
              notes={displayNotes || []}
              folders={folders}
              loading={loading}
              error={error}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
            />
          </div>
        </>
      ) : (
        /* Focused Full-Width Editor Pane */
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 animate-slide-in">
          {/* Header Action Bar */}
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
            <button
              onClick={() => handleSelectNote(null)}
              className="px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 border border-gray-200/50 dark:border-gray-850 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Workspace</span>
            </button>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 select-none">
              {isEditorDirty ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving...
                </span>
              ) : (
                "Saved to local storage"
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            <EditorProvider
              note={selectedNote}
              folderName={selectedFolderName}
              onSave={handleSave}
              onDelete={handleDeleteRequest}
              onDirtyChange={setIsEditorDirty}
              autoFocusTitle={autoFocusTitle}
            >
              <NoteEditor />
            </EditorProvider>

            {/* Error notifications */}
            {saveError && (
              <div className="sticky bottom-4 mx-4 z-10">
                <Toast
                  message={`Save failed: ${saveError}`}
                  type="error"
                  onClose={() => setSaveError(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discard confirmation */}
      {showConfirm && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes. Discard them?"
          confirmLabel="Discard"
          onConfirm={handleConfirmDiscard}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Move to Trash"
          message={`"${selectedNote?.title || "Untitled"}" will be moved to Trash. You can restore it later.`}
          confirmLabel="Move to Trash"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
