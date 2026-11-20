"use client";

import { useState } from "react";
import { biodata } from "@/data/biodata";
import { cn } from "@/lib/cn";
import { PDF_URLS, pdfFileName } from "@/pdf/filename";
import { DownloadIcon, PrinterIcon, WhatsAppIcon } from "./Icons";

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

export default function ActionBar({ compact = false }: { compact?: boolean }) {
  const [sharing, setSharing] = useState(false);
  const size = compact ? "flex-1 px-3 py-2.5 text-[13px]" : "px-5 py-2.5";

  async function handleShare() {
    const url = window.location.href;
    const title = `${biodata.name} – Marriage Bio-data`;
    const text = `Namaste 🙏 Please find the marriage bio-data of ${biodata.name}.`;

    // Desktop browsers without the Web Share API: open WhatsApp with the link.
    if (typeof navigator.share !== "function") {
      openWhatsApp(`${text}\n${url}`);
      return;
    }

    setSharing(true);
    try {
      // Prefer sharing the (English) PDF file itself; fall back to the link.
      try {
        const response = await fetch(PDF_URLS.en);
        if (response.ok) {
          const file = new File([await response.blob()], pdfFileName("en"), { type: "application/pdf" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title, text, files: [file] });
            return;
          }
        }
      } catch (err) {
        if (isAbort(err)) return;
        console.error(err);
      }
      await navigator.share({ title, text, url });
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
        {compact ? "English" : "English PDF"}
      </a>

      <a href={PDF_URLS.hi} download={pdfFileName("hi")} lang="hi" className={cn(base, size, primary)}>
        <DownloadIcon className="h-4 w-4 shrink-0" />
        <span className="font-devanagari text-[1.05em] leading-none">हिन्दी</span>
        {!compact && " PDF"}
      </a>

      <button type="button" onClick={handleShare} disabled={sharing} className={cn(base, size, secondary)}>
        <WhatsAppIcon className="h-4 w-4 shrink-0" />
        {sharing ? "Preparing…" : "Share"}
      </button>

      {!compact && (
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(base, size, "text-muted hover:bg-gold-light/30 hover:text-maroon")}
        >
          <PrinterIcon className="h-4 w-4" />
          Print
        </button>
      )}
    </div>
  );
}
