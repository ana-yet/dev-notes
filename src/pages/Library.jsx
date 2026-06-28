import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Bookmark,
  Code,
  Highlighter,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
import { EmptyState } from "../components/ui";
import * as BookmarkRepository from "../repositories/BookmarkRepository";
import * as HighlightRepository from "../repositories/HighlightRepository";
import * as SnippetRepository from "../repositories/SnippetRepository";
import Toast from "../components/ui/Toast";

export default function Library() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'bookmarks' | 'reading_list' | 'snippets' | 'highlights'
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Creation forms state
  const [showAddForm, setShowAddForm] = useState(null); // 'bookmark' | 'snippet' | null
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch library data
  async function loadData() {
    setLoading(true);
    try {
      const [resB, resH, resS] = await Promise.all([
        BookmarkRepository.getAll(),
        HighlightRepository.getAll(),
        SnippetRepository.getAll(),
      ]);

      if (!resB.error) setBookmarks(resB.data);
      if (!resH.error) setHighlights(resH.data);
      if (!resS.error) setSnippets(resS.data);
    } catch (err) {
      console.error("Failed to load library items:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      await loadData();
    }
    load();
  }, []);

  // Handle deletions
  async function handleDeleteBookmark(id) {
    const { error } = await BookmarkRepository.remove(id);
    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      showToast("Item deleted successfully", "success");
    } else {
      showToast(error, "error");
    }
  }

  async function handleDeleteHighlight(id) {
    const { error } = await HighlightRepository.remove(id);
    if (!error) {
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      showToast("Highlight deleted successfully", "success");
    } else {
      showToast(error, "error");
    }
  }

  async function handleDeleteSnippet(id) {
    const { error } = await SnippetRepository.remove(id);
    if (!error) {
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      showToast("Snippet deleted successfully", "success");
    } else {
      showToast(error, "error");
    }
  }

  // Toggle Reading List state
  async function handleToggleReadingList(id) {
    const { data, error } = await BookmarkRepository.toggleProperty(
      id,
      "isReadingList",
    );
    if (!error && data) {
      setBookmarks((prev) => prev.map((b) => (b.id === id ? data : b)));
      showToast(
        data.isReadingList
          ? "Added to Reading List"
          : "Removed from Reading List",
        "success",
      );
    } else if (error) {
      showToast(error, "error");
    }
  }

  // Handle addition
  async function handleCreateItem(e) {
    e.preventDefault();
    setIsSubmitting(true);
    if (showAddForm === "bookmark") {
      const { data, error } = await BookmarkRepository.create({
        title: newTitle || newUrl,
        url: newUrl,
        description: newDescription,
        isReadingList: activeTab === "reading_list",
      });
      if (!error && data) {
        setBookmarks((prev) => [data, ...prev]);
        showToast("Bookmark added", "success");
        resetForm();
      } else {
        showToast(error || "Failed to create bookmark", "error");
      }
    } else if (showAddForm === "snippet") {
      const { data, error } = await SnippetRepository.create({
        title: newTitle,
        code: newCode,
        language: newLanguage,
      });
      if (!error && data) {
        setSnippets((prev) => [data, ...prev]);
        showToast("Snippet created", "success");
        resetForm();
      } else {
        showToast(error || "Failed to create snippet", "error");
      }
    }
    setIsSubmitting(false);
  }

  function resetForm() {
    setNewTitle("");
    setNewUrl("");
    setNewCode("");
    setNewDescription("");
    setShowAddForm(null);
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Code copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered lists based on tab and query
  const q = searchQuery.toLowerCase().trim();

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q));
      if (activeTab === "reading_list") return b.isReadingList && matchesSearch;
      if (activeTab === "bookmarks") return !b.isReadingList && matchesSearch;
      return matchesSearch;
    });
  }, [bookmarks, activeTab, q]);

  const filteredHighlights = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "highlights") return [];
    return highlights.filter(
      (h) =>
        h.text.toLowerCase().includes(q) ||
        h.pageTitle.toLowerCase().includes(q),
    );
  }, [highlights, activeTab, q]);

  const filteredSnippets = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "snippets") return [];
    return snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q),
    );
  }, [snippets, activeTab, q]);

  const hasItems = useMemo(() => {
    return (
      filteredBookmarks.length > 0 ||
      filteredHighlights.length > 0 ||
      filteredSnippets.length > 0
    );
  }, [filteredBookmarks, filteredHighlights, filteredSnippets]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-900/60 bg-white dark:bg-gray-900 flex flex-col gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved resources..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:text-gray-100 placeholder-gray-400 transition-all duration-200"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          {[
            { id: "all", label: "All" },
            { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
            { id: "reading_list", label: "Read Later", icon: BookOpen },
            { id: "snippets", label: "Snippets", icon: Code },
            { id: "highlights", label: "Highlights", icon: Highlighter },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setShowAddForm(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border shrink-0 transition-all cursor-pointer ${
                activeTab === id
                  ? "bg-violet-600 border-violet-600 text-white font-medium shadow-sm shadow-violet-500/10"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {Icon && <Icon size={12} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Manual Addition Triggers */}
        {activeTab !== "all" && activeTab !== "highlights" && !showAddForm && (
          <button
            onClick={() =>
              setShowAddForm(activeTab === "snippets" ? "snippet" : "bookmark")
            }
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 dark:border-gray-800 hover:border-violet-500 dark:hover:border-violet-400 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>
              Add {activeTab === "snippets" ? "Code Snippet" : "Bookmark"}
            </span>
          </button>
        )}

        {/* Add Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleCreateItem}
            className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl space-y-3 shadow-sm"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                Add {showAddForm === "snippet" ? "Snippet" : "Bookmark"}
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />

              {showAddForm === "bookmark" && (
                <>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (Optional)"
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </>
              )}

              {showAddForm === "snippet" && (
                <>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="plaintext">Plain Text</option>
                  </select>
                  <textarea
                    required
                    rows={4}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Paste code snippet here..."
                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                  />
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
            <span className="text-xs text-gray-400 mt-2">
              Loading resources...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasItems && (
          <EmptyState
            icon={
              activeTab === "snippets"
                ? Code
                : activeTab === "highlights"
                  ? Highlighter
                  : Bookmark
            }
            title={`No ${activeTab === "all" ? "resources" : activeTab.replace("_", " ")} yet`}
            description={
              searchQuery
                ? "No items match your active search filter."
                : 'Click the "+" button above or save items while browsing the web.'
            }
          />
        )}

        {/* Resource Items List */}
        {!loading && hasItems && (
          <div className="space-y-3.5">
            {/* Render Bookmarks & Reading List Items */}
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group p-3 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-900 rounded-xl hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-200 relative"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
                    <Bookmark size={14} />
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {bookmark.title}
                    </h4>
                    {bookmark.description && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {bookmark.description}
                      </p>
                    )}
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 inline-flex items-center gap-1 mt-1.5"
                    >
                      <span className="truncate max-w-xs">{bookmark.url}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Inline Actions */}
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleToggleReadingList(bookmark.id)}
                    title={
                      bookmark.isReadingList
                        ? "Move to Bookmarks"
                        : "Move to Read Later"
                    }
                    className={`p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors cursor-pointer ${
                      bookmark.isReadingList
                        ? "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                  >
                    <BookOpen size={11} />
                  </button>
                  <button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}

            {/* Render Code Snippets */}
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="group p-3 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-900 rounded-xl hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-200 relative"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                    <Code size={14} />
                  </div>
                  <div className="flex-1 min-w-0 pr-14">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {snippet.title}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md font-mono shrink-0">
                        {snippet.language}
                      </span>
                    </div>

                    <pre className="text-[10px] p-2 mt-2 bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-900 rounded-lg font-mono overflow-x-auto max-h-32">
                      {snippet.code}
                    </pre>
                  </div>
                </div>

                {/* Inline Actions */}
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => copyToClipboard(snippet.code, snippet.id)}
                    title="Copy code"
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    {copiedId === snippet.id ? (
                      <Check size={11} className="text-green-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSnippet(snippet.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}

            {/* Render Highlights */}
            {filteredHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="group p-3 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-900 rounded-xl hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-200 relative"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Highlighter size={14} />
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
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
                    <a
                      href={highlight.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-gray-400 hover:text-violet-600 dark:text-gray-500 dark:hover:text-violet-400 truncate max-w-xs inline-flex items-center gap-1 mt-2.5"
                    >
                      <span>From: {highlight.pageTitle || highlight.url}</span>
                      <ExternalLink size={8} />
                    </a>
                  </div>
                </div>

                {/* Inline Actions */}
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
