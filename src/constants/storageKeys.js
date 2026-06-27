/**
 * Storage Keys — Single source of truth for every chrome.storage key.
 *
 * Why a dedicated file?
 *   1. Prevents typos — misspelled keys silently create new storage entries.
 *   2. Makes refactoring easy — rename a key in one place.
 *   3. Surfaces all stored data at a glance — essential for debugging.
 *
 * Convention: UPPER_SNAKE_CASE, grouped by domain.
 */

export const STORAGE_KEYS = {
  // ── Theme & UI ──────────────────────────────────────────────
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',

  // ── Content domains ─────────────────────────────────────────
  NOTES: 'notes',
  FOLDERS: 'folders',
  TAGS: 'tags',
  BOOKMARKS: 'bookmarks',
  HIGHLIGHTS: 'highlights',
  SNIPPETS: 'snippets',
  READING_LIST: 'readingList',
  PAGE_NOTES: 'pageNotes',

  // ── User preferences ────────────────────────────────────────
  SETTINGS: 'settings',

  // ── Metadata ────────────────────────────────────────────────
  RECENTLY_OPENED: 'recentlyOpened',
  TRASH: 'trash',
}
