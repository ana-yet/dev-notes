/**
 * chromeStorage — Low-level wrapper around chrome.storage.local.
 *
 * This is the ONLY file that touches `chrome.storage.local` directly.
 * Every other module (including contexts and services) goes through
 * the higher-level `storage.js` which re-exports from here.
 *
 * Design decisions:
 *   - All methods return Promises (Chrome's callback API is wrapped).
 *   - Every method has try/catch — storage failures never crash the app.
 *   - When chrome.storage is unavailable (e.g. during `npm run dev`),
 *     methods return safe fallbacks (null / false / {}) instead of throwing.
 */

import logger from '../../utils/logger'

const log = logger.create('Storage')

// ── Availability check ─────────────────────────────────────────────────────

function getStorageApi() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return chrome.storage.local
  }
  return null
}

// ── Core operations ────────────────────────────────────────────────────────

/**
 * Retrieves a single value by key.
 *
 * @param {string} key
 * @returns {Promise<any|null>} The stored value, or null if not found / unavailable.
 */
export async function get(key) {
  try {
    const api = getStorageApi()
    if (!api) return null

    return new Promise((resolve) => {
      api.get(key, (result) => {
        if (chrome.runtime?.lastError) {
          log.error(`get("${key}") failed:`, chrome.runtime.lastError.message)
          resolve(null)
          return
        }
        resolve(result[key] ?? null)
      })
    })
  } catch (err) {
    log.error(`get("${key}") threw:`, err)
    return null
  }
}

/**
 * Stores a single key-value pair.
 *
 * @param {string} key
 * @param {any} value — Must be JSON-serializable.
 * @returns {Promise<boolean>} true on success, false on failure.
 */
export async function set(key, value) {
  try {
    const api = getStorageApi()
    if (!api) return false

    return new Promise((resolve) => {
      api.set({ [key]: value }, () => {
        if (chrome.runtime?.lastError) {
          log.error(`set("${key}") failed:`, chrome.runtime.lastError.message)
          resolve(false)
          return
        }
        resolve(true)
      })
    })
  } catch (err) {
    log.error(`set("${key}") threw:`, err)
    return false
  }
}

/**
 * Removes a single key from storage.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function remove(key) {
  try {
    const api = getStorageApi()
    if (!api) return false

    return new Promise((resolve) => {
      api.remove(key, () => {
        if (chrome.runtime?.lastError) {
          log.error(`remove("${key}") failed:`, chrome.runtime.lastError.message)
          resolve(false)
          return
        }
        resolve(true)
      })
    })
  } catch (err) {
    log.error(`remove("${key}") threw:`, err)
    return false
  }
}

/**
 * Retrieves multiple values by their keys.
 *
 * @param {string[]} keys
 * @returns {Promise<Object>} Key-value map. Missing keys are omitted.
 */
export async function getMultiple(keys) {
  try {
    const api = getStorageApi()
    if (!api) return {}

    return new Promise((resolve) => {
      api.get(keys, (result) => {
        if (chrome.runtime?.lastError) {
          log.error('getMultiple failed:', chrome.runtime.lastError.message)
          resolve({})
          return
        }
        resolve(result)
      })
    })
  } catch (err) {
    log.error('getMultiple threw:', err)
    return {}
  }
}

/**
 * Stores multiple key-value pairs at once.
 *
 * @param {Object} items — { key1: value1, key2: value2 }
 * @returns {Promise<boolean>}
 */
export async function setMultiple(items) {
  try {
    const api = getStorageApi()
    if (!api) return false

    return new Promise((resolve) => {
      api.set(items, () => {
        if (chrome.runtime?.lastError) {
          log.error('setMultiple failed:', chrome.runtime.lastError.message)
          resolve(false)
          return
        }
        resolve(true)
      })
    })
  } catch (err) {
    log.error('setMultiple threw:', err)
    return false
  }
}

/**
 * Retrieves ALL data in storage. Use sparingly.
 *
 * @returns {Promise<Object>}
 */
export async function getAll() {
  try {
    const api = getStorageApi()
    if (!api) return {}

    return new Promise((resolve) => {
      api.get(null, (result) => {
        if (chrome.runtime?.lastError) {
          log.error('getAll failed:', chrome.runtime.lastError.message)
          resolve({})
          return
        }
        resolve(result)
      })
    })
  } catch (err) {
    log.error('getAll threw:', err)
    return {}
  }
}

/**
 * Clears ALL extension data from storage. Irreversible.
 *
 * @returns {Promise<boolean>}
 */
export async function clear() {
  try {
    const api = getStorageApi()
    if (!api) return false

    return new Promise((resolve) => {
      api.clear(() => {
        if (chrome.runtime?.lastError) {
          log.error('clear failed:', chrome.runtime.lastError.message)
          resolve(false)
          return
        }
        log.warn('Storage cleared — all data removed')
        resolve(true)
      })
    })
  } catch (err) {
    log.error('clear threw:', err)
    return false
  }
}

/**
 * Checks whether chrome.storage is available in the current context.
 * Useful for feature-detection in components.
 */
export function isAvailable() {
  return getStorageApi() !== null
}
