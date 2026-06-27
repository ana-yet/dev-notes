import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * Toast — Temporary notification banner.
 *
 * Renders a colored bar with a message, icon, and close button.
 * Auto-dismisses after `duration` ms if onClose is provided.
 *
 * Usage:
 *   <Toast message="Save failed" type="error" onClose={() => setError(null)} />
 */

const STYLES = {
  error:
    'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400',
  success:
    'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400',
}

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
}

export default function Toast({
  message,
  type = 'error',
  duration = 4000,
  onClose,
}) {
  const Icon = ICONS[type] || AlertCircle

  // Auto-dismiss
  useEffect(() => {
    if (!onClose || !duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm shadow-sm ${STYLES[type] || STYLES.error}`}
      role="alert"
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
