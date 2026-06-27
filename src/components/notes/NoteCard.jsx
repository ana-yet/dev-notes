import { Pin, Heart, Folder, ChevronRight } from 'lucide-react'
import { formatRelativeTime } from '../../utils/date'
import { truncate } from '../../utils/validation'

/**
 * NoteCard — Displays a single note as a compact list card.
 *
 * Shows title, content preview, updated date, and status indicators
 * (pinned, favorite, folder). Optimized for single-column display in
 * the side panel's full-width Workspace view.
 *
 * A right-arrow chevron appears on hover to signal navigability
 * in the single-pane flow.
 */

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}

export default function NoteCard({ note, folderName, selected, onClick }) {
  const preview = truncate(stripMarkdown(note.content), 100)

  return (
    <div
      onClick={() => onClick?.(note.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(note.id)
      }}
      className={`group relative bg-white dark:bg-gray-900 border rounded-xl px-4 py-3.5 hover:shadow-md hover:shadow-gray-200/60 dark:hover:shadow-black/20 transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-violet-300 dark:border-violet-700 ring-1 ring-violet-200 dark:ring-violet-800 shadow-sm shadow-violet-100 dark:shadow-violet-900/20'
          : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      } ${note.color ? 'border-l-4' : ''}`}
      style={note.color ? { borderLeftColor: note.color } : undefined}
    >
      {/* ── Status indicators (top-right) ──────────────────── */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {note.isPinned && (
          <Pin
            size={12}
            className="text-violet-500 dark:text-violet-400"
            fill="currentColor"
          />
        )}
        {note.isFavorite && (
          <Heart
            size={12}
            className="text-red-500 dark:text-red-400"
            fill="currentColor"
          />
        )}
        {/* Navigate affordance */}
        <ChevronRight
          size={14}
          className="text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-0.5"
        />
      </div>

      {/* ── Title ──────────────────────────────────────────── */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white pr-14 mb-1 line-clamp-1 leading-snug">
        {note.title || 'Untitled'}
      </h3>

      {/* ── Content preview ────────────────────────────────── */}
      {preview && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {preview}
        </p>
      )}

      {/* ── Footer: folder + date ──────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {/* Folder badge */}
        {folderName ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium">
            <Folder size={10} />
            {folderName}
          </span>
        ) : (
          <span />
        )}

        {/* Updated date */}
        <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {formatRelativeTime(note.updatedAt)}
        </span>
      </div>
    </div>
  )
}
