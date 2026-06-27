import { useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { PageHeader, Button, EmptyState, LoadingState } from '../components/ui'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast from '../components/ui/Toast'
import TrashCard from '../components/notes/TrashCard'
import { useNotes } from '../hooks/useNotes'
import logger from '../utils/logger'

const log = logger.create('Trash')

/**
 * Trash — Displays deleted notes with restore and permanent delete.
 *
 * Notes in Trash are soft-deleted (isDeleted = true).
 * Users can restore individual notes or permanently delete them.
 * "Empty Trash" permanently removes all deleted notes.
 */
export default function Trash() {
  const { deletedNotes, loading, error, restoreFromTrash, permanentDeleteNote, emptyTrash } =
    useNotes()

  const [confirmAction, setConfirmAction] = useState(null)
  const [toast, setToast] = useState(null)

  // ── Restore ────────────────────────────────────────────────
  const handleRestore = useCallback(
    async (id) => {
      const { error: err } = await restoreFromTrash(id)
      if (err) {
        setToast({ message: `Restore failed: ${err}`, type: 'error' })
      } else {
        setToast({ message: 'Note restored', type: 'success' })
      }
    },
    [restoreFromTrash]
  )

  // ── Permanent delete (single) ──────────────────────────────
  const handlePermanentDeleteRequest = useCallback((id) => {
    setConfirmAction({ type: 'permanent-delete', id })
  }, [])

  const handleConfirmPermanentDelete = useCallback(async () => {
    const id = confirmAction?.id
    setConfirmAction(null)
    if (!id) return

    const { error: err } = await permanentDeleteNote(id)
    if (err) {
      setToast({ message: `Delete failed: ${err}`, type: 'error' })
    } else {
      setToast({ message: 'Note permanently deleted', type: 'success' })
    }
  }, [confirmAction, permanentDeleteNote])

  // ── Empty Trash ────────────────────────────────────────────
  const handleEmptyTrashRequest = useCallback(() => {
    setConfirmAction({ type: 'empty-trash' })
  }, [])

  const handleConfirmEmptyTrash = useCallback(async () => {
    setConfirmAction(null)

    const { data: count, error: err } = await emptyTrash()
    if (err) {
      setToast({ message: `Failed to empty trash: ${err}`, type: 'error' })
    } else {
      setToast({
        message: `${count} note${count !== 1 ? 's' : ''} permanently deleted`,
        type: 'success',
      })
    }
  }, [emptyTrash])

  // ── Loading / Error ────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Trash" />
        <LoadingState message="Loading trash..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Trash" />
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Trash"
        description={
          deletedNotes.length > 0
            ? `${deletedNotes.length} note${deletedNotes.length !== 1 ? 's' : ''} in trash`
            : undefined
        }
      >
        {deletedNotes.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleEmptyTrashRequest}
          >
            Empty Trash
          </Button>
        )}
      </PageHeader>

      {/* Empty state */}
      {deletedNotes.length === 0 && (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Deleted notes will appear here. They can be restored or permanently deleted."
        />
      )}

      {/* Deleted notes list */}
      {deletedNotes.length > 0 && (
        <div className="space-y-3">
          {deletedNotes.map((note) => (
            <TrashCard
              key={note.id}
              note={note}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Confirmation dialogs */}
      {confirmAction?.type === 'permanent-delete' && (
        <ConfirmDialog
          title="Permanently Delete"
          message="This note will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete Forever"
          onConfirm={handleConfirmPermanentDelete}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'empty-trash' && (
        <ConfirmDialog
          title="Empty Trash"
          message={`All ${deletedNotes.length} note${deletedNotes.length !== 1 ? 's' : ''} in Trash will be permanently deleted. This cannot be undone.`}
          confirmLabel="Empty Trash"
          onConfirm={handleConfirmEmptyTrash}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
