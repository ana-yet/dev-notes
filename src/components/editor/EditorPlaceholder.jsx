import { FileText, MousePointerClick } from 'lucide-react'

/**
 * EditorPlaceholder — Shown when no note is selected.
 *
 * Occupies the editor panel and encourages the user to click a note.
 * Uses a dashed border to visually distinguish it from the editor.
 */
export default function EditorPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
        <FileText size={28} className="text-gray-300 dark:text-gray-600" />
      </div>

      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1.5">
        No note selected
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-55 mb-4 leading-relaxed">
        Choose a note from the list to view its contents.
      </p>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <MousePointerClick size={14} />
        <span>Click a note card</span>
      </div>
    </div>
  )
}
