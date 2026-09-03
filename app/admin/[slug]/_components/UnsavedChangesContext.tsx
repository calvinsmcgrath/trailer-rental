"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type UnsavedChangesContextValue = {
  isDirty: boolean;
  setDirty: (id: string, dirty: boolean) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const setDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const isDirty = dirtyIds.size > 0;

  // Covers leaving the app entirely: closing the tab, refreshing, or typing a new URL.
  // Browsers show their own generic prompt here — custom text isn't allowed.
  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}
