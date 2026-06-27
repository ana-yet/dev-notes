import { Globe, FileText } from "lucide-react";

/**
 * ActiveNoteIndicator — Shows current page context above the notes list.
 *
 * Displays the active tab's favicon and title, plus a status badge
 * indicating whether a page note exists for the current URL.
 *
 * Used inside the PageNotes page's notes list.
 */
export default function ActiveNoteIndicator({ tab, hasNote, noteCount }) {
  if (!tab) return null;

  const faviconSrc = tab.favIconUrl || null;
  const pageTitle = tab.title || tab.url || "Unknown page";

  return (
    <div className="mx-4 mt-3 mb-1 px-3 py-2.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 rounded-lg">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Favicon or globe icon */}
        {faviconSrc ? (
          <img
            src={faviconSrc}
            alt=""
            className="w-4 h-4 rounded-sm shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <Globe
            size={14}
            className="text-violet-500 dark:text-violet-400 shrink-0"
          />
        )}

        {/* Page title */}
        <span className="text-xs font-medium text-violet-800 dark:text-violet-300 truncate flex-1 min-w-0">
          {pageTitle}
        </span>

        {/* Note status badge */}
        <span className="shrink-0 flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400">
          {hasNote ? (
            <>
              <FileText size={11} />
              Has Note ✓
            </>
          ) : (
            <>
              <Globe size={11} />
              No Note
            </>
          )}
        </span>
      </div>

      {/* Note count for this URL */}
      {hasNote && noteCount !== undefined && (
        <p className="text-[11px] text-violet-500 dark:text-violet-500 mt-1 ml-6">
          {noteCount} page note{noteCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
