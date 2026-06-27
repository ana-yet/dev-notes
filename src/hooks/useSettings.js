import { useState, useEffect, useCallback } from 'react'
import * as SettingsRepository from '../repositories/SettingsRepository'
import { Settings as SettingsModel } from '../models'

/**
 * useSettings — React hook for user preferences.
 *
 * Loads settings on mount and exposes an update function that
 * merges partial changes. Components should NEVER call
 * SettingsRepository directly.
 *
 * Usage:
 *   const { settings, loading, error, updateSettings } = useSettings()
 */
export function useSettings() {
  const [settings, setSettings] = useState(SettingsModel.getDefault())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await SettingsRepository.get()
    setSettings(data)
    setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /**
   * Updates settings by merging partial data.
   *
   * @param {Object} partial — Fields to update (e.g. { fontSize: 'large' }).
   * @returns {Promise<{ data: Object, error: string|null }>}
   */
  const updateSettings = useCallback(
    async (partial) => {
      const { data, error: err } = await SettingsRepository.update(partial)
      if (!err) setSettings(data)
      return { data, error: err }
    },
    []
  )

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh,
  }
}
