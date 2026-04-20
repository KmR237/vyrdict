"use client";

import { useState, useCallback } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CerfaData {
  vendeur: {
    type: "physique" | "morale";
    nom: string;
    sexe?: "M" | "F";
    adresse: string;
    codePostal: string;
    commune: string;
    siret?: string;
  };
  acheteur: {
    type: "physique" | "morale";
    nom: string;
    sexe?: "M" | "F";
    dateNaissance?: string;
    lieuNaissance?: string;
    adresse: string;
    codePostal: string;
    commune: string;
    siret?: string;
  };
  vehicle: {
    immatriculation: string;
    vin: string;
    dateImmat: string;
    marque: string;
    typeVariante: string;
    genre: string;
    denomination: string;
    km: number;
    certifImmat: boolean;
    numFormule?: string;
  };
  dateVente: string;
  heureVente: string;
  ceder: "ceder" | "destruction";
}

async function generateCerfaPDF(data: CerfaData): Promise<Uint8Array> {
  // Charger le Cerfa vierge
  const templateBytes = await fetch("/cerfa-15776.pdf").then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const pages = pdfDoc.getPages();
  const black = rgb(0, 0, 0);
  const fontSize = 9;
  const smallSize = 7.5;

  // Helper : écrire du texte à une position (y depuis le haut)
  function write(pageIdx: number, text: string, x: number, yFromTop: number, size = fontSize, f = font) {
    if (!text) return;
    const page = pages[pageIdx];
    const y = page.getHeight() - yFromTop;
    page.drawText(text, { x, y, size, font: f, color: black });
  }

  // Helper : cocher une case (X)
  function check(pageIdx: number, x: number, yFromTop: number) {
    write(pageIdx, "X", x + 2, yFromTop - 1, 8, fontBold);
  }

  // ═══ Remplir les 2 pages (identiques sauf "Exemplaire X") ═══
  for (let p = 0; p < Math.min(pages.length, 2); p++) {

    // ── SECTION VÉHICULE ──

    // (A) Immatriculation
    write(p, data.vehicle.immatriculation, 58, 146, 10, fontBold);

    // (E) VIN
    write(p, data.vehicle.vin, 225, 146, 9, fontMono);

    // (B) Date 1ère immatriculation
    write(p, data.vehicle.dateImmat, 490, 146, 9);

    // (D.1) Marque
    write(p, data.vehicle.marque, 58, 174, 9, fontBold);

    // (D.2) Type variante version
    write(p, data.vehicle.typeVariante, 195, 174, 8);

    // (J.1) Genre national
    write(p, data.vehicle.genre || "VP", 400, 174, 9);

    // (D.3) Dénomination commerciale
    write(p, data.vehicle.denomination, 480, 174, 8);

    // Kilométrage
    write(p, data.vehicle.km > 0 ? data.vehicle.km.toLocaleString("fr-FR") : "", 255, 197, 9, fontBold);

    // Certificat d'immatriculation OUI
    if (data.vehicle.certifImmat) {
      check(p, 55, 228);
      if (data.vehicle.numFormule) {
        write(p, data.vehicle.numFormule, 210, 228, 8, fontMono);
      }
    } else {
      check(p, 365, 228);
    }

    // ── ANCIEN PROPRIÉTAIRE ──

    // Personne physique / morale
    if (data.vendeur.type === "physique") {
      check(p, 55, 290);
      if (data.vendeur.sexe === "M") check(p, 238, 290);
      if (data.vendeur.sexe === "F") check(p, 268, 290);
    } else {
      check(p, 55, 304);
    }

    // Nom
    write(p, data.vendeur.nom, 130, 320, 9, fontBold);

    // SIRET
    if (data.vendeur.siret) {
      write(p, data.vendeur.siret, 460, 320, 8);
    }

    // Adresse
    write(p, data.vendeur.adresse, 110, 345, 8);

    // Code postal + Commune
    write(p, data.vendeur.codePostal, 130, 365, 9, fontBold);
    write(p, data.vendeur.commune, 255, 365, 9, fontBold);

    // Case céder / destruction
    if (data.ceder === "ceder") {
      check(p, 270, 387);
    } else {
      check(p, 350, 387);
    }

    // Date cession : Le JJ/MM/AAAA
    write(p, data.dateVente, 72, 408, 9, fontBold);

    // Heure
    if (data.heureVente) {
      const parts = data.heureVente.split(":");
      write(p, parts[0] || "", 150, 408, 9, fontBold);
      write(p, parts[1] || "", 175, 408, 9, fontBold);
    }

    // Attestations (les 2 premières cochées par défaut)
    check(p, 55, 440);
    check(p, 55, 462);

    // ── NOUVEAU PROPRIÉTAIRE ──

    // Personne physique / morale
    if (data.acheteur.type === "physique") {
      check(p, 55, 570);
      if (data.acheteur.sexe === "M") check(p, 238, 570);
      if (data.acheteur.sexe === "F") check(p, 268, 570);
    } else {
      check(p, 55, 584);
    }

    // Nom
    write(p, data.acheteur.nom, 130, 600, 9, fontBold);

    // SIRET
    if (data.acheteur.siret) {
      write(p, data.acheteur.siret, 460, 600, 8);
    }

    // Date naissance
    if (data.acheteur.dateNaissance) {
      write(p, data.acheteur.dateNaissance, 105, 622, 9);
    }

    // Lieu naissance
    if (data.acheteur.lieuNaissance) {
      write(p, data.acheteur.lieuNaissance, 280, 622, 9);
    }

    // Adresse
    write(p, data.acheteur.adresse, 110, 645, 8);

    // Code postal + Commune
    write(p, data.acheteur.codePostal, 130, 665, 9, fontBold);
    write(p, data.acheteur.commune, 255, 665, 9, fontBold);

    // Attestations acheteur (les 2 cochées)
    check(p, 55, 698);
    check(p, 55, 712);
  }

  return pdfDoc.save();
}

export function CerfaPDFLink({ data, children }: { data: CerfaData; children: React.ReactNode }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const pdfBytes = await generateCerfaPDF(data);
      const blob = new Blob([new Uint8Array(pdfBytes) as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cerfa-15776-${data.vehicle.immatriculation || "cession"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Cerfa generation error:", err);
    }
    setGenerating(false);
  }, [data, generating]);

  return (
    <button onClick={handleDownload} disabled={generating}
      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer no-print disabled:opacity-50">
      {generating ? "Génération..." : children}
    </button>
  );
}
