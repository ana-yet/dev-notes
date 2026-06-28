/** Read access for the folders currently displayed by the UI. */
import { getItem } from "../services/storage";
import { STORAGE_KEYS } from "../constants";
import logger from "../utils/logger";

const log = logger.create("FolderRepository");

export async function getAll() {
  try {
    return {
      data: await getItem(STORAGE_KEYS.FOLDERS, []),
      error: null,
    };
  } catch (err) {
    log.error("getAll failed:", err);
    return { data: [], error: "Failed to load folders" };
  }
}
