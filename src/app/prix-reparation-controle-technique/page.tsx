import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prix des réparations après un contrôle technique raté — Guide complet 2026 — Vyrdict",
  description:
    "Tous les prix de réparation après un contrôle technique raté : freins, éclairage, suspension, échappement, direction. Tarifs garage 2026 et astuces pour économiser.",
  alternates: { canonical: "https://vyrdict.fr/prix-reparation-controle-technique" },
  openGraph: {
    title: "Prix des réparations après un contrôle technique raté — Guide complet 2026 — Vyrdict",
    description: "Tous les prix de réparation après un contrôle technique raté : freins, éclairage, suspension, échappement, direction. Tarifs garage 2026 et astuces pour économiser.",
    url: "https://vyrdict.fr/prix-reparation-controle-technique",
    siteName: "Vyrdict",
    type: "article",
    locale: "fr_FR",
  },
};

export default function PrixReparation() {
  return (
    <div className="min-h-full flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Prix des réparations après un contrôle technique raté — Guide complet 2026 — Vyrdict",
        "description": "Tous les prix de réparation après un contrôle technique raté : freins, éclairage, suspension, échappement, direction. Tarifs garage 2026 et astuces pour économiser.",
        "author": { "@type": "Organization", "name": "Vyrdict" },
        "publisher": { "@type": "Organization", "name": "Vyrdict", "url": "https://vyrdict.fr" },
        "datePublished": "2026-04-08",
        "dateModified": "2026-04-18",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vyrdict.fr/prix-reparation-controle-technique" }
      }) }} />
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight">Vyrdict</span>
              <span className="hidden sm:inline text-xs text-muted font-medium">Analyseur CT</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <article>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight [text-wrap:balance]">
            Prix des réparations après un contrôle technique raté — Guide complet 2026
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Environ <strong>20 % des véhicules</strong> sont recalés au contrôle technique chaque année en France. Combien coûtent les réparations ? Ce guide détaille les prix par catégorie et vous donne des astuces concrètes pour réduire la facture.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">Besoin d&apos;une estimation personnalisée ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict et obtenez une estimation détaillée des coûts de réparation en quelques secondes.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Estimer mes coûts de réparation &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Freinage : les réparations les plus fréquentes</h2>
              <p>
                Le freinage est le premier motif de refus au contrôle technique. Près de <strong>35 % des contre-visites</strong> concernent un problème de freinage.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Plaquettes de frein avant (paire)", cost: "40 - 120 €" },
                  { label: "Plaquettes de frein arrière (paire)", cost: "35 - 100 €" },
                  { label: "Disques de frein avant (paire)", cost: "80 - 250 €" },
                  { label: "Disques de frein arrière (paire)", cost: "60 - 200 €" },
                  { label: "Flexible de frein", cost: "60 - 220 €" },
                  { label: "Maître-cylindre", cost: "150 - 400 €" },
                  { label: "Purge du circuit de freinage", cost: "40 - 80 €" },
                  { label: "Frein à main (câble ou réglage)", cost: "50 - 180 €" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Le remplacement conjoint des disques et plaquettes est souvent recommandé. Demandez un forfait groupé.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Éclairage et signalisation</h2>
              <p>
                Les problèmes d&apos;éclairage sont parmi les moins coûteux à corriger. Certaines réparations sont réalisables soi-même en quelques minutes.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Ampoule standard (phare, clignotant)", cost: "5 - 20 €" },
                  { label: "Ampoule xénon", cost: "30 - 80 €" },
                  { label: "Réglage de phares", cost: "15 - 40 €" },
                  { label: "Remplacement d'un feu arrière complet", cost: "30 - 150 €" },
                  { label: "Remplacement optique de phare", cost: "80 - 350 €" },
                  { label: "Réparation faisceau électrique", cost: "50 - 200 €" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Suspension et liaison au sol</h2>
              <p>
                Les défaillances de suspension sont courantes sur les véhicules de plus de 10 ans et peuvent représenter un budget conséquent.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Amortisseurs avant (paire, posés)", cost: "200 - 500 €" },
                  { label: "Amortisseurs arrière (paire, posés)", cost: "150 - 400 €" },
                  { label: "Rotule de direction", cost: "80 - 200 €" },
                  { label: "Biellette de barre stabilisatrice", cost: "40 - 120 €" },
                  { label: "Silent-bloc de triangle", cost: "60 - 180 €" },
                  { label: "Roulement de roue", cost: "100 - 300 €" },
                  { label: "Pneu neuf (par unité)", cost: "45 - 200 €" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Échappement et pollution</h2>
              <p>
                Les réparations liées à l&apos;échappement et à la pollution sont en augmentation depuis le durcissement des normes en 2019. Le filtre à particules est devenu un poste de dépense important.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Pot d'échappement (silencieux)", cost: "80 - 250 €" },
                  { label: "Catalyseur", cost: "300 - 1 500 €" },
                  { label: "Filtre à particules (FAP) — nettoyage", cost: "100 - 300 €" },
                  { label: "Filtre à particules (FAP) — remplacement", cost: "800 - 2 500 €" },
                  { label: "Sonde lambda", cost: "80 - 250 €" },
                  { label: "Joint de collecteur", cost: "60 - 150 €" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Direction et trains roulants</h2>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Biellette de direction", cost: "80 - 250 €" },
                  { label: "Crémaillère de direction", cost: "300 - 900 €" },
                  { label: "Pompe de direction assistée", cost: "200 - 600 €" },
                  { label: "Géométrie / parallélisme", cost: "50 - 100 €" },
                  { label: "Cardan (transmission)", cost: "150 - 400 €" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Comment économiser sur les réparations</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "Comparez systématiquement 2-3 devis", text: "Les garages indépendants pratiquent des tarifs 20 à 40 % inférieurs aux concessions pour les mêmes prestations et pièces équivalentes." },
                  { title: "Optez pour des pièces adaptables", text: "Les pièces de rechange « équipementier » coûtent 30 à 50 % de moins que les pièces d'origine constructeur, pour une qualité souvent identique." },
                  { title: "Faites vous-même les réparations simples", text: "Ampoules (5-20 €), balais d'essuie-glace (10-25 €), plaquettes de frein (20-50 € la paire) : ces interventions sont accessibles sans expérience." },
                  { title: "Demandez un forfait groupé", text: "Si vous avez plusieurs réparations, négociez un prix global. La plupart des garages accordent une remise de 10 à 15 % sur les interventions multiples." },
                  { title: "Pensez aux pièces d'occasion", text: "Pour les optiques de phare, rétroviseurs ou pare-brise, les pièces d'occasion certifiées sont 40 à 60 % moins chères." },
                  { title: "Utilisez Vyrdict pour prioriser", text: "Notre IA identifie les réparations obligatoires (contre-visite) et celles qui peuvent attendre, pour ne pas dépenser inutilement." },
                ].map((tip) => (
                  <li key={tip.title} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{tip.title}</span>
                      <p className="text-sm text-muted mt-0.5">{tip.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Garage indépendant vs concession : le comparatif</h2>
              <p>
                Le choix du réparateur a un impact direct sur votre budget. Voici les écarts constatés en moyenne :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-sm font-semibold text-foreground">
                  <span>Réparation</span>
                  <span className="text-center">Indépendant</span>
                  <span className="text-center">Concession</span>
                </div>
                {[
                  { rep: "Plaquettes + disques AV", indep: "120 - 300 €", concess: "200 - 500 €" },
                  { rep: "Amortisseurs AV (paire)", indep: "200 - 400 €", concess: "350 - 650 €" },
                  { rep: "Catalyseur", indep: "300 - 1 000 €", concess: "500 - 1 500 €" },
                  { rep: "Géométrie", indep: "50 - 80 €", concess: "80 - 120 €" },
                ].map((item) => (
                  <div key={item.rep} className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200/50 text-sm">
                    <span className="font-medium text-foreground">{item.rep}</span>
                    <span className="text-center text-emerald-700 font-semibold">{item.indep}</span>
                    <span className="text-center text-muted">{item.concess}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Tarifs indicatifs — France 2025-2026. Les prix varient selon la marque et le modèle du véhicule.</p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-teal-50 rounded-2xl border border-teal-200/50 text-center">
            <h2 className="font-bold text-xl text-foreground">Estimez vos coûts de réparation</h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Déposez votre procès-verbal de contrôle technique et notre IA vous dit exactement quoi réparer, dans quel ordre et à quel prix.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-all">
              Analyser mon CT gratuitement &rarr;
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200/50 py-8 mt-auto bg-white/50">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span className="font-medium">Vyrdict — Analyse de contrôle technique par IA</span>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/guide-controle-technique" className="text-primary hover:underline font-medium">Guide CT</Link>
            <Link href="/mentions-legales" className="text-primary hover:underline font-medium">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
