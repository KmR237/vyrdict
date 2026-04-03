import type { Defaillance } from "@/lib/types";
import { GraviteBadge } from "./GraviteBadge";

const BORDER_COLORS = {
  critique: "border-l-red-400",
  majeur: "border-l-amber-400",
  mineur: "border-l-stone-300",
} as const;

export function DefaillanceCard({ defaillance: d, expanded, onToggle }: { defaillance: Defaillance; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-card rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 ${BORDER_COLORS[d.gravite]}`}>
      <button onClick={onToggle} aria-expanded={expanded} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50/50 transition cursor-pointer">
        <GraviteBadge gravite={d.gravite} />
        <span className="flex-1 font-semibold text-sm">{d.libelle}</span>
        {d.peut_faire_soi_meme && (
          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold ring-1 ring-emerald-200">Faisable soi-même</span>
        )}
        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">{d.cout_min}-{d.cout_max} &euro;</span>
        <svg className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? "max-h-64" : "max-h-0"}`}>
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 flex flex-col gap-3 bg-slate-50/40">
          <p className="text-[15px] text-slate-600 leading-relaxed">{d.description}</p>
          <div className="flex items-start gap-2 text-[15px]">
            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span><strong className="text-slate-500">Réparation :</strong> {d.reparation}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {d.code && <span className="font-mono bg-card px-2 py-0.5 rounded border border-slate-100">CT {d.code}</span>}
            {d.localisation && <span className="bg-card px-2 py-0.5 rounded border border-slate-100">{d.localisation}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
