"use client";

import Image from "next/image";
import type { Lang } from "@/data/labels";
import type { SizedPhoto } from "@/lib/image-size";
import { DashedRect } from "./DashedFrame";
import { useGallery } from "./GalleryContext";
import PhotoViewer from "./PhotoViewer";

/**
 * Target row height per breakpoint (CSS variable --row-h, set on the list);
 * each tile's flex-basis is its aspect ratio × this, then tiles grow to fill
 * the row edge to edge.
 */
const ROW_HEIGHT_CLASSES = "[--row-h:120px] sm:[--row-h:180px] lg:[--row-h:230px]";

/**
 * Justified photo mosaic: every tile keeps its photo's real aspect ratio (no
 * cropping) and rows pack flush, each framed by a moving dashed border.
 * Clicking a tile (or the hero portrait) opens the full-screen PhotoViewer.
 */
export default function PhotoBento({ photos, lang = "en" }: { photos: SizedPhoto[]; lang?: Lang }) {
  const { open } = useGallery();
  if (photos.length === 0) return null;

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

      <PhotoViewer photos={photos} lang={lang} />
    </>
  );
}
