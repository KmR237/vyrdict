"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  company: {
    nom: string;
    adresse: string;
    siret: string;
    tva_intracom: string;
    telephone: string;
    email: string;
  };
  vehicle: {
    marque: string;
    modele: string;
    annee: string;
    vin: string;
    immatriculation: string;
    kilometrage: number;
  };
  seller: { name: string; contact: string };
  buyer: { name: string; contact: string };
  prixVenteTTC: number;
  coutRevient: number;
  tvaRegime: string;
  tvaRate: number;
}

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  companyBlock: { maxWidth: 250 },
  companyName: { fontSize: 14, fontWeight: "bold", color: "#0d9488" },
  companyDetail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  invoiceTitle: { fontSize: 20, fontWeight: "bold", textAlign: "right" },
  invoiceNumber: { fontSize: 10, color: "#64748b", textAlign: "right", marginTop: 2 },
  invoiceDate: { fontSize: 10, color: "#64748b", textAlign: "right" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginVertical: 15 },
  parties: { flexDirection: "row", gap: 30, marginBottom: 20 },
  partyBlock: { flex: 1, padding: 12, backgroundColor: "#f8fafc", borderRadius: 4 },
  partyTitle: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", color: "#64748b", letterSpacing: 1, marginBottom: 6 },
  partyName: { fontSize: 11, fontWeight: "bold" },
  partyDetail: { fontSize: 9, color: "#475569", marginTop: 2 },
  vehicleSection: { padding: 12, backgroundColor: "#f0fdfa", borderRadius: 4, marginBottom: 20 },
  vehicleTitle: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", color: "#0d9488", letterSpacing: 1, marginBottom: 8 },
  vehicleRow: { flexDirection: "row", marginBottom: 4 },
  vehicleLabel: { width: 120, fontSize: 9, color: "#64748b" },
  vehicleValue: { fontSize: 9, fontWeight: "bold" },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", padding: 8, borderRadius: 4 },
  tableHeaderCell: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", color: "#64748b", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  tableCell: { fontSize: 10 },
  totalBlock: { alignItems: "flex-end", marginTop: 10 },
  totalRow: { flexDirection: "row", marginBottom: 4 },
  totalLabel: { width: 150, fontSize: 10, color: "#64748b", textAlign: "right", paddingRight: 15 },
  totalValue: { width: 100, fontSize: 10, fontWeight: "bold", textAlign: "right" },
  totalFinal: { flexDirection: "row", marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#0d9488" },
  totalFinalLabel: { width: 150, fontSize: 12, fontWeight: "bold", textAlign: "right", paddingRight: 15 },
  totalFinalValue: { width: 100, fontSize: 14, fontWeight: "bold", textAlign: "right", color: "#0d9488" },
  mention: { fontSize: 8, color: "#94a3b8", marginTop: 20, lineHeight: 1.5 },
  mentionBold: { fontSize: 8, color: "#64748b", fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7, color: "#94a3b8", textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#e2e8f0", paddingTop: 8 },
});

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const margeBrute = data.prixVenteTTC - data.coutRevient;
  let tvaCollectee = 0;
  let mentionTVA = "";

  if (data.tvaRegime === "tva_sur_marge") {
    tvaCollectee = Math.max(0, margeBrute) * data.tvaRate / (1 + data.tvaRate);
    mentionTVA = "Régime particulier — Biens d'occasion (article 297 A du CGI). TVA non applicable séparément.";
  } else if (data.tvaRegime === "tva_normale") {
    tvaCollectee = data.prixVenteTTC * data.tvaRate / (1 + data.tvaRate);
    mentionTVA = "";
  } else {
    mentionTVA = "TVA non applicable — article 293 B du CGI.";
  }

  const prixHT = data.tvaRegime === "tva_normale" ? data.prixVenteTTC / (1 + data.tvaRate) : data.prixVenteTTC;
  tvaCollectee = Math.round(tvaCollectee * 100) / 100;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{data.company.nom || "Votre société"}</Text>
            {data.company.adresse && <Text style={s.companyDetail}>{data.company.adresse}</Text>}
            {data.company.siret && <Text style={s.companyDetail}>SIRET : {data.company.siret}</Text>}
            {data.company.tva_intracom && <Text style={s.companyDetail}>TVA : {data.company.tva_intracom}</Text>}
            {data.company.telephone && <Text style={s.companyDetail}>Tél : {data.company.telephone}</Text>}
            {data.company.email && <Text style={s.companyDetail}>{data.company.email}</Text>}
          </View>
          <View>
            <Text style={s.invoiceTitle}>FACTURE</Text>
            <Text style={s.invoiceNumber}>N° {data.invoiceNumber}</Text>
            <Text style={s.invoiceDate}>Date : {data.date}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.partyBlock}>
            <Text style={s.partyTitle}>Vendeur</Text>
            <Text style={s.partyName}>{data.company.nom || "—"}</Text>
            {data.company.adresse && <Text style={s.partyDetail}>{data.company.adresse}</Text>}
          </View>
          <View style={s.partyBlock}>
            <Text style={s.partyTitle}>Acheteur</Text>
            <Text style={s.partyName}>{data.buyer.name || "—"}</Text>
            {data.buyer.contact && <Text style={s.partyDetail}>{data.buyer.contact}</Text>}
          </View>
        </View>

        {/* Véhicule */}
        <View style={s.vehicleSection}>
          <Text style={s.vehicleTitle}>Véhicule</Text>
          <View style={s.vehicleRow}>
            <Text style={s.vehicleLabel}>Désignation</Text>
            <Text style={s.vehicleValue}>{data.vehicle.marque} {data.vehicle.modele} {data.vehicle.annee}</Text>
          </View>
          {data.vehicle.vin && (
            <View style={s.vehicleRow}>
              <Text style={s.vehicleLabel}>N° de série (VIN)</Text>
              <Text style={s.vehicleValue}>{data.vehicle.vin}</Text>
            </View>
          )}
          {data.vehicle.immatriculation && (
            <View style={s.vehicleRow}>
              <Text style={s.vehicleLabel}>Immatriculation</Text>
              <Text style={s.vehicleValue}>{data.vehicle.immatriculation}</Text>
            </View>
          )}
          {data.vehicle.kilometrage > 0 && (
            <View style={s.vehicleRow}>
              <Text style={s.vehicleLabel}>Kilométrage</Text>
              <Text style={s.vehicleValue}>{data.vehicle.kilometrage.toLocaleString("fr-FR")} km</Text>
            </View>
          )}
        </View>

        {/* Tableau */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { flex: 3 }]}>Désignation</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Qté</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Prix</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { flex: 3 }]}>
              {data.vehicle.marque} {data.vehicle.modele} {data.vehicle.annee}
              {data.vehicle.immatriculation ? ` — ${data.vehicle.immatriculation}` : ""}
            </Text>
            <Text style={[s.tableCell, { flex: 1, textAlign: "center" }]}>1</Text>
            <Text style={[s.tableCell, { flex: 1, textAlign: "right", fontWeight: "bold" }]}>{fmt(data.prixVenteTTC)}</Text>
          </View>
        </View>

        {/* Totaux */}
        <View style={s.totalBlock}>
          {data.tvaRegime === "tva_normale" && (
            <>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total HT</Text>
                <Text style={s.totalValue}>{fmt(prixHT)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>TVA ({(data.tvaRate * 100).toFixed(0)}%)</Text>
                <Text style={s.totalValue}>{fmt(tvaCollectee)}</Text>
              </View>
            </>
          )}
          <View style={s.totalFinal}>
            <Text style={s.totalFinalLabel}>Total TTC</Text>
            <Text style={s.totalFinalValue}>{fmt(data.prixVenteTTC)}</Text>
          </View>
        </View>

        {/* Mentions légales */}
        <View style={{ marginTop: 30 }}>
          {mentionTVA && <Text style={s.mentionBold}>{mentionTVA}</Text>}
          <Text style={s.mention}>
            Conditions de paiement : comptant à la livraison sauf accord préalable.{"\n"}
            En cas de retard de paiement, une pénalité de 3 fois le taux d&apos;intérêt légal sera appliquée, ainsi qu&apos;une indemnité forfaitaire de 40 € pour frais de recouvrement.
          </Text>
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          {data.company.nom}{data.company.siret ? ` — SIRET ${data.company.siret}` : ""}{data.company.tva_intracom ? ` — TVA ${data.company.tva_intracom}` : ""}
        </Text>
      </Page>
    </Document>
  );
}

export function InvoicePDFLink({ data, children }: { data: InvoiceData; children: React.ReactNode }) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument data={data} />}
      fileName={`Facture-${data.invoiceNumber}-${data.vehicle.marque}-${data.vehicle.modele}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all cursor-pointer no-print">
      {({ loading }) => loading ? "Génération..." : children}
    </PDFDownloadLink>
  );
}
