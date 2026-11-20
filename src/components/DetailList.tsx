import type { Field } from "@/data/sections";
import { cn } from "@/lib/cn";

type Props = { fields: Field[]; columns?: 1 | 2 };

export function DetailList({ fields, columns = 1 }: Props) {
  return (
    <div className={cn("grid gap-x-10", columns === 2 && "md:grid-cols-2")}>
      {fields.map((f, i) => (
        <div
          key={`${f.label}-${i}`}
          className="grid gap-0.5 border-b border-gold/25 py-2.5 last:border-b-0 sm:grid-cols-[minmax(8.5rem,38%)_1fr] sm:items-baseline sm:gap-4"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-dark sm:text-xs">
            {f.label}
          </span>
          <span className="text-[15px] leading-6 text-ink sm:text-base">
            {f.href ? (
              <a
                href={f.href}
                className="text-maroon underline decoration-gold/60 underline-offset-4 transition-colors hover:decoration-maroon"
                target={f.href.startsWith("http") ? "_blank" : undefined}
                rel={f.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {f.value}
              </a>
            ) : (
              f.value
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
