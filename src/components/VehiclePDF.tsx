"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { AnalyseResult } from "@/lib/types";

interface PDFData {
  vehicule: { marque: string; modele: string; immatriculation: string; annee: string; kilometrage: number };
  resultat: AnalyseResult;
  prix_achat: number | null;
  prix_revente: number | null;
  prix_vente_reel: number | null;
  cote_marche: number | null;
  source_achat: string;
  date_achat: string | null;
  date_vente: string | null;
  devis_garage: number | null;
  estimation_vyrdict: number | null;
  frais_annexes: number;
  statut: string;
  notes: string;
  notes_acheteur: string;
  reparations_selectionnees: string[];
  reparations_faites: string[];
  custom_prices: Record<string, string>;
  notes_defaillances: Record<string, string>;
  mode_reparation: string;
  usage_perso: boolean;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { borderBottomWidth: 2, borderBottomColor: "#0d9488", paddingBottom: 12, marginBottom: 16 },
  brand: { fontSize: 18, fontWeight: "bold", color: "#0d9488" },
  subtitle: { fontSize: 8, color: "#64748b", marginTop: 2 },
  vehicleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  vehicleTitle: { fontSize: 16, fontWeight: "bold" },
  vehicleMeta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  badge: { fontSize: 8, padding: 4, paddingHorizontal: 8, borderRadius: 4, backgroundColor: "#f1f5f9" },
  section: { marginBottom: 14, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 9 },
  rowLabel: { color: "#475569" },
  rowValue: { fontWeight: "bold" },
  metricsGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metric: { flex: 1, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6, alignItems: "center" },
  metricLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  metricValue: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  defTable: { marginTop: 4 },
  defRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", alignItems: "center" },
  defCheckbox: { width: 12, height: 12, marginRight: 8, borderWidth: 1, borderColor: "#94a3b8", borderRadius: 2, justifyContent: "center", alignItems: "center", fontSize: 8 },
  defGravite: { fontSize: 7, padding: 2, paddingHorizontal: 5, borderRadius: 3, marginRight: 6, fontWeight: "bold" },
  graviteCritique: { backgroundColor: "#fee2e2", color: "#991b1b" },
  graviteMajeur: { backgroundColor: "#fed7aa", color: "#9a3412" },
  graviteMineur: { backgroundColor: "#dbeafe", color: "#1e40af" },
  defLabel: { flex: 1, fontSize: 9 },
  defLabelDone: { textDecoration: "line-through", color: "#10b981" },
  defPrice: { fontSize: 9, fontWeight: "bold", textAlign: "right", width: 60 },
  defNote: { fontSize: 8, color: "#64748b", fontStyle: "italic", marginTop: 2, marginLeft: 30 },
  cascade: { padding: 10, backgroundColor: "#f0fdf4", borderRadius: 6, marginBottom: 14 },
  cascadeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, fontSize: 10 },
  cascadeTotal: { borderTopWidth: 1, borderTopColor: "#86efac", marginTop: 4, paddingTop: 6 },
  cascadeTotalLabel: { fontWeight: "bold", fontSize: 11 },
  cascadeTotalValue: { fontWeight: "bold", fontSize: 14, color: "#059669" },
  notes: { fontSize: 9, color: "#334155", marginTop: 4, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, fontSize: 8, color: "#94a3b8", textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#e2e8f0", paddingTop: 8 },
});

const STATUT_LABELS: Record<string, string> = {
  a_etudier: "À étudier", a_negocier: "À négocier", offre_faite: "Offre faite",
  achete: "Acheté", en_reparation: "En réparation", en_vente: "En vente",
  vendu: "Vendu", passe: "Passé",
};

function formatDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("fr-FR");
}

function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString("fr-FR")} €`;
}

function VehicleDocument({ data }: { data: PDFData }) {
  const r = data.resultat;
  const coutMoyen = Math.round((r.cout_total_min + r.cout_total_max) / 2);
  const coutReparations = data.devis_garage || data.estimation_vyrdict || coutMoyen;
  const margeBrute = data.prix_revente && data.prix_achat ? data.prix_revente - data.prix_achat - coutReparations - (data.frais_annexes || 350) : null;

  // Trier par priorité
  const defs = [...r.defaillances].sort((a, b) => a.priorite - b.priorite);

  // Sélection selon mode
  const selected = (d: { code: string; gravite: string }) => {
    if (data.mode_reparation === "complet") return true;
    if (data.mode_reparation === "minimum_ct") return d.gravite === "majeur" || d.gravite === "critique";
    return data.reparations_selectionnees.includes(d.code);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>VYRDICT — Rapport véhicule</Text>
          <Text style={styles.subtitle}>Généré le {new Date().toLocaleDateString("fr-FR")}</Text>
        </View>

        {/* Véhicule */}
        <View style={styles.vehicleHeader}>
          <View>
            <Text style={styles.vehicleTitle}>{data.vehicule.marque} {data.vehicule.modele}</Text>
            <Text style={styles.vehicleMeta}>
              {data.vehicule.annee && `${data.vehicule.annee} • `}
              {data.vehicule.kilometrage > 0 && `${data.vehicule.kilometrage.toLocaleString("fr-FR")} km • `}
              {data.vehicule.immatriculation || "—"}
            </Text>
          </View>
          <Text style={styles.badge}>{STATUT_LABELS[data.statut] || data.statut}{data.usage_perso && " — Perso"}</Text>
        </View>

        {/* Métriques clés */}
        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Score santé</Text>
            <Text style={[styles.metricValue, { color: r.score_sante >= 70 ? "#0d9488" : r.score_sante >= 40 ? "#d97706" : "#dc2626" }]}>{r.score_sante}/100</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Réparations</Text>
            <Text style={styles.metricValue}>{coutReparations.toLocaleString("fr-FR")} €</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Défaillances</Text>
            <Text style={styles.metricValue}>{r.defaillances.length}</Text>
          </View>
        </View>

        {/* Cascade financière */}
        {(data.prix_achat || data.prix_revente) && (
          <View style={styles.cascade}>
            <Text style={styles.sectionTitle}>{data.usage_perso ? "Coût total" : "Rentabilité"}</Text>
            {data.prix_revente && (
              <View style={styles.cascadeRow}>
                <Text>{data.usage_perso ? "Budget max" : "Revente visée"}</Text>
                <Text style={{ fontWeight: "bold" }}>{formatMoney(data.prix_revente)}</Text>
              </View>
            )}
            {data.prix_achat && (
              <View style={styles.cascadeRow}>
                <Text>{data.usage_perso ? "Achat" : "− Achat"}</Text>
                <Text style={{ fontWeight: "bold" }}>{data.usage_perso ? formatMoney(data.prix_achat) : `−${formatMoney(data.prix_achat)}`}</Text>
              </View>
            )}
            {coutReparations > 0 && (
              <View style={styles.cascadeRow}>
                <Text>{data.usage_perso ? "+ Réparations" : "− Réparations"}</Text>
                <Text style={{ fontWeight: "bold", color: "#d97706" }}>{data.usage_perso ? `+${formatMoney(coutReparations)}` : `−${formatMoney(coutReparations)}`}</Text>
              </View>
            )}
            {data.frais_annexes > 0 && (
              <View style={styles.cascadeRow}>
                <Text>{data.usage_perso ? "+ Frais annexes" : "− Frais annexes"}</Text>
                <Text style={{ fontWeight: "bold" }}>{data.usage_perso ? `+${formatMoney(data.frais_annexes)}` : `−${formatMoney(data.frais_annexes)}`}</Text>
              </View>
            )}
            {data.usage_perso && data.prix_achat && (
              <View style={[styles.cascadeRow, styles.cascadeTotal]}>
                <Text style={styles.cascadeTotalLabel}>= Coût total</Text>
                <Text style={[styles.cascadeTotalValue, { color: "#7c3aed" }]}>{formatMoney(data.prix_achat + coutReparations + (data.frais_annexes || 350))}</Text>
              </View>
            )}
            {!data.usage_perso && margeBrute !== null && (
              <View style={[styles.cascadeRow, styles.cascadeTotal]}>
                <Text style={styles.cascadeTotalLabel}>= Marge brute</Text>
                <Text style={[styles.cascadeTotalValue, { color: margeBrute >= 0 ? "#059669" : "#dc2626" }]}>
                  {margeBrute >= 0 ? "+" : ""}{formatMoney(margeBrute)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Infos achat / vente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          {data.source_achat && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Source d&apos;achat</Text>
              <Text style={styles.rowValue}>{data.source_achat}</Text>
            </View>
          )}
          {data.cote_marche && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Cote marché</Text>
              <Text style={styles.rowValue}>{formatMoney(data.cote_marche)}</Text>
            </View>
          )}
          {data.date_achat && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Date d&apos;achat</Text>
              <Text style={styles.rowValue}>{formatDate(data.date_achat)}</Text>
            </View>
          )}
          {data.prix_vente_reel && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Prix vente réel</Text>
              <Text style={styles.rowValue}>{formatMoney(data.prix_vente_reel)}</Text>
            </View>
          )}
          {data.date_vente && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Date de vente</Text>
              <Text style={styles.rowValue}>{formatDate(data.date_vente)}</Text>
            </View>
          )}
        </View>

        {/* Défaillances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Défaillances ({r.defaillances.length})</Text>
          <View style={styles.defTable}>
            {defs.map((d, idx) => {
              const key = `${d.code}-${idx}`;
              const estimation = d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2);
              const customPrice = data.custom_prices?.[key];
              const price = customPrice ? parseInt(customPrice) || estimation : estimation;
              const isFaite = data.reparations_faites?.includes(key);
              const isSelected = selected(d);
              const note = data.notes_defaillances?.[key];
              return (
                <View key={key} wrap={false}>
                  <View style={styles.defRow}>
                    <Text style={styles.defCheckbox}>{isFaite ? "✓" : isSelected ? "·" : ""}</Text>
                    <Text style={[
                      styles.defGravite,
                      d.gravite === "critique" ? styles.graviteCritique : d.gravite === "majeur" ? styles.graviteMajeur : styles.graviteMineur,
                    ]}>{d.gravite.toUpperCase().slice(0, 3)}</Text>
                    <Text style={[styles.defLabel, isFaite ? styles.defLabelDone : {}]}>{d.libelle}</Text>
                    {isSelected && <Text style={styles.defPrice}>{formatMoney(price)}</Text>}
                  </View>
                  {note && <Text style={styles.defNote}>{note}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* Notes véhicule */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{data.notes}</Text>
          </View>
        )}

        {/* Notes acheteur */}
        {data.notes_acheteur && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes acheteur</Text>
            <Text style={styles.notes}>{data.notes_acheteur}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Vyrdict — Estimations indicatives basées sur les tarifs moyens en France 2025-2026. Demandez des devis professionnels avant toute intervention.
        </Text>
      </Page>
    </Document>
  );
}

export function VehiclePDFLink({ data, fileName, children }: { data: PDFData; fileName: string; children: React.ReactNode }) {
  return (
    <PDFDownloadLink
      document={<VehicleDocument data={data} />}
      fileName={fileName}
      className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer no-print">
      {({ loading }) => loading ? "Génération..." : children}
    </PDFDownloadLink>
  );
}
