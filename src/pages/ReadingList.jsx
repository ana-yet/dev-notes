import { BookOpen } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'

/**
 * ReadingList — Save-to-read-later page.
 *
 * Future: add URLs, mark as read, archive, tags.
 */
export default function ReadingList() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reading List"
        description="Save articles and pages to read later."
      />

      <EmptyState
        icon={BookOpen}
        title="Your reading list is empty"
        description="Save a page from the web to add it here."
      />
    </div>
  )
}
