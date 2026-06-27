import {
  Save,
  Trash2,
  Archive,
  Heart,
  Pin,
  Share2,
} from 'lucide-react'
import Button from '../ui/Button'

/**
 * EditorToolbar — Action buttons and dirty-state indicator.
 *
 * Save is enabled only when `isDirty` is true.
 * Other buttons remain disabled placeholders.
 * Shows a pulsing "Unsaved Changes" indicator when dirty.
 */

const ACTIONS = [
  { icon: Heart, label: 'Favorite', variant: 'ghost', title: 'Toggle favorite' },
  { icon: Pin, label: 'Pin', variant: 'ghost', title: 'Toggle pin' },
  { icon: Archive, label: 'Archive', variant: 'ghost', title: 'Archive note' },
  { icon: Share2, label: 'Share', variant: 'ghost', title: 'Share note' },
]

export default function EditorToolbar({ isDirty, onSave, saving }) {
  return (
    <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-800/50 overflow-x-auto">
      {/* Save — primary when dirty, ghost when clean, spinner when saving */}
      <Button
        variant={isDirty && !saving ? 'primary' : 'ghost'}
        size="sm"
        icon={Save}
        disabled={!isDirty || saving}
        loading={saving}
        onClick={onSave}
        title="Save changes (Ctrl+S)"
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>

      {/* Dirty indicator — hidden during save */}
      {isDirty && !saving && (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 ml-1 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Unsaved
        </span>
      )}

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Action buttons — disabled placeholders */}
      {ACTIONS.map(({ icon, label, variant, title }) => (
        <Button
          key={label}
          variant={variant}
          size="sm"
          icon={icon}
          disabled
          title={`${title} (coming soon)`}
        >
          {label}
        </Button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Delete — separated visually */}
      <Button
        variant="ghost"
        size="sm"
        icon={Trash2}
        disabled
        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        title="Delete note (coming soon)"
      >
        Delete
      </Button>
    </div>
  )
}
