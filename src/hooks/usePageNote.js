import { useState, useEffect, useCallback, useRef } from "react";
import * as NoteRepository from "../repositories/NoteRepository";
import { subscribe } from "../services/pageNoteService";
import logger from "../utils/logger";

const log = logger.create("usePageNote");

function isSupportedPageUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function areTabsEqual(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;
  return (
    left.id === right.id &&
    left.windowId === right.windowId &&
    left.url === right.url &&
    left.title === right.title &&
    left.favIconUrl === right.favIconUrl &&
    left.active === right.active
  );
}

function areNotesEqual(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;

  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    const leftValue = left[key];
    const rightValue = right[key];
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (
        leftValue.length !== rightValue.length ||
        leftValue.some((value, index) => value !== rightValue[index])
      ) {
        return false;
      }
    } else if (!Object.is(leftValue, rightValue)) {
      return false;
    }
  }
  return true;
}

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

  const commitPageNote = useCallback((nextNote) => {
    pageNoteRef.current = nextNote;
    setPageNote((currentNote) =>
      areNotesEqual(currentNote, nextNote) ? currentNote : nextNote,
    );
  }, []);

  // ── Tab change handler ─────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    if (cancelledRef.current) return;

    const previousTab = activeTabRef.current;
    if (areTabsEqual(previousTab, tab)) {
      log.debug("Tab notification ignored because data was unchanged");
      return;
    }

    log.debug("Tab changed:", tab?.title || "none");
    activeTabRef.current = tab;

    if (previousTab?.url !== tab?.url) {
      const isSupported = isSupportedPageUrl(tab?.url);
      commitPageNote(null);
      setPageState(
        isSupported ? "searching" : tab ? "unsupported-page" : "no-page",
      );
      setLoading(isSupported);
    }

    setActiveTab(tab);
  }, [commitPageNote]);

  // ── Subscribe to tab changes on mount ──────────────────────
  useEffect(() => {
    cancelledRef.current = false;
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
      if (!isSupportedPageUrl(activeTab?.url)) {
        if (!cancelled) {
          commitPageNote(null);
          setPageState((current) => {
            const next = activeTab ? "unsupported-page" : "no-page";
            return current === next ? current : next;
          });
          setLoading((current) => (current ? false : current));
        }
        return;
      }

      if (!cancelled && pageNoteRef.current?.url !== activeTab.url) {
        setLoading((current) => (current ? current : true));
        setPageState((current) =>
          current === "searching" ? current : "searching",
        );
      }

      // First try in-memory match (instant)
      const localMatch = findNote(activeTab.url);
      if (cancelled) return;

      if (localMatch) {
        if (!cancelled) {
          commitPageNote(localMatch);
          setPageState((current) =>
            current === "existing" ? current : "existing",
          );
          setLoading((current) => (current ? false : current));
        }
        return;
      }

      // Fallback: query storage directly (catches notes loaded
      // after the initial useNotes() call)
      try {
        const { data } = await NoteRepository.getByUrl(activeTab.url);
        if (!cancelled && lookupSeqRef.current === seq) {
          const nextNote = data || createDraft(activeTab);
          commitPageNote(nextNote);
          const nextState = data ? "existing" : "draft";
          setPageState((current) =>
            current === nextState ? current : nextState,
          );
        }
      } catch (err) {
        log.error("getByUrl failed:", err);
        if (!cancelled && lookupSeqRef.current === seq) {
          commitPageNote(createDraft(activeTab));
          setPageState((current) =>
            current === "draft" ? current : "draft",
          );
        }
      }

      if (!cancelled && lookupSeqRef.current === seq) {
        setLoading((current) => (current ? false : current));
      }
    }

    resolvePageNote();

    return () => {
      cancelled = true;
    };
  }, [activeTab, findNote, createDraft, commitPageNote]);

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

      if (
        !currentNote.isDraft &&
        finalTitle === (currentNote.title || "") &&
        content === (currentNote.content || "")
      ) {
        log.debug("Save skipped because note content did not change");
        return { data: currentNote, error: null };
      }

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

      commitPageNote(result.data);
      setPageState((current) =>
        current === "existing" ? current : "existing",
      );
      await onPersist?.();
      return result;
    },
    [onPersist, commitPageNote],
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
