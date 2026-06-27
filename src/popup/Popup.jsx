import { StickyNote, ExternalLink } from 'lucide-react'

/**
 * Popup — The small UI that appears when the user clicks the extension icon.
 *
 * This is intentionally minimal. It serves as a quick-access point.
 * The full application lives in the Side Panel.
 */
export default function Popup() {
  const openSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tab) {
        await chrome.sidePanel.open({ tabId: tab.id })
      }
    } catch (err) {
      console.error('[DevNotes] Failed to open side panel:', err)
    }
  }

  return (
    <div className="w-80 bg-white text-gray-900">
      {/* Header */}
      <header className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200">
        <StickyNote size={20} className="text-violet-600" />
        <h1 className="text-base font-bold">DevNotes</h1>
      </header>

      {/* Body */}
      <div className="px-4 py-6 flex flex-col items-center text-center">
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Your developer notes, organized in one place.
          <br />
          Open the full app to get started.
        </p>

        <button
          onClick={openSidePanel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
          Open Full App
        </button>
      </div>

      {/* Footer */}
      <footer className="px-4 py-2.5 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-400">v0.1.0</span>
      </footer>
    </div>
  )
}
