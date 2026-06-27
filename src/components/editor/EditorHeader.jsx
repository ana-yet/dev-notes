import { Pin, Heart, Archive } from 'lucide-react'

/**
 * EditorHeader — Displays the note title with status badges.
 *
 * Shows pin, favorite, and archive indicators next to the title
 * so the user can see the note's status at a glance.
 */

export default function EditorHeader({ note }) {
  return (
    <div className="px-5 pt-5 pb-3">
      {/* Status badges */}
      <div className="flex items-center gap-2 mb-2">
        {note.isPinned && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md">
            <Pin size={11} />
            Pinned
          </span>
        )}
        {note.isFavorite && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
            <Heart size={11} />
            Favorite
          </span>
        )}
        {note.isArchived && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
            <Archive size={11} />
            Archived
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
        {note.title || 'Untitled'}
      </h1>

      {/* Color indicator */}
      {note.color && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: note.color }}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {note.color}
          </span>
        </div>
      )}
    </div>
  )
}
