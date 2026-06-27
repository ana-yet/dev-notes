# DevNotes

A modern browser extension for Chrome and Brave that helps developers and students take notes while browsing the web.

## Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| UI Framework   | React 19              |
| Build Tool     | Vite 8                |
| Styling        | Tailwind CSS 4        |
| Routing        | React Router 7        |
| Icons          | Lucide React          |
| Extension      | Manifest V3           |
| Storage (future) | chrome.storage.local, IndexedDB |

## Project Structure

```
devnotes/
├── popup.html                 ← Popup HTML entry point
├── sidepanel.html             ← Side Panel HTML entry point
├── vite.config.js             ← Build config (multi-entry Chrome extension)
├── eslint.config.js           ← Linting rules
├── package.json
│
├── public/
│   ├── manifest.json          ← Manifest V3 (Chrome extension config)
│   └── icons/                 ← Extension icons (16, 32, 48, 128px)
│
├── scripts/
│   └── generate-icons.js      ← One-time icon generator (no dependencies)
│
└── src/
    ├── background/
    │   └── index.js           ← Background service worker
    │
    ├── content/
    │   └── index.js           ← Content script (injected into pages)
    │
    ├── popup/
    │   ├── main.jsx           ← React entry for the popup
    │   └── Popup.jsx          ← Popup root component
    │
    ├── sidepanel/
    │   ├── main.jsx           ← React entry for the side panel
    │   └── SidePanel.jsx      ← Side panel root (contains React Router)
    │
    ├── components/
    │   └── Layout.jsx         ← Shared sidebar + content layout
    │
    ├── pages/
    │   ├── Dashboard.jsx      ← Overview page
    │   ├── Notes.jsx          ← General notes
    │   ├── PageNotes.jsx      ← Notes tied to specific URLs
    │   ├── ReadingList.jsx    ← Save-to-read-later
    │   ├── Snippets.jsx       ← Code snippet manager
    │   ├── Highlights.jsx     ← Text highlights from pages
    │   ├── Bookmarks.jsx      ← Bookmark manager
    │   └── Settings.jsx       ← User preferences
    │
    ├── hooks/                 ← Custom React hooks (future)
    ├── services/              ← Storage, API, AI services (future)
    ├── utils/                 ← Helper functions (future)
    │
    └── styles/
        └── global.css         ← Tailwind imports + base styles
```

### Why each folder exists

| Folder | Purpose |
|--------|---------|
| `src/background/` | Chrome service worker — runs independently of any UI. Handles lifecycle events, context menus, messaging. |
| `src/content/` | Injected into web pages by Chrome. Reads page content, captures selections, communicates with background. |
| `src/popup/` | Small React app shown when clicking the extension icon. Quick access to key actions. |
| `src/sidepanel/` | Full React app in Chrome's side panel. This is the main DevNotes interface with routing. |
| `src/components/` | Shared, reusable UI components used across popup and side panel. |
| `src/pages/` | Route-level components. Each page maps to a sidebar navigation item. |
| `src/hooks/` | Custom React hooks for shared logic (storage, theme, search). |
| `src/services/` | Business logic layer — storage operations, API calls, AI integration. |
| `src/utils/` | Pure helper functions (date formatting, ID generation, validation). |
| `public/` | Static assets copied to `dist/` as-is. Manifest and icons live here. |
| `scripts/` | One-time build/setup scripts (icon generation). |

## How It Works

### Extension Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Browser                        │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Popup       │  │  Side Panel  │  │   Content    │  │
│  │  (popup.html) │  │ (sidepanel   │  │   Script     │  │
│  │               │  │  .html)      │  │ (content.js) │  │
│  │  Quick access │  │  Full app    │  │  Reads page  │  │
│  │  "Open App"   │  │  8 routes    │  │  content     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         │    chrome.runtime.sendMessage      │          │
│         └────────┬────────┴──────────────────┘          │
│                  ▼                                       │
│         ┌──────────────┐                                │
│         │  Background   │                                │
│         │  Service      │                                │
│         │  Worker       │                                │
│         │ (background   │                                │
│         │  .js)         │                                │
│         └───────────────┘                                │
└─────────────────────────────────────────────────────────┘
```

### Build Pipeline

Vite builds the extension in a single pass:

1. **Popup & Side Panel** — React apps built from their HTML entry points. Output: `dist/popup.html`, `dist/sidepanel.html`, and hashed JS/CSS bundles in `dist/assets/`.
2. **Background & Content scripts** — Plain JS files copied to `dist/` as-is via a custom Vite plugin. No bundling needed.
3. **Manifest & Icons** — Copied from `public/` to `dist/` automatically by Vite.

### Routing

The Side Panel uses `HashRouter` because Chrome extension pages are served from `chrome-extension://` URLs, which don't support the HTML5 History API. Hash-based routing (`#/notes`, `#/settings`) works reliably.

Routes:

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/notes` | Notes |
| `/page-notes` | Page Notes |
| `/reading-list` | Reading List |
| `/snippets` | Snippets |
| `/highlights` | Highlights |
| `/bookmarks` | Bookmarks |
| `/settings` | Settings |

## Getting Started

### Prerequisites

- Node.js 18+
- Google Chrome or Brave browser

### Install Dependencies

```bash
npm install
```

### Generate Icons (first time only)

```bash
npm run generate-icons
```

This creates placeholder PNG icons in `public/icons/`. Replace them with your own branding before publishing.

### Build the Extension

```bash
npm run build
```

Output goes to the `dist/` folder.

### Load in Chrome / Brave

1. Open `chrome://extensions` (or `brave://extensions`)
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `dist` folder from this project
5. The DevNotes icon appears in your toolbar

### Development Workflow

1. Make changes to source files
2. Run `npm run build`
3. Go to `chrome://extensions`
4. Click the refresh icon on the DevNotes card
5. Test your changes

## Manifest V3 Permissions

| Permission | Why |
|------------|-----|
| `storage` | Save notes, settings, and user data locally |
| `activeTab` | Access the current tab when the user interacts with the extension |
| `sidePanel` | Open and manage the side panel programmatically |

## File-by-File Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Configures Vite for multi-entry Chrome extension build. Uses a custom plugin (`extensionScripts`) to copy background and content scripts to dist. Sets `base: './'` for relative asset paths. |
| `public/manifest.json` | Chrome extension manifest. Declares permissions, entry points (popup, side panel, background, content script), and icons. |
| `eslint.config.js` | ESLint flat config. Lints `.js` and `.jsx` files, ignores `dist/`. |

### Entry Points

| File | Purpose |
|------|---------|
| `popup.html` | HTML shell for the popup. Loads `src/popup/main.jsx`. |
| `sidepanel.html` | HTML shell for the side panel. Loads `src/sidepanel/main.jsx`. |
| `src/popup/main.jsx` | Creates the React root and renders `<Popup />`. Imports global styles. |
| `src/sidepanel/main.jsx` | Creates the React root and renders `<SidePanel />`. Imports global styles. |
| `src/background/index.js` | Service worker entry. Runs in the background with no DOM access. |
| `src/content/index.js` | Content script entry. Injected into every page the user visits. |

### Components

| File | Purpose |
|------|---------|
| `src/popup/Popup.jsx` | Popup UI. Shows branding and an "Open Full App" button that opens the side panel. |
| `src/sidepanel/SidePanel.jsx` | Root component with `HashRouter`. Defines all routes and wraps them in `<Layout />`. |
| `src/components/Layout.jsx` | Shared shell with sidebar navigation and a content area (`<Outlet />`). Uses Lucide icons and Tailwind for styling. |

### Pages

All pages in `src/pages/` are placeholders. Each one renders a heading, an icon, and a description. They exist to verify that routing works and to provide a visual scaffold for future development.

## License

MIT
