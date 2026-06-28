import { useState, useEffect, useCallback, useMemo } from "react";
import * as NoteRepository from "../repositories/NoteRepository";
import { seedIfNeeded } from "../repositories/seed";

/**
 * useNotes — React hook for note CRUD operations.
 *
 * Manages loading/error state and exposes a clean API for components.
 * Runs seed data on first mount so the user always has something to see.
 *
 * Components should NEVER call NoteRepository directly — they use
 * this hook, which handles state synchronization automatically.
 *
 * Provides two derived arrays:
 *   - notes: active notes (not deleted)
 *   - deletedNotes: notes in Trash
 */
export function useNotes() {
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived: active notes (not in trash)
  const notes = useMemo(
    () => allNotes.filter((n) => !n.isDeleted),
    [allNotes],
  );
  // Derived: notes in trash
  const deletedNotes = useMemo(
    () => allNotes.filter((n) => n.isDeleted),
    [allNotes],
  );

  /**
   * Loads all notes from the repository.
   * Also triggers seed data if this is the first launch.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Seed welcome data on first launch
    await seedIfNeeded();

    const { data, error: err } = await NoteRepository.getAll();
    setAllNotes(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      await refresh();
    }
    load();
  }, [refresh]);

  const createNote = useCallback(
    async (data) => {
      const { data: note, error: err } = await NoteRepository.create(data);
      if (!err) await refresh();
      return { data: note, error: err };
    },
    [refresh],
  );

  const updateNote = useCallback(
    async (id, data) => {
      const { data: note, error: err } = await NoteRepository.update(id, data);
      if (!err) await refresh();
      return { data: note, error: err };
    },
    [refresh],
  );

  const deleteNote = useCallback(
    async (id) => {
      const { data: note, error: err } = await NoteRepository.trash(id);
      if (!err) await refresh();
      return { data: note, error: err };
    },
    [refresh],
  );

  const permanentDeleteNote = useCallback(
    async (id) => {
      const { data: ok, error: err } = await NoteRepository.remove(id);
      if (!err) await refresh();
      return { data: ok, error: err };
    },
    [refresh],
  );

  const restoreFromTrash = useCallback(
    async (id) => {
      const { data: note, error: err } =
        await NoteRepository.restoreFromTrash(id);
      if (!err) await refresh();
      return { data: note, error: err };
    },
    [refresh],
  );

  const emptyTrash = useCallback(async () => {
    const { data: count, error: err } = await NoteRepository.emptyTrash();
    if (!err) await refresh();
    return { data: count, error: err };
  }, [refresh]);

  const searchNotes = useCallback(async (query) => {
    const { data, error: err } = await NoteRepository.search(query);
    return { data, error: err };
  }, []);

  return {
    notes,
    deletedNotes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    permanentDeleteNote,
    restoreFromTrash,
    emptyTrash,
    searchNotes,
    refresh,
  };
}
