"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface CerfaData {
  vendeur: { nom: string; adresse: string; ville: string };
  acheteur: { nom: string; adresse: string; ville: string };
  vehicle: { marque: string; modele: string; immatriculation: string; vin: string; dateImmat: string; km: number };
  dateVente: string;
  heureVente: string;
  prixVente: number;
}

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica", color: "#1e293b" },
  title: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 10, textAlign: "center", color: "#475569", marginBottom: 15 },
  ref: { fontSize: 8, textAlign: "center", color: "#94a3b8", marginBottom: 20 },
  section: { marginBottom: 12, padding: 10, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4 },
  sectionTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 8, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 160, color: "#64748b", fontSize: 9 },
  value: { flex: 1, fontWeight: "bold", fontSize: 9, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 },
  signatureRow: { flexDirection: "row", gap: 30, marginTop: 20 },
  signatureBlock: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, minHeight: 80 },
  signatureTitle: { fontSize: 8, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  signatureLine: { fontSize: 8, color: "#94a3b8", marginTop: 40 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, fontSize: 7, color: "#94a3b8", textAlign: "center" },
  important: { fontSize: 8, color: "#dc2626", marginTop: 15, padding: 8, backgroundColor: "#fef2f2", borderRadius: 4, lineHeight: 1.5 },
});

function CerfaDocument({ data }: { data: CerfaData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>CERTIFICAT DE CESSION</Text>
        <Text style={s.subtitle}>D&apos;UN VÉHICULE D&apos;OCCASION</Text>
        <Text style={s.ref}>Cerfa n° 15776*02 — Articles R322-4 et R322-9 du code de la route</Text>

        {/* Vendeur */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>1. Ancien propriétaire (vendeur)</Text>
          <View style={s.row}>
            <Text style={s.label}>Nom et prénom / Raison sociale :</Text>
            <Text style={s.value}>{data.vendeur.nom || " "}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Adresse :</Text>
            <Text style={s.value}>{data.vendeur.adresse || " "}</Text>
          </View>
        </View>

        {/* Acheteur */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>2. Nouveau propriétaire (acheteur)</Text>
          <View style={s.row}>
            <Text style={s.label}>Nom et prénom / Raison sociale :</Text>
            <Text style={s.value}>{data.acheteur.nom || " "}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Adresse :</Text>
            <Text style={s.value}>{data.acheteur.adresse || " "}</Text>
          </View>
        </View>

        {/* Véhicule */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>3. Désignation du véhicule</Text>
          <View style={s.row}>
            <Text style={s.label}>Marque :</Text>
            <Text style={s.value}>{data.vehicle.marque}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Modèle / Type :</Text>
            <Text style={s.value}>{data.vehicle.modele}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>N° d&apos;immatriculation :</Text>
            <Text style={s.value}>{data.vehicle.immatriculation}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>N° d&apos;identification (VIN) :</Text>
            <Text style={[s.value, { fontFamily: "Courier" }]}>{data.vehicle.vin}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Date de 1ère immatriculation :</Text>
            <Text style={s.value}>{data.vehicle.dateImmat}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Kilométrage au compteur :</Text>
            <Text style={s.value}>{data.vehicle.km > 0 ? `${data.vehicle.km.toLocaleString("fr-FR")} km` : "Non garanti"}</Text>
          </View>
        </View>

        {/* Cession */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>4. Conditions de la cession</Text>
          <View style={s.row}>
            <Text style={s.label}>Date de la cession :</Text>
            <Text style={s.value}>{data.dateVente}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Heure de la cession :</Text>
            <Text style={s.value}>{data.heureVente || "      h      "}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Prix de vente TTC :</Text>
            <Text style={s.value}>{data.prixVente > 0 ? `${data.prixVente.toLocaleString("fr-FR")} €` : " "}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Signature du vendeur</Text>
            <Text style={{ fontSize: 8, color: "#94a3b8" }}>Précédée de la mention &quot;Lu et approuvé&quot;</Text>
            <Text style={s.signatureLine}>Date :                    Signature :</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Signature de l&apos;acheteur</Text>
            <Text style={{ fontSize: 8, color: "#94a3b8" }}>Précédée de la mention &quot;Lu et approuvé&quot;</Text>
            <Text style={s.signatureLine}>Date :                    Signature :</Text>
          </View>
        </View>

        {/* Rappel */}
        <View style={s.important}>
          <Text>IMPORTANT : Le vendeur doit déclarer la cession dans les 15 jours sur le site de l&apos;ANTS (ants.gouv.fr).{"\n"}Ce document doit être établi en 3 exemplaires : 1 pour le vendeur, 1 pour l&apos;acheteur, 1 pour la préfecture.</Text>
        </View>

        <Text style={s.footer}>Document généré par Vyrdict — Ce document ne se substitue pas au Cerfa officiel si celui-ci est exigé par la préfecture.</Text>
      </Page>
    </Document>
  );
}

export function CerfaPDFLink({ data, children }: { data: CerfaData; children: React.ReactNode }) {
  return (
    <PDFDownloadLink
      document={<CerfaDocument data={data} />}
      fileName={`Cerfa-Cession-${data.vehicle.immatriculation || "vehicule"}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer no-print">
      {({ loading }) => loading ? "Génération..." : children}
    </PDFDownloadLink>
  );
}
