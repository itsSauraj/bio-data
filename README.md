# Bio-data Website

A responsive, single-page bio-data (Indian / Hindu style) built with Next.js 16,
React 19 and Tailwind CSS 4. Families can view it on any phone or laptop, download the
complete bio-data as an A4 PDF, or share it on WhatsApp.

## Update the content

Everything — the website **and** the PDF — is generated from one file:

```
src/data/biodata.ts
```

1. Replace each sample value with the real details. Leave a value as `""` to hide that row.
2. Put photos in `public/photos/` (portrait 4:5 photos look best):
   - `profile.jpg` — main photo
   - `photo-1.jpg` … `photo-10.jpg` — the Photographs grid on the site (add or remove entries in `gallery`)
   - `pdfPhotoCount` sets how many of those (from the top) are printed in the PDFs; 3 fit one row
3. Set `sampleData: false` to remove the "Sample content" bar.

If you replace a photo while `npm run dev` is running, restart the dev server so the new size and
image are picked up (production builds always read fresh files).

The age is calculated automatically from `dateOfBirth` (format `YYYY-MM-DD`).

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The PDF is at <http://localhost:3000/biodata.pdf>.

## Build for production

```bash
npm run build
npm start
```

## Deploy

The easiest option is [Vercel](https://vercel.com/new). Set the `NEXT_PUBLIC_SITE_URL`
environment variable to your public URL (for example `https://saurabh-biodata.vercel.app`)
so WhatsApp link previews pick up the photo.

The page is marked `noindex`, so search engines will not list it.

## Hindi edition of the website

The site is available in two languages, with an English ⇄ हिन्दी switch at the top of the page:

- `/` — English
- `/hi` — Hindi

Both are prerendered pages, so either link can be shared directly. The Share button shares the
link of the page you are on. Headings and labels are translated from `src/data/labels.ts`; your
own text comes from the `hindi` block in `src/data/biodata.ts` (see below).

## How the PDFs work

Two editions are available:

- `/biodata.pdf` — English
- `/biodata-hindi.pdf` — Hindi (हिन्दी)

Both are route handlers (`src/app/biodata.pdf/route.ts`, `src/app/biodata-hindi.pdf/route.ts`)
that render the same A4 layout (`src/pdf/BiodataDocument.tsx`) with `@react-pdf/renderer`.
Photos are auto-rotated, downsized and re-encoded as JPEG with `sharp`, so the PDFs stay small
enough to send on WhatsApp. Results are cached and refreshed daily so the calculated age stays
correct.

For the Hindi edition, section titles and field labels are translated automatically
(`src/data/labels.ts`). Your own text goes in the `hindi` block of `src/data/biodata.ts`:
`name`, `tagline`, `about`, `partnerPreferences`, and a `values` map from each English value
(exactly as written) to its Hindi. Anything not translated is shown as written in English.

Fonts are self-hosted in `public/fonts/` (Cormorant Garamond, Mulish, Tiro Devanagari Hindi and
Noto Serif Devanagari — all under the SIL Open Font License).

## Placeholder photos

`scripts/make-placeholders.mjs` generates the gold-framed placeholder images. Re-run it with
`node scripts/make-placeholders.mjs` if you ever need them again.
