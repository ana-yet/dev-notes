/**
 * Tabs Service — Safe wrappers around chrome.tabs API.
 *
 * Every method checks for API availability before calling Chrome.
 * This lets the side panel and popup use these functions without
 * crashing when the API isn't available (e.g. in content scripts).
 */

import logger from "../../utils/logger";

const log = logger.create("Tabs");

const TAB_MODEL_KEYS = [
  "id",
  "url",
  "title",
  "favIconUrl",
  "active",
  "windowId",
];

function getTabsApi() {
  return typeof chrome !== "undefined" && chrome.tabs ? chrome.tabs : null;
}

function getPermissionsApi() {
  return typeof chrome !== "undefined" && chrome.permissions
    ? chrome.permissions
    : null;
}

function containsPermission(request) {
  const api = getPermissionsApi();
  if (!api?.contains) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      api.contains(request, (result) => {
        if (chrome.runtime?.lastError) {
          log.warn(
            "[TabDiagnostic] permissions.contains failed",
            chrome.runtime.lastError.message,
          );
          resolve(null);
          return;
        }
        resolve(Boolean(result));
      });
    } catch (err) {
      log.warn("[TabDiagnostic] permissions.contains error", err);
      resolve(null);
    }
  });
}

function getOriginPattern(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return `${parsed.origin}/*`;
  } catch {
    return null;
  }
}

async function getPermissionSnapshot(url) {
  const originPattern = getOriginPattern(url);

  return {
    permissionsApi: Boolean(getPermissionsApi()?.contains),
    tabs: await containsPermission({ permissions: ["tabs"] }),
    activeTab: await containsPermission({ permissions: ["activeTab"] }),
    allUrlsHost: await containsPermission({ origins: ["<all_urls>"] }),
    currentOrigin: originPattern
      ? await containsPermission({ origins: [originPattern] })
      : null,
  };
}

async function logTabDiagnostic(source, tab, context = {}) {
  const currentUrl = tab && typeof tab.url === "string" ? tab.url : null;
  const currentTitle = tab && typeof tab.title === "string" ? tab.title : null;

  log.info("[TabDiagnostic]", {
    source,
    returnedKeys: tab ? Object.keys(tab) : [],
    permissionsAvailable: await getPermissionSnapshot(currentUrl),
    currentUrl,
    currentTitle,
    ...context,
  });
}

/**
 * Converts Chrome's raw Tab object into the single model this app exposes.
 *
 * Sensitive fields such as url/title/favIconUrl may be absent from Chrome's
 * response when the extension lacks tab or host permissions. Keep the keys
 * stable so callers can distinguish "missing permission/data" from "different
 * object shape".
 *
 * @param {chrome.tabs.Tab|null|undefined} tab
 * @returns {{id:number|null,url:string|null,title:string|null,favIconUrl:string|null,active:boolean,windowId:number|null}|null}
 */
export function normalizeTab(tab) {
  if (!tab) return null;

  return {
    id: Number.isInteger(tab.id) ? tab.id : null,
    url: typeof tab.url === "string" ? tab.url : null,
    title: typeof tab.title === "string" ? tab.title : null,
    favIconUrl: typeof tab.favIconUrl === "string" ? tab.favIconUrl : null,
    active: Boolean(tab.active),
    windowId: Number.isInteger(tab.windowId) ? tab.windowId : null,
  };
}

/**
 * Returns the currently active tab in the current window.
 *
 * @returns {Promise<ReturnType<typeof normalizeTab>>}
 */
export async function getCurrentTab() {
  try {
    const api = getTabsApi();
    if (!api) return null;

    const [tab] = await api.query({ active: true, currentWindow: true });
    if (tab) {
      await logTabDiagnostic("query()", tab, {
        caller: "getCurrentTab",
        queryInfo: { active: true, currentWindow: true },
        normalizedKeys: TAB_MODEL_KEYS,
      });
    } else {
      log.warn("[getCurrentTab] no active tab found");
    }
    return normalizeTab(tab);
  } catch (err) {
    log.error("getCurrentTab failed:", err);
    return null;
  }
}

/**
 * Returns the active tab for a specific window.
 *
 * @param {number} windowId
 * @returns {Promise<ReturnType<typeof normalizeTab>>}
 */
export async function getActiveTabForWindow(windowId) {
  try {
    const api = getTabsApi();
    if (!api) return null;

    const queryInfo = { active: true, windowId };
    const [tab] = await api.query(queryInfo);
    if (tab) {
      await logTabDiagnostic("query()", tab, {
        caller: "getActiveTabForWindow",
        queryInfo,
        normalizedKeys: TAB_MODEL_KEYS,
      });
    } else {
      log.warn("[getActiveTabForWindow] no active tab found", { windowId });
    }
    return normalizeTab(tab);
  } catch (err) {
    log.error("getActiveTabForWindow failed:", err);
    return null;
  }
}

/**
 * Returns a tab by id.
 *
 * @param {number} tabId
 * @returns {Promise<ReturnType<typeof normalizeTab>>}
 */
export async function getTab(tabId) {
  try {
    const api = getTabsApi();
    if (!api) return null;

    const tab = await api.get(tabId);
    await logTabDiagnostic("get()", tab, {
      caller: "getTab",
      tabId,
      normalizedKeys: TAB_MODEL_KEYS,
    });
    return normalizeTab(tab);
  } catch (err) {
    log.error("getTab failed:", err);
    return null;
  }
}

/**
 * Returns all tabs across all windows.
 *
 * @returns {Promise<ReturnType<typeof normalizeTab>[]>}
 */
export async function getAllTabs() {
  try {
    const api = getTabsApi();
    if (!api) return [];

    const tabs = await api.query({});
    await Promise.all(
      tabs.map((tab) =>
        logTabDiagnostic("query()", tab, {
          caller: "getAllTabs",
          queryInfo: {},
          normalizedKeys: TAB_MODEL_KEYS,
        }),
      ),
    );
    return tabs.map(normalizeTab).filter(Boolean);
  } catch (err) {
    log.error("getAllTabs failed:", err);
    return [];
  }
}

/**
 * Opens a new tab with the given URL.
 *
 * @param {string} url
 * @returns {Promise<ReturnType<typeof normalizeTab>>}
 */
export async function openTab(url) {
  try {
    const api = getTabsApi();
    if (!api) return null;

    return normalizeTab(await api.create({ url }));
  } catch (err) {
    log.error("openTab failed:", err);
    return null;
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
    const api = getTabsApi();
    if (!api) return false;

    await api.remove(tabIds);
    return true;
  } catch (err) {
    log.error("closeTab failed:", err);
    return false;
  }
}

/**
 * Returns the URL of the currently active tab.
 * Convenience shortcut used by Page Notes and Bookmarks.
 *
 * @returns {Promise<string|null>}
 */
export async function getCurrentTabUrl() {
  const tab = await getCurrentTab();
  return tab?.url || null;
}
