# DevNotes

DevNotes is a Manifest V3 Chrome side-panel extension for notes, page notes,
bookmarks, reading-list entries, snippets, and saved highlights.

## Runtime architecture

- `src/popup/` opens the side panel from the toolbar action.
- `src/sidepanel/` hosts the React application and its five routes.
- `src/services/pageNoteService.js` owns the two browser tab listeners used by
  Page Notes. It follows the active tab in the side panel's Chrome window.
- `src/repositories/` persists current feature data through the storage service.
- `src/services/storage/` is the only layer that accesses
  `chrome.storage.local`.

The extension has no background service worker, content script, polling loop,
host permission, or page injection. The side panel exists only while its UI is
open, so no extension code runs continuously in the background.

## Routes

| Path | Feature |
| --- | --- |
| `/`, `/notes` | General notes |
| `/page-notes` | Active-page note and resources |
| `/library` | Bookmarks, reading list, snippets, and highlights |
| `/settings` | Theme and shortcuts |
| `/trash` | Restore or permanently delete notes |

## Permissions

| Permission | Current use |
| --- | --- |
| `storage` | Persist notes, resources, folders, and theme locally. |
| `tabs` | Read active-tab URL/title/favicon and receive tab activation/update events while Page Notes is open. |
| `sidePanel` | Open the side panel from the popup action. |

`activeTab`, host permissions, `scripting`, and `webNavigation` are not
requested. Chrome 116 or newer is required because the popup calls
`chrome.sidePanel.open()`.

## Development

```bash
npm install
npm run lint
npm run build
```

Load the generated `dist/` directory from `chrome://extensions` using **Load
unpacked**. Vite creates only the popup and side-panel entries plus static
manifest/icons; there are no worker or content-script build artifacts.

## Stack

React 19, React Router 7, Vite 8, Tailwind CSS 4, and Lucide React.
