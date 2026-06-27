import { LayoutDashboard, FileText, Bookmark, Code } from 'lucide-react'
import { PageHeader, Card, EmptyState } from '../components/ui'

/**
 * Dashboard — Overview page.
 *
 * Currently shows placeholder stat cards and an empty state.
 * Future: recent notes, activity feed, quick actions.
 */
export default function Dashboard() {
  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description="Your productivity overview at a glance."
      />

      {/* Stat cards — visual placeholders */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card className="p-4 text-center">
          <FileText
            size={20}
            className="mx-auto mb-2 text-violet-600 dark:text-violet-400"
          />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
        </Card>

        <Card className="p-4 text-center">
          <Bookmark
            size={20}
            className="mx-auto mb-2 text-violet-600 dark:text-violet-400"
          />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bookmarks</p>
        </Card>

        <Card className="p-4 text-center">
          <Code
            size={20}
            className="mx-auto mb-2 text-violet-600 dark:text-violet-400"
          />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Snippets</p>
        </Card>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title="Welcome to DevNotes"
        description="Start by creating a note or saving a bookmark. Your activity will appear here."
      />
    </div>
  )
}
