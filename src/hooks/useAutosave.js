import { useState, useEffect, useRef } from "react";

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
  const isSavingRef = useRef(false);
  const queuedDraftRef = useRef(null);

  // ── Cancel pending debounce timer ──────────────────────────
  const cancel = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  };

  // ── Execute save (internal) ────────────────────────────────
  const executeSave = async (draft) => {
    if (isSavingRef.current) {
      // A save is already running — queue this one
      queuedDraftRef.current = draft;
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const result = await onSave(draft);

      if (result?.error) {
        setSaveStatus("failed");
      } else {
        setSaveStatus("saved");
        // Reset "Saved" → "idle" after a delay
        statusTimerRef.current = setTimeout(() => {
          setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
          statusTimerRef.current = null;
        }, STATUS_RESET_DELAY);
      }
    } catch {
      setSaveStatus("failed");
    } finally {
      isSavingRef.current = false;

      // Process queued save if any
      if (queuedDraftRef.current) {
        const nextDraft = queuedDraftRef.current;
        queuedDraftRef.current = null;
        // Small delay to let React batch the status update
        setTimeout(() => executeSave(nextDraft), 50);
      }
    }
  };

  // ── Schedule autosave (debounced) ──────────────────────────
  const schedule = (draft) => {
    cancel();

    // Reset status from previous save result when new edits arrive
    if (saveStatus === "saved" || saveStatus === "failed") {
      setSaveStatus("idle");
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      executeSave(draft);
    }, delay);
  };

  // ── Save immediately (manual save) ─────────────────────────
  const saveNow = async (draft) => {
    cancel();
    await executeSave(draft);
  };

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => cancel();
  });

  return {
    schedule,
    saveNow,
    cancel,
    saveStatus,
    isSaving: saveStatus === "saving",
  };
}
