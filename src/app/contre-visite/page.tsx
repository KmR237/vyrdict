import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contre-visite contrôle technique : délais, coûts et conseils — Vyrdict",
  description:
    "Tout savoir sur la contre-visite du contrôle technique : délai de 2 mois, coût moyen, réparations prioritaires et comment bien la préparer pour ne pas repayer le CT complet.",
  alternates: { canonical: "https://vyrdict.fr/contre-visite" },
};

export default function ContreVisite() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-card-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
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
            Contre-visite du contrôle technique : tout ce que vous devez savoir
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Votre contrôle technique est défavorable ? Pas de panique. Vous avez 2 mois pour réparer et passer la contre-visite. Ce guide vous explique la procédure, les délais, les coûts et comment prioriser vos réparations.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">CT défavorable ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict pour savoir exactement combien vont coûter les réparations et quelles sont les priorités.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Estimer mes coûts de réparation &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Qu&apos;est-ce que la contre-visite ?</h2>
              <p>
                La contre-visite est un second passage au centre de contrôle technique, uniquement pour vérifier que les <strong>défaillances majeures ou critiques</strong> identifiées lors du contrôle initial ont bien été réparées.
              </p>
              <p className="mt-3">
                Contrairement au contrôle initial, la contre-visite ne porte <strong>que sur les points signalés</strong> comme défaillants. Le reste du véhicule n&apos;est pas revérifié.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Quel est le délai pour la contre-visite ?</h2>
              <p>
                Vous disposez d&apos;un <strong>délai maximum de 2 mois</strong> à compter de la date du contrôle initial pour passer la contre-visite. Ce délai est inscrit sur votre procès-verbal de contrôle technique.
              </p>
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200/50">
                <p className="text-sm font-semibold text-red-800">Important :</p>
                <p className="text-sm text-red-700/80 mt-1">
                  Si vous dépassez le délai de 2 mois, vous devrez repasser un <strong>contrôle technique complet</strong> (et payer le tarif plein de 60-90€ au lieu des 15-30€ de la contre-visite).
                </p>
              </div>
              <div className="mt-4 p-4 bg-card rounded-xl border border-card-border">
                <p className="text-sm font-semibold text-foreground">Cas particulier : défaillance critique</p>
                <p className="text-sm text-muted mt-1">
                  En cas de défaillance critique, votre véhicule ne peut plus circuler <strong>à partir du lendemain</strong> du contrôle. Vous devez le faire remorquer vers un garage pour réparation. Le délai de 2 mois s&apos;applique tout de même.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Combien coûte la contre-visite ?</h2>
              <p>
                La contre-visite est beaucoup moins chère que le contrôle initial :
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-xl border border-card-border text-center">
                  <p className="text-2xl font-black text-foreground">15 - 30 €</p>
                  <p className="text-xs text-muted mt-1">Contre-visite</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-card-border text-center">
                  <p className="text-2xl font-black text-foreground">60 - 90 €</p>
                  <p className="text-xs text-muted mt-1">CT complet (si délai dépassé)</p>
                </div>
              </div>
              <p className="mt-4">
                Vous pouvez passer la contre-visite dans <strong>n&apos;importe quel centre agréé</strong>, pas forcément celui qui a effectué le contrôle initial. Comparez les prix si besoin.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Quelles réparations prioriser ?</h2>
              <p>
                Si votre CT comporte plusieurs défaillances, concentrez-vous d&apos;abord sur celles qui <strong>bloquent la contre-visite</strong> :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-card-border">
                  <p className="font-bold text-foreground">Priorité 1 : Défaillances critiques</p>
                  <p className="text-sm text-muted mt-1">À réparer immédiatement. Le véhicule ne peut pas circuler.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-card-border">
                  <p className="font-bold text-foreground">Priorité 2 : Défaillances majeures</p>
                  <p className="text-sm text-muted mt-1">Obligatoires pour passer la contre-visite. Ce sont les réparations qui comptent.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-stone-300 bg-card border border-card-border">
                  <p className="font-bold text-foreground">Priorité 3 : Défaillances mineures</p>
                  <p className="text-sm text-muted mt-1">Notées mais <strong>ne bloquent pas</strong> la contre-visite. Vous pouvez les reporter.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les défaillances les plus courantes en contre-visite</h2>
              <p>Voici les réparations les plus fréquentes avec leurs coûts moyens en garage indépendant :</p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Plaquettes de frein usées", cost: "40 - 200 €", freq: "Très fréquent" },
                  { label: "Phare mal réglé ou ampoule grillée", cost: "15 - 60 €", freq: "Très fréquent" },
                  { label: "Pneu usé sous le minimum légal", cost: "45 - 300 €", freq: "Fréquent" },
                  { label: "Fuite d'échappement", cost: "80 - 300 €", freq: "Fréquent" },
                  { label: "Flexible de frein détérioré", cost: "60 - 220 €", freq: "Courant" },
                  { label: "Amortisseur défectueux", cost: "200 - 400 €", freq: "Courant" },
                  { label: "Corrosion du soubassement", cost: "150 - 800 €", freq: "Variable" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-card rounded-xl border border-card-border">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{item.label}</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 bg-slate-100 text-muted rounded-full">{item.freq}</span>
                    </div>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Tarifs moyens constatés en garage indépendant — France 2025-2026.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Conseils pour économiser sur les réparations</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "Comparez 2-3 devis", text: "Les garages indépendants sont en moyenne 20-30% moins chers que les concessions pour les mêmes réparations." },
                  { title: "Priorisez les réparations bloquantes", text: "Ne réparez que les défaillances majeures/critiques pour la contre-visite. Les mineures peuvent attendre." },
                  { title: "Vérifiez ce que vous pouvez faire vous-même", text: "Ampoules, balais d'essuie-glace, plaquettes simples : certaines réparations sont faisables sans garagiste." },
                  { title: "Demandez les pièces d'occasion", text: "Pour des pièces non critiques (rétroviseur, optique de phare), les pièces d'occasion certifiées coûtent 40-60% moins cher." },
                  { title: "Négociez un forfait", text: "Si vous avez plusieurs réparations, demandez un tarif groupé. La plupart des garages acceptent." },
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Réparer ou vendre : comment décider ?</h2>
              <p>
                Quand le coût des réparations dépasse une certaine proportion de la valeur du véhicule, il peut être plus rentable de vendre :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
                  <span className="text-lg">&#9989;</span>
                  <p className="text-sm"><strong>Réparations &lt; 35% de la cote</strong> — La réparation est justifiée économiquement.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                  <span className="text-lg">&#9888;&#65039;</span>
                  <p className="text-sm"><strong>Réparations entre 35% et 75%</strong> — Cas limite. Comparez avec le prix d&apos;un véhicule de remplacement.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50">
                  <span className="text-lg">&#10060;</span>
                  <p className="text-sm"><strong>Réparations &gt; 75% de la cote</strong> — Envisagez sérieusement la vente du véhicule.</p>
                </div>
              </div>
              <p className="mt-4">
                Pour connaître la cote de votre véhicule, consultez <a href="https://www.lacentrale.fr/cote-auto.html" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">LaCentrale</a> ou <a href="https://www.autoscout24.fr" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">AutoScout24</a>.
              </p>
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

      <footer className="border-t border-card-border py-8 mt-auto bg-card/50">
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
