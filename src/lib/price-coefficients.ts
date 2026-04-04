// Coefficients régionaux par préfixe de département
// Source : baromètre iDGarages 2025, écarts régionaux constatés
const REGION_COEFFICIENTS: Record<string, number> = {
  // Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)
  "75": 1.30, "77": 1.15, "78": 1.20, "91": 1.15, "92": 1.25, "93": 1.20, "94": 1.20, "95": 1.15,
  // PACA
  "13": 1.15, "06": 1.20, "83": 1.10, "84": 1.05,
  // Rhône-Alpes
  "69": 1.15, "38": 1.10, "73": 1.05, "74": 1.10,
  // Grandes villes
  "31": 1.10, "33": 1.10, "34": 1.10, "44": 1.10, "59": 1.10, "67": 1.10, "68": 1.05,
  // Normandie (moins cher)
  "14": 0.90, "27": 0.90, "50": 0.85, "61": 0.85, "76": 0.95,
  // Bretagne
  "22": 0.90, "29": 0.90, "35": 0.95, "56": 0.90,
  // Centre / Rural
  "03": 0.85, "15": 0.85, "18": 0.85, "23": 0.80, "36": 0.85, "41": 0.90, "45": 0.95,
  "19": 0.85, "46": 0.85, "48": 0.80, "12": 0.85,
  // Sud-Ouest
  "40": 0.90, "64": 0.95, "65": 0.90, "32": 0.85, "47": 0.90,
  // Est
  "54": 0.95, "55": 0.85, "57": 0.95, "88": 0.90,
};

export function getRegionCoefficient(postalCode: string): number {
  const dept = postalCode.substring(0, 2);
  return REGION_COEFFICIENTS[dept] ?? 1.0;
}

export function getRegionLabel(postalCode: string): string {
  const coeff = getRegionCoefficient(postalCode);
  if (coeff >= 1.20) return "Zone chère (Île-de-France / grandes villes)";
  if (coeff >= 1.10) return "Zone urbaine";
  if (coeff >= 0.95) return "Tarifs moyens nationaux";
  if (coeff >= 0.85) return "Zone économique";
  return "Zone très économique";
}

// Coefficients par segment véhicule (basé sur la marque)
const BRAND_SEGMENTS: Record<string, number> = {
  // Citadines / économiques → x1.0
  renault: 1.0, peugeot: 1.0, citroen: 1.0, citroën: 1.0, dacia: 0.9, fiat: 1.0,
  opel: 1.0, seat: 1.0, skoda: 1.0, hyundai: 1.0, kia: 1.0, toyota: 1.05,
  suzuki: 0.95, nissan: 1.05, mitsubishi: 1.05, honda: 1.05, mazda: 1.05,
  // Berlines / haut de gamme → x1.2-1.4
  volkswagen: 1.15, ford: 1.05, chevrolet: 1.05,
  // SUV / crossover premium → x1.3-1.5
  // Premium → x1.4-1.8
  bmw: 1.50, mercedes: 1.55, "mercedes-benz": 1.55, audi: 1.45, volvo: 1.35,
  lexus: 1.40, jaguar: 1.50, "land rover": 1.55, "land-rover": 1.55,
  mini: 1.30, alfa: 1.25, "alfa romeo": 1.25, ds: 1.20,
  // Luxe → x1.8+
  porsche: 1.80, maserati: 1.80, tesla: 1.60,
};

export function getVehicleCoefficient(marque: string): number {
  const lower = marque.toLowerCase().trim();
  return BRAND_SEGMENTS[lower] ?? 1.0;
}

export function getVehicleLabel(marque: string): string {
  const coeff = getVehicleCoefficient(marque);
  if (coeff >= 1.50) return "Premium (pièces et main-d'œuvre plus élevées)";
  if (coeff >= 1.20) return "Haut de gamme";
  if (coeff >= 1.10) return "Gamme intermédiaire";
  if (coeff <= 0.90) return "Économique";
  return "Standard";
}

// Applique les coefficients sur les coûts
export function adjustCosts(
  coutMin: number,
  coutMax: number,
  postalCode?: string,
  marque?: string
): { cout_min: number; cout_max: number; region_coeff: number; vehicle_coeff: number } {
  const regionCoeff = postalCode ? getRegionCoefficient(postalCode) : 1.0;
  const vehicleCoeff = marque ? getVehicleCoefficient(marque) : 1.0;
  const combined = regionCoeff * vehicleCoeff;

  return {
    cout_min: Math.round(coutMin * combined),
    cout_max: Math.round(coutMax * combined),
    region_coeff: regionCoeff,
    vehicle_coeff: vehicleCoeff,
  };
}
