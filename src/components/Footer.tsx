import { LABELS, type Lang } from "@/data/labels";

export default function Footer({ lang, name }: { lang: Lang; name: string }) {
  const L = LABELS[lang];
  return (
    <footer className="mt-2 text-center text-xs text-muted sm:text-sm">
      <p className="font-devanagari text-base text-maroon">॥ शुभम् भवतु ॥</p>
      <p className="mt-2">{L.confidential}</p>
      <p className="mt-1">{L.preparedBy(name)}</p>
    </footer>
  );
}
