import { biodata } from "@/data/biodata";
import type { Lang } from "@/data/labels";

/** Public URLs of the server-rendered PDFs (see src/app/biodata.pdf and src/app/biodata-hindi.pdf). */
export const PDF_URLS: Record<Lang, string> = {
  en: "/biodata.pdf",
  hi: "/biodata-hindi.pdf",
};

/** e.g. "Saurabh-Yadav-Biodata.pdf" or "Saurabh-Yadav-Biodata-Hindi.pdf" */
export function pdfFileName(lang: Lang = "en"): string {
  const base = `${biodata.name.trim().replace(/\s+/g, "-")}-Biodata`;
  return lang === "hi" ? `${base}-Hindi.pdf` : `${base}.pdf`;
}
