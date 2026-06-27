/**
 * LoadingState — Centered spinner with an optional message.
 *
 * Used during initial data fetches and async operations.
 * The spinner is a CSS-animated border circle.
 */
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-violet-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}
