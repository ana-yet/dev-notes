import { useCallback, useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { PageHeader } from '../components/ui'
import NotesToolbar from '../components/notes/NotesToolbar'
import NotesFilters from '../components/notes/NotesFilters'
import NotesList from '../components/notes/NotesList'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'

/**
 * Notes — Main note-taking page.
 *
 * Composes the toolbar, filters, and list using the domain hooks.
 * Search is delegated to the useNotes hook's searchNotes function.
 * When search is active, results replace the full list.
 *
 * The page never calls repositories directly — it goes through hooks.
 */
export default function Notes() {
  const { notes, loading, error, searchNotes } = useNotes()
  const { folders } = useFolders()

  const [searchResults, setSearchResults] = useState(null)
  const [searchActive, setSearchActive] = useState(false)

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

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto">
        <NotesList
          notes={displayNotes || []}
          folders={folders}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
