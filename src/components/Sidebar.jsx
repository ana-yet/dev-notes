import { NavLink } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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
import { subscribe, getActiveTab } from '../services/pageNoteService'
import * as NoteRepository from '../repositories/NoteRepository'

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

      {/* ── Current Page ────────────────────────────────────── */}
      <CurrentPageIndicator collapsed={collapsed} />

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

/**
 * CurrentPageIndicator — Shows the active tab and its note status.
 *
 * Displays the page title and a status badge (Has Note ✅ or No Note).
 * When no tab is detected (e.g. during dev), shows nothing.
 *
 * This component subscribes to tab changes via PageNoteService
 * and checks for matching page notes in storage. It's lightweight
 * and self-contained — no prop drilling required.
 */
function CurrentPageIndicator({ collapsed }) {
  const [tab, setTab] = useState(null)
  const [hasNote, setHasNote] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    // Get initial tab
    getActiveTab().then((t) => {
      if (!cancelledRef.current) setTab(t)
    })

    // Subscribe to tab changes
    const unsubscribe = subscribe((t) => {
      if (!cancelledRef.current) setTab(t)
    })

    return () => {
      cancelledRef.current = true
      unsubscribe()
    }
  }, [])

  // Check if a note exists for the current URL
  useEffect(() => {
    let cancelled = false

    async function checkNote() {
      if (!tab?.url) {
        if (!cancelled) setHasNote(false)
        return
      }

      try {
        const { data } = await NoteRepository.getByUrl(tab.url)
        if (!cancelled) setHasNote(!!data)
      } catch {
        if (!cancelled) setHasNote(false)
      }
    }

    checkNote()

    return () => { cancelled = true }
  }, [tab?.url])

  // Don't render if collapsed or no tab
  if (collapsed || !tab) return null

  const pageTitle = tab.title || 'Untitled Page'
  const faviconSrc = tab.favIconUrl || null

  return (
    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800/50">
      <div className="flex items-center gap-2 min-w-0">
        {/* Favicon or globe icon */}
        {faviconSrc ? (
          <img
            src={faviconSrc}
            alt=""
            className="w-4 h-4 rounded-sm shrink-0"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <Globe size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
        )}

        {/* Page title */}
        <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1 min-w-0">
          {pageTitle}
        </span>
      </div>

      {/* Note status */}
      <div className="flex items-center gap-1.5 mt-1.5 ml-6">
        {hasNote ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[11px] text-green-600 dark:text-green-400">
              Has Note ✅
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              No Note
            </span>
          </>
        )}
      </div>
    </div>
  )
}
