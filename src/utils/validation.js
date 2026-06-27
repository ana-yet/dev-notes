/**
 * Validation — Input validation and sanitization helpers.
 *
 * These are pure predicate functions — they return booleans.
 * Used by forms, storage operations, and import/export logic.
 */

/**
 * Checks whether a string is a valid URL.
 */
export function isValidUrl(str) {
  if (typeof str !== 'string') return false
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * Checks whether a string is a valid email address.
 * Uses a pragmatic regex — not RFC-5322-complete but covers 99% of real emails.
 */
export function isValidEmail(str) {
  if (typeof str !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

/**
 * Checks whether a value is "empty" — null, undefined, empty string,
 * empty array, or empty object.
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Strips HTML tags from a string to prevent XSS when rendering
 * user-supplied content outside of a sanitizer.
 *
 * @param {string} str
 * @returns {string}
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Truncates a string to `maxLen` characters, appending "…" if truncated.
 *
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 100) {
  if (typeof str !== 'string') return ''
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Checks whether a string exceeds a maximum length.
 */
export function isTooLong(str, maxLen) {
  return typeof str === 'string' && str.length > maxLen
}
