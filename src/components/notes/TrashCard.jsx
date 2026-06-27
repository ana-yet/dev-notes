import { RotateCcw, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '../../utils/date'
import { truncate } from '../../utils/validation'

/**
 * TrashCard — Displays a deleted note in the Trash page.
 *
 * Shows title, preview, deleted date, and original updated date.
 * Provides Restore and Permanent Delete actions.
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

export default function TrashCard({ note, onRestore, onPermanentDelete }) {
  const preview = truncate(stripMarkdown(note.content), 100)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 opacity-80 hover:opacity-100 transition-opacity">
      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
        {note.title || 'Untitled'}
      </h3>

      {/* Preview */}
      {preview && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 line-clamp-2 leading-relaxed">
          {preview}
        </p>
      )}

      {/* Dates */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 mb-3">
        <span>Deleted {formatRelativeTime(note.deletedAt)}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span>Updated {formatRelativeTime(note.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRestore(note.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          Restore
        </button>
        <button
          onClick={() => onPermanentDelete(note.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
          Delete Forever
        </button>
      </div>
    </div>
  )
}
