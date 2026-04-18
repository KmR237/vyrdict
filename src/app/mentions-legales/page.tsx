import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales et politique de confidentialité — Vyrdict",
  description: "Mentions légales, politique de confidentialité et conditions d'utilisation de Vyrdict, l'analyseur de contrôle technique automobile en ligne. Aucune donnée personnelle collectée.",
};

export default function MentionsLegales() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Vyrdict</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Mentions légales</h1>

        <div className="flex flex-col gap-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Éditeur du site</h2>
            <p>
              Vyrdict est un outil en ligne d&apos;analyse de contrôle technique automobile par intelligence artificielle.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Hébergement</h2>
            <p>
              Ce site est hébergé par Vercel Inc., 440 N Baxter St, Coppell, TX 75019, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Nature du service</h2>
            <p>
              Vyrdict fournit des estimations indicatives des coûts de réparation basées sur une analyse automatisée par intelligence artificielle. Ces estimations ne constituent en aucun cas un devis, un diagnostic professionnel ou un engagement contractuel.
            </p>
            <p className="mt-2">
              Les tarifs affichés sont des moyennes constatées auprès de garages indépendants en France. Les coûts réels peuvent varier selon le véhicule, la région et le garage choisi.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Données personnelles</h2>
            <p>
              Vyrdict ne collecte aucune donnée personnelle. Aucun compte utilisateur n&apos;est requis.
            </p>
            <p className="mt-2">
              Les documents déposés (photos ou PDF de contrôle technique) sont envoyés à un service d&apos;intelligence artificielle tiers (Anthropic Claude) pour analyse, puis immédiatement supprimés. Aucun document n&apos;est stocké sur nos serveurs.
            </p>
            <p className="mt-2">
              Aucun cookie de tracking n&apos;est utilisé. Seuls des compteurs anonymes (nombre d&apos;analyses effectuées) peuvent être collectés à des fins statistiques.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Limitation de responsabilité</h2>
            <p>
              L&apos;éditeur ne saurait être tenu responsable de toute décision prise sur la base des estimations fournies par Vyrdict. Il est recommandé de demander plusieurs devis professionnels avant toute intervention mécanique.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Propriété intellectuelle</h2>
            <p>
              Le nom &quot;Vyrdict&quot;, le logo et le design du site sont la propriété de l&apos;éditeur. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Transfert de données</h2>
            <p>
              Les documents déposés (photos/PDF de contrôle technique) sont transmis à l&apos;API Anthropic (Claude) pour analyse. Aucun document n&apos;est stocké après traitement. Anthropic ne conserve pas les données transmises via l&apos;API. Voir la{" "}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">politique de confidentialité d&apos;Anthropic</a>.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Conditions d&apos;utilisation</h2>
            <p>
              L&apos;utilisation de Vyrdict est gratuite et sans inscription. Les estimations de coûts sont fournies à titre indicatif et ne constituent pas un devis professionnel. Vyrdict ne peut être tenu responsable des décisions prises sur la base de ces estimations.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Contact</h2>
            <p>
              Pour toute question : <a href="mailto:contact@vyrdict.fr" className="text-primary hover:underline">contact@vyrdict.fr</a>
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-foreground mb-2">Droit applicable</h2>
            <p>
              Le présent site est soumis au droit français. Tout litige sera soumis aux tribunaux compétents de Dax.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Link href="/" className="text-xs text-primary hover:underline">
            &larr; Retour à l&apos;accueil
          </Link>
        </div>
      </footer>
    </div>
  );
}
