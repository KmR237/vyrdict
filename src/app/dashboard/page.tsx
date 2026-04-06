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

const STATUTS: Record<string, { label: string; color: string }> = {
  a_etudier: { label: "À étudier", color: "bg-slate-100 text-slate-600" },
  a_negocier: { label: "À négocier", color: "bg-blue-100 text-blue-700" },
  offre_faite: { label: "Offre faite", color: "bg-purple-100 text-purple-700" },
  achete: { label: "Acheté", color: "bg-teal-100 text-teal-700" },
  en_reparation: { label: "En réparation", color: "bg-amber-100 text-amber-700" },
  en_vente: { label: "En vente", color: "bg-emerald-100 text-emerald-700" },
  vendu: { label: "Vendu", color: "bg-green-100 text-green-700" },
  passe: { label: "Passé", color: "bg-stone-100 text-stone-500" },
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
  // TVA sur marge (20% sur la différence revente - achat, si positive)
  const tvaMarge = v.prix_revente > v.prix_achat ? Math.round((v.prix_revente - v.prix_achat) * 0.2) : 0;
  return margeBrute - tvaMarge;
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "marge" | "score" | "stock">("date");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const fetchVehicles = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) setVehicles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  // Pas de upload ici — on redirige vers la page publique pour scanner

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
  };

  // Filtered + sorted
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
    list = [...list].sort((a, b) => {
      if (sortBy === "marge") return (getMargeNette(b) || -99999) - (getMargeNette(a) || -99999);
      if (sortBy === "score") return (b.analyses?.score_sante || 0) - (a.analyses?.score_sante || 0);
      if (sortBy === "stock") return (daysSince(b.date_achat) || 0) - (daysSince(a.date_achat) || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [vehicles, filter, search, sortBy]);

  // Stats
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

  return (
    <div className="min-h-full flex flex-col bg-white">
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20">
                <span className="text-white font-bold text-sm">V</span>
              </div>
            </Link>
            <div>
              <h1 className="font-bold text-lg">Dashboard</h1>
              <p className="text-xs text-muted">Achat-revente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Scanner CT — gros bouton, redirige vers page publique */}
            <Link href="/dashboard/scan"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-[transform,box-shadow]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Scanner un CT
            </Link>

            <Link href="/dashboard/scan" className="text-sm text-muted hover:text-foreground transition-colors">
              Site public
            </Link>
            <div className="relative">
              <button onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} className="text-sm text-muted hover:text-danger transition-colors cursor-pointer">
                Déconnexion
              </button>
              {showLogoutConfirm && (
                <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 w-48">
                  <p className="text-xs text-muted mb-2">Se déconnecter ?</p>
                  <div className="flex gap-2">
                    <button onClick={logout} className="flex-1 text-xs px-3 py-1.5 bg-red-50 text-danger rounded-lg font-medium cursor-pointer hover:bg-red-100">Oui</button>
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 text-xs px-3 py-1.5 bg-slate-50 text-muted rounded-lg font-medium cursor-pointer hover:bg-slate-100">Non</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Analysés", value: stats.total, color: "text-foreground" },
            { label: "En cours", value: stats.actifs, color: "text-blue-600" },
            { label: "Achetés", value: stats.achetes, color: "text-teal-600" },
            { label: "Marge totale", value: `${stats.margeTotal.toLocaleString("fr-FR")} €`, color: stats.margeTotal >= 0 ? "text-emerald-600" : "text-danger" },
            { label: "Alertes stock", value: stats.alerteStock, color: stats.alerteStock > 0 ? "text-danger" : "text-muted" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-xl font-black mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <input type="text" placeholder="Rechercher marque, modèle, immat..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors" />

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white cursor-pointer">
            <option value="date">Plus récent</option>
            <option value="marge">Meilleure marge</option>
            <option value="score">Score santé</option>
            <option value="stock">Jours en stock</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={() => setViewMode("cards")} className={`px-3 py-2 text-xs font-medium cursor-pointer ${viewMode === "cards" ? "bg-foreground text-white" : "bg-white text-muted hover:bg-slate-50"}`}>
              Cartes
            </button>
            <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-xs font-medium cursor-pointer ${viewMode === "table" ? "bg-foreground text-white" : "bg-white text-muted hover:bg-slate-50"}`}>
              Tableau
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilter("all")} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-foreground text-white" : "bg-slate-100 text-muted hover:bg-slate-200"}`}>
            Tous ({vehicles.length})
          </button>
          {Object.entries(STATUTS).map(([key, { label }]) => {
            const count = vehicles.filter((v) => v.statut === key).length;
            if (count === 0) return null;
            return (
              <button key={key} onClick={() => setFilter(key)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filter === key ? "bg-foreground text-white" : "bg-slate-100 text-muted hover:bg-slate-200"}`}>
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-muted">Chargement...</div>
        ) : displayVehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">{search ? "Aucun résultat" : "Aucun véhicule analysé"}</p>
            <p className="text-sm text-muted mt-1">Scannez un CT pour commencer</p>
            <Link href="/dashboard/scan"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Scanner un CT &rarr;
            </Link>
          </div>
        ) : viewMode === "table" ? (
          /* ─── VUE TABLEAU ─── */
          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-muted uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Véhicule</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Réparations</th>
                  <th className="px-4 py-3 font-medium">Marge</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {displayVehicles.map((v) => {
                  const a = v.analyses;
                  if (!a) return null;
                  const margeNette = getMargeNette(v);
                  const days = daysSince(v.date_achat);
                  const statut = STATUTS[v.statut] || STATUTS.a_etudier;

                  return (
                    <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/50 cursor-pointer" onClick={() => router.push(`/dashboard/${v.id}`)}>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{a.marque} {a.modele}</span>
                        <span className="text-muted ml-2 text-xs">{a.annee}</span>
                        {a.immatriculation && <span className="ml-2 text-xs font-mono text-muted">{a.immatriculation}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white ${a.score_sante >= 70 ? "bg-teal-500" : a.score_sante >= 40 ? "bg-amber-500" : "bg-red-500"}`}>
                          {a.score_sante}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3">
                        {margeNette !== null ? (
                          <span className={`font-bold tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                            {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {days !== null ? (
                          <span className={`text-xs font-medium ${days > 60 ? "text-danger" : days > 45 ? "text-amber-600" : "text-muted"}`}>
                            {days}j
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statut.color}`}>{statut.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ─── VUE CARTES ─── */
          <div className="flex flex-col gap-3">
            {displayVehicles.map((v) => {
              const a = v.analyses;
              if (!a) return null;
              const margeNette = getMargeNette(v);
              const days = daysSince(v.date_achat);
              const statut = STATUTS[v.statut] || STATUTS.a_etudier;
              const isAlerte = days !== null && days > 45;

              return (
                <Link key={v.id} href={`/dashboard/${v.id}`}
                  className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 ${isAlerte ? "border-amber-300" : "border-slate-200/60"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{a.marque} {a.modele}</span>
                      {a.annee && <span className="text-xs text-muted">{a.annee}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statut.color}`}>{statut.label}</span>
                      {isAlerte && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-danger">{days}j en stock</span>}
                    </div>
                    {a.immatriculation && <span className="text-xs text-muted font-mono">{a.immatriculation}</span>}
                    {a.energie && <span className="text-xs text-muted ml-2">{a.energie}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${a.score_sante >= 70 ? "bg-teal-500" : a.score_sante >= 40 ? "bg-amber-500" : "bg-red-500"}`}>
                      {a.score_sante}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</p>
                    <p className="text-[10px] text-muted">{a.defaillances_count} déf.</p>
                  </div>

                  {margeNette !== null && (
                    <div className="text-right min-w-[90px]">
                      <p className={`text-sm font-bold tabular-nums ${margeNette >= 0 ? "text-emerald-600" : "text-danger"}`}>
                        {margeNette >= 0 ? "+" : ""}{margeNette.toLocaleString("fr-FR")} €
                      </p>
                      <p className="text-[10px] text-muted">marge nette</p>
                    </div>
                  )}

                  <span className="text-xs text-muted whitespace-nowrap">
                    {new Date(v.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
