import type { Metadata } from "next";
import BiodataPage from "@/components/BiodataPage";
import { biodata } from "@/data/biodata";
import { LABELS } from "@/data/labels";

const name = biodata.hindi.name || biodata.name;
const title = `${name} | ${LABELS.hi.kicker}`;
const description = `${name} का ${LABELS.hi.kicker}${biodata.hindi.tagline ? ` — ${biodata.hindi.tagline}` : ""}।`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

/** Hindi edition of the bio-data website. */
export default function HindiHome() {
  return <BiodataPage lang="hi" />;
}
