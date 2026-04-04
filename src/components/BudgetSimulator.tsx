import { useMemo } from "react";
import type { AnalyseResult, Defaillance } from "@/lib/types";
import { GraviteBadge } from "./GraviteBadge";

export function BudgetSimulator({ result, budget, onBudgetChange }: {
  result: AnalyseResult;
  budget: number;
  onBudgetChange: (value: number) => void;
}) {
  const { items, uncoveredMajeurs } = useMemo(() => {
    const sorted = [...result.defaillances].sort(
      (a, b) => a.priorite - b.priorite || b.cout_max - a.cout_max
    );
    // Greedy: couvre chaque item si le budget restant le permet (même après un item trop cher)
    let spent = 0;
    const items = sorted.map((d) => {
      const covered = (spent + d.cout_max) <= budget;
      if (covered) spent += d.cout_max;
      return { ...d, covered };
    });
    const uncoveredMajeurs = items.filter(
      (d) => !d.covered && (d.gravite === "majeur" || d.gravite === "critique")
    );
    return { items, uncoveredMajeurs };
  }, [result.defaillances, budget]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-5">Simulateur de budget</h2>
      <div className="flex items-center gap-4 mb-5">
        <input
          type="range" aria-label="Budget disponible"
          min={0}
          max={result.cout_total_max + 200}
          step={50}
          value={budget}
          onChange={(e) => onBudgetChange(parseInt(e.target.value))}
          className="flex-1"
        />
        <div className="bg-slate-50 rounded-xl px-4 py-2 min-w-[100px] text-center">
          <span className="font-bold text-lg">{budget.toLocaleString("fr-FR")} &euro;</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((d, idx) => (
          <BudgetItem key={idx} defaillance={d} />
        ))}
      </div>

      {uncoveredMajeurs.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl text-sm text-amber-800 flex items-start gap-2.5">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>
            <strong>{uncoveredMajeurs.length} défaillance{uncoveredMajeurs.length > 1 ? "s" : ""} majeure{uncoveredMajeurs.length > 1 ? "s" : ""}/critique{uncoveredMajeurs.length > 1 ? "s" : ""}</strong> non couverte{uncoveredMajeurs.length > 1 ? "s" : ""} par votre budget.
            {result.contre_visite_deadline && " Elles bloqueront la contre-visite."}
          </span>
        </div>
      )}
    </div>
  );
}

function BudgetItem({ defaillance: d }: { defaillance: Defaillance & { covered: boolean } }) {
  return (
    <div className={`flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl transition-colors ${
      d.covered ? "bg-green-50/80 text-green-800" : "bg-slate-50 text-slate-400"
    }`}>
      <div className="flex items-center gap-2.5">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          d.covered ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-300"
        }`}>
          {d.covered ? "\u2713" : "\u2717"}
        </span>
        <span className={d.covered ? "" : "line-through"}>{d.libelle}</span>
        <GraviteBadge gravite={d.gravite} small />
      </div>
      <span className="font-semibold whitespace-nowrap tabular-nums">~{(d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2)).toLocaleString("fr-FR")} &euro;</span>
    </div>
  );
}
