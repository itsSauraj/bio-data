"use client";

import { useState } from "react";
import { biodata } from "@/data/biodata";
import { LABELS, type Lang } from "@/data/labels";
import { cn } from "@/lib/cn";
import { PDF_URLS, pdfFileName } from "@/pdf/filename";
import { DownloadIcon, PrinterIcon, ShareIcon } from "./Icons";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon disabled:cursor-not-allowed disabled:opacity-60";
const primary = "bg-maroon text-white shadow-md shadow-maroon/25 hover:bg-maroon-dark";
const secondary = "border border-gold bg-paper text-maroon hover:bg-gold-light/40";

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export default function ActionBar({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const L = LABELS[lang];
  const name = lang === "hi" && biodata.hindi.name ? biodata.hindi.name : biodata.name;
  const [sharing, setSharing] = useState(false);
  const size = compact ? "flex-1 px-3 py-2.5 text-[13px]" : "px-5 py-2.5";

  /** Shares the link to this page (current language). Phones get the share sheet; desktops open WhatsApp. */
  async function handleShare() {
    const url = window.location.href;
    const text = L.shareMessage(name);

    if (typeof navigator.share !== "function") {
      openWhatsApp(`${text}\n${url}`);
      return;
    }

    setSharing(true);
    try {
      await navigator.share({ title: `${name} – ${L.kicker}`, text, url });
    } catch (err) {
      if (!isAbort(err)) openWhatsApp(`${text}\n${url}`);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-3", compact ? "flex-nowrap gap-2" : "justify-center md:justify-start")}>
      <a href={PDF_URLS.en} download={pdfFileName("en")} className={cn(base, size, primary)}>
        <DownloadIcon className="h-4 w-4 shrink-0" />
        {compact ? L.englishShort : L.englishPdf}
      </a>

      <a href={PDF_URLS.hi} download={pdfFileName("hi")} className={cn(base, size, primary)}>
        <DownloadIcon className="h-4 w-4 shrink-0" />
        <span className={lang === "en" ? "font-devanagari text-[1.05em] leading-none" : undefined}>
          {compact ? L.hindiShort : L.hindiPdf}
        </span>
      </a>

      <button type="button" onClick={handleShare} disabled={sharing} className={cn(base, size, secondary)}>
        <ShareIcon className="h-4 w-4 shrink-0" />
        {L.share}
      </button>

      {!compact && (
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(base, size, "text-muted hover:bg-gold-light/30 hover:text-maroon")}
        >
          <PrinterIcon className="h-4 w-4" />
          {L.print}
        </button>
      )}
    </div>
  );
}
