/**
 * EditorContent — Displays the note's content as plain text.
 *
 * For now, markdown is shown as-is (not rendered). This keeps the
 * editor read-only and simple. Markdown rendering comes later.
 *
 * Uses `whitespace-pre-wrap` to preserve line breaks from the
 * original markdown source.
 */

export default function EditorContent({ content }) {
  if (!content) {
    return (
      <div className="px-5 py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          This note has no content.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-4">
      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
        {content}
      </pre>
    </div>
  )
}
