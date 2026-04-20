"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { AnalyseResult } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { GraviteBadge } from "@/components/GraviteBadge";
import { useToast } from "@/components/Toast";
import { AUCTION_SOURCES, calcMaxAdjudication, calcAuctionFees } from "@/lib/auction-fees";

// PDF (lazy load — la lib est lourde)
const VehiclePDFLink = dynamic(() => import("@/components/VehiclePDF").then(m => m.VehiclePDFLink), { ssr: false });
const InvoicePDFLink = dynamic(() => import("@/components/InvoicePDF").then(m => m.InvoicePDFLink), { ssr: false });
const CerfaPDFLink = dynamic(() => import("@/components/CerfaCessionPDF").then(m => m.CerfaPDFLink), { ssr: false });
const RecuVentePDFLink = dynamic(() => import("@/components/RecuVentePDF").then(m => m.RecuVentePDFLink), { ssr: false });

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
  cote_marche: number | null;
  source_cote: string;
  date_cote: string | null;
  notes_defaillances: Record<string, string> | null;
  date_vente: string | null;
  notes_acheteur: string | null;
  documents: { name: string; url: string; type: string; uploaded_at: string }[] | null;
  reparations_faites: string[] | null;
  timeline: { date: string; event: string }[] | null;
  usage_perso: boolean | null;
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
  const [tvaSurMarge, setTvaSurMarge] = useState(false);
  const [margeMinimum, setMargeMinimum] = useState("500");
  const [modeEnchere, setModeEnchere] = useState("en_ligne");
  const [fraisEncherePct, setFraisEncherePct] = useState("");
  const [fraisEnchereFixes, setFraisEnchereFixes] = useState("");
  const [coteMarche, setCoteMarche] = useState("");
  const [sourceCote, setSourceCote] = useState("");
  const [dateCote, setDateCote] = useState("");
  const [usagePerso, setUsagePerso] = useState(false);
  const [vin, setVin] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [tvaRegime, setTvaRegime] = useState("sans_tva");
  const [expenses, setExpenses] = useState<{ id: string; date: string; category: string; amount: number; description: string }[]>([]);
  const [newExpenseCategory, setNewExpenseCategory] = useState("autre");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [reparationsFaites, setReparationsFaites] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; event: string }[]>([]);
  const [notesDefaillances, setNotesDefaillances] = useState<Record<string, string>>({});
  const [dateVente, setDateVente] = useState("");
  const [notesAcheteur, setNotesAcheteur] = useState("");
  const [prixVenteReel, setPrixVenteReel] = useState("");
  const [margeEstimeeAuMomentVente, setMargeEstimeeAuMomentVente] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{ nom: string; adresse: string; siret: string; tva_intracom: string; telephone: string; email: string }>({ nom: "", adresse: "", siret: "", tva_intracom: "", telephone: "", email: "" });
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sellerStatus, setSellerStatus] = useState("particulier");
  const [kmVente, setKmVente] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showAllFields, setShowAllFields] = useState(false);
  const [showFinancier, setShowFinancier] = useState(true);
  const [quickAchatOpen, setQuickAchatOpen] = useState(false);
  const [quickAchatPrix, setQuickAchatPrix] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const save = useCallback(async (updates: Record<string, unknown>, label?: string) => {
    setSaveStatus("saving");
    await fetch(`/api/dashboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaveStatus("saved");
    if (label) toast.show(label);
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [id, toast]);

  // Save with debounce — auto-save while typing (800ms delay)
  const saveDebounced = useCallback((updates: Record<string, unknown>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(updates), 800);
  }, [save]);

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

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
        setCoutStockageJour(data.cout_stockage_jour?.toString() || "0");
        setCustomPrices(data.custom_prices || {});
        setLienAnnonce(data.lien_annonce || "");
        if (data.date_enchere) {
          const d = new Date(data.date_enchere);
          const local = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}T${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
          setDateEnchere(local);
        }
        setTvaSurMarge(data.tva_sur_marge ?? false);
        setMargeMinimum(data.marge_minimum?.toString() || "500");
        setModeEnchere(data.mode_enchere || "en_ligne");
        if (data.frais_enchere_pct != null) setFraisEncherePct(data.frais_enchere_pct.toString());
        if (data.frais_enchere_fixes != null) setFraisEnchereFixes(data.frais_enchere_fixes.toString());
        setCoteMarche(data.cote_marche?.toString() || "");
        setSourceCote(data.source_cote || "");
        setDateCote(data.date_cote || "");
        setUsagePerso(data.usage_perso ?? false);
        // VIN : prioriser vehicles.vin, sinon lire depuis le résultat CT
        const vinFromAnalyse = data.analyses?.resultat?.vehicule?.vin || "";
        const vinFinal = data.vin || vinFromAnalyse;
        setVin(vinFinal);
        // Auto-sync : si le VIN est dans l'analyse mais pas dans vehicles, le copier
        if (!data.vin && vinFromAnalyse) {
          fetch(`/api/dashboard/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vin: vinFromAnalyse }) });
        }
        // Vendeur : pré-remplir depuis la source si vide
        const sourceLabels: Record<string, string> = { alcopa: "Alcopa Auction", bca: "BCA", vpauto: "VPAuto", interencheres: "Interenchères", encheres_vo: "Enchères VO", capcar: "CapCar Pro", planete_auto: "Planète Auto" };
        const sellerFinal = data.seller_name || (data.source_achat && sourceLabels[data.source_achat]) || "";
        setSellerName(sellerFinal);
        if (!data.seller_name && sellerFinal) {
          fetch(`/api/dashboard/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seller_name: sellerFinal }) });
        }
        setSellerContact(data.seller_contact || "");
        setBuyerName(data.buyer_name || "");
        setBuyerContact(data.buyer_contact || "");
        setTvaRegime(data.tva_regime || (data.tva_sur_marge ? "tva_sur_marge" : "sans_tva"));
        setReparationsFaites(data.reparations_faites || []);
        // Fetch expenses
        const expRes = await fetch(`/api/dashboard/${id}/expenses`);
        if (expRes.ok) setExpenses(await expRes.json());
        setTimeline(data.timeline || []);
        setNotesDefaillances(data.notes_defaillances || {});
        setDateVente(data.date_vente || "");
        setNotesAcheteur(data.notes_acheteur || "");
        setPrixVenteReel(data.prix_vente_reel?.toString() || "");
        setInvoiceNumber(data.invoice_number || "");
        setKmVente(data.km_vente?.toString() || "");
      }
      // Charger les infos société + statut vendeur
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        if (s.company_info) setCompanyInfo(s.company_info);
        if (s.seller_status) setSellerStatus(s.seller_status);
      }
      setLoading(false);
    })();
  }, [id]);

  const resultat = vehicle?.analyses?.resultat;

  const isPreAchat = ["a_etudier", "a_negocier", "offre_faite"].includes(statut);
  const isPostAchat = ["achete", "en_reparation", "en_vente"].includes(statut);
  const isVendu = statut === "vendu";

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
    const newCodes = selectedCodes.includes(code) ? selectedCodes.filter((c) => c !== code) : [...selectedCodes, code];
    setSelectedCodes(newCodes);
    save({ mode_reparation: "personnalise", reparations_selectionnees: newCodes });
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
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const frais = totalExpenses;
  const joursStock = dateAchat ? Math.floor((Date.now() - new Date(dateAchat).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const tvaMarge = tvaRegime === "tva_sur_marge" && revente > 0 && achat > 0 && revente > achat
    ? Math.round(Math.max(0, revente - achat) * 0.2 / 1.2)
    : tvaRegime === "tva_normale" && revente > 0
    ? Math.round(revente * 0.2 / 1.2)
    : 0;
  const margeBrute = revente > 0 && achat > 0 ? revente - achat - coutReparations - frais : null;
  const margeNette = margeBrute !== null ? margeBrute - tvaMarge : null;
  const rendement = margeNette !== null && achat > 0 ? Math.round((margeNette / achat) * 100) : null;

  // Plafond d'adjudication
  const margeMin = parseFloat(margeMinimum) || 0;
  const sourceKey = sourceAchat === "alcopa" ? `alcopa_${modeEnchere}` : sourceAchat;
  const budgetMax = revente > 0 ? revente - coutReparations - frais - tvaMarge - margeMin : null;
  const plafondAdjudication = budgetMax !== null && budgetMax > 0
    ? calcMaxAdjudication(budgetMax, sourceKey, fraisEncherePct ? parseFloat(fraisEncherePct) : undefined, fraisEnchereFixes ? parseFloat(fraisEnchereFixes) : undefined)
    : null;
  const fraisEnchereEstimes = plafondAdjudication !== null
    ? calcAuctionFees(sourceKey, plafondAdjudication, fraisEncherePct ? parseFloat(fraisEncherePct) : undefined, fraisEnchereFixes ? parseFloat(fraisEnchereFixes) : undefined)
    : 0;

  // Delta vs plafond (post-achat)
  const deltaPlafond = plafondAdjudication !== null && achat > 0 ? plafondAdjudication - achat : null;

  // Précision Vyrdict vs devis garage réel
  const ecartEstimationDevis = useMemo(() => {
    const devisReel = devisGarage ? parseFloat(devisGarage) : null;
    if (!devisReel || devisReel <= 0 || estimationSelectionnees <= 0) return null;
    const ecart = devisReel - estimationSelectionnees;
    const pct = Math.round((ecart / estimationSelectionnees) * 100);
    return { ecart, pct, devisReel };
  }, [devisGarage, estimationSelectionnees]);

  // Bilan vente : marge réelle vs estimée
  const margeReelle = useMemo(() => {
    const venteReel = prixVenteReel ? parseFloat(prixVenteReel) : 0;
    if (!venteReel || venteReel <= 0 || achat <= 0) return null;
    const tva = tvaSurMarge && venteReel > achat ? Math.round((venteReel - achat) * 0.2) : 0;
    return venteReel - achat - coutReparations - frais - tva;
  }, [prixVenteReel, achat, coutReparations, frais, tvaSurMarge]);

  const ecartMarge = useMemo(() => {
    if (margeReelle === null || margeNette === null) return null;
    const diff = margeReelle - margeNette;
    const pct = margeNette !== 0 ? Math.round((diff / Math.abs(margeNette)) * 100) : 0;
    return { diff, pct };
  }, [margeReelle, margeNette]);

  // Synchro estimation
  useEffect(() => {
    if (vehicle && estimationSelectionnees > 0) {
      save({ estimation_vyrdict: estimationSelectionnees });
    }
  }, [estimationSelectionnees]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timeline helper
  const addTimelineEvent = useCallback((event: string) => {
    const entry = { date: new Date().toISOString(), event };
    const updated = [...timeline, entry];
    setTimeline(updated);
    return updated;
  }, [timeline]);

  // Quick achat handler
  const handleQuickAchat = useCallback(async () => {
    const prix = parseFloat(quickAchatPrix);
    if (!prix || prix <= 0) return;
    const tl = addTimelineEvent(`Acheté à ${prix.toLocaleString("fr-FR")} €`);
    const updates = { statut: "achete", prix_achat: prix, date_achat: new Date().toISOString().slice(0, 10), timeline: tl };
    await save(updates, "Acheté !");
    setStatut("achete");
    setPrixAchat(prix.toString());
    setDateAchat(new Date().toISOString().slice(0, 10));
    setQuickAchatOpen(false);
    setQuickAchatPrix("");
  }, [quickAchatPrix, save, addTimelineEvent]);

  // Status change handler
  const handleStatutChange = useCallback((key: string) => {
    if (key === "achete" && isPreAchat) {
      setQuickAchatOpen(true);
      setQuickAchatPrix(prixAchat || "");
      return;
    }
    const label = STATUTS.find(s => s.key === key)?.label || key;
    const tl = addTimelineEvent(`Statut → ${label}`);
    setStatut(key);
    save({ statut: key, timeline: tl }, `Statut → ${label}`);
  }, [isPreAchat, prixAchat, save, addTimelineEvent]);

  // Toggle réparation faite
  const toggleRepFaite = useCallback((key: string) => {
    const updated = reparationsFaites.includes(key) ? reparationsFaites.filter(k => k !== key) : [...reparationsFaites, key];
    setReparationsFaites(updated);
    save({ reparations_faites: updated });
  }, [reparationsFaites, save]);

  // Note par défaillance
  const updateNoteDefaillance = useCallback((key: string, value: string) => {
    const updated = { ...notesDefaillances, [key]: value };
    if (!value) delete updated[key];
    setNotesDefaillances(updated);
    save({ notes_defaillances: updated });
  }, [notesDefaillances, save]);

  // Duplication véhicule
  const duplicateVehicle = useCallback(async () => {
    if (duplicating) return;
    setDuplicating(true);
    const res = await fetch(`/api/dashboard/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const { id: newId } = await res.json();
      toast.show("Véhicule dupliqué !");
      router.push(`/dashboard/${newId}`);
    } else {
      toast.show("Erreur de duplication");
      setDuplicating(false);
    }
  }, [id, duplicating, router, toast]);

  // Re-scan CT
  const handleRescan = useCallback(async (f: File) => {
    const formData = new FormData();
    formData.append("file", f);
    toast.show("Analyse en cours...");
    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    if (!res.ok) { toast.show("Erreur d'analyse"); return; }
    const resultatNew = await res.json();
    if (resultatNew.error) { toast.show(resultatNew.error); return; }
    // Update the analysis in DB
    const supaRes = await fetch(`/api/dashboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimation_vyrdict: Math.round((resultatNew.cout_total_min + resultatNew.cout_total_max) / 2) }),
    });
    if (supaRes.ok) {
      const tl = addTimelineEvent("CT re-scanné");
      save({ timeline: tl });
      toast.show("CT mis à jour — rechargement...");
      setTimeout(() => window.location.reload(), 500);
    }
  }, [id, toast, save, addTimelineEvent]);

  // Checklist pré-achat
  const checklistPreAchat = useMemo(() => {
    if (!isPreAchat) return null;
    const items = [
      { label: "Prix revente / budget", ok: !!prixRevente },
      { label: "Source d'achat", ok: !!sourceAchat },
      { label: "Cote marché", ok: !!coteMarche },
    ];
    const done = items.filter(i => i.ok).length;
    return { items, done, total: items.length };
  }, [isPreAchat, prixRevente, sourceAchat, coteMarche]);

  // Progression réparations
  const repProgression = useMemo(() => {
    const selected = defaillances.filter(d => d.selected);
    const faites = selected.filter((_, idx) => {
      const d = defaillances.find((dd, i) => dd.selected && defaillances.filter(x => x.selected).indexOf(dd) === idx);
      if (!d) return false;
      const key = `${d.code}-${defaillances.indexOf(d)}`;
      return reparationsFaites.includes(key);
    });
    return { done: reparationsFaites.filter(k => defaillances.some((d, i) => `${d.code}-${i}` === k && d.selected)).length, total: selected.length };
  }, [defaillances, reparationsFaites]);

  // Photo upload via Storage
  const handlePhotoUpload = useCallback(async (f: File) => {
    const form = new FormData();
    form.append("photo", f);
    const res = await fetch(`/api/dashboard/${id}/upload-photo`, { method: "POST", body: form });
    if (res.ok) {
      const { photo_url } = await res.json();
      setVehicle((prev) => prev ? { ...prev, photo_url } : prev);
      toast.show("Photo ajoutée");
    }
  }, [id, toast]);

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
            <VehiclePDFLink
              data={{
                vehicule: vehicle.analyses,
                resultat: resultat,
                prix_achat: vehicle.prix_achat,
                prix_revente: vehicle.prix_revente,
                prix_vente_reel: vehicle.prix_vente_reel,
                cote_marche: vehicle.cote_marche,
                source_achat: vehicle.source_achat || "",
                date_achat: vehicle.date_achat,
                date_vente: vehicle.date_vente,
                devis_garage: vehicle.devis_garage,
                estimation_vyrdict: vehicle.estimation_vyrdict,
                frais_annexes: vehicle.frais_annexes,
                statut: vehicle.statut,
                notes: vehicle.notes || "",
                notes_acheteur: vehicle.notes_acheteur || "",
                reparations_selectionnees: vehicle.reparations_selectionnees || [],
                reparations_faites: vehicle.reparations_faites || [],
                custom_prices: customPrices,
                notes_defaillances: notesDefaillances,
                mode_reparation: vehicle.mode_reparation || "minimum_ct",
                usage_perso: vehicle.usage_perso === true,
              }}
              fileName={`Vyrdict-${vehicle.analyses.marque}-${vehicle.analyses.modele}-${vehicle.analyses.immatriculation || "rapport"}.pdf`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              PDF
            </VehiclePDFLink>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* ═══ A. VERDICT CT — bandeau en haut, full width ═══ */}
        <div className={`rounded-2xl p-4 mb-6 border ${
          a.score_sante >= 70 ? "bg-emerald-50 border-emerald-200/50" :
          a.score_sante >= 40 ? "bg-amber-50 border-amber-200/50" :
          "bg-red-50 border-red-200/50"
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ScoreGauge score={a.score_sante} size="sm" />
              <div>
                <p className={`text-sm font-bold ${
                  a.score_sante >= 70 ? "text-emerald-700" :
                  a.score_sante >= 40 ? "text-amber-700" :
                  "text-red-700"
                }`}>
                  {a.score_sante >= 70 ? "Bon état général" :
                   a.score_sante >= 40 ? "Réparations nécessaires" :
                   "État préoccupant"}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {resultat.defaillances.filter(d => d.gravite === "critique").length > 0 && `${resultat.defaillances.filter(d => d.gravite === "critique").length} critique · `}
                  {resultat.defaillances.filter(d => d.gravite === "majeur").length > 0 && `${resultat.defaillances.filter(d => d.gravite === "majeur").length} majeur · `}
                  {resultat.defaillances.filter(d => d.gravite === "mineur").length > 0 && `${resultat.defaillances.filter(d => d.gravite === "mineur").length} mineur · `}
                  ~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €
                </p>
              </div>
            </div>
            {/* E. Lien annonce en haut */}
            <div className="flex items-center gap-2">
              {lienAnnonce ? (
                <a href={lienAnnonce} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Annonce
                </a>
              ) : (
                <div className="flex items-center gap-1">
                  <input type="url" value={lienAnnonce} onChange={(e) => setLienAnnonce(e.target.value)}
                    onBlur={() => save({ lien_annonce: lienAnnonce })}
                    placeholder="+ Lien annonce"
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white/50 w-32 focus:w-48 transition-all focus:border-primary focus:outline-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* B. Résumé défaillances par gravité */}
        {resultat.defaillances.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            {[
              { key: "critique", label: "Critiques", color: "text-red-700 bg-red-50 border-red-200/50" },
              { key: "majeur", label: "Majeures", color: "text-amber-700 bg-amber-50 border-amber-200/50" },
              { key: "mineur", label: "Mineures", color: "text-blue-700 bg-blue-50 border-blue-200/50" },
            ].map(g => {
              const defs = resultat.defaillances.filter(d => d.gravite === g.key);
              if (defs.length === 0) return null;
              const cout = defs.reduce((s, d) => s + (d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2)), 0);
              return (
                <div key={g.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 ${g.color}`}>
                  <span className="font-black tabular-nums">{defs.length}</span>
                  <span className="text-xs font-medium">{g.label}</span>
                  <span className="text-xs tabular-nums opacity-75">~{cout.toLocaleString("fr-FR")} €</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">

          {/* ═══ COLONNE GAUCHE — Analyse CT ═══ */}
          <div className="lg:col-span-2 flex flex-col gap-5 order-2 lg:order-1">
            {/* Photo + Score + coût */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <label className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors shrink-0 overflow-hidden">
                {vehicle.photo_url ? (
                  <img src={vehicle.photo_url} alt={`${a.marque} ${a.modele}`} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoUpload(f);
                }} />
              </label>
              <ScoreGauge score={a.score_sante} size="sm" />
              <div>
                <p className="text-2xl font-black tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</p>
                <p className="text-xs text-muted">{a.defaillances_count} défaillances{a.code_postal && ` — CP ${a.code_postal}`}</p>
                {vin && <p className="text-[10px] text-muted font-mono tracking-wider mt-0.5">{vin}</p>}
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
                {/* Bordereau / facture d'achat — lien direct */}
                {vehicle.documents && vehicle.documents.length > 0 && (() => {
                  const facture = vehicle.documents.find((d: { type: string; url: string; name: string }) => d.type === "facture");
                  return facture ? (
                    <a href={facture.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-medium mt-1 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Bordereau d&apos;achat
                    </a>
                  ) : null;
                })()}
              </div>
            </div>

            {/* 2. Checklist pré-achat — après le bloc photo, pas en premier */}
            {checklistPreAchat && checklistPreAchat.done < checklistPreAchat.total && checklistPreAchat.done > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200/50 rounded-xl">
                <span className="text-xs font-bold text-amber-700 tabular-nums">{checklistPreAchat.done}/{checklistPreAchat.total}</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {checklistPreAchat.items.filter(i => !i.ok).map(i => (
                    <span key={i.label} className="text-[11px] text-amber-700 font-medium">{i.label} manquant</span>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Progression réparations */}
            {(isPostAchat || isVendu) && repProgression.total > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <span className={`text-xs font-bold tabular-nums ${repProgression.done === repProgression.total ? "text-emerald-600" : "text-amber-600"}`}>
                  {repProgression.done}/{repProgression.total}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${repProgression.done === repProgression.total ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${repProgression.total > 0 ? (repProgression.done / repProgression.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[11px] text-muted">{repProgression.done === repProgression.total ? "Toutes faites" : "réparations"}</span>
              </div>
            )}

            {/* 5. Re-scan CT */}
            {(isPostAchat || isVendu) && (
              <label className="flex items-center gap-2 text-xs text-primary hover:text-teal-800 font-medium cursor-pointer transition-colors w-fit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Re-scanner le CT (contre-visite)
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleRescan(f);
                }} />
              </label>
            )}

            {/* Mode réparation */}
            <div className="flex gap-2">
              {[
                { key: "minimum_ct", label: "Minimum CT" },
                { key: "complet", label: "Complet" },
                { key: "personnalise", label: "Personnalisé" },
              ].map((m) => (
                <button key={m.key} onClick={() => { setModeReparation(m.key); save({ mode_reparation: m.key }); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${modeReparation === m.key ? "bg-teal-600 text-white" : "bg-slate-100 text-muted hover:bg-slate-200"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Défaillances */}
            <div className="flex flex-col gap-2">
              {defaillances.sort((x, y) => x.priorite - y.priorite).map((d, idx) => {
                const key = `${d.code}-${idx}`;
                const estimation = d.cout_moyen || Math.round((d.cout_min + d.cout_max) / 2);
                const customPrice = customPrices[key];
                const isExpanded = expandedDef === key;

                const isFaite = reparationsFaites.includes(key);

                return (
                  <div key={key} className={`rounded-xl border transition-colors ${isFaite ? "bg-emerald-50/50 border-emerald-200/50" : d.selected ? "bg-white border-slate-200/60 shadow-sm" : "bg-slate-50 border-transparent opacity-50"}`}>
                    <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                      <input type="checkbox" checked={d.selected} onChange={() => toggleDefaillance(d.code)} className="w-4 h-4 accent-primary rounded shrink-0" />
                      <GraviteBadge gravite={d.gravite} small />
                      <span className={`flex-1 text-sm font-medium ${isFaite ? "line-through text-emerald-600" : d.selected ? "" : "line-through"}`}>{d.libelle}</span>
                      {/* Indicateur note + bouton fait */}
                      {notesDefaillances[key] && <span className="text-[10px] text-blue-500" title="Note présente">✏</span>}
                      {(isPostAchat || isVendu) && d.selected && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRepFaite(key); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${isFaite ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"}`}>
                          {isFaite ? "✓ Fait" : "À faire"}
                        </button>
                      )}
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
                        {/* Note par défaillance */}
                        <textarea value={notesDefaillances[key] || ""}
                          onChange={(e) => setNotesDefaillances({ ...notesDefaillances, [key]: e.target.value })}
                          onBlur={() => updateNoteDefaillance(key, notesDefaillances[key] || "")}
                          placeholder="Ex: Fait le 12/04 chez Garage Martin, 320€..."
                          rows={2}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-primary focus:outline-none transition-colors resize-none" />
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

            {/* Documents */}
            <details className="group">
              <summary className="text-sm font-medium text-foreground cursor-pointer flex items-center justify-between py-2">
                Documents {(vehicle.documents?.length ?? 0) > 0 && <span className="text-xs text-muted font-normal">({vehicle.documents?.length})</span>}
                <svg className="w-4 h-4 text-slate-300 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {vehicle.documents && vehicle.documents.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {vehicle.documents.map((doc) => (
                      <div key={doc.url} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 rounded font-bold uppercase">{doc.type}</span>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-primary hover:underline">{doc.name}</a>
                        <span className="text-[10px] text-muted">{new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}</span>
                        <button onClick={async () => {
                          if (!confirm(`Supprimer "${doc.name}" ?`)) return;
                          const res = await fetch(`/api/dashboard/${id}/upload-doc`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: doc.url }) });
                          if (res.ok) {
                            const { documents } = await res.json();
                            setVehicle(prev => prev ? { ...prev, documents } : prev);
                            toast.show("Document supprimé");
                          }
                        }} className="text-muted hover:text-danger cursor-pointer" aria-label="Supprimer">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "devis", label: "Devis garage" },
                    { key: "facture", label: "Facture" },
                    { key: "carte_grise", label: "Carte grise" },
                    { key: "contre_visite", label: "Contre-visite" },
                    { key: "autre", label: "Autre" },
                  ].map((t) => (
                    <label key={t.key} className="text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-muted hover:bg-slate-50 cursor-pointer transition-colors">
                      + {t.label}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const form = new FormData();
                        form.append("doc", f);
                        form.append("type", t.key);
                        const res = await fetch(`/api/dashboard/${id}/upload-doc`, { method: "POST", body: form });
                        if (res.ok) {
                          const { documents } = await res.json();
                          setVehicle(prev => prev ? { ...prev, documents } : prev);
                          toast.show("Document ajouté");
                        }
                      }} />
                    </label>
                  ))}
                </div>
              </div>
            </details>

            {/* Supprimer */}
            {/* 4. Timeline */}
            {timeline.length > 0 && (
              <details className="group">
                <summary className="text-sm font-medium text-foreground cursor-pointer flex items-center justify-between py-2">
                  Historique ({timeline.length})
                  <svg className="w-4 h-4 text-slate-300 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="flex flex-col gap-1.5 mt-1 pl-3 border-l-2 border-slate-200">
                  {[...timeline].reverse().map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-muted tabular-nums shrink-0">{new Date(t.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
                      <span className="text-foreground">{t.event}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Actions véhicule : dupliquer + supprimer */}
            <div className="flex items-center gap-3 text-xs">
              <button onClick={duplicateVehicle} disabled={duplicating}
                className="text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50">
                {duplicating ? "Duplication..." : "Dupliquer ce véhicule"}
              </button>
              <span className="text-slate-200">|</span>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="text-muted hover:text-danger transition-colors cursor-pointer">
                  Supprimer
                </button>
              ) : null}
            </div>
            {confirmDelete && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200/50 rounded-xl">
                <span className="text-xs text-danger font-medium">Confirmer la suppression ?</span>
                <button onClick={async () => {
                  await fetch(`/api/dashboard/${id}`, { method: "DELETE" });
                  router.push("/dashboard");
                }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer">
                  Oui, supprimer
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer">
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* ═══ COLONNE DROITE — Rentabilité ═══ */}
          <div className="flex flex-col gap-4 order-1 lg:order-2">

            {/* ── D. Prompt intention — uniquement pour les nouveaux véhicules ── */}
            {statut === "a_etudier" && !prixAchat && !prixRevente && !sourceAchat && (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
                <p className="text-sm font-bold mb-3">Que souhaitez-vous faire ?</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setShowFinancier(true); save({ statut: "a_negocier" }, "Mode revente"); setStatut("a_negocier"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer text-left">
                    <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Achat pour revente</p>
                      <p className="text-[11px] text-muted">Calculer le plafond d&apos;enchère et la marge</p>
                    </div>
                  </button>
                  <button onClick={() => { setUsagePerso(true); save({ usage_perso: true, statut: "a_negocier" }, "Mode personnel"); setStatut("a_negocier"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer text-left">
                    <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Achat personnel</p>
                      <p className="text-[11px] text-muted">Calculer le budget max tout compris</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── A. CHIFFRE CLÉ — adapté au statut + usage ── */}
            {isPreAchat && plafondAdjudication !== null && plafondAdjudication > 0 && (
              <div className={`p-5 rounded-2xl shadow-sm border ${usagePerso ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200/50" : "bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200/50"}`}>
                <p className={`text-xs font-medium mb-1 ${usagePerso ? "text-violet-600" : "text-teal-600"}`}>{usagePerso ? "Budget max" : "Enchérir max"}</p>
                <p className={`text-3xl font-black tabular-nums ${usagePerso ? "text-violet-700" : "text-teal-700"}`}>{plafondAdjudication.toLocaleString("fr-FR")} €</p>
                {fraisEnchereEstimes > 0 && (
                  <p className="text-[10px] text-muted mt-1">
                    Frais enchère : {fraisEnchereEstimes.toLocaleString("fr-FR")} €
                    {AUCTION_SOURCES[sourceKey]?.note && ` (${AUCTION_SOURCES[sourceKey].note})`}
                  </p>
                )}
                {!usagePerso && <p className="text-[10px] text-muted">Marge min : {margeMin.toLocaleString("fr-FR")} € | {tvaSurMarge ? "TVA incluse" : "Sans TVA"}</p>}
              </div>
            )}

            {/* Post-achat PERSO — coût total */}
            {isPostAchat && usagePerso && achat > 0 && (
              <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-2xl shadow-sm">
                <p className="text-xs text-violet-600 font-medium mb-1">Coût total</p>
                <p className="text-3xl font-black tabular-nums text-violet-700">{(achat + coutReparations + frais).toLocaleString("fr-FR")} €</p>
                {revente > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">Économie vs budget : {(revente - achat - coutReparations - frais).toLocaleString("fr-FR")} €</p>
                )}
              </div>
            )}

            {/* Post-achat REVENTE — marge */}
            {isPostAchat && !usagePerso && margeNette !== null && (
              <div className={`p-5 rounded-2xl shadow-sm border ${margeNette >= 0 ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50" : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50"}`}>
                <p className="text-xs text-muted font-medium mb-1">Marge nette estimée</p>
                <p className={`text-3xl font-black tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                  {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                </p>
                {rendement !== null && <p className="text-xs text-muted mt-1">Rendement : {rendement}%</p>}
                {deltaPlafond !== null && (
                  <p className={`text-xs font-medium mt-1 ${deltaPlafond >= 0 ? "text-emerald-600" : "text-danger"}`}>
                    {deltaPlafond >= 0 ? `Acheté ${deltaPlafond.toLocaleString("fr-FR")} € sous le plafond` : `Acheté ${Math.abs(deltaPlafond).toLocaleString("fr-FR")} € au-dessus du plafond`}
                  </p>
                )}
                {joursStock > 0 && (
                  <p className={`text-xs mt-1 ${joursStock > 60 ? "text-danger font-medium" : joursStock > 45 ? "text-amber-600 font-medium" : "text-muted"}`}>
                    {joursStock}j en stock
                  </p>
                )}
              </div>
            )}

            {isVendu && !usagePerso && (margeNette !== null || margeReelle !== null) && (
              <div className={`p-5 rounded-2xl shadow-sm border ${(margeReelle ?? margeNette ?? 0) >= 0 ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50" : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50"}`}>
                <p className="text-xs text-muted font-medium mb-1">{margeReelle !== null ? "Marge réelle" : "Bilan final"}</p>
                <p className={`text-3xl font-black tabular-nums ${(margeReelle ?? margeNette ?? 0) >= 0 ? "text-green-600" : "text-danger"}`}>
                  {(margeReelle ?? margeNette ?? 0) >= 0 ? "+" : ""}{(margeReelle ?? margeNette ?? 0).toLocaleString("fr-FR")} €
                </p>
                {rendement !== null && <p className="text-xs text-muted mt-1">Rendement : {rendement}% — {joursStock}j de cycle</p>}
                {ecartMarge && (
                  <p className={`text-xs font-medium mt-1 ${ecartMarge.diff >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {ecartMarge.diff >= 0 ? "+" : ""}{ecartMarge.diff.toLocaleString("fr-FR")} € vs estimation ({ecartMarge.pct >= 0 ? "+" : ""}{ecartMarge.pct}%)
                  </p>
                )}
              </div>
            )}

            {/* ── Documents de vente ── */}
            {(statut === "en_vente" || isVendu) && !usagePerso && (
              <details open className="bg-white rounded-2xl border border-slate-200/60 shadow-sm group">
                <summary className="p-4 text-sm font-bold cursor-pointer flex items-center justify-between">
                  Documents de vente
                  <svg className="w-4 h-4 text-slate-300 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-4">
                  {/* Km à la vente */}
                  <div>
                    <label className="text-xs text-muted">Kilométrage à la vente</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input type="number" inputMode="numeric" value={kmVente}
                        onChange={(e) => { setKmVente(e.target.value); saveDebounced({ km_vente: e.target.value ? parseInt(e.target.value) : null }); }}
                        onBlur={() => save({ km_vente: kmVente ? parseInt(kmVente) : null })}
                        placeholder={a.kilometrage > 0 ? a.kilometrage.toString() : "126 000"}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm tabular-nums focus:border-primary focus:outline-none" />
                      <span className="text-xs text-muted">km</span>
                    </div>
                  </div>

                  {/* Aperçu reçu / facture */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-[10px]">
                    {sellerStatus === "particulier" ? (
                      <div>
                        <p className="text-center font-bold text-xs uppercase tracking-wide mb-3">Reçu de vente</p>
                        <p className="leading-relaxed">
                          Je soussigné <strong>{companyInfo.nom || "________________"}</strong>,
                          {companyInfo.adresse && ` demeurant ${companyInfo.adresse},`} déclare avoir vendu le véhicule{" "}
                          <strong>{a.marque} {a.modele}</strong> ({a.annee}), immatriculé <strong>{a.immatriculation}</strong>
                          {vin && <>, VIN <span className="font-mono">{vin}</span></>}
                          , kilométrage <strong>{kmVente ? `${parseInt(kmVente).toLocaleString("fr-FR")} km` : `${a.kilometrage.toLocaleString("fr-FR")} km`}</strong>,
                          à <strong>{buyerName || "________________"}</strong>,
                          pour le prix de <strong>{(prixVenteReel ? parseFloat(prixVenteReel) : revente).toLocaleString("fr-FR")} €</strong>.
                        </p>
                        <p className="text-slate-400 mt-3">Fait le {dateVente ? new Date(dateVente).toLocaleDateString("fr-FR") : "JJ/MM/AAAA"}</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <p className="font-bold text-[11px]" style={{ color: "#0d9488" }}>{companyInfo.nom || "Société"}</p>
                            {companyInfo.siret && <p className="text-slate-400">SIRET : {companyInfo.siret}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xs">FACTURE</p>
                            <p className="text-slate-400">N° {invoiceNumber || "FAC-2026-..."}</p>
                          </div>
                        </div>
                        <p className="text-slate-500">Acheteur : <strong>{buyerName || "—"}</strong></p>
                        <p className="text-slate-500">{a.marque} {a.modele} — {a.immatriculation} — <strong>{(prixVenteReel ? parseFloat(prixVenteReel) : revente).toLocaleString("fr-FR")} €</strong></p>
                      </div>
                    )}
                  </div>

                  {/* Boutons téléchargement */}
                  <div className="flex flex-col gap-2">
                    {/* Cerfa — toujours disponible */}
                    <CerfaPDFLink data={{
                      vendeur: {
                        type: sellerStatus === "societe" ? "morale" : "physique",
                        nom: companyInfo.nom,
                        sexe: undefined,
                        adresse: companyInfo.adresse,
                        codePostal: "",
                        commune: "",
                        siret: companyInfo.siret,
                      },
                      acheteur: {
                        type: "physique",
                        nom: buyerName,
                        adresse: buyerContact,
                        codePostal: "",
                        commune: "",
                      },
                      vehicle: {
                        immatriculation: a.immatriculation,
                        vin,
                        dateImmat: a.annee,
                        marque: a.marque,
                        typeVariante: "",
                        genre: "VP",
                        denomination: a.modele,
                        km: kmVente ? parseInt(kmVente) : a.kilometrage,
                        certifImmat: true,
                      },
                      dateVente: dateVente ? new Date(dateVente).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
                      heureVente: "",
                      ceder: "ceder",
                    }}>
                      Cerfa 15776 — Certificat de cession
                    </CerfaPDFLink>

                    {/* Reçu (particulier) ou Facture (société) */}
                    {sellerStatus === "particulier" ? (
                      <RecuVentePDFLink data={{
                        vendeur: { nom: companyInfo.nom, adresse: companyInfo.adresse },
                        acheteur: { nom: buyerName, adresse: buyerContact },
                        vehicle: { marque: a.marque, modele: a.modele, immatriculation: a.immatriculation, vin, km: kmVente ? parseInt(kmVente) : a.kilometrage, annee: a.annee },
                        dateVente: dateVente ? new Date(dateVente).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
                        prixVente: prixVenteReel ? parseFloat(prixVenteReel) : revente,
                        modePaiement: "comptant",
                      }}>
                        Reçu de vente
                      </RecuVentePDFLink>
                    ) : invoiceNumber ? (
                      <InvoicePDFLink data={{
                        invoiceNumber,
                        date: dateVente ? new Date(dateVente).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
                        company: companyInfo,
                        vehicle: { marque: a.marque, modele: a.modele, annee: a.annee, vin, immatriculation: a.immatriculation, kilometrage: kmVente ? parseInt(kmVente) : a.kilometrage },
                        seller: { name: companyInfo.nom, contact: "" },
                        buyer: { name: buyerName, contact: buyerContact },
                        prixVenteTTC: prixVenteReel ? parseFloat(prixVenteReel) : revente,
                        coutRevient: achat + coutReparations + frais,
                        tvaRegime,
                        tvaRate: 0.2,
                      }}>
                        Facture {invoiceNumber}
                      </InvoicePDFLink>
                    ) : (
                      <button onClick={async () => {
                        const res = await fetch(`/api/dashboard/${id}/invoice`, { method: "POST" });
                        if (res.ok) {
                          const data = await res.json();
                          setInvoiceNumber(data.invoice_number);
                          toast.show(`Facture ${data.invoice_number} créée`);
                        }
                      }} className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all cursor-pointer">
                        Générer la facture
                      </button>
                    )}
                  </div>

                  {!companyInfo.nom && (
                    <p className="text-[10px] text-amber-600">Renseignez vos infos dans les <a href="/dashboard/parametres" className="underline">Paramètres</a> pour des documents complets.</p>
                  )}
                </div>
              </details>
            )}

            {/* ── Statut pipeline ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Statut</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STATUTS.map((s) => (
                  <button key={s.key} onClick={() => handleStatutChange(s.key)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${statut === s.key ? s.color + " ring-2 ring-offset-1 ring-current" : "bg-slate-50 text-muted hover:bg-slate-100"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              {/* C. Quick achat form */}
              {quickAchatOpen && (
                <div className="mt-3 p-3 bg-teal-50 rounded-xl border border-teal-200/50 flex items-center gap-2">
                  <span className="text-xs text-teal-700 font-medium shrink-0">Prix d&apos;achat :</span>
                  <input type="number" inputMode="numeric" value={quickAchatPrix} autoFocus
                    onChange={(e) => setQuickAchatPrix(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleQuickAchat(); if (e.key === "Escape") setQuickAchatOpen(false); }}
                    placeholder="4 200"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-teal-200 text-sm tabular-nums bg-white focus:border-teal-500 focus:outline-none" />
                  <span className="text-xs text-muted">€</span>
                  <button onClick={handleQuickAchat} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer">OK</button>
                  <button onClick={() => setQuickAchatOpen(false)} className="p-1 text-muted hover:text-foreground cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
              {/* Toggle usage perso */}
              <label className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 cursor-pointer">
                <input type="checkbox" checked={usagePerso} onChange={(e) => { const val = e.target.checked; setUsagePerso(val); save({ usage_perso: val }, val ? "Achat personnel" : "Achat revente"); }}
                  className="w-4 h-4 accent-violet-600 rounded" />
                <span className="text-xs text-muted">Achat personnel <span className="text-violet-600 font-medium">(pas pour revente)</span></span>
              </label>
            </div>

            {/* ── F. Cascade financière (collapsable) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <button onClick={() => setShowFinancier(!showFinancier)}
                className="w-full p-4 flex items-center justify-between cursor-pointer">
                <h3 className="font-bold text-sm">{usagePerso ? "Coût total" : "Rentabilité"}</h3>
                <svg className={`w-4 h-4 text-slate-300 transition-transform ${showFinancier ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showFinancier && <div className="px-4 pb-4">

              {/* Cascade visuelle */}
              {(achat > 0 || revente > 0) && (
                <div className="flex flex-col gap-1 text-xs mb-4 p-3 bg-slate-50 rounded-xl">
                  {usagePerso ? (
                    <>
                      {achat > 0 && (
                        <div className="flex justify-between"><span>Achat</span><span className="font-semibold tabular-nums">{achat.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {coutReparations > 0 && (
                        <div className="flex justify-between"><span>+ Réparations {devisGarage ? "(devis)" : "(estimation)"}</span><span className="font-semibold tabular-nums text-amber-600">+{coutReparations.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {frais > 0 && (
                        <div className="flex justify-between"><span>+ Frais</span><span className="font-semibold tabular-nums text-slate-500">+{frais.toLocaleString("fr-FR")} €</span></div>
                      )}
                      <div className="flex justify-between pt-1.5 mt-1 border-t border-slate-200/60">
                        <span className="font-bold">= Coût total</span>
                        <span className="font-black tabular-nums text-violet-700">{(achat + coutReparations + frais).toLocaleString("fr-FR")} €</span>
                      </div>
                      {revente > 0 && (
                        <div className="flex justify-between mt-1">
                          <span className="text-muted">Budget max</span>
                          <span className="font-semibold tabular-nums">{revente.toLocaleString("fr-FR")} €</span>
                        </div>
                      )}
                      {revente > 0 && achat > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted">Économie</span>
                          <span className={`font-bold tabular-nums ${revente - achat - coutReparations - frais >= 0 ? "text-emerald-600" : "text-danger"}`}>
                            {(revente - achat - coutReparations - frais).toLocaleString("fr-FR")} €
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {revente > 0 && (
                        <div className="flex justify-between"><span>Revente visée</span><span className="font-semibold tabular-nums">{revente.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {achat > 0 && (
                        <div className="flex justify-between"><span>− Achat</span><span className="font-semibold tabular-nums text-slate-600">−{achat.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {coutReparations > 0 && (
                        <div className="flex justify-between"><span>− Réparations {devisGarage ? "(devis)" : "(estimation)"}</span><span className="font-semibold tabular-nums text-amber-600">−{coutReparations.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {frais > 0 && (
                        <div className="flex justify-between"><span>− Frais</span><span className="font-semibold tabular-nums text-slate-500">−{frais.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {tvaMarge > 0 && (
                        <div className="flex justify-between"><span>− TVA marge (20%)</span><span className="font-semibold tabular-nums text-danger">−{tvaMarge.toLocaleString("fr-FR")} €</span></div>
                      )}
                      {margeNette !== null && (
                        <div className="flex justify-between pt-1.5 mt-1 border-t border-slate-200/60">
                          <span className="font-bold">= Marge nette</span>
                          <span className={`font-black tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                            {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Champs — contextuels selon statut */}
              <div className="flex flex-col gap-3">
                {/* Devis — masqué pré-achat sauf showAll */}
                {(isPostAchat || isVendu || showAllFields || !!devisGarage) && (
                  <div>
                    <label className="text-xs text-muted">Devis garage total</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input type="number" inputMode="numeric" value={devisGarage}
                        onChange={(e) => { setDevisGarage(e.target.value); saveDebounced({ devis_garage: e.target.value ? parseFloat(e.target.value) : null, devis_reel: e.target.value ? parseFloat(e.target.value) : null }); }}
                        onBlur={() => save({ devis_garage: devisGarage ? parseFloat(devisGarage) : null, devis_reel: devisGarage ? parseFloat(devisGarage) : null })}
                        placeholder={`~${estimationSelectionnees}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                      <span className="text-sm text-muted">€</span>
                    </div>
                    {!devisGarage && <p className="text-[10px] text-muted mt-0.5">Estimation Vyrdict : ~{estimationSelectionnees} €</p>}
                    {ecartEstimationDevis && (
                      <p className={`text-[10px] mt-0.5 font-medium ${Math.abs(ecartEstimationDevis.pct) <= 15 ? "text-teal-600" : Math.abs(ecartEstimationDevis.pct) <= 30 ? "text-amber-600" : "text-danger"}`}>
                        Vyrdict : ~{estimationSelectionnees} € → écart {ecartEstimationDevis.pct >= 0 ? "+" : ""}{ecartEstimationDevis.pct}% ({ecartEstimationDevis.ecart >= 0 ? "+" : ""}{ecartEstimationDevis.ecart.toLocaleString("fr-FR")} €)
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted">{isPreAchat ? "Budget achat max" : "Prix d'achat"}</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={prixAchat}
                      onChange={(e) => { setPrixAchat(e.target.value); saveDebounced({ prix_achat: e.target.value ? parseFloat(e.target.value) : null }); }}
                      onBlur={() => save({ prix_achat: prixAchat ? parseFloat(prixAchat) : null })}
                      placeholder="6 500"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted">{usagePerso ? "Budget max tout compris" : "Prix de revente visé"}</label>
                    {!usagePerso && <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline font-medium">Cote &rarr;</a>}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={prixRevente}
                      onChange={(e) => { setPrixRevente(e.target.value); saveDebounced({ prix_revente: e.target.value ? parseFloat(e.target.value) : null }); }}
                      onBlur={() => save({ prix_revente: prixRevente ? parseFloat(prixRevente) : null })}
                      placeholder="9 000"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted">Cote marché</label>
                    <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline font-medium">LaCentrale &rarr;</a>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <input type="number" inputMode="numeric" value={coteMarche}
                      onChange={(e) => { setCoteMarche(e.target.value); saveDebounced({ cote_marche: e.target.value ? parseFloat(e.target.value) : null }); }}
                      onBlur={() => {
                        save({ cote_marche: coteMarche ? parseFloat(coteMarche) : null, date_cote: coteMarche && !dateCote ? new Date().toISOString().slice(0, 10) : dateCote || null });
                        if (coteMarche && !dateCote) setDateCote(new Date().toISOString().slice(0, 10));
                      }}
                      placeholder="8 500"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                    <span className="text-sm text-muted">€</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <select value={sourceCote} onChange={(e) => { setSourceCote(e.target.value); save({ source_cote: e.target.value }); }}
                      className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white text-muted cursor-pointer">
                      <option value="">Source...</option>
                      <option value="lacentrale">LaCentrale</option>
                      <option value="argus">Argus</option>
                      <option value="autoscout24">AutoScout24</option>
                      <option value="leboncoin">LeBonCoin</option>
                      <option value="estimation">Mon estimation</option>
                    </select>
                    {dateCote && <span className="text-[10px] text-muted self-center">le {new Date(dateCote).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>

                {/* Frais = total des frais détaillés (colonne gauche) */}
                {totalExpenses > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted px-1">
                    <span>Frais détaillés</span>
                    <span className="font-bold tabular-nums">{totalExpenses.toLocaleString("fr-FR")} €</span>
                  </div>
                )}

                {/* TVA — masquée pour perso */}
                {!usagePerso && (
                  <div>
                    <label className="text-xs text-muted">Régime TVA</label>
                    <select value={tvaRegime} onChange={(e) => { setTvaRegime(e.target.value); save({ tva_regime: e.target.value }); }}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white cursor-pointer">
                      <option value="sans_tva">Sans TVA</option>
                      <option value="tva_sur_marge">TVA sur marge</option>
                      <option value="tva_normale">TVA normale (20%)</option>
                    </select>
                    {tvaRegime === "tva_sur_marge" && <p className="text-[10px] text-muted mt-0.5">Art. 297 A CGI — Biens d&apos;occasion</p>}
                  </div>
                )}

                {/* Marge minimum — pré-achat revente uniquement */}
                {!usagePerso && (isPreAchat || showAllFields || !!margeMinimum) && (
                  <div>
                    <label className="text-xs text-muted">Marge minimum souhaitée</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input type="number" inputMode="numeric" value={margeMinimum}
                        onChange={(e) => { setMargeMinimum(e.target.value); saveDebounced({ marge_minimum: parseFloat(e.target.value) || 0 }); }}
                        onBlur={() => save({ marge_minimum: parseFloat(margeMinimum) || 0 })}
                        placeholder="500"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm tabular-nums" />
                      <span className="text-sm text-muted">€</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle tous les champs */}
              {!showAllFields && (
                <button onClick={() => setShowAllFields(true)} className="text-[11px] text-muted hover:text-primary transition-colors cursor-pointer mt-3">
                  Voir tous les champs &darr;
                </button>
              )}
              </div>}
            </div>

            {/* ── Achat & vente (réorganisé) ── */}
            <details open className="bg-white rounded-2xl border border-slate-200/60 shadow-sm group">
              <summary className="p-4 text-sm font-bold cursor-pointer flex items-center justify-between">
                Achat &amp; vente
                <svg className="w-4 h-4 text-slate-300 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-3">
                {/* Source + vendeur groupés */}
                <div>
                  <label className="text-xs text-muted">Source</label>
                  <select value={sourceAchat} onChange={(e) => {
                    const v = e.target.value;
                    setSourceAchat(v);
                    const updates: Record<string, unknown> = { source_achat: v };
                    if (!sellerName && v) {
                      const labels: Record<string, string> = { alcopa: "Alcopa Auction", bca: "BCA", vpauto: "VPAuto", interencheres: "Interenchères", encheres_vo: "Enchères VO", capcar: "CapCar Pro", planete_auto: "Planète Auto" };
                      if (labels[v]) { setSellerName(labels[v]); updates.seller_name = labels[v]; }
                    }
                    save(updates);
                  }}
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

                {/* Vendeur — juste sous la source */}
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    onBlur={() => save({ seller_name: sellerName })}
                    placeholder="Nom du vendeur"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none" />
                  <input type="text" value={sellerContact}
                    onChange={(e) => setSellerContact(e.target.value)}
                    onBlur={() => save({ seller_contact: sellerContact })}
                    placeholder="Contact vendeur"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-muted focus:border-primary focus:outline-none" />
                </div>

                {/* VIN — toujours visible */}
                <div>
                  <label className="text-xs text-muted">VIN</label>
                  <input type="text" value={vin} maxLength={17}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    onBlur={() => save({ vin })}
                    placeholder="WVWZZZ3CZWE123456"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tracking-wider focus:border-primary focus:outline-none" />
                </div>

                {/* Date enchère — pré-achat */}
                {(isPreAchat || showAllFields || !!dateEnchere) && (
                  <div>
                    <label className="text-xs text-muted">Date enchère</label>
                    <input type="datetime-local" value={dateEnchere} onChange={(e) => setDateEnchere(e.target.value)}
                      onBlur={() => {
                        if (!dateEnchere) { save({ date_enchere: null }); return; }
                        const offset = new Date().getTimezoneOffset();
                        const sign = offset <= 0 ? "+" : "-";
                        const hh = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
                        const mm = (Math.abs(offset) % 60).toString().padStart(2, "0");
                        save({ date_enchere: `${dateEnchere}:00${sign}${hh}:${mm}` });
                      }}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                )}

                {/* Date achat + stockage — post-achat */}
                {(isPostAchat || isVendu || showAllFields || !!dateAchat) && (
                  <>
                    <div className="pt-3 border-t border-slate-100">
                      <label className="text-xs text-muted">Date d&apos;achat</label>
                      <input type="date" value={dateAchat} onChange={(e) => setDateAchat(e.target.value)}
                        onBlur={() => save({ date_achat: dateAchat || null })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                    </div>
                  </>
                )}

                {/* ── Acheteur — visible en vente / vendu ── */}
                {(statut === "vendu" || statut === "en_vente" || showAllFields) && !usagePerso && (
                  <>
                    <div className="pt-3 border-t border-slate-100">
                      <label className="text-xs text-muted font-medium">Acheteur</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="text" value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          onBlur={() => save({ buyer_name: buyerName })}
                          placeholder="Nom de l'acheteur"
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none" />
                        <input type="text" value={buyerContact}
                          onChange={(e) => setBuyerContact(e.target.value)}
                          onBlur={() => save({ buyer_contact: buyerContact })}
                          placeholder="Contact"
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-muted focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted">Prix de vente réel</label>
                      <div className="flex items-center gap-1 mt-1">
                        <input type="number" inputMode="numeric" value={prixVenteReel}
                          onChange={(e) => { setPrixVenteReel(e.target.value); saveDebounced({ prix_vente_reel: e.target.value ? parseFloat(e.target.value) : null }); }}
                          onBlur={() => save({ prix_vente_reel: prixVenteReel ? parseFloat(prixVenteReel) : null })}
                          placeholder={prixRevente || "9 000"}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none tabular-nums" />
                        <span className="text-sm text-muted">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted">Date de vente</label>
                      <input type="date" value={dateVente} onChange={(e) => setDateVente(e.target.value)}
                        onBlur={() => save({ date_vente: dateVente || null })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted">Notes acheteur</label>
                      <textarea value={notesAcheteur} onChange={(e) => setNotesAcheteur(e.target.value)}
                        onBlur={() => save({ notes_acheteur: notesAcheteur })}
                        placeholder="Particulier de Bordeaux, vu via LeBonCoin..."
                        rows={2}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors resize-none" />
                    </div>
                  </>
                )}

                {a.energie && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-medium">{a.energie}</span>
                    {a.puissance_fiscale && <span>{a.puissance_fiscale} CV</span>}
                  </div>
                )}
              </div>
            </details>

            {/* ── Frais détaillés ── */}
            <details className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <summary className="p-4 text-sm font-bold cursor-pointer flex items-center justify-between">
                Frais détaillés {expenses.length > 0 && <span className="text-xs text-muted font-normal">({expenses.length}) — {totalExpenses.toLocaleString("fr-FR")} €</span>}
              </summary>
              <div className="px-4 pb-4">
                {expenses.length > 0 && (
                  <div className="flex flex-col gap-1 mb-3">
                    {expenses.map(e => (
                      <div key={e.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-bold uppercase shrink-0">{e.category.replace("_", " ").slice(0, 6)}</span>
                        <span className="flex-1 truncate">{e.description || "—"}</span>
                        <span className="font-bold tabular-nums shrink-0">{e.amount.toLocaleString("fr-FR")} €</span>
                        <span className="text-[10px] text-muted shrink-0">{new Date(e.date).toLocaleDateString("fr-FR")}</span>
                        <button onClick={async () => {
                          await fetch(`/api/dashboard/${id}/expenses`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expense_id: e.id }) });
                          setExpenses(prev => prev.filter(x => x.id !== e.id));
                        }} className="text-muted hover:text-danger cursor-pointer shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <select value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value)}
                      className="text-xs px-2 py-2 rounded-lg border border-slate-200 bg-white cursor-pointer flex-1">
                      <option value="transport">Transport</option>
                      <option value="remise_en_etat">Remise en état</option>
                      <option value="controle_technique">CT</option>
                      <option value="carte_grise">Carte grise</option>
                      <option value="autre">Autre</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="number" inputMode="numeric" value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        placeholder="Montant"
                        className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-xs tabular-nums" />
                      <span className="text-xs text-muted">€</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newExpenseDesc}
                      onChange={(e) => setNewExpenseDesc(e.target.value)}
                      placeholder="Description (optionnel)..."
                      className="flex-1 px-2 py-2 rounded-lg border border-slate-200 text-xs" />
                    <button onClick={async () => {
                      if (!newExpenseAmount) return;
                      const res = await fetch(`/api/dashboard/${id}/expenses`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ category: newExpenseCategory, amount: parseFloat(newExpenseAmount), description: newExpenseDesc }),
                      });
                      if (res.ok) {
                        const expRes = await fetch(`/api/dashboard/${id}/expenses`);
                        if (expRes.ok) setExpenses(await expRes.json());
                        setNewExpenseAmount(""); setNewExpenseDesc("");
                        toast.show("Frais ajouté");
                      }
                    }} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer shrink-0">
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </details>

          </div>
        </div>
      </main>
    </div>
  );
}
