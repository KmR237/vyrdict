// Base de données des coûts de réparation — SEGMENT CITADINE (base)
// Les coefficients véhicule (price-coefficients.ts) ajustent pour berline/SUV/premium
// Fourchettes resserrées par rapport à la V1 (citadine uniquement)
// Sources : Vroomly, iDGarages, AUTODOC — 2025-2026

export interface RepairCost {
  keywords: string[];
  label: string;
  cout_min: number;
  cout_max: number;
  cout_piece_min: number;
  cout_piece_max: number;
  cout_mo_min: number;
  cout_mo_max: number;
  peut_faire_soi_meme: boolean;
  source: string;
}

export const REPAIR_COSTS: RepairCost[] = [
  // ═══ FREINAGE ═══
  { keywords: ["plaquettes", "frein", "avant"], label: "Plaquettes de frein avant", cout_min: 40, cout_max: 120, cout_piece_min: 15, cout_piece_max: 50, cout_mo_min: 25, cout_mo_max: 70, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["plaquettes", "frein", "arrière"], label: "Plaquettes de frein arrière", cout_min: 40, cout_max: 110, cout_piece_min: 15, cout_piece_max: 45, cout_mo_min: 25, cout_mo_max: 65, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["disque", "frein", "avant"], label: "Disques de frein avant (paire)", cout_min: 60, cout_max: 180, cout_piece_min: 30, cout_piece_max: 100, cout_mo_min: 30, cout_mo_max: 80, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["disque", "frein", "arrière"], label: "Disques de frein arrière (paire)", cout_min: 50, cout_max: 150, cout_piece_min: 25, cout_piece_max: 80, cout_mo_min: 25, cout_mo_max: 70, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["flexible", "frein"], label: "Flexible de frein", cout_min: 60, cout_max: 140, cout_piece_min: 15, cout_piece_max: 40, cout_mo_min: 45, cout_mo_max: 100, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["frein", "main", "parking"], label: "Frein à main / parking", cout_min: 80, cout_max: 150, cout_piece_min: 20, cout_piece_max: 50, cout_mo_min: 60, cout_mo_max: 100, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["liquide", "frein"], label: "Liquide de frein (purge)", cout_min: 60, cout_max: 100, cout_piece_min: 10, cout_piece_max: 20, cout_mo_min: 50, cout_mo_max: 80, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["étrier", "frein"], label: "Étrier de frein", cout_min: 100, cout_max: 180, cout_piece_min: 40, cout_piece_max: 100, cout_mo_min: 60, cout_mo_max: 80, peut_faire_soi_meme: false, source: "Autobutler" },

  // ═══ ÉCLAIRAGE ═══
  { keywords: ["ampoule", "phare", "feu"], label: "Remplacement ampoule", cout_min: 15, cout_max: 40, cout_piece_min: 5, cout_piece_max: 20, cout_mo_min: 10, cout_mo_max: 20, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["phare", "optique", "avant"], label: "Optique de phare avant", cout_min: 150, cout_max: 400, cout_piece_min: 80, cout_piece_max: 300, cout_mo_min: 50, cout_mo_max: 100, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["feu", "arrière", "optique"], label: "Feu arrière", cout_min: 50, cout_max: 150, cout_piece_min: 30, cout_piece_max: 100, cout_mo_min: 20, cout_mo_max: 50, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["réglage", "phare"], label: "Réglage des phares", cout_min: 25, cout_max: 50, cout_piece_min: 0, cout_piece_max: 0, cout_mo_min: 25, cout_mo_max: 50, peut_faire_soi_meme: false, source: "Mondial Pare-Brise" },
  { keywords: ["clignotant"], label: "Clignotant", cout_min: 15, cout_max: 60, cout_piece_min: 5, cout_piece_max: 30, cout_mo_min: 10, cout_mo_max: 30, peut_faire_soi_meme: true, source: "Vroomly" },
  { keywords: ["antibrouillard"], label: "Feu antibrouillard", cout_min: 40, cout_max: 100, cout_piece_min: 20, cout_piece_max: 60, cout_mo_min: 20, cout_mo_max: 40, peut_faire_soi_meme: true, source: "Vroomly" },

  // ═══ PNEUS / ROUES ═══
  { keywords: ["pneu", "usure", "usé"], label: "Pneu (unité, pose comprise)", cout_min: 45, cout_max: 120, cout_piece_min: 30, cout_piece_max: 100, cout_mo_min: 15, cout_mo_max: 20, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["parallélisme", "géométrie"], label: "Géométrie / parallélisme", cout_min: 45, cout_max: 90, cout_piece_min: 0, cout_piece_max: 0, cout_mo_min: 45, cout_mo_max: 90, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["roulement", "roue"], label: "Roulement de roue", cout_min: 55, cout_max: 150, cout_piece_min: 15, cout_piece_max: 50, cout_mo_min: 40, cout_mo_max: 100, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["rotule", "direction"], label: "Rotule de direction", cout_min: 100, cout_max: 250, cout_piece_min: 10, cout_piece_max: 50, cout_mo_min: 90, cout_mo_max: 200, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ SUSPENSION ═══
  { keywords: ["amortisseur", "avant"], label: "Amortisseurs avant (paire)", cout_min: 200, cout_max: 350, cout_piece_min: 80, cout_piece_max: 180, cout_mo_min: 120, cout_mo_max: 170, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["amortisseur", "arrière"], label: "Amortisseurs arrière (paire)", cout_min: 180, cout_max: 300, cout_piece_min: 60, cout_piece_max: 150, cout_mo_min: 120, cout_mo_max: 150, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["silent", "bloc", "bras"], label: "Silent-bloc / bras de suspension", cout_min: 80, cout_max: 200, cout_piece_min: 20, cout_piece_max: 80, cout_mo_min: 60, cout_mo_max: 120, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["ressort", "suspension"], label: "Ressort de suspension", cout_min: 120, cout_max: 250, cout_piece_min: 30, cout_piece_max: 80, cout_mo_min: 90, cout_mo_max: 170, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["biellette", "barre", "stabilisatrice"], label: "Biellette de barre stabilisatrice", cout_min: 30, cout_max: 100, cout_piece_min: 10, cout_piece_max: 30, cout_mo_min: 20, cout_mo_max: 70, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["coupelle", "amortisseur"], label: "Coupelle d'amortisseur", cout_min: 40, cout_max: 70, cout_piece_min: 15, cout_piece_max: 30, cout_mo_min: 25, cout_mo_max: 40, peut_faire_soi_meme: false, source: "AUTODOC" },

  // ═══ DIRECTION ═══
  { keywords: ["crémaillère", "direction"], label: "Crémaillère de direction", cout_min: 400, cout_max: 800, cout_piece_min: 200, cout_piece_max: 500, cout_mo_min: 200, cout_mo_max: 300, peut_faire_soi_meme: false, source: "iCarsoft" },
  { keywords: ["biellette", "direction"], label: "Biellette de direction", cout_min: 80, cout_max: 180, cout_piece_min: 15, cout_piece_max: 50, cout_mo_min: 65, cout_mo_max: 130, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["soufflet", "direction"], label: "Soufflet de crémaillère", cout_min: 100, cout_max: 200, cout_piece_min: 10, cout_piece_max: 30, cout_mo_min: 90, cout_mo_max: 170, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["jeu", "direction", "volant"], label: "Jeu dans la direction", cout_min: 100, cout_max: 250, cout_piece_min: 20, cout_piece_max: 80, cout_mo_min: 80, cout_mo_max: 170, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ ÉCHAPPEMENT / POLLUTION ═══
  { keywords: ["pot", "échappement", "catalyseur"], label: "Pot catalytique", cout_min: 300, cout_max: 700, cout_piece_min: 200, cout_piece_max: 500, cout_mo_min: 100, cout_mo_max: 200, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["silencieux", "échappement"], label: "Silencieux d'échappement", cout_min: 150, cout_max: 280, cout_piece_min: 60, cout_piece_max: 150, cout_mo_min: 90, cout_mo_max: 130, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["ligne", "échappement"], label: "Ligne d'échappement", cout_min: 120, cout_max: 300, cout_piece_min: 50, cout_piece_max: 150, cout_mo_min: 70, cout_mo_max: 150, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["pollution", "fumée", "opacité"], label: "Réglage pollution / opacité", cout_min: 50, cout_max: 120, cout_piece_min: 0, cout_piece_max: 20, cout_mo_min: 50, cout_mo_max: 100, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["sonde", "lambda"], label: "Sonde lambda", cout_min: 100, cout_max: 250, cout_piece_min: 40, cout_piece_max: 150, cout_mo_min: 60, cout_mo_max: 100, peut_faire_soi_meme: false, source: "AUTODOC" },
  { keywords: ["fap", "filtre", "particules"], label: "Filtre à particules (nettoyage)", cout_min: 99, cout_max: 250, cout_piece_min: 20, cout_piece_max: 50, cout_mo_min: 79, cout_mo_max: 200, peut_faire_soi_meme: false, source: "Re-FAP" },
  { keywords: ["vanne", "egr"], label: "Vanne EGR (nettoyage/remplacement)", cout_min: 150, cout_max: 350, cout_piece_min: 50, cout_piece_max: 200, cout_mo_min: 100, cout_mo_max: 150, peut_faire_soi_meme: false, source: "iDGarages" },

  // ═══ CARROSSERIE / STRUCTURE ═══
  { keywords: ["corrosion", "rouille", "châssis"], label: "Traitement corrosion châssis", cout_min: 150, cout_max: 400, cout_piece_min: 30, cout_piece_max: 80, cout_mo_min: 120, cout_mo_max: 320, peut_faire_soi_meme: false, source: "Info Véhicule" },
  { keywords: ["corrosion", "rouille", "soubassement"], label: "Traitement corrosion soubassement", cout_min: 150, cout_max: 500, cout_piece_min: 30, cout_piece_max: 100, cout_mo_min: 120, cout_mo_max: 400, peut_faire_soi_meme: false, source: "Info Véhicule" },
  { keywords: ["pare-brise", "fissure", "impact"], label: "Remplacement pare-brise", cout_min: 250, cout_max: 500, cout_piece_min: 150, cout_piece_max: 350, cout_mo_min: 80, cout_mo_max: 150, peut_faire_soi_meme: false, source: "France Pare-Brise" },
  { keywords: ["essuie-glace", "balai"], label: "Balais d'essuie-glace", cout_min: 15, cout_max: 40, cout_piece_min: 10, cout_piece_max: 30, cout_mo_min: 5, cout_mo_max: 10, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["rétroviseur"], label: "Rétroviseur", cout_min: 50, cout_max: 200, cout_piece_min: 30, cout_piece_max: 150, cout_mo_min: 20, cout_mo_max: 50, peut_faire_soi_meme: true, source: "Autobutler" },

  // ═══ MOTEUR / TRANSMISSION ═══
  { keywords: ["courroie", "distribution"], label: "Kit distribution", cout_min: 400, cout_max: 700, cout_piece_min: 100, cout_piece_max: 250, cout_mo_min: 300, cout_mo_max: 450, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["courroie", "accessoire"], label: "Courroie d'accessoires", cout_min: 40, cout_max: 120, cout_piece_min: 15, cout_piece_max: 40, cout_mo_min: 25, cout_mo_max: 80, peut_faire_soi_meme: false, source: "Oscaro" },
  { keywords: ["fuite", "huile", "moteur"], label: "Fuite d'huile moteur", cout_min: 100, cout_max: 250, cout_piece_min: 20, cout_piece_max: 60, cout_mo_min: 80, cout_mo_max: 190, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["fuite", "liquide", "refroidissement"], label: "Fuite liquide de refroidissement", cout_min: 80, cout_max: 200, cout_piece_min: 10, cout_piece_max: 50, cout_mo_min: 70, cout_mo_max: 150, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["soufflet", "transmission", "cardan"], label: "Soufflet de cardan", cout_min: 50, cout_max: 200, cout_piece_min: 10, cout_piece_max: 40, cout_mo_min: 40, cout_mo_max: 160, peut_faire_soi_meme: false, source: "Vroomly" },
  { keywords: ["cardan"], label: "Cardan (transmission)", cout_min: 200, cout_max: 450, cout_piece_min: 80, cout_piece_max: 200, cout_mo_min: 120, cout_mo_max: 250, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["embrayage"], label: "Kit embrayage", cout_min: 400, cout_max: 700, cout_piece_min: 150, cout_piece_max: 300, cout_mo_min: 250, cout_mo_max: 400, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["alternateur"], label: "Alternateur", cout_min: 200, cout_max: 450, cout_piece_min: 100, cout_piece_max: 250, cout_mo_min: 100, cout_mo_max: 200, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["démarreur"], label: "Démarreur", cout_min: 150, cout_max: 300, cout_piece_min: 80, cout_piece_max: 180, cout_mo_min: 70, cout_mo_max: 120, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["batterie"], label: "Batterie", cout_min: 80, cout_max: 160, cout_piece_min: 60, cout_piece_max: 140, cout_mo_min: 10, cout_mo_max: 20, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["bougie"], label: "Bougies d'allumage (jeu)", cout_min: 40, cout_max: 100, cout_piece_min: 20, cout_piece_max: 60, cout_mo_min: 20, cout_mo_max: 40, peut_faire_soi_meme: true, source: "Oscaro" },

  // ═══ SÉCURITÉ ═══
  { keywords: ["ceinture", "sécurité"], label: "Ceinture de sécurité", cout_min: 150, cout_max: 260, cout_piece_min: 80, cout_piece_max: 150, cout_mo_min: 70, cout_mo_max: 110, peut_faire_soi_meme: false, source: "GPA26" },
  { keywords: ["airbag", "voyant", "srs"], label: "Diagnostic/réparation airbag", cout_min: 50, cout_max: 180, cout_piece_min: 0, cout_piece_max: 80, cout_mo_min: 50, cout_mo_max: 100, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["klaxon", "avertisseur"], label: "Avertisseur sonore", cout_min: 20, cout_max: 60, cout_piece_min: 10, cout_piece_max: 30, cout_mo_min: 10, cout_mo_max: 30, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["triangle", "gilet"], label: "Triangle + gilet (équipement)", cout_min: 10, cout_max: 25, cout_piece_min: 10, cout_piece_max: 25, cout_mo_min: 0, cout_mo_max: 0, peut_faire_soi_meme: true, source: "Oscaro" },

  // ═══ DIVERS ═══
  { keywords: ["plaque", "immatriculation", "lisibilité"], label: "Plaque d'immatriculation", cout_min: 15, cout_max: 35, cout_piece_min: 10, cout_piece_max: 25, cout_mo_min: 5, cout_mo_max: 10, peut_faire_soi_meme: true, source: "Oscaro" },
  { keywords: ["jeu", "rotule", "suspension"], label: "Rotule de suspension", cout_min: 80, cout_max: 200, cout_piece_min: 10, cout_piece_max: 50, cout_mo_min: 70, cout_mo_max: 150, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["moyeu", "roue"], label: "Moyeu de roue", cout_min: 120, cout_max: 250, cout_piece_min: 40, cout_piece_max: 100, cout_mo_min: 80, cout_mo_max: 150, peut_faire_soi_meme: false, source: "iDGarages" },
  { keywords: ["voyant", "tableau", "bord", "abs", "esp"], label: "Diagnostic voyant tableau de bord", cout_min: 40, cout_max: 80, cout_piece_min: 0, cout_piece_max: 0, cout_mo_min: 40, cout_mo_max: 80, peut_faire_soi_meme: false, source: "iDGarages" },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[ûù]/g, "u").replace(/[ôö]/g, "o").replace(/[îï]/g, "i").replace(/ç/g, "c");
}

export function findRepairCost(libelle: string): RepairCost | null {
  const normalized = normalize(libelle);
  const scored = REPAIR_COSTS.map((repair) => {
    const matchCount = repair.keywords.filter((kw) => normalized.includes(normalize(kw))).length;
    return { repair, score: matchCount > 0 ? matchCount / repair.keywords.length : 0, matchCount };
  });
  const best = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || b.matchCount - a.matchCount)[0];
  return best?.repair ?? null;
}

// Génère le référentiel de prix pour le prompt Claude (avec pièce/MO)
export function buildPriceReference(): string {
  return REPAIR_COSTS.map((r) => {
    const mo = r.cout_mo_max > 0 ? ` (pièce: ${r.cout_piece_min}-${r.cout_piece_max}€, main-d'œuvre: ${r.cout_mo_min}-${r.cout_mo_max}€)` : "";
    return `- ${r.label} : ${r.cout_min}-${r.cout_max}€${mo}`;
  }).join("\n");
}
