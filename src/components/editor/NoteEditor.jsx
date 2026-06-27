import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import EditorPlaceholder from './EditorPlaceholder'
import EditorHeader from './EditorHeader'
import EditorToolbar from './EditorToolbar'
import EditorContent from './EditorContent'
import NoteMetadata from './NoteMetadata'
import { useAutosave } from '../../hooks/useAutosave'
import { LIMITS } from '../../constants'

/**
 * NoteEditor — Editable note panel with autosave.
 *
 * Architecture:
 *   - Draft state (title, content) lives here as local React state.
 *   - The useAutosave hook manages debounced saves. Every draft change
 *     resets the 800ms timer. When the user stops typing, the hook
 *     calls onSave (the same function used by manual save).
 *   - Ctrl/Cmd+S and the Save button cancel the timer and save immediately.
 *   - The parent provides onSave and receives onDirtyChange.
 *
 * Focus management:
 *   - When autoFocusTitle is true (e.g. after creating a new note),
 *     the title textarea receives focus and its text is selected so
 *     the user can immediately start typing a new title.
 */

export default function NoteEditor({ note, folderName, onDirtyChange, onSave, autoFocusTitle }) {
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const titleRef = useRef(null)

  // ── Autosave hook ──────────────────────────────────────────
  const autosave = useAutosave({
    onSave,
    delay: LIMITS.AUTOSAVE_DELAY_MS,
  })

  // ── Sync draft when the selected note changes ──────────────
  useEffect(() => {
    if (note) {
      setDraftTitle(note.title || '')
      setDraftContent(note.content || '')
      autosave.cancel() // Cancel any pending save from the previous note
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Schedule autosave when draft changes ────────────────────
  useEffect(() => {
    if (isDirty) {
      autosave.schedule({ title: draftTitle, content: draftContent })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftTitle, draftContent, isDirty])

  // ── Focus title when autoFocusTitle is set ──────────────────
  // Used after creating a new note so the user can immediately rename it.
  useEffect(() => {
    if (autoFocusTitle && note && titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current.focus()
        titleRef.current.select() // Select "Untitled Note" so user can type over it
      }, 50) // Small delay ensures DOM is ready after React render
      return () => clearTimeout(timer)
    }
  }, [autoFocusTitle, note?.id])

  // ── Manual save — cancels autosave timer, saves now ─────────
  const handleManualSave = useCallback(() => {
    if (!isDirty) return
    autosave.saveNow({ title: draftTitle, content: draftContent })
  }, [isDirty, draftTitle, draftContent, autosave])

  // ── Ctrl/Cmd + S keyboard shortcut ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleManualSave])

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
        titleRef={titleRef}
      />

      <EditorToolbar
        isDirty={isDirty}
        onSave={handleManualSave}
        saveStatus={autosave.saveStatus}
      />

      <div className="flex-1 overflow-y-auto">
        <EditorContent content={draftContent} onChange={setDraftContent} />
        <NoteMetadata note={note} folderName={folderName} />
      </div>
    </div>
  )
}
