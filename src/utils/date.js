/**
 * Date — Formatting and relative-time utilities.
 *
 * All functions accept Date objects, ISO strings, or timestamps.
 * Output is human-readable and locale-aware via Intl.RelativeTimeFormat.
 */

/**
 * Formats a date for display in lists and cards.
 *
 * @param {Date|string|number} date
 * @param {'short'|'medium'|'long'} style
 * @returns {string} e.g. "Jun 27, 2026" or "6/27/2026"
 */
export function formatDate(date, style = 'medium') {
  const d = new Date(date)

  const formats = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }

  return new Intl.DateTimeFormat('en-US', formats[style]).format(d)
}
/**
 * Formats a time for display.
 *
 * @param {Date|string|number} date
 * @returns {string} e.g. "2:30 PM"
 */
export function formatTime(date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

/**
 * Returns a human-readable relative time string.
 *
 * @param {Date|string|number} date
 * @returns {string} e.g. "2 hours ago", "yesterday", "in 3 days"
 */
export function formatRelativeTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour')
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')

  // Beyond 30 days, fall back to an absolute date
  return formatDate(d)
}
