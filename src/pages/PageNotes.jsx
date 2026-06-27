import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Globe, MousePointerClick } from 'lucide-react'
import { PageHeader } from '../components/ui'
import NotesList from '../components/notes/NotesList'
import NoteEditor from '../components/editor/NoteEditor'
import ActiveNoteIndicator from '../components/notes/ActiveNoteIndicator'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import { EditorProvider } from '../contexts/EditorContext'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'
import { usePageNote } from '../hooks/usePageNote'
import logger from '../utils/logger'

const log = logger.create('PageNotes')

/**
 * PageNotes — Notes tied to specific web pages.
 *
 * Automatically detects the active browser tab and finds the matching
 * page note. If no note exists for the current page, the user can
 * create one with a single click. The note's URL, title, and content
 * are kept in sync with the editor.
 *
 * How page notes differ from regular notes:
 *   - Every page note has a `url` field linking it to a web page.
 *   - Only one page note exists per URL (duplicates are prevented).
 *   - Page notes auto-load when the user navigates to the URL.
 *   - Page notes are discoverable by URL in search.
 *
 * This prepares for future features:
 *   - Highlights will reference the same URL to associate with page notes.
 *   - AI summaries will use the page note as context.
 */
export default function PageNotes() {
  const { notes, loading: notesLoading, error: notesError, updateNote, searchNotes } = useNotes()
  const { folders } = useFolders()
  const { activeTab, pageNote, hasNote, loading: tabLoading, createPageNote } = usePageNote(notes)

  const [searchResults, setSearchResults] = useState(null)
  const [searchActive, setSearchActive] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isEditorDirty, setIsEditorDirty] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [autoFocusTitle, setAutoFocusTitle] = useState(false)
  const [toast, setToast] = useState(null)

  // ── Track if user manually selected a note ─────────────────
  const manualSelectRef = useRef(false)

  // ── Auto-select page note when tab changes ─────────────────
  useEffect(() => {
    if (pageNote && !isEditorDirty && !manualSelectRef.current) {
      setSelectedNoteId(pageNote.id)
    }
  }, [pageNote?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset manual selection flag when page note changes (tab switch)
  useEffect(() => {
    manualSelectRef.current = false
  }, [pageNote?.id])

  // ── Search ─────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (query) => {
      if (!query || !query.trim()) {
        setSearchResults(null)
        setSearchActive(false)
        return
      }

      const { data, error: err } = await searchNotes(query)
      if (!err) {
        setSearchResults(data)
        setSearchActive(true)
      }
    },
    [searchNotes]
  )

  // ── Create page note ───────────────────────────────────────
  const handleCreatePageNote = useCallback(async () => {
    if (creating) return

    setCreating(true)
    setSaveError(null)

    const { error: err } = await createPageNote((note) => {
      // Select the new note and focus the title
      setSelectedNoteId(note.id)
      setAutoFocusTitle(true)
      setTimeout(() => setAutoFocusTitle(false), 200)
      setToast({ message: `Page note created for "${activeTab?.title || 'this page'}"`, type: 'success' })
    })

    setCreating(false)

    if (err) {
      log.error('Create page note failed:', err)
      setSaveError(err)
    }
  }, [creating, createPageNote, activeTab?.title])

  // ── Note selection with dirty check ────────────────────────
  const handleSelectNote = useCallback(
    (noteId) => {
      if (noteId === selectedNoteId) return

      manualSelectRef.current = true

      if (isEditorDirty) {
        setShowConfirm(true)
      } else {
        setSelectedNoteId(noteId)
      }
    },
    [selectedNoteId, isEditorDirty]
  )

  const handleConfirmDiscard = () => {
    setShowConfirm(false)
  }

  const handleConfirmCancel = () => {
    setShowConfirm(false)
  }

  // ── Save handler ───────────────────────────────────────────
  const handleSave = useCallback(
    async ({ title, content }) => {
      if (!selectedNoteId) return { error: 'No note selected' }

      const trimmedTitle = title.trim()
      const finalTitle = trimmedTitle || 'Untitled Note'

      setSaveError(null)

      const { data, error: err } = await updateNote(selectedNoteId, {
        title: finalTitle,
        content,
      })

      if (err) {
        log.error('Save failed:', err)
        setSaveError(err)
      } else {
        log.info('Page note saved:', selectedNoteId)
      }

      return { data, error: err }
    },
    [selectedNoteId, updateNote]
  )

  // ── Derived data ───────────────────────────────────────────
  const displayNotes = searchActive ? searchResults : notes
  const pageNotes = (displayNotes || []).filter((n) => n.url && !n.isDeleted)
  const noteCount = searchActive ? pageNotes.length : notes.filter((n) => n.url && !n.isDeleted).length

  const selectedNote = useMemo(
    () => (notes || []).find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  )

  const folderMap = useMemo(() => {
    const map = {}
    for (const folder of folders) {
      map[folder.id] = folder.name
    }
    return map
  }, [folders])

  const selectedFolderName = selectedNote
    ? folderMap[selectedNote.folderId]
    : null

  const isLoading = notesLoading || tabLoading

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-4 pt-4 pb-0">
        <PageHeader
          title="Page Notes"
          description={
            !isLoading && noteCount > 0
              ? `${noteCount} page note${noteCount !== 1 ? 's' : ''}`
              : 'Notes attached to specific web pages.'
          }
        />
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative flex-1">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search page notes..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 dark:focus:bg-gray-900 dark:focus:border-gray-700 dark:text-gray-200 placeholder-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Split layout: list + editor */}
      <div className="flex flex-col min-[640px]:flex-row flex-1 overflow-hidden">
        {/* Left panel — page notes list */}
        <div className="min-[640px]:w-[40%] min-[640px]:border-r border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[45vh] min-[640px]:max-h-none">
          {/* Current page indicator */}
          {activeTab && !searchActive && (
            <ActiveNoteIndicator
              tab={activeTab}
              hasNote={hasNote}
            />
          )}

          {/* Create page note button (when no note for current page) */}
          {!hasNote && activeTab && !searchActive && !isLoading && (
            <div className="px-4 py-3">
              <button
                onClick={handleCreatePageNote}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {creating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Globe size={16} />
                )}
                {creating ? 'Creating...' : 'Create Page Note'}
              </button>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
                Save a note for {activeTab.title || 'this page'}
              </p>
            </div>
          )}

          {/* Page notes list */}
          <NotesList
            notes={pageNotes}
            folders={folders}
            loading={isLoading}
            error={notesError}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />

          {/* Empty state when no page notes and no active tab */}
          {!activeTab && !isLoading && pageNotes.length === 0 && !searchActive && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Globe size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1.5">
                No page notes yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-56 leading-relaxed">
                Browse the web and add notes to any page you visit.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-3">
                <MousePointerClick size={14} />
                <span>Navigate to a web page</span>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 overflow-y-auto border-t min-[640px]:border-t-0 border-gray-200 dark:border-gray-800 relative">
          <EditorProvider
            note={selectedNote}
            folderName={selectedFolderName}
            onSave={handleSave}
            onDirtyChange={setIsEditorDirty}
            autoFocusTitle={autoFocusTitle}
            contextName="page"
            tab={activeTab}
          >
            <NoteEditor />
          </EditorProvider>

          {/* Save error toast */}
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

      {/* Unsaved changes confirmation */}
      {showConfirm && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes. Discard them?"
          confirmLabel="Discard"
          onConfirm={handleConfirmDiscard}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
