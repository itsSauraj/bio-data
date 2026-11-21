import Link from "next/link";
import { LABELS, LANG_PATH, type Lang } from "@/data/labels";
import { cn } from "@/lib/cn";

const LANGS: Lang[] = ["en", "hi"];

/** English ⇄ हिन्दी toggle; each edition is its own page, so the link is shareable. */
export default function LanguageSwitch({ current }: { current: Lang }) {
  return (
    <nav
      aria-label={LABELS[current].switchLanguage}
      // Stays anchored while the page content cross-fades (see globals.css).
      style={{ viewTransitionName: "lang-switch" }}
      className="inline-flex rounded-full border border-gold/50 bg-paper p-0.5 text-sm shadow-sm"
    >
      {LANGS.map((lang) => (
        <Link
          key={lang}
          href={LANG_PATH[lang]}
          scroll={false}
          lang={lang}
          aria-current={lang === current ? "page" : undefined}
          className={cn(
            "rounded-full px-3.5 py-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon",
            lang === "hi" && "font-devanagari",
            lang === current ? "bg-maroon text-white" : "text-maroon hover:bg-gold-light/40",
          )}
        >
          {LABELS[lang].languageName}
        </Link>
      ))}
    </nav>
  );
}
