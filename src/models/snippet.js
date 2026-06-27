/**
 * Snippet — A saved block of code.
 *
 * Snippets store raw code text and a language identifier
 * for syntax highlighting in the UI.
 */

import { generateId } from '../utils/uuid'
import { isEmpty, isTooLong } from '../utils/validation'
import { LIMITS } from '../constants'

export function create(overrides = {}) {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    title: '',
    code: '',
    language: 'plaintext',
    url: null,
    tags: [],
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    ...overrides,
  }
}

export function getDefault() {
  return {
    title: '',
    code: '',
    language: 'plaintext',
    url: null,
    tags: [],
    isFavorite: false,
  }
}

export function validate(snippet) {
  const errors = []

  if (!snippet || typeof snippet !== 'object') {
    return { valid: false, errors: ['Snippet must be an object'] }
  }

  if (isEmpty(snippet.title)) {
    errors.push('Snippet title is required')
  } else if (isTooLong(snippet.title, 200)) {
    errors.push('Title must be 200 characters or fewer')
  }

  if (isEmpty(snippet.code)) {
    errors.push('Code is required')
  } else if (isTooLong(snippet.code, LIMITS.MAX_NOTE_CONTENT_LENGTH)) {
    errors.push('Code is too long')
  }

  return { valid: errors.length === 0, errors }
}
