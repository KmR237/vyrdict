"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { AnalyseResult, Defaillance } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { GraviteBadge } from "@/components/GraviteBadge";

const STATUTS = [
  { key: "a_etudier", label: "À étudier", color: "bg-slate-100 text-slate-600" },
  { key: "a_negocier", label: "À négocier", color: "bg-blue-100 text-blue-700" },
  { key: "offre_faite", label: "Offre faite", color: "bg-purple-100 text-purple-700" },
  { key: "achete", label: "Acheté", color: "bg-teal-100 text-teal-700" },
  { key: "en_reparation", label: "En réparation", color: "bg-amber-100 text-amber-700" },
  { key: "en_vente", label: "En vente", color: "bg-emerald-100 text-emerald-700" },
  { key: "vendu", label: "Vendu", color: "bg-green-100 text-green-700" },
  { key: "passe", label: "Passé", color: "bg-stone-100 text-stone-500" },
];

interface VehicleData {
  id: string;
  statut: string;
  prix_achat: number | null;
  prix_revente: number | null;
  frais_annexes: number;
  devis_garage: number | null;
  estimation_vyrdict: number | null;
  devis_reel: number | null;
  reparations_selectionnees: string[];
  mode_reparation: string;
  notes: string;
  source_achat: string;
  date_achat: string | null;
  cout_stockage_jour: number;
  prix_vente_reel: number | null;
  analyses: {
    resultat: AnalyseResult;
    score_sante: number;
    cout_total_min: number;
    cout_total_max: number;
    marque: string;
    modele: string;
    immatriculation: string;
    annee: string;
    kilometrage: number;
    code_postal: string;
    defaillances_count: number;
    energie: string;
    puissance_fiscale: string;
  };
}

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [statut, setStatut] = useState("a_etudier");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixRevente, setPrixRevente] = useState("");
  const [fraisAnnexes, setFraisAnnexes] = useState("350");
  const [devisGarage, setDevisGarage] = useState("");
  const [notes, setNotes] = useState("");
  const [modeReparation, setModeReparation] = useState("minimum_ct");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [sourceAchat, setSourceAchat] = useState("");
  const [dateAchat, setDateAchat] = useState("");
  const [coutStockageJour, setCoutStockageJour] = useState("12");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/dashboard/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
        setStatut(data.statut);
        setPrixAchat(data.prix_achat?.toString() || "");
        setPrixRevente(data.prix_revente?.toString() || "");
        setFraisAnnexes(data.frais_annexes?.toString() || "350");
        setDevisGarage(data.devis_garage?.toString() || "");
        setNotes(data.notes || "");
        setModeReparation(data.mode_reparation || "minimum_ct");
        setSelectedCodes(data.reparations_selectionnees || []);
        setSourceAchat(data.source_achat || "");
        setDateAchat(data.date_achat || "");
        setCoutStockageJour(data.cout_stockage_jour?.toString() || "12");
      }
      setLoading(false);
    })();
  }, [id]);

  const save = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    await fetch(`/api/dashboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
  }, [id]);

  const resultat = vehicle?.analyses?.resultat;

  // Sélection automatique des réparations selon le mode
  const defaillances = useMemo(() => {
    if (!resultat) return [];
    return resultat.defaillances.map((d) => {
      let selected = false;
      if (modeReparation === "complet") selected = true;
      else if (modeReparation === "minimum_ct") selected = d.gravite === "majeur" || d.gravite === "critique";
      else selected = selectedCodes.includes(d.code);
      return { ...d, selected };
    });
  }, [resultat, modeReparation, selectedCodes]);

  const toggleDefaillance = (code: string) => {
    setModeReparation("personnalise");
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Calculs de rentabilité
  const estimationSelectionnees = useMemo(() => {
    return defaillances.filter((d) => d.selected).reduce((sum, d) => sum + (d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2)), 0);
  }, [defaillances]);

  const coutReparations = devisGarage ? parseFloat(devisGarage) : estimationSelectionnees;
  const achat = prixAchat ? parseFloat(prixAchat) : 0;
  const revente = prixRevente ? parseFloat(prixRevente) : 0;
  const frais = fraisAnnexes ? parseFloat(fraisAnnexes) : 350;
  const joursStock = dateAchat ? Math.floor((Date.now() - new Date(dateAchat).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const coutStock = joursStock * (parseFloat(coutStockageJour) || 0);
  const margeBrute = revente > 0 && achat > 0 ? revente - achat - coutReparations - frais - coutStock : null;
  const tvaMarge = revente > 0 && achat > 0 && revente > achat ? Math.round((revente - achat) * 0.2) : 0;
  const margeNette = margeBrute !== null ? margeBrute - tvaMarge : null;
  const rendement = margeNette !== null && achat > 0 ? Math.round((margeNette / achat) * 100) : null;
  const plafondEnchere = revente > 0 ? revente - coutReparations - frais - tvaMarge : null;

  if (loading) return <div className="min-h-full flex items-center justify-center text-muted">Chargement...</div>;
  if (!vehicle || !resultat) return <div className="min-h-full flex items-center justify-center text-danger">Véhicule non trouvé</div>;

  const a = vehicle.analyses;

  return (
    <div className="min-h-full flex flex-col bg-white">
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">&larr;</Link>
            <div>
              <h1 className="font-bold text-lg">{a.marque} {a.modele}</h1>
              <div className="flex items-center gap-2 text-xs text-muted">
                {a.immatriculation && <span className="font-mono">{a.immatriculation}</span>}
                {a.annee && <span>{a.annee}</span>}
                {a.kilometrage > 0 && <span>{a.kilometrage.toLocaleString("fr-FR")} km</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{saving ? "Sauvegarde..." : ""}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne gauche — Analyse CT */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Score + coût */}
            <div className="flex items-center gap-6 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <ScoreGauge score={a.score_sante} size="sm" />
              <div>
                <p className="text-2xl font-black tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</p>
                <p className="text-xs text-muted">{a.defaillances_count} défaillances — {a.code_postal && `CP ${a.code_postal}`}</p>
              </div>
            </div>

            {/* Mode réparation */}
            <div className="flex gap-2">
              {[
                { key: "minimum_ct", label: "Minimum CT" },
                { key: "complet", label: "Complet" },
                { key: "personnalise", label: "Personnalisé" },
              ].map((m) => (
                <button key={m.key} onClick={() => { setModeReparation(m.key); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${modeReparation === m.key ? "bg-teal-600 text-white" : "bg-slate-100 text-muted hover:bg-slate-200"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Défaillances */}
            <div className="flex flex-col gap-2">
              {defaillances.sort((a, b) => a.priorite - b.priorite).map((d, idx) => (
                <div key={`${d.code}-${idx}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                  d.selected ? "bg-white border-slate-200/60 shadow-sm" : "bg-slate-50 border-transparent opacity-50"
                }`} onClick={() => toggleDefaillance(d.code)}>
                  <input type="checkbox" checked={d.selected} readOnly className="w-4 h-4 accent-primary rounded" />
                  <GraviteBadge gravite={d.gravite} small />
                  <span className={`flex-1 text-sm font-medium ${d.selected ? "" : "line-through"}`}>{d.libelle}</span>
                  <span className="text-sm font-bold tabular-nums">~{(d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2)).toLocaleString("fr-FR")} €</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2 text-sm font-bold border-t border-slate-200/60 mt-1">
                <span>Estimation sélection :</span>
                <span className="tabular-nums">~{estimationSelectionnees.toLocaleString("fr-FR")} €</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground">Notes personnelles</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                onBlur={() => save({ notes })}
                placeholder="Vendeur pressé, carrosserie impeccable, rayure portière droite..."
                rows={3}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
          </div>

          {/* Colonne droite — Rentabilité */}
          <div className="flex flex-col gap-5">
            {/* Statut pipeline */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Statut</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STATUTS.map((s) => (
                  <button key={s.key} onClick={() => { setStatut(s.key); save({ statut: s.key }); }}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${statut === s.key ? s.color + " ring-2 ring-offset-1 ring-current" : "bg-slate-50 text-muted hover:bg-slate-100"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculateur de rentabilité */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4">Rentabilité</h3>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-muted">Devis garage total (optionnel)</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={devisGarage}
                      onChange={(e) => setDevisGarage(e.target.value)}
                      onBlur={() => save({ devis_garage: devisGarage ? parseFloat(devisGarage) : null, devis_reel: devisGarage ? parseFloat(devisGarage) : null })}
                      placeholder={`~${estimationSelectionnees}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                  {!devisGarage && <p className="text-[10px] text-muted mt-0.5">Sans devis, l&apos;estimation Vyrdict (~{estimationSelectionnees} €) est utilisée</p>}
                </div>

                <div>
                  <label className="text-xs text-muted">Prix d&apos;enchère / achat</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={prixAchat}
                      onChange={(e) => setPrixAchat(e.target.value)}
                      onBlur={() => save({ prix_achat: prixAchat ? parseFloat(prixAchat) : null })}
                      placeholder="6 500"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted">Prix de revente visé</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={prixRevente}
                      onChange={(e) => setPrixRevente(e.target.value)}
                      onBlur={() => save({ prix_revente: prixRevente ? parseFloat(prixRevente) : null })}
                      placeholder="9 000"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted">Frais annexes (CT, carte grise, transport)</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={fraisAnnexes}
                      onChange={(e) => setFraisAnnexes(e.target.value)}
                      onBlur={() => save({ frais_annexes: fraisAnnexes ? parseFloat(fraisAnnexes) : 350 })}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                </div>
              </div>

              {/* Résultat marge */}
              {margeBrute !== null && (
                <div className={`mt-4 p-4 rounded-xl ${margeNette !== null && margeNette >= 0 ? "bg-emerald-50 border border-emerald-200/50" : "bg-red-50 border border-red-200/50"}`}>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Marge brute</span>
                      <span className="font-semibold tabular-nums">{margeBrute.toLocaleString("fr-FR")} €</span>
                    </div>
                    {tvaMarge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">TVA sur marge (20%)</span>
                        <span className="font-semibold tabular-nums text-danger">-{tvaMarge.toLocaleString("fr-FR")} €</span>
                      </div>
                    )}
                    {coutStock > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Stockage ({joursStock}j × {coutStockageJour}€)</span>
                        <span className="font-semibold tabular-nums text-amber-600">-{coutStock.toLocaleString("fr-FR")} €</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200/50">
                      <span className="font-bold">Marge nette</span>
                      <span className={`text-xl font-black tabular-nums ${margeNette !== null && margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                        {margeNette !== null ? (margeNette >= 0 ? "+" : "") + margeNette.toLocaleString("fr-FR") + " €" : "—"}
                      </span>
                    </div>
                  </div>
                  {rendement !== null && (
                    <p className="text-xs text-muted mt-2">Rendement : {rendement}%</p>
                  )}
                </div>
              )}

              {plafondEnchere !== null && plafondEnchere > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-muted">Enchérir max (TVA incluse) :</p>
                  <p className="text-lg font-black tabular-nums text-foreground">{Math.round(plafondEnchere).toLocaleString("fr-FR")} €</p>
                </div>
              )}
            </div>

            {/* Infos achat */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4">Informations achat</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-muted">Source</label>
                  <select value={sourceAchat} onChange={(e) => { setSourceAchat(e.target.value); save({ source_achat: e.target.value }); }}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white cursor-pointer">
                    <option value="">Non renseigné</option>
                    <option value="alcopa">Alcopa Auction</option>
                    <option value="bca">BCA</option>
                    <option value="vpauto">VPAuto</option>
                    <option value="particulier">Particulier</option>
                    <option value="mandataire">Mandataire</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted">Date d&apos;achat</label>
                  <input type="date" value={dateAchat} onChange={(e) => setDateAchat(e.target.value)}
                    onBlur={() => save({ date_achat: dateAchat || null })}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  {dateAchat && (
                    <p className={`text-xs mt-1 font-medium ${joursStock > 60 ? "text-danger" : joursStock > 45 ? "text-amber-600" : "text-muted"}`}>
                      {joursStock} jour{joursStock > 1 ? "s" : ""} en stock
                      {coutStock > 0 && ` — coût : ${coutStock.toLocaleString("fr-FR")} €`}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted">Coût stockage / jour</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={coutStockageJour}
                      onChange={(e) => setCoutStockageJour(e.target.value)}
                      onBlur={() => save({ cout_stockage_jour: parseFloat(coutStockageJour) || 12 })}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm tabular-nums" />
                    <span className="text-sm text-muted">€/j</span>
                  </div>
                </div>
                {vehicle.analyses.energie && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-medium">{vehicle.analyses.energie}</span>
                    {vehicle.analyses.puissance_fiscale && <span>{vehicle.analyses.puissance_fiscale} CV</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
