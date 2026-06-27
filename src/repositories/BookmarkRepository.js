/**
 * BookmarkRepository — Data access layer for Bookmarks and Reading List items.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import * as Bookmark from '../models/bookmark'
import logger from '../utils/logger'

const log = logger.create('BookmarkRepository')

async function loadAll() {
  return await getItem(STORAGE_KEYS.BOOKMARKS, [])
}

async function saveAll(bookmarks) {
  return await setItem(STORAGE_KEYS.BOOKMARKS, bookmarks)
}

/**
 * Returns all bookmarks.
 */
export async function getAll() {
  try {
    const bookmarks = await loadAll()
    return { data: bookmarks, error: null }
  } catch (err) {
    log.error('getAll failed:', err)
    return { data: [], error: 'Failed to load bookmarks' }
  }
}

/**
 * Creates a new bookmark or reading list item.
 */
export async function create(data = {}) {
  try {
    const bookmark = Bookmark.create(data)
    const { valid, errors } = Bookmark.validate(bookmark)

    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    const bookmarks = await loadAll()
    bookmarks.unshift(bookmark)
    await saveAll(bookmarks)

    log.info('Bookmark created:', bookmark.id)
    return { data: bookmark, error: null }
  } catch (err) {
    log.error('create failed:', err)
    return { data: null, error: 'Failed to create bookmark' }
  }
}

/**
 * Deletes a bookmark.
 */
export async function remove(id) {
  try {
    const bookmarks = await loadAll()
    const filtered = bookmarks.filter((b) => b.id !== id)

    if (filtered.length === bookmarks.length) {
      return { data: false, error: 'Bookmark not found' }
    }

    await saveAll(filtered)
    log.info('Bookmark deleted:', id)
    return { data: true, error: null }
  } catch (err) {
    log.error('remove failed:', err)
    return { data: false, error: 'Failed to delete bookmark' }
  }
}

/**
 * Toggles a property (e.g. isFavorite, read) on a bookmark.
 */
export async function toggleProperty(id, property) {
  try {
    const bookmarks = await loadAll()
    const index = bookmarks.findIndex((b) => b.id === id)

    if (index === -1) {
      return { data: null, error: 'Bookmark not found' }
    }

    const updated = {
      ...bookmarks[index],
      [property]: !bookmarks[index][property],
      updatedAt: new Date().toISOString(),
    }

    bookmarks[index] = updated
    await saveAll(bookmarks)

    return { data: updated, error: null }
  } catch (err) {
    log.error(`toggleProperty ${property} failed:`, err)
    return { data: null, error: `Failed to toggle ${property}` }
  }
}
