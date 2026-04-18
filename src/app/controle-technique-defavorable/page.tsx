import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contrôle technique défavorable : peut-on rouler ? Que faire ? — Vyrdict",
  description:
    "Contrôle technique défavorable : peut-on rouler, quels délais pour la contre-visite, quelles démarches entreprendre et combien ça coûte. Guide complet 2026.",
  alternates: { canonical: "https://vyrdict.fr/controle-technique-defavorable" },
  openGraph: {
    title: "Contrôle technique défavorable : peut-on rouler ? Que faire ? — Vyrdict",
    description: "Contrôle technique défavorable : peut-on rouler, quels délais pour la contre-visite, quelles démarches entreprendre et combien ça coûte. Guide complet 2026.",
    url: "https://vyrdict.fr/controle-technique-defavorable",
    siteName: "Vyrdict",
    type: "article",
    locale: "fr_FR",
  },
};

export default function ControleDefavorable() {
  return (
    <div className="min-h-full flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Contrôle technique défavorable : peut-on rouler ? Que faire ? — Vyrdict",
        "description": "Contrôle technique défavorable : peut-on rouler, quels délais pour la contre-visite, quelles démarches entreprendre et combien ça coûte. Guide complet 2026.",
        "author": { "@type": "Organization", "name": "Vyrdict" },
        "publisher": { "@type": "Organization", "name": "Vyrdict", "url": "https://vyrdict.fr" },
        "datePublished": "2026-04-08",
        "dateModified": "2026-04-18",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vyrdict.fr/controle-technique-defavorable" }
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
            Contrôle technique défavorable : peut-on rouler ? Que faire ?
          </h1>
          <p className="mt-4 text-muted text-lg leading-relaxed">
            Résultat défavorable au contrôle technique ? Selon le type de défaillance, vous pouvez encore circuler ou non. Ce guide fait le point sur vos droits, vos obligations et les étapes à suivre pour régulariser votre situation rapidement.
          </p>

          <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-800">CT défavorable ?</p>
            <p className="text-sm text-amber-700/80 mt-1">Déposez votre procès-verbal sur Vyrdict pour obtenir une estimation des réparations et savoir quoi prioriser.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors">
              Estimer mes coûts de réparation &rarr;
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-10 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Que signifie un résultat défavorable ?</h2>
              <p>
                Un contrôle technique peut aboutir à trois résultats possibles :
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-emerald-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Favorable (A)</p>
                  <p className="text-sm text-muted mt-1">Aucune défaillance majeure ou critique. Le véhicule est conforme. Vous recevez une vignette valable 2 ans.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Défavorable pour défaillances majeures (S)</p>
                  <p className="text-sm text-muted mt-1">Au moins une défaillance majeure a été constatée. <strong>Vous pouvez encore circuler</strong> pendant 2 mois pour effectuer les réparations et passer la contre-visite.</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-red-400 bg-card border border-slate-200/50">
                  <p className="font-bold text-foreground">Défavorable pour défaillances critiques (R)</p>
                  <p className="text-sm text-muted mt-1">Au moins une défaillance critique. <strong>Interdiction de circuler dès le lendemain</strong> du contrôle. Le véhicule doit être remorqué vers un garage.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Peut-on rouler avec un CT défavorable ?</h2>
              <p>
                La réponse dépend du type de défaillance inscrit sur votre procès-verbal :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50 text-center">
                    <p className="text-sm font-semibold text-amber-800">Défaillances majeures</p>
                    <p className="text-2xl font-black text-foreground mt-2">Oui</p>
                    <p className="text-xs text-muted mt-1">Pendant 2 mois maximum</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200/50 text-center">
                    <p className="text-sm font-semibold text-red-800">Défaillances critiques</p>
                    <p className="text-2xl font-black text-foreground mt-2">Non</p>
                    <p className="text-xs text-muted mt-1">Interdit dès le lendemain</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200/50">
                <p className="text-sm font-semibold text-red-800">Attention :</p>
                <p className="text-sm text-red-700/80 mt-1">
                  Rouler avec un CT défavorable au-delà du délai autorisé (ou avec une défaillance critique) vous expose à une <strong>amende de 135 euros</strong> et à une immobilisation du véhicule par les forces de l&apos;ordre.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Quels délais respecter ?</h2>
              <p>
                Le procès-verbal indique la date limite pour passer la contre-visite. En pratique :
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { delai: "Jour du contrôle", action: "Vous pouvez circuler normalement, même en cas de défaillance critique." },
                  { delai: "J+1 (lendemain)", action: "En cas de défaillance critique, interdiction de circuler. Le véhicule doit être immobilisé ou remorqué." },
                  { delai: "2 mois après le CT", action: "Date limite pour passer la contre-visite (majeures et critiques)." },
                  { delai: "Au-delà de 2 mois", action: "La contre-visite n'est plus valable. Vous devrez repasser un CT complet (60 à 90 euros au lieu de 15 à 30 euros)." },
                ].map((item) => (
                  <div key={item.delai} className="flex gap-3 items-start py-2.5 px-4 bg-white rounded-xl border border-slate-200/50">
                    <span className="font-bold text-sm text-primary shrink-0 w-36">{item.delai}</span>
                    <span className="text-sm text-muted">{item.action}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Les étapes après un CT défavorable</h2>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  { title: "1. Lisez attentivement votre procès-verbal", text: "Identifiez chaque défaillance et son niveau de gravité (mineure, majeure, critique). Seules les majeures et critiques doivent être réparées pour la contre-visite." },
                  { title: "2. Demandez des devis de réparation", text: "Consultez 2 à 3 garages indépendants. Les écarts de prix sont importants : en moyenne 25 % de différence entre un garage indépendant et une concession." },
                  { title: "3. Priorisez les réparations obligatoires", text: "Concentrez-vous uniquement sur les défaillances majeures et critiques. Les mineures sont notées mais ne bloquent pas la contre-visite." },
                  { title: "4. Faites réparer dans les temps", text: "Ne dépassez pas le délai de 2 mois. Prenez rendez-vous au garage rapidement, surtout en période de forte affluence (printemps et automne)." },
                  { title: "5. Passez la contre-visite", text: "Rendez-vous dans n'importe quel centre agréé avec votre PV et les factures de réparation. Le contrôleur vérifiera uniquement les points défaillants." },
                ].map((step) => (
                  <li key={step.title} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{step.title}</span>
                      <p className="text-sm text-muted mt-0.5">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Combien coûte la régularisation ?</h2>
              <p>
                Le budget total dépend des défaillances constatées. Voici les fourchettes les plus courantes :
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200/50 text-center">
                  <p className="text-2xl font-black text-foreground">15 - 30 €</p>
                  <p className="text-xs text-muted mt-1">Contre-visite seule</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200/50 text-center">
                  <p className="text-2xl font-black text-foreground">100 - 800 €</p>
                  <p className="text-xs text-muted mt-1">Réparations courantes</p>
                </div>
              </div>
              <p className="mt-4">
                En France, le <strong>coût moyen des réparations</strong> suite à un contrôle technique défavorable se situe autour de <strong>300 à 400 euros</strong>. Mais les cas varient énormément : une simple ampoule grillée coûte 10 euros, un catalyseur peut dépasser 1 000 euros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Peut-on vendre un véhicule avec un CT défavorable ?</h2>
              <p>
                <strong>Non.</strong> Pour vendre un véhicule de plus de 4 ans, le contrôle technique doit être <strong>favorable et daté de moins de 6 mois</strong>. Un CT défavorable empêche la vente légale du véhicule.
              </p>
              <p className="mt-3">
                Deux options s&apos;offrent à vous :
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
                  <span className="text-lg">&#9989;</span>
                  <p className="text-sm"><strong>Réparer et repasser le CT</strong> — La solution la plus courante si la valeur du véhicule justifie les réparations.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                  <span className="text-lg">&#9888;&#65039;</span>
                  <p className="text-sm"><strong>Vendre à un professionnel</strong> — Les garagistes et marchands peuvent acheter sans CT valide, mais le prix sera fortement négocié à la baisse.</p>
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
