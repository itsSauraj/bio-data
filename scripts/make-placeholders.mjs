// Generates tasteful placeholder photos (gold frame + soft silhouette) so the
// site looks complete before real photos are added.
// Run: node scripts/make-placeholders.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../public/photos/", import.meta.url));
await mkdir(outDir, { recursive: true });

function svg(w, h) {
  const cx = w / 2;
  const headR = Math.min(w, h) * 0.14;
  const headY = h * 0.4;
  const shoulderTop = h * 0.62;
  const shoulderBottom = h * 0.86;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBF3E2"/>
      <stop offset="1" stop-color="#EBD8AE"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${w * 0.045}" y="${h * 0.045}" width="${w * 0.91}" height="${h * 0.91}" fill="none" stroke="#C9A227" stroke-width="${w * 0.01}"/>
  <rect x="${w * 0.07}" y="${h * 0.07}" width="${w * 0.86}" height="${h * 0.86}" fill="none" stroke="#C9A227" stroke-width="${w * 0.0035}"/>
  <circle cx="${cx}" cy="${headY}" r="${headR}" fill="#7B1E2B" opacity="0.22"/>
  <path d="M ${cx - w * 0.3} ${shoulderBottom} C ${cx - w * 0.3} ${shoulderTop} ${cx + w * 0.3} ${shoulderTop} ${cx + w * 0.3} ${shoulderBottom} Z" fill="#7B1E2B" opacity="0.22"/>
</svg>`;
}

const files = [
  ["profile.jpg", 800, 1000],
  ...Array.from({ length: 10 }, (_, i) => [`photo-${i + 1}.jpg`, i % 3 === 1 ? 1000 : 800, i % 3 === 1 ? 800 : 1000]),
];

for (const [name, w, h] of files) {
  await sharp(Buffer.from(svg(w, h))).jpeg({ quality: 88 }).toFile(outDir + name);
  console.log("wrote", name);
}
