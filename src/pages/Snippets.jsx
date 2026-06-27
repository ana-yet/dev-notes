import { Code } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/ui'

/**
 * Snippets — Code snippet manager.
 *
 * Future: syntax highlighting, language filters, copy-to-clipboard.
 */
export default function Snippets() {
  return (
    <div className="p-6">
      <PageHeader
        title="Snippets"
        description="Save and organize your code snippets."
      />

      <EmptyState
        icon={Code}
        title="No snippets saved"
        description="Highlight code on any page and save it as a snippet."
      />
    </div>
  )
}
