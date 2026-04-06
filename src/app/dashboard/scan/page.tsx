"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnalyseResultSchema } from "@/lib/types";

const LOADING_PHASES = [
  { label: "Lecture du document", duration: 1500 },
  { label: "Détection des défaillances", duration: 2500 },
  { label: "Calcul des coûts", duration: 2000 },
  { label: "Finalisation", duration: 0 },
];

type ScanState = "idle" | "dragging" | "loading" | "error";

export default function ScanProPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (state !== "loading") return;
    setLoadingStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    LOADING_PHASES.forEach((phase, idx) => {
      if (phase.duration === 0) return;
      timers.push(setTimeout(() => setLoadingStep(idx), elapsed));
      elapsed += phase.duration;
    });
    timers.push(setTimeout(() => setLoadingStep(3), elapsed));
    return () => timers.forEach(clearTimeout);
  }, [state]);

  const handleFile = useCallback(async (f: File) => {
    setFileName(f.name);
    setError("");
    setState("loading");

    const formData = new FormData();
    formData.append("file", f);

    const startTime = Date.now();

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erreur inconnue");
        setState("error");
        return;
      }

      const validated = AnalyseResultSchema.safeParse(data);
      if (!validated.success) {
        setError("Réponse invalide. Réessayez avec une photo plus nette.");
        setState("error");
        return;
      }

      // Minimum 3s d'animation
      const elapsed = Date.now() - startTime;
      await new Promise((r) => setTimeout(r, Math.max(0, 3000 - elapsed)));

      // Sauvegarder dans le dashboard (avec le fichier CT)
      const saveForm = new FormData();
      saveForm.append("resultat", JSON.stringify(validated.data));
      saveForm.append("ctFile", f);
      const saveRes = await fetch("/api/dashboard", {
        method: "POST",
        body: saveForm,
      });

      if (saveRes.ok) {
        const { vehicle_id } = await saveRes.json();
        // Redirection vers la fiche du véhicule
        router.push(`/dashboard/${vehicle_id}`);
      } else {
        // Fallback : retour au dashboard
        router.push("/dashboard");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setState("error");
    }
  }, [router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

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
            <h1 className="font-bold">Scanner un CT</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
        {state === "idle" || state === "dragging" ? (
          <>
            <label
              onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
              onDragLeave={() => setState("idle")}
              onDrop={onDrop}
              className={`w-full rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                state === "dragging"
                  ? "border-2 border-primary bg-teal-50 scale-[1.02] shadow-xl ring-4 ring-teal-100"
                  : "border-2 border-dashed border-slate-300 bg-white hover:border-primary/40 hover:shadow-lg shadow-md"
              }`}>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${state === "dragging" ? "bg-teal-100" : "bg-slate-50"}`}>
                  <svg className={`w-8 h-8 ${state === "dragging" ? "text-primary" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg">Déposez le CT ici</p>
                  <p className="text-sm text-muted mt-1">PDF ou photo — 10 Mo max</p>
                </div>
                <div className="flex gap-2">
                  {["PDF", "JPG", "PNG"].map((fmt) => (
                    <span key={fmt} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">{fmt}</span>
                  ))}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" aria-label="Sélectionner un fichier CT" />
            </label>
            {/* Bouton camera mobile */}
            <button onClick={() => cameraInputRef.current?.click()}
              className="sm:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold cursor-pointer">
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
            <p className="text-xs text-muted mt-3">Le véhicule sera automatiquement ajouté à votre dashboard.</p>
          </>
        ) : state === "loading" ? (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-lg font-bold text-center">{LOADING_PHASES[loadingStep]?.label}</p>
              <p className="text-sm text-muted text-center mt-1">{fileName}</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {LOADING_PHASES.map((phase, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 text-sm transition-all ${
                  idx < loadingStep ? "text-teal-600" : idx === loadingStep ? "text-foreground font-medium" : "text-slate-200"
                }`}>
                  {idx < loadingStep ? (
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  ) : idx === loadingStep ? (
                    <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        ) : (
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
