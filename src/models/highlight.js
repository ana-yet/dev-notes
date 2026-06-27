/**
 * Highlight — A text selection captured from a web page.
 *
 * Highlights store the selected text, the source URL, and the page title.
 * `color` is the highlight color (for visual grouping).
 * `note` is an optional annotation the user adds to the highlight.
 */

import { generateId } from '../utils/uuid'
import { isEmpty } from '../utils/validation'

export function create(overrides = {}) {
  return {
    id: generateId(),
    text: '',
    url: '',
    pageTitle: '',
    color: '#fef08a', // yellow-200 default
    note: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function getDefault() {
  return {
    text: '',
    url: '',
    pageTitle: '',
    color: '#fef08a',
    note: '',
  }
}

export function validate(highlight) {
  const errors = []

  if (!highlight || typeof highlight !== 'object') {
    return { valid: false, errors: ['Highlight must be an object'] }
  }

  if (isEmpty(highlight.text)) {
    errors.push('Highlight text is required')
  }

  if (isEmpty(highlight.url)) {
    errors.push('Source URL is required')
  }

  return { valid: errors.length === 0, errors }
}
