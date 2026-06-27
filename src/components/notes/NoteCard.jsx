import { Pin, Heart, Folder } from 'lucide-react'
import { formatRelativeTime } from '../../utils/date'
import { truncate } from '../../utils/validation'

/**
 * NoteCard — Displays a single note as a compact card.
 *
 * Shows title, content preview, updated date, and status indicators
 * (pinned, favorite, folder). The card is a read-only display —
 * interactions (click to edit, right-click menu) come later.
 *
 * The color strip on the left edge is only rendered when the note
 * has a custom color set. This gives a subtle visual grouping effect.
 */

/**
 * Strips common Markdown syntax from text to produce a clean preview.
 * Not a full parser — just enough for a 120-char snippet.
 */
function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/\*\*(.*?)\*\*/g, '$1')       // bold
    .replace(/\*(.*?)\*/g, '$1')           // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')    // code blocks
    .replace(/`([^`]*)`/g, '$1')           // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')  // images
    .replace(/^[-*+]\s/gm, '')             // list markers
    .replace(/^\d+\.\s/gm, '')             // numbered lists
    .replace(/\n+/g, ' ')                  // newlines
    .trim()
}

export default function NoteCard({ note, folderName }) {
  const preview = truncate(stripMarkdown(note.content), 120)

  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all cursor-pointer ${
        note.color ? 'border-l-4' : ''
      }`}
      style={note.color ? { borderLeftColor: note.color } : undefined}
    >
      {/* ── Status indicators (top-right) ──────────────────── */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {note.isPinned && (
          <Pin
            size={14}
            className="text-violet-500 dark:text-violet-400"
            fill="currentColor"
          />
        )}
        {note.isFavorite && (
          <Heart
            size={14}
            className="text-red-500 dark:text-red-400"
            fill="currentColor"
          />
        )}
      </div>

      {/* ── Title ──────────────────────────────────────────── */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white pr-14 mb-1.5 line-clamp-2">
        {note.title || 'Untitled'}
      </h3>

      {/* ── Content preview ────────────────────────────────── */}
      {preview && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
          {preview}
        </p>
      )}

      {/* ── Footer: folder + date ──────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Folder badge */}
        {folderName && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
            <Folder size={11} />
            {folderName}
          </span>
        )}

        {!folderName && <span />}

        {/* Updated date */}
        <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {formatRelativeTime(note.updatedAt)}
        </span>
      </div>
    </div>
  )
}
