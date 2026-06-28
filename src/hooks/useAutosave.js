import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useAutosave — Debounced automatic saving with status tracking.
 *
 * Encapsulates all timer logic so the editor component stays clean.
 * Reuses the same `onSave` function as manual save — there is a
 * single source of truth for the save pipeline.
 *
 * Why a separate hook?
 *   - Timer logic is complex (debounce, cancel, queue, cleanup).
 *   - Extracting it keeps the editor focused on editing.
 *   - The hook is reusable for any auto-persisting form.
 *
 * Status lifecycle:
 *   idle → saving → saved → idle (after 2.5s)
 *   idle → saving → failed → idle (on next edit)
 *
 * Duplicate save prevention:
 *   - Only one save runs at a time (isSavingRef guard).
 *   - If a save is requested during an active save, it's queued.
 *   - After the active save completes, the queued save runs.
 *
 * Timer cleanup:
 *   - cancel() clears the debounce timer.
 *   - The useEffect cleanup calls cancel() on unmount.
 *   - saveNow() cancels any pending debounce before saving.
 *
 * @param {Object} options
 * @param {Function} options.onSave — Async save function. Must return { data, error }.
 * @param {number} options.delay — Debounce delay in ms (default: 800).
 * @returns {{ schedule, saveNow, cancel, saveStatus, isSaving }}
 */

const STATUS_RESET_DELAY = 2500;

export function useAutosave({ onSave, delay = 800 }) {
  const [saveStatus, setSaveStatus] = useState("idle");

  // ── Refs for timer management ──────────────────────────────
  const debounceTimerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const queueTimerRef = useRef(null);
  const isSavingRef = useRef(false);
  const queuedDraftRef = useRef(null);
  const onSaveRef = useRef(onSave);
  const mountedRef = useRef(true);

  // ── Cancel pending debounce timer ──────────────────────────
  const cancel = useCallback(() => {
    queuedDraftRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    if (queueTimerRef.current) {
      clearTimeout(queueTimerRef.current);
      queueTimerRef.current = null;
    }
  }, []);

  // ── Execute save (internal) ────────────────────────────────
  const executeSave = useCallback(async function execute(draft) {
    if (isSavingRef.current) {
      // A save is already running — queue this one
      queuedDraftRef.current = draft;
      return;
    }

    isSavingRef.current = true;
    if (mountedRef.current) setSaveStatus("saving");

    try {
      const result = await onSaveRef.current(draft);

      if (result?.error) {
        if (mountedRef.current) setSaveStatus("failed");
      } else {
        if (mountedRef.current) setSaveStatus("saved");
        // Reset "Saved" → "idle" after a delay
        statusTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
          }
          statusTimerRef.current = null;
        }, STATUS_RESET_DELAY);
      }
    } catch {
      if (mountedRef.current) setSaveStatus("failed");
    } finally {
      isSavingRef.current = false;

      // Process queued save if any
      if (queuedDraftRef.current) {
        const nextDraft = queuedDraftRef.current;
        queuedDraftRef.current = null;
        // Small delay to let React batch the status update
        queueTimerRef.current = setTimeout(() => {
          queueTimerRef.current = null;
          execute(nextDraft);
        }, 50);
      }
    }
  }, []);

  // ── Schedule autosave (debounced) ──────────────────────────
  const schedule = useCallback((draft) => {
    cancel();

    // Reset status from previous save result when new edits arrive
    setSaveStatus((current) =>
      current === "saved" || current === "failed" ? "idle" : current,
    );

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      executeSave(draft);
    }, delay);
  }, [cancel, delay, executeSave]);

  // ── Save immediately (manual save) ─────────────────────────
  const saveNow = useCallback(async (draft) => {
    cancel();
    await executeSave(draft);
  }, [cancel, executeSave]);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  return {
    schedule,
    saveNow,
    cancel,
    saveStatus,
    isSaving: saveStatus === "saving",
  };
}
