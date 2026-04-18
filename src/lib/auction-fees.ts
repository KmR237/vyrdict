// Frais acheteur professionnel par plateforme d'enchères — 2025-2026
// Sources : CGV officielles Alcopa, BCA, VPAuto, Enchères VO, CapCar, Planète Auto

export interface AuctionFees {
  label: string;
  pct: number;        // % TTC du prix d'adjudication
  fixes: number;      // € fixes TTC par véhicule
  minFrais?: number;  // frais minimum si applicable
  note?: string;
}

export const AUCTION_SOURCES: Record<string, AuctionFees> = {
  "alcopa_ligne": {
    label: "Alcopa (en ligne)",
    pct: 0,
    fixes: 360,
    note: "300€ HT honoraires (360€ TTC) — vérifié bordereau",
  },
  "alcopa_en_ligne": {
    label: "Alcopa (en ligne)",
    pct: 0,
    fixes: 360,
    note: "300€ HT honoraires (360€ TTC) — vérifié bordereau",
  },
  "alcopa_salle": {
    label: "Alcopa (en salle)",
    pct: 0.144,
    fixes: 140,
    note: "Non vérifié — à confirmer avec un bordereau salle",
  },
  "bca": {
    label: "BCA",
    pct: 0.036,
    fixes: 0,
    minFrais: 350,
    note: "3% HT (3.6% TTC), min 350€",
  },
  "vpauto": {
    label: "VPAuto",
    pct: 0,
    fixes: 150,
    note: "Frais inclus dans le prix, 150€ de dossier",
  },
  "interencheres": {
    label: "Interenchères",
    pct: 0.10,
    fixes: 72,
    note: "Variable selon opérateur, ~10% estimé",
  },
  "encheres_vo": {
    label: "Enchères VO",
    pct: 0.12,
    fixes: 150,
  },
  "capcar": {
    label: "CapCar Pro",
    pct: 0.05,
    fixes: 100,
    minFrais: 499,
  },
  "planete_auto": {
    label: "Planète Auto Enchères",
    pct: 0.13,
    fixes: 99,
  },
  "particulier": {
    label: "Particulier",
    pct: 0,
    fixes: 0,
  },
  "mandataire": {
    label: "Mandataire",
    pct: 0,
    fixes: 0,
    note: "Frais à négocier",
  },
  "autre": {
    label: "Autre",
    pct: 0,
    fixes: 0,
  },
};

// Calcule les frais d'enchère pour un prix d'adjudication donné
export function calcAuctionFees(source: string, prixAdjudication: number, customPct?: number, customFixes?: number): number {
  const fees = AUCTION_SOURCES[source];
  if (!fees) return 0;

  const pct = customPct !== undefined ? customPct : fees.pct;
  const fixes = customFixes !== undefined ? customFixes : fees.fixes;

  const fraisPct = prixAdjudication * pct;
  const total = fraisPct + fixes;

  // Appliquer le minimum si défini
  if (fees.minFrais && total < fees.minFrais) return fees.minFrais;

  return Math.round(total);
}

// Calcule le prix d'adjudication max à partir d'un budget total
export function calcMaxAdjudication(budgetMax: number, source: string, customPct?: number, customFixes?: number): number {
  const fees = AUCTION_SOURCES[source];
  if (!fees || (fees.pct === 0 && fees.fixes === 0)) return budgetMax;

  const pct = customPct !== undefined ? customPct : fees.pct;
  const fixes = customFixes !== undefined ? customFixes : fees.fixes;

  // budget = adjudication + adjudication * pct + fixes
  // budget = adjudication * (1 + pct) + fixes
  // adjudication = (budget - fixes) / (1 + pct)
  const adjudication = Math.round((budgetMax - fixes) / (1 + pct));

  // Vérifier le minimum de frais
  if (fees.minFrais) {
    const fraisReels = calcAuctionFees(source, adjudication, customPct, customFixes);
    if (fraisReels > adjudication * pct + fixes) {
      // Le minimum s'applique
      return budgetMax - fees.minFrais;
    }
  }

  return Math.max(0, adjudication);
}
