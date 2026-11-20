import { biodata } from "@/data/biodata";
import { LABELS } from "@/data/labels";
import { getSections, type Section, type SectionId } from "@/data/sections";
import Hero from "@/components/Hero";
import { SectionCard } from "@/components/SectionCard";
import { DetailList } from "@/components/DetailList";
import PhotoBento from "@/components/PhotoBento";
import { sizedGallery } from "@/data/gallery.server";
import Footer from "@/components/Footer";
import SampleNotice from "@/components/SampleNotice";
import MobileActionBar from "@/components/MobileActionBar";

/** Order of the label/value cards in the two-column grid. */
const DETAIL_CARD_ORDER: SectionId[] = ["personal", "horoscope", "education", "family"];

export default function Home() {
  const sections = getSections(biodata);
  const section = (id: SectionId) => sections.find((s) => s.id === id);

  const detailCards = DETAIL_CARD_ORDER.map(section).filter((s): s is Section => s !== undefined);
  const contact = section("contact");

  return (
    <>
      {biodata.sampleData && <SampleNotice />}
      <div aria-hidden className="h-1.5 w-full bg-linear-to-r from-maroon via-gold to-maroon print:hidden" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-28 pt-6 sm:gap-8 sm:px-6 sm:pt-10 md:pb-12 lg:px-8">
        <Hero />

        {biodata.about && (
          <SectionCard id="about" title={LABELS.en.about} titleHi={LABELS.hi.about}>
            <p className="mx-auto max-w-3xl text-center text-[15px] leading-7 text-ink/90 sm:text-base sm:leading-8">
              {biodata.about}
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
                titleHi={card.titleHi}
                className={spansRow ? "lg:col-span-2" : undefined}
              >
                <DetailList fields={card.fields} columns={spansRow ? 2 : 1} />
              </SectionCard>
            );
          })}

          {biodata.partnerPreferences.length > 0 && (
            <SectionCard id="partner" title={LABELS.en.partner} titleHi={LABELS.hi.partner} className="lg:col-span-2">
              <ul className="mx-auto grid max-w-3xl gap-x-10 gap-y-2.5 sm:grid-cols-2">
                {biodata.partnerPreferences.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-6 text-ink/90 sm:text-base">
                    <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {biodata.gallery.length > 0 && (
            <SectionCard id="photos" title={LABELS.en.photos} titleHi={LABELS.hi.photos} className="lg:col-span-2">
              <PhotoBento photos={sizedGallery} />
            </SectionCard>
          )}

          {contact && (
            <SectionCard id="contact" title={contact.title} titleHi={contact.titleHi} className="lg:col-span-2">
              <DetailList fields={contact.fields} columns={2} />
            </SectionCard>
          )}
        </div>

        <Footer />
      </main>

      <MobileActionBar />
    </>
  );
}
