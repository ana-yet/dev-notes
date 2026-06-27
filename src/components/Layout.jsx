import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'
import { LoadingState } from './ui'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Layout — Application shell for the side panel.
 *
 * Composes the Header, main content area, and bottom Navbar.
 * Waits for the ThemeProvider to finish loading before rendering
 * so the UI never flashes between themes.
 */
export default function Layout() {
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>

      <Navbar />
    </div>
  )
}

