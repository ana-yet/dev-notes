import { useEditor } from '../../contexts/EditorContext'
import EditorPlaceholder from './EditorPlaceholder'
import EditorHeader from './EditorHeader'
import EditorToolbar from './EditorToolbar'
import EditorContent from './EditorContent'
import NoteMetadata from './NoteMetadata'

/**
 * NoteEditor — Layout shell for the editor.
 *
 * All state (draft, autosave, dirty, shortcuts) lives in EditorContext.
 * This component only decides: show placeholder or editor layout.
 * Child components read from context directly — no prop drilling.
 */
export default function NoteEditor() {
  const { note } = useEditor()

  if (!note) {
    return <EditorPlaceholder />
  }

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
