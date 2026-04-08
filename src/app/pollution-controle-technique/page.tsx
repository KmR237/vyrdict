import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contrôle technique refusé pour pollution : causes et solutions diesel/essence — Vyrdict",
  description:
    "Contrôle technique refusé pour pollution ? Causes fréquentes (FAP, catalyseur, sonde lambda), seuils d'émission, solutions et coûts de réparation diesel et essence.",
  alternates: { canonical: "https://vyrdict.fr/pollution-controle-technique" },
};

export default function PollutionCT() {
  return (
    <div className="min-h-full flex flex-col">
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
            Contrôle technique refusé pour pollution : causes et solutions diesel/essence
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Depuis le durcissement des normes en 2019, les refus pour pollution ont bondi de <strong>plus de 60 %</strong>. Les véhicules diesel sont particulièrement touchés. Ce guide détaille les seuils, les causes les plus fréquentes et les solutions pour chaque type de motorisation.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">Refusé pour pollution ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict pour identifier les défaillances pollution et estimer le coût des réparations.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Estimer mes coûts de réparation &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les seuils de pollution au contrôle technique</h2>
              <p>
                Le contrôle technique mesure les émissions polluantes de votre véhicule. Les seuils diffèrent selon le type de motorisation et la date de première mise en circulation :
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">Véhicules diesel : opacité des fumées</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { norme: "Avant Euro 6 (avant 09/2015)", seuil: "Opacité maximale : 1,5 m⁻¹ pour les turbodiesel, 2,0 m⁻¹ pour les atmosphériques" },
                      { norme: "Euro 6 et suivants", seuil: "Opacité maximale : 0,7 m⁻¹ — seuil drastiquement réduit depuis 2019" },
                    ].map((item) => (
                      <div key={item.norme} className="py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                        <span className="font-semibold text-sm text-foreground">{item.norme}</span>
                        <p className="text-sm text-muted mt-0.5">{item.seuil}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Véhicules essence : taux de CO</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { norme: "Véhicules sans catalyseur", seuil: "CO maximum au ralenti : 3,5 %" },
                      { norme: "Véhicules avec catalyseur", seuil: "CO maximum au ralenti : 0,5 % — et valeur lambda entre 0,97 et 1,03" },
                    ].map((item) => (
                      <div key={item.norme} className="py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                        <span className="font-semibold text-sm text-foreground">{item.norme}</span>
                        <p className="text-sm text-muted mt-0.5">{item.seuil}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Causes fréquentes de refus : véhicules diesel</h2>
              <p>
                Les véhicules diesel représentent la grande majorité des refus pour pollution. Voici les causes les plus courantes :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Filtre à particules (FAP) encrassé ou supprimé</p>
                  <p className="text-sm text-muted mt-1">C&apos;est la cause n&deg;1 de refus pollution diesel. Un FAP encrassé laisse passer trop de particules. Un FAP supprimé (pratique illégale) provoque un refus systématique. <strong>Coût de nettoyage : 100 à 300 euros. Remplacement : 800 à 2 500 euros.</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Vanne EGR encrassée</p>
                  <p className="text-sm text-muted mt-1">La vanne de recirculation des gaz d&apos;échappement se bouche avec les suies. Résultat : surconsommation et fumées excessives. <strong>Nettoyage : 80 à 200 euros. Remplacement : 200 à 500 euros.</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Injecteurs défectueux</p>
                  <p className="text-sm text-muted mt-1">Des injecteurs usés ou encrassés provoquent une mauvaise pulvérisation du carburant et des fumées noires. <strong>Nettoyage : 150 à 300 euros. Remplacement : 200 à 500 euros par injecteur.</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-stone-300 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Turbo fatigué</p>
                  <p className="text-sm text-muted mt-1">Un turbocompresseur en fin de vie peut laisser passer de l&apos;huile dans l&apos;échappement, augmentant l&apos;opacité. <strong>Remplacement : 800 à 2 000 euros.</strong></p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Causes fréquentes de refus : véhicules essence</h2>
              <p>
                Les refus pollution sur les véhicules essence sont moins fréquents mais concernent principalement :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Catalyseur hors service</p>
                  <p className="text-sm text-muted mt-1">Le pot catalytique s&apos;use avec le temps (environ 120 000 km). Quand il ne convertit plus les gaz, le taux de CO dépasse les seuils. <strong>Remplacement : 300 à 1 500 euros selon le modèle.</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Sonde lambda défectueuse</p>
                  <p className="text-sm text-muted mt-1">La sonde lambda mesure la teneur en oxygène des gaz d&apos;échappement pour ajuster le mélange air/carburant. Si elle est défaillante, le mélange est mal dosé. <strong>Remplacement : 80 à 250 euros.</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Bougies d&apos;allumage usées</p>
                  <p className="text-sm text-muted mt-1">Des bougies usées provoquent une combustion incomplète et augmentent les émissions de CO et d&apos;hydrocarbures. <strong>Remplacement : 20 à 80 euros (jeu de 4).</strong></p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-stone-300 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Filtre à air encrassé</p>
                  <p className="text-sm text-muted mt-1">Un filtre à air bouché déséquilibre le rapport air/carburant. Simple à remplacer. <strong>Coût : 10 à 30 euros.</strong></p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Solutions et coûts par type de réparation</h2>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Nettoyage FAP (décalaminage)", cost: "100 - 300 €", type: "Diesel" },
                  { label: "Remplacement FAP", cost: "800 - 2 500 €", type: "Diesel" },
                  { label: "Nettoyage vanne EGR", cost: "80 - 200 €", type: "Diesel" },
                  { label: "Remplacement vanne EGR", cost: "200 - 500 €", type: "Diesel" },
                  { label: "Nettoyage injecteurs", cost: "150 - 300 €", type: "Diesel" },
                  { label: "Remplacement catalyseur", cost: "300 - 1 500 €", type: "Essence" },
                  { label: "Remplacement sonde lambda", cost: "80 - 250 €", type: "Essence" },
                  { label: "Bougies d'allumage (jeu)", cost: "20 - 80 €", type: "Essence" },
                  { label: "Filtre à air", cost: "10 - 30 €", type: "Tous" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{item.label}</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 bg-slate-100 text-muted rounded-full">{item.type}</span>
                    </div>
                    <span className="font-bold text-sm tabular-nums text-foreground">{item.cost}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Tarifs moyens constatés en garage indépendant — France 2025-2026.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Astuces pour réussir le contrôle pollution</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "Roulez 30 minutes sur autoroute avant le CT", text: "Rouler à régime soutenu (3 000-3 500 tr/min) permet de régénérer partiellement le FAP et de faire monter le catalyseur en température. Les émissions sont souvent meilleures juste après." },
                  { title: "Faites un décalaminage préventif", text: "Un nettoyage moteur (100-200 euros) avant le CT peut suffire à passer sous les seuils si votre véhicule est limite. Solution particulièrement efficace sur les diesel qui roulent beaucoup en ville." },
                  { title: "Changez le filtre à air", text: "Intervention simple (10-30 euros) qui améliore le rapport air/carburant et réduit les émissions. À faire systématiquement avant un CT si le filtre a plus de 20 000 km." },
                  { title: "Utilisez un additif carburant", text: "Certains additifs nettoyants (5-15 euros le flacon) aident à réduire les dépôts dans le circuit d'alimentation. À verser dans le réservoir 200 km avant le CT." },
                  { title: "Vérifiez l'huile moteur", text: "Une huile usée ou en excès peut contaminer les gaz d'échappement. Assurez-vous que le niveau est correct et que la vidange est à jour." },
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Suppression du FAP : attention danger</h2>
              <p>
                La suppression du filtre à particules est une pratique <strong>illégale</strong> en France. Depuis 2019, le contrôle technique vérifie spécifiquement la présence du FAP :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50">
                  <span className="text-lg">&#10060;</span>
                  <p className="text-sm"><strong>Refus systématique au CT</strong> — Un FAP absent ou supprimé entraîne un refus automatique du contrôle technique.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50">
                  <span className="text-lg">&#10060;</span>
                  <p className="text-sm"><strong>Amende de 7 500 euros</strong> — La suppression d&apos;un dispositif antipollution est passible d&apos;une amende pouvant aller jusqu&apos;à 7 500 euros pour un particulier.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50">
                  <span className="text-lg">&#10060;</span>
                  <p className="text-sm"><strong>Assurance invalidée</strong> — En cas d&apos;accident, l&apos;assureur peut refuser la prise en charge si le véhicule a été modifié.</p>
                </div>
              </div>
              <p className="mt-4">
                Si votre FAP a été supprimé, la seule solution légale est de le <strong>faire remonter</strong> avant le prochain contrôle technique.
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
