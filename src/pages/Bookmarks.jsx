import { Bookmark } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'

/**
 * Bookmarks — Bookmark manager.
 *
 * Future: folders, tags, import/export, search.
 */
export default function Bookmarks() {
  return (
    <div className="p-6">
      <PageHeader
        title="Bookmarks"
        description="Your saved bookmarks in one place."
      />

      <EmptyState
        icon={Bookmark}
        title="No bookmarks saved"
        description="Save a bookmark from the browser or the popup."
      />
    </div>
  )
}
