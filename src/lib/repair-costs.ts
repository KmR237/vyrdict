// Base de données statique des coûts de réparation courants CT
// Tarifs garage indépendant France 2025-2026 — VÉRIFIÉS
// Sources : Vroomly, iDGarages, AUTODOC, Oscaro, Autobutler, Re-FAP, iCarsoft
// Fourchette basse = citadine, haute = berline/SUV

export interface RepairCost {
  keywords: string[];
  label: string;
  cout_min: number;
  cout_max: number;
  peut_faire_soi_meme: boolean;
  source: string;
}

export const REPAIR_COSTS: RepairCost[] = [
  // ═══ FREINAGE ═══
  // Vroomly : 40-200€ fourniture + pose
  { keywords: ["plaquettes", "frein", "avant"], label: "Plaquettes de frein avant", cout_min: 40, cout_max: 200, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["plaquettes", "frein", "arrière"], label: "Plaquettes de frein arrière", cout_min: 40, cout_max: 200, peut_faire_soi_meme: true, source: "Vroomly" },
  // Vroomly : 60-345€ paire fourniture + pose
  { keywords: ["disque", "frein", "avant"], label: "Disques de frein avant (paire)", cout_min: 60, cout_max: 345, peut_faire_soi_meme: false, source: "Vroomly" },
  // iDGarages : 50-250€
  { keywords: ["disque", "frein", "arrière"], label: "Disques de frein arrière (paire)", cout_min: 50, cout_max: 250, peut_faire_soi_meme: false, source: "iDGarages" },
  // Vroomly : 60-220€
  { keywords: ["flexible", "frein"], label: "Flexible de frein", cout_min: 60, cout_max: 220, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["frein", "main", "parking"], label: "Frein à main / parking", cout_min: 80, cout_max: 200, peut_faire_soi_meme: false, source: "Vroomly" },
  // Vroomly/iDGarages : 60-150€
  { keywords: ["liquide", "frein"], label: "Liquide de frein (purge)", cout_min: 60, cout_max: 150, peut_faire_soi_meme: true, source: "Vroomly" },
  // Autobutler : 100-200€
  { keywords: ["étrier", "frein"], label: "Étrier de frein", cout_min: 100, cout_max: 200, peut_faire_soi_meme: false, source: "Autobutler" },

  // ═══ ÉCLAIRAGE ═══
  // Vroomly/Mister-Auto : 15-50€ (halogène H7)
  { keywords: ["ampoule", "phare", "feu"], label: "Remplacement ampoule", cout_min: 15, cout_max: 50, peut_faire_soi_meme: true, source: "Vroomly" },
  // Vroomly : 150-1000€+ (remplacement neuf)
  { keywords: ["phare", "optique", "avant"], label: "Optique de phare avant", cout_min: 150, cout_max: 1000, peut_faire_soi_meme: false, source: "Vroomly" },
  // Vroomly : 50-400€ pièce
  { keywords: ["feu", "arrière", "optique"], label: "Feu arrière", cout_min: 50, cout_max: 400, peut_faire_soi_meme: true, source: "Vroomly" },
  // Mondial Pare-Brise / Midas : 25-60€
  { keywords: ["réglage", "phare"], label: "Réglage des phares", cout_min: 25, cout_max: 60, peut_faire_soi_meme: false, source: "Mondial Pare-Brise" },
  { keywords: ["clignotant"], label: "Clignotant", cout_min: 15, cout_max: 80, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["antibrouillard"], label: "Feu antibrouillard", cout_min: 40, cout_max: 150, peut_faire_soi_meme: true, source: "Vroomly" },

  // ═══ PNEUS / ROUES ═══
  // Vroomly/Oscaro : citadine 45-150€, berline 80-300€
  { keywords: ["pneu", "usure", "usé"], label: "Pneu (unité, pose comprise)", cout_min: 45, cout_max: 300, peut_faire_soi_meme: false, source: "Vroomly" },
  // iDGarages : avant 45-90€, complet 80-180€
  { keywords: ["parallélisme", "géométrie"], label: "Géométrie / parallélisme", cout_min: 45, cout_max: 180, peut_faire_soi_meme: false, source: "iDGarages" },
  // Vroomly : 55-250€
  { keywords: ["roulement", "roue"], label: "Roulement de roue", cout_min: 55, cout_max: 250, peut_faire_soi_meme: false, source: "Vroomly" },
  // iDGarages : 300-600€
  { keywords: ["rotule", "direction"], label: "Rotule de direction", cout_min: 300, cout_max: 600, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ SUSPENSION ═══
  // AUTODOC : 250-400€ paire
  { keywords: ["amortisseur", "avant"], label: "Amortisseurs avant (paire)", cout_min: 250, cout_max: 400, peut_faire_soi_meme: false, source: "AUTODOC" },
  // AUTODOC : 200-350€ paire
  { keywords: ["amortisseur", "arrière"], label: "Amortisseurs arrière (paire)", cout_min: 200, cout_max: 350, peut_faire_soi_meme: false, source: "AUTODOC" },
  // iDGarages : 80-300€
  { keywords: ["silent", "bloc", "bras"], label: "Silent-bloc / bras de suspension", cout_min: 80, cout_max: 300, peut_faire_soi_meme: false, source: "iDGarages" },
  // AUTODOC : 150-500€
  { keywords: ["ressort", "suspension"], label: "Ressort de suspension", cout_min: 150, cout_max: 500, peut_faire_soi_meme: false, source: "AUTODOC" },
  // iDGarages : 30-250€
  { keywords: ["biellette", "barre", "stabilisatrice"], label: "Biellette de barre stabilisatrice", cout_min: 30, cout_max: 250, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["coupelle", "amortisseur"], label: "Coupelle d'amortisseur", cout_min: 40, cout_max: 70, peut_faire_soi_meme: false, source: "AUTODOC" },

  // ═══ DIRECTION ═══
  // iCarsoft : 500-1300€
  { keywords: ["crémaillère", "direction"], label: "Crémaillère de direction", cout_min: 500, cout_max: 1300, peut_faire_soi_meme: false, source: "iCarsoft" },
  // iDGarages : 80-250€
  { keywords: ["biellette", "direction"], label: "Biellette de direction", cout_min: 80, cout_max: 250, peut_faire_soi_meme: false, source: "iDGarages" },
  // AUTODOC : 120-310€
  { keywords: ["soufflet", "direction"], label: "Soufflet de crémaillère", cout_min: 120, cout_max: 310, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["jeu", "direction", "volant"], label: "Jeu dans la direction", cout_min: 100, cout_max: 400, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ ÉCHAPPEMENT / POLLUTION ═══
  // AUTODOC : 450-2000€
  { keywords: ["pot", "échappement", "catalyseur"], label: "Pot catalytique", cout_min: 450, cout_max: 2000, peut_faire_soi_meme: false, source: "AUTODOC" },
  // iDGarages : 199-300€
  { keywords: ["silencieux", "échappement"], label: "Silencieux d'échappement", cout_min: 199, cout_max: 300, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["ligne", "échappement"], label: "Ligne d'échappement", cout_min: 150, cout_max: 500, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["pollution", "fumée", "opacité"], label: "Réglage pollution / opacité", cout_min: 50, cout_max: 200, peut_faire_soi_meme: false, source: "iDGarages" },
  // AUTODOC : 150-450€
  { keywords: ["sonde", "lambda"], label: "Sonde lambda", cout_min: 150, cout_max: 450, peut_faire_soi_meme: false, source: "AUTODOC" },
  // Re-FAP : 99-400€ nettoyage, 1500-3500€ remplacement
  { keywords: ["fap", "filtre", "particules"], label: "Filtre à particules (nettoyage)", cout_min: 99, cout_max: 400, peut_faire_soi_meme: false, source: "Re-FAP" },
  // iDGarages : 200-600€
  { keywords: ["vanne", "egr"], label: "Vanne EGR (nettoyage/remplacement)", cout_min: 200, cout_max: 600, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ CARROSSERIE / STRUCTURE ═══
  // Info Véhicule : 150-300€ surface, 400-800€ soudure
  { keywords: ["corrosion", "rouille", "châssis"], label: "Traitement corrosion châssis", cout_min: 150, cout_max: 800, peut_faire_soi_meme: false, source: "Info Véhicule" },
  // Info Véhicule : sablage+apprêt+peinture 1500-1600€ TTC
  { keywords: ["corrosion", "rouille", "soubassement"], label: "Traitement corrosion soubassement", cout_min: 150, cout_max: 1600, peut_faire_soi_meme: false, source: "Info Véhicule" },
  // France Pare-Brise : impact 80-120€, remplacement 250-900€+
  { keywords: ["pare-brise", "fissure", "impact"], label: "Remplacement pare-brise", cout_min: 250, cout_max: 900, peut_faire_soi_meme: false, source: "France Pare-Brise" },
  { keywords: ["essuie-glace", "balai"], label: "Balais d'essuie-glace", cout_min: 15, cout_max: 50, peut_faire_soi_meme: true, source: "Oscaro" },
  // Autobutler : 50-500€ selon type
  { keywords: ["rétroviseur"], label: "Rétroviseur", cout_min: 50, cout_max: 500, peut_faire_soi_meme: true, source: "Autobutler" },

  // ═══ MOTEUR / TRANSMISSION ═══
  // iDGarages : moyenne 731€, fourchette 400-1200€
  { keywords: ["courroie", "distribution"], label: "Kit distribution", cout_min: 400, cout_max: 1200, peut_faire_soi_meme: false, source: "iDGarages" },
  // Oscaro : 40-200€
  { keywords: ["courroie", "accessoire"], label: "Courroie d'accessoires", cout_min: 40, cout_max: 200, peut_faire_soi_meme: false, source: "Oscaro" },
  { keywords: ["fuite", "huile", "moteur"], label: "Fuite d'huile moteur", cout_min: 100, cout_max: 400, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["fuite", "liquide", "refroidissement"], label: "Fuite liquide de refroidissement", cout_min: 80, cout_max: 300, peut_faire_soi_meme: false, source: "iDGarages" },
  // Vroomly : 50-450€
  { keywords: ["soufflet", "transmission", "cardan"], label: "Soufflet de cardan", cout_min: 50, cout_max: 450, peut_faire_soi_meme: false, source: "Vroomly" },
  // iDGarages : 250-900€
  { keywords: ["cardan"], label: "Cardan (transmission)", cout_min: 250, cout_max: 900, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["embrayage"], label: "Kit embrayage", cout_min: 400, cout_max: 900, peut_faire_soi_meme: false, source: "iDGarages" },
  // iDGarages : moyenne 359€, 200-900€
  { keywords: ["alternateur"], label: "Alternateur", cout_min: 200, cout_max: 900, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["démarreur"], label: "Démarreur", cout_min: 150, cout_max: 400, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["batterie"], label: "Batterie", cout_min: 80, cout_max: 200, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["bougie"], label: "Bougies d'allumage (jeu)", cout_min: 40, cout_max: 150, peut_faire_soi_meme: true, source: "Oscaro" },

  // ═══ SÉCURITÉ ═══
  // GPA26 : 150-300€ (pièce + pose)
  { keywords: ["ceinture", "sécurité"], label: "Ceinture de sécurité", cout_min: 150, cout_max: 300, peut_faire_soi_meme: false, source: "GPA26" },
  // Garages indépendants : diag 50-80€, réinitialisation 100-180€
  { keywords: ["airbag", "voyant", "srs"], label: "Diagnostic/réparation airbag", cout_min: 50, cout_max: 300, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["klaxon", "avertisseur"], label: "Avertisseur sonore", cout_min: 20, cout_max: 80, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["triangle", "gilet"], label: "Triangle + gilet (équipement)", cout_min: 10, cout_max: 30, peut_faire_soi_meme: true, source: "Oscaro" },

  // ═══ DIVERS ═══
  { keywords: ["plaque", "immatriculation", "lisibilité"], label: "Plaque d'immatriculation", cout_min: 15, cout_max: 40, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["jeu", "rotule", "suspension"], label: "Rotule de suspension", cout_min: 100, cout_max: 300, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["moyeu", "roue"], label: "Moyeu de roue", cout_min: 150, cout_max: 350, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["voyant", "tableau", "bord", "abs", "esp"], label: "Diagnostic voyant tableau de bord", cout_min: 40, cout_max: 100, peut_faire_soi_meme: false, source: "iDGarages" },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[ûù]/g, "u")
    .replace(/[ôö]/g, "o")
    .replace(/[îï]/g, "i")
    .replace(/ç/g, "c");
}

export function findRepairCost(libelle: string): RepairCost | null {
  const normalized = normalize(libelle);

  const scored = REPAIR_COSTS.map((repair) => {
    const matchCount = repair.keywords.filter((kw) => normalized.includes(normalize(kw))).length;
    return {
      repair,
      score: matchCount > 0 ? matchCount / repair.keywords.length : 0,
      matchCount,
    };
  });

  const best = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.matchCount - a.matchCount)[0];

  return best?.repair ?? null;
}
