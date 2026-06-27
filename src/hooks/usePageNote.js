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
 * to save the note tied to the active tab.
 *
 * Usage:
 *   const {
 *     activeTab,
 *     pageNote,
 *     hasNote,
 *     loading,
 *     savePageNote,
 *   } = usePageNote(notes)
 *
 * @param {Object[]} notes — All notes from useNotes() (for URL matching).
 * @returns {Object} Page note state and actions.
 */
export function usePageNote(notes = [], options = {}) {
  const { onPersist } = options;
  const [activeTab, setActiveTab] = useState(null);
  const [pageNote, setPageNote] = useState(null);
  const [pageState, setPageState] = useState("no-page");
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);
  const lookupSeqRef = useRef(0);
  const activeTabRef = useRef(null);
  const pageNoteRef = useRef(null);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    pageNoteRef.current = pageNote;
  }, [pageNote]);

  // ── Find note matching URL ─────────────────────────────────
  const findNote = useCallback(
    (url) => {
      if (!url || !notes.length) return null;
      return notes.find((n) => n.url === url && !n.isDeleted) || null;
    },
    [notes],
  );

  const createDraft = useCallback((tab) => {
    if (!tab?.url) return null;

    return {
      id: `draft:${tab.id}:${tab.url}`,
      title: tab.title || tab.url,
      content: "",
      folderId: null,
      tags: [],
      url: tab.url,
      favIconUrl: tab.favIconUrl || null,
      createdAt: null,
      updatedAt: null,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      deletedAt: null,
      color: null,
      isDraft: true,
    };
  }, []);

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

  // ── Resolve active page to stored note or in-memory draft ──
  useEffect(() => {
    let cancelled = false;
    const seq = lookupSeqRef.current + 1;
    lookupSeqRef.current = seq;

    async function resolvePageNote() {
      if (!activeTab?.url) {
        if (!cancelled) {
          setPageNote(null);
          setPageState(activeTab ? "unsupported-page" : "no-page");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setPageState("searching");
        setPageNote(null);
      }

      // First try in-memory match (instant)
      const localMatch = findNote(activeTab.url);
      if (cancelled) return;

      if (localMatch) {
        if (!cancelled) {
          setPageNote(localMatch);
          setPageState("existing");
          setLoading(false);
        }
        return;
      }

      // Fallback: query storage directly (catches notes loaded
      // after the initial useNotes() call)
      try {
        const { data } = await NoteRepository.getByUrl(activeTab.url);
        if (!cancelled && lookupSeqRef.current === seq) {
          const nextNote = data || createDraft(activeTab);
          setPageNote(nextNote);
          setPageState(data ? "existing" : "draft");
        }
      } catch (err) {
        log.error("getByUrl failed:", err);
        if (!cancelled && lookupSeqRef.current === seq) {
          setPageNote(createDraft(activeTab));
          setPageState("draft");
        }
      }

      if (!cancelled && lookupSeqRef.current === seq) {
        setLoading(false);
      }
    }

    resolvePageNote();

    return () => {
      cancelled = true;
    };
  }, [activeTab, notes, findNote, createDraft]);

  // ── Persist page note ──────────────────────────────────────
  const savePageNote = useCallback(
    async ({ noteId, url, title, content }) => {
      const currentNote = pageNoteRef.current;
      const currentTab = activeTabRef.current;

      if (!currentNote) return { data: null, error: "No page note selected" };
      if (!currentTab?.url) return { data: null, error: "No active page URL" };
      if (noteId && currentNote.id !== noteId) {
        log.warn("Ignoring stale page-note save for inactive note", {
          requestedNoteId: noteId,
          currentNoteId: currentNote.id,
        });
        return { data: currentNote, error: null };
      }
      if (url && currentTab.url !== url) {
        log.warn("Ignoring stale page-note save for inactive URL", {
          requestedUrl: url,
          currentUrl: currentTab.url,
        });
        return { data: currentNote, error: null };
      }

      const trimmedTitle = title.trim();
      const finalTitle = trimmedTitle || currentTab.title || currentTab.url;

      const result = currentNote.isDraft
        ? await NoteRepository.createFromDraft({
            ...currentNote,
            title: finalTitle,
            content,
            url: currentTab.url,
            favIconUrl: currentTab.favIconUrl,
          })
        : await NoteRepository.update(currentNote.id, {
            title: finalTitle,
            content,
          });

      if (result.error) return result;

      setPageNote(result.data);
      setPageState("existing");
      await onPersist?.();
      return result;
    },
    [onPersist],
  );

  return {
    activeTab,
    pageNote,
    pageState,
    hasNote: Boolean(pageNote && !pageNote.isDraft),
    isDraft: Boolean(pageNote?.isDraft),
    loading,
    savePageNote,
  };
}
