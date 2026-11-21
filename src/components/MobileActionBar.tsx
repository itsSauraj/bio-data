import type { Lang } from "@/data/labels";
import ActionBar from "./ActionBar";

/** Sticky bottom bar on phones so Download / Share are always one tap away. */
export default function MobileActionBar({ lang }: { lang: Lang }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden print:hidden">
      <ActionBar lang={lang} compact />
    </div>
  );
}
