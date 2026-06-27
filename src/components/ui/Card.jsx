/**
 * Card — Container with border, padding, and rounded corners.
 *
 * Provides a consistent surface for grouping related content.
 * Supports optional `as` prop to render as a different element.
 */
export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
