/**
 * Storage Service — Barrel export.
 *
 * Components import from 'services/storage' and never touch
 * chromeStorage.js directly. This single import point makes
 * it trivial to swap the storage backend in the future
 * (e.g. IndexedDB, cloud sync).
 */

export {
  getItem,
  setItem,
  removeItem,
  getItems,
  setItems,
  exportAll,
  clearAll,
  isAvailable,
} from './storage'

export * as chromeStorage from './chromeStorage'
