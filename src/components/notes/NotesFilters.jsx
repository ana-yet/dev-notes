/**
 * NotesFilters — Filter chip bar for notes.
 *
 * Currently a visual placeholder showing the filter categories
 * that will become functional when the filter system is built.
 * Renders below the toolbar.
 */

const FILTER_CHIPS = [
  { label: 'All', active: true },
  { label: 'Pinned', active: false },
  { label: 'Favorites', active: false },
  { label: 'Archived', active: false },
]

export default function NotesFilters() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 dark:border-gray-800/50">
      {FILTER_CHIPS.map(({ label, active }) => (
        <button
          key={label}
          disabled
          className={`px-2.5 py-1 text-xs rounded-full transition-colors cursor-pointer disabled:cursor-default ${
            active
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
