import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Défaillance critique au contrôle technique : liste, conséquences et solutions — Vyrdict",
  description:
    "Liste complète des défaillances critiques au contrôle technique, conséquences (immobilisation du véhicule), solutions et coûts de réparation. Guide pratique 2026.",
  alternates: { canonical: "https://vyrdict.fr/defaillance-critique-controle-technique" },
  openGraph: {
    title: "Défaillance critique au contrôle technique : liste, conséquences et solutions — Vyrdict",
    description: "Liste complète des défaillances critiques au contrôle technique, conséquences (immobilisation du véhicule), solutions et coûts de réparation. Guide pratique 2026.",
    url: "https://vyrdict.fr/defaillance-critique-controle-technique",
    siteName: "Vyrdict",
    type: "article",
    locale: "fr_FR",
  },
};

export default function DefaillanceCritique() {
  return (
    <div className="min-h-full flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Défaillance critique au contrôle technique : liste, conséquences et solutions — Vyrdict",
        "description": "Liste complète des défaillances critiques au contrôle technique, conséquences (immobilisation du véhicule), solutions et coûts de réparation. Guide pratique 2026.",
        "author": { "@type": "Organization", "name": "Vyrdict" },
        "publisher": { "@type": "Organization", "name": "Vyrdict", "url": "https://vyrdict.fr" },
        "datePublished": "2026-04-08",
        "dateModified": "2026-04-18",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vyrdict.fr/defaillance-critique-controle-technique" }
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
            Défaillance critique au contrôle technique : liste, conséquences et solutions
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Une défaillance critique signifie que votre véhicule représente un danger immédiat. Il est interdit de circuler dès le lendemain du contrôle. Voici tout ce qu&apos;il faut savoir : la liste des défauts concernés, les conséquences concrètes et les solutions pour y remédier.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">Défaillance critique sur votre PV ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict pour connaître le coût exact des réparations et savoir par où commencer.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Estimer mes coûts de réparation &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Qu&apos;est-ce qu&apos;une défaillance critique ?</h2>
              <p>
                Depuis la réforme du contrôle technique de mai 2018, les défauts constatés sont classés en trois niveaux de gravité : <strong>mineur</strong>, <strong>majeur</strong> et <strong>critique</strong>. La défaillance critique est le niveau le plus grave.
              </p>
              <p className="mt-3">
                Elle correspond à un défaut qui constitue un <strong>danger direct et immédiat</strong> pour la sécurité routière ou l&apos;environnement. Contrairement aux défaillances majeures, la défaillance critique entraîne une <strong>interdiction de circuler</strong> à compter du lendemain du contrôle (minuit le jour du CT).
              </p>
              <p className="mt-3">
                Sur votre procès-verbal, les défaillances critiques sont identifiées par la lettre <strong>&laquo; C &raquo;</strong> et apparaissent en général en rouge ou mises en avant.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Liste des principales défaillances critiques</h2>
              <p>
                Le contrôle technique comporte <strong>133 points de contrôle</strong> répartis en 9 fonctions. Parmi les quelque 610 défaillances possibles, environ <strong>130 sont classées critiques</strong>. Voici les plus fréquentes :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { categorie: "Freinage", defaut: "Absence totale de freinage sur un essieu", freq: "Fréquent" },
                  { categorie: "Freinage", defaut: "Fuite de liquide de frein importante", freq: "Fréquent" },
                  { categorie: "Direction", defaut: "Jeu excessif dans la colonne de direction", freq: "Courant" },
                  { categorie: "Éclairage", defaut: "Absence de feux de stop", freq: "Fréquent" },
                  { categorie: "Structure", defaut: "Corrosion perforante du châssis (zone structurelle)", freq: "Courant" },
                  { categorie: "Liaison au sol", defaut: "Pneu avec structure visible (toile apparente)", freq: "Très fréquent" },
                  { categorie: "Pollution", defaut: "Opacité des fumées très largement au-dessus du seuil", freq: "Courant" },
                  { categorie: "Échappement", defaut: "Fuite majeure du système d'échappement", freq: "Courant" },
                  { categorie: "Visibilité", defaut: "Pare-brise fissuré dans le champ de vision du conducteur", freq: "Fréquent" },
                ].map((item) => (
                  <div key={item.defaut} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{item.defaut}</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded-full">{item.categorie}</span>
                    </div>
                    <span className="text-xs text-muted shrink-0 ml-2">{item.freq}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Conséquences concrètes d&apos;une défaillance critique</h2>
              <p>
                Les conséquences sont immédiates et sérieuses :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Interdiction de circuler</p>
                  <p className="text-sm text-muted mt-1">Votre véhicule ne peut plus rouler à partir du <strong>lendemain minuit</strong> du jour du contrôle. Vous avez donc le reste de la journée pour rentrer chez vous ou aller directement au garage.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Véhicule à remorquer</p>
                  <p className="text-sm text-muted mt-1">Pour emmener le véhicule au garage après le délai, il faut un <strong>dépanneur ou une remorque</strong>. Comptez 80 à 200 euros pour un remorquage local.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Amende en cas de circulation</p>
                  <p className="text-sm text-muted mt-1">Circuler avec une défaillance critique expose à une <strong>amende de 135 euros</strong> (contravention de 4e classe) et à une possible <strong>immobilisation du véhicule</strong> par les forces de l&apos;ordre.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Délai de contre-visite : 2 mois</p>
                  <p className="text-sm text-muted mt-1">Vous disposez de <strong>2 mois</strong> pour effectuer les réparations et passer la contre-visite, comme pour les défaillances majeures.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Coûts de réparation des défaillances critiques</h2>
              <p>
                Les réparations liées aux défaillances critiques sont souvent plus coûteuses que celles des défaillances majeures, car elles concernent des organes de sécurité essentiels :
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Remplacement de pneus (par pneu)", cost: "50 - 200 €" },
                  { label: "Réparation du circuit de freinage", cost: "150 - 600 €" },
                  { label: "Colonne de direction", cost: "300 - 900 €" },
                  { label: "Remplacement pare-brise", cost: "200 - 500 €" },
                  { label: "Traitement corrosion châssis", cost: "200 - 1 200 €" },
                  { label: "Remplacement catalyseur", cost: "300 - 1 500 €" },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-white rounded-xl border border-slate-200/50">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xl font-black text-foreground mt-1">{item.cost}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Tarifs moyens constatés en garage indépendant — France 2025-2026.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Différence entre défaillance critique et majeure</h2>
              <p>
                La confusion entre ces deux niveaux est fréquente. Voici les différences essentielles :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-sm font-semibold text-foreground">
                  <span></span>
                  <span className="text-center">Majeure</span>
                  <span className="text-center">Critique</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200/50 text-sm">
                  <span className="font-medium text-foreground">Circulation</span>
                  <span className="text-center text-muted">Autorisée 2 mois</span>
                  <span className="text-center text-red-700 font-semibold">Interdite dès J+1</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200/50 text-sm">
                  <span className="font-medium text-foreground">Contre-visite</span>
                  <span className="text-center text-muted">Sous 2 mois</span>
                  <span className="text-center text-muted">Sous 2 mois</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200/50 text-sm">
                  <span className="font-medium text-foreground">Lettre sur le PV</span>
                  <span className="text-center text-muted">M</span>
                  <span className="text-center text-red-700 font-semibold">C</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200/50 text-sm">
                  <span className="font-medium text-foreground">Remorquage</span>
                  <span className="text-center text-muted">Non nécessaire</span>
                  <span className="text-center text-red-700 font-semibold">Souvent nécessaire</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Que faire si vous avez une défaillance critique ?</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "Rentrez chez vous ou allez directement au garage", text: "Vous avez jusqu'à minuit le jour du contrôle pour circuler. Profitez-en pour déposer le véhicule au garage le plus proche." },
                  { title: "Faites remorquer si nécessaire", text: "Si vous ne pouvez pas vous rendre au garage le jour même, organisez un remorquage. Certaines assurances auto incluent le dépannage." },
                  { title: "Demandez plusieurs devis", text: "Même en urgence, prenez le temps de comparer 2 à 3 devis. Les écarts de prix peuvent atteindre 40 % pour la même réparation." },
                  { title: "Vérifiez la couverture de votre assurance", text: "Certains contrats d'assistance couvrent le remorquage, même à domicile. Appelez votre assureur avant de payer un dépanneur." },
                  { title: "Passez la contre-visite dans les 2 mois", text: "Après réparation, passez la contre-visite dans n'importe quel centre agréé. Coût moyen : 15 à 30 euros." },
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Réparer ou vendre : le bon calcul</h2>
              <p>
                Face à une défaillance critique coûteuse, la question se pose : faut-il investir dans les réparations ou vendre le véhicule en l&apos;état ?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
                  <span className="text-lg">&#9989;</span>
                  <p className="text-sm"><strong>Réparations &lt; 30 % de la cote Argus</strong> — Réparez sans hésiter.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                  <span className="text-lg">&#9888;&#65039;</span>
                  <p className="text-sm"><strong>Réparations entre 30 % et 70 %</strong> — Analysez au cas par cas selon l&apos;état général du véhicule.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50">
                  <span className="text-lg">&#10060;</span>
                  <p className="text-sm"><strong>Réparations &gt; 70 % de la cote</strong> — La vente est probablement plus avantageuse.</p>
                </div>
              </div>
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
