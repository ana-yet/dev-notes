/**
 * Tag — Lightweight label that can be attached to notes, bookmarks, and snippets.
 *
 * Tags are stored as a separate collection. Notes reference tags by ID
 * (not by name) so renaming a tag doesn't require updating every note.
 */

import { generateId } from '../utils/uuid'
import { isEmpty } from '../utils/validation'

export function create(overrides = {}) {
  return {
    id: generateId(),
    name: '',
    color: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function getDefault() {
  return {
    name: '',
    color: null,
  }
}

export function validate(tag) {
  const errors = []

  if (!tag || typeof tag !== 'object') {
    return { valid: false, errors: ['Tag must be an object'] }
  }

  if (isEmpty(tag.name)) {
    errors.push('Tag name is required')
  } else if (tag.name.length > 50) {
    errors.push('Tag name must be 50 characters or fewer')
  }

  return { valid: errors.length === 0, errors }
}
