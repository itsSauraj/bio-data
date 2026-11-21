import Image from "next/image";
import { biodata } from "@/data/biodata";
import { sizedProfile } from "@/data/gallery.server";
import type { Lang } from "@/data/labels";
import type { Content } from "@/data/sections";
import { cn } from "@/lib/cn";
import { cropToObjectPosition, portraitCrop } from "@/lib/portrait";
import ActionBar from "./ActionBar";
import AgeChip from "./AgeChip";
import { Corner, Divider } from "./Ornaments";

const cornerClass = "pointer-events-none absolute h-14 w-14 text-gold sm:h-20 sm:w-20";
const chipClass = "rounded-full border border-gold/50 bg-cream px-3.5 py-1 text-sm text-ink";

export default function Hero({ lang, content }: { lang: Lang; content: Content }) {
  const { photo, personal } = biodata;
  const L = content.labels;

  // Portrait framing (same crop as the PDF): a 4:5 window `zoom` times closer,
  // centred on `focus`, so a full-length photo shows head and shoulders.
  const zoom = Math.max(1, photo.zoom ?? 1);
  const crop = portraitCrop(sizedProfile.width, sizedProfile.height, 4 / 5, photo.focus, zoom);
  const position = cropToObjectPosition(sizedProfile.width, sizedProfile.height, crop);
  const focus = `${position.x.toFixed(2)}% ${position.y.toFixed(2)}%`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/50 bg-paper px-5 py-8 shadow-[0_24px_60px_-30px_rgba(123,30,43,0.4)] sm:px-10 sm:py-10 print:shadow-none">
      <Corner className={`${cornerClass} left-3 top-3`} />
      <Corner className={`${cornerClass} right-3 top-3 rotate-90`} />
      <Corner className={`${cornerClass} bottom-3 right-3 rotate-180`} />
      <Corner className={`${cornerClass} bottom-3 left-3 -rotate-90`} />

      <div className="text-center">
        <p className="font-devanagari text-lg text-maroon sm:text-xl">{biodata.invocation.devanagari}</p>
        <p
          className={cn(
            "mt-1 font-bold text-gold-dark",
            lang === "hi" ? "text-sm" : "text-[11px] uppercase tracking-[0.35em]",
          )}
        >
          {L.kicker}
        </p>
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
                quality={95}
                // The arch shows a `zoom`-times magnified slice, so request a source that many times larger.
                sizes={`(min-width: 640px) ${Math.ceil(15 * zoom)}rem, ${Math.ceil(13 * zoom)}rem`}
                className="object-cover"
                style={{ objectPosition: focus, transform: `scale(${zoom})`, transformOrigin: focus }}
              />
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 text-center md:w-auto md:text-left">
          <h1 className="font-display text-4xl font-semibold leading-tight text-maroon sm:text-5xl lg:text-6xl">
            {content.name}
          </h1>
          {content.tagline && <p className="mt-2 text-base text-muted sm:text-lg">{content.tagline}</p>}
          <Divider className="mx-auto mt-4 h-5 w-44 text-gold md:mx-0" />

          <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
            <AgeChip dob={personal.dateOfBirth} suffix={L.years} className={chipClass} />
            {content.summary.map((c) => (
              <li key={c} className={chipClass}>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-7 hidden md:block print:hidden">
            <ActionBar lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
