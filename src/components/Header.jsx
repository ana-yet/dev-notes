import { useLocation } from 'react-router-dom'
import { Sun, Moon, Monitor, Pen } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Header — Top bar with branded logo, page title, and theme toggle.
 *
 * The page title is derived from the current route.
 * The theme button cycles through: light → dark → system.
 */

const PAGE_TITLES = {
  '/': 'Workspace',
  '/notes': 'Workspace',
  '/page-notes': 'Current Page',
  '/library': 'Library',
  '/settings': 'Settings',
  '/trash': 'Trash',
}

const THEME_META = {
  light: { icon: Sun, label: 'Switch to dark mode' },
  dark: { icon: Moon, label: 'Switch to system theme' },
  system: { icon: Monitor, label: 'Switch to light mode' },
}

const THEME_CYCLE = ['light', 'dark', 'system']

export default function Header() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const title = PAGE_TITLES[location.pathname] || 'DevNotes'
  const { icon: ThemeIcon, label: themeLabel } = THEME_META[theme]

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme)
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length])
  }

  return (
    <header className="h-12 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/70 flex items-center justify-between px-4 gap-3 select-none">
      {/* Left: Logo + page title */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Logo mark */}
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/30">
          <Pen size={13} strokeWidth={2.5} className="text-white" />
        </div>

        {/* Page title */}
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
      </div>

      {/* Right: Theme toggle */}
      <button
        onClick={cycleTheme}
        title={themeLabel}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
      >
        <ThemeIcon size={16} />
      </button>
    </header>
  )
}
