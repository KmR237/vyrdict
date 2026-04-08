"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { AnalyseResult } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { GraviteBadge } from "@/components/GraviteBadge";
import { VerdictBanner } from "@/components/VerdictBanner";

export default function RapportPage() {
  const { id } = useParams();
  const [rapport, setRapport] = useState<{ resultat: AnalyseResult; prix_demande: number | null; created_at: string; views: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prixDemande, setPrixDemande] = useState("");
  const [coteManuelle, setCoteManuelle] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/rapport/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
        if (data.prix_demande) setPrixDemande(data.prix_demande.toString());
      } else {
        setError("Rapport introuvable ou lien expiré.");
      }
      setLoading(false);
    })();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted mt-4">Chargement du rapport...</p>
      </div>
    </div>
  );

  if (error || !rapport) return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-lg font-semibold">{error}</p>
      <Link href="/" className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
        Analyser mon CT &rarr;
      </Link>
    </div>
  );

  const r = rapport.resultat;
  const coutMoyen = Math.round((r.cout_total_min + r.cout_total_max) / 2);
  const prix = prixDemande ? parseInt(prixDemande) : null;
  const prixReel = prix ? prix + coutMoyen : null;
  const coteArgus = coteManuelle ? parseInt(coteManuelle) : r.cote_argus_estimee;

  // Verdict prix juste
  let verdictPrix: { label: string; color: string; bg: string; detail: string } | null = null;
  if (prixReel && coteArgus && coteArgus > 0) {
    const ratio = prixReel / coteArgus;
    if (ratio <= 0.85) {
      verdictPrix = { label: "Bonne affaire", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200/50", detail: `Le prix réel (${prixReel.toLocaleString("fr-FR")} €) est inférieur à la cote (${coteArgus.toLocaleString("fr-FR")} €).` };
    } else if (ratio <= 1.05) {
      verdictPrix = { label: "Prix correct", color: "text-blue-700", bg: "bg-blue-50 border-blue-200/50", detail: `Le prix réel (${prixReel.toLocaleString("fr-FR")} €) est proche de la cote marché (${coteArgus.toLocaleString("fr-FR")} €).` };
    } else {
      verdictPrix = { label: "Trop cher", color: "text-red-700", bg: "bg-red-50 border-red-200/50", detail: `Le prix réel (${prixReel.toLocaleString("fr-FR")} €) dépasse la cote marché (${coteArgus.toLocaleString("fr-FR")} €). Négociez ou passez votre chemin.` };
    }
  }

  const dateStr = new Date(rapport.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight">Vyrdict</span>
              <span className="hidden sm:inline text-xs text-muted font-medium">Rapport vérifié</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="p-2 rounded-lg border border-slate-200/50 hover:bg-white transition-colors cursor-pointer no-print" aria-label="Imprimer">
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200/50 hover:bg-white text-sm font-medium transition-colors cursor-pointer no-print">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              {copied ? "Copié !" : "Copier le lien"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Badge rapport vérifié */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm font-medium text-teal-700">Rapport Vyrdict — analysé le {dateStr}</span>
          </div>
          {rapport.views > 1 && (
            <span className="text-xs text-muted">{rapport.views} consultation{rapport.views > 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Véhicule */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="font-bold text-foreground text-xl">{r.vehicule.marque} {r.vehicule.modele}</span>
            {r.vehicule.immatriculation && (
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-xs font-medium">{r.vehicule.immatriculation}</span>
            )}
            <div className="flex items-center gap-3 text-sm text-muted">
              {r.vehicule.annee && <span>{r.vehicule.annee}</span>}
              {r.vehicule.kilometrage > 0 && <span>{r.vehicule.kilometrage.toLocaleString("fr-FR")} km</span>}
              {r.energie && <span>{r.energie}</span>}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center shadow-sm">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Score santé</span>
            <div className="mt-3"><ScoreGauge score={r.score_sante} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Coût réparations</span>
            <span className="text-2xl font-black mt-3 tabular-nums">~{coutMoyen.toLocaleString("fr-FR")} &euro;</span>
            <span className="text-xs text-muted mt-1 tabular-nums">({r.cout_total_min.toLocaleString("fr-FR")} - {r.cout_total_max.toLocaleString("fr-FR")} &euro;)</span>
            <span className="text-xs text-muted mt-1">{r.defaillances.length} défaillance{r.defaillances.length > 1 ? "s" : ""}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Prix demandé</span>
            <div className="flex items-center gap-1 mt-3">
              <input type="number" inputMode="numeric" placeholder="8 500" value={prixDemande}
                onChange={(e) => setPrixDemande(e.target.value)}
                className="w-24 text-center text-2xl font-black bg-transparent border-b-2 border-slate-200 focus:border-primary transition-colors placeholder:text-slate-300 placeholder:text-lg tabular-nums focus:outline-none" />
              <span className="text-2xl font-black text-slate-400">&euro;</span>
            </div>
            <p className="text-[11px] text-muted mt-1.5">Prix de l&apos;annonce</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Cote marché</span>
            <div className="flex items-center gap-1 mt-3">
              <input type="number" inputMode="numeric" placeholder="9 000" value={coteManuelle}
                onChange={(e) => setCoteManuelle(e.target.value)}
                className="w-24 text-center text-2xl font-black bg-transparent border-b-2 border-slate-200 focus:border-primary transition-colors placeholder:text-slate-300 placeholder:text-lg tabular-nums focus:outline-none" />
              <span className="text-2xl font-black text-slate-400">&euro;</span>
            </div>
            <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline font-medium mt-1.5">
              Trouver sur LaCentrale &rarr;
            </a>
          </div>
        </div>

        {/* Prix juste */}
        {prix && prix > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm mb-4">
            <h2 className="font-bold text-base mb-3">Ce véhicule vaut-il le prix demandé ?</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Prix affiché</span>
                <span className="font-semibold tabular-nums">{prix.toLocaleString("fr-FR")} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">+ Réparations estimées</span>
                <span className="font-semibold tabular-nums text-amber-600">+{coutMoyen.toLocaleString("fr-FR")} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200/50">
                <span className="font-bold">Prix réel (tout compris)</span>
                <span className="text-lg font-black tabular-nums">{prixReel!.toLocaleString("fr-FR")} €</span>
              </div>
              {coteArgus && coteArgus > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Cote marché estimée</span>
                  <span className="font-semibold tabular-nums">{coteArgus.toLocaleString("fr-FR")} €</span>
                </div>
              )}
            </div>

            {verdictPrix && (
              <div className={`mt-4 p-4 rounded-xl border ${verdictPrix.bg}`}>
                <p className={`font-bold ${verdictPrix.color}`}>{verdictPrix.label}</p>
                <p className="text-sm text-muted mt-1">{verdictPrix.detail}</p>
              </div>
            )}

            {!coteArgus && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted">
                  Renseignez la <strong>cote marché</strong> ci-dessus (via{" "}
                  <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    LaCentrale
                  </a>
                  ) pour obtenir le verdict : bonne affaire ou trop cher ?
                </p>
              </div>
            )}

            {prix > 0 && coutMoyen > 0 && (
              <div className="mt-3 p-3 bg-teal-50 rounded-xl">
                <p className="text-sm font-medium text-teal-800">
                  Prix de négociation suggéré : <strong className="text-lg tabular-nums">{Math.max(0, prix - coutMoyen).toLocaleString("fr-FR")} €</strong>
                </p>
                <p className="text-xs text-teal-600 mt-0.5">Prix demandé moins le coût des réparations obligatoires.</p>
              </div>
            )}
          </div>
        )}

        {/* Verdict CT */}
        <div className="mb-4"><VerdictBanner result={r} /></div>

        {/* Défaillances */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm mb-4">
          <h2 className="font-bold text-base mb-4">Défaillances détectées ({r.defaillances.length})</h2>
          <div className="flex flex-col gap-3">
            {[...r.defaillances].sort((a, b) => a.priorite - b.priorite).map((d, idx) => {
              const estimation = d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2);
              return (
                <div key={`${d.code}-${idx}`} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <GraviteBadge gravite={d.gravite} small />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{d.libelle}</p>
                    <p className="text-xs text-muted mt-0.5">{d.description}</p>
                    {d.reparation && <p className="text-xs text-teal-700 mt-1 font-medium">{d.reparation}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular-nums">~{estimation.toLocaleString("fr-FR")} €</p>
                    <p className="text-[10px] text-muted tabular-nums">{d.cout_min}-{d.cout_max} €</p>
                    {d.peut_faire_soi_meme && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium mt-1 inline-block">DIY</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-slate-200/50 font-bold text-sm">
            <span>Total estimé</span>
            <span className="tabular-nums">~{coutMoyen.toLocaleString("fr-FR")} € <span className="font-normal text-muted">({r.cout_total_min.toLocaleString("fr-FR")}-{r.cout_total_max.toLocaleString("fr-FR")} €)</span></span>
          </div>
        </div>

        {/* Conseils */}
        {r.conseils.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm mb-4">
            <h2 className="font-bold text-base mb-3">Conseils</h2>
            <ul className="flex flex-col gap-2">
              {r.conseils.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-md bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200/50 p-6 text-center mb-4 no-print">
          <p className="font-bold text-lg text-foreground">Vous aussi, analysez votre CT</p>
          <p className="text-sm text-muted mt-1 mb-4">Gratuit, sans inscription, résultat en 10 secondes.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Analyser mon contrôle technique &rarr;
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center py-4 leading-relaxed">
          Rapport généré par Vyrdict — Estimations indicatives basées sur les tarifs moyens en France 2025-2026. Demandez des devis professionnels avant toute intervention.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">V</span>
            </div>
            <span className="font-bold text-sm">Vyrdict</span>
          </Link>
          <p className="text-xs text-muted">&copy; 2026 Vyrdict</p>
        </div>
      </footer>
    </div>
  );
}
