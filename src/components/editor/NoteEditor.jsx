import EditorHeader from './EditorHeader'
import EditorToolbar from './EditorToolbar'
import EditorContent from './EditorContent'
import NoteMetadata from './NoteMetadata'

/**
 * NoteEditor — Layout shell for the editor.
 *
 * All state (draft, autosave, dirty, shortcuts) lives in EditorContext.
 * This component assumes a note exists — EditorProvider guarantees
 * the invariant by rendering EditorPlaceholder when note is null.
 * Child components read from context directly — no prop drilling.
 */
export default function NoteEditor() {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader />
      <EditorToolbar />
      <div className="flex-1 overflow-y-auto">
        <EditorContent />
        <NoteMetadata />
      </div>
    </div>
  )
}
