/**
 * Runtime Service — Extension lifecycle and environment utilities.
 *
 * Provides safe access to chrome.runtime methods and
 * environment detection helpers used across the extension.
 */

import logger from '../../utils/logger'

const log = logger.create('Runtime')

/**
 * Returns the extension's manifest object.
 *
 * @returns {Object|null}
 */
export function getManifest() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
      return chrome.runtime.getManifest()
    }
    return null
  } catch (err) {
    log.error('getManifest failed:', err)
    return null
  }
}

/**
 * Converts a relative path to a fully-qualified extension URL.
 *
 * @param {string} path — e.g. 'icons/icon128.png'
 * @returns {string} e.g. 'chrome-extension://abcdef/icons/icon128.png'
 */
export function getURL(path) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(path)
    }
    return path
  } catch (err) {
    log.error('getURL failed:', err)
    return path
  }
}

/**
 * Detects whether the current context is a Chrome extension
 * (as opposed to a regular web page or `npm run dev`).
 *
 * @returns {boolean}
 */
export function isExtensionContext() {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.runtime &&
    !!chrome.runtime.id
  )
}

/**
 * Returns the extension's version string from the manifest.
 *
 * @returns {string} e.g. '0.1.0'
 */
export function getVersion() {
  const manifest = getManifest()
  return manifest?.version || '0.0.0'
}

/**
 * Reloads the extension. Useful after applying settings that
 * require a full restart.
 */
export function reload() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.reload) {
      chrome.runtime.reload()
    }
  } catch (err) {
    log.error('reload failed:', err)
  }
}
