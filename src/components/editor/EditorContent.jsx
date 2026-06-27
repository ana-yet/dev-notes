import { useRef, useEffect, useCallback } from 'react'
import { useEditor } from '../../contexts/EditorContext'

/**
 * EditorContent — Editable textarea for note content.
 *
 * Reads draftContent and setDraftContent from EditorContext.
 * The textarea auto-grows vertically to fit the content.
 */

export default function EditorContent() {
  const { draftContent, setDraftContent } = useEditor()
  const textareaRef = useRef(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [draftContent, adjustHeight])

  const handleChange = (e) => {
    setDraftContent(e.target.value)
    requestAnimationFrame(adjustHeight)
  }

  return (
    <div className="px-5 py-4">
      <textarea
        ref={textareaRef}
        value={draftContent}
        onChange={handleChange}
        placeholder="Start writing your note..."
        className="w-full min-h-50 text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed font-sans placeholder-gray-400 dark:placeholder-gray-500 overflow-hidden"
      />
    </div>
  )
}
