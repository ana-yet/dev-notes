import { useEffect, useState } from "react";
import * as FolderRepository from "../repositories/FolderRepository";

/** Loads the folders displayed by the notes and page-notes screens. */
export function useFolders() {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await FolderRepository.getAll();
      if (!cancelled) setFolders(data);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { folders };
}
