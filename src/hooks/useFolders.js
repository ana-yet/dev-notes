import { useState, useEffect, useCallback } from "react";
import * as FolderRepository from "../repositories/FolderRepository";

/**
 * useFolders — React hook for folder CRUD operations.
 *
 * Manages loading/error state and exposes a clean API for components.
 * Components should NEVER call FolderRepository directly.
 *
 * Usage:
 *   const { folders, loading, error, createFolder, renameFolder, deleteFolder, refresh } = useFolders()
 */
export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await FolderRepository.getAll();
    setFolders(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      await refresh();
    }
    load();
  }, [refresh]);

  const createFolder = useCallback(
    async (data) => {
      const { data: folder, error: err } = await FolderRepository.create(data);
      if (!err) await refresh();
      return { data: folder, error: err };
    },
    [refresh],
  );

  const renameFolder = useCallback(
    async (id, newName) => {
      const { data: folder, error: err } = await FolderRepository.rename(
        id,
        newName,
      );
      if (!err) await refresh();
      return { data: folder, error: err };
    },
    [refresh],
  );

  const deleteFolder = useCallback(
    async (id) => {
      const { data: ok, error: err } = await FolderRepository.remove(id);
      if (!err) await refresh();
      return { data: ok, error: err };
    },
    [refresh],
  );

  const updateFolder = useCallback(
    async (id, data) => {
      const { data: folder, error: err } = await FolderRepository.update(
        id,
        data,
      );
      if (!err) await refresh();
      return { data: folder, error: err };
    },
    [refresh],
  );

  return {
    folders,
    loading,
    error,
    createFolder,
    renameFolder,
    deleteFolder,
    updateFolder,
    refresh,
  };
}
