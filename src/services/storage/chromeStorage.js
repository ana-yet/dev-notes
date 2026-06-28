/** The only low-level access point for chrome.storage.local. */
import logger from "../../utils/logger";

const log = logger.create("Storage");

function getStorageApi() {
  return typeof chrome !== "undefined" && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

export async function get(key) {
  try {
    const api = getStorageApi();
    if (!api) return null;

    const result = await api.get(key);
    return result[key] ?? null;
  } catch (err) {
    log.error(`get("${key}") failed:`, err);
    return null;
  }
}

export async function set(key, value) {
  try {
    const api = getStorageApi();
    if (!api) return false;

    await api.set({ [key]: value });
    return true;
  } catch (err) {
    log.error(`set("${key}") failed:`, err);
    return false;
  }
}
