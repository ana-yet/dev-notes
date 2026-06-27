import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react'
import Button from '../ui/Button'
import { debounce } from '../../utils/debounce'
import { LIMITS } from '../../constants'

/**
 * NotesToolbar — Controls above the notes list.
 *
 * Search is functional — it calls onSearch with a debounced query.
 * Sort, Filter, and New Note are visual placeholders.
 *
 * The search state is managed internally so the parent only
 * receives the debounced value via onSearch.
 */

export default function NotesToolbar({ onSearch }) {
  const [query, setQuery] = useState('')

  // Debounce the search callback
  useEffect(() => {
    const debounced = debounce(() => {
      onSearch?.(query)
    }, LIMITS.SEARCH_DEBOUNCE_MS)

    debounced()
    return debounced.cancel
  }, [query, onSearch])

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 dark:focus:bg-gray-900 dark:focus:border-gray-700 dark:text-gray-200 placeholder-gray-400 transition-colors"
        />
      </div>

      {/* Sort — placeholder */}
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowUpDown}
        disabled
        title="Sort (coming soon)"
      />

      {/* Filter — placeholder */}
      <Button
        variant="ghost"
        size="sm"
        icon={SlidersHorizontal}
        disabled
        title="Filter (coming soon)"
      />

      {/* New Note — disabled until editor is built */}
      <Button icon={Plus} size="sm" disabled title="New Note (coming soon)">
        New
      </Button>
    </div>
  )
}
