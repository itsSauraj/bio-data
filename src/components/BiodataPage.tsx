import { biodata } from "@/data/biodata";
import { sizedGallery } from "@/data/gallery.server";
import { LABELS, OTHER_LANG, type Lang } from "@/data/labels";
import { getContent, type Section, type SectionId } from "@/data/sections";
import { DetailList } from "./DetailList";
import Footer from "./Footer";
import Hero from "./Hero";
import LanguageSwitch from "./LanguageSwitch";
import MobileActionBar from "./MobileActionBar";
import PhotoBento from "./PhotoBento";
import SampleNotice from "./SampleNotice";
import { SectionCard } from "./SectionCard";

/** Order of the label/value cards in the two-column grid. */
const DETAIL_CARD_ORDER: SectionId[] = ["personal", "horoscope", "education", "family"];

/** The whole bio-data page in one language. `/` renders English, `/hi` Hindi. */
export default function BiodataPage({ lang }: { lang: Lang }) {
  const content = getContent(biodata, lang);
  const L = content.labels;
  const O = LABELS[OTHER_LANG[lang]];
  const section = (id: SectionId) => content.sections.find((s) => s.id === id);

  const detailCards = DETAIL_CARD_ORDER.map(section).filter((s): s is Section => s !== undefined);
  const contact = section("contact");

  return (
    // `lang` switches the fonts (see globals.css) and tells screen readers the language.
    <div lang={lang} className="flex flex-1 flex-col font-body">
      {biodata.sampleData && <SampleNotice />}
      <div aria-hidden className="h-1.5 w-full bg-linear-to-r from-maroon via-gold to-maroon print:hidden" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-28 pt-4 sm:gap-8 sm:px-6 sm:pt-6 md:pb-12 lg:px-8">
        <div className="flex justify-end print:hidden">
          <LanguageSwitch current={lang} />
        </div>

        <Hero lang={lang} content={content} />

        {content.about && (
          <SectionCard id="about" title={L.about} subtitle={O.about}>
            <p className="mx-auto max-w-3xl text-center text-[15px] leading-7 text-ink/90 sm:text-base sm:leading-8">
              {content.about}
            </p>
          </SectionCard>
        )}

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {detailCards.map((card, i) => {
            // With an odd number of cards, the last one spans both columns so no slot is left empty.
            const spansRow = i === detailCards.length - 1 && detailCards.length % 2 === 1;
            return (
              <SectionCard
                key={card.id}
                id={card.id}
                title={card.title}
                subtitle={card.subtitle}
                className={spansRow ? "lg:col-span-2" : undefined}
              >
                <DetailList fields={card.fields} columns={spansRow ? 2 : 1} lang={lang} />
              </SectionCard>
            );
          })}

          {content.partnerPreferences.length > 0 && (
            <SectionCard id="partner" title={L.partner} subtitle={O.partner} className="lg:col-span-2">
              <ul className="mx-auto grid max-w-3xl gap-x-10 gap-y-2.5 sm:grid-cols-2">
                {content.partnerPreferences.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-6 text-ink/90 sm:text-base">
                    <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {biodata.gallery.length > 0 && (
            <SectionCard id="photos" title={L.photos} subtitle={O.photos} className="lg:col-span-2">
              <PhotoBento photos={sizedGallery} />
            </SectionCard>
          )}

          {contact && (
            <SectionCard id="contact" title={contact.title} subtitle={contact.subtitle} className="lg:col-span-2">
              <DetailList fields={contact.fields} columns={2} lang={lang} />
            </SectionCard>
          )}
        </div>

        <Footer lang={lang} name={content.name} />
      </main>

      <MobileActionBar lang={lang} />
    </div>
  );
}
