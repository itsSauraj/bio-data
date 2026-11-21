"use client";

import type { ReactNode } from "react";
import { useGallery } from "./GalleryContext";

/** Makes the hero portrait clickable: opens the same full-screen viewer as the gallery. */
export default function HeroPhotoButton({
  src,
  label,
  className,
  children,
}: {
  src: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { open } = useGallery();
  return (
    <button type="button" onClick={() => open(src)} aria-label={label} className={className}>
      {children}
    </button>
  );
}
