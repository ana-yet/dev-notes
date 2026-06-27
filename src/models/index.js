/**
 * Models — Barrel export.
 *
 * Usage:
 *   import { Note, Folder, Bookmark } from '../models'
 *
 *   const note = Note.create({ title: 'Hello' })
 *   const { valid, errors } = Note.validate(note)
 */

export * as Note from './note'
export * as Folder from './folder'
export * as Tag from './tag'
export * as Bookmark from './bookmark'
export * as Highlight from './highlight'
export * as Snippet from './snippet'
export * as Settings from './settings'
