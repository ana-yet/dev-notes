import { useEffect, useCallback } from 'react'
import { Pin, Heart, Archive } from 'lucide-react'
import { useEditor } from '../../contexts/EditorContext'

/**
 * EditorHeader — Editable title with status badges.
 *
 * Reads note, draftTitle, setDraftTitle, and titleRef from EditorContext.
 * The title textarea auto-grows vertically. The titleRef enables
 * programmatic focus (e.g. after creating a new note).
 */
export default function EditorHeader() {
  const { note, draftTitle, setDraftTitle, titleRef } = useEditor()

  const adjustHeight = useCallback(() => {
    const el = titleRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [titleRef])

  useEffect(() => {
    adjustHeight()
  }, [draftTitle, adjustHeight])

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

      {/* Editable title */}
      <textarea
        ref={titleRef}
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        placeholder="Untitled Note"
        rows={1}
        className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none leading-tight placeholder-gray-300 dark:placeholder-gray-600 overflow-hidden"
      />

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
