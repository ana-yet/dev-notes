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

import {
  getActiveTabForWindow,
  getCurrentTab,
  getTab,
  normalizeTab,
} from "./browser/tabs";
import logger from "../utils/logger";

const log = logger.create("PageNoteService");

let listeners = new Set();
let cleanupFn = null;
let currentPageTab = null;
let lastAcceptedTimestamp = 0;
let lastAcceptedTabId = null;
let eventSequence = 0;

function getTimestamp() {
  eventSequence += 1;
  return Date.now() + eventSequence / 1000;
}

function summarizeTab(tab) {
  if (!tab) return null;

  return {
    id: tab.id,
    windowId: tab.windowId,
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
    active: tab.active,
  };
}

function isSupportedUrl(url) {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateCandidate(tab, timestamp) {
  const failures = [];

  if (!tab) failures.push("tab missing");
  if (tab && !Number.isInteger(tab.id)) failures.push("tab.id missing");
  if (tab && !tab.url) failures.push("tab.url missing");
  if (tab && !tab.title) failures.push("tab.title missing");
  if (tab?.url && !isSupportedUrl(tab.url)) failures.push("unsupported URL");
  if (timestamp <= lastAcceptedTimestamp) failures.push("stale event");

  return {
    valid: failures.length === 0,
    failures,
  };
}

function classifyEvent(eventName, tab, details = {}) {
  if (eventName === "tabs.onUpdated") {
    if (!tab?.active)
      return { action: "ignore", reason: "updated tab is not active" };
    if (!currentPageTab)
      return { action: "replace", reason: "initial active updated tab" };
    if (tab.id === currentPageTab.id)
      return { action: "refresh", reason: "metadata update for current page" };
    return {
      action: "ignore",
      reason: "metadata update belongs to a different active tab",
    };
  }

  if (eventName === "tabs.onActivated") {
    return { action: "replace", reason: "browser activated a tab" };
  }

  if (eventName === "windows.onFocusChanged") {
    if (details.windowId === chrome.windows.WINDOW_ID_NONE) {
      return { action: "ignore", reason: "no focused browser window" };
    }
    return { action: "replace", reason: "focused window changed" };
  }

  if (eventName === "initialQuery") {
    return { action: "replace", reason: "initial active page lookup" };
  }

  return { action: "ignore", reason: "unhandled event" };
}

function logTransition({
  eventName,
  timestamp,
  candidate,
  candidateKeys,
  classification,
  validation,
  accepted,
  previous,
  next,
  details = {},
}) {
  const level = accepted ? "info" : "warn";

  log[level]("[ActiveTabState]", {
    eventName,
    tabId: candidate?.id ?? null,
    windowId: candidate?.windowId ?? details.windowId ?? null,
    url: candidate?.url ?? null,
    title: candidate?.title ?? null,
    favIconUrl: candidate?.favIconUrl ?? null,
    timestamp,
    objectKeys: candidateKeys,
    previousActiveTab: summarizeTab(previous),
    nextActiveTab: summarizeTab(next),
    classification,
    validation,
    accepted,
    ignored: !accepted,
    lastAcceptedTimestamp,
    lastAcceptedTabId,
    details,
  });
}

function acceptCandidate(tab, timestamp) {
  currentPageTab = tab;
  lastAcceptedTimestamp = timestamp;
  lastAcceptedTabId = tab.id;
}

function evaluateCandidate(
  eventName,
  tab,
  {
    timestamp = getTimestamp(),
    candidateKeys = tab ? Object.keys(tab) : [],
    details = {},
  } = {},
) {
  const candidate = normalizeTab(tab);
  const previous = currentPageTab;
  const classification = classifyEvent(eventName, candidate, details);
  const validation = validateCandidate(candidate, timestamp);
  const accepted = classification.action !== "ignore" && validation.valid;

  if (accepted) {
    acceptCandidate(candidate, timestamp);
  }

  logTransition({
    eventName,
    timestamp,
    candidate,
    candidateKeys,
    classification,
    validation,
    accepted,
    previous,
    next: currentPageTab,
    details,
  });

  if (accepted) {
    notifyListeners(currentPageTab);
  }

  return currentPageTab;
}

async function initializeActivePage() {
  const timestamp = getTimestamp();
  const tab = await getCurrentTab();
  return evaluateCandidate("initialQuery", tab, {
    timestamp,
    candidateKeys: tab ? Object.keys(tab) : [],
    details: { source: "getCurrentTab" },
  });
}

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
    const timestamp = getTimestamp();
    try {
      getTab(activeInfo.tabId).then((tab) => {
        evaluateCandidate("tabs.onActivated", tab, {
          timestamp,
          candidateKeys: tab ? Object.keys(tab) : [],
          details: {
            source: "getTab",
            tabId: activeInfo.tabId,
            windowId: activeInfo.windowId,
          },
        });
      });
    } catch (err) {
      log.error("onActivated error:", err);
    }
  };

  const handleTabUpdated = (tabId, changeInfo, tab) => {
    const timestamp = getTimestamp();

    if (
      !changeInfo.url &&
      !changeInfo.title &&
      !changeInfo.favIconUrl &&
      changeInfo.status !== "complete"
    ) {
      evaluateCandidate("tabs.onUpdated", tab, {
        timestamp,
        candidateKeys: tab ? Object.keys(tab) : [],
        details: {
          source: "eventPayload",
          tabId,
          changeInfo,
        },
      });
      return;
    }

    evaluateCandidate("tabs.onUpdated", tab, {
      timestamp,
      candidateKeys: tab ? Object.keys(tab) : [],
      details: {
        source: "eventPayload",
        tabId,
        changeInfo,
      },
    });
  };

  // Re-query active tab when the user switches between Chrome windows.
  // onActivated only fires for tab switches within the same window.
  const handleWindowFocusChanged = async (windowId) => {
    const timestamp = getTimestamp();
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      evaluateCandidate("windows.onFocusChanged", null, {
        timestamp,
        candidateKeys: [],
        details: { windowId },
      });
      return;
    }

    try {
      const tab = await getActiveTabForWindow(windowId);
      evaluateCandidate("windows.onFocusChanged", tab, {
        timestamp,
        candidateKeys: tab ? Object.keys(tab) : [],
        details: {
          source: "getActiveTabForWindow",
          windowId,
        },
      });
    } catch (err) {
      log.error("onFocusChanged error:", err);
    }
  };

  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  chrome.windows.onFocusChanged.addListener(handleWindowFocusChanged);

  cleanupFn = () => {
    chrome.tabs.onActivated.removeListener(handleTabActivated);
    chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    chrome.windows.onFocusChanged.removeListener(handleWindowFocusChanged);
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
    if (currentPageTab) return currentPageTab;
    return await initializeActivePage();
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

  if (currentPageTab) {
    callback(currentPageTab);
  }

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
