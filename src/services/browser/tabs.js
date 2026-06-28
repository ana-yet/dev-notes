import logger from "../../utils/logger";

const log = logger.create("Tabs");

function getTabsApi() {
  return typeof chrome !== "undefined" && chrome.tabs ? chrome.tabs : null;
}

export function normalizeTab(tab) {
  if (!tab) return null;

  return {
    id: Number.isInteger(tab.id) ? tab.id : null,
    url: typeof tab.url === "string" ? tab.url : null,
    title: typeof tab.title === "string" ? tab.title : null,
    favIconUrl:
      typeof tab.favIconUrl === "string" ? tab.favIconUrl : null,
    active: Boolean(tab.active),
    windowId: Number.isInteger(tab.windowId) ? tab.windowId : null,
  };
}

export async function getCurrentTab() {
  try {
    const api = getTabsApi();
    if (!api) return null;

    const [tab] = await api.query({ active: true, currentWindow: true });
    return normalizeTab(tab);
  } catch (err) {
    log.error("getCurrentTab failed:", err);
    return null;
  }
}

export async function getTab(tabId) {
  try {
    const api = getTabsApi();
    if (!api) return null;
    return normalizeTab(await api.get(tabId));
  } catch (err) {
    log.error("getTab failed:", err);
    return null;
  }
}
