/**
 * SettingsRepository — Data access layer for user preferences.
 *
 * Settings are stored as a single object under STORAGE_KEYS.SETTINGS.
 * The `get()` method merges stored values with defaults so that new
 * settings added in future versions automatically get their default
 * values without requiring a migration.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import { Settings } from '../models'
import logger from '../utils/logger'

const log = logger.create('SettingsRepository')

/**
 * Returns the current settings, merged with defaults.
 *
 * @returns {Promise<{ data: Object, error: string|null }>}
 */
export async function get() {
  try {
    const stored = await getItem(STORAGE_KEYS.SETTINGS, null)
    // Merge with defaults so new settings get their fallback values
    const settings = Settings.create(stored || {})
    return { data: settings, error: null }
  } catch (err) {
    log.error('get failed:', err)
    return { data: Settings.getDefault(), error: 'Failed to load settings' }
  }
}

/**
 * Updates settings by merging partial data.
 *
 * @param {Object} partial — Fields to update.
 * @returns {Promise<{ data: Object, error: string|null }>}
 */
export async function update(partial) {
  try {
    const { data: current, error: loadError } = await get()
    if (loadError) {
      return { data: current, error: loadError }
    }

    const merged = { ...current, ...partial }
    const { valid, errors } = Settings.validate(merged)

    if (!valid) {
      return { data: current, error: errors.join(', ') }
    }

    await setItem(STORAGE_KEYS.SETTINGS, merged)
    return { data: merged, error: null }
  } catch (err) {
    log.error('update failed:', err)
    return { data: Settings.getDefault(), error: 'Failed to update settings' }
  }
}
