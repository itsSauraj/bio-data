import type { SVGProps } from "react";

/** Gold rule with a central diamond and leaf curls, used under section titles. */
export function Divider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 24" fill="none" aria-hidden="true" {...props}>
      <path d="M0 12h88" stroke="currentColor" strokeWidth="1" />
      <path d="M152 12h88" stroke="currentColor" strokeWidth="1" />
      <circle cx="97" cy="12" r="1.8" fill="currentColor" />
      <circle cx="143" cy="12" r="1.8" fill="currentColor" />
      <path
        d="M104 12c4-6 10-7 16-7s12 1 16 7c-4 6-10 7-16 7s-12-1-16-7z"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path d="M120 4.5l7.5 7.5-7.5 7.5-7.5-7.5z" fill="currentColor" />
      <path d="M120 8.5l3.5 3.5-3.5 3.5-3.5-3.5z" fill="var(--color-paper)" />
    </svg>
  );
}

/** Corner flourish for framed cards. Rotate with Tailwind classes for each corner. */
export function Corner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" {...props}>
      <path d="M4 76V30C4 15.6 15.6 4 30 4h46" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 76V34c0-12.2 9.8-22 22-22h42"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.6"
      />
      <path
        d="M22 30c2-8 10-12 16-8 3 2 3 7 0 9s-7 0-7-3"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <circle cx="76" cy="4" r="2.2" fill="currentColor" />
      <circle cx="4" cy="76" r="2.2" fill="currentColor" />
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}
