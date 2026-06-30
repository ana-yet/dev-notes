import { Calendar, Clock, Folder, Tag, Globe } from "lucide-react";
import { formatDate, formatTime } from "../../utils/date";
import { useEditor } from "../../contexts/EditorContext";

/**
 * NoteMetadata — Compact metadata bar below the note content.
 *
 * Shows icon + value pairs: created/updated timestamps, folder,
 * tags, and source URL. Wraps on narrow screens.
 */

export default function NoteMetadata() {
  const { note, folderName } = useEditor();

  return (
    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/50">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Created */}
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} />
          <span>{formatDate(note.createdAt, "short")}</span>
          <span className="text-gray-400 dark:text-gray-600">
            {formatTime(note.createdAt)}
          </span>
        </span>

        {/* Updated */}
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={13} />
          <span>{formatDate(note.updatedAt, "short")}</span>
          <span className="text-gray-400 dark:text-gray-600">
            {formatTime(note.updatedAt)}
          </span>
        </span>

        {/* Folder */}
        {folderName && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Folder size={13} />
            <span>{folderName}</span>
          </span>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Tag size={13} />
            <span>{note.tags.join(", ")}</span>
          </span>
        )}

        {/* Source URL */}
        {note.url && (
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <Globe size={13} />
            <span className="truncate max-w-48">{note.url}</span>
          </a>
        )}
      </div>
    </div>
  );
}
