/**
 * Bookmark — A saved URL with metadata.
 *
 * Bookmarks are similar to notes but URL-centric.
 * `favicon` stores the favicon URL for display in lists.
 */

import { generateId } from '../utils/uuid'
import { isEmpty, isValidUrl, isTooLong } from '../utils/validation'

export function create(overrides = {}) {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    title: '',
    url: '',
    description: '',
    favicon: null,
    folderId: null,
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
    url: '',
    description: '',
    favicon: null,
    folderId: null,
    tags: [],
    isFavorite: false,
  }
}

export function validate(bookmark) {
  const errors = []

  if (!bookmark || typeof bookmark !== 'object') {
    return { valid: false, errors: ['Bookmark must be an object'] }
  }

  if (isEmpty(bookmark.url)) {
    errors.push('URL is required')
  } else if (!isValidUrl(bookmark.url)) {
    errors.push('URL must be a valid URL')
  }

  if (bookmark.title && isTooLong(bookmark.title, 200)) {
    errors.push('Title must be 200 characters or fewer')
  }

  if (bookmark.description && isTooLong(bookmark.description, 500)) {
    errors.push('Description must be 500 characters or fewer')
  }

  return { valid: errors.length === 0, errors }
}
