import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Globe,
  Bookmark,
  BookOpen,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";
import NoteEditor from "../components/editor/NoteEditor";
import Toast from "../components/ui/Toast";
import { EditorProvider } from "../contexts/EditorContext";
import { useNotes } from "../hooks/useNotes";
import { useFolders } from "../hooks/useFolders";
import { usePageNote } from "../hooks/usePageNote";
import * as HighlightRepository from "../repositories/HighlightRepository";
import * as BookmarkRepository from "../repositories/BookmarkRepository";
import logger from "../utils/logger";

const log = logger.create("PageNotes");

function areRecordArraysEqual(previous, next) {
  if (previous === next) return true;
  if (previous.length !== next.length) return false;

  return previous.every((item, index) => {
    const candidate = next[index];
    const keys = Object.keys(item);
    if (!candidate || keys.length !== Object.keys(candidate).length) return false;
    return keys.every((key) => {
      const left = item[key];
      const right = candidate[key];
      return Array.isArray(left) && Array.isArray(right)
        ? left.length === right.length && left.every((value, i) => value === right[i])
        : Object.is(left, right);
    });
  });
}

export default function PageNotes() {
  const { notes, loading: notesLoading, refresh } = useNotes();
  const { folders } = useFolders();
  const {
    activeTab,
    pageNote,
    pageState,
    hasNote,
    isDraft,
    loading: tabLoading,
    savePageNote,
  } = usePageNote(notes, { onPersist: refresh });

  // Resources local state for current tab
  const [highlights, setHighlights] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const [saveError, setSaveError] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Use activeTab directly — no mock fallback that masks bugs
  const currentTab = activeTab;
  const currentUrl = currentTab?.url;
  const currentHostname = useMemo(() => {
    try {
      return currentUrl ? new URL(currentUrl).hostname : "";
    } catch {
      return "";
    }
  }, [currentUrl]);

  // Load highlights & bookmarks matching current URL
  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      if (!currentUrl) {
        if (!cancelled) {
          setHighlights((previous) =>
            previous.length === 0 ? previous : [],
          );
          setBookmarks((previous) =>
            previous.length === 0 ? previous : [],
          );
        }
        return;
      }

      try {
        const [resH, resB] = await Promise.all([
          HighlightRepository.getAll(),
          BookmarkRepository.getAll(),
        ]);
        if (!cancelled) {
          if (!resH.error) {
            const next = resH.data.filter((h) => h.url === currentUrl);
            setHighlights((previous) =>
              areRecordArraysEqual(previous, next) ? previous : next,
            );
          }
          if (!resB.error) {
            const next = resB.data.filter((b) => b.url === currentUrl);
            setBookmarks((previous) =>
              areRecordArraysEqual(previous, next) ? previous : next,
            );
          }
        }
      } catch (err) {
        log.error("Failed to load page resources:", err);
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [currentUrl]);

  const isBookmarked = bookmarks.some((b) => !b.isReadingList);
  const isSavedToReadLater = bookmarks.some((b) => b.isReadingList);

  // Save handler for editor
  const handleSave = useCallback(async ({ title, content }) => {
    setSaveError(null);

    const { data, error: err } = await savePageNote({
      title,
      content,
    });

    if (err) {
      log.error("Save failed:", err);
      setSaveError(err);
    }
    return { data, error: err };
  }, [savePageNote]);

  // Add bookmark quick action
  const handleAddBookmark = async () => {
    if (isBookmarked) {
      // Remove it
      const item = bookmarks.find((b) => !b.isReadingList);
      if (item) {
        const { error } = await BookmarkRepository.remove(item.id);
        if (!error) {
          setBookmarks((prev) => prev.filter((b) => b.id !== item.id));
          showToast("Bookmark removed", "success");
        }
      }
    } else {
      const { data, error } = await BookmarkRepository.create({
        title: currentTab.title || "Untitled Page",
        url: currentTab.url,
        description: "Saved from DevNotes sidepanel",
        isReadingList: false,
        favicon: currentTab.favIconUrl,
      });
      if (!error && data) {
        setBookmarks((prev) => [...prev, data]);
        showToast("Bookmark saved", "success");
      }
    }
  };

  // Add read later quick action
  const handleAddReadLater = async () => {
    if (isSavedToReadLater) {
      // Remove it
      const item = bookmarks.find((b) => b.isReadingList);
      if (item) {
        const { error } = await BookmarkRepository.remove(item.id);
        if (!error) {
          setBookmarks((prev) => prev.filter((b) => b.id !== item.id));
          showToast("Removed from Read Later", "success");
        }
      }
    } else {
      const { data, error } = await BookmarkRepository.create({
        title: currentTab.title || "Untitled Page",
        url: currentTab.url,
        description: "Saved to Read Later from DevNotes",
        isReadingList: true,
        favicon: currentTab.favIconUrl,
      });
      if (!error && data) {
        setBookmarks((prev) => [...prev, data]);
        showToast("Saved to Read Later", "success");
      }
    }
  };

  // Copy markdown link quick action
  const handleCopyMarkdown = () => {
    const md = `[${currentTab.title}](${currentTab.url})`;
    navigator.clipboard.writeText(md);
    setCopiedLink(true);
    showToast("Markdown link copied", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Delete highlight
  const handleDeleteHighlight = async (id) => {
    const { error } = await HighlightRepository.remove(id);
    if (!error) {
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      showToast("Highlight deleted", "success");
    }
  };

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  const isLoading = notesLoading || tabLoading;

  // Guard: no active tab detected yet (initial load or tab unavailable)
  if (!currentTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <Globe size={28} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1.5">
          {isLoading ? "Detecting active page..." : "No active tab detected"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-55 leading-relaxed">
          {isLoading
            ? "Waiting for browser tab information."
            : "Open a web page in your browser to use Page Notes."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950 pb-6">
      {/* ── Active Tab Header Card ────────────────────────────────────── */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-900/60 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
            {currentTab?.favIconUrl ? (
              <img
                src={currentTab.favIconUrl}
                alt=""
                className="w-5 h-5 rounded-md"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <Globe size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Active Context{currentHostname ? ` · ${currentHostname}` : ""}
            </span>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5 leading-snug">
              {currentTab.title || "Untitled Page"}
            </h2>
            <a
              href={currentTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 inline-flex items-center gap-1 mt-1 truncate max-w-full"
            >
              <span className="truncate">{currentTab.url}</span>
              <ExternalLink size={10} className="shrink-0" />
            </a>
          </div>
        </div>

        {/* Note status & last updated info */}
        {pageNote && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500">
            <span
              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                isDraft
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                  : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${isDraft ? "bg-amber-500" : "bg-green-500"}`}
              />
              {isDraft ? "New Draft" : "Connected Note"}
            </span>
            {hasNote && pageNote.updatedAt && (
              <span>
                Last edited: {new Date(pageNote.updatedAt).toLocaleDateString()}
              </span>
            )}
            {pageState === "searching" && <span>Checking saved notes...</span>}
          </div>
        )}
      </div>

      {/* ── Page Content Scroll Area ──────────────────────────────────── */}
      <div className="px-4 py-4 space-y-5 flex-1">
        {/* SECTION 1: Page Note Editor */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Notes
          </h3>

          {pageNote ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-905 rounded-2xl overflow-hidden min-h-[220px] shadow-sm relative">
              <EditorProvider
                note={pageNote}
                folderName={
                  folders.find((f) => f.id === pageNote.folderId)?.name
                }
                onSave={handleSave}
                contextName="page"
                tab={currentTab}
              >
                <NoteEditor />
              </EditorProvider>
              {saveError && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Toast
                    message={`Save failed: ${saveError}`}
                    type="error"
                    onClose={() => setSaveError(null)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-900 rounded-2xl text-center shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tabLoading
                  ? "Preparing page note..."
                  : "This page cannot be used for page notes."}
              </span>
            </div>
          )}
        </div>

        {/* SECTION 2: Page Highlights */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Highlights ({highlights.length})
          </h3>

          {highlights.length > 0 ? (
            <div className="space-y-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="group p-3 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-900 rounded-xl relative hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-200"
                >
                  <p
                    className="text-xs text-gray-700 dark:text-gray-300 border-l-2 pl-2 border-violet-500/40 italic leading-relaxed"
                    style={{ borderLeftColor: highlight.color }}
                  >
                    "{highlight.text}"
                  </p>
                  {highlight.note && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      📝 {highlight.note}
                    </p>
                  )}
                  <button
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Delete highlight"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-900 rounded-2xl text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                <AlertCircle size={13} className="text-violet-500/70" />
                <span>Select text on this tab to save highlights.</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {/* Bookmark button */}
            <button
              onClick={handleAddBookmark}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                isBookmarked
                  ? "bg-violet-50/50 border-violet-200/80 text-violet-600 dark:bg-violet-950/20 dark:border-violet-900 dark:text-violet-400"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
              }`}
            >
              <Bookmark
                size={14}
                className={isBookmarked ? "fill-current" : ""}
              />
              <span>{isBookmarked ? "Bookmarked ✓" : "Bookmark Page"}</span>
            </button>

            {/* Read Later button */}
            <button
              onClick={handleAddReadLater}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                isSavedToReadLater
                  ? "bg-violet-50/50 border-violet-200/80 text-violet-600 dark:bg-violet-950/20 dark:border-violet-900 dark:text-violet-400"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
              }`}
            >
              <BookOpen size={14} />
              <span>
                {isSavedToReadLater ? "Read Later ✓" : "Save to Read Later"}
              </span>
            </button>

            {/* Copy Markdown link button */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 text-xs font-medium transition-all text-left cursor-pointer col-span-2"
            >
              {copiedLink ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
              <span>Copy Link as Markdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-16 right-4 z-50 max-w-xs">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
