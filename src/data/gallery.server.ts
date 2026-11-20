import { biodata } from "./biodata";
import { withImageSizes, type SizedPhoto } from "@/lib/image-size";

/**
 * Gallery photos with their real pixel dimensions.
 *
 * The files are read once, when this server module loads, rather than during
 * rendering: Cache Components treats module-scope reads as predictable values
 * that can be prerendered, whereas I/O inside a component would block the
 * static shell. (Server-only: uses the file system.)
 *
 * Production builds always read fresh sizes. While `npm run dev` is running,
 * replacing a photo file keeps the old size until the dev server restarts
 * (or any source file is saved).
 */
export const sizedGallery: SizedPhoto[] = withImageSizes(biodata.gallery);
