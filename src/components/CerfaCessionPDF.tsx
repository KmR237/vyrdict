"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

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

const s = StyleSheet.create({
  page: { padding: 25, fontSize: 8, fontFamily: "Helvetica", color: "#1a1a1a" },
  // Header
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, borderBottomWidth: 2, borderBottomColor: "#2856a3", paddingBottom: 8 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  headerSub: { fontSize: 8.5, fontWeight: "bold", textAlign: "center", marginTop: 2 },
  headerRef: { fontSize: 7, textAlign: "center", marginTop: 2, color: "#555" },
  headerRight: { alignItems: "flex-end" },
  cerfaNum: { fontSize: 9, fontWeight: "bold", borderWidth: 1, borderColor: "#2856a3", borderRadius: 3, padding: 3, paddingHorizontal: 6 },
  exemplaire: { fontSize: 7, color: "#666", marginTop: 6, fontStyle: "italic" },
  // Section
  sectionBox: { borderWidth: 1.5, borderColor: "#2856a3", marginBottom: 8, borderRadius: 0 },
  sectionTitle: { backgroundColor: "#2856a3", color: "white", fontSize: 8.5, fontWeight: "bold", paddingVertical: 3, paddingHorizontal: 8 },
  sectionBody: { padding: 8 },
  // Fields
  fieldRow: { flexDirection: "row", marginBottom: 4, alignItems: "flex-end" },
  fieldLabel: { fontSize: 7, color: "#333", width: 100 },
  fieldLabelWide: { fontSize: 7, color: "#333", width: 160 },
  fieldValue: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: "#999", fontSize: 8.5, fontWeight: "bold", paddingBottom: 1, minHeight: 12 },
  fieldValueMono: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: "#999", fontSize: 8.5, fontWeight: "bold", paddingBottom: 1, fontFamily: "Courier", letterSpacing: 1, minHeight: 12 },
  // Grid
  gridRow: { flexDirection: "row", gap: 8 },
  gridCell: { flex: 1, borderWidth: 0.5, borderColor: "#999", padding: 4, minHeight: 28 },
  gridLabel: { fontSize: 6.5, color: "#666", marginBottom: 2 },
  gridValue: { fontSize: 8.5, fontWeight: "bold" },
  // Checkbox
  checkRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  checkbox: { width: 10, height: 10, borderWidth: 1, borderColor: "#333", justifyContent: "center", alignItems: "center" },
  checkMark: { fontSize: 7, fontWeight: "bold" },
  checkLabel: { fontSize: 7.5, flex: 1 },
  // Signature
  signRow: { flexDirection: "row", marginTop: 10 },
  signLeft: { flex: 1 },
  signRight: { flex: 1, alignItems: "flex-end" },
  signTitle: { fontSize: 8, fontWeight: "bold", marginBottom: 2 },
  signSub: { fontSize: 7, color: "#666", fontStyle: "italic" },
  // Attestation
  attestText: { fontSize: 6.5, color: "#333", lineHeight: 1.6, marginLeft: 14 },
  // Separator
  separator: { borderBottomWidth: 1, borderBottomColor: "#2856a3", borderStyle: "dashed", marginVertical: 10 },
  // Footer
  footerBox: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 6 },
  footerCheck: { fontSize: 7, color: "#555" },
});

function CerfaPage({ data, exemplaire }: { data: CerfaData; exemplaire: number }) {
  return (
    <Page size="A4" style={s.page}>
      {/* ═══ HEADER ═══ */}
      <View style={s.headerRow}>
        <View style={{ width: 60 }}>
          <Text style={{ fontSize: 6, textAlign: "center", color: "#2856a3", fontWeight: "bold" }}>MINISTÈRE{"\n"}DE{"\n"}L&apos;INTÉRIEUR</Text>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>CERTIFICAT DE CESSION D&apos;UN VÉHICULE D&apos;OCCASION</Text>
          <Text style={s.headerSub}>(à remplir par l&apos;ancien propriétaire et le nouveau propriétaire)</Text>
          <Text style={s.headerRef}>Articles R322-4 et R322-9 du code de la route</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={s.cerfaNum}>N° 15776*01</Text>
          <Text style={s.exemplaire}>Exemplaire {exemplaire} destiné {exemplaire === 1 ? "à l'ancien propriétaire" : "au nouveau propriétaire"}</Text>
        </View>
      </View>

      {/* ═══ LE VÉHICULE ═══ */}
      <View style={s.sectionBox}>
        <Text style={s.sectionTitle}>  LE VÉHICULE (à remplir par l&apos;ancien propriétaire)</Text>
        <View style={s.sectionBody}>
          <View style={[s.gridRow, { marginBottom: 6 }]}>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>(A) Numéro d&apos;immatriculation</Text>
              <Text style={s.gridValue}>{data.vehicle.immatriculation}</Text>
            </View>
            <View style={[s.gridCell, { flex: 2 }]}>
              <Text style={s.gridLabel}>(E) Numéro d&apos;identification du véhicule</Text>
              <Text style={[s.gridValue, { fontFamily: "Courier", letterSpacing: 1 }]}>{data.vehicle.vin}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>(B) Date de 1ère immatriculation</Text>
              <Text style={s.gridValue}>{data.vehicle.dateImmat}</Text>
            </View>
          </View>
          <View style={[s.gridRow, { marginBottom: 6 }]}>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>(D.1 Marque)</Text>
              <Text style={s.gridValue}>{data.vehicle.marque}</Text>
            </View>
            <View style={[s.gridCell, { flex: 2 }]}>
              <Text style={s.gridLabel}>(D.2 Type, variante, version)</Text>
              <Text style={s.gridValue}>{data.vehicle.typeVariante}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>(J.1 Genre national)</Text>
              <Text style={s.gridValue}>{data.vehicle.genre || "VP"}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>(D.3 Dénomination commerciale)</Text>
              <Text style={s.gridValue}>{data.vehicle.denomination}</Text>
            </View>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Kilométrage inscrit au compteur :</Text>
            <Text style={s.fieldValue}>{data.vehicle.km > 0 ? data.vehicle.km.toLocaleString("fr-FR") : ""}</Text>
          </View>
          <Text style={{ fontSize: 7, marginTop: 4, marginBottom: 2 }}>Présence du certificat d&apos;immatriculation :</Text>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.vehicle.certifImmat ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>OUI — numéro de formule : <Text style={{ fontWeight: "bold" }}>{data.vehicle.numFormule || ""}</Text></Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>{!data.vehicle.certifImmat ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>NON — Motif d&apos;absence : _______________________________________________</Text>
          </View>
        </View>
      </View>

      {/* ═══ ANCIEN PROPRIÉTAIRE ═══ */}
      <View style={s.sectionBox}>
        <Text style={s.sectionTitle}>  Ancien propriétaire</Text>
        <View style={s.sectionBody}>
          <View style={[s.checkRow, { marginBottom: 6 }]}>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.vendeur.type === "physique" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7.5, fontWeight: "bold" }}>Personne physique</Text>
            <Text style={{ fontSize: 7.5, marginHorizontal: 8 }}>— Sexe :</Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.vendeur.sexe === "M" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>M</Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.vendeur.sexe === "F" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>F</Text>
            <Text style={{ fontSize: 7.5, marginLeft: 20, fontWeight: "bold" }}>  </Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.vendeur.type === "morale" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7.5, fontWeight: "bold" }}> Personne morale</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabelWide}>Je soussigné(e),</Text>
            <Text style={s.fieldValue}>{data.vendeur.nom}</Text>
            <Text style={{ fontSize: 6.5, color: "#666", width: 80, textAlign: "right" }}>N° SIRET : {data.vendeur.siret || ""}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Adresse complète :</Text>
            <Text style={s.fieldValue}>{data.vendeur.adresse}</Text>
          </View>
          <View style={[s.fieldRow, { marginTop: 2 }]}>
            <Text style={s.fieldLabel}></Text>
            <Text style={{ fontSize: 7, color: "#666", width: 80 }}>Code postal</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 60 }]}>{data.vendeur.codePostal}</Text>
            <Text style={{ fontSize: 7, color: "#666", width: 60, marginLeft: 10 }}>Commune</Text>
            <Text style={s.fieldValue}>{data.vendeur.commune}</Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 7.5 }}>Certifie <Text style={{ fontSize: 7, color: "#666" }}>(veuillez cocher la case correspondante)</Text> :</Text>
            <View style={[s.checkRow, { marginTop: 4 }]}>
              <View style={s.checkbox}><Text style={s.checkMark}>{data.ceder === "ceder" ? "X" : ""}</Text></View>
              <Text style={{ fontSize: 7.5 }}>céder</Text>
              <View style={[s.checkbox, { marginLeft: 20 }]}><Text style={s.checkMark}>{data.ceder === "destruction" ? "X" : ""}</Text></View>
              <Text style={{ fontSize: 7.5 }}>céder pour destruction</Text>
            </View>
          </View>

          <View style={[s.fieldRow, { marginTop: 6 }]}>
            <Text style={{ fontSize: 7.5 }}>Le</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 80, marginHorizontal: 4 }]}>{data.dateVente}</Text>
            <Text style={{ fontSize: 7.5 }}>à</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 30, marginHorizontal: 4 }]}>{data.heureVente?.split(":")[0] || ""}</Text>
            <Text style={{ fontSize: 7.5 }}>h</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 30, marginHorizontal: 4 }]}>{data.heureVente?.split(":")[1] || ""}</Text>
            <Text style={{ fontSize: 7.5, flex: 1 }}>le véhicule désigné ci-dessus.</Text>
          </View>

          <Text style={{ fontSize: 7, marginTop: 8, marginBottom: 4 }}>Je certifie en outre <Text style={{ color: "#666" }}>(veuillez cocher la case correspondante)</Text> :</Text>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>X</Text></View>
            <Text style={s.attestText}>Avoir remis au nouveau propriétaire un certificat établi depuis moins de quinze jours par le ministre de l&apos;Intérieur, attestant à sa date d&apos;édition de la situation administrative du véhicule ;</Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>X</Text></View>
            <Text style={s.attestText}>Que ce véhicule n&apos;a pas subi de transformation notable susceptible de modifier les indications du certificat de conformité ou de l&apos;actuel certificat d&apos;immatriculation ;</Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}></Text></View>
            <Text style={s.attestText}>Que ce véhicule est cédé pour destruction à un professionnel de la destruction des véhicules hors d&apos;usage (VHU) portant le n° d&apos;agrément : ___________________</Text>
          </View>

          <View style={s.signRow}>
            <View style={s.signLeft}>
              <View style={s.fieldRow}>
                <Text style={{ fontSize: 7.5 }}>Fait à _____________________, le _______________</Text>
              </View>
            </View>
            <View style={s.signRight}>
              <Text style={s.signTitle}>Signature de l&apos;ancien propriétaire,</Text>
              <Text style={s.signSub}>(Pour les sociétés : nom et qualité{"\n"}du signataire et cachet)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ═══ NOUVEAU PROPRIÉTAIRE ═══ */}
      <View style={s.sectionBox}>
        <Text style={s.sectionTitle}>  Nouveau propriétaire</Text>
        <View style={s.sectionBody}>
          <View style={[s.checkRow, { marginBottom: 6 }]}>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.acheteur.type === "physique" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7.5, fontWeight: "bold" }}>Personne physique</Text>
            <Text style={{ fontSize: 7.5, marginHorizontal: 8 }}>— Sexe :</Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.acheteur.sexe === "M" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>M</Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.acheteur.sexe === "F" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7 }}>F</Text>
            <Text style={{ fontSize: 7.5, marginLeft: 20 }}>  </Text>
            <View style={s.checkbox}><Text style={s.checkMark}>{data.acheteur.type === "morale" ? "X" : ""}</Text></View>
            <Text style={{ fontSize: 7.5, fontWeight: "bold" }}> Personne morale</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabelWide}>Je soussigné(e),</Text>
            <Text style={s.fieldValue}>{data.acheteur.nom}</Text>
            <Text style={{ fontSize: 6.5, color: "#666", width: 80, textAlign: "right" }}>N° SIRET : {data.acheteur.siret || ""}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Né(e) le</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 80 }]}>{data.acheteur.dateNaissance || ""}</Text>
            <Text style={{ fontSize: 7.5, marginHorizontal: 6 }}>à</Text>
            <Text style={s.fieldValue}>{data.acheteur.lieuNaissance || ""}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Adresse complète :</Text>
            <Text style={s.fieldValue}>{data.acheteur.adresse}</Text>
          </View>
          <View style={[s.fieldRow, { marginTop: 2 }]}>
            <Text style={s.fieldLabel}></Text>
            <Text style={{ fontSize: 7, color: "#666", width: 80 }}>Code postal</Text>
            <Text style={[s.fieldValue, { flex: 0, width: 60 }]}>{data.acheteur.codePostal}</Text>
            <Text style={{ fontSize: 7, color: "#666", width: 60, marginLeft: 10 }}>Commune</Text>
            <Text style={s.fieldValue}>{data.acheteur.commune}</Text>
          </View>

          <Text style={{ fontSize: 7.5, marginTop: 8, marginBottom: 4 }}>Certifie <Text style={{ fontSize: 7, color: "#666" }}>(veuillez cocher la case correspondante)</Text> :</Text>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>X</Text></View>
            <Text style={s.checkLabel}>Acquérir le véhicule désigné ci-dessus aux dates et heures indiquées par l&apos;ancien propriétaire ;</Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text style={s.checkMark}>X</Text></View>
            <Text style={s.checkLabel}>Avoir été informé de la situation administrative du véhicule.</Text>
          </View>

          <View style={s.signRow}>
            <View style={s.signLeft}>
              <Text style={{ fontSize: 7.5 }}>Fait à _____________________, le _______________</Text>
            </View>
            <View style={s.signRight}>
              <Text style={s.signTitle}>Signature du nouveau propriétaire,</Text>
              <Text style={s.signSub}>(Pour les sociétés : nom et qualité{"\n"}du signataire et cachet)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={s.footerBox}>
        <Text style={s.footerCheck}>Je m&apos;oppose à la réutilisation de mes données personnelles à des fins de prospection commerciale </Text>
        <View style={s.checkbox}><Text style={s.checkMark}></Text></View>
      </View>
    </Page>
  );
}

function CerfaDocument({ data }: { data: CerfaData }) {
  return (
    <Document>
      <CerfaPage data={data} exemplaire={1} />
      <CerfaPage data={data} exemplaire={2} />
    </Document>
  );
}

export function CerfaPDFLink({ data, children }: { data: CerfaData; children: React.ReactNode }) {
  return (
    <PDFDownloadLink
      document={<CerfaDocument data={data} />}
      fileName={`Cerfa-15776-Cession-${data.vehicle.immatriculation || "vehicule"}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer no-print">
      {({ loading }) => loading ? "Génération..." : children}
    </PDFDownloadLink>
  );
}
