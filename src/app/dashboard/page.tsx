"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  const fetchVehicles = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) {
      const data = await res.json();
      setVehicles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
  };

  const filtered = filter === "all" ? vehicles : vehicles.filter((v) => v.statut === filter);

  const stats = {
    total: vehicles.length,
    actifs: vehicles.filter((v) => !["passe", "vendu"].includes(v.statut)).length,
    achetes: vehicles.filter((v) => v.statut === "achete" || v.statut === "en_reparation" || v.statut === "en_vente").length,
    margeTotal: vehicles
      .filter((v) => v.statut === "vendu" && v.prix_achat && v.prix_revente)
      .reduce((sum, v) => {
        const reparations = v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
        return sum + ((v.prix_revente || 0) - (v.prix_achat || 0) - reparations - v.frais_annexes);
      }, 0),
  };

  return (
    <div className="min-h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
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
            <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
              Scanner un CT
            </Link>
            <button onClick={logout} className="text-sm text-muted hover:text-danger transition-colors cursor-pointer">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Véhicules analysés", value: stats.total, color: "text-foreground" },
            { label: "En cours", value: stats.actifs, color: "text-blue-600" },
            { label: "Achetés", value: stats.achetes, color: "text-teal-600" },
            { label: "Marge totale", value: `${stats.margeTotal.toLocaleString("fr-FR")} €`, color: stats.margeTotal >= 0 ? "text-emerald-600" : "text-danger" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <p className="text-xs text-muted font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-black mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
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

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-muted">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Aucun véhicule analysé</p>
            <p className="text-sm text-muted mt-1">Scannez un CT pour commencer</p>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Scanner un CT &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((v) => {
              const a = v.analyses;
              if (!a) return null;
              const reparations = v.devis_reel || v.devis_garage || v.estimation_vyrdict || 0;
              const marge = v.prix_achat && v.prix_revente
                ? (v.prix_revente - v.prix_achat - reparations - v.frais_annexes)
                : null;
              const statut = STATUTS[v.statut] || STATUTS.a_etudier;

              return (
                <Link key={v.id} href={`/dashboard/${v.id}`}
                  className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  {/* Véhicule */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{a.marque} {a.modele}</span>
                      {a.annee && <span className="text-xs text-muted">{a.annee}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statut.color}`}>{statut.label}</span>
                    </div>
                    {a.immatriculation && <span className="text-xs text-muted font-mono">{a.immatriculation}</span>}
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${a.score_sante >= 70 ? "bg-teal-500" : a.score_sante >= 40 ? "bg-amber-500" : "bg-red-500"}`}>
                      {a.score_sante}
                    </div>
                  </div>

                  {/* Coût réparations */}
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">~{Math.round((a.cout_total_min + a.cout_total_max) / 2).toLocaleString("fr-FR")} €</p>
                    <p className="text-[10px] text-muted">{a.defaillances_count} déf.</p>
                  </div>

                  {/* Marge */}
                  {marge !== null && (
                    <div className="text-right min-w-[80px]">
                      <p className={`text-sm font-bold tabular-nums ${marge >= 0 ? "text-emerald-600" : "text-danger"}`}>
                        {marge >= 0 ? "+" : ""}{marge.toLocaleString("fr-FR")} €
                      </p>
                      <p className="text-[10px] text-muted">marge</p>
                    </div>
                  )}

                  {/* Date */}
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
