/**
 * Storage — Application-level storage API.
 *
 * This is the module that components and contexts should import.
 * It delegates to chromeStorage for the actual Chrome API calls
 * but adds application-level conveniences:
 *
 *   - Default values: `getItem(key, fallback)` returns fallback when empty.
 *   - getItems / setItems: Batch operations for multiple keys.
 *   - Re-exports: Components never need to import chromeStorage directly.
 *
 * Usage:
 *   import { getItem, setItem } from '../services/storage'
 *
 *   const theme = await getItem(STORAGE_KEYS.THEME, 'system')
 *   await setItem(STORAGE_KEYS.THEME, 'dark')
 */

import {
  get,
  set,
  remove,
  getMultiple,
  setMultiple,
  getAll,
  clear,
  isAvailable,
} from './chromeStorage'

/**
 * Get a value with a default fallback.
 *
 * @param {string} key
 * @param {any} defaultValue — Returned when the key doesn't exist.
 * @returns {Promise<any>}
 */
export async function getItem(key, defaultValue = null) {
  const value = await get(key)
  return value !== null ? value : defaultValue
}

/**
 * Store a value.
 *
 * @param {string} key
 * @param {any} value
 * @returns {Promise<boolean>}
 */
export async function setItem(key, value) {
  return set(key, value)
}

/**
 * Remove a single key.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function removeItem(key) {
  return remove(key)
}

/**
 * Get multiple values with optional defaults.
 *
 * @param {string[]} keys
 * @param {Object} defaults — { key: fallbackValue }
 * @returns {Promise<Object>}
 */
export async function getItems(keys, defaults = {}) {
  const raw = await getMultiple(keys)
  const result = {}
  for (const key of keys) {
    result[key] = raw[key] ?? defaults[key] ?? null
  }
  return result
}

/**
 * Store multiple key-value pairs.
 *
 * @param {Object} items — { key1: value1, key2: value2 }
 * @returns {Promise<boolean>}
 */
export async function setItems(items) {
  return setMultiple(items)
}

/**
 * Retrieve ALL stored data. Primarily for debugging and export.
 */
export async function exportAll() {
  return getAll()
}

/**
 * Clear all extension data. Irreversible — use with caution.
 */
export async function clearAll() {
  return clear()
}

/**
 * Check if storage is available in the current context.
 */
export { isAvailable }
