import { NavLink } from 'react-router-dom'
import { Globe, FileText, BookOpen, Settings } from 'lucide-react'

/**
 * Navbar — Sleek bottom navigation bar optimized for browser side panels.
 * Replaces the wide vertical sidebar to maximize horizontal content area.
 */
export default function Navbar() {
  const navItems = [
    { to: '/page-notes', icon: Globe, label: 'Current Page' },
    { to: '/', icon: FileText, label: 'Workspace' },
    { to: '/library', icon: BookOpen, label: 'Library' },
    { to: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <nav className="h-14 shrink-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900/60 flex items-center justify-around px-2 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 shadow-lg select-none">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer relative group ${
              isActive
                ? 'text-violet-600 dark:text-violet-400 font-semibold'
                : 'text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={18} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{label}</span>
              {isActive && (
                <span className="absolute -top-1 w-8 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full animate-fade-in" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
