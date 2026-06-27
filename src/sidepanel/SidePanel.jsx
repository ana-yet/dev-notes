import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import Layout from '../components/Layout'
import Notes from '../pages/Notes'
import PageNotes from '../pages/PageNotes'
import Library from '../pages/Library'
import Settings from '../pages/Settings'
import Trash from '../pages/Trash'

/**
 * SidePanel — Root component for the side panel application.
 *
 * ThemeProvider wraps the entire tree so every component can
 * access the theme via useTheme(). It must sit above HashRouter
 * because it renders a loading state before the router is ready.
 *
 * Uses HashRouter because Chrome extension pages are served from
 * chrome-extension:// URLs, which don't support the HTML5 History API.
 */
export default function SidePanel() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Notes />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/page-notes" element={<PageNotes />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/trash" element={<Trash />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
