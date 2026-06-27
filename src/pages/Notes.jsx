import { useCallback, useState, useMemo, useRef } from 'react'
import { PageHeader } from '../components/ui'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import NotesToolbar from '../components/notes/NotesToolbar'
import NotesFilters from '../components/notes/NotesFilters'
import NotesList from '../components/notes/NotesList'
import NoteEditor from '../components/editor/NoteEditor'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'
import logger from '../utils/logger'

const log = logger.create('Notes')

/**
 * Notes — Main note-taking page with split layout.
 *
 * Manages the relationship between the list and editor:
 *   - Tracks which note is selected.
 *   - Protects against switching notes with unsaved changes.
 *   - Provides a placeholder save handler (no storage writes yet).
 *
 * The editor reports its dirty state via onDirtyChange.
 * The page uses that to decide whether to show a confirmation
 * dialog before allowing a note switch.
 */
export default function Notes() {
  const { notes, loading, error, searchNotes, updateNote } = useNotes()
  const { folders } = useFolders()

  const [searchResults, setSearchResults] = useState(null)
  const [searchActive, setSearchActive] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isEditorDirty, setIsEditorDirty] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const pendingSwitchIdRef = useRef(null)

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

  // ── Note selection with dirty check ────────────────────────
  const handleSelectNote = useCallback(
    (noteId) => {
      if (noteId === selectedNoteId) return

      if (isEditorDirty) {
        pendingSwitchIdRef.current = noteId
        setShowConfirm(true)
      } else {
        setSelectedNoteId(noteId)
      }
    },
    [selectedNoteId, isEditorDirty]
  )

  const handleConfirmDiscard = () => {
    setShowConfirm(false)
    const pendingId = pendingSwitchIdRef.current
    pendingSwitchIdRef.current = null
    if (pendingId) setSelectedNoteId(pendingId)
  }

  const handleConfirmCancel = () => {
    setShowConfirm(false)
    pendingSwitchIdRef.current = null
  }

  // ── Save handler — validates, updates repository, returns result ──
  const handleSave = useCallback(
    async ({ title, content }) => {
      if (!selectedNoteId) return { error: 'No note selected' }

      // Validate: trim title, default to "Untitled Note" if empty
      const trimmedTitle = title.trim()
      const finalTitle = trimmedTitle || 'Untitled Note'
      const finalContent = content

      // Ignore duplicate saves — check against current stored data
      if (
        selectedNote &&
        finalTitle === (selectedNote.title || '') &&
        finalContent === (selectedNote.content || '')
      ) {
        log.info('Save skipped — no changes after trimming')
        return { data: null, error: null }
      }

      setSaveError(null)

      const { data, error: err } = await updateNote(selectedNoteId, {
        title: finalTitle,
        content: finalContent,
      })

      if (err) {
        log.error('Save failed:', err)
        setSaveError(err)
      } else {
        log.info('Note saved:', selectedNoteId)
      }

      return { data, error: err }
    },
    [selectedNoteId, selectedNote, updateNote]
  )

  // ── Derived data ───────────────────────────────────────────
  const displayNotes = searchActive ? searchResults : notes
  const noteCount = searchActive ? searchResults?.length : notes.length

  const selectedNote = useMemo(
    () => (displayNotes || []).find((n) => n.id === selectedNoteId) || null,
    [displayNotes, selectedNoteId]
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

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-4 pt-4 pb-0">
        <PageHeader
          title="Notes"
          description={
            !loading && noteCount > 0
              ? `${noteCount} note${noteCount !== 1 ? 's' : ''}`
              : undefined
          }
        />
      </div>

      {/* Toolbar with search */}
      <NotesToolbar onSearch={handleSearch} />

      {/* Filter chips */}
      <NotesFilters />

      {/* Split layout: list + editor */}
      <div className="flex flex-col min-[640px]:flex-row flex-1 overflow-hidden">
        {/* Left panel — notes list */}
        <div className="min-[640px]:w-[40%] min-[640px]:border-r border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[45vh] min-[640px]:max-h-none">
          <NotesList
            notes={displayNotes || []}
            folders={folders}
            loading={loading}
            error={error}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 overflow-y-auto border-t min-[640px]:border-t-0 border-gray-200 dark:border-gray-800 relative">
          <NoteEditor
            note={selectedNote}
            folderName={selectedFolderName}
            onDirtyChange={setIsEditorDirty}
            onSave={handleSave}
          />
          {/* Save error toast — positioned at bottom of editor */}
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
    </div>
  )
}
