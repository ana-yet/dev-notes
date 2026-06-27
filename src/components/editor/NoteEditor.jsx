import { useState, useEffect, useMemo, useCallback } from 'react'
import EditorPlaceholder from './EditorPlaceholder'
import EditorHeader from './EditorHeader'
import EditorToolbar from './EditorToolbar'
import EditorContent from './EditorContent'
import NoteMetadata from './NoteMetadata'

/**
 * NoteEditor — Editable note panel with local draft state.
 *
 * Architecture:
 *   - Draft state (title, content) lives here as local React state.
 *   - The original note from the repository is compared to the draft
 *     to compute `isDirty`. The repository is NEVER written to directly.
 *   - The parent receives `onDirtyChange(isDirty)` so it can protect
 *     against accidental navigation.
 *   - `onSave(draft)` is called when the user clicks Save or presses
 *     Ctrl/Cmd+S. The parent decides what to do with it (for now: nothing).
 *
 * Why local draft state?
 *   Typing should not trigger repository writes. The draft is the source
 *   of truth while editing. Only explicit save actions (Ctrl+S, Save btn)
 *   should flush to the repository. This design naturally supports:
 *     - Autosave (just call onSave on a timer)
 *     - Undo (track draft history)
 *     - Conflict detection (compare draft timestamp vs repository timestamp)
 */

export default function NoteEditor({ note, folderName, onDirtyChange, onSave, saving }) {
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')

  // ── Sync draft when the selected note changes ──────────────
  // Only depends on note.id so editing doesn't re-sync mid-type.
  useEffect(() => {
    if (note) {
      setDraftTitle(note.title || '')
      setDraftContent(note.content || '')
    }
  }, [note?.id])

  // ── Compute dirty state ────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!note) return false
    return (
      draftTitle !== (note.title || '') ||
      draftContent !== (note.content || '')
    )
  }, [draftTitle, draftContent, note])

  // Report dirty state to parent
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // ── Save handler ───────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!isDirty) return
    onSave?.({ title: draftTitle, content: draftContent })
  }, [isDirty, draftTitle, draftContent, onSave])

  // ── Ctrl/Cmd + S keyboard shortcut ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  // ── No note selected ───────────────────────────────────────
  if (!note) {
    return <EditorPlaceholder />
  }

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        note={note}
        title={draftTitle}
        onTitleChange={setDraftTitle}
      />

      <EditorToolbar isDirty={isDirty} onSave={handleSave} saving={saving} />

      <div className="flex-1 overflow-y-auto">
        <EditorContent content={draftContent} onChange={setDraftContent} />
        <NoteMetadata note={note} folderName={folderName} />
      </div>
    </div>
  )
}
