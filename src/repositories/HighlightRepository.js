/**
 * HighlightRepository — Data access layer for Highlights.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import logger from '../utils/logger'

const log = logger.create('HighlightRepository')

async function loadAll() {
  return await getItem(STORAGE_KEYS.HIGHLIGHTS, [])
}

async function saveAll(highlights) {
  return await setItem(STORAGE_KEYS.HIGHLIGHTS, highlights)
}

/**
 * Returns all highlights.
 */
export async function getAll() {
  try {
    const highlights = await loadAll()
    return { data: highlights, error: null }
  } catch (err) {
    log.error('getAll failed:', err)
    return { data: [], error: 'Failed to load highlights' }
  }
}

/**
 * Deletes a highlight.
 */
export async function remove(id) {
  try {
    const highlights = await loadAll()
    const filtered = highlights.filter((h) => h.id !== id)

    if (filtered.length === highlights.length) {
      return { data: false, error: 'Highlight not found' }
    }

    await saveAll(filtered)
    log.info('Highlight deleted:', id)
    return { data: true, error: null }
  } catch (err) {
    log.error('remove failed:', err)
    return { data: false, error: 'Failed to delete highlight' }
  }
}
