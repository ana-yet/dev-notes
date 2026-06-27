import { Globe } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'

/**
 * PageNotes — Notes tied to specific URLs.
 *
 * Future: show notes grouped by domain, auto-detect current page.
 */
export default function PageNotes() {
  return (
    <div className="p-6">
      <PageHeader
        title="Page Notes"
        description="Notes attached to specific web pages."
      />

      <EmptyState
        icon={Globe}
        title="No page notes"
        description="Browse the web and add notes to any page you visit."
      />
    </div>
  )
}
