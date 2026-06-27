import {
  Pencil,
  Save,
  Trash2,
  Archive,
  Heart,
  Pin,
  Share2,
} from 'lucide-react'
import Button from '../ui/Button'

/**
 * EditorToolbar — Action buttons for the selected note.
 *
 * All buttons are disabled placeholders. They will become functional
 * when CRUD is implemented in a future milestone.
 *
 * Layout: primary actions on the left, destructive on the right.
 */

const ACTIONS = [
  { icon: Pencil, label: 'Edit', variant: 'ghost', title: 'Edit note' },
  { icon: Save, label: 'Save', variant: 'ghost', title: 'Save changes' },
  { icon: Heart, label: 'Favorite', variant: 'ghost', title: 'Toggle favorite' },
  { icon: Pin, label: 'Pin', variant: 'ghost', title: 'Toggle pin' },
  { icon: Archive, label: 'Archive', variant: 'ghost', title: 'Archive note' },
  { icon: Share2, label: 'Share', variant: 'ghost', title: 'Share note' },
]

export default function EditorToolbar() {
  return (
    <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-800/50 overflow-x-auto">
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
