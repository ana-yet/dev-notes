/**
 * Folder — Organizational container for notes, bookmarks, and snippets.
 *
 * Folders support nesting via `parentId` up to LIMITS.MAX_FOLDER_DEPTH.
 * `sortOrder` determines display order in the sidebar (lower = first).
 */

import { generateId } from '../utils/uuid'
import { isEmpty, isTooLong } from '../utils/validation'

export function create(overrides = {}) {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    name: '',
    parentId: null,
    color: null,
    icon: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
    ...overrides,
  }
}

export function getDefault() {
  return {
    name: '',
    parentId: null,
    color: null,
    icon: null,
    sortOrder: 0,
  }
}

export function validate(folder) {
  const errors = []

  if (!folder || typeof folder !== 'object') {
    return { valid: false, errors: ['Folder must be an object'] }
  }

  if (isEmpty(folder.name)) {
    errors.push('Folder name is required')
  } else if (isTooLong(folder.name, 100)) {
    errors.push('Folder name must be 100 characters or fewer')
  }

  return { valid: errors.length === 0, errors }
}
