import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Globe,
  BookOpen,
  Code,
  Highlighter,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Trash2,
} from 'lucide-react'

/**
 * Sidebar — Collapsible navigation panel.
 *
 * Shows icons + labels when expanded, icons-only when collapsed.
 * The parent controls `collapsed` state and provides `onToggle`.
 *
 * Each NavLink gets a `title` attribute when collapsed so users
 * can still see the label as a native browser tooltip on hover.
 */

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/page-notes', icon: Globe, label: 'Page Notes' },
  { to: '/reading-list', icon: BookOpen, label: 'Reading List' },
  { to: '/snippets', icon: Code, label: 'Snippets' },
  { to: '/highlights', icon: Highlighter, label: 'Highlights' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/trash', icon: Trash2, label: 'Trash', section: 'bottom' },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-[width] duration-200 ease-in-out`}
    >
      {/* ── Brand ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <StickyNote size={18} className="text-violet-600 shrink-0" />
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
            DevNotes
          </span>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {NAV_ITEMS.filter((item) => !item.section).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
              } ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-medium dark:bg-violet-950/40 dark:text-violet-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}

        {/* Divider before bottom items */}
        {!collapsed && (
          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
        )}

        {NAV_ITEMS.filter((item) => item.section === 'bottom').map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
              } ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-medium dark:bg-violet-950/40 dark:text-violet-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
          }`}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="whitespace-nowrap">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
