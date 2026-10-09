"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  BuilderFormDefinition,
  SaveDraftResponse,
} from "../schemas/builder-definition-schema";

export type SaveStatus = "saved" | "saving" | "failed" | "conflict";

interface UseDraftAutosaveProps {
  formId: string;
  initialRevision: number;
  definition: BuilderFormDefinition;
  onConflict?: (currentRevision: number) => void;
}

export function useDraftAutosave({
  formId,
  initialRevision,
  definition,
  onConflict,
}: UseDraftAutosaveProps) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<number>(initialRevision);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(undefined);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const latestRevisionRef = useRef(initialRevision);
  const latestDefinitionRef = useRef(definition);
  const isFirstMountRef = useRef(true);

  latestRevisionRef.current = revision;
  latestDefinitionRef.current = definition;

  const performSave = useCallback(
    async (docToSave: BuilderFormDefinition) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      isSavingRef.current = true;
      pendingSaveRef.current = false;
      setStatus("saving");
      setError(null);

      try {
        const res = await fetch(`/api/v1/forms/${formId}/draft`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedRevision: latestRevisionRef.current,
            definition: docToSave,
          }),
        });

        const data: SaveDraftResponse = await res.json();

        if (res.status === 409 || data.conflict) {
          setStatus("conflict");
          setError(
            data.error ||
              "This form was modified in another tab or device. Please reload."
          );
          if (data.currentRevision !== undefined) {
            latestRevisionRef.current = data.currentRevision;
            setRevision(data.currentRevision);
            if (onConflict) onConflict(data.currentRevision);
          }
          return;
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to save draft");
        }

        if (data.newRevision !== undefined) {
          latestRevisionRef.current = data.newRevision;
          setRevision(data.newRevision);
        }

        setStatus("saved");
        setLastSavedAt(data.updatedAt || new Date().toISOString());
      } catch (err: unknown) {
        console.error("Autosave draft error:", err);
        setStatus("failed");
        const msg =
          err instanceof Error
            ? err.message
            : "Save failed. Click retry to save changes.";
        setError(msg);
      } finally {
        isSavingRef.current = false;
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          performSave(latestDefinitionRef.current);
        }
      }
    },
    [formId, onConflict]
  );

  // Warn before closing tab if save is pending or in flight
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "saving" || isSavingRef.current || pendingSaveRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // Trigger autosave when definition changes
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    setStatus("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      performSave(latestDefinitionRef.current);
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [definition, performSave]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    await performSave(latestDefinitionRef.current);
  }, [performSave]);

  const retry = useCallback(async () => {
    await performSave(latestDefinitionRef.current);
  }, [performSave]);

  return {
    status,
    error,
    revision,
    lastSavedAt,
    saveNow,
    retry,
  };
}
