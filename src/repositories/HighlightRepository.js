/**
 * HighlightRepository — Data access layer for Highlights.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import * as Highlight from '../models/highlight'
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
 * Creates a new highlight.
 */
export async function create(data = {}) {
  try {
    const highlight = Highlight.create(data)
    const { valid, errors } = Highlight.validate(highlight)

    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    const highlights = await loadAll()
    highlights.unshift(highlight)
    await saveAll(highlights)

    log.info('Highlight created:', highlight.id)
    return { data: highlight, error: null }
  } catch (err) {
    log.error('create failed:', err)
    return { data: null, error: 'Failed to create highlight' }
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
