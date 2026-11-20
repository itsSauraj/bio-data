import { biodata } from "@/data/biodata";

export default function Footer() {
  return (
    <footer className="mt-2 text-center text-xs text-muted sm:text-sm">
      <p className="font-devanagari text-base text-maroon">॥ शुभम् भवतु ॥</p>
      <p className="mt-2">
        This bio-data is shared in confidence with prospective families. Please do not forward it without
        permission.
      </p>
      <p className="mt-1">Prepared with love by the family of {biodata.name}.</p>
    </footer>
  );
}
