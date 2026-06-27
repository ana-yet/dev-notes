/**
 * Note — Core data model.
 *
 * Notes are the primary unit of content in DevNotes.
 * Every note belongs to zero or one folder and can have multiple tags.
 *
 * Design decisions:
 *   - `content` is a string (Markdown). No rich-text object model —
 *     react-markdown handles rendering, keeping storage simple.
 *   - `tags` is an array of tag IDs (not names) so renaming a tag
 *     doesn't require updating every note.
 *   - `color` is a hex string or null. Null means "use the default".
 *   - `url` stores the page URL when a note is created from a web page.
 */

import { generateId } from '../utils/uuid'
import { isEmpty, isTooLong } from '../utils/validation'
import { LIMITS } from '../constants'

/**
 * Returns a new Note object with sensible defaults.
 *
 * @param {Object} overrides — Partial note data to merge.
 * @returns {Object} A complete note object.
 */
export function create(overrides = {}) {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    title: '',
    content: '',
    folderId: null,
    tags: [],
    url: null,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    deletedAt: null,
    color: null,
    ...overrides,
  }
}

/**
 * Returns the default values for a Note (without generating an ID).
 * Useful for forms that need to know what "empty" looks like.
 */
export function getDefault() {
  return {
    title: '',
    content: '',
    folderId: null,
    tags: [],
    url: null,
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    deletedAt: null,
    color: null,
  }
}

/**
 * Validates a note object.
 *
 * @param {Object} note
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validate(note) {
  const errors = []

  if (!note || typeof note !== 'object') {
    return { valid: false, errors: ['Note must be an object'] }
  }

  if (isEmpty(note.title)) {
    errors.push('Title is required')
  } else if (isTooLong(note.title, LIMITS.MAX_NOTE_TITLE_LENGTH)) {
    errors.push(`Title must be ${LIMITS.MAX_NOTE_TITLE_LENGTH} characters or fewer`)
  }

  if (note.content && isTooLong(note.content, LIMITS.MAX_NOTE_CONTENT_LENGTH)) {
    errors.push(`Content must be ${LIMITS.MAX_NOTE_CONTENT_LENGTH} characters or fewer`)
  }

  if (note.tags && note.tags.length > LIMITS.MAX_TAGS_PER_NOTE) {
    errors.push(`A note can have at most ${LIMITS.MAX_TAGS_PER_NOTE} tags`)
  }

  if (note.color && !/^#[0-9a-fA-F]{6}$/.test(note.color)) {
    errors.push('Color must be a valid hex color (e.g. #7c3aed)')
  }

  return { valid: errors.length === 0, errors }
}
