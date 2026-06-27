import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'

/**
 * ThemeContext — Manages light/dark/system theme for the entire extension.
 *
 * Persists the user's choice via the Storage Service (which delegates
 * to chrome.storage.local). This indirection means ThemeContext never
 * touches chrome.storage directly — it works identically in Chrome,
 * during development, and in any future storage backend.
 *
 * When "system" is selected, the extension follows the OS preference
 * via the prefers-color-scheme media query.
 */

const ThemeContext = createContext(null)

/** Default theme when nothing is stored yet. */
const DEFAULT_THEME = 'system'

/**
 * Applies the resolved theme to the document by toggling the `dark`
 * class on <html>. Tailwind's dark: variant responds to this class.
 */
function applyTheme(resolved) {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

/** Resolves "system" to the actual OS preference. */
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)

  // ── Load saved theme on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadTheme() {
      const saved = await getItem(STORAGE_KEYS.THEME, DEFAULT_THEME)
      if (cancelled) return

      setThemeState(saved)
      applyTheme(saved === 'system' ? getSystemTheme() : saved)
      setLoading(false)
    }

    loadTheme()
    return () => { cancelled = true }
  }, [])

  // ── Listen for OS theme changes when using "system" ────────────
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // ── Public setter — updates state, storage, and DOM ────────────
  const setTheme = useCallback((next) => {
    setThemeState(next)
    applyTheme(next === 'system' ? getSystemTheme() : next)
    setItem(STORAGE_KEYS.THEME, next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Hook to access theme state and setter. */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
