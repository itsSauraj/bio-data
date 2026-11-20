import type { Biodata } from "./biodata";
import { COMMON_VALUES_HI, LABELS, type Labels, type Lang } from "./labels";

export type Field = { label: string; value: string; href?: string };
export type SectionId = "personal" | "horoscope" | "education" | "family" | "contact";
export type Section = { id: SectionId; title: string; titleHi: string; fields: Field[] };

export function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso.trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** "1997-05-12" → "12 May 1997" (or "12 मई 1997"). Deterministic, so safe to render on the server. */
export function formatDate(iso: string, lang: Lang = "en"): string {
  const p = parseIsoDate(iso);
  if (!p) return iso;
  return `${p.d} ${LABELS[lang].months[p.m - 1]} ${p.y}`;
}

/** Whole years between the ISO date of birth and `now`. Call only on the client or inside a cached function. */
export function calculateAge(iso: string, now: Date): number | null {
  const p = parseIsoDate(iso);
  if (!p) return null;
  let age = now.getFullYear() - p.y;
  const month = now.getMonth() + 1;
  if (month < p.m || (month === p.m && now.getDate() < p.d)) age -= 1;
  return age >= 0 && age < 150 ? age : null;
}

/**
 * Returns a function that translates one value into `lang`. English is the
 * identity. Hindi looks the value up in the common dictionary plus the
 * profile's own `hindi.values`; comma-separated values are translated part
 * by part when every part is known. Unknown values are returned unchanged.
 */
export function makeTranslator(data: Biodata, lang: Lang): (value: string) => string {
  if (lang === "en") return (value) => value;
  const dictionary: Record<string, string> = { ...COMMON_VALUES_HI, ...data.hindi.values };
  const lookup = (value: string) => dictionary[value.trim()];
  return (value) => {
    const exact = lookup(value);
    if (exact) return exact;
    const parts = value.split(/,\s*/);
    if (parts.length > 1) {
      const translated = parts.map(lookup);
      if (translated.every(Boolean)) return translated.join(", ");
    }
    return value;
  };
}

function field(label: string, value?: string | null, href?: string): Field | null {
  const v = value?.trim();
  return v ? { label, value: v, href } : null;
}

function compact(fields: Array<Field | null>): Field[] {
  return fields.filter((f): f is Field => f !== null);
}

function joinParts(...parts: Array<string | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(" — ");
}

function telHref(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

function whatsappHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

export type SectionOptions = { now?: Date; lang?: Lang };

/**
 * Turns the bio-data object into labelled sections shared by the web page
 * and the PDFs. Pass `now` to include the age, and `lang` for Hindi.
 */
export function getSections(data: Biodata, opts: SectionOptions = {}): Section[] {
  const lang = opts.lang ?? "en";
  const L = LABELS[lang];
  const tr = makeTranslator(data, lang);
  const list = (items: string[]) => items.map(tr).join(", ");

  const { personal: p, horoscope: h, education: e, career: c, family: fam, contact: ct } = data;
  const name = lang === "hi" && data.hindi.name ? data.hindi.name : data.name;
  const age = opts.now ? calculateAge(p.dateOfBirth, opts.now) : null;
  const dob = formatDate(p.dateOfBirth, lang) + (age !== null ? ` (${age} ${L.years})` : "");

  const sections: Section[] = [
    {
      id: "personal",
      title: L.personal,
      titleHi: LABELS.hi.personal,
      fields: compact([
        field(L.fullName, name),
        field(L.dateOfBirth, dob),
        field(L.timeOfBirth, p.timeOfBirth),
        field(L.placeOfBirth, tr(p.placeOfBirth)),
        field(L.height, tr(p.height)),
        field(L.weight, tr(p.weight)),
        field(L.complexion, tr(p.complexion)),
        field(L.bloodGroup, p.bloodGroup),
        field(L.maritalStatus, tr(p.maritalStatus)),
        field(L.religion, tr(p.religion)),
        field(L.caste, tr(p.caste)),
        field(L.motherTongue, tr(p.motherTongue)),
        field(L.languages, list(p.languages)),
        field(L.diet, tr(p.diet)),
        field(L.hobbies, list(p.hobbies)),
      ]),
    },
    {
      id: "horoscope",
      title: L.horoscope,
      titleHi: LABELS.hi.horoscope,
      fields: compact([
        field(L.subCaste, tr(h.subCaste)),
        field(L.gotra, tr(h.gotra)),
        field(L.rashi, tr(h.rashi)),
        field(L.nakshatra, tr(h.nakshatra)),
        field(L.manglik, tr(h.manglik)),
        field(L.charan, tr(h.charan)),
        field(L.nadi, tr(h.nadi)),
        field(L.gan, tr(h.gan)),
      ]),
    },
    {
      id: "education",
      title: L.education,
      titleHi: LABELS.hi.education,
      fields: compact([
        field(L.highestQualification, tr(e.highestQualification)),
        field(L.schooling, tr(e.schooling)),
        field(L.college, tr(e.college)),
        field(L.yearOfCompletion, e.yearOfCompletion),
        field(L.otherQualifications, tr(e.otherQualifications)),
        field(L.occupation, tr(c.occupation)),
        field(L.company, tr(c.company)),
        field(L.designation, tr(c.designation)),
        field(L.workLocation, tr(c.location)),
        field(L.annualIncome, tr(c.annualIncome)),
      ]),
    },
    {
      id: "family",
      title: L.family,
      titleHi: LABELS.hi.family,
      fields: compact([
        field(L.father, joinParts(tr(fam.father.name), tr(fam.father.occupation))),
        field(L.mother, joinParts(tr(fam.mother.name), tr(fam.mother.occupation))),
        ...fam.siblings.map((s) => field(tr(s.relation), joinParts(tr(s.name), tr(s.details)))),
        field(L.familyType, tr(fam.familyType)),
        field(L.familyValues, tr(fam.familyValues)),
        field(L.nativePlace, tr(fam.nativePlace)),
        field(L.residence, tr(fam.residence)),
      ]),
    },
    {
      id: "contact",
      title: L.contact,
      titleHi: LABELS.hi.contact,
      fields: compact([
        ...ct.persons.map((person) =>
          field(`${tr(person.name)} (${tr(person.relation)})`, person.phone, telHref(person.phone)),
        ),
        field(L.whatsapp, ct.whatsapp, ct.whatsapp ? whatsappHref(ct.whatsapp) : undefined),
        field(L.email, ct.email, ct.email ? `mailto:${ct.email}` : undefined),
        field(L.address, tr(ct.address)),
      ]),
    },
  ];

  return sections.filter((s) => s.fields.length > 0);
}

/** Everything the PDF document needs, already in the requested language. */
export type PdfContent = {
  lang: Lang;
  labels: Labels;
  mantra: string;
  name: string;
  tagline: string;
  about: string;
  partnerPreferences: string[];
  sections: Section[];
};

export function getPdfContent(data: Biodata, lang: Lang, now: Date): PdfContent {
  const hi = lang === "hi" ? data.hindi : null;
  return {
    lang,
    labels: LABELS[lang],
    mantra: lang === "hi" ? data.invocation.devanagari : `|| ${data.invocation.roman} ||`,
    name: hi?.name || data.name,
    tagline: hi?.tagline || data.tagline,
    about: hi?.about || data.about,
    partnerPreferences: hi && hi.partnerPreferences.length > 0 ? hi.partnerPreferences : data.partnerPreferences,
    sections: getSections(data, { now, lang }),
  };
}
