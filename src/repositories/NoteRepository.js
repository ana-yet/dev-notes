/**
 * NoteRepository — Data access layer for notes.
 *
 * This is the ONLY module that reads/writes notes in storage.
 * Components and hooks go through this repository — never directly
 * to the Storage Service.
 *
 * Every method returns { data, error } so callers can handle
 * failures without try/catch blocks.
 *
 * Storage format: A single JSON array under STORAGE_KEYS.NOTES.
 */

import { getItem, setItem } from "../services/storage";
import { STORAGE_KEYS } from "../constants";
import * as Note from "../models/note";
import logger from "../utils/logger";

const log = logger.create("NoteRepository");

// ── Internal helpers ──────────────────────────────────────────────────────

async function loadAll() {
  return await getItem(STORAGE_KEYS.NOTES, []);
}
async function saveAll(notes) {
  return await setItem(STORAGE_KEYS.NOTES, notes);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all notes (including archived).
 *
 * @returns {Promise<{ data: Object[], error: string|null }>}
 */
export async function getAll() {
  try {
    const notes = await loadAll();
    return { data: notes, error: null };
  } catch (err) {
    log.error("getAll failed:", err);
    return { data: [], error: "Failed to load notes" };
  }
}

/**
 * Creates a new note and persists it.
 *
 * @param {Object} data — Partial note data (merged with defaults).
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function create(data = {}) {
  try {
    const note = Note.create(data);
    const { valid, errors } = Note.validate(note);

    if (!valid) {
      return { data: null, error: errors.join(", ") };
    }

    const notes = await loadAll();
    notes.unshift(note); // newest first
    await saveAll(notes);

    log.info("Note created:", note.id);
    return { data: note, error: null };
  } catch (err) {
    log.error("create failed:", err);
    return { data: null, error: "Failed to create note" };
  }
}

/**
 * Updates an existing note by merging partial data.
 *
 * @param {string} id
 * @param {Object} data — Fields to update.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function update(id, data) {
  try {
    const notes = await loadAll();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return { data: null, error: "Note not found" };
    }

    const updated = {
      ...notes[index],
      ...data,
      id, // prevent ID overwrite
      updatedAt: new Date().toISOString(),
    };

    const { valid, errors } = Note.validate(updated);
    if (!valid) {
      return { data: null, error: errors.join(", ") };
    }

    notes[index] = updated;
    await saveAll(notes);

    return { data: updated, error: null };
  } catch (err) {
    log.error("update failed:", err);
    return { data: null, error: "Failed to update note" };
  }
}

/**
 * Permanently deletes a note.
 *
 * @param {string} id
 * @returns {Promise<{ data: boolean, error: string|null }>}
 */
export async function remove(id) {
  try {
    const notes = await loadAll();
    const filtered = notes.filter((n) => n.id !== id);

    if (filtered.length === notes.length) {
      return { data: false, error: "Note not found" };
    }

    await saveAll(filtered);
    log.info("Note deleted:", id);
    return { data: true, error: null };
  } catch (err) {
    log.error("remove failed:", err);
    return { data: false, error: "Failed to delete note" };
  }
}

/**
 * Moves a note to Trash (soft delete).
 *
 * Sets isDeleted = true and deletedAt = current timestamp.
 * The note remains in storage but is hidden from normal views.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function trash(id) {
  return update(id, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    isPinned: false, // Unpin when trashing
  });
}

/**
 * Restores a note from Trash.
 *
 * Sets isDeleted = false and clears deletedAt.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function restoreFromTrash(id) {
  return update(id, {
    isDeleted: false,
    deletedAt: null,
  });
}

/**
 * Permanently removes all notes in Trash.
 * This is irreversible — the data is gone from storage.
 *
 * @returns {Promise<{ data: number, error: string|null }>} Number of notes removed.
 */
export async function emptyTrash() {
  try {
    const notes = await loadAll();
    const active = notes.filter((n) => !n.isDeleted);
    const removedCount = notes.length - active.length;

    await saveAll(active);
    log.info("Trash emptied:", removedCount, "notes permanently deleted");
    return { data: removedCount, error: null };
  } catch (err) {
    log.error("emptyTrash failed:", err);
    return { data: 0, error: "Failed to empty trash" };
  }
}

/**
 * Searches notes by title and content (case-insensitive).
 *
 * @param {string} query
 * @returns {Promise<{ data: Object[], error: string|null }>}
 */
export async function search(query) {
  try {
    if (!query || typeof query !== "string") {
      return { data: [], error: null };
    }

    const notes = await loadAll();
    const q = query.toLowerCase().trim();

    if (!q) return { data: notes, error: null };

    const results = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.url && n.url.toLowerCase().includes(q)),
    );

    return { data: results, error: null };
  } catch (err) {
    log.error("search failed:", err);
    return { data: [], error: "Failed to search notes" };
  }
}

/**
 * Finds a note by its URL (exact match, case-insensitive).
 *
 * @param {string} url
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function getByUrl(url) {
  try {
    if (!url || typeof url !== "string") {
      return { data: null, error: null };
    }

    const notes = await loadAll();
    const normalUrl = url.trim().toLowerCase();

    const note =
      notes.find(
        (n) =>
          n.url && n.url.trim().toLowerCase() === normalUrl && !n.isDeleted,
      ) || null;

    return { data: note, error: null };
  } catch (err) {
    log.error("getByUrl failed:", err);
    return { data: null, error: "Failed to find note by URL" };
  }
}

/**
 * Creates a note from an in-memory draft.
 *
 * @param {Object} draft — Draft note data with url, title, content.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function createFromDraft(draft) {
  try {
    if (!draft || typeof draft !== "object") {
      log.error("createFromDraft: invalid draft object:", draft);
      return { data: null, error: "Invalid draft object" };
    }

    const url = draft.url?.trim();
    if (!url) {
      log.error(
        "createFromDraft: draft has no URL. Full draft:",
        JSON.stringify({
          id: draft.id,
          url: draft.url,
          title: draft.title,
          favIconUrl: draft.favIconUrl,
        }),
      );
      return { data: null, error: "No URL provided" };
    }

    // Prevent duplicate page notes for the same URL
    const { data: existing } = await getByUrl(url);
    if (existing) {
      log.info("Page note already exists for:", url);
      return update(existing.id, {
        title: draft.title?.trim() || existing.title || url,
        content: draft.content || "",
      });
    }

    const note = Note.create({
      title: draft.title?.trim() || url,
      content: draft.content || "",
      folderId: draft.folderId || null,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      url,
    });

    const { valid, errors } = Note.validate(note);
    if (!valid) {
      return { data: null, error: errors.join(", ") };
    }

    const notes = await loadAll();
    notes.unshift(note);
    await saveAll(notes);

    log.info("Page note created:", note.id, "for", url);
    return { data: note, error: null };
  } catch (err) {
    log.error("createFromDraft failed:", err);
    return { data: null, error: "Failed to create page note" };
  }
}
