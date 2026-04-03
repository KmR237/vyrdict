import type { AnalyseResult } from "@/lib/types";

const VERDICT_STYLES = {
  reparer: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60",
    icon: "bg-emerald-100",
    shadow: "shadow-[0_4px_14px_rgba(16,185,129,0.12)]",
    emoji: "\u2705",
    label: "Verdict : Réparer",
    badge: "bg-emerald-100/80 text-emerald-700",
  },
  vendre: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/60",
    icon: "bg-red-100",
    shadow: "shadow-[0_4px_14px_rgba(220,38,38,0.12)]",
    emoji: "\u274c",
    label: "Verdict : Envisager la vente",
    badge: "bg-red-100/80 text-red-700",
  },
  arbitrage: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60",
    icon: "bg-amber-100",
    shadow: "shadow-[0_4px_14px_rgba(245,158,11,0.12)]",
    emoji: "\u26a0\ufe0f",
    label: "Verdict : À arbitrer",
    badge: "bg-amber-100/80 text-amber-700",
  },
} as const;

export function VerdictBanner({ result }: { result: AnalyseResult }) {
  const style = VERDICT_STYLES[result.verdict];

  return (
    <div className={`rounded-2xl p-6 sm:p-8 animate-verdict ${style.bg} ${style.shadow}`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${style.icon}`}>
          <span className="text-2xl" aria-hidden="true">{style.emoji}</span>
        </div>
        <div>
          <h3 className="font-extrabold text-2xl [text-wrap:balance] tracking-tight">{style.label}</h3>
          <p className="text-sm mt-2 opacity-75 leading-relaxed">{result.conseil_verdict}</p>
          {result.contre_visite_deadline && (
            <div className={`inline-flex items-center gap-1.5 mt-3 text-sm font-semibold px-3 py-1.5 rounded-lg ${style.badge}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contre-visite avant le {result.contre_visite_deadline}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
