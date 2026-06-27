import { FileText, Plus } from 'lucide-react'
import { PageHeader, EmptyState, Button } from '../components/ui'

/**
 * Notes — General note-taking page.
 *
 * Future: note list, create/edit notes, folders, tags.
 */
export default function Notes() {
  return (
    <div className="p-6">
      <PageHeader title="Notes" description="Create and manage your notes.">
        <Button icon={Plus} size="sm">
          New Note
        </Button>
      </PageHeader>

      <EmptyState
        icon={FileText}
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <Button icon={Plus} size="sm">
            Create Note
          </Button>
        }
      />
    </div>
  )
}
