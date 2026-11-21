import { cn } from "@/lib/cn";

/*
 * Animated "marching" dashed frames drawn as SVG overlays. Both are
 * pointer-events-none so the photo underneath stays clickable, and both
 * respect prefers-reduced-motion via the motion-reduce variant.
 * Dash + gap = 16 units, matching the `march` keyframes in globals.css.
 */

const dashClass = "animate-march motion-reduce:animate-none";

/** Rounded-rectangle frame that follows its parent's size (parent must be `relative`). */
export function DashedRect({
  radius = 12,
  strokeWidth = 2,
  className,
}: {
  radius?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const inset = strokeWidth / 2;
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full text-gold", className)}>
      <rect
        x={inset}
        y={inset}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray="9 7"
        strokeLinecap="round"
        className={dashClass}
        style={{ width: `calc(100% - ${strokeWidth}px)`, height: `calc(100% - ${strokeWidth}px)` }}
      />
    </svg>
  );
}

/**
 * Arch frame for the 4:5 hero portrait: a semicircular top and 16px bottom
 * corners, drawn in a 240×300 box and stretched to the element (same ratio,
 * so nothing distorts).
 */
export function DashedArch({ className }: { className?: string }) {
  const sw = 3;
  const i = sw / 2; // inset so the stroke stays inside the box
  const r = 120 - i; // top semicircle radius
  const b = 16; // bottom corner radius
  const d = [
    `M${i} ${300 - b}`,
    `V120`,
    `A${r} ${r} 0 0 1 ${240 - i} 120`,
    `V${300 - b}`,
    `A${b - i} ${b - i} 0 0 1 ${240 - b} ${300 - i}`,
    `H${b}`,
    `A${b - i} ${b - i} 0 0 1 ${i} ${300 - b}`,
    "Z",
  ].join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 300"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-gold", className)}
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray="9 7" strokeLinecap="round" className={dashClass} />
    </svg>
  );
}
