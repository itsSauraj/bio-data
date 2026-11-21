import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Divider } from "./Ornaments";

type Props = {
  id?: string;
  title: string;
  /** The same heading in the other language, shown small under the title. */
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ id, title, subtitle, className, children }: Props) {
  return (
    <section
      id={id}
      className={cn(
        "shimmer-border scroll-mt-6 rounded-2xl border border-gold/40 bg-paper/95 px-5 py-6 shadow-[0_10px_40px_-22px_rgba(123,30,43,0.35)] sm:px-8 sm:py-8 print:shadow-none",
        className,
      )}
    >
      <header className="mb-5 text-center sm:mb-6">
        <h2 className="font-display text-[1.75rem] font-semibold leading-tight tracking-wide text-maroon sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 font-devanagari text-sm text-gold-dark">{subtitle}</p>}
        <Divider className="mx-auto mt-3 h-5 w-48 text-gold" />
      </header>
      {children}
    </section>
  );
}
