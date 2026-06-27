import { Link } from 'react-router-dom'
import { Sun, Moon, Monitor, Trash2, Keyboard } from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Settings — User preferences page.
 *
 * Currently contains theme selection. Future sections:
 * storage management, export/import, about, shortcuts.
 */

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    description: 'Light mode',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Dark mode',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match system preference',
    icon: Monitor,
  },
]

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Configure your DevNotes preferences."
      />

      {/* ── Appearance ──────────────────────────────────────── */}
      <Card className="p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Appearance
        </h2>

        <div className="space-y-1.5">
          {THEME_OPTIONS.map(
            ({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  theme === value
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {description}
                  </div>
                </div>
                {theme === value && (
                  <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                )}
              </button>
            )
          )}
        </div>
      </Card>

      {/* ── Placeholder sections ────────────────────────────── */}
      <Card className="p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Storage
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Storage management coming soon.
        </p>
        <Link
          to="/trash"
          className="inline-flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          <Trash2 size={13} />
          View Trash
        </Link>
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Keyboard size={14} />
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2">
          {[
            { key: '⌘ N', desc: 'New note' },
            { key: 'Esc', desc: 'Back to list' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">{desc}</span>
              <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-gray-700 dark:text-gray-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          About
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          DevNotes v0.1.0 — Built for developers and students.
        </p>
      </Card>
    </div>
  )
}
