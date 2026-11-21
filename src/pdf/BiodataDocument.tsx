import type { ReactNode } from "react";
import { Circle, Document, Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { Content, Field, SectionId } from "@/data/sections";

export type PdfImages = { profile: string | null; gallery: string[] };
export type BiodataDocumentProps = { content: Content; images: PdfImages };

const C = {
  maroon: "#7B1E2B",
  gold: "#C9A227",
  goldLight: "#E8D59A",
  goldDark: "#9C7B1A",
  cream: "#FBF5EA",
  ink: "#2B1D1E",
  muted: "#6E5E5F",
  white: "#FFFFFF",
};

const CONTENT_WIDTH = 595.28 - 2 * 40; // A4 width minus horizontal padding
const GALLERY_GAP = 10;

/** Portrait frame size on page 1; the server crops the photo to this ratio. */
const PORTRAIT_WIDTH = 126;
const PORTRAIT_HEIGHT = 157.5; // 4:5, matching the arch on the website
export const PDF_PORTRAIT_RATIO = PORTRAIT_WIDTH / PORTRAIT_HEIGHT;

/** How many leading items stay glued to a section heading so it is never orphaned at a page end. */
const KEEP_WITH_HEADING = 2;

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9.5,
    // NB: no lineHeight here — a page-level lineHeight stops react-pdf from
    // rendering the `render`-prop footer. Line heights live on text styles.
    color: C.ink,
    backgroundColor: C.white,
  },
  frameOuter: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1.4,
    borderColor: C.maroon,
    borderStyle: "solid",
  },
  frameInner: {
    position: "absolute",
    top: 21,
    left: 21,
    right: 21,
    bottom: 21,
    borderWidth: 0.6,
    borderColor: C.gold,
    borderStyle: "solid",
  },
  header: { alignItems: "center" },
  om: { fontFamily: "Devanagari", fontSize: 20, color: C.maroon, lineHeight: 1.2 },
  mantra: { fontWeight: 600, fontSize: 12.5, color: C.maroon, marginTop: 1, lineHeight: 1.5 },
  kicker: { fontSize: 7.5, fontWeight: 700, letterSpacing: 3, color: C.goldDark, marginTop: 4 },
  kickerHi: { fontSize: 9, color: C.goldDark, marginTop: 3, lineHeight: 1.5 },
  hero: { flexDirection: "row", alignItems: "flex-start", marginTop: 14, marginBottom: 14 },
  heroText: { flex: 1, paddingRight: 18 },
  name: { fontWeight: 700, fontSize: 27, color: C.maroon, lineHeight: 1.2 },
  tagline: { fontSize: 10, color: C.muted, marginTop: 3 },
  about: { marginTop: 10, fontSize: 9.5, color: C.ink, textAlign: "justify" },
  photoFrame: {
    width: PORTRAIT_WIDTH,
    height: PORTRAIT_HEIGHT,
    padding: 3,
    borderWidth: 1.5,
    borderColor: C.gold,
    borderStyle: "solid",
    backgroundColor: C.cream,
  },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { flex: 1, backgroundColor: C.goldLight, alignItems: "center", justifyContent: "center" },
  columns: { flexDirection: "row", gap: 18 },
  col: { flex: 1 },
  section: { marginBottom: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  sectionTitle: { fontWeight: 700, fontSize: 14.5, color: C.maroon, lineHeight: 1.4 },
  sectionLine: { flex: 1, height: 0.8, backgroundColor: C.gold },
  row: {
    flexDirection: "row",
    paddingVertical: 3.2,
    borderBottomWidth: 0.5,
    borderBottomColor: C.goldLight,
    borderBottomStyle: "solid",
  },
  label: {
    width: "38%",
    fontSize: 7.8,
    fontWeight: 700,
    color: C.goldDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingRight: 6,
    paddingTop: 1.2,
  },
  labelHi: { fontSize: 9, fontWeight: 400, letterSpacing: 0, textTransform: "none", paddingTop: 0 },
  value: { flex: 1, fontSize: 9.5, color: C.ink },
  bullet: { flexDirection: "row", alignItems: "flex-start", gap: 7, paddingVertical: 2 },
  bulletText: { flex: 1, fontSize: 9.5 },
  bulletDot: { width: 4.5, height: 4.5, backgroundColor: C.gold, marginTop: 4.2, transform: "rotate(45deg)" },
  galleryRow: { flexDirection: "row", gap: GALLERY_GAP, marginTop: 4, marginBottom: 6 },
  galleryItem: {
    // width/height are set per document from the photo count (see galleryTileSize).
    padding: 3,
    borderWidth: 1.2,
    borderColor: C.gold,
    borderStyle: "solid",
    backgroundColor: C.cream,
  },
  footer: {
    position: "absolute",
    bottom: 27,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: C.muted,
  },
});

function Ornament() {
  const mid = CONTENT_WIDTH / 2;
  return (
    <Svg width={CONTENT_WIDTH} height={14} viewBox={`0 0 ${CONTENT_WIDTH} 14`} style={{ marginTop: 8 }}>
      <Path d={`M0 7 H${mid - 28}`} stroke={C.gold} strokeWidth={0.8} />
      <Path d={`M${mid + 28} 7 H${CONTENT_WIDTH}`} stroke={C.gold} strokeWidth={0.8} />
      <Circle cx={mid - 18} cy={7} r={1.5} fill={C.gold} />
      <Circle cx={mid + 18} cy={7} r={1.5} fill={C.gold} />
      <Path d={`M${mid} 1 L${mid + 6} 7 L${mid} 13 L${mid - 6} 7 Z`} fill={C.gold} />
    </Svg>
  );
}

/** Photo pages hold a 2 × 2 grid of large 4:5 tiles (two per row, two rows per A4 page). */
const GALLERY_PER_ROW = 2;

function galleryTileSize(): { perRow: number; width: number; height: number } {
  const width = Math.floor((CONTENT_WIDTH - GALLERY_GAP * (GALLERY_PER_ROW - 1)) / GALLERY_PER_ROW) - 1;
  return { perRow: GALLERY_PER_ROW, width, height: Math.round(width / PDF_PORTRAIT_RATIO) };
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

type HeadingStyle = { fontFamily: string; fontWeight?: number };
type PdfSectionProps = {
  title: string;
  titleStyle: HeadingStyle;
  items: ReactNode[];
  wrap?: boolean;
  /** How many leading items stay glued to the heading (fewer for tall items such as photo rows). */
  keep?: number;
  /** Start the section on a fresh page. */
  newPage?: boolean;
};

/** A titled block whose heading stays with its first items; every item is unsplittable. */
function PdfSection({ title, titleStyle, items, wrap = true, keep = KEEP_WITH_HEADING, newPage = false }: PdfSectionProps) {
  return (
    <View style={s.section} wrap={wrap} break={newPage}>
      <View wrap={false}>
        <View style={s.sectionHead}>
          <Text style={[s.sectionTitle, titleStyle]}>{title}</Text>
          <View style={s.sectionLine} />
        </View>
        {items.slice(0, keep)}
      </View>
      {items.slice(keep)}
    </View>
  );
}

export function BiodataDocument({ content, images }: BiodataDocumentProps) {
  const { lang, labels: L, sections } = content;
  const hindi = lang === "hi";

  // Typography per language. The Hindi edition uses Tiro Devanagari for body
  // text (it also covers Latin and digits) and a Light serif for headings so
  // nothing reads as bold; Devanagari needs taller lines.
  const body = hindi ? "Devanagari" : "Mulish";
  const headingStyle: HeadingStyle = hindi ? { fontFamily: "DevanagariLight", fontWeight: 400 } : { fontFamily: "Cormorant" };
  const lh = { lineHeight: hindi ? 1.7 : 1.45 };
  const labelStyle = hindi ? [s.label, s.labelHi, lh] : [s.label, lh];

  const section = (id: SectionId) => sections.find((x) => x.id === id);
  const personal = section("personal");
  const horoscope = section("horoscope");
  const education = section("education");
  const family = section("family");
  const contact = section("contact");
  // Personal + Horoscope sit side by side when both exist; otherwise the one present spans the page.
  const sideBySide = Boolean(personal && horoscope);
  const tile = galleryTileSize();
  const single = sideBySide ? null : (personal ?? horoscope);

  const rowItems = (fields: Field[]): ReactNode[] =>
    fields.map((f, i) => (
      <View key={`${f.label}-${i}`} style={s.row} wrap={false}>
        <Text style={labelStyle}>{f.label}</Text>
        <Text style={[s.value, lh]}>{f.value}</Text>
      </View>
    ));

  return (
    <Document
      title={`${content.name} – ${L.kicker}`}
      author={content.name}
      subject={L.kicker}
      language={hindi ? "hi" : "en"}
    >
      <Page size="A4" style={[s.page, { fontFamily: body }]}>
        <View style={s.frameOuter} fixed />
        <View style={s.frameInner} fixed />

        <View style={s.header}>
          <Text style={s.om}>ॐ</Text>
          <Text style={[s.mantra, headingStyle]}>{content.mantra}</Text>
          <Text style={hindi ? s.kickerHi : s.kicker}>{hindi ? L.kicker : L.kicker.toUpperCase()}</Text>
        </View>
        <Ornament />

        <View style={s.hero} wrap={false}>
          <View style={s.heroText}>
            <Text style={[s.name, headingStyle]}>{content.name}</Text>
            {content.tagline ? <Text style={[s.tagline, lh]}>{content.tagline}</Text> : null}
            {content.about ? <Text style={[s.about, { lineHeight: hindi ? 1.8 : 1.55 }]}>{content.about}</Text> : null}
          </View>
          <View style={s.photoFrame}>
            {images.profile ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image has no alt prop
              <Image src={images.profile} style={s.photo} />
            ) : (
              <View style={s.photoPlaceholder}>
                <Text style={{ fontSize: 7, color: C.maroon }}>{L.photo}</Text>
              </View>
            )}
          </View>
        </View>

        {sideBySide && personal && horoscope && (
          <View style={s.columns} wrap={false}>
            <View style={s.col}>
              <PdfSection title={personal.title} titleStyle={headingStyle} items={rowItems(personal.fields)} />
            </View>
            <View style={s.col}>
              <PdfSection title={horoscope.title} titleStyle={headingStyle} items={rowItems(horoscope.fields)} />
            </View>
          </View>
        )}

        {single && <PdfSection title={single.title} titleStyle={headingStyle} items={rowItems(single.fields)} />}
        {education && <PdfSection title={education.title} titleStyle={headingStyle} items={rowItems(education.fields)} />}
        {family && <PdfSection title={family.title} titleStyle={headingStyle} items={rowItems(family.fields)} />}

        {content.partnerPreferences.length > 0 && (
          <PdfSection
            title={L.partner}
            titleStyle={headingStyle}
            items={content.partnerPreferences.map((item, i) => (
              <View key={i} style={s.bullet} wrap={false}>
                <View style={s.bulletDot} />
                <Text style={[s.bulletText, lh]}>{item}</Text>
              </View>
            ))}
          />
        )}

        {contact && <PdfSection title={contact.title} titleStyle={headingStyle} items={rowItems(contact.fields)} />}

        {images.gallery.length > 0 && (
          <PdfSection
            title={L.photos}
            titleStyle={headingStyle}
            keep={1}
            newPage
            items={chunk(images.gallery, tile.perRow).map((row, r) => (
              <View key={r} style={s.galleryRow} wrap={false}>
                {row.map((src, i) => (
                  <View key={i} style={[s.galleryItem, { width: tile.width, height: tile.height }]}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image has no alt prop */}
                    <Image src={src} style={s.photo} />
                  </View>
                ))}
              </View>
            ))}
          />
        )}

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${content.name}   ·   ${L.kicker}   ·   ${L.footerPage(pageNumber, totalPages)}`
          }
        />
      </Page>
    </Document>
  );
}
