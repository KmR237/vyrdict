"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface VehicleRow {
  id: string;
  created_at: string;
  statut: string;
  vin: string | null;
  seller_name: string | null;
  buyer_name: string | null;
  date_vente: string | null;
  usage_perso: boolean | null;
  analyses: {
    marque: string;
    modele: string;
    immatriculation: string;
    annee: string;
  } | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function LivrePolicePage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVehicles(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return vehicles
      .filter((v) => v.statut !== "passe" && !v.usage_perso)
      .filter((v) => {
        if (dateFrom && v.created_at < dateFrom) return false;
        if (dateTo && v.created_at > dateTo + "T23:59:59") return false;
        return true;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [vehicles, dateFrom, dateTo]);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #livre-police-print, #livre-police-print * { visibility: visible; }
          #livre-police-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          table { font-size: 10px; }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="no-print border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
              &larr; Retour au dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Livre de police</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700"
          >
            Exporter PDF
          </button>
        </div>

        {/* Filters */}
        <div className="no-print px-6 py-3 border-b flex items-center gap-4 bg-gray-50">
          <label className="text-sm text-gray-600">
            Du{" "}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="ml-1 border rounded px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-gray-600">
            Au{" "}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="ml-1 border rounded px-2 py-1 text-sm"
            />
          </label>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-gray-500 underline"
            >
              Effacer les filtres
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} entrée(s)</span>
        </div>

        {/* Table */}
        <div id="livre-police-print" className="px-6 py-4">
          <h2 className="text-center text-lg font-bold mb-4 hidden print:block">
            Livre de police - Registre des objets mobiliers
          </h2>

          {loading ? (
            <p className="text-center text-gray-400 py-12">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Aucun véhicule trouvé.</p>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">N&deg;</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Date entr&eacute;e</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">D&eacute;signation</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">VIN</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Vendeur</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Date sortie</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Acheteur</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Immatriculation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const a = v.analyses;
                  const designation = a ? `${a.marque} ${a.modele} ${a.annee}` : "-";
                  const dateSortie = v.date_vente || (v.statut === "vendu" ? v.created_at : null);
                  return (
                    <tr key={v.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-1.5">{i + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{formatDate(v.created_at)}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{designation}</td>
                      <td className="border border-gray-300 px-2 py-1.5 font-mono">{v.vin || "-"}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{v.seller_name || "-"}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{formatDate(dateSortie)}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{v.buyer_name || "-"}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{a?.immatriculation || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
