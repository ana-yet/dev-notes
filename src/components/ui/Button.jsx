import { Loader2 } from 'lucide-react'

/**
 * Button — Reusable button with variants, sizes, and loading state.
 *
 * Variants control color: primary (violet), secondary (gray), ghost (transparent), danger (red).
 * Sizes control padding and font size: sm, md, lg.
 * When `loading` is true, a spinner replaces the icon and the button is disabled.
 */

const VARIANTS = {
  primary:
    'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  ghost:
    'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
}

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) {
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} />
      )}
      {children}
    </button>
  )
}
