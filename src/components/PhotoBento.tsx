"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { SizedPhoto } from "@/lib/image-size";
import { DashedRect } from "./DashedFrame";
import { useGallery } from "./GalleryContext";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";

/**
 * Target row height per breakpoint (CSS variable --row-h, set on the list);
 * each tile's flex-basis is its aspect ratio × this, then tiles grow to fill
 * the row edge to edge.
 */
const ROW_HEIGHT_CLASSES = "[--row-h:120px] sm:[--row-h:180px] lg:[--row-h:230px]";

/** Minimum time between wheel-driven photo changes, so one flick moves one photo. */
const WHEEL_COOLDOWN_MS = 450;
/** Downward swipe (px) that closes the viewer, like a native photo app. */
const SWIPE_CLOSE_PX = 90;

const viewerButton =
  "rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/**
 * Justified photo mosaic: every tile keeps its photo's real aspect ratio (no
 * cropping) and rows pack flush, each framed by a moving dashed border.
 *
 * Clicking a tile (or the hero portrait) pops open a full-screen viewer that
 * behaves like a phone gallery: swipe left/right between photos (a
 * scroll-snap track, so it follows the finger), swipe down or press Esc to
 * close, scroll the mouse wheel or use the arrow keys/buttons on desktop.
 */
export default function PhotoBento({ photos }: { photos: SizedPhoto[] }) {
  const { openSrc, open, close } = useGallery();
  const count = photos.length;

  const found = openSrc === null ? -1 : photos.findIndex((p) => p.src === openSrc);
  const index = found >= 0 ? found : null;

  const trackRef = useRef<HTMLDivElement>(null);
  const previousIndex = useRef<number | null>(null);
  const lastWheel = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (index === null || count === 0) return;
      open(photos[(index + delta + count) % count].src);
    },
    [index, count, photos, open],
  );

  // Keep the viewer's track on the open photo: jump instantly when it opens,
  // glide when the photo changes via keys, buttons or the wheel.
  useEffect(() => {
    const track = trackRef.current;
    const wasClosed = previousIndex.current === null;
    previousIndex.current = index;
    if (index === null || !track) return;
    const shown = Math.round(track.scrollLeft / track.clientWidth);
    if (shown !== index) track.scrollTo({ left: index * track.clientWidth, behavior: wasClosed ? "instant" : "smooth" });
  }, [index]);

  // Keyboard navigation and page scroll lock while the viewer is open.
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

  /** A finger swipe (or trackpad) moved the track: sync the open photo to the slide now in view. */
  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || index === null) return;
    const shown = Math.round(track.scrollLeft / track.clientWidth);
    if (shown !== index && photos[shown]) open(photos[shown].src);
  };

  /** Mouse wheel: one notch (vertical) = one photo. Horizontal trackpad gestures scroll the track natively. */
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 8) return;
    const now = Date.now();
    if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
    lastWheel.current = now;
    step(e.deltaY > 0 ? 1 : -1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  /** Swipe down to close (horizontal swipes are handled by the scroll-snap track). */
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (dy > SWIPE_CLOSE_PX && Math.abs(dx) < SWIPE_CLOSE_PX / 1.5) close();
  };

  if (count === 0) return null;
  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className={`flex flex-wrap gap-2 after:block after:grow-[999] after:content-[''] sm:gap-3 ${ROW_HEIGHT_CLASSES}`}>
        {photos.map((photo) => {
          const ratio = photo.width / photo.height;
          return (
            <li
              key={photo.src}
              style={{ flexGrow: ratio * 100, flexBasis: `calc(${ratio.toFixed(4)} * var(--row-h))` }}
              className="group relative overflow-hidden rounded-xl bg-cream"
            >
              {/* Spacer: sets the tile height from its width so the ratio is exact. */}
              <div aria-hidden style={{ paddingBottom: `${100 / ratio}%` }} />
              <button
                type="button"
                onClick={() => open(photo.src)}
                aria-label={`Open photo: ${photo.alt}`}
                className="absolute inset-0 block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-maroon"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  quality={85}
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
              <DashedRect radius={12} strokeWidth={2} />
            </li>
          );
        })}
      </ul>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-50 animate-fade-in bg-black/95 motion-reduce:animate-none print:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipeable track: one full-screen slide per photo, snapping to each. */}
          <div
            ref={trackRef}
            onScroll={handleTrackScroll}
            onWheel={handleWheel}
            className="flex h-full w-full animate-pop snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] motion-reduce:animate-none [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((photo, i) => (
              <div
                key={photo.src}
                className="relative h-full w-full shrink-0 snap-center"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  quality={90}
                  sizes="100vw"
                  loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                  className="object-contain p-3 pb-14 pt-14 sm:p-12"
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={close} aria-label="Close" className={`${viewerButton} absolute right-4 top-4`}>
            <CloseIcon className="h-5 w-5" />
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1)}
                className={`${viewerButton} absolute left-4 top-1/2 hidden -translate-y-1/2 sm:block`}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1)}
                className={`${viewerButton} absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block`}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          )}

          <p className="pointer-events-none absolute bottom-5 left-1/2 w-[90%] -translate-x-1/2 truncate text-center text-sm text-white/80">
            {index + 1} / {count} · {current.alt}
          </p>
        </div>
      )}
    </>
  );
}
