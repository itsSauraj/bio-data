"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { SizedPhoto } from "@/lib/image-size";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";

/**
 * Target row height per breakpoint (CSS variable --row-h, set on the list);
 * each tile's flex-basis is its aspect ratio × this, then tiles grow to fill
 * the row edge to edge.
 */
const ROW_HEIGHT_CLASSES = "[--row-h:120px] sm:[--row-h:180px] lg:[--row-h:230px]";

const lightboxButton =
  "rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/**
 * Justified photo mosaic: every tile keeps its photo's real aspect ratio (no
 * cropping) and rows pack flush. Each tile's flex-basis and flex-grow come
 * from its ratio; a trailing filler keeps the last row from stretching.
 * Clicking a tile opens a full-screen lightbox (arrow keys / Esc supported).
 */
export default function PhotoBento({ photos }: { photos: SizedPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const count = photos.length;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? null : (i + delta + count) % count)),
    [count],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, close, step]);

  if (count === 0) return null;
  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className={`flex flex-wrap gap-2 after:block after:grow-[999] after:content-[''] sm:gap-3 ${ROW_HEIGHT_CLASSES}`}>
        {photos.map((photo, i) => {
          const ratio = photo.width / photo.height;
          return (
            <li
              key={photo.src}
              style={{ flexGrow: ratio * 100, flexBasis: `calc(${ratio.toFixed(4)} * var(--row-h))` }}
              className="group relative overflow-hidden rounded-xl border-2 border-gold/60 bg-cream"
            >
              {/* Spacer: sets the tile height from its width so the ratio is exact. */}
              <div aria-hidden style={{ paddingBottom: `${100 / ratio}%` }} />
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open photo: ${photo.alt}`}
                className="absolute inset-0 block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-maroon"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 print:hidden"
          onClick={close}
        >
          <button type="button" onClick={close} aria-label="Close" className={`${lightboxButton} absolute right-4 top-4`}>
            <CloseIcon className="h-5 w-5" />
          </button>

          {count > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className={`${lightboxButton} absolute left-2 top-1/2 -translate-y-1/2 sm:left-6`}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}

          <div className="relative h-[78vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
          </div>

          {count > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className={`${lightboxButton} absolute right-2 top-1/2 -translate-y-1/2 sm:right-6`}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}

          <p className="absolute bottom-5 left-1/2 w-[90%] -translate-x-1/2 truncate text-center text-sm text-white/80">
            {index + 1} / {count} · {current.alt}
          </p>
        </div>
      )}
    </>
  );
}
