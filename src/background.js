/**
 * DevNotes — Background Service Worker
 *
 * Opens the side panel directly when the extension icon is clicked.
 * No popup needed — the side panel IS the app.
 */
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
