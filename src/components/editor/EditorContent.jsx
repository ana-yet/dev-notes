import { useRef, useEffect, useCallback } from 'react'

/**
 * EditorContent — Editable textarea for note content.
 *
 * The textarea auto-grows vertically to fit the content.
 * Preserves whitespace and line breaks via CSS `white-space: pre-wrap`.
 * The parent controls the value and provides onChange.
 */

export default function EditorContent({ content, onChange }) {
  const textareaRef = useRef(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [])

  // Adjust height when content changes (e.g. on note switch)
  useEffect(() => {
    adjustHeight()
  }, [content, adjustHeight])

  const handleChange = (e) => {
    onChange(e.target.value)
    // Adjust height on next frame after React updates the value
    requestAnimationFrame(adjustHeight)
  }

  return (
    <div className="px-5 py-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Start writing your note..."
        className="w-full min-h-50 text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed font-sans placeholder-gray-400 dark:placeholder-gray-500 overflow-hidden"
      />
    </div>
  )
}
