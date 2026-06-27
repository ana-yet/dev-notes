import { Sun, Moon, Monitor, Settings as SettingsIcon } from 'lucide-react'
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Storage management coming soon.
        </p>
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
