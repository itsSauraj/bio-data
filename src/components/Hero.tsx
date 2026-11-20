import Image from "next/image";
import { biodata } from "@/data/biodata";
import ActionBar from "./ActionBar";
import AgeChip from "./AgeChip";
import { Corner, Divider } from "./Ornaments";

const cornerClass = "pointer-events-none absolute h-14 w-14 text-gold sm:h-20 sm:w-20";
const chipClass = "rounded-full border border-gold/50 bg-cream px-3.5 py-1 text-sm text-ink";

export default function Hero() {
  const { personal, career, family, photo } = biodata;
  const chips = [personal.height, career.location || family.residence, personal.religion, career.occupation].filter(
    (c) => c && c.trim(),
  );

  // Portrait framing: keep the face at the focus point and zoom in around it
  // (the same crop the PDF uses), so a full-length photo shows head and shoulders.
  const focus = `${photo.focus?.x ?? 50}% ${photo.focus?.y ?? 50}%`;
  const zoom = Math.max(1, photo.zoom ?? 1);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/50 bg-paper px-5 py-8 shadow-[0_24px_60px_-30px_rgba(123,30,43,0.4)] sm:px-10 sm:py-10 print:shadow-none">
      <Corner className={`${cornerClass} left-3 top-3`} />
      <Corner className={`${cornerClass} right-3 top-3 rotate-90`} />
      <Corner className={`${cornerClass} bottom-3 right-3 rotate-180`} />
      <Corner className={`${cornerClass} bottom-3 left-3 -rotate-90`} />

      <div className="text-center">
        <p className="font-devanagari text-lg text-maroon sm:text-xl">{biodata.invocation.devanagari}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.35em] text-gold-dark">Marriage Bio-data</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:gap-12">
        <div className="w-52 shrink-0 sm:w-60">
          <div className="aspect-4/5 rounded-t-full rounded-b-2xl border-[3px] border-gold bg-paper p-1.5 shadow-lg shadow-maroon/10">
            <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-xl ring-1 ring-gold/70">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                preload
                sizes="(min-width: 640px) 15rem, 13rem"
                className="object-cover"
                style={{ objectPosition: focus, transform: `scale(${zoom})`, transformOrigin: focus }}
              />
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 text-center md:w-auto md:text-left">
          <h1 className="font-display text-4xl font-semibold leading-tight text-maroon sm:text-5xl lg:text-6xl">
            {biodata.name}
          </h1>
          {biodata.tagline && <p className="mt-2 text-base text-muted sm:text-lg">{biodata.tagline}</p>}
          <Divider className="mx-auto mt-4 h-5 w-44 text-gold md:mx-0" />

          <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
            <AgeChip dob={personal.dateOfBirth} className={chipClass} />
            {chips.map((c) => (
              <li key={c} className={chipClass}>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-7 hidden md:block print:hidden">
            <ActionBar />
          </div>
        </div>
      </div>
    </section>
  );
}
