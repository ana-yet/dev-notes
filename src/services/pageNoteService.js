/**
 * PageNoteService — Coordinates browser tabs with page notes.
 *
 * Subscribes to Chrome tab events and notifies listeners when the
 * active tab changes. This is the ONLY module that listens to
 * chrome.tabs events — React components subscribe via the
 * usePageNote hook, which wraps this service.
 *
 * Why a service?
 *   - chrome.tabs event listeners are imperative, not React-friendly.
 *   - Centralizing tab tracking avoids duplicate listeners.
 *   - The service is testable and reusable outside React.
 */

import { getCurrentTab } from "./browser/tabs";
import logger from "../utils/logger";

const log = logger.create("PageNoteService");

let listeners = new Set();
let cleanupFn = null;

/**
 * Notifies all registered listeners of a tab change.
 * @param {Object|null} tab — The active tab, or null.
 */
function notifyListeners(tab) {
  for (const listener of listeners) {
    try {
      listener(tab);
    } catch (err) {
      log.error("Listener error:", err);
    }
  }
}

/**
 * Starts listening to Chrome tab events.
 * Safe to call multiple times — only attaches listeners once.
 */
function startListening() {
  if (cleanupFn) return;

  if (typeof chrome === "undefined" || !chrome.tabs) {
    log.debug("chrome.tabs unavailable — tab tracking disabled");
    return;
  }

  const handleTabActivated = (activeInfo) => {
    try {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime?.lastError) {
          log.error("tabs.get failed:", chrome.runtime.lastError.message);
          return;
        }
        log.debug("Tab activated:", tab?.title);
        notifyListeners(tab || null);
      });
    } catch (err) {
      log.error("onActivated error:", err);
    }
  };

  const handleTabUpdated = (tabId, changeInfo, tab) => {
    if (!tab.active) return;
    if (changeInfo.url || changeInfo.title || changeInfo.favIconUrl) {
      log.debug("Active tab updated:", changeInfo.url || changeInfo.title);
      notifyListeners(tab);
    }
  };

  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);

  cleanupFn = () => {
    chrome.tabs.onActivated.removeListener(handleTabActivated);
    chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    cleanupFn = null;
  };

  log.debug("Tab listeners attached");
}

/**
 * Gets the current active tab.
 *
 * @returns {Promise<Object|null>} The active tab, or null.
 */
export async function getActiveTab() {
  try {
    const tab = await getCurrentTab();
    return tab || null;
  } catch (err) {
    log.error("getActiveTab failed:", err);
    return null;
  }
}

/**
 * Subscribes to tab changes.
 *
 * The callback receives the active tab object (or null).
 * Call the returned function to unsubscribe.
 *
 * @param {Function} callback — (tab: Object|null) => void
 * @returns {Function} Unsubscribe function.
 */
export function subscribe(callback) {
  listeners.add(callback);
  startListening();

  // Return unsubscribe function
  return () => {
    listeners.delete(callback);

    // If no more listeners, clean up Chrome listeners
    if (listeners.size === 0 && cleanupFn) {
      cleanupFn();
      log.debug("Tab listeners detached — no subscribers");
    }
  };
}

/**
 * Removes all listeners and cleans up Chrome event listeners.
 * Called when the extension unloads.
 */
export function destroy() {
  listeners.clear();
  if (cleanupFn) {
    cleanupFn();
    log.debug("PageNoteService destroyed");
  }
}
