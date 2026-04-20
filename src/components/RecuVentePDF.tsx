"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface RecuData {
  vendeur: { nom: string; adresse: string };
  acheteur: { nom: string; adresse: string };
  vehicle: { marque: string; modele: string; immatriculation: string; vin: string; km: number; annee: string };
  dateVente: string;
  prixVente: number;
  modePaiement: string;
}

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1e293b", lineHeight: 1.8 },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 30, textTransform: "uppercase", letterSpacing: 1 },
  body: { fontSize: 11, lineHeight: 1.8 },
  bold: { fontWeight: "bold" },
  signatureRow: { flexDirection: "row", gap: 40, marginTop: 50 },
  signatureBlock: { flex: 1 },
  signatureTitle: { fontSize: 10, color: "#64748b", marginBottom: 4 },
  signatureLine: { borderBottomWidth: 0.5, borderBottomColor: "#94a3b8", marginTop: 50 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8", textAlign: "center" },
});

function numberToWords(n: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
  if (n === 0) return "zéro";
  if (n < 17) return units[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t] + "-" + units[10 + u];
    if (t === 8 && u === 0) return "quatre-vingts";
    return tens[t] + (u === 1 && t !== 8 ? " et un" : u > 0 ? "-" + units[u] : "");
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h === 1 ? "cent" : units[h] + " cent") + (r > 0 ? " " + numberToWords(r) : h > 1 ? "s" : "");
  }
  if (n < 1000000) {
    const k = Math.floor(n / 1000);
    const r = n % 1000;
    return (k === 1 ? "mille" : numberToWords(k) + " mille") + (r > 0 ? " " + numberToWords(r) : "");
  }
  return n.toLocaleString("fr-FR");
}

function RecuDocument({ data }: { data: RecuData }) {
  const prixMots = numberToWords(Math.round(data.prixVente));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>Reçu de vente</Text>

        <View style={s.body}>
          <Text>
            Je soussigné <Text style={s.bold}>{data.vendeur.nom || "________________"}</Text>,
            {data.vendeur.adresse ? ` demeurant ${data.vendeur.adresse},` : ""}
          </Text>
          <Text style={{ marginTop: 10 }}>
            déclare avoir vendu le véhicule suivant :
          </Text>

          <View style={{ marginTop: 15, marginBottom: 15, padding: 12, backgroundColor: "#f8fafc", borderRadius: 4 }}>
            <Text>Marque : <Text style={s.bold}>{data.vehicle.marque} {data.vehicle.modele}</Text> ({data.vehicle.annee})</Text>
            <Text>Immatriculation : <Text style={s.bold}>{data.vehicle.immatriculation}</Text></Text>
            {data.vehicle.vin && <Text>N° VIN : <Text style={[s.bold, { fontFamily: "Courier" }]}>{data.vehicle.vin}</Text></Text>}
            <Text>Kilométrage : <Text style={s.bold}>{data.vehicle.km > 0 ? `${data.vehicle.km.toLocaleString("fr-FR")} km` : "non garanti"}</Text></Text>
          </View>

          <Text>
            à <Text style={s.bold}>{data.acheteur.nom || "________________"}</Text>,
            {data.acheteur.adresse ? ` demeurant ${data.acheteur.adresse},` : ""}
          </Text>

          <Text style={{ marginTop: 10 }}>
            pour le prix de <Text style={s.bold}>{data.prixVente.toLocaleString("fr-FR")} €</Text> ({prixMots} euros),
          </Text>

          <Text style={{ marginTop: 5 }}>
            payé {data.modePaiement || "comptant"}.
          </Text>

          <Text style={{ marginTop: 20 }}>
            Fait à ________________, le <Text style={s.bold}>{data.dateVente}</Text>.
          </Text>
        </View>

        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Le vendeur</Text>
            <Text style={{ fontSize: 9, color: "#94a3b8" }}>(Mention &quot;Lu et approuvé&quot; + signature)</Text>
            <View style={s.signatureLine} />
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>L&apos;acheteur</Text>
            <Text style={{ fontSize: 9, color: "#94a3b8" }}>(Mention &quot;Lu et approuvé&quot; + signature)</Text>
            <View style={s.signatureLine} />
          </View>
        </View>

        <Text style={s.footer}>Document généré par Vyrdict</Text>
      </Page>
    </Document>
  );
}

export function RecuVentePDFLink({ data, children }: { data: RecuData; children: React.ReactNode }) {
  return (
    <PDFDownloadLink
      document={<RecuDocument data={data} />}
      fileName={`Recu-Vente-${data.vehicle.immatriculation || "vehicule"}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer no-print">
      {({ loading }) => loading ? "Génération..." : children}
    </PDFDownloadLink>
  );
}
