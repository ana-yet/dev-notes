import { Calendar, Clock, Folder, Tag } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/date'
import { useEditor } from '../../contexts/EditorContext'

/**
 * NoteMetadata — Displays metadata below the note content.
 *
 * Reads note and folderName from EditorContext.
 * Shows created/updated dates, folder name, and tags.
 */

export default function NoteMetadata() {
  const { note, folderName } = useEditor()

  return (
    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <MetadataItem icon={Calendar} label="Created">
          {formatDate(note.createdAt, 'short')}
          <span className="text-gray-400 dark:text-gray-600 ml-1.5">
            {formatTime(note.createdAt)}
          </span>
        </MetadataItem>

        <MetadataItem icon={Clock} label="Updated">
          {formatDate(note.updatedAt, 'short')}
          <span className="text-gray-400 dark:text-gray-600 ml-1.5">
            {formatTime(note.updatedAt)}
          </span>
        </MetadataItem>
      </div>

      {/* Folder */}
      {folderName && (
        <MetadataItem icon={Folder} label="Folder">
          {folderName}
        </MetadataItem>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <MetadataItem icon={Tag} label="Tags">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {note.tags.map((tagId) => (
              <span
                key={tagId}
                className="inline-block text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md"
              >
                {tagId}
              </span>
            ))}
          </div>
        </MetadataItem>
      )}

      {/* URL (if exists) */}
      {note.url && (
        <MetadataItem icon={Tag} label="Source">
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 hover:underline break-all text-xs"
          >
            {note.url}
          </a>
        </MetadataItem>
      )}
    </div>
  )
}

/**
 * MetadataItem — A single metadata row with icon, label, and value.
 */
function MetadataItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        size={14}
        className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
      />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  )
}
