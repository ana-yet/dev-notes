import { Highlighter } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'

/**
 * Highlights — Text highlights captured from web pages.
 *
 * Future: highlight colors, source URL, search, export.
 */
export default function Highlights() {
  return (
    <div className="p-6">
      <PageHeader
        title="Highlights"
        description="Text highlights from web pages."
      />

      <EmptyState
        icon={Highlighter}
        title="No highlights yet"
        description="Select text on any page and save it as a highlight."
      />
    </div>
  )
}
