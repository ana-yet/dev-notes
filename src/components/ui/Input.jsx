/**
 * Input — Styled text input with optional label and error message.
 *
 * Forwards all native input props. The parent controls the value.
 */
export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
