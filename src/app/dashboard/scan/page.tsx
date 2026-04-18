"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnalyseResultSchema } from "@/lib/types";

type ScanMode = "ct" | "bordereau";
type ScanState = "choose" | "idle" | "dragging" | "loading" | "error";

const LOADING_CT = [
  { label: "Lecture du document", duration: 1500 },
  { label: "Détection des défaillances", duration: 2500 },
  { label: "Calcul des coûts", duration: 2000 },
  { label: "Finalisation", duration: 0 },
];

const LOADING_BORDEREAU = [
  { label: "Lecture du bordereau", duration: 1500 },
  { label: "Extraction des données", duration: 2000 },
  { label: "Création du véhicule", duration: 1500 },
  { label: "Finalisation", duration: 0 },
];

export default function ScanProPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ScanMode>("ct");
  const [state, setState] = useState<ScanState>("choose");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const phases = mode === "ct" ? LOADING_CT : LOADING_BORDEREAU;

  useEffect(() => {
    if (state !== "loading") return;
    setLoadingStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    phases.forEach((phase, idx) => {
      if (phase.duration === 0) return;
      timers.push(setTimeout(() => setLoadingStep(idx), elapsed));
      elapsed += phase.duration;
    });
    timers.push(setTimeout(() => setLoadingStep(3), elapsed));
    return () => timers.forEach(clearTimeout);
  }, [state, phases]);

  const handleCT = useCallback(async (f: File) => {
    setFileName(f.name);
    setError("");
    setState("loading");

    const formData = new FormData();
    formData.append("file", f);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Erreur inconnue"); setState("error"); return; }

      const validated = AnalyseResultSchema.safeParse(data);
      if (!validated.success) { setError("Réponse invalide. Réessayez avec une photo plus nette."); setState("error"); return; }

      const elapsed = Date.now() - startTime;
      await new Promise((r) => setTimeout(r, Math.max(0, 2000 - elapsed)));

      const saveRes = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultat: validated.data }),
      });

      if (saveRes.ok) {
        const { vehicle_id } = await saveRes.json();
        const uploadForm = new FormData();
        uploadForm.append("ctFile", f);
        fetch(`/api/dashboard/${vehicle_id}/upload-ct`, { method: "POST", body: uploadForm }).catch(() => {});
        router.push(`/dashboard/${vehicle_id}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setState("error");
    }
  }, [router]);

  const handleBordereau = useCallback(async (f: File) => {
    setFileName(f.name);
    setError("");
    setState("loading");

    const formData = new FormData();
    formData.append("file", f);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/analyze-bordereau", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Erreur inconnue"); setState("error"); return; }

      const elapsed = Date.now() - startTime;
      await new Promise((r) => setTimeout(r, Math.max(0, 2000 - elapsed)));

      // Chercher si un véhicule existe déjà avec cette immat ou ce VIN
      const listRes = await fetch("/api/dashboard");
      let existingVehicleId: string | null = null;
      if (listRes.ok) {
        const vehicles = await listRes.json();
        if (Array.isArray(vehicles)) {
          const match = vehicles.find((v: { vin?: string; analyses?: { immatriculation?: string } }) =>
            (data.vin && v.vin === data.vin) ||
            (data.immatriculation && v.analyses?.immatriculation === data.immatriculation)
          );
          if (match) existingVehicleId = match.id;
        }
      }

      if (existingVehicleId) {
        // Mettre à jour le véhicule existant
        const energieMap: Record<string, string> = { ES: "Essence", GO: "Diesel", EL: "Électrique", EH: "Hybride" };
        await fetch(`/api/dashboard/${existingVehicleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prix_achat: data.prix_adjudication || null,
            vin: data.vin || undefined,
            date_achat: data.date_vente ? data.date_vente.split("/").reverse().join("-") : null,
            source_achat: data.source?.toLowerCase().includes("alcopa") ? "alcopa" : data.source?.toLowerCase().includes("bca") ? "bca" : undefined,
            seller_name: data.vendeur_nom || data.source || undefined,
            tva_regime: data.regime_tva || undefined,
            mode_enchere: data.mode_vente === "en_ligne" || data.source?.toLowerCase().includes("web") ? "en_ligne" : data.mode_vente === "salle" ? "salle" : undefined,
            statut: "achete",
          }),
        });

        // Ajouter les frais comme expenses
        if (data.frais_adjudication_ttc > 0) {
          await fetch(`/api/dashboard/${existingVehicleId}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: "autre", amount: data.frais_adjudication_ttc, description: `Frais adjudication ${data.source || "enchère"}` }),
          });
        }

        // Upload du bordereau comme document
        const docForm = new FormData();
        docForm.append("doc", f);
        docForm.append("type", "facture");
        fetch(`/api/dashboard/${existingVehicleId}/upload-doc`, { method: "POST", body: docForm }).catch(() => {});

        router.push(`/dashboard/${existingVehicleId}`);
      } else {
        // Créer un nouveau véhicule à partir du bordereau (sans CT)
        const energieMap: Record<string, string> = { ES: "Essence", GO: "Diesel", EL: "Électrique", EH: "Hybride" };
        const fakeResultat = {
          vehicule: {
            marque: data.marque || "Inconnu",
            modele: data.modele || "Inconnu",
            immatriculation: data.immatriculation || "",
            annee: data.annee || data.date_mise_circulation?.split("/")[2] || "",
            kilometrage: data.kilometrage || 0,
            vin: data.vin || "",
          },
          code_postal: "",
          puissance_fiscale: data.puissance_fiscale || "",
          energie: energieMap[data.energie] || data.energie || "",
          score_sante: 50,
          defaillances: [],
          cout_total_min: 0,
          cout_total_max: 0,
          cote_argus_estimee: null,
          verdict: "reparer" as const,
          conseil_verdict: "Véhicule importé depuis un bordereau — scannez le CT pour les défaillances.",
          contre_visite_deadline: null,
          conseils: ["Scannez le CT pour compléter l'analyse."],
        };

        const saveRes = await fetch("/api/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultat: fakeResultat }),
        });

        if (saveRes.ok) {
          const { vehicle_id } = await saveRes.json();

          // Mettre à jour avec les données du bordereau
          await fetch(`/api/dashboard/${vehicle_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prix_achat: data.prix_adjudication || null,
              vin: data.vin || "",
              date_achat: data.date_vente ? data.date_vente.split("/").reverse().join("-") : null,
              source_achat: data.source?.toLowerCase().includes("alcopa") ? "alcopa" : data.source?.toLowerCase().includes("bca") ? "bca" : "",
              seller_name: data.vendeur_nom || data.source || "",
              tva_regime: data.regime_tva || "sans_tva",
              mode_enchere: data.mode_vente === "en_ligne" || data.source?.toLowerCase().includes("web") ? "en_ligne" : "salle",
              statut: "achete",
            }),
          });

          if (data.frais_adjudication_ttc > 0) {
            await fetch(`/api/dashboard/${vehicle_id}/expenses`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category: "autre", amount: data.frais_adjudication_ttc, description: `Frais adjudication ${data.source || "enchère"}` }),
            });
          }

          const docForm = new FormData();
          docForm.append("doc", f);
          docForm.append("type", "facture");
          fetch(`/api/dashboard/${vehicle_id}/upload-doc`, { method: "POST", body: docForm }).catch(() => {});

          router.push(`/dashboard/${vehicle_id}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setState("error");
    }
  }, [router]);

  const handleFile = useCallback((f: File) => {
    if (mode === "ct") handleCT(f);
    else handleBordereau(f);
  }, [mode, handleCT, handleBordereau]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const selectMode = (m: ScanMode) => { setMode(m); setState("idle"); };

  return (
    <div className="min-h-full flex flex-col bg-white">
      <header className="border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <span className="text-slate-200">|</span>
            <h1 className="font-bold">{state === "choose" ? "Scanner" : mode === "ct" ? "Scanner un CT" : "Scanner un bordereau"}</h1>
          </div>
          {state !== "choose" && state !== "loading" && (
            <button onClick={() => setState("choose")} className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer">Changer</button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
        {/* ── Choix du mode ── */}
        {state === "choose" && (
          <div className="w-full flex flex-col gap-4">
            <p className="text-center text-muted text-sm mb-2">Quel document voulez-vous scanner ?</p>
            <button onClick={() => selectMode("ct")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all cursor-pointer text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="font-bold">Contrôle technique</p>
                <p className="text-xs text-muted mt-0.5">Analyse les défaillances et estime les coûts de réparation</p>
              </div>
            </button>
            <button onClick={() => selectMode("bordereau")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <p className="font-bold">Bordereau d&apos;adjudication</p>
                <p className="text-xs text-muted mt-0.5">Extrait prix, frais, VIN et pré-remplit la fiche automatiquement</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Upload zone ── */}
        {(state === "idle" || state === "dragging") && (
          <>
            <label
              onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
              onDragLeave={() => setState("idle")}
              onDrop={onDrop}
              className={`w-full rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                state === "dragging"
                  ? `border-2 ${mode === "ct" ? "border-primary bg-teal-50" : "border-blue-500 bg-blue-50"} scale-[1.02] shadow-xl ring-4 ${mode === "ct" ? "ring-teal-100" : "ring-blue-100"}`
                  : "border-2 border-dashed border-slate-300 bg-white hover:border-primary/40 hover:shadow-lg shadow-md"
              }`}>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${state === "dragging" ? (mode === "ct" ? "bg-teal-100" : "bg-blue-100") : "bg-slate-50"}`}>
                  <svg className={`w-8 h-8 ${state === "dragging" ? (mode === "ct" ? "text-primary" : "text-blue-600") : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg">{mode === "ct" ? "Déposez le CT ici" : "Déposez le bordereau ici"}</p>
                  <p className="text-sm text-muted mt-1">PDF ou photo — 10 Mo max</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
            </label>
            <button onClick={() => cameraInputRef.current?.click()}
              className={`sm:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 ${mode === "ct" ? "bg-gradient-to-r from-teal-600 to-teal-700" : "bg-gradient-to-r from-blue-600 to-blue-700"} text-white rounded-xl font-semibold cursor-pointer`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Prendre en photo
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="mt-3 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
              Parcourir mes fichiers
            </button>
            <p className="text-xs text-muted mt-3">
              {mode === "ct" ? "Le véhicule sera ajouté à votre dashboard." : "Les données seront extraites et pré-remplies automatiquement."}
            </p>
          </>
        )}

        {/* ── Loading ── */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className={`w-16 h-16 rounded-2xl ${mode === "ct" ? "bg-teal-50" : "bg-blue-50"} flex items-center justify-center`}>
              <div className={`w-8 h-8 border-3 ${mode === "ct" ? "border-primary" : "border-blue-600"} border-t-transparent rounded-full animate-spin`} />
            </div>
            <div>
              <p className="text-lg font-bold text-center">{phases[loadingStep]?.label}</p>
              <p className="text-sm text-muted text-center mt-1">{fileName}</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {phases.map((phase, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 text-sm transition-all ${
                  idx < loadingStep ? (mode === "ct" ? "text-teal-600" : "text-blue-600") : idx === loadingStep ? "text-foreground font-medium" : "text-slate-200"
                }`}>
                  {idx < loadingStep ? (
                    <div className={`w-5 h-5 rounded-full ${mode === "ct" ? "bg-teal-100" : "bg-blue-100"} flex items-center justify-center shrink-0`}>
                      <svg className={`w-3 h-3 ${mode === "ct" ? "text-teal-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  ) : idx === loadingStep ? (
                    <div className={`w-5 h-5 rounded-full ${mode === "ct" ? "bg-teal-50" : "bg-blue-50"} flex items-center justify-center shrink-0`}>
                      <div className={`w-2.5 h-2.5 border-2 ${mode === "ct" ? "border-primary" : "border-blue-600"} border-t-transparent rounded-full animate-spin`} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    </div>
                  )}
                  <span>{phase.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="font-semibold text-danger">{error}</p>
            <button onClick={() => setState("idle")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold cursor-pointer">
              Réessayer
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
