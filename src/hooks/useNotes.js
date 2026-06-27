import { useState, useEffect, useCallback } from 'react'
import * as NoteRepository from '../repositories/NoteRepository'
import { seedIfNeeded } from '../repositories/seed'

/**
 * useNotes — React hook for note CRUD operations.
 *
 * Manages loading/error state and exposes a clean API for components.
 * Runs seed data on first mount so the user always has something to see.
 *
 * Components should NEVER call NoteRepository directly — they use
 * this hook, which handles state synchronization automatically.
 *
 * Usage:
 *   const { notes, loading, error, createNote, updateNote, deleteNote, refresh } = useNotes()
 */
export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Loads all notes from the repository.
   * Also triggers seed data if this is the first launch.
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Seed welcome data on first launch
    await seedIfNeeded()

    const { data, error: err } = await NoteRepository.getAll()
    setNotes(data)
    setError(err)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createNote = useCallback(
    async (data) => {
      const { data: note, error: err } = await NoteRepository.create(data)
      if (!err) await refresh()
      return { data: note, error: err }
    },
    [refresh]
  )

  const updateNote = useCallback(
    async (id, data) => {
      const { data: note, error: err } = await NoteRepository.update(id, data)
      if (!err) await refresh()
      return { data: note, error: err }
    },
    [refresh]
  )

  const deleteNote = useCallback(
    async (id) => {
      const { data: ok, error: err } = await NoteRepository.remove(id)
      if (!err) await refresh()
      return { data: ok, error: err }
    },
    [refresh]
  )

  const archiveNote = useCallback(
    async (id) => {
      const { data: note, error: err } = await NoteRepository.archive(id)
      if (!err) await refresh()
      return { data: note, error: err }
    },
    [refresh]
  )

  const restoreNote = useCallback(
    async (id) => {
      const { data: note, error: err } = await NoteRepository.restore(id)
      if (!err) await refresh()
      return { data: note, error: err }
    },
    [refresh]
  )

  const togglePin = useCallback(
    async (id) => {
      const note = notes.find((n) => n.id === id)
      if (!note) return { data: null, error: 'Note not found' }

      const { data, error: err } = note.isPinned
        ? await NoteRepository.unpin(id)
        : await NoteRepository.pin(id)

      if (!err) await refresh()
      return { data, error: err }
    },
    [notes, refresh]
  )

  const toggleFavorite = useCallback(
    async (id) => {
      const { data, error: err } = await NoteRepository.toggleFavorite(id)
      if (!err) await refresh()
      return { data, error: err }
    },
    [refresh]
  )

  const searchNotes = useCallback(async (query) => {
    const { data, error: err } = await NoteRepository.search(query)
    return { data, error: err }
  }, [])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    restoreNote,
    togglePin,
    toggleFavorite,
    searchNotes,
    refresh,
  }
}
