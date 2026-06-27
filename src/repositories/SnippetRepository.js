/**
 * SnippetRepository — Data access layer for Code Snippets.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import * as Snippet from '../models/snippet'
import logger from '../utils/logger'

const log = logger.create('SnippetRepository')

async function loadAll() {
  return await getItem(STORAGE_KEYS.SNIPPETS, [])
}

async function saveAll(snippets) {
  return await setItem(STORAGE_KEYS.SNIPPETS, snippets)
}

/**
 * Returns all snippets.
 */
export async function getAll() {
  try {
    const snippets = await loadAll()
    return { data: snippets, error: null }
  } catch (err) {
    log.error('getAll failed:', err)
    return { data: [], error: 'Failed to load snippets' }
  }
}

/**
 * Creates a new snippet.
 */
export async function create(data = {}) {
  try {
    const snippet = Snippet.create(data)
    const { valid, errors } = Snippet.validate(snippet)

    if (!valid) {
      return { data: null, error: errors.join(', ') }
    }

    const snippets = await loadAll()
    snippets.unshift(snippet)
    await saveAll(snippets)

    log.info('Snippet created:', snippet.id)
    return { data: snippet, error: null }
  } catch (err) {
    log.error('create failed:', err)
    return { data: null, error: 'Failed to create snippet' }
  }
}

/**
 * Deletes a snippet.
 */
export async function remove(id) {
  try {
    const snippets = await loadAll()
    const filtered = snippets.filter((s) => s.id !== id)

    if (filtered.length === snippets.length) {
      return { data: false, error: 'Snippet not found' }
    }

    await saveAll(filtered)
    log.info('Snippet deleted:', id)
    return { data: true, error: null }
  } catch (err) {
    log.error('remove failed:', err)
    return { data: false, error: 'Failed to delete snippet' }
  }
}
