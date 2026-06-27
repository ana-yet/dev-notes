/**
 * FolderRepository — Data access layer for folders.
 *
 * Folders provide hierarchical organization for notes, bookmarks, and snippets.
 * Storage format: A single JSON array under STORAGE_KEYS.FOLDERS.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import { Folder } from '../models'
import logger from '../utils/logger'

const log = logger.create('FolderRepository')

// ── Internal helpers ──────────────────────────────────────────────────────

async function loadAll() {
  return await getItem(STORAGE_KEYS.FOLDERS, [])
}

async function saveAll(folders) {
  return await setItem(STORAGE_KEYS.FOLDERS, folders)
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all folders.
 *
 * @returns {Promise<{ data: Object[], error: string|null }>}
 */
export async function getAll() {
  try {
    const folders = await loadAll()
    return { data: folders, error: null }
  } catch (err) {
    log.error('getAll failed:', err)
    return { data: [], error: 'Failed to load folders' }
  }
}

/**
 * Returns a single folder by ID.
 *
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function getById(id) {
  try {
    const folders = await loadAll()
    const folder = folders.find((f) => f.id === id) || null
    return { data: folder, error: null }
  } catch (err) {
    log.error('getById failed:', err)
    return { data: null, error: 'Failed to load folder' }
  }
}

/**
 * Creates a new folder.
 *
 * @param {Object} data — Partial folder data.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function create(data = {}) {
  try {
    const folder = Folder.create(data)
    const { valid, errors } = Folder.validate(folder)

    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    const folders = await loadAll()
    folders.push(folder)
    await saveAll(folders)

    log.info('Folder created:', folder.id)
    return { data: folder, error: null }
  } catch (err) {
    log.error('create failed:', err)
    return { data: null, error: 'Failed to create folder' }
  }
}

/**
 * Renames a folder.
 *
 * @param {string} id
 * @param {string} newName
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function rename(id, newName) {
  try {
    const folders = await loadAll()
    const index = folders.findIndex((f) => f.id === id)

    if (index === -1) {
      return { data: null, error: 'Folder not found' }
    }

    const updated = {
      ...folders[index],
      name: newName,
      updatedAt: new Date().toISOString(),
    }

    const { valid, errors } = Folder.validate(updated)
    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    folders[index] = updated
    await saveAll(folders)

    return { data: updated, error: null }
  } catch (err) {
    log.error('rename failed:', err)
    return { data: null, error: 'Failed to rename folder' }
  }
}

/**
 * Deletes a folder. Notes inside are NOT deleted — their folderId
 * is set to null so they become "unfiled".
 *
 * @param {string} id
 * @returns {Promise<{ data: boolean, error: string|null }>}
 */
export async function remove(id) {
  try {
    const folders = await loadAll()
    const filtered = folders.filter((f) => f.id !== id)

    if (filtered.length === folders.length) {
      return { data: false, error: 'Folder not found' }
    }

    await saveAll(filtered)
    log.info('Folder deleted:', id)
    return { data: true, error: null }
  } catch (err) {
    log.error('remove failed:', err)
    return { data: false, error: 'Failed to delete folder' }
  }
}

/**
 * Updates folder properties (color, icon, sortOrder, parentId).
 *
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function update(id, data) {
  try {
    const folders = await loadAll()
    const index = folders.findIndex((f) => f.id === id)

    if (index === -1) {
      return { data: null, error: 'Folder not found' }
    }

    const updated = {
      ...folders[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }

    folders[index] = updated
    await saveAll(folders)

    return { data: updated, error: null }
  } catch (err) {
    log.error('update failed:', err)
    return { data: null, error: 'Failed to update folder' }
  }
}
