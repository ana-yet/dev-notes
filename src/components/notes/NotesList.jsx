import { FileText } from 'lucide-react'
import NoteCard from './NoteCard'
import EmptyState from '../ui/EmptyState'
import LoadingState from '../ui/LoadingState'

/**
 * NotesList — Renders a responsive grid of NoteCards.
 *
 * Handles three states internally:
 *   1. Loading  → spinner
 *   2. Error    → error message
 *   3. Empty    → empty state with icon
 *   4. Data     → grid of cards
 *
 * The parent passes notes, loading, error, and a folder lookup map.
 * This component is purely presentational — it never fetches data.
 */

export default function NotesList({ notes, folders, loading, error, selectedNoteId, onSelectNote }) {
  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return <LoadingState message="Loading notes..." />
  }

  // ── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            Failed to load notes
          </p>
          <p className="text-xs text-red-500 dark:text-red-500 mt-1">
            {error}
          </p>
        </div>
      </div>
    )
  }

  // ── Empty ──────────────────────────────────────────────────
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No notes yet"
        description="Create your first note to get started."
      />
    )
  }

  // ── Build folder lookup map ────────────────────────────────
  const folderMap = {}
  if (folders) {
    for (const folder of folders) {
      folderMap[folder.id] = folder.name
    }
  }

  // ── Separate pinned and unpinned ───────────────────────────
  const pinned = notes.filter((n) => n.isPinned)
  const unpinned = notes.filter((n) => !n.isPinned)

  return (
    <div className="p-4 space-y-4">
      {/* Pinned section */}
      {pinned.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
            Pinned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                folderName={folderMap[note.folderId]}
                selected={note.id === selectedNoteId}
                onClick={onSelectNote}
              />
            ))}
          </div>
        </section>
      )}

      {/* All other notes */}
      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              Recent
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unpinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                folderName={folderMap[note.folderId]}
                selected={note.id === selectedNoteId}
                onClick={onSelectNote}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
