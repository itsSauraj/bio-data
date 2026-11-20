import { pdfFileName } from "@/pdf/filename";
import { renderBiodataPdf } from "@/pdf/server";

/** GET /biodata.pdf — the complete bio-data as a downloadable A4 PDF (English). */
export async function GET() {
  const bytes = await renderBiodataPdf("en");

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdfFileName("en")}"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
