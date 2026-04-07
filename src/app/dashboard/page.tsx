"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function getMargeNette(v: VehicleRow): number | null {
  if (!v.prix_achat || !v.prix_revente) return null;
  const reparations = v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
  const stockDays = v.date_achat ? daysSince(v.date_achat) || 0 : 0;
  const coutStock = stockDays * (v.cout_stockage_jour || 0);
  const margeBrute = v.prix_revente - v.prix_achat - reparations - (v.frais_annexes || 0) - coutStock;
  const tvaMarge = v.prix_revente > v.prix_achat ? Math.round((v.prix_revente - v.prix_achat) * 0.2) : 0;
  return margeBrute - tvaMarge;
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "marge" | "score" | "stock">("date");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const fetchVehicles = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) setVehicles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const quickPass = useCallback(async (id: string) => {
    await fetch(`/api/dashboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "passe" }),
    });
    fetchVehicles();
  }, [fetchVehicles]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
  };

  const displayVehicles = useMemo(() => {
    let list = vehicles;
    if (filter !== "all") list = list.filter((v) => v.statut === filter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((v) => {
        const a = v.analyses;
        if (!a) return false;
        return `${a.marque} ${a.modele} ${a.immatriculation} ${a.annee}`.toLowerCase().includes(s);
      });
    }
    return [...list].sort((a, b) => {
      if (sortBy === "marge") return (getMargeNette(b) || -99999) - (getMargeNette(a) || -99999);
      if (sortBy === "score") return (b.analyses?.score_sante || 0) - (a.analyses?.score_sante || 0);
      if (sortBy === "stock") return (daysSince(b.date_achat) || 0) - (daysSince(a.date_achat) || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [vehicles, filter, search, sortBy]);

  const stats = useMemo(() => {
    const actifs = vehicles.filter((v) => !["passe", "vendu"].includes(v.statut));
    const vendus = vehicles.filter((v) => v.statut === "vendu");
    return {
      total: vehicles.length,
      actifs: actifs.length,
      achetes: vehicles.filter((v) => ["achete", "en_reparation", "en_vente"].includes(v.statut)).length,
      margeTotal: vendus.reduce((sum, v) => sum + (getMargeNette(v) || 0), 0),
      alerteStock: actifs.filter((v) => v.date_achat && (daysSince(v.date_achat) || 0) > 45).length,
    };
  }, [vehicles]);

  // Meilleur deal — véhicule avec la meilleure marge potentielle
  const bestDeal = useMemo(() => {
    const candidates = vehicles.filter((v) => !["passe", "vendu"].includes(v.statut) && v.analyses);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, v) => {
      const m = getMargeNette(v);
      const bm = getMargeNette(best);
      return (m || 0) > (bm || 0) ? v : best;
    });
  }, [vehicles]);

  const hasEnoughData = stats.total >= 5;

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      {/* Header simplifié */}
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-bold text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/scan"
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-[transform,box-shadow]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Scanner</span>
            </Link>
            <div className="relative">
              <button onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} className="p-2 text-muted hover:text-danger transition-colors cursor-pointer" title="Menu">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
              </button>
              {showLogoutConfirm && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 w-40">
                  <Link href="/" className="block text-xs px-3 py-2 text-muted hover:bg-slate-50 rounded-lg">Site public</Link>
                  <button onClick={logout} className="w-full text-left text-xs px-3 py-2 text-danger hover:bg-red-50 rounded-lg cursor-pointer">Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* KPIs — uniquement si 5+ véhicules */}
        {hasEnoughData && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            {[
              { label: "Analysés", value: stats.total, color: "text-foreground" },
              { label: "En cours", value: stats.actifs, color: "text-blue-600" },
              { label: "Achetés", value: stats.achetes, color: "text-teal-600" },
              { label: "Marge", value: `${stats.margeTotal.toLocaleString("fr-FR")} €`, color: stats.margeTotal >= 0 ? "text-emerald-600" : "text-danger" },
              { label: "Alertes", value: stats.alerteStock, color: stats.alerteStock > 0 ? "text-danger" : "text-muted" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200/60 px-4 py-2.5 shadow-sm shrink-0">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Meilleur deal */}
        {bestDeal && bestDeal.analyses && getMargeNette(bestDeal) !== null && (getMargeNette(bestDeal) || 0) > 0 && (
          <Link href={`/dashboard/${bestDeal.id}`}
            className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-4 mb-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-lg">&#11088;</span>
              <div>
                <p className="text-xs text-muted font-medium">Meilleur deal</p>
                <p className="font-bold text-foreground">{bestDeal.analyses.marque} {bestDeal.analyses.modele} <span className="text-muted font-normal text-sm">{bestDeal.analyses.annee}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-600 tabular-nums">+{(getMargeNette(bestDeal) || 0).toLocaleString("fr-FR")} €</p>
              <p className="text-[10px] text-muted">marge nette</p>
            </div>
          </Link>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-primary focus:outline-none transition-colors" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white cursor-pointer">
            <option value="date">Plus récent</option>
            <option value="marge">Meilleure marge</option>
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

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-muted">Chargement...</div>
        ) : displayVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-foreground font-semibold text-lg">{search ? "Aucun résultat" : "Scannez votre premier CT"}</p>
            <p className="text-sm text-muted mt-1 mb-4">{search ? `Aucun véhicule ne correspond à "${search}"` : "Analysez un contrôle technique pour commencer"}</p>
            <Link href="/dashboard/scan" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Scanner un CT &rarr;
            </Link>
          </div>
        ) : (
          /* ─── TABLEAU (défaut) ─── */
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[11px] text-muted uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Véhicule</th>
                  <th className="px-3 py-3 font-medium hidden sm:table-cell">Score</th>
                  <th className="px-3 py-3 font-medium">Réparations</th>
                  <th className="px-3 py-3 font-medium hidden sm:table-cell">Marge</th>
                  <th className="px-3 py-3 font-medium hidden md:table-cell">Stock</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                  <th className="px-3 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {displayVehicles.map((v) => {
                  const a = v.analyses;
                  if (!a) return null;
                  const margeNette = getMargeNette(v);
                  const days = daysSince(v.date_achat);
                  const statut = STATUTS[v.statut] || STATUTS.a_etudier;
                  const isAlerte = days !== null && days > 45;

                  return (
                    <tr key={v.id}
                      className={`border-t border-slate-100 hover:bg-slate-50/50 cursor-pointer border-l-4 ${statut.border}`}
                      onClick={() => router.push(`/dashboard/${v.id}`)}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{a.marque} {a.modele}</div>
                        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                          {a.annee && <span>{a.annee}</span>}
                          {a.immatriculation && <span className="font-mono">{a.immatriculation}</span>}
                          {a.energie && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">{a.energie}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white ${a.score_sante >= 70 ? "bg-teal-500" : a.score_sante >= 40 ? "bg-amber-500" : "bg-red-500"}`}>
                          {a.score_sante}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-bold tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</div>
                        <div className="text-[10px] text-muted">{a.defaillances_count} déf.</div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        {margeNette !== null ? (
                          <span className={`font-bold tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                            {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                          </span>
                        ) : <span className="text-muted text-xs">—</span>}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        {days !== null ? (
                          <span className={`text-xs font-medium ${days > 60 ? "text-danger" : days > 45 ? "text-amber-600" : "text-muted"}`}>
                            {days}j {isAlerte && "⚠"}
                          </span>
                        ) : <span className="text-muted text-xs">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statut.color}`}>{statut.label}</span>
                      </td>
                      <td className="px-3 py-3">
                        {v.statut !== "passe" && v.statut !== "vendu" && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); quickPass(v.id); }}
                            className="text-[10px] px-2 py-1 rounded-lg text-muted hover:bg-red-50 hover:text-danger transition-colors cursor-pointer"
                            title="Passer">
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
