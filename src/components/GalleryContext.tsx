"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type GalleryState = {
  /** `src` of the photo currently open in the full-screen viewer, or null. */
  openSrc: string | null;
  open: (src: string) => void;
  close: () => void;
};

const GalleryCtx = createContext<GalleryState | null>(null);

/** Shares the full-screen viewer state so the hero portrait can open the gallery too. */
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const open = useCallback((src: string) => setOpenSrc(src), []);
  const close = useCallback(() => setOpenSrc(null), []);
  const value = useMemo(() => ({ openSrc, open, close }), [openSrc, open, close]);
  return <GalleryCtx.Provider value={value}>{children}</GalleryCtx.Provider>;
}

export function useGallery(): GalleryState {
  const ctx = useContext(GalleryCtx);
  if (!ctx) throw new Error("useGallery must be used inside <GalleryProvider>");
  return ctx;
}
