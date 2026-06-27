/**
 * Tabs Service — Safe wrappers around chrome.tabs API.
 *
 * Every method checks for API availability before calling Chrome.
 * This lets the side panel and popup use these functions without
 * crashing when the API isn't available (e.g. in content scripts).
 */

import logger from '../../utils/logger'

const log = logger.create('Tabs')

function getTabsApi() {
  return typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null
}

/**
 * Returns the currently active tab in the current window.
 *
 * @returns {Promise<chrome.tabs.Tab|null>}
 */
export async function getCurrentTab() {
  try {
    const api = getTabsApi()
    if (!api) return null

    const [tab] = await api.query({ active: true, currentWindow: true })
    return tab || null
  } catch (err) {
    log.error('getCurrentTab failed:', err)
    return null
  }
}

/**
 * Returns all tabs across all windows.
 *
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
export async function getAllTabs() {
  try {
    const api = getTabsApi()
    if (!api) return []

    return await api.query({})
  } catch (err) {
    log.error('getAllTabs failed:', err)
    return []
  }
}

/**
 * Opens a new tab with the given URL.
 *
 * @param {string} url
 * @returns {Promise<chrome.tabs.Tab|null>}
 */
export async function openTab(url) {
  try {
    const api = getTabsApi()
    if (!api) return null

    return await api.create({ url })
  } catch (err) {
    log.error('openTab failed:', err)
    return null
  }
}

/**
 * Closes one or more tabs by ID.
 *
 * @param {number|number[]} tabIds
 * @returns {Promise<boolean>}
 */
export async function closeTab(tabIds) {
  try {
    const api = getTabsApi()
    if (!api) return false

    await api.remove(tabIds)
    return true
  } catch (err) {
    log.error('closeTab failed:', err)
    return false
  }
}

/**
 * Returns the URL of the currently active tab.
 * Convenience shortcut used by Page Notes and Bookmarks.
 *
 * @returns {Promise<string|null>}
 */
export async function getCurrentTabUrl() {
  const tab = await getCurrentTab()
  return tab?.url || null
}
