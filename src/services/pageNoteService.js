/**
 * Shares one active-tab event pipeline between all page-note subscribers.
 * The side panel follows the active tab in the Chrome window that owns it.
 */
import { getCurrentTab, getTab, normalizeTab } from "./browser/tabs";
import logger from "../utils/logger";

const log = logger.create("PageNoteService");

const listeners = new Set();
let cleanupFn = null;
let currentPageTab = null;
let trackedWindowId = null;
let initializationPromise = null;
let eventSequence = 0;
let lastAcceptedSequence = 0;
let lifecycleGeneration = 0;

function areTabsEqual(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;

  return (
    left.id === right.id &&
    left.windowId === right.windowId &&
    left.url === right.url &&
    left.title === right.title &&
    left.favIconUrl === right.favIconUrl &&
    left.active === right.active
  );
}

function nextSequence() {
  eventSequence += 1;
  return eventSequence;
}

function notifyListeners(tab) {
  for (const listener of listeners) {
    try {
      listener(tab);
    } catch (err) {
      log.error("Listener error:", err);
    }
  }
}

function acceptCandidate(tab, sequence, generation) {
  if (generation !== lifecycleGeneration || sequence < lastAcceptedSequence) {
    return currentPageTab;
  }

  const candidate = normalizeTab(tab);
  if (
    !Number.isInteger(candidate?.id) ||
    !candidate.url ||
    (trackedWindowId !== null && candidate.windowId !== trackedWindowId)
  ) {
    return currentPageTab;
  }

  lastAcceptedSequence = sequence;
  if (areTabsEqual(currentPageTab, candidate)) return currentPageTab;

  currentPageTab = candidate;
  notifyListeners(candidate);
  return candidate;
}

async function initializeActivePage() {
  const generation = lifecycleGeneration;
  const sequence = nextSequence();
  const tab = await getCurrentTab();

  if (generation !== lifecycleGeneration) return null;
  trackedWindowId = tab?.windowId ?? null;
  return acceptCandidate(tab, sequence, generation);
}

async function getActiveTab() {
  try {
    if (currentPageTab) return currentPageTab;
    if (!initializationPromise) {
      const pending = initializeActivePage();
      initializationPromise = pending;
      pending.finally(() => {
        if (initializationPromise === pending) initializationPromise = null;
      });
    }
    return await initializationPromise;
  } catch (err) {
    log.error("getActiveTab failed:", err);
    return null;
  }
}

function startListening() {
  if (cleanupFn) return;
  if (typeof chrome === "undefined" || !chrome.tabs) return;

  const generation = lifecycleGeneration;

  const handleTabActivated = async ({ tabId, windowId }) => {
    const sequence = nextSequence();

    // The initial query identifies the side panel's owning window.
    if (trackedWindowId === null) await getActiveTab();
    if (
      generation !== lifecycleGeneration ||
      windowId !== trackedWindowId
    ) {
      return;
    }

    const tab = await getTab(tabId);
    acceptCandidate(tab, sequence, generation);
  };

  const handleTabUpdated = (_tabId, changeInfo, tab) => {
    if (!tab.active || tab.windowId !== trackedWindowId) return;

    const relevantChange =
      "url" in changeInfo ||
      "title" in changeInfo ||
      "favIconUrl" in changeInfo ||
      changeInfo.status === "complete";

    if (relevantChange) {
      acceptCandidate(tab, nextSequence(), generation);
    }
  };

  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);

  cleanupFn = () => {
    chrome.tabs.onActivated.removeListener(handleTabActivated);
    chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    cleanupFn = null;
  };
}

export function subscribe(callback) {
  listeners.add(callback);
  startListening();

  if (currentPageTab) callback(currentPageTab);
  else void getActiveTab();

  return () => {
    listeners.delete(callback);
    if (listeners.size > 0) return;

    cleanupFn?.();
    lifecycleGeneration += 1;
    currentPageTab = null;
    trackedWindowId = null;
    initializationPromise = null;
    lastAcceptedSequence = 0;
    eventSequence = 0;
  };
}
