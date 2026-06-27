import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { LoadingState } from './ui'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Layout — Application shell for the side panel.
 *
 * Composes the Sidebar, Header, and page content area.
 * Waits for the ThemeProvider to finish loading before rendering
 * so the UI never flashes between themes.
 *
 * The sidebar collapse state lives here (lifted up from Sidebar)
 * because Layout owns the overall flex structure and needs to
 * react to width changes.
 */
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { loading } = useTheme()

  // Block rendering until the saved theme is loaded — prevents flash
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
