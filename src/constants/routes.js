/**
 * Routes — All route paths and their display labels.
 *
 * Used by the Sidebar, Header, and any component that navigates.
 * Keeping routes here means adding a new page requires changes
 * in exactly two places: this file and the router in SidePanel.jsx.
 */

export const ROUTES = {
  DASHBOARD: '/',
  NOTES: '/notes',
  PAGE_NOTES: '/page-notes',
  READING_LIST: '/reading-list',
  SNIPPETS: '/snippets',
  HIGHLIGHTS: '/highlights',
  BOOKMARKS: '/bookmarks',
  SETTINGS: '/settings',
}

/** Human-readable labels keyed by route path. */
export const ROUTE_LABELS = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.NOTES]: 'Notes',
  [ROUTES.PAGE_NOTES]: 'Page Notes',
  [ROUTES.READING_LIST]: 'Reading List',
  [ROUTES.SNIPPETS]: 'Snippets',
  [ROUTES.HIGHLIGHTS]: 'Highlights',
  [ROUTES.BOOKMARKS]: 'Bookmarks',
  [ROUTES.SETTINGS]: 'Settings',
}
