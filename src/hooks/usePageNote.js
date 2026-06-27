import { useState, useEffect, useCallback, useRef } from "react";
import * as NoteRepository from "../repositories/NoteRepository";
import { subscribe, getActiveTab } from "../services/pageNoteService";
import logger from "../utils/logger";

const log = logger.create("usePageNote");

/**
 * usePageNote — Connects the active browser tab to page notes.
 *
 * Subscribes to tab changes via PageNoteService and finds
 * the matching note for the current URL. Provides a handler
 * to create a new page note from the active tab.
 *
 * Usage:
 *   const {
 *     activeTab,
 *     pageNote,
 *     hasNote,
 *     loading,
 *     createPageNote,
 *   } = usePageNote(notes)
 *
 * @param {Object[]} notes — All notes from useNotes() (for URL matching).
 * @returns {Object} Page note state and actions.
 */
export function usePageNote(notes = []) {
  const [activeTab, setActiveTab] = useState(null);
  const [pageNote, setPageNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  // ── Find note matching URL ─────────────────────────────────
  const findNote = useCallback(
    (url) => {
      if (!url || !notes.length) return null;
      return notes.find((n) => n.url === url && !n.isDeleted) || null;
    },
    [notes],
  );

  // ── Tab change handler ─────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    if (cancelledRef.current) return;
    log.debug("Tab changed:", tab?.title || "none");
    setActiveTab(tab);
  }, []);

  // ── Subscribe to tab changes on mount ──────────────────────
  useEffect(() => {
    cancelledRef.current = false;

    // Get initial tab
    getActiveTab().then((tab) => {
      if (!cancelledRef.current) {
        setActiveTab(tab);
      }
    });

    const unsubscribe = subscribe(handleTabChange);

    return () => {
      cancelledRef.current = true;
      unsubscribe();
    };
  }, [handleTabChange]);

  // ── Find matching note when tab or notes change ────────────
  useEffect(() => {
    let cancelled = false;

    async function findMatchingNote() {
      if (!activeTab?.url) {
        if (!cancelled) {
          setPageNote(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      // First try in-memory match (instant)
      const localMatch = findNote(activeTab.url);
      if (cancelled) return;

      if (localMatch) {
        if (!cancelled) {
          setPageNote(localMatch);
          setLoading(false);
        }
        return;
      }

      // Fallback: query storage directly (catches notes loaded
      // after the initial useNotes() call)
      try {
        const { data } = await NoteRepository.getByUrl(activeTab.url);
        if (!cancelled) {
          setPageNote(data);
        }
      } catch (err) {
        log.error("getByUrl failed:", err);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    findMatchingNote();

    return () => {
      cancelled = true;
    };
  }, [activeTab?.url, notes, findNote]);

  // ── Create page note ───────────────────────────────────────
  const createPageNote = useCallback(
    async (onCreated) => {
      if (!activeTab) {
        return { data: null, error: "No active tab" };
      }

      setLoading(true);

      try {
        const { data: note, error } = await NoteRepository.createForPage({
          url: activeTab.url,
          title: activeTab.title,
          favIconUrl: activeTab.favIconUrl,
        });

        if (error) {
          log.error("createForPage failed:", error);
          setLoading(false);
          return { data: null, error };
        }

        setPageNote(note);
        setLoading(false);
        log.info("Page note created:", note.id);

        onCreated?.(note);
        return { data: note, error: null };
      } catch (err) {
        log.error("createPageNote failed:", err);
        setLoading(false);
        return { data: null, error: "Failed to create page note" };
      }
    },
    [activeTab],
  );

  return {
    activeTab,
    pageNote,
    hasNote: pageNote !== null,
    loading,
    createPageNote,
  };
}
