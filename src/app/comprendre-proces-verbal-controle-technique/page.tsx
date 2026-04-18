import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comment lire et comprendre votre procès-verbal de contrôle technique — Vyrdict",
  description:
    "Guide complet pour comprendre votre procès-verbal (PV) de contrôle technique : structure du document, codes de défaillance, niveaux de gravité et signification de chaque rubrique.",
  alternates: { canonical: "https://vyrdict.fr/comprendre-proces-verbal-controle-technique" },
  openGraph: {
    title: "Comment lire et comprendre votre procès-verbal de contrôle technique — Vyrdict",
    description: "Guide complet pour comprendre votre procès-verbal (PV) de contrôle technique : structure du document, codes de défaillance, niveaux de gravité et signification de chaque rubrique.",
    url: "https://vyrdict.fr/comprendre-proces-verbal-controle-technique",
    siteName: "Vyrdict",
    type: "article",
    locale: "fr_FR",
  },
};

export default function ComprendrePV() {
  return (
    <div className="min-h-full flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Comment lire et comprendre votre procès-verbal de contrôle technique — Vyrdict",
        "description": "Guide complet pour comprendre votre procès-verbal (PV) de contrôle technique : structure du document, codes de défaillance, niveaux de gravité et signification de chaque rubrique.",
        "author": { "@type": "Organization", "name": "Vyrdict" },
        "publisher": { "@type": "Organization", "name": "Vyrdict", "url": "https://vyrdict.fr" },
        "datePublished": "2026-04-08",
        "dateModified": "2026-04-18",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vyrdict.fr/comprendre-proces-verbal-controle-technique" }
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
            Comment lire et comprendre votre procès-verbal de contrôle technique
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Le procès-verbal de contrôle technique est un document officiel souvent difficile à déchiffrer. Codes alphanumériques, niveaux de gravité, résultat global : ce guide vous explique chaque rubrique pour que vous compreniez exactement l&apos;état de votre véhicule.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">Pas envie de décrypter votre PV ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict : notre IA le lit pour vous et vous donne un résumé clair avec les coûts de réparation.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Analyser mon PV gratuitement &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Structure générale du procès-verbal</h2>
              <p>
                Le procès-verbal (PV) de contrôle technique est un document réglementé. Sa structure est identique quel que soit le centre de contrôle. Il comporte plusieurs zones distinctes :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { zone: "En-tête", contenu: "Identification du centre de contrôle, numéro d'agrément, coordonnées, date et heure du contrôle." },
                  { zone: "Véhicule", contenu: "Immatriculation, marque, modèle, numéro de série (VIN), date de première mise en circulation, kilométrage." },
                  { zone: "Résultat global", contenu: "Favorable (A), défavorable pour défaillances majeures (S) ou défavorable pour défaillances critiques (R)." },
                  { zone: "Liste des points contrôlés", contenu: "133 points regroupés en 9 fonctions, avec le résultat pour chaque point." },
                  { zone: "Défaillances constatées", contenu: "Détail de chaque défaut avec son code, sa description et son niveau de gravité." },
                  { zone: "Informations complémentaires", contenu: "Observations du contrôleur, date limite de contre-visite, cachet et signature." },
                ].map((item) => (
                  <div key={item.zone} className="flex gap-3 items-start py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-bold text-sm text-primary shrink-0 w-28">{item.zone}</span>
                    <span className="text-sm text-muted">{item.contenu}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les 9 fonctions du contrôle technique</h2>
              <p>
                Les <strong>133 points de contrôle</strong> sont répartis en 9 grandes fonctions. Chaque fonction regroupe des éléments mécaniques ou de sécurité liés entre eux :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { num: "0", fonction: "Identification du véhicule", points: "Plaque, VIN, énergie, genre" },
                  { num: "1", fonction: "Freinage", points: "Disques, plaquettes, flexibles, frein à main, ABS" },
                  { num: "2", fonction: "Direction", points: "Volant, crémaillère, biellettes, colonne" },
                  { num: "3", fonction: "Visibilité", points: "Pare-brise, rétroviseurs, essuie-glace" },
                  { num: "4", fonction: "Éclairage et signalisation", points: "Phares, feux, clignotants, feux stop" },
                  { num: "5", fonction: "Liaison au sol", points: "Pneus, amortisseurs, ressorts, roulements" },
                  { num: "6", fonction: "Structure et carrosserie", points: "Châssis, soubassement, corrosion, portières" },
                  { num: "7", fonction: "Équipements", points: "Klaxon, ceintures, siège conducteur, antivol" },
                  { num: "8", fonction: "Organes mécaniques", points: "Moteur, transmission, échappement" },
                  { num: "9", fonction: "Pollution et bruit", points: "Émissions, opacité, niveau sonore" },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-3 py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 font-bold text-sm text-primary">{item.num}</span>
                    <div>
                      <span className="font-semibold text-sm text-foreground">{item.fonction}</span>
                      <p className="text-xs text-muted mt-0.5">{item.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Comprendre les codes de défaillance</h2>
              <p>
                Chaque défaillance est identifiée par un <strong>code alphanumérique</strong> qui suit un format précis. Par exemple, le code <strong>1.1.13.2</strong> signifie :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-3 items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                  <span className="font-mono font-bold text-primary text-lg">1</span>
                  <span className="text-sm text-muted">Fonction (ici : Freinage)</span>
                </div>
                <div className="flex gap-3 items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                  <span className="font-mono font-bold text-primary text-lg">1.1</span>
                  <span className="text-sm text-muted">Sous-fonction (ici : État et fonctionnement)</span>
                </div>
                <div className="flex gap-3 items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                  <span className="font-mono font-bold text-primary text-lg">1.1.13</span>
                  <span className="text-sm text-muted">Point de contrôle (ici : Disque de frein)</span>
                </div>
                <div className="flex gap-3 items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                  <span className="font-mono font-bold text-primary text-lg">1.1.13.2</span>
                  <span className="text-sm text-muted">Défaillance précise (ici : Disque usé au-delà du minimum)</span>
                </div>
              </div>
              <p className="mt-3">
                Ce système de codification est normalisé au niveau européen. Tous les centres utilisent les mêmes codes, ce qui permet une lecture uniforme du PV.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les trois niveaux de gravité</h2>
              <p>
                Chaque défaillance est classée selon son impact sur la sécurité et l&apos;environnement :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-stone-300 bg-card border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded text-sm">m</span>
                    <p className="font-bold text-foreground">Défaillance mineure</p>
                  </div>
                  <p className="text-sm text-muted mt-1">Défaut sans impact significatif sur la sécurité. <strong>Le CT reste favorable.</strong> La réparation est recommandée mais pas obligatoire pour la validité du contrôle.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-sm">M</span>
                    <p className="font-bold text-foreground">Défaillance majeure</p>
                  </div>
                  <p className="text-sm text-muted mt-1">Défaut compromettant la sécurité ou impactant l&apos;environnement. <strong>CT défavorable, contre-visite obligatoire sous 2 mois.</strong> Le véhicule peut encore circuler.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-sm">C</span>
                    <p className="font-bold text-foreground">Défaillance critique</p>
                  </div>
                  <p className="text-sm text-muted mt-1">Danger direct et immédiat. <strong>CT défavorable, interdiction de circuler dès le lendemain.</strong> Le véhicule doit être immobilisé ou remorqué.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Le résultat global : A, S ou R</h2>
              <p>
                Le résultat global de votre contrôle technique est résumé par une lettre bien visible sur le PV :
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/50 text-center">
                  <p className="text-3xl font-black text-emerald-700">A</p>
                  <p className="text-xs text-muted mt-1 font-semibold">Favorable</p>
                  <p className="text-[11px] text-muted mt-1">Aucune défaillance majeure ou critique</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50 text-center">
                  <p className="text-3xl font-black text-amber-700">S</p>
                  <p className="text-xs text-muted mt-1 font-semibold">Défavorable</p>
                  <p className="text-[11px] text-muted mt-1">Défaillance(s) majeure(s)</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200/50 text-center">
                  <p className="text-3xl font-black text-red-700">R</p>
                  <p className="text-xs text-muted mt-1 font-semibold">Refusé</p>
                  <p className="text-[11px] text-muted mt-1">Défaillance(s) critique(s)</p>
                </div>
              </div>
              <p className="mt-4">
                La lettre <strong>S</strong> vient de &laquo; soumis à contre-visite &raquo;. La lettre <strong>R</strong> signifie &laquo; refusé &raquo; avec interdiction de circuler. Certains PV anciens utilisaient les lettres <strong>F</strong> (favorable) et <strong>D</strong> (défavorable).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">La vignette et la date de validité</h2>
              <p>
                En cas de résultat favorable, une <strong>vignette</strong> est apposée sur le pare-brise (coin supérieur droit). Elle indique la date limite du prochain contrôle technique, soit <strong>2 ans</strong> après la date du contrôle.
              </p>
              <p className="mt-3">
                En cas de résultat défavorable, la vignette porte un <strong>timbre perforé</strong> avec la lettre <strong>S</strong> ou <strong>R</strong>. La date limite de contre-visite (2 mois) est inscrite sur le PV.
              </p>
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200/50">
                <p className="text-sm font-semibold text-foreground">Bon à savoir</p>
                <p className="text-sm text-muted mt-1">
                  Le procès-verbal doit être conservé dans le véhicule et présenté aux forces de l&apos;ordre en cas de contrôle routier. Il est également exigé lors de la vente du véhicule.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Conseils pour exploiter votre PV</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "Identifiez les défaillances bloquantes", text: "Concentrez-vous sur les « M » et « C ». Les défaillances mineures (« m ») ne bloquent pas la contre-visite." },
                  { title: "Notez les codes pour comparer les devis", text: "Communiquez les codes exacts aux garages pour obtenir des devis précis et comparables." },
                  { title: "Vérifiez la cohérence du kilométrage", text: "Le PV enregistre le kilométrage. En cas d'achat, comparez avec les PV précédents pour détecter un éventuel « compteur trafiqué »." },
                  { title: "Conservez tous vos PV", text: "L'historique des contrôles techniques constitue le « carnet de santé » du véhicule et valorise sa revente." },
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
          </div>

          <div className="mt-12 p-6 bg-teal-50 rounded-2xl border border-teal-200/50 text-center">
            <h2 className="font-bold text-xl text-foreground">Votre PV décrypté en quelques secondes</h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Déposez votre procès-verbal de contrôle technique et notre IA vous donne un résumé clair : défaillances, priorités et coûts de réparation estimés.
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
