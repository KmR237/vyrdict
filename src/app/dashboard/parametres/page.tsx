"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CompanyInfo {
  nom: string;
  adresse: string;
  siret: string;
  tva_intracom: string;
  telephone: string;
  email: string;
}

interface Settings {
  id: number;
  tva_rate: number;
  default_tva_regime: string;
  stock_alert_days: number;
  target_margin: number;
  company_info: CompanyInfo | null;
  invoice_counter: number;
}

const TVA_REGIMES = [
  { value: "sans_tva", label: "Sans TVA" },
  { value: "tva_sur_marge", label: "TVA sur marge" },
  { value: "tva_normale", label: "TVA normale" },
];

const COMPANY_FIELDS: { key: keyof CompanyInfo; label: string; type?: string }[] = [
  { key: "nom", label: "Nom de l'entreprise" },
  { key: "adresse", label: "Adresse" },
  { key: "siret", label: "SIRET" },
  { key: "tva_intracom", label: "N\u00b0 TVA intracommunautaire" },
  { key: "telephone", label: "T\u00e9l\u00e9phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
];

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (updates: Partial<Settings>) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setMessage("Sauvegard\u00e9");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(data.error || "Erreur");
      }
    } catch {
      setMessage("Erreur r\u00e9seau");
    } finally {
      setSaving(false);
    }
  }, []);

  const handleBlur = useCallback(
    (field: string, value: unknown) => {
      if (!settings) return;
      save({ [field]: value });
    },
    [settings, save]
  );

  const handleCompanyBlur = useCallback(
    (key: keyof CompanyInfo, value: string) => {
      if (!settings) return;
      const info: CompanyInfo = settings.company_info || {
        nom: "", adresse: "", siret: "", tva_intracom: "", telephone: "", email: "",
      };
      save({ company_info: { ...info, [key]: value } });
    },
    [settings, save]
  );

  const handleExportJson = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vyrdict-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Erreur d'export");
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Impossible de charger les param\u00e8tres. V\u00e9rifiez que la table settings existe.</p>
      </div>
    );
  }

  const company: CompanyInfo = settings.company_info || {
    nom: "", adresse: "", siret: "", tva_intracom: "", telephone: "", email: "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
            &larr; Retour au dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Param\u00e8tres</h1>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message === "Sauvegard\u00e9" ? "text-green-600" : "text-red-500"}`}>
              {message}
            </span>
          )}
          {saving && <span className="text-xs text-gray-400">Enregistrement...</span>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* TVA & Marges */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">TVA &amp; Marges</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">Taux de TVA (%)</span>
              <input
                type="number"
                defaultValue={settings.tva_rate ?? 20}
                onBlur={(e) => handleBlur("tva_rate", Number(e.target.value))}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">R&eacute;gime TVA par d&eacute;faut</span>
              <select
                defaultValue={settings.default_tva_regime || "tva_sur_marge"}
                onBlur={(e) => handleBlur("default_tva_regime", e.target.value)}
                onChange={(e) => handleBlur("default_tva_regime", e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              >
                {TVA_REGIMES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">Alerte stock (jours)</span>
              <input
                type="number"
                defaultValue={settings.stock_alert_days ?? 30}
                onBlur={(e) => handleBlur("stock_alert_days", Number(e.target.value))}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">Marge cible par v&eacute;hicule (&euro;)</span>
              <input
                type="number"
                defaultValue={settings.target_margin ?? 500}
                onBlur={(e) => handleBlur("target_margin", Number(e.target.value))}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Informations entreprise */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informations entreprise</h2>

          <div className="grid grid-cols-2 gap-4">
            {COMPANY_FIELDS.map((f) => (
              <label key={f.key} className={`block ${f.key === "adresse" ? "col-span-2" : ""}`}>
                <span className="text-sm text-gray-600">{f.label}</span>
                <input
                  type={f.type || "text"}
                  defaultValue={company[f.key] || ""}
                  onBlur={(e) => handleCompanyBlur(f.key, e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Compteur factures */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Facturation</h2>
          <div className="flex items-center gap-4">
            <label className="block flex-1">
              <span className="text-sm text-gray-600">Compteur de factures actuel</span>
              <input
                type="number"
                defaultValue={settings.invoice_counter ?? 0}
                onBlur={(e) => handleBlur("invoice_counter", Number(e.target.value))}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-gray-400 mt-5">
              Prochaine facture : FAC-{new Date().getFullYear()}-{String((settings.invoice_counter ?? 0) + 1).padStart(3, "0")}
            </p>
          </div>
        </section>

        {/* Sauvegarde */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Sauvegarde</h2>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700"
          >
            Sauvegarder la base (JSON)
          </button>
          <p className="text-xs text-gray-400">
            T&eacute;l&eacute;charge tous les v&eacute;hicules au format JSON.
          </p>
        </section>
      </div>
    </div>
  );
}
