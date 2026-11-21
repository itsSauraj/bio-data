"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { biodata } from "@/data/biodata";
import { LABELS, LANG_PATH, type Lang } from "@/data/labels";
import type { SizedPhoto } from "@/lib/image-size";
import { cn } from "@/lib/cn";
import { useGallery } from "./GalleryContext";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, MinusIcon, PlusIcon, ShareIcon } from "./Icons";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const BUTTON_ZOOM_STEP = 1.5;
/** Fraction of the viewer width a swipe must cover to change photo. */
const SWIPE_THRESHOLD = 0.2;
/** Downward swipe (px) that closes the viewer, like a native photo app. */
const SWIPE_CLOSE_PX = 90;
/** Minimum time between wheel-driven photo changes, so one flick moves one photo. */
const WHEEL_COOLDOWN_MS = 450;
const DOUBLE_TAP_MS = 300;

type Point = { x: number; y: number };
type Gesture =
  | { kind: "none" }
  | { kind: "swipe"; start: Point; pointerId: number }
  | { kind: "pan"; start: Point; startOffset: Point; pointerId: number }
  | { kind: "pinch"; startDist: number; startScale: number; startOffset: Point; startMid: Point };

const ZERO: Point = { x: 0, y: 0 };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const roundButton =
  "rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40";

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

/**
 * Full-screen photo viewer, driven by the shared gallery context.
 *
 * Gestures (pointer events, so the page itself never zooms or scrolls):
 * - 1×: swipe left/right to change photo (no wrap-around), swipe down to
 *   close, double-tap / double-click to zoom in.
 * - Pinch (two fingers) or Ctrl + wheel / trackpad pinch to zoom; when
 *   zoomed, one finger or the mouse wheel pans the image, and photo
 *   switching by swipe is paused until zoomed back out.
 * - Desktop: + / − / reset buttons and a minimap showing the visible area.
 */
export default function PhotoViewer({ photos, lang }: { photos: SizedPhoto[]; lang: Lang }) {
  const { openSrc, open, close } = useGallery();
  const L = LABELS[lang];
  const personName = lang === "hi" && biodata.hindi.name ? biodata.hindi.name : biodata.name;
  const count = photos.length;

  const found = openSrc === null ? -1 : photos.findIndex((p) => p.src === openSrc);
  const index = found >= 0 ? found : null;
  const isOpen = index !== null;

  const surfaceRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Zoom belongs to one photo: when `index` changes the derived scale is 1 again.
  const [zoomState, setZoomState] = useState<{ index: number | null; scale: number; offset: Point }>({
    index: null,
    scale: 1,
    offset: { x: 0, y: 0 },
  });
  const zoomActive = zoomState.index === index;
  const scale = zoomActive ? zoomState.scale : 1;
  const offset = zoomActive ? zoomState.offset : ZERO;
  const setZoom = useCallback((s: number, o: Point) => setZoomState({ index, scale: s, offset: o }), [index]);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sharing, setSharing] = useState(false);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture>({ kind: "none" });
  const lastWheel = useRef(0);
  const lastTap = useRef(0);

  // ── Geometry ────────────────────────────────────────────────────────────
  const padding = size.w < 640 ? { x: 12, y: 64 } : { x: 72, y: 72 };

  /** Displayed size of a photo at 1× (fitted inside the viewer with padding). */
  const fitSize = useCallback(
    (photo: SizedPhoto) => {
      const availW = Math.max(1, size.w - padding.x * 2);
      const availH = Math.max(1, size.h - padding.y * 2);
      const ratio = photo.width / photo.height;
      let w = availW;
      let h = w / ratio;
      if (h > availH) {
        h = availH;
        w = h * ratio;
      }
      return { w, h };
    },
    [size.w, size.h, padding.x, padding.y],
  );

  const current = index === null ? null : photos[index];
  const fit = current ? fitSize(current) : { w: 0, h: 0 };

  /** Keep the zoomed image covering the viewer: never pan past its edges. */
  const clampOffset = useCallback(
    (o: Point, s: number): Point => {
      const maxX = Math.max(0, (fit.w * s - size.w) / 2);
      const maxY = Math.max(0, (fit.h * s - size.h) / 2);
      return { x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) };
    },
    [fit.w, fit.h, size.w, size.h],
  );

  /** Viewer-relative coordinates of a screen point, measured from the centre. */
  const fromCenter = (p: Point): Point => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: p.x - rect.left - rect.width / 2, y: p.y - rect.top - rect.height / 2 };
  };

  /** Zoom so that the image point under `screenPoint` stays put. */
  const zoomAt = useCallback(
    (screenPoint: Point, nextScale: number, from = { scale, offset }) => {
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const m = fromCenter(screenPoint);
      const imagePoint = { x: (m.x - from.offset.x) / from.scale, y: (m.y - from.offset.y) / from.scale };
      setZoom(s, s === 1 ? { x: 0, y: 0 } : clampOffset({ x: m.x - imagePoint.x * s, y: m.y - imagePoint.y * s }, s));
    },
    [scale, offset, clampOffset, setZoom],
  );

  const resetZoom = useCallback(() => setZoom(1, { x: 0, y: 0 }), [setZoom]);

  const viewerCenter = (): Point => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
  };

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      const next = index + delta;
      if (next < 0 || next >= count) return;
      open(photos[next].src);
    },
    [index, count, photos, open],
  );

  // ── Effects ─────────────────────────────────────────────────────────────
  // Measure the viewer.
  useEffect(() => {
    if (!isOpen) return;
    const el = surfaceRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  // Keyboard: arrows change photo, + / − / 0 zoom, Esc closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "+" || e.key === "=") zoomAt(viewerCenter(), scale * BUTTON_ZOOM_STEP);
      else if (e.key === "-") zoomAt(viewerCenter(), scale / BUTTON_ZOOM_STEP);
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step, zoomAt, resetZoom, scale]);

  // Lock the page behind the viewer. `overflow: hidden` alone is ignored by
  // iOS Safari for touch scrolling, so the body is pinned at its scroll
  // offset and restored when the viewer closes.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const { position, top, left, right, width, overflow } = document.body.style;
    Object.assign(document.body.style, { position: "fixed", top: `-${scrollY}px`, left: "0", right: "0", width: "100%", overflow: "hidden" });
    return () => {
      Object.assign(document.body.style, { position, top, left, right, width, overflow });
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [isOpen]);

  // Native (non-passive) listeners: Ctrl+wheel / trackpad pinch must not zoom
  // the page, and iOS needs touchmove / gesturestart cancelled to stop page zoom.
  useEffect(() => {
    if (!isOpen) return;
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        zoomAt({ x: e.clientX, y: e.clientY }, scale * (e.deltaY < 0 ? 1.1 : 0.9));
        return;
      }
      if (scale > 1) {
        e.preventDefault();
        setZoomState((z) =>
          z.index === index ? { ...z, offset: clampOffset({ x: z.offset.x - e.deltaX, y: z.offset.y - e.deltaY }, z.scale) } : z,
        );
        return;
      }
      // 1×: one wheel notch = one photo.
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 8) return;
      const now = Date.now();
      if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
      lastWheel.current = now;
      step(e.deltaY > 0 ? 1 : -1);
    };
    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("gesturestart", prevent);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", prevent);
      document.removeEventListener("gesturestart", prevent);
    };
  }, [isOpen, index, scale, zoomAt, clampOffset, step]);

  // ── Pointer gestures ────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { kind: "pinch", startDist: distance(a, b), startScale: scale, startOffset: offset, startMid: midpoint(a, b) };
      setDragX(0);
      setDragY(0);
    } else if (pointers.current.size === 1) {
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        if (scale > 1) resetZoom();
        else zoomAt(p, DOUBLE_TAP_SCALE);
        gesture.current = { kind: "none" };
        return;
      }
      lastTap.current = now;
      gesture.current =
        scale > 1
          ? { kind: "pan", start: p, startOffset: offset, pointerId: e.pointerId }
          : { kind: "swipe", start: p, pointerId: e.pointerId };
    }
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const nextScale = clamp((g.startScale * distance(a, b)) / g.startDist, MIN_SCALE, MAX_SCALE);
      const startM = fromCenter(g.startMid);
      const nowM = fromCenter(midpoint(a, b));
      const imagePoint = { x: (startM.x - g.startOffset.x) / g.startScale, y: (startM.y - g.startOffset.y) / g.startScale };
      setZoom(nextScale, clampOffset({ x: nowM.x - imagePoint.x * nextScale, y: nowM.y - imagePoint.y * nextScale }, nextScale));
    } else if (g.kind === "pan" && e.pointerId === g.pointerId) {
      setZoom(scale, clampOffset({ x: g.startOffset.x + p.x - g.start.x, y: g.startOffset.y + p.y - g.start.y }, scale));
    } else if (g.kind === "swipe" && e.pointerId === g.pointerId && index !== null) {
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      if (Math.abs(dy) > Math.abs(dx)) {
        setDragY(Math.max(0, dy));
        setDragX(0);
      } else {
        const atEdge = (dx > 0 && index === 0) || (dx < 0 && index === count - 1);
        setDragX(atEdge ? dx * 0.3 : dx); // resistance at the first / last photo
        setDragY(0);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);

    if (g.kind === "pinch") {
      if (pointers.current.size === 1) {
        const [pointerId, p] = [...pointers.current.entries()][0];
        gesture.current = { kind: "pan", start: p, startOffset: offset, pointerId };
        return;
      }
      if (scale < 1.05) resetZoom();
    } else if (g.kind === "swipe" && e.pointerId === g.pointerId) {
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      if (Math.abs(dy) > Math.abs(dx) && dy > SWIPE_CLOSE_PX) close();
      else if (Math.abs(dx) > size.w * SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
      setDragX(0);
      setDragY(0);
    }

    if (pointers.current.size === 0) {
      gesture.current = { kind: "none" };
      setDragging(false);
    }
  };

  // ── Minimap ─────────────────────────────────────────────────────────────
  const MINIMAP_W = 150;
  const minimap = current && scale > 1 ? { w: MINIMAP_W, h: MINIMAP_W / (current.width / current.height) } : null;
  const visible = minimap
    ? {
        w: Math.min(1, size.w / (fit.w * scale)),
        h: Math.min(1, size.h / (fit.h * scale)),
        cx: 0.5 - offset.x / (fit.w * scale),
        cy: 0.5 - offset.y / (fit.h * scale),
      }
    : null;

  /** Centre the view on the image point (u, v) in 0–1 coordinates. */
  const centerOn = (u: number, v: number) =>
    setZoom(scale, clampOffset({ x: (0.5 - u) * fit.w * scale, y: (0.5 - v) * fit.h * scale }, scale));

  const onMinimapPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons === 0) return;
    if (e.type === "pointerdown") e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    centerOn(clamp((e.clientX - rect.left) / rect.width, 0, 1), clamp((e.clientY - rect.top) / rect.height, 0, 1));
  };

  // ── Share ───────────────────────────────────────────────────────────────
  const handleSharePhoto = async () => {
    if (!current || index === null) return;
    const siteUrl = new URL(LANG_PATH[lang], window.location.origin).href;
    const photoUrl = new URL(current.src, window.location.origin).href;
    const text = L.sharePhotoMessage(personName, siteUrl);
    const title = `${personName} – ${L.photos}`;

    if (typeof navigator.share !== "function") {
      openWhatsApp(`${text}\n${photoUrl}`);
      return;
    }

    setSharing(true);
    try {
      try {
        const response = await fetch(current.src);
        if (response.ok) {
          const blob = await response.blob();
          const extension = current.src.split(".").pop()?.toLowerCase() || "jpg";
          const fileName = `${biodata.name.trim().replace(/\s+/g, "-")}-photo-${index + 1}.${extension}`;
          const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title, text, files: [file] });
            return;
          }
        }
      } catch (err) {
        if (isAbort(err)) return;
        console.error(err);
      }
      await navigator.share({ title, text, url: photoUrl });
    } catch (err) {
      if (!isAbort(err)) openWhatsApp(`${text}\n${photoUrl}`);
    } finally {
      setSharing(false);
    }
  };

  if (!current || index === null) return null;

  const backdropOpacity = 1 - Math.min(dragY / 400, 0.6);
  const zoomed = scale > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-50 animate-fade-in select-none overscroll-none motion-reduce:animate-none print:hidden"
    >
      <div className="absolute inset-0 bg-black" style={{ opacity: 0.95 * backdropOpacity }} />

      {/* Gesture surface: all touch / mouse input lands here. */}
      <div
        ref={surfaceRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn("absolute inset-0 touch-none overflow-hidden", zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in")}
      >
        {/* Strip of slides, moved by index and the live swipe offset. */}
        <div
          className={cn("flex h-full w-full animate-pop motion-reduce:animate-none", !dragging && "transition-transform duration-300 ease-out")}
          style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
        >
          {photos.map((photo, i) => {
            const isCurrent = i === index;
            const box = fitSize(photo);
            const transform = isCurrent
              ? `translate(${offset.x}px, ${offset.y + dragY}px) scale(${scale})`
              : undefined;
            return (
              <div key={photo.src} className="flex h-full w-full shrink-0 items-center justify-center" aria-hidden={!isCurrent}>
                <div
                  className={cn("relative", !dragging && isCurrent && "transition-transform duration-200 ease-out")}
                  style={{ width: box.w, height: box.h, transform }}
                >
                  {Math.abs(i - index) <= 1 && (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      quality={90}
                      // Ask for roughly three times the displayed width so the photo stays sharp when zoomed in.
                      sizes={`${Math.min(3840, Math.max(320, Math.round(box.w * 3)))}px`}
                      draggable={false}
                      loading={isCurrent ? "eager" : "lazy"}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top bar */}
      <button
        type="button"
        onClick={handleSharePhoto}
        disabled={sharing}
        aria-label={L.sharePhoto}
        className={`${roundButton} absolute left-4 top-4 flex items-center gap-2 px-3.5 text-sm font-semibold`}
      >
        <ShareIcon className="h-5 w-5" />
        <span>{L.sharePhoto}</span>
      </button>
      <button type="button" onClick={close} aria-label={L.closeViewer} className={`${roundButton} absolute right-4 top-4`}>
        <CloseIcon className="h-5 w-5" />
      </button>

      {/* Desktop: previous / next and zoom controls */}
      {index > 0 && (
        <button
          type="button"
          aria-label={L.previousPhoto}
          onClick={() => step(-1)}
          className={`${roundButton} absolute left-4 top-1/2 hidden -translate-y-1/2 sm:block`}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      {index < count - 1 && (
        <button
          type="button"
          aria-label={L.nextPhoto}
          onClick={() => step(1)}
          className={`${roundButton} absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block`}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}

      <div className="absolute bottom-16 left-4 hidden items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur sm:flex">
        <button type="button" aria-label={L.zoomOut} disabled={scale <= MIN_SCALE} onClick={() => zoomAt(viewerCenter(), scale / BUTTON_ZOOM_STEP)} className={roundButton}>
          <MinusIcon className="h-4 w-4" />
        </button>
        <button type="button" aria-label={L.resetZoom} onClick={resetZoom} className="min-w-12 rounded-full px-2 text-xs font-semibold text-white/90 hover:bg-white/15">
          {Math.round(scale * 100)}%
        </button>
        <button type="button" aria-label={L.zoomIn} disabled={scale >= MAX_SCALE} onClick={() => zoomAt(viewerCenter(), scale * BUTTON_ZOOM_STEP)} className={roundButton}>
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Minimap: thumbnail with the visible area outlined; click or drag to move. */}
      {minimap && visible && (
        <div
          role="img"
          aria-label={L.zoomPreview}
          onPointerDown={onMinimapPointer}
          onPointerMove={onMinimapPointer}
          className="absolute bottom-16 right-4 hidden cursor-crosshair touch-none overflow-hidden rounded-md border border-white/40 bg-black/40 shadow-lg sm:block"
          style={{ width: minimap.w, height: minimap.h }}
        >
          <Image src={current.src} alt="" fill sizes="150px" quality={75} draggable={false} className="object-cover opacity-60" />
          <div
            className="pointer-events-none absolute border-2 border-gold bg-white/10"
            style={{
              left: `${(visible.cx - visible.w / 2) * 100}%`,
              top: `${(visible.cy - visible.h / 2) * 100}%`,
              width: `${visible.w * 100}%`,
              height: `${visible.h * 100}%`,
            }}
          />
        </div>
      )}

      <p className="pointer-events-none absolute bottom-5 left-1/2 w-[90%] -translate-x-1/2 truncate text-center text-sm text-white/80">
        {index + 1} / {count} · {current.alt}
      </p>
    </div>
  );
}
