import { useLocation } from 'react-router-dom'
import { Search, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Header — Top bar with page title, search placeholder, and theme toggle.
 *
 * The page title is derived from the current route.
 * The theme button cycles through: light → dark → system.
 * The search input is a visual placeholder (no functionality yet).
 */

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/notes': 'Notes',
  '/page-notes': 'Page Notes',
  '/reading-list': 'Reading List',
  '/snippets': 'Snippets',
  '/highlights': 'Highlights',
  '/bookmarks': 'Bookmarks',
  '/settings': 'Settings',
  '/trash': 'Trash',
}

const THEME_META = {
  light: { icon: Sun, label: 'Light mode' },
  dark: { icon: Moon, label: 'Dark mode' },
  system: { icon: Monitor, label: 'System theme' },
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
    <header className="h-14 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 gap-3">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
        {title}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search placeholder */}
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-44 pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 dark:focus:bg-gray-900 dark:focus:border-gray-700 dark:text-gray-200 placeholder-gray-400 transition-colors"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          title={themeLabel}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ThemeIcon size={18} />
        </button>
      </div>
    </header>
  )
}
