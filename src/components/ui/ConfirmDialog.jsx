import { AlertTriangle } from 'lucide-react'
import Button from './Button'

/**
 * ConfirmDialog — Modal confirmation dialog.
 *
 * Used when the user tries to switch notes with unsaved changes.
 * Centers on screen with a backdrop overlay.
 *
 * Usage:
 *   <ConfirmDialog
 *     title="Unsaved Changes"
 *     message="You have unsaved changes. Discard them?"
 *     confirmLabel="Discard"
 *     onConfirm={handleDiscard}
 *     onCancel={handleCancel}
 *   />
 */

export default function ConfirmDialog({
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 pl-12">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
