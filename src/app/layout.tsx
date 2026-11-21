import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { biodata } from "@/data/biodata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = `${biodata.name} | Bio-data`;
const description = `Bio-data of ${biodata.name}${biodata.tagline ? ` — ${biodata.tagline}` : ""}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "profile",
    images: [{ url: biodata.photo.src, alt: biodata.photo.alt }],
  },
  // A private family document — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${mulish.variable} ${tiro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">{children}</body>
    </html>
  );
}
