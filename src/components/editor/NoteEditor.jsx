import EditorPlaceholder from './EditorPlaceholder'
import EditorHeader from './EditorHeader'
import EditorToolbar from './EditorToolbar'
import EditorContent from './EditorContent'
import NoteMetadata from './NoteMetadata'

/**
 * NoteEditor — Main editor panel for viewing a selected note.
 *
 * Composes the header, toolbar, content area, and metadata.
 * Shows EditorPlaceholder when no note is selected.
 *
 * This component is read-only. Editing, saving, and deleting
 * will be implemented in a future milestone by replacing the
 * content area with an editable textarea/editor.
 */

export default function NoteEditor({ note, folderName }) {
  if (!note) {
    return <EditorPlaceholder />
  }

  return (
    <div className="flex flex-col h-full">
      <EditorHeader note={note} />
      <EditorToolbar />
      <div className="flex-1 overflow-y-auto">
        <EditorContent content={note.content} />
        <NoteMetadata note={note} folderName={folderName} />
      </div>
    </div>
  )
}
