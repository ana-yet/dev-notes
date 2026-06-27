/**
 * Messaging Service — Communication between extension contexts.
 *
 * Chrome extensions have isolated contexts (popup, side panel,
 * background, content script). They communicate via message passing.
 *
 * This module wraps chrome.runtime messaging with Promises and
 * provides a clean subscription pattern.
 */

import logger from '../../utils/logger'

const log = logger.create('Messaging')

/**
 * Sends a message to the background service worker.
 *
 * @param {Object} message — Must be JSON-serializable.
 * @returns {Promise<any>} The response from the background worker.
 */
export async function sendMessage(message) {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      log.debug('sendMessage skipped — not in extension context')
      return null
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime?.lastError) {
          log.error('sendMessage failed:', chrome.runtime.lastError.message)
          resolve(null)
          return
        }
        resolve(response)
      })
    })
  } catch (err) {
    log.error('sendMessage threw:', err)
    return null
  }
}

/**
 * Subscribes to incoming messages.
 *
 * The callback receives `(message, sender, sendResponse)`.
 * Return `true` from the callback if you need to send an async response.
 *
 * @param {Function} callback
 * @returns {Function} Unsubscribe function.
 */
export function onMessage(callback) {
  if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) {
    return () => {} // no-op in non-extension contexts
  }

  chrome.runtime.onMessage.addListener(callback)

  return () => {
    try {
      chrome.runtime.onMessage.removeListener(callback)
    } catch (err) {
      log.error('onMessage removeListener failed:', err)
    }
  }
}

/**
 * Sends a message to a specific tab's content script.
 *
 * @param {number} tabId
 * @param {Object} message
 * @returns {Promise<any>}
 */
export async function sendToTab(tabId, message) {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs?.sendMessage) {
      return null
    }

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime?.lastError) {
          log.error('sendToTab failed:', chrome.runtime.lastError.message)
          resolve(null)
          return
        }
        resolve(response)
      })
    })
  } catch (err) {
    log.error('sendToTab threw:', err)
    return null
  }
}
