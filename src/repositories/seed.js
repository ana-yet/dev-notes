/**
 * Seed Data — First-launch content.
 *
 * On first launch (when no notes exist), this module creates two
 * welcome notes so the user sees something useful immediately.
 *
 * The check is simple: if STORAGE_KEYS.NOTES is empty, seed.
 * If notes already exist, do nothing. This means:
 *   - First launch → seeds welcome notes.
 *   - Second launch → skips (notes already exist).
 *   - User deletes all notes → does NOT re-seed (array is empty,
 *     but we check for null/undefined, not empty array).
 *
 * Wait — we check `length === 0` which means if the user deletes
 * ALL notes, it would re-seed. To prevent this, we also check a
 * separate flag: STORAGE_KEYS._SEEDED.
 */

import { getItem, setItem } from '../services/storage'
import { STORAGE_KEYS } from '../constants'
import { Note } from '../models'
import logger from '../utils/logger'

const log = logger.create('Seed')

/** Internal flag to prevent re-seeding after the user clears data. */
const SEEDED_KEY = '_seeded'

const WELCOME_NOTES = [
  {
    title: 'Welcome to DevNotes! 👋',
    content: `# Welcome to DevNotes

This is your first note. DevNotes helps you take notes while browsing the web.

## Quick Start

- **Create notes** — Click the "New Note" button on the Notes page.
- **Organize with folders** — Group related notes together.
- **Tag everything** — Add tags to find notes faster.
- **Save highlights** — Select text on any web page and save it.
- **Code snippets** — Save and organize code you find online.

## Keyboard Shortcuts

Coming soon — shortcuts for quick actions.

## Need Help?

Check the Settings page to customize your experience.`,
    isPinned: true,
  },
  {
    title: 'Getting Started with DevNotes',
    content: `# Getting Started

Here are some things you can do with DevNotes:

## 1. Take Notes
Use the **Notes** page to create and manage your notes. Each note supports Markdown formatting.

## 2. Save Web Pages
Browse the web and save pages to your **Reading List** for later.

## 3. Highlight Text
Select any text on a web page and save it as a **Highlight**.

## 4. Bookmark Pages
Save important pages as **Bookmarks** with descriptions and tags.

## 5. Code Snippets
Found useful code? Save it as a **Snippet** with syntax highlighting.

## 6. Organize with Folders
Create **Folders** to keep your notes organized by project or topic.

---

*This note was auto-generated. Feel free to edit or delete it.*`,
    isPinned: false,
  },
]

/**
 * Seeds welcome data if this is the first launch.
 *
 * @returns {Promise<boolean>} true if seeding happened, false if skipped.
 */
export async function seedIfNeeded() {
  try {
    // Check if already seeded
    const seeded = await getItem(SEEDED_KEY, false)
    if (seeded) return false

    // Check if notes already exist
    const existing = await getItem(STORAGE_KEYS.NOTES, [])
    if (existing.length > 0) {
      // Notes exist but no seed flag — set flag and skip
      await setItem(SEEDED_KEY, true)
      return false
    }

    // First launch — create welcome notes
    const notes = WELCOME_NOTES.map((data) => Note.create(data))
    await setItem(STORAGE_KEYS.NOTES, notes)
    await setItem(SEEDED_KEY, true)

    log.info('Seed data created —', notes.length, 'welcome notes')
    return true
  } catch (err) {
    log.error('seedIfNeeded failed:', err)
    return false
  }
}
