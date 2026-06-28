/**
 * App — Global configuration constants.
 *
 * Version, name, and operational limits live here.
 * Components read from this file instead of hardcoding values,
 * so changing a limit or the app name is a single-line edit.
 */

/**
 * Operational limits — prevent runaway data and guide UI validation.
 * These are soft limits (enforced by the app, not by Chrome storage).
 */
export const LIMITS = {
  MAX_NOTE_TITLE_LENGTH: 200,
  MAX_NOTE_CONTENT_LENGTH: 100_000,
  MAX_TAGS_PER_NOTE: 10,
  /** Delay (ms) before auto-saving after the user stops typing. */
  AUTOSAVE_DELAY_MS: 1000,

  /** Delay (ms) before executing a search after keystroke. */
  SEARCH_DEBOUNCE_MS: 300,
}
