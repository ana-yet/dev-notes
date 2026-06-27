/**
 * UUID — Unique ID generation.
 *
 * Uses the native crypto.randomUUID() when available (Chrome 92+).
 * Falls back to a Math.random-based v4 UUID for older environments.
 *
 * Usage:
 *   generateId()  → "3b241101-e2bb-4d7a-8702-9e1a50fc7c3d"
 */

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback — cryptographically weaker but sufficient for client-side IDs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generates a short ID (8 hex chars) for non-critical uses like
 * notification IDs or temporary keys. Not guaranteed unique at scale.
 */
export function generateShortId() {
  return Math.random().toString(16).slice(2, 10)
}
