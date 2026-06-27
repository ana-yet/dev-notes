/**
 * Settings — User preferences model.
 *
 * Settings are stored as a single object under STORAGE_KEYS.SETTINGS.
 * The `create()` function merges user overrides with defaults,
 * so new settings added in future versions get their default values
 * automatically without migration logic.
 */

import { LIMITS } from '../constants'

export function create(overrides = {}) {
  return {
    theme: 'system',
    sidebarCollapsed: false,
    autosave: true,
    autosaveDelay: LIMITS.AUTOSAVE_DELAY_MS,
    defaultNoteColor: null,
    markdownPreview: true,
    fontSize: 'medium',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    ...overrides,
  }
}

export function getDefault() {
  return create()
}

export function validate(settings) {
  const errors = []

  if (!settings || typeof settings !== 'object') {
    return { valid: false, errors: ['Settings must be an object'] }
  }

  const validThemes = ['light', 'dark', 'system']
  if (settings.theme && !validThemes.includes(settings.theme)) {
    errors.push(`Theme must be one of: ${validThemes.join(', ')}`)
  }

  const validFontSizes = ['small', 'medium', 'large']
  if (settings.fontSize && !validFontSizes.includes(settings.fontSize)) {
    errors.push(`Font size must be one of: ${validFontSizes.join(', ')}`)
  }

  const validSortBy = ['updatedAt', 'createdAt', 'title']
  if (settings.sortBy && !validSortBy.includes(settings.sortBy)) {
    errors.push(`Sort by must be one of: ${validSortBy.join(', ')}`)
  }

  const validSortOrder = ['asc', 'desc']
  if (settings.sortOrder && !validSortOrder.includes(settings.sortOrder)) {
    errors.push(`Sort order must be one of: ${validSortOrder.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}
