import { readFileSync } from "node:fs";
import path from "node:path";
import type { Photo } from "@/data/biodata";

export type SizedPhoto = Photo & { width: number; height: number };

type Size = { width: number; height: number };

const FALLBACK: Size = { width: 800, height: 1000 }; // 4:5 portrait

/** EXIF orientation tag; values 5–8 mean the image is displayed rotated 90°. */
function jpegExifOrientation(buf: Buffer, start: number, length: number): number | null {
  // APP1 payload: "Exif\0\0" + TIFF header
  if (buf.toString("ascii", start, start + 4) !== "Exif") return null;
  const tiff = start + 6;
  const little = buf.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = (o: number) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o: number) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > start + length) return null;
  const entries = u16(ifd);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > start + length) break;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return null;
}

function jpegSize(buf: Buffer): Size | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let pos = 2;
  let orientation: number | null = null;
  while (pos + 9 < buf.length) {
    if (buf[pos] !== 0xff) return null;
    const marker = buf[pos + 1];
    const length = buf.readUInt16BE(pos + 2);
    if (marker === 0xe1 && orientation === null) {
      orientation = jpegExifOrientation(buf, pos + 4, length - 2);
    }
    // SOF0–SOF15 (except DHT 0xC4, JPG 0xC8, DAC 0xCC) carry the frame dimensions.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = buf.readUInt16BE(pos + 5);
      const width = buf.readUInt16BE(pos + 7);
      const rotated = orientation !== null && orientation >= 5 && orientation <= 8;
      return rotated ? { width: height, height: width } : { width, height };
    }
    pos += 2 + length;
  }
  return null;
}

function pngSize(buf: Buffer): Size | null {
  if (buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf: Buffer): Size | null {
  if (buf.toString("ascii", 0, 3) !== "GIF") return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function webpSize(buf: Buffer): Size | null {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  return null;
}

/** Reads the displayed pixel size of an image in /public, or null if unreadable. */
export function readImageSize(publicSrc: string): Size | null {
  try {
    const file = path.join(process.cwd(), "public", publicSrc.replace(/^\/+/, ""));
    const buf = readFileSync(file);
    const size = jpegSize(buf) ?? pngSize(buf) ?? webpSize(buf) ?? gifSize(buf);
    return size && size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
}

/** Attaches real dimensions to photos (server-side), falling back to 4:5 for anything unreadable. */
export function withImageSizes(photos: Photo[]): SizedPhoto[] {
  return photos.map((photo) => ({ ...photo, ...(readImageSize(photo.src) ?? FALLBACK) }));
}
