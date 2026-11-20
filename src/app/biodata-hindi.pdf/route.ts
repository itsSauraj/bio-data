import { pdfFileName } from "@/pdf/filename";
import { renderBiodataPdf } from "@/pdf/server";

/** GET /biodata-hindi.pdf — the complete bio-data as a downloadable A4 PDF (Hindi). */
export async function GET() {
  const bytes = await renderBiodataPdf("hi");

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdfFileName("hi")}"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
