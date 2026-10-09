"use client";

import { useState, useCallback, useRef } from "react";
import { BuilderFormDefinition } from "../schemas/builder-definition-schema";

export function useBuilderHistory(
  initialState: BuilderFormDefinition,
  maxHistory = 50
) {
  const [state, setState] = useState<BuilderFormDefinition>(initialState);
  const [past, setPast] = useState<BuilderFormDefinition[]>([]);
  const [future, setFuture] = useState<BuilderFormDefinition[]>([]);
  const stateRef = useRef<BuilderFormDefinition>(initialState);

  stateRef.current = state;

  const set = useCallback(
    (
      action:
        | BuilderFormDefinition
        | ((prev: BuilderFormDefinition) => BuilderFormDefinition)
    ) => {
      const prev = stateRef.current;
      const next = typeof action === "function" ? action(prev) : action;

      // Avoid pushing identical snapshots
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return;
      }

      setPast((oldPast) => [...oldPast.slice(-maxHistory + 1), prev]);
      setFuture([]);
      setState(next);
      stateRef.current = next;
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const current = stateRef.current;

    setPast(newPast);
    setFuture((oldFuture) => [current, ...oldFuture]);
    setState(previous);
    stateRef.current = previous;
  }, [past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const current = stateRef.current;

    setFuture(newFuture);
    setPast((oldPast) => [...oldPast, current]);
    setState(next);
    stateRef.current = next;
  }, [future]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
