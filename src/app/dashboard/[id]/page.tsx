"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { AnalyseResult, Defaillance } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { GraviteBadge } from "@/components/GraviteBadge";
import { useToast } from "@/components/Toast";
import { AUCTION_SOURCES, calcMaxAdjudication, calcAuctionFees } from "@/lib/auction-fees";

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
  photo_url: string | null;
  ct_file_url: string | null;
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
  const toast = useToast();
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
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});
  const [expandedDef, setExpandedDef] = useState<string | null>(null);
  const [lienAnnonce, setLienAnnonce] = useState("");
  const [dateEnchere, setDateEnchere] = useState("");
  const [tvaSurMarge, setTvaSurMarge] = useState(true);
  const [margeMinimum, setMargeMinimum] = useState("500");
  const [modeEnchere, setModeEnchere] = useState("en_ligne");
  const [fraisEncherePct, setFraisEncherePct] = useState<string>("");
  const [fraisEnchereFixes, setFraisEnchereFixes] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

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
        setCustomPrices(data.custom_prices || {});
        setLienAnnonce(data.lien_annonce || "");
        setDateEnchere(data.date_enchere ? new Date(data.date_enchere).toISOString().slice(0, 16) : "");
        setTvaSurMarge(data.tva_sur_marge ?? true);
        setMargeMinimum(data.marge_minimum?.toString() || "500");
        setModeEnchere(data.mode_enchere || "en_ligne");
        if (data.frais_enchere_pct !== null && data.frais_enchere_pct !== undefined) setFraisEncherePct(data.frais_enchere_pct.toString());
        if (data.frais_enchere_fixes !== null && data.frais_enchere_fixes !== undefined) setFraisEnchereFixes(data.frais_enchere_fixes.toString());
      }
      setLoading(false);
    })();
  }, [id]);

  const save = useCallback(async (updates: Record<string, unknown>, label?: string) => {
    setSaving(true);
    setSaveStatus("saving");
    await fetch(`/api/dashboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    setSaveStatus("saved");
    if (label) toast.show(label);
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [id, toast]);

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
    return defaillances.filter((d) => d.selected).reduce((sum, d, idx) => {
      const key = `${d.code}-${idx}`;
      const custom = customPrices[key];
      const prix = custom ? (parseInt(custom) || 0) : (d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2));
      return sum + prix;
    }, 0);
  }, [defaillances, customPrices]);

  const coutReparations = devisGarage ? parseFloat(devisGarage) : estimationSelectionnees;
  const achat = prixAchat ? parseFloat(prixAchat) : 0;
  const revente = prixRevente ? parseFloat(prixRevente) : 0;
  const frais = fraisAnnexes ? parseFloat(fraisAnnexes) : 350;
  const joursStock = dateAchat ? Math.floor((Date.now() - new Date(dateAchat).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const coutStock = joursStock * (parseFloat(coutStockageJour) || 0);
  const tvaMarge = tvaSurMarge && revente > 0 && achat > 0 && revente > achat ? Math.round((revente - achat) * 0.2) : 0;
  const margeBrute = revente > 0 && achat > 0 ? revente - achat - coutReparations - frais - coutStock : null;
  const margeNette = margeBrute !== null ? margeBrute - tvaMarge : null;
  const rendement = margeNette !== null && achat > 0 ? Math.round((margeNette / achat) * 100) : null;

  // Plafond d'adjudication avec marge minimum + frais enchère
  const margeMin = parseFloat(margeMinimum) || 0;
  const sourceKey = sourceAchat === "alcopa" ? `alcopa_${modeEnchere}` : sourceAchat;
  const budgetMax = revente > 0 ? revente - coutReparations - frais - tvaMarge - margeMin : null;
  const plafondAdjudication = budgetMax !== null && budgetMax > 0
    ? calcMaxAdjudication(budgetMax, sourceKey, fraisEncherePct ? parseFloat(fraisEncherePct) : undefined, fraisEnchereFixes ? parseFloat(fraisEnchereFixes) : undefined)
    : null;
  const fraisEnchereEstimes = plafondAdjudication !== null
    ? calcAuctionFees(sourceKey, plafondAdjudication, fraisEncherePct ? parseFloat(fraisEncherePct) : undefined, fraisEnchereFixes ? parseFloat(fraisEnchereFixes) : undefined)
    : 0;

  // Sauver le total réparations pour synchroniser avec la liste
  useEffect(() => {
    if (coutReparations > 0 && vehicle) {
      save({ devis_garage: coutReparations });
    }
  }, [coutReparations]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="min-h-full flex items-center justify-center text-muted">Chargement...</div>;
  if (!vehicle || !resultat) return <div className="min-h-full flex items-center justify-center text-danger">Véhicule non trouvé</div>;

  const a = vehicle.analyses;

  return (
    <div className="min-h-full flex flex-col bg-white">
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <span className="text-slate-200">|</span>
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
            <span className={`text-xs transition-colors ${saveStatus === "saving" ? "text-muted" : saveStatus === "saved" ? "text-teal-600" : "text-transparent"}`}>
              {saveStatus === "saving" ? "Sauvegarde..." : saveStatus === "saved" ? "✓ Sauvegardé" : "."}
            </span>
            <button onClick={() => window.print()} className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer no-print" aria-label="Exporter PDF">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Exporter PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">

          {/* Colonne gauche — Analyse CT (order-2 sur mobile pour que la rentabilité soit en premier) */}
          <div className="lg:col-span-2 flex flex-col gap-5 order-2 lg:order-1">
            {/* Photo + Score + coût */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              {/* Photo véhicule */}
              <label className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors shrink-0 overflow-hidden">
                {vehicle.photo_url ? (
                  <img src={vehicle.photo_url} alt={`${a.marque} ${a.modele}`} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    // Store as data URL (simple, no Supabase Storage needed for MVP)
                    const dataUrl = reader.result as string;
                    await save({ photo_url: dataUrl }, "Photo ajoutée");
                    setVehicle((prev) => prev ? { ...prev, photo_url: dataUrl } : prev);
                  };
                  reader.readAsDataURL(f);
                }} />
              </label>
              <ScoreGauge score={a.score_sante} size="sm" />
              <div>
                <p className="text-2xl font-black tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</p>
                <p className="text-xs text-muted">{a.defaillances_count} défaillances — {a.code_postal && `CP ${a.code_postal}`}</p>
                {vehicle.ct_file_url ? (
                  <a href={vehicle.ct_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-medium mt-1 inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Voir le CT original
                  </a>
                ) : (
                  <label className="text-xs text-muted hover:text-primary font-medium mt-1 inline-flex items-center gap-1 cursor-pointer transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Ajouter le CT
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const form = new FormData();
                      form.append("ctFile", f);
                      const res = await fetch(`/api/dashboard/${id}/upload-ct`, { method: "POST", body: form });
                      if (res.ok) {
                        const data = await res.json();
                        setVehicle((prev) => prev ? { ...prev, ct_file_url: data.ct_file_url } : prev);
                        toast.show("CT ajouté");
                      }
                    }} />
                  </label>
                )}
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
              {defaillances.sort((a, b) => a.priorite - b.priorite).map((d, idx) => {
                const key = `${d.code}-${idx}`;
                const estimation = d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2);
                const customPrice = customPrices[key];
                const displayPrice = customPrice ? parseInt(customPrice) || estimation : estimation;
                const isExpanded = expandedDef === key;

                return (
                  <div key={key} className={`rounded-xl border transition-colors ${d.selected ? "bg-white border-slate-200/60 shadow-sm" : "bg-slate-50 border-transparent opacity-50"}`}>
                    <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                      <input type="checkbox" checked={d.selected} onChange={() => toggleDefaillance(d.code)} className="w-4 h-4 accent-primary rounded shrink-0" />
                      <GraviteBadge gravite={d.gravite} small />
                      <span className={`flex-1 text-sm font-medium ${d.selected ? "" : "line-through"}`}>{d.libelle}</span>
                      <input type="number" inputMode="numeric" value={customPrice ?? ""} placeholder={`~${estimation}`}
                        onChange={(e) => { e.stopPropagation(); setCustomPrices((p) => ({ ...p, [key]: e.target.value })); }}
                        onBlur={() => save({ custom_prices: customPrices }, "Prix sauvegardé")}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 text-right text-sm font-bold tabular-nums bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none transition-colors placeholder:text-muted placeholder:font-normal"
                        aria-label={`Prix ${d.libelle}`} />
                      <span className="text-sm text-muted">€</span>
                      <button onClick={(e) => { e.preventDefault(); setExpandedDef(isExpanded ? null : key); }}
                        className="p-1 text-slate-300 hover:text-muted transition-colors cursor-pointer" aria-label="Détails">
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </label>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-slate-100 text-xs text-muted flex flex-col gap-1.5">
                        <p className="text-sm text-slate-600">{d.description}</p>
                        {d.cout_piece && <span className="px-2 py-0.5 bg-slate-50 rounded inline-block w-fit">{d.cout_piece}</span>}
                        {d.cout_main_oeuvre && <span className="px-2 py-0.5 bg-slate-50 rounded inline-block w-fit">{d.cout_main_oeuvre}</span>}
                        <span>Fourchette : {d.cout_min}-{d.cout_max} € — Estimation : ~{estimation} €</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between px-4 py-2 text-sm font-bold border-t border-slate-200/60 mt-1">
                <span>Estimation sélection :</span>
                <span className="tabular-nums">~{estimationSelectionnees.toLocaleString("fr-FR")} €</span>
              </div>
            </div>

            {/* Notes — repliable */}
            <details className="group">
              <summary className="text-sm font-medium text-foreground cursor-pointer flex items-center justify-between py-2">
                Notes personnelles {notes && <span className="text-xs text-muted font-normal">({notes.length} car.)</span>}
                <svg className="w-4 h-4 text-slate-300 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                onBlur={() => save({ notes })}
                placeholder="Vendeur pressé, carrosserie impeccable, rayure portière droite..."
                rows={3}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors resize-none" />
            </details>

            {/* Supprimer */}
            <button onClick={async () => {
              if (!confirm("Supprimer ce véhicule ?")) return;
              await fetch(`/api/dashboard/${id}`, { method: "DELETE" });
              router.push("/dashboard");
            }} className="text-xs text-muted hover:text-danger transition-colors cursor-pointer text-left">
              Supprimer ce véhicule
            </button>
          </div>

          {/* Colonne droite — Rentabilité (order-1 sur mobile = affiché en premier) */}
          <div className="flex flex-col gap-5 order-1 lg:order-2">
            {/* Statut pipeline */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Statut</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STATUTS.map((s) => (
                  <button key={s.key} onClick={() => { setStatut(s.key); save({ statut: s.key }, `Statut → ${s.label}`); }}
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted">Prix de revente visé</label>
                    <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline font-medium">
                      Cote LaCentrale &rarr;
                    </a>
                  </div>
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

              {/* TVA */}
              <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tvaSurMarge} onChange={(e) => { setTvaSurMarge(e.target.checked); save({ tva_sur_marge: e.target.checked }); }}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-xs text-muted">TVA sur marge (20%)</span>
                </label>
              </div>

              {/* Plafond d'adjudication — uniquement avant achat */}
              {["a_etudier", "a_negocier", "offre_faite", ""].includes(statut) && (
                <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs text-muted">Marge minimum souhaitée</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input type="number" inputMode="numeric" value={margeMinimum}
                        onChange={(e) => setMargeMinimum(e.target.value)}
                        onBlur={() => save({ marge_minimum: parseFloat(margeMinimum) || 0 })}
                        placeholder="500"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm tabular-nums" />
                      <span className="text-sm text-muted">€</span>
                    </div>
                  </div>

                  {plafondAdjudication !== null && plafondAdjudication > 0 && (
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">Enchérir max (adjudication) :</p>
                      <p className="text-2xl font-black tabular-nums text-teal-700">{plafondAdjudication.toLocaleString("fr-FR")} €</p>
                      {fraisEnchereEstimes > 0 && (
                        <p className="text-[10px] text-muted mt-1">
                          Frais enchère estimés : {fraisEnchereEstimes.toLocaleString("fr-FR")} €
                          {AUCTION_SOURCES[sourceKey]?.note && ` (${AUCTION_SOURCES[sourceKey].note})`}
                        </p>
                      )}
                      <p className="text-[10px] text-muted">Marge minimum : {margeMin.toLocaleString("fr-FR")} € | {tvaSurMarge ? "TVA marge incluse" : "Sans TVA"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bilan final — uniquement si vendu */}
              {statut === "vendu" && margeNette !== null && (
                <div className={`p-4 rounded-xl ${margeNette >= 0 ? "bg-emerald-50 border border-emerald-200/50" : "bg-red-50 border border-red-200/50"}`}>
                  <p className="text-xs text-muted mb-1">Bilan final :</p>
                  <p className={`text-2xl font-black tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                    {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-[10px] text-muted mt-1">Rendement : {rendement}%</p>
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
                    <option value="interencheres">Interenchères</option>
                    <option value="encheres_vo">Enchères VO</option>
                    <option value="capcar">CapCar Pro</option>
                    <option value="planete_auto">Planète Auto</option>
                    <option value="particulier">Particulier</option>
                    <option value="mandataire">Mandataire</option>
                    <option value="autre">Autre</option>
                  </select>
                  {sourceAchat === "alcopa" && (
                    <div className="flex gap-2 mt-1.5">
                      {["en_ligne", "salle"].map((mode) => (
                        <button key={mode} onClick={() => { setModeEnchere(mode); save({ mode_enchere: mode }); }}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${modeEnchere === mode ? "bg-teal-100 text-teal-700" : "bg-slate-50 text-muted hover:bg-slate-100"}`}>
                          {mode === "en_ligne" ? "En ligne" : "En salle"}
                        </button>
                      ))}
                    </div>
                  )}
                  {sourceKey && AUCTION_SOURCES[sourceKey] && AUCTION_SOURCES[sourceKey].pct > 0 && (
                    <p className="text-[10px] text-muted mt-1">
                      Frais : {(AUCTION_SOURCES[sourceKey].pct * 100).toFixed(1)}% + {AUCTION_SOURCES[sourceKey].fixes}€
                      {AUCTION_SOURCES[sourceKey].minFrais && ` (min ${AUCTION_SOURCES[sourceKey].minFrais}€)`}
                    </p>
                  )}
                </div>
                {["a_etudier", "a_negocier", "offre_faite", ""].includes(statut) && (
                  <div>
                    <label className="text-xs text-muted">Date enchère</label>
                    <input type="datetime-local" value={dateEnchere} onChange={(e) => setDateEnchere(e.target.value)}
                      onBlur={() => save({ date_enchere: dateEnchere || null })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted">Lien annonce</label>
                  <div className="flex gap-2 mt-1">
                    <input type="url" value={lienAnnonce} onChange={(e) => setLienAnnonce(e.target.value)}
                      onBlur={() => save({ lien_annonce: lienAnnonce })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors" />
                    {lienAnnonce && (
                      <a href={lienAnnonce} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-primary hover:bg-teal-50 transition-colors flex items-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    )}
                  </div>
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
