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

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import { Note } from '../models'
import logger from '../utils/logger'

const log = logger.create('NoteRepository')

// ── Internal helpers ──────────────────────────────────────────────────────

async function loadAll() {
  return await getItem(STORAGE_KEYS.NOTES, [])
}

async function saveAll(notes) {
  return await setItem(STORAGE_KEYS.NOTES, notes)
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all notes (including archived).
 *
 * @returns {Promise<{ data: Object[], error: string|null }>}
 */
export async function getAll() {
  try {
    const notes = await loadAll()
    return { data: notes, error: null }
  } catch (err) {
    log.error('getAll failed:', err)
    return { data: [], error: 'Failed to load notes' }
  }
}

/**
 * Returns a single note by ID.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function getById(id) {
  try {
    const notes = await loadAll()
    const note = notes.find((n) => n.id === id) || null
    return { data: note, error: null }
  } catch (err) {
    log.error('getById failed:', err)
    return { data: null, error: 'Failed to load note' }
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
    const note = Note.create(data)
    const { valid, errors } = Note.validate(note)

    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    const notes = await loadAll()
    notes.unshift(note) // newest first
    await saveAll(notes)

    log.info('Note created:', note.id)
    return { data: note, error: null }
  } catch (err) {
    log.error('create failed:', err)
    return { data: null, error: 'Failed to create note' }
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
    const notes = await loadAll()
    const index = notes.findIndex((n) => n.id === id)

    if (index === -1) {
      return { data: null, error: 'Note not found' }
    }

    const updated = {
      ...notes[index],
      ...data,
      id, // prevent ID overwrite
      updatedAt: new Date().toISOString(),
    }

    const { valid, errors } = Note.validate(updated)
    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    notes[index] = updated
    await saveAll(notes)

    return { data: updated, error: null }
  } catch (err) {
    log.error('update failed:', err)
    return { data: null, error: 'Failed to update note' }
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
    const notes = await loadAll()
    const filtered = notes.filter((n) => n.id !== id)

    if (filtered.length === notes.length) {
      return { data: false, error: 'Note not found' }
    }

    await saveAll(filtered)
    log.info('Note deleted:', id)
    return { data: true, error: null }
  } catch (err) {
    log.error('remove failed:', err)
    return { data: false, error: 'Failed to delete note' }
  }
}

/**
 * Soft-deletes a note by marking it as archived.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function archive(id) {
  return update(id, { isArchived: true })
}

/**
 * Restores an archived note.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function restore(id) {
  return update(id, { isArchived: false })
}

/**
 * Pins a note so it appears at the top of lists.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function pin(id) {
  return update(id, { isPinned: true })
}

/**
 * Unpins a note.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function unpin(id) {
  return update(id, { isPinned: false })
}

/**
 * Toggles the favorite status of a note.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function toggleFavorite(id) {
  try {
    const { data: note, error } = await getById(id)
    if (error || !note) {
      return { data: null, error: error || 'Note not found' }
    }
    return update(id, { isFavorite: !note.isFavorite })
  } catch (err) {
    log.error('toggleFavorite failed:', err)
    return { data: null, error: 'Failed to toggle favorite' }
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
    if (!query || typeof query !== 'string') {
      return { data: [], error: null }
    }

    const notes = await loadAll()
    const q = query.toLowerCase().trim()

    if (!q) return { data: notes, error: null }

    const results = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    )

    return { data: results, error: null }
  } catch (err) {
    log.error('search failed:', err)
    return { data: [], error: 'Failed to search notes' }
  }
}
