/**
 * DevNotes — Content Script
 *
 * Injected into every page the user visits.
 * Responsibilities (future):
 *   - Capture selected text for highlights
 *   - Detect page metadata (title, URL, description)
 *   - Enable "Save to DevNotes" context menu actions
 *   - Show inline annotations or highlights
 *   - Communicate with the background service worker
 */

console.log('[DevNotes] Content script loaded on:', window.location.href)
