import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide complet du contrôle technique automobile en France — Vyrdict",
  description:
    "Tout savoir sur le contrôle technique auto en France : points de contrôle, défaillances, coûts, délais de contre-visite et conseils pour passer votre CT sereinement.",
  alternates: { canonical: "https://vyrdict.fr/guide-controle-technique" },
  openGraph: {
    title: "Guide complet du contrôle technique automobile en France — Vyrdict",
    description: "Tout savoir sur le contrôle technique auto en France : points de contrôle, défaillances, coûts, délais de contre-visite et conseils pour passer votre CT sereinement.",
    url: "https://vyrdict.fr/guide-controle-technique",
    siteName: "Vyrdict",
    type: "article",
    locale: "fr_FR",
  },
};

export default function GuideControleTechnique() {
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
            Guide complet du contrôle technique automobile en France
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Le contrôle technique est obligatoire pour tous les véhicules de plus de 4 ans en France. Ce guide vous explique tout ce que vous devez savoir : les points vérifiés, les types de défaillances, les coûts et comment bien préparer votre passage.
          </p>

          <div className="mt-8 p-5 bg-teal-50 rounded-2xl border border-teal-200/50">
            <p className="text-sm font-semibold text-primary-dark">Vous avez déjà votre résultat de CT ?</p>
            <p className="text-sm text-muted mt-1">Déposez votre procès-verbal sur Vyrdict pour obtenir une estimation des coûts de réparation en quelques secondes.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary-dark hover:text-primary transition-colors">
              Analyser mon CT &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Qu&apos;est-ce que le contrôle technique ?</h2>
              <p>
                Le contrôle technique est un examen obligatoire qui vérifie l&apos;état de sécurité et la conformité environnementale de votre véhicule. Il est réalisé par un centre agréé par l&apos;État et dure environ 30 à 45 minutes.
              </p>
              <p className="mt-3">
                Instauré en 1992, il concerne tous les véhicules légers (voitures, utilitaires de moins de 3,5 tonnes). Le premier contrôle doit être effectué dans les 6 mois précédant le 4e anniversaire de la mise en circulation, puis <strong>tous les 2 ans</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les 133 points de contrôle</h2>
              <p>
                Depuis la réforme de 2018, le contrôle technique porte sur <strong>133 points de contrôle</strong> répartis en 9 fonctions :
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {[
                  { num: "0", label: "Identification du véhicule", desc: "Plaques, numéro de châssis, carte grise" },
                  { num: "1", label: "Freinage", desc: "Disques, plaquettes, flexibles, frein à main" },
                  { num: "2", label: "Direction", desc: "Crémaillère, rotules, biellettes, jeu au volant" },
                  { num: "3", label: "Visibilité", desc: "Pare-brise, essuie-glaces, rétroviseurs" },
                  { num: "4", label: "Éclairage et signalisation", desc: "Phares, feux, clignotants, réglage" },
                  { num: "5", label: "Liaisons au sol", desc: "Pneus, amortisseurs, suspension, roulements" },
                  { num: "6", label: "Structure et carrosserie", desc: "Châssis, corrosion, portières, capot" },
                  { num: "7", label: "Équipements", desc: "Ceintures, airbag, klaxon, plaque d'immatriculation" },
                  { num: "8", label: "Pollution et niveau sonore", desc: "Échappement, opacité, catalyseur, FAP" },
                ].map((item) => (
                  <li key={item.num} className="flex gap-3 items-start">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">{item.num}</span>
                    <div>
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="text-muted"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les 3 niveaux de défaillance</h2>
              <p>Chaque point de contrôle peut donner lieu à une défaillance classée en 3 niveaux :</p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-stone-300 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Défaillance mineure</p>
                  <p className="text-sm text-muted mt-1">Anomalie sans impact immédiat sur la sécurité. Le CT est <strong>favorable</strong>. Exemple : légère usure des essuie-glaces.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Défaillance majeure</p>
                  <p className="text-sm text-muted mt-1">Anomalie affectant la sécurité ou l&apos;environnement. Le CT est <strong>défavorable</strong> : vous avez 2 mois pour réparer et passer une contre-visite.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Défaillance critique</p>
                  <p className="text-sm text-muted mt-1">Danger immédiat. Le CT est <strong>défavorable</strong> et le véhicule ne peut plus circuler à partir du lendemain. Vous devez le faire remorquer pour réparation.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Combien coûte le contrôle technique ?</h2>
              <p>
                Le prix du contrôle technique varie selon la région et le centre, mais se situe en moyenne entre <strong>60€ et 90€</strong> en France. La contre-visite coûte généralement entre <strong>15€ et 30€</strong> (seuls les points défaillants sont revérifiés).
              </p>
              <p className="mt-3">
                Les tarifs sont libres et non réglementés. Il est recommandé de comparer les prix entre plusieurs centres de votre zone. Des comparateurs en ligne proposent de trouver les meilleurs tarifs par code postal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Comment se préparer au contrôle technique ?</h2>
              <p>Avant de vous rendre au centre, vérifiez vous-même ces éléments simples :</p>
              <ul className="mt-4 flex flex-col gap-2 list-disc list-inside text-muted">
                <li><strong className="text-foreground">Éclairage</strong> : tous les feux fonctionnent (phares, clignotants, feux de stop, recul)</li>
                <li><strong className="text-foreground">Pneus</strong> : usure suffisante (1.6mm minimum), pas de hernie ni coupure</li>
                <li><strong className="text-foreground">Pare-brise</strong> : pas de fissure dans le champ de vision du conducteur</li>
                <li><strong className="text-foreground">Essuie-glaces</strong> : en bon état, pas de traces</li>
                <li><strong className="text-foreground">Plaque d&apos;immatriculation</strong> : lisible, fixée correctement</li>
                <li><strong className="text-foreground">Équipements</strong> : gilet jaune et triangle de signalisation à bord</li>
                <li><strong className="text-foreground">Voyants</strong> : aucun voyant allumé au tableau de bord (moteur, ABS, airbag)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">La contre-visite : délais et procédure</h2>
              <p>
                Si votre CT est défavorable (défaillances majeures ou critiques), vous disposez d&apos;un <strong>délai de 2 mois</strong> pour effectuer les réparations et vous présenter en contre-visite. La contre-visite peut être effectuée dans n&apos;importe quel centre agréé, pas forcément celui du contrôle initial.
              </p>
              <p className="mt-3">
                Lors de la contre-visite, seuls les points signalés comme défaillants sont revérifiés. Si tout est conforme, votre CT devient favorable et vous recevez une nouvelle vignette valable 2 ans.
              </p>
              <p className="mt-3">
                <strong>Attention :</strong> si vous ne passez pas la contre-visite dans les 2 mois, vous devrez repasser un contrôle technique complet (et repayer le tarif plein).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Estimation des coûts de réparation</h2>
              <p>
                Les coûts de réparation varient selon le type de défaillance, le véhicule et la région. Voici les fourchettes moyennes constatées en garage indépendant en France :
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/50 text-left">
                      <th className="py-2 font-semibold text-foreground">Réparation</th>
                      <th className="py-2 font-semibold text-foreground text-right">Fourchette</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {[
                      ["Plaquettes de frein (avant)", "40 - 200 €"],
                      ["Disques de frein (avant)", "60 - 345 €"],
                      ["Amortisseurs (paire)", "200 - 400 €"],
                      ["Pneu (unité)", "45 - 300 €"],
                      ["Pot catalytique", "450 - 2 000 €"],
                      ["Remplacement pare-brise", "250 - 900 €"],
                      ["Kit distribution", "400 - 1 200 €"],
                      ["Réglage des phares", "25 - 60 €"],
                      ["Balais d'essuie-glace", "15 - 50 €"],
                    ].map(([label, price]) => (
                      <tr key={label} className="border-b border-slate-200/50/50">
                        <td className="py-2">{label}</td>
                        <td className="py-2 text-right font-semibold tabular-nums text-foreground">{price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-muted">
                Tarifs moyens constatés en garage indépendant — France 2025-2026.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-teal-50 rounded-2xl border border-teal-200/50 text-center">
            <h2 className="font-bold text-xl text-foreground">Vous avez reçu votre résultat ?</h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Déposez votre procès-verbal de contrôle technique et obtenez instantanément le coût des réparations, un score de santé et un verdict clair.
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
            <Link href="/mentions-legales" className="text-primary hover:underline font-medium">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
