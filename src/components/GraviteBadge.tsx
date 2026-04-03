import type { Defaillance } from "@/lib/types";

const STYLES = {
  critique: "bg-red-100 text-red-700 ring-1 ring-red-200",
  majeur: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  mineur: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
} as const;

export function GraviteBadge({ gravite, small = false }: { gravite: Defaillance["gravite"]; small?: boolean }) {
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${STYLES[gravite]} ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-0.5"}`}>
      {gravite}
    </span>
  );
}
