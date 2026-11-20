"use client";

import { useSyncExternalStore } from "react";
import { calculateAge } from "@/data/sections";

const subscribe = () => () => {};

/**
 * Renders "<n> years" from the date of birth. The age depends on today's
 * date, so it is computed only on the client (server snapshot is null).
 */
export default function AgeChip({ dob, className }: { dob: string; className?: string }) {
  const age = useSyncExternalStore(
    subscribe,
    () => calculateAge(dob, new Date()),
    () => null,
  );
  if (age === null) return null;
  return <li className={className}>{age} years</li>;
}
