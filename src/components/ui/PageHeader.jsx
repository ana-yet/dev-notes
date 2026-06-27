/**
 * PageHeader — Consistent page title with optional description and actions.
 *
 * Renders a title row with optional action buttons on the right,
 * and an optional description below.
 */
export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {children && (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  )
}
