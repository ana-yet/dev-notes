/**
 * Notifications Service — Chrome desktop notifications.
 *
 * Requires the "notifications" permission in manifest.json.
 * Add it when notifications are actually used — don't request
 * permissions the extension doesn't need yet.
 *
 * Usage:
 *   import { showNotification } from '../services/browser/notifications'
 *   showNotification('note-saved', { title: 'DevNotes', message: 'Note saved!' })
 */

import logger from '../../utils/logger'
import { getURL } from './runtime'

const log = logger.create('Notifications')

/**
 * Shows a basic desktop notification.
 *
 * @param {string} id — Unique identifier. Reusing an ID replaces the previous notification.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @returns {Promise<string|null>} The notification ID, or null on failure.
 */
export async function showNotification(id, { title, message }) {
  try {
    if (typeof chrome === 'undefined' || !chrome.notifications?.create) {
      log.debug('Notifications API unavailable')
      return null
    }

    return new Promise((resolve) => {
      chrome.notifications.create(
        id,
        {
          type: 'basic',
          iconUrl: getURL('icons/icon128.png'),
          title,
          message,
        },
        (notificationId) => {
          if (chrome.runtime?.lastError) {
            log.error('showNotification failed:', chrome.runtime.lastError.message)
            resolve(null)
            return
          }
          resolve(notificationId)
        }
      )
    })
  } catch (err) {
    log.error('showNotification threw:', err)
    return null
  }
}

/**
 * Clears a notification by ID.
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function clearNotification(id) {
  try {
    if (typeof chrome === 'undefined' || !chrome.notifications?.clear) {
      return false
    }

    return new Promise((resolve) => {
      chrome.notifications.clear(id, (wasCleared) => {
        resolve(wasCleared)
      })
    })
  } catch (err) {
    log.error('clearNotification threw:', err)
    return false
  }
}
