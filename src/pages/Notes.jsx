import { useCallback, useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { PageHeader } from '../components/ui'
import NotesToolbar from '../components/notes/NotesToolbar'
import NotesFilters from '../components/notes/NotesFilters'
import NotesList from '../components/notes/NotesList'
import NoteEditor from '../components/editor/NoteEditor'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'

/**
 * Notes — Main note-taking page with split layout.
 *
 * Left panel: notes list with toolbar and filters.
 * Right panel: note editor (read-only for now).
 *
 * The selected note is tracked by ID in local state.
 * When a NoteCard is clicked, it becomes selected and
 * its content appears in the editor panel.
 *
 * On narrow screens (< 640px), the panels stack vertically.
 */
export default function Notes() {
  const { notes, loading, error, searchNotes } = useNotes()
  const { folders } = useFolders()

  const [searchResults, setSearchResults] = useState(null)
  const [searchActive, setSearchActive] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState(null)

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

  // Display search results when searching, otherwise show all notes
  const displayNotes = searchActive ? searchResults : notes
  const noteCount = searchActive ? searchResults?.length : notes.length

  // Find the selected note and its folder name
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
            onSelectNote={setSelectedNoteId}
          />
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 overflow-y-auto border-t min-[640px]:border-t-0 border-gray-200 dark:border-gray-800">
          <NoteEditor note={selectedNote} folderName={selectedFolderName} />
        </div>
      </div>
    </div>
  )
}
