"use client";

import { useState } from "react";
import { biodata } from "@/data/biodata";
import { LABELS, type Lang } from "@/data/labels";
import { cn } from "@/lib/cn";
import { PDF_URLS, pdfFileName } from "@/pdf/filename";
import { DownloadIcon, EyeIcon, LinkIcon, PrinterIcon, ShareIcon } from "./Icons";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon disabled:cursor-not-allowed disabled:opacity-60";
const primary = "bg-maroon text-white shadow-md shadow-maroon/25 hover:bg-maroon-dark";
const secondary = "border border-gold bg-paper text-maroon hover:bg-gold-light/40";
const ghost = "text-muted hover:bg-gold-light/30 hover:text-maroon";

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

/**
 * Actions for the PDF of the current language (view in the browser,
 * download, share the file) plus sharing the website link and printing.
 * The Hindi page shows Hindi labels and the Hindi PDF; the English page,
 * English ones.
 */
export default function ActionBar({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const L = LABELS[lang];
  const name = lang === "hi" && biodata.hindi.name ? biodata.hindi.name : biodata.name;
  const pdfPath = PDF_URLS[lang];
  const [busy, setBusy] = useState<"pdf" | "link" | null>(null);
  const size = compact ? "flex-1 flex-col gap-1 px-1 py-2 text-[11px] leading-none" : "px-5 py-2.5";
  const icon = compact ? "h-5 w-5" : "h-4 w-4 shrink-0";

  /** Share the PDF file itself (phones), falling back to a link to the PDF (desktop / WhatsApp). */
  async function handleSharePdf() {
    const pdfUrl = new URL(pdfPath, window.location.origin).href;
    const text = L.sharePdfMessage(name);
    const title = `${name} – ${L.kicker}`;

    if (typeof navigator.share !== "function") {
      openWhatsApp(`${text}\n${pdfUrl}`);
      return;
    }

    setBusy("pdf");
    try {
      try {
        const response = await fetch(pdfPath);
        if (response.ok) {
          const file = new File([await response.blob()], pdfFileName(lang), { type: "application/pdf" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title, text, files: [file] });
            return;
          }
        }
      } catch (err) {
        if (isAbort(err)) return;
        console.error(err);
      }
      await navigator.share({ title, text, url: pdfUrl });
    } catch (err) {
      if (!isAbort(err)) openWhatsApp(`${text}\n${pdfUrl}`);
    } finally {
      setBusy(null);
    }
  }

  /** Share the link to this page (current language). */
  async function handleShareLink() {
    const url = window.location.href;
    const text = L.shareMessage(name);

    if (typeof navigator.share !== "function") {
      openWhatsApp(`${text}\n${url}`);
      return;
    }

    setBusy("link");
    try {
      await navigator.share({ title: `${name} – ${L.kicker}`, text, url });
    } catch (err) {
      if (!isAbort(err)) openWhatsApp(`${text}\n${url}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("flex gap-3", compact ? "flex-nowrap gap-1.5" : "flex-wrap justify-center md:justify-start")}>
      <a href={pdfPath} target="_blank" rel="noopener noreferrer" className={cn(base, size, secondary)}>
        <EyeIcon className={icon} />
        {compact ? L.viewShort : L.viewPdf}
      </a>

      <a href={pdfPath} download={pdfFileName(lang)} className={cn(base, size, primary)}>
        <DownloadIcon className={icon} />
        {compact ? L.downloadShort : L.downloadPdf}
      </a>

      <button type="button" onClick={handleSharePdf} disabled={busy !== null} className={cn(base, size, primary)}>
        <ShareIcon className={icon} />
        {compact ? L.shareShort : L.sharePdf}
      </button>

      <button type="button" onClick={handleShareLink} disabled={busy !== null} className={cn(base, size, secondary)}>
        <LinkIcon className={icon} />
        {compact ? L.linkShort : L.shareLink}
      </button>

      {!compact && (
        <button type="button" onClick={() => window.print()} className={cn(base, size, ghost)}>
          <PrinterIcon className={icon} />
          {L.print}
        </button>
      )}
    </div>
  );
}
