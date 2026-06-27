/**
 * EmptyState — Placeholder shown when a page has no data.
 *
 * Displays an icon, title, description, and an optional action button.
 * Used as the default view for all pages until real data is implemented.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">
          {description}
        </p>
      )}

      {action}
    </div>
  )
}
