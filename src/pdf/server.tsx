import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";
import { biodata, type ProfilePhoto } from "@/data/biodata";
import type { Lang } from "@/data/labels";
import { getContent } from "@/data/sections";
import { portraitCrop } from "@/lib/portrait";
import { BiodataDocument, PDF_PORTRAIT_RATIO } from "./BiodataDocument";

const PUBLIC_DIR = path.join(process.cwd(), "public");

let fontsRegistered = false;

/** Registers the self-hosted fonts from /public/fonts with react-pdf (once per process). */
function registerFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  const file = (name: string) => path.join(PUBLIC_DIR, "fonts", name);

  Font.register({
    family: "Cormorant",
    fonts: [
      { src: file("CormorantGaramond-Regular.ttf"), fontWeight: 400 },
      { src: file("CormorantGaramond-SemiBold.ttf"), fontWeight: 600 },
      { src: file("CormorantGaramond-Bold.ttf"), fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Mulish",
    fonts: [
      { src: file("Mulish-Regular.ttf"), fontWeight: 400 },
      { src: file("Mulish-SemiBold.ttf"), fontWeight: 600 },
      { src: file("Mulish-Bold.ttf"), fontWeight: 700 },
    ],
  });

  // Tiro Devanagari Hindi ships one weight; it also covers Latin and digits.
  Font.register({
    family: "Devanagari",
    src: file("TiroDevanagariHindi-Regular.ttf"),
  });

  // Light serif face for Hindi headings, so they stay as airy as the English Cormorant ones.
  Font.register({
    family: "DevanagariLight",
    src: file("NotoSerifDevanagari-Light.ttf"),
  });

  // Never hyphenate names, places or phone numbers.
  Font.registerHyphenationCallback((word) => [word]);
}

function publicFile(src: string): string {
  return path.join(PUBLIC_DIR, src.replace(/^\/+/, ""));
}

/**
 * Reads a photo from /public, fixes EXIF rotation (phone photos), downsizes
 * it and re-encodes as JPEG so the PDF stays small enough for WhatsApp.
 */
async function photoToDataUrl(src: string, maxSide = 1400): Promise<string | null> {
  try {
    const buffer = await sharp(await readFile(publicFile(src)))
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn(`[biodata pdf] Skipping photo ${src}:`, err);
    return null;
  }
}

/**
 * Crops the portrait to the PDF frame's proportions using the same
 * `focus` / `zoom` settings as the website arch (see lib/portrait.ts).
 */
async function portraitToDataUrl(photo: ProfilePhoto): Promise<string | null> {
  try {
    const source = await readFile(publicFile(photo.src));
    const meta = await sharp(source).metadata();
    let width = meta.width ?? 0;
    let height = meta.height ?? 0;
    if ((meta.orientation ?? 1) >= 5) [width, height] = [height, width]; // EXIF-rotated
    if (!width || !height) return photoToDataUrl(photo.src);

    const crop = portraitCrop(width, height, PDF_PORTRAIT_RATIO, photo.focus, photo.zoom);
    const w = Math.max(1, Math.floor(crop.width));
    const h = Math.max(1, Math.floor(crop.height));
    const left = Math.min(width - w, Math.max(0, Math.round(crop.left)));
    const top = Math.min(height - h, Math.max(0, Math.round(crop.top)));

    const buffer = await sharp(source)
      .rotate()
      .extract({ left, top, width: w, height: h })
      .resize({ width: 800, withoutEnlargement: true })
      // Portrait is small on the page: keep full colour detail and a high quality setting.
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn(`[biodata pdf] Portrait crop failed for ${photo.src}, using the full photo:`, err);
    return photoToDataUrl(photo.src);
  }
}

/**
 * Renders the complete bio-data as an A4 PDF in the given language.
 *
 * Cached with a one-day lifetime: the routes are prerendered at build time,
 * and the cached PDFs are refreshed daily so the calculated age stays correct.
 */
export async function renderBiodataPdf(lang: Lang): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("days");

  registerFonts();

  const [profile, ...gallery] = await Promise.all([
    portraitToDataUrl(biodata.photo),
    ...biodata.pdfPhotos.map((src) => photoToDataUrl(src)),
  ]);

  const content = getContent(biodata, lang, new Date());
  const buffer = await renderToBuffer(
    <BiodataDocument content={content} images={{ profile, gallery: gallery.filter((g): g is string => g !== null) }} />,
  );

  // Copy into a plain ArrayBuffer-backed array: serialisable by `use cache` and valid as a Response body.
  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(buffer);
  return bytes;
}
