import type { AnalyseResult } from "@/lib/types";

export function NextSteps({ result }: { result: AnalyseResult }) {
  const hasMajeures = result.defaillances.some((d) => d.gravite === "majeur" || d.gravite === "critique");
  const isVendre = result.verdict === "vendre";
  const codePostal = result.code_postal || "";
  const garageSearchUrl = codePostal
    ? `https://www.google.com/search?q=garage+automobile+indépendant+${codePostal}`
    : "https://www.google.com/search?q=garage+automobile+indépendant+près+de+chez+moi";

  if (isVendre) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200/50 p-5 animate-fade-up-delay-3">
        <h3 className="font-bold text-base text-foreground mb-3">Prochaine étape</h3>
        <p className="text-sm text-muted mb-4">Le coût des réparations dépasse la valeur estimée du véhicule.</p>
        <ol className="flex flex-col gap-2.5">
          <li className="flex items-start gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">1</span>
            <span>Estimez la cote de votre véhicule sur <a href="https://www.lacentrale.fr/cote-auto.html" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">LaCentrale</a></span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">2</span>
            <span>Comparez avec le coût total des réparations</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">3</span>
            <span>Envisagez la vente en l&apos;état ou pour pièces si le coût dépasse 75% de la cote</span>
          </li>
        </ol>
      </div>
    );
  }

  if (!hasMajeures) {
    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200/50 p-5 animate-fade-up-delay-3">
        <h3 className="font-bold text-base text-foreground mb-2">Bonne nouvelle !</h3>
        <p className="text-sm text-muted">
          Votre véhicule est en bon état. Les défaillances mineures ne bloquent pas la circulation.
          Surveillez ces points avant votre prochain CT dans 2 ans.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 rounded-2xl border border-teal-200/50 p-5 animate-fade-up-delay-3">
      <h3 className="font-bold text-base text-foreground mb-3">Prochaine étape</h3>
      {result.contre_visite_deadline && (
        <p className="text-sm text-amber-700 font-medium mb-3">
          Contre-visite avant le {result.contre_visite_deadline}
        </p>
      )}
      <ol className="flex flex-col gap-2.5">
        <li className="flex items-start gap-3 text-sm">
          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">1</span>
          <div>
            <span>Imprimez ce rapport pour votre garagiste</span>
            <button onClick={() => window.print()} className="ml-2 text-primary font-medium hover:underline cursor-pointer no-print">
              Imprimer &rarr;
            </button>
          </div>
        </li>
        <li className="flex items-start gap-3 text-sm">
          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">2</span>
          <div>
            <span>Demandez 2-3 devis aux garages proches</span>
            <a href={garageSearchUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary font-medium hover:underline">
              Trouver un garage &rarr;
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3 text-sm">
          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">3</span>
          <div>
            <span>Priorisez les réparations obligatoires</span>
            <a href="#budget" className="ml-2 text-primary font-medium hover:underline no-print">
              Simuler mon budget &darr;
            </a>
          </div>
        </li>
      </ol>
    </div>
  );
}
