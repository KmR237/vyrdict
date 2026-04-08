"use client";

import { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { calcMaxAdjudication } from "@/lib/auction-fees";

interface VehicleRow {
  id: string;
  created_at: string;
  statut: string;
  prix_achat: number | null;
  prix_revente: number | null;
  devis_garage: number | null;
  frais_annexes: number;
  estimation_vyrdict: number | null;
  devis_reel: number | null;
  date_achat: string | null;
  cout_stockage_jour: number;
  source_achat: string;
  notes: string;
  date_enchere: string | null;
  tva_sur_marge: boolean | null;
  marge_minimum: number | null;
  lien_annonce: string;
  frais_enchere_pct: number | null;
  frais_enchere_fixes: number | null;
  mode_enchere: string | null;
  analyses: {
    marque: string;
    modele: string;
    immatriculation: string;
    annee: string;
    score_sante: number;
    cout_total_min: number;
    cout_total_max: number;
    verdict: string;
    defaillances_count: number;
    energie: string;
    puissance_fiscale: string;
  } | null;
}

const STATUTS: Record<string, { label: string; color: string; border: string }> = {
  a_etudier: { label: "À étudier", color: "bg-slate-100 text-slate-600", border: "border-l-slate-300" },
  a_negocier: { label: "À négocier", color: "bg-blue-100 text-blue-700", border: "border-l-blue-400" },
  offre_faite: { label: "Offre faite", color: "bg-purple-100 text-purple-700", border: "border-l-purple-400" },
  achete: { label: "Acheté", color: "bg-teal-100 text-teal-700", border: "border-l-teal-500" },
  en_reparation: { label: "En réparation", color: "bg-amber-100 text-amber-700", border: "border-l-amber-400" },
  en_vente: { label: "En vente", color: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-500" },
  vendu: { label: "Vendu", color: "bg-green-100 text-green-700", border: "border-l-green-500" },
  passe: { label: "Passé", color: "bg-stone-100 text-stone-500", border: "border-l-stone-300" },
};

const SOURCE_LABELS: Record<string, string> = {
  alcopa: "ALC", bca: "BCA", vpauto: "VP", interencheres: "IE",
  encheres_vo: "EVO", capcar: "CAP", planete_auto: "PA",
  particulier: "PART", mandataire: "MAND", autre: "?",
};

const STATUT_ORDER: Record<string, number> = {
  a_etudier: 0, a_negocier: 1, offre_faite: 2,
  achete: 3, en_reparation: 4, en_vente: 5,
  vendu: 6, passe: 7,
};

const NEXT_STATUT: Record<string, { key: string; label: string; needsPrice?: "achat" | "vente" }> = {
  a_etudier: { key: "a_negocier", label: "Négocier" },
  a_negocier: { key: "achete", label: "Acheté", needsPrice: "achat" },
  offre_faite: { key: "achete", label: "Acheté", needsPrice: "achat" },
  achete: { key: "en_reparation", label: "En répa" },
  en_reparation: { key: "en_vente", label: "En vente" },
  en_vente: { key: "vendu", label: "Vendu", needsPrice: "vente" },
};

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function getEnchereBadge(dateStr: string | null): { label: string; color: string } | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (date.getTime() < Date.now()) return null;
  // Comparer par jour calendaire (pas par heures)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { label: `Auj. ${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`, color: "bg-red-100 text-red-700" };
  if (diffDays === 1) return { label: `Dem. ${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`, color: "bg-amber-100 text-amber-700" };
  if (diffDays <= 7) return { label: `${date.toLocaleDateString("fr-FR", { weekday: "short" })} ${date.getHours()}h`, color: "bg-blue-100 text-blue-700" };
  return { label: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), color: "bg-slate-100 text-muted" };
}

function getMargeNette(v: VehicleRow): number | null {
  if (!v.prix_achat || !v.prix_revente) return null;
  const rep = v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
  const frais = v.frais_annexes ?? 350;
  const stock = v.date_achat ? (daysSince(v.date_achat) || 0) * (v.cout_stockage_jour || 0) : 0;
  const tva = (v.tva_sur_marge === true) && v.prix_revente > v.prix_achat ? Math.round((v.prix_revente - v.prix_achat) * 0.2) : 0;
  return v.prix_revente - v.prix_achat - rep - frais - stock - tva;
}

function getPlafond(v: VehicleRow): number | null {
  if (!v.prix_revente) return null;
  const rep = v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
  const frais = v.frais_annexes ?? 350;
  const margeMin = v.marge_minimum ?? 500;
  const achat = v.prix_achat || 0;
  const tvaMarge = (v.tva_sur_marge === true) && v.prix_revente > achat && achat > 0
    ? Math.round((v.prix_revente - achat) * 0.2) : 0;
  const budget = v.prix_revente - rep - frais - margeMin - tvaMarge;
  if (budget <= 0) return null;
  const sourceKey = v.source_achat === "alcopa" ? `alcopa_${v.mode_enchere || "ligne"}` : v.source_achat;
  return calcMaxAdjudication(
    budget,
    sourceKey || "particulier",
    v.frais_enchere_pct ?? undefined,
    v.frais_enchere_fixes ?? undefined
  );
}

function getCoutReparations(v: VehicleRow): number {
  return v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
}

type SortKey = "statut" | "date" | "marge" | "score" | "stock" | "enchere";
const VALID_SORTS: SortKey[] = ["statut", "date", "marge", "score", "stock", "enchere"];

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center text-muted">Chargement...</div>}>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [quickPriceId, setQuickPriceId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState("");
  const [quickPriceType, setQuickPriceType] = useState<"achat" | "vente">("achat");
  const [quickDateId, setQuickDateId] = useState<string | null>(null);
  const [quickDateValue, setQuickDateValue] = useState("");
  const quickPriceRef = useRef<HTMLInputElement>(null);
  const quickDateRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter & sort from URL search params
  const filter = searchParams.get("filter") || "all";
  const sortBy = (VALID_SORTS.includes(searchParams.get("sort") as SortKey) ? searchParams.get("sort") : "statut") as SortKey;
  const search = searchParams.get("q") || "";

  const setParam = useCallback((key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setFilter = useCallback((v: string) => setParam("filter", v, "all"), [setParam]);
  const setSortBy = useCallback((v: string) => setParam("sort", v, "statut"), [setParam]);
  const setSearch = useCallback((v: string) => setParam("q", v, ""), [setParam]);

  const fetchVehicles = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) setVehicles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const updateVehicle = useCallback(async (id: string, updates: Record<string, unknown>) => {
    await fetch(`/api/dashboard/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    fetchVehicles();
  }, [fetchVehicles]);

  const quickPass = useCallback(async (id: string) => {
    await updateVehicle(id, { statut: "passe" });
  }, [updateVehicle]);

  const handleQuickAdvance = useCallback((id: string, nextKey: string, needsPrice?: "achat" | "vente") => {
    if (needsPrice) {
      setQuickPriceId(id);
      setQuickPriceType(needsPrice);
      setQuickPriceValue("");
      setTimeout(() => quickPriceRef.current?.focus(), 50);
    } else {
      const updates: Record<string, unknown> = { statut: nextKey };
      if (nextKey === "achete") updates.date_achat = new Date().toISOString().slice(0, 10);
      updateVehicle(id, updates);
    }
  }, [updateVehicle]);

  const submitQuickPrice = useCallback(async (id: string, nextKey: string) => {
    const price = parseFloat(quickPriceValue);
    if (!price || price <= 0) return;
    const updates: Record<string, unknown> = { statut: nextKey };
    if (quickPriceType === "achat") {
      updates.prix_achat = price;
      updates.date_achat = new Date().toISOString().slice(0, 10);
    } else {
      updates.prix_vente_reel = price;
    }
    await updateVehicle(id, updates);
    setQuickPriceId(null);
    setQuickPriceValue("");
  }, [quickPriceValue, quickPriceType, updateVehicle]);

  const openQuickDate = useCallback((id: string, currentDate: string | null) => {
    setQuickDateId(id);
    if (currentDate) {
      const d = new Date(currentDate);
      setQuickDateValue(`${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}T${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
    } else {
      setQuickDateValue("");
    }
    setTimeout(() => quickDateRef.current?.focus(), 50);
  }, []);

  const submitQuickDate = useCallback(async (id: string) => {
    if (!quickDateValue) {
      await updateVehicle(id, { date_enchere: null });
    } else {
      const offset = new Date().getTimezoneOffset();
      const sign = offset <= 0 ? "+" : "-";
      const hh = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
      const mm = (Math.abs(offset) % 60).toString().padStart(2, "0");
      await updateVehicle(id, { date_enchere: `${quickDateValue}:00${sign}${hh}:${mm}` });
    }
    setQuickDateId(null);
    setQuickDateValue("");
  }, [quickDateValue, updateVehicle]);

  const logout = async () => { await fetch("/api/auth", { method: "DELETE" }); router.push("/"); };

  const displayVehicles = useMemo(() => {
    let list = vehicles;
    if (filter !== "all") list = list.filter((v) => v.statut === filter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((v) => v.analyses && `${v.analyses.marque} ${v.analyses.modele} ${v.analyses.immatriculation} ${v.analyses.annee} ${v.source_achat}`.toLowerCase().includes(s));
    }
    return [...list].sort((a, b) => {
      if (sortBy === "statut") { const d = (STATUT_ORDER[a.statut] ?? 99) - (STATUT_ORDER[b.statut] ?? 99); return d !== 0 ? d : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); }
      if (sortBy === "enchere") return (a.date_enchere ? new Date(a.date_enchere).getTime() : Infinity) - (b.date_enchere ? new Date(b.date_enchere).getTime() : Infinity);
      if (sortBy === "marge") return (getMargeNette(b) || -99999) - (getMargeNette(a) || -99999);
      if (sortBy === "score") return (b.analyses?.score_sante || 0) - (a.analyses?.score_sante || 0);
      if (sortBy === "stock") return (daysSince(b.date_achat) || 0) - (daysSince(a.date_achat) || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [vehicles, filter, search, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const actifs = vehicles.filter((v) => !["passe", "vendu"].includes(v.statut));
    const vendus = vehicles.filter((v) => v.statut === "vendu");
    const achetes = vehicles.filter((v) => ["achete", "en_reparation", "en_vente"].includes(v.statut));
    const encheresAujourdhui = vehicles.filter((v) => { const b = getEnchereBadge(v.date_enchere); return b && b.color.includes("red"); });
    return {
      total: vehicles.length,
      actifs: actifs.length,
      investiTotal: achetes.reduce((s, v) => s + (v.prix_achat || 0), 0),
      margeTotal: vendus.reduce((s, v) => s + (getMargeNette(v) || 0), 0),
      margeMoyenne: vendus.length > 0 ? Math.round(vendus.reduce((s, v) => s + (getMargeNette(v) || 0), 0) / vendus.length) : 0,
      alerteStock: actifs.filter((v) => v.date_achat && (daysSince(v.date_achat) || 0) > 45).length,
      encheresAujourdhui: encheresAujourdhui.length,
      aTraiter: vehicles.filter((v) => ["a_etudier", "a_negocier"].includes(v.statut)).length,
    };
  }, [vehicles]);

  const bestDeal = useMemo(() => {
    const c = vehicles.filter((v) => ["a_etudier", "a_negocier", "offre_faite"].includes(v.statut) && v.analyses);
    if (c.length === 0) return null;
    return c.reduce((best, v) => ((getMargeNette(v) || 0) > (getMargeNette(best) || 0) ? v : best));
  }, [vehicles]);

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-bold text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/scan" className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-[transform,box-shadow]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">Scanner</span>
            </Link>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-muted hover:text-foreground transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 w-40">
                  <Link href="/" className="block text-xs px-3 py-2 text-muted hover:bg-slate-50 rounded-lg" onClick={() => setShowMenu(false)}>Site public</Link>
                  <button onClick={logout} className="w-full text-left text-xs px-3 py-2 text-danger hover:bg-red-50 rounded-lg cursor-pointer">Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* ═══ BLOC "AUJOURD'HUI" ═══ */}
        {(stats.encheresAujourdhui > 0 || stats.aTraiter > 0 || stats.alerteStock > 0) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.encheresAujourdhui > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200/50 rounded-xl text-sm">
                <span className="text-red-600 font-black tabular-nums">{stats.encheresAujourdhui}</span>
                <span className="text-red-700 font-medium">enchère{stats.encheresAujourdhui > 1 ? "s" : ""} aujourd&apos;hui</span>
              </div>
            )}
            {stats.aTraiter > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200/50 rounded-xl text-sm">
                <span className="text-blue-600 font-black tabular-nums">{stats.aTraiter}</span>
                <span className="text-blue-700 font-medium">véhicule{stats.aTraiter > 1 ? "s" : ""} à traiter</span>
              </div>
            )}
            {stats.alerteStock > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-xl text-sm">
                <span className="text-amber-600 font-black tabular-nums">{stats.alerteStock}</span>
                <span className="text-amber-700 font-medium">stock critique</span>
              </div>
            )}
          </div>
        )}

        {/* ═══ RÉSUMÉ FINANCIER ═══ */}
        {stats.total >= 3 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            {[
              { label: "À traiter", value: stats.aTraiter, color: "text-blue-600" },
              { label: "Investi", value: `${stats.investiTotal.toLocaleString("fr-FR")} €`, color: "text-foreground" },
              { label: "Marge totale", value: `${stats.margeTotal.toLocaleString("fr-FR")} €`, color: stats.margeTotal >= 0 ? "text-emerald-600" : "text-danger" },
              { label: "Marge moy.", value: `${stats.margeMoyenne.toLocaleString("fr-FR")} €`, color: "text-muted" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200/60 px-4 py-2.5 shadow-sm shrink-0">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ═══ MEILLEUR DEAL ═══ */}
        {bestDeal && bestDeal.analyses && (getMargeNette(bestDeal) || 0) > 0 && (
          <Link href={`/dashboard/${bestDeal.id}`} className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-4 mb-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-lg">&#11088;</span>
              <div>
                <p className="text-xs text-muted font-medium">Meilleur deal</p>
                <p className="font-bold text-foreground">{bestDeal.analyses.marque} {bestDeal.analyses.modele} <span className="text-muted font-normal text-sm">{bestDeal.analyses.annee}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-600 tabular-nums">+{(getMargeNette(bestDeal) || 0).toLocaleString("fr-FR")} €</p>
            </div>
          </Link>
        )}

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-primary focus:outline-none transition-colors" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white cursor-pointer">
            <option value="statut">Par statut</option>
            <option value="enchere">Prochaine enchère</option>
            <option value="marge">Meilleure marge</option>
            <option value="date">Plus récent</option>
            <option value="score">Score santé</option>
            <option value="stock">Jours en stock</option>
          </select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button onClick={() => setFilter("all")} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-foreground text-white" : "bg-white text-muted hover:bg-slate-100 border border-slate-200/60"}`}>
            Tous ({vehicles.length})
          </button>
          {Object.entries(STATUTS).map(([key, { label }]) => {
            const count = vehicles.filter((v) => v.statut === key).length;
            if (count === 0) return null;
            return (
              <button key={key} onClick={() => setFilter(key)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${filter === key ? "bg-foreground text-white" : "bg-white text-muted hover:bg-slate-100 border border-slate-200/60"}`}>
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <div className="text-center py-20 text-muted">Chargement...</div>
        ) : displayVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <p className="text-foreground font-semibold text-lg">{search ? "Aucun résultat" : "Scannez votre premier CT"}</p>
            <p className="text-sm text-muted mt-1 mb-4">{search ? `Rien pour "${search}"` : "Analysez un contrôle technique pour commencer"}</p>
            <Link href="/dashboard/scan" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Scanner un CT &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayVehicles.map((v) => {
              const a = v.analyses;
              if (!a) return null;
              const margeNette = getMargeNette(v);
              const plafond = getPlafond(v);
              const days = daysSince(v.date_achat);
              const statut = STATUTS[v.statut] || STATUTS.a_etudier;
              const isPreAchat = ["a_etudier", "a_negocier", "offre_faite"].includes(v.statut);
              const isPostAchat = ["achete", "en_reparation", "en_vente"].includes(v.statut);
              const isExpanded = expandedId === v.id;
              const enchereBadge = getEnchereBadge(v.date_enchere);
              const coutRep = getCoutReparations(v);
              const hasDevisReel = !!(v.devis_garage || v.devis_reel);
              const nextStatut = NEXT_STATUT[v.statut];
              const isQuickPrice = quickPriceId === v.id;

              return (
                <div key={v.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden border-l-4 ${statut.border} ${v.statut === "passe" ? "opacity-40" : ""}`}>
                  {/* Ligne principale */}
                  <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}>
                    {/* Véhicule + infos contextuelles */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{a.marque} {a.modele}</span>
                        <span className="text-xs text-muted">{a.annee}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statut.color}`}>{statut.label}</span>
                        {enchereBadge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${enchereBadge.color}`}>{enchereBadge.label}</span>}
                      </div>
                      {/* Ligne contextuelle selon statut */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Source badge */}
                        {v.source_achat && SOURCE_LABELS[v.source_achat] && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold tracking-wide">{SOURCE_LABELS[v.source_achat]}</span>
                        )}
                        {/* Pré-achat : coût répa + date enchère */}
                        {isPreAchat && (
                          <>
                            <span className="text-[11px] text-muted">
                              répa ~{coutRep.toLocaleString("fr-FR")} €
                            </span>
                            {v.date_enchere ? (
                              <button onClick={(e) => { e.stopPropagation(); openQuickDate(v.id, v.date_enchere); }}
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors" title="Modifier la date">
                                {new Date(v.date_enchere).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} {new Date(v.date_enchere).getHours()}h{new Date(v.date_enchere).getMinutes().toString().padStart(2, "0")}
                              </button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); openQuickDate(v.id, null); }}
                                className="text-[11px] text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" title="Ajouter une date d'enchère">
                                + date enchère
                              </button>
                            )}
                          </>
                        )}
                        {/* Post-achat : jours stock + indicateur devis */}
                        {isPostAchat && (
                          <>
                            {days !== null && (
                              <span className={`text-[11px] font-medium ${days > 60 ? "text-danger" : days > 45 ? "text-amber-600" : "text-muted"}`}>
                                {days}j stock
                              </span>
                            )}
                            <span className={`text-[11px] ${hasDevisReel ? "text-teal-600" : "text-amber-500"}`}>
                              {hasDevisReel ? "devis ✓" : "estimation"}
                            </span>
                          </>
                        )}
                        {/* Vendu : résultat final */}
                        {v.statut === "vendu" && days !== null && (
                          <span className="text-[11px] text-muted">{days}j cycle</span>
                        )}
                        {/* Lien annonce */}
                        {v.lien_annonce && isPreAchat && (
                          <a href={v.lien_annonce} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:text-teal-800 transition-colors" title="Voir l'annonce">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Chiffre clé — adapté au statut */}
                    <div className="text-right shrink-0">
                      {isPreAchat && plafond ? (
                        <div>
                          <p className="text-sm font-black tabular-nums text-teal-700">{plafond.toLocaleString("fr-FR")} €</p>
                          <p className="text-[10px] text-muted">enchérir max</p>
                        </div>
                      ) : margeNette !== null ? (
                        <div>
                          <p className={`text-sm font-black tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                            {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                          </p>
                          <p className="text-[10px] text-muted">marge</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold tabular-nums">~{coutRep.toLocaleString("fr-FR")} €</p>
                          <p className="text-[10px] text-muted">{a.defaillances_count} déf.</p>
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <svg className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Quick price inline form */}
                  {isQuickPrice && (
                    <div className="px-3 sm:px-4 py-2.5 border-t border-teal-100 bg-teal-50/50 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-teal-700 font-medium shrink-0">
                        {quickPriceType === "achat" ? "Prix d'achat :" : "Prix de vente :"}
                      </span>
                      <input ref={quickPriceRef} type="number" inputMode="numeric" value={quickPriceValue}
                        onChange={(e) => setQuickPriceValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitQuickPrice(v.id, nextStatut!.key); if (e.key === "Escape") setQuickPriceId(null); }}
                        placeholder="6 500"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-teal-200 text-sm tabular-nums focus:border-teal-500 focus:outline-none bg-white" />
                      <span className="text-xs text-muted">€</span>
                      <button onClick={() => submitQuickPrice(v.id, nextStatut!.key)}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer">
                        OK
                      </button>
                      <button onClick={() => setQuickPriceId(null)}
                        className="p-1.5 text-muted hover:text-foreground transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}

                  {/* Quick date inline form */}
                  {quickDateId === v.id && (
                    <div className="px-3 sm:px-4 py-2.5 border-t border-blue-100 bg-blue-50/50 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-blue-700 font-medium shrink-0">Date enchère :</span>
                      <input ref={quickDateRef} type="datetime-local" value={quickDateValue}
                        onChange={(e) => setQuickDateValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitQuickDate(v.id); if (e.key === "Escape") setQuickDateId(null); }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-blue-200 text-sm focus:border-blue-500 focus:outline-none bg-white" />
                      <button onClick={() => submitQuickDate(v.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
                        OK
                      </button>
                      {v.date_enchere && (
                        <button onClick={() => { updateVehicle(v.id, { date_enchere: null }); setQuickDateId(null); }}
                          className="px-2.5 py-1.5 text-xs text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                          Suppr.
                        </button>
                      )}
                      <button onClick={() => setQuickDateId(null)}
                        className="p-1.5 text-muted hover:text-foreground transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}

                  {/* Ligne expansible */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs text-muted">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {a.immatriculation && <span className="font-mono">{a.immatriculation}</span>}
                        {a.energie && <span>{a.energie}</span>}
                        <span>Score : <strong className={a.score_sante >= 70 ? "text-teal-600" : a.score_sante >= 40 ? "text-amber-600" : "text-danger"}>{a.score_sante}/100</strong></span>
                        <span>Réparations : <strong>~{coutRep.toLocaleString("fr-FR")} €</strong> {hasDevisReel ? <span className="text-teal-600">(devis réel)</span> : <span className="text-amber-500">(estimation)</span>}</span>
                        {days !== null && <span className={days > 45 ? "text-amber-600 font-medium" : ""}>Stock : {days}j</span>}
                        {margeNette !== null && <span>Marge nette : <strong className={margeNette >= 0 ? "text-emerald-600" : "text-danger"}>{margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €</strong></span>}
                        {isPreAchat && plafond && <span>Plafond : <strong className="text-teal-700">{plafond.toLocaleString("fr-FR")} €</strong></span>}
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {/* Bouton avancer statut */}
                        {nextStatut && v.statut !== "passe" && (
                          <button onClick={(e) => { e.stopPropagation(); handleQuickAdvance(v.id, nextStatut.key, nextStatut.needsPrice); }}
                            className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer">
                            {nextStatut.label} &rarr;
                          </button>
                        )}
                        {v.lien_annonce && (
                          <a href={v.lien_annonce} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-primary hover:bg-teal-50 transition-colors font-medium">
                            Annonce &rarr;
                          </a>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/${v.id}`); }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium cursor-pointer">
                          Ouvrir la fiche
                        </button>
                        {v.statut !== "passe" && v.statut !== "vendu" && (
                          <button onClick={(e) => { e.stopPropagation(); quickPass(v.id); }}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-muted hover:bg-red-50 hover:text-danger transition-colors cursor-pointer">
                            Passer
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
