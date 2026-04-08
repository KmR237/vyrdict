"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import type { AnalyseResult } from "@/lib/types";
import { AnalyseResultSchema } from "@/lib/types";
import { adjustCosts, getRegionLabel, getVehicleLabel } from "@/lib/price-coefficients";
import { DEMO_RESULT } from "@/lib/demo-data";
import { DefaillanceCard } from "@/components/DefaillanceCard";
import { VerdictBanner } from "@/components/VerdictBanner";
import { BudgetSimulator } from "@/components/BudgetSimulator";
import { ScoreGauge } from "@/components/ScoreGauge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmailCapture } from "@/components/EmailCapture";
import { NextSteps } from "@/components/NextSteps";
import pako from "pako";

type AppState = "idle" | "dragging" | "loading" | "results" | "error";

const RATIO_REPARER = 0.35; // Coût < 35% de la cote → réparer
const RATIO_VENDRE = 0.75;  // Coût > 75% de la cote → vendre

const LOADING_TIPS = [
  "L'IA analyse votre document...",
  "19% des CT sont défavorables en France",
  "Les garages indépendants sont 25% moins chers en moyenne",
  "Comparer 2-3 devis peut économiser 20-30%",
  "Le freinage représente 30% des contre-visites",
  "Identification des défaillances en cours...",
  "Un CT coûte en moyenne 75€ en France",
  "Vous avez 2 mois pour passer la contre-visite",
  "Calcul des coûts de réparation...",
  "Les pneus sont la 2e cause de contre-visite",
  "Préparation de votre verdict...",
];

function launchConfetti() {
  const colors = ["#0d9488", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899"];
  const els: HTMLDivElement[] = [];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.width = `${6 + Math.random() * 6}px`;
    el.style.height = `${6 + Math.random() * 6}px`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animationDuration = `${2 + Math.random() * 2}s`;
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(el);
    els.push(el);
  }
  setTimeout(() => els.forEach((el) => el.remove()), 5000);
}

function compressResult(result: AnalyseResult): string {
  const json = JSON.stringify(result);
  const compressed = pako.deflate(new TextEncoder().encode(json));
  // Convert Uint8Array to base64 safely
  let binary = "";
  for (let i = 0; i < compressed.length; i++) binary += String.fromCharCode(compressed[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function parseSharedResult(encoded: string): AnalyseResult | null {
  try {
    // Try compressed format first (pako)
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decompressed = pako.inflate(bytes);
    const json = new TextDecoder().decode(decompressed);
    const parsed = JSON.parse(json);
    const validated = AnalyseResultSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    // Fallback: try old uncompressed format
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(json);
      const validated = AnalyseResultSchema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  }
}

function buildShareMessage(result: AnalyseResult, url: string): string {
  const verdictEmoji = result.verdict === "reparer" ? "\u2705" : result.verdict === "vendre" ? "\u274c" : "\u26a0\ufe0f";
  const verdictLabel = result.verdict === "reparer" ? "Réparer" : result.verdict === "vendre" ? "Envisager la vente" : "À arbitrer";
  return [
    `\ud83d\ude97 ${result.vehicule.marque} ${result.vehicule.modele}${result.vehicule.annee ? ` (${result.vehicule.annee})` : ""}`,
    `\ud83d\udcca Score santé : ${result.score_sante}/100`,
    `\ud83d\udcb0 Coût estimé : ~${Math.round((result.cout_total_min + result.cout_total_max) / 2).toLocaleString("fr-FR")} \u20ac (${result.cout_total_min.toLocaleString("fr-FR")}-${result.cout_total_max.toLocaleString("fr-FR")})`,
    `${verdictEmoji} Verdict : ${verdictLabel}`,
    "",
    `Voir le rapport complet :`,
    url,
  ].join("\n");
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyseResult | null>(null);
  const [error, setError] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  const [coteArgus, setCoteArgus] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTip, setLoadingTip] = useState(0);
  const [defaillanceCount, setDefaillanceCount] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rapportUrl, setRapportUrl] = useState<string | null>(null);
  const [creatingRapport, setCreatingRapport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Loading step animation
  useEffect(() => {
    if (state !== "loading") return;
    setLoadingProgress(0);
    setLoadingTip(0);
    setDefaillanceCount(0);
    setApiReady(false);

    const startTime = Date.now();

    // Logarithmic progress — never stops, slows down over time
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Fast start, slow end: 1 - e^(-t/8) → approaches 100% asymptotically
      const progress = Math.min(98, (1 - Math.exp(-elapsed / 14)) * 100);
      setLoadingProgress(progress);
    }, 100);

    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setLoadingTip((t) => (t + 1) % LOADING_TIPS.length);
    }, 3000);

    // Simulated defaillance counter — étiré sur 20s pour garder du mouvement
    const defTimers = [3000, 6000, 9000, 13000, 17000, 21000].map((delay, idx) =>
      setTimeout(() => setDefaillanceCount(idx + 1), delay)
    );

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      defTimers.forEach(clearTimeout);
    };
  }, [state]);

  // Auto-scroll + confetti on results
  useEffect(() => {
    if (state === "results" && result) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      if (result.score_sante >= 70 && !isDemo && !isSharedView) launchConfetti();
    }
  }, [state, result, isDemo, isSharedView]);


  // Load shared result from URL
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("r");
    if (r) {
      const data = parseSharedResult(r);
      if (data) {
        setResult(data);
        setBudget(data.cout_total_max);
        setIsSharedView(true);
        setState("results");
      }
    }
  }, []);

  // Verdict recalculated with user cote
  const displayResult = useMemo(() => {
    if (!result) return null;

    // Ajuster les prix avec les coefficients région + véhicule
    const cp = codePostal.length === 5 ? codePostal : undefined;
    const marque = result.vehicule.marque || undefined;
    const adjusted = adjustCosts(result.cout_total_min, result.cout_total_max, cp, marque);

    const adjustedDefaillances = result.defaillances.map((d) => {
      const adj = adjustCosts(d.cout_min, d.cout_max, cp, marque);
      return { ...d, cout_min: adj.cout_min, cout_max: adj.cout_max };
    });

    const adjustedResult = {
      ...result,
      cout_total_min: adjusted.cout_min,
      cout_total_max: adjusted.cout_max,
      defaillances: adjustedDefaillances,
    };

    // Verdict avec cote Argus
    const cote = coteArgus ? parseInt(coteArgus) : null;
    if (!cote || cote <= 0) return adjustedResult;

    const ratio = adjustedResult.cout_total_max / cote;
    const pct = Math.round(ratio * 100);
    let verdict: AnalyseResult["verdict"];
    let conseil: string;

    if (ratio < RATIO_REPARER) {
      verdict = "reparer";
      conseil = `Le coût max représente ${pct}% de la valeur du véhicule. La réparation est justifiée.`;
    } else if (ratio > RATIO_VENDRE) {
      verdict = "vendre";
      conseil = `Le coût max représente ${pct}% de la valeur. Il est probablement plus rentable de vendre.`;
    } else {
      verdict = "arbitrage";
      conseil = `Le coût max représente ${pct}% de la valeur. C'est un cas limite — comparez avec des devis réels.`;
    }
    return { ...adjustedResult, cote_argus_estimee: cote, verdict, conseil_verdict: conseil };
  }, [result, coteArgus, codePostal]);

  // File handlers
  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError("");
    setResult(null);
    setExpandedCode(null);
    setBudget(0);
    setCoteArgus("");
    setCodePostal("");
    setIsDemo(false);
    setIsSharedView(false);
    setApiReady(false);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return f.type.startsWith("image/") ? URL.createObjectURL(f) : null; });
    setState("loading");

    const startTime = Date.now();
    const formData = new FormData();
    formData.append("file", f);

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

      // Ensure minimum 4 seconds of animation before showing results
      const elapsed = Date.now() - startTime;
      const minDelay = Math.max(0, 4000 - elapsed);

      // Snap barre à 100% avant d'afficher les résultats
      setLoadingProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      setResult(validated.data);
      setBudget(Math.round((validated.data.cout_total_min + validated.data.cout_total_max) / 2));
      // Pré-remplir le code postal depuis le CT
      if (validated.data.code_postal) setCodePostal(validated.data.code_postal);
      setState("results");

      // Sauvegarde auto dans le dashboard si connecté
      try {
        await fetch("/api/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultat: validated.data }),
        });
      } catch { /* silently fail if not logged in */ }
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      setState("error");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const reset = useCallback(() => {
    setState("idle");
    setFile(null);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setResult(null);
    setError("");
    setExpandedCode(null);
    setBudget(0);
    setCoteArgus("");
    setCodePostal("");
    setIsDemo(false);
    setIsSharedView(false);
    setCopied(false);
    setRapportUrl(null);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // Share
  const getShareUrl = useCallback(() => {
    if (!result) return "";
    return `${window.location.origin}?r=${compressResult(result)}`;
  }, [result]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getShareUrl]);

  const shareWhatsApp = useCallback(() => {
    if (!displayResult) return;
    const url = getShareUrl();
    const message = buildShareMessage(displayResult, url);
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }, [getShareUrl, displayResult]);

  const shareSMS = useCallback(() => {
    if (!displayResult) return;
    const url = getShareUrl();
    const message = buildShareMessage(displayResult, url);
    window.open(`sms:?body=${encodeURIComponent(message)}`, "_blank");
  }, [getShareUrl, displayResult]);

  const createRapport = useCallback(async () => {
    if (!displayResult || creatingRapport || rapportUrl) return;
    setCreatingRapport(true);
    try {
      const res = await fetch("/api/rapport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultat: displayResult }),
      });
      if (res.ok) {
        const { id } = await res.json();
        const url = `${window.location.origin}/rapport/${id}`;
        setRapportUrl(url);
        navigator.clipboard.writeText(url);
      }
    } catch { /* ignore */ }
    setCreatingRapport(false);
  }, [displayResult, creatingRapport, rapportUrl]);

  return (
    <div className="flex flex-col min-h-full">
      {/* HEADER */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo + descripteur */}
          <button onClick={reset} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-shadow">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight">Vyrdict</span>
              <span className="hidden sm:inline text-xs text-muted font-medium">Analyseur CT</span>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {(state === "idle" || state === "dragging") && (
              <>
                <a href="#faq" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors">
                  Questions fréquentes
                </a>
                <a href="#exemple" className="flex items-center gap-1.5 text-sm font-semibold text-primary-dark hover:text-primary transition-colors px-3.5 py-2 rounded-xl border border-teal-200 hover:bg-teal-50 hover:border-teal-300">
                  <span className="hidden sm:inline">Voir un</span> exemple
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </a>
              </>
            )}
            {state === "results" && !isDemo && (
              <>
                <button onClick={() => window.print()} className="p-2 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors cursor-pointer no-print" aria-label="Imprimer le rapport">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
                <button onClick={shareWhatsApp} className="hidden sm:flex text-sm px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1da851] transition-colors cursor-pointer shadow-sm">WhatsApp</button>
                <button onClick={copyLink} className="hidden sm:flex text-sm px-3 py-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  {copied ? "Copié !" : "Copier le lien"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── LANDING ─── */}
        {(state === "idle" || state === "dragging") && (
          <div className="flex flex-col items-center">
            {/* Hero */}
            <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-10 sm:pt-12 sm:pb-14 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-primary text-xs font-medium mb-5 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Gratuit et sans inscription
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] [text-wrap:balance] animate-fade-up-delay-1">
                Votre contrôle technique<br />
                <span className="highlight-marker">décrypté en quelques secondes</span>
              </h1>
              <p className="mt-5 text-muted max-w-lg mx-auto text-base sm:text-lg leading-relaxed animate-fade-up-delay-2">
                Déposez votre procès-verbal et obtenez le coût des réparations, un score de santé et un verdict clair.
              </p>
            </div>

            {/* Upload section */}
            <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center">
              {/* Mobile camera */}
              <div className="sm:hidden w-full mb-3 animate-fade-up-delay-2">
                <button onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-semibold shadow-lg shadow-teal-600/20 hover:shadow-xl transition-all cursor-pointer text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Prendre votre CT en photo
                </button>
                <div className="flex justify-center gap-4 mt-2 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Gratuit
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Non conservé
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Résultat rapide
                  </span>
                </div>
              </div>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onFileSelect} className="hidden" aria-label="Prendre une photo du contrôle technique" />

              {/* Drop zone */}
              <label
                onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                onDragLeave={() => setState("idle")}
                onDrop={onDrop}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                className={`w-full rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 animate-fade-up-delay-2 ${
                  state === "dragging"
                    ? "border-2 border-primary bg-teal-50 scale-[1.02] shadow-xl shadow-teal-500/15 ring-4 ring-teal-100"
                    : "border-2 border-dashed border-slate-300/80 bg-white hover:border-primary hover:shadow-lg shadow-md hover:bg-teal-50/30"
                }`}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${state === "dragging" ? "bg-teal-100 scale-110" : "bg-slate-50"}`}>
                    <svg className={`w-8 h-8 transition-colors ${state === "dragging" ? "text-primary" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {state === "dragging" ? "Lâchez le fichier ici" : <><span className="hidden sm:inline">Glissez votre CT ici</span><span className="sm:hidden">Sélectionnez votre fichier</span></>}
                    </p>
                    <p className="text-sm text-muted mt-1"><span className="hidden sm:inline">ou cliquez pour parcourir</span><span className="sm:hidden">Photo ou PDF de votre CT</span></p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["PDF", "JPG", "PNG", "WEBP"].map((fmt) => (
                      <span key={fmt} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">{fmt}</span>
                    ))}
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">10 Mo max</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onFileSelect} className="hidden" aria-label="Sélectionner un fichier de contrôle technique" />
              </label>

              {/* Trust */}
              <div className="flex flex-wrap justify-center gap-5 text-xs text-muted mt-6 py-4 animate-fade-up-delay-3">
                {[
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Données non conservées" },
                  { icon: "M5 13l4 4L19 7", text: "100% gratuit" },
                  { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Résultat rapide" },
                ].map((t) => (
                  <span key={t.text} className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                    </svg>
                    {t.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Demo preview */}
            <div className="w-full bg-slate-50/80 mt-12 py-12">
            <div id="exemple" className="w-full max-w-3xl mx-auto px-4 scroll-mt-20">
              <h2 className="text-center font-bold text-xl mb-6 text-slate-700">Exemple d&apos;analyse</h2>
              <div className="relative">
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg">{DEMO_RESULT.vehicule.marque} {DEMO_RESULT.vehicule.modele}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="px-2 py-0.5 bg-slate-100 rounded font-mono">{DEMO_RESULT.vehicule.immatriculation}</span>
                          <span>{DEMO_RESULT.vehicule.annee}</span>
                          <span>{DEMO_RESULT.vehicule.kilometrage.toLocaleString("fr-FR")} km</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <ScoreGauge score={DEMO_RESULT.score_sante} size="sm" />
                        <div className="text-right">
                          <p className="text-lg font-extrabold">{DEMO_RESULT.cout_total_min}-{DEMO_RESULT.cout_total_max} &euro;</p>
                          <p className="text-[11px] text-slate-500">{DEMO_RESULT.defaillances.length} défaillances</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">&#9989;</span>
                      <div>
                        <p className="font-bold text-lg">Verdict : Réparer</p>
                        <p className="text-sm text-green-700 mt-0.5">Le coût total reste raisonnable pour ce véhicule.</p>
                      </div>
                    </div>
                  </div>
                  {DEMO_RESULT.defaillances.slice(0, 2).map((d, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm border-l-4 ${d.gravite === "majeur" ? "border-l-amber-400" : "border-l-stone-300"}`}>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${d.gravite === "majeur" ? "bg-amber-100 text-amber-700" : "bg-teal-50 text-teal-600"}`}>{d.gravite}</span>
                        <span className="flex-1 font-semibold text-sm">{d.libelle}</span>
                        <span className="text-sm font-bold text-slate-500">{d.cout_min}-{d.cout_max} &euro;</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/95 to-transparent flex flex-col items-center justify-end pb-4 pointer-events-none">
                  <p className="text-sm text-slate-500 mb-3">+ {DEMO_RESULT.defaillances.length - 2} autres défaillances, simulateur de budget, conseils...</p>
                  <PrimaryButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-6 py-3 text-base pointer-events-auto">
                    Analysez votre CT maintenant
                  </PrimaryButton>
                </div>
              </div>
            </div>
            </div>

            {/* ─── FAQ SEO ─── */}
            <div id="faq" className="w-full max-w-3xl mx-auto px-4 py-12 scroll-mt-20">
              <h2 className="text-center font-bold text-xl mb-6 text-foreground [text-wrap:balance]">Questions fréquentes sur le contrôle technique</h2>
              <div className="flex flex-col gap-3">
                {[
                  {
                    q: "Comment fonctionne l'analyse du contrôle technique ?",
                    a: "Vous déposez une photo ou un PDF de votre procès-verbal de contrôle technique. Notre intelligence artificielle lit le document, identifie chaque défaillance, estime le coût de réparation en garage indépendant et vous donne un verdict clair : réparer ou vendre."
                  },
                  {
                    q: "Combien coûte l'utilisation de Vyrdict ?",
                    a: "Vyrdict est 100% gratuit et sans inscription. Aucun compte n'est requis, aucune donnée personnelle n'est collectée. Vos documents ne sont pas conservés après l'analyse."
                  },
                  {
                    q: "Les estimations de coût sont-elles fiables ?",
                    a: "Les fourchettes de prix sont basées sur les tarifs moyens constatés en garage indépendant en France (sources professionnelles du secteur automobile). Elles sont indicatives et peuvent varier selon votre véhicule, votre région et le garage choisi. Nous recommandons de demander 2-3 devis avant toute intervention."
                  },
                  {
                    q: "Que faire si mon contrôle technique est défavorable ?",
                    a: "Un CT défavorable signifie que des défaillances majeures ou critiques ont été détectées. Vous avez 2 mois pour effectuer les réparations nécessaires et passer une contre-visite. Vyrdict vous aide à prioriser les réparations et à estimer le budget nécessaire."
                  },
                  {
                    q: "Quels formats de fichiers sont acceptés ?",
                    a: "Vyrdict accepte les photos (JPG, PNG, WEBP) et les fichiers PDF de votre procès-verbal de contrôle technique. La taille maximale est de 10 Mo. Sur mobile, vous pouvez directement prendre votre CT en photo."
                  },
                ].map((faq, idx) => (
                  <details key={idx} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm group">
                    <summary className="px-5 py-4 font-semibold text-sm cursor-pointer list-none flex items-center justify-between hover:bg-slate-50/50 transition-colors rounded-2xl">
                      <span>{faq.q}</span>
                      <svg className="w-4 h-4 text-slate-400 shrink-0 ml-2 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── LOADING ─── */}
        {state === "loading" && (
          <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center gap-8">
            {/* Document preview with scan */}
            <div className="relative">
              <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                {preview ? (
                  <img src={preview} alt="Aperçu" width={144} height={192} className="w-full h-full object-cover opacity-50" />
                ) : (
                  <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5" aria-hidden="true">
                    <div className="flex gap-0.5 h-1.5">
                      <div className="flex-1 bg-blue-400 rounded-sm" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-red-400 rounded-sm" />
                    </div>
                    <p className="text-[6px] font-black text-slate-300 text-center tracking-wider mt-1">CONTRÔLE TECHNIQUE</p>
                    <div className="flex flex-col gap-1 mt-1">
                      {[100, 80, 100, 60, "amber", 80, "red", 65, 100, "amber"].map((w, i) =>
                        <div key={i} className={`h-1 rounded-full ${typeof w === "string" ? (w === "amber" ? "bg-amber-200 w-full" : "bg-red-200 w-full") : "bg-slate-100"}`}
                          style={typeof w === "number" ? { width: `${w}%` } : {}} />
                      )}
                    </div>
                  </div>
                )}
                {/* Scan line — always active */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan shadow-[0_0_8px_rgba(13,148,136,0.5)]" />
              </div>
            </div>

            {/* Progress bar — logarithmic, never stops */}
            <div className="w-full">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${loadingProgress}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted">{file?.name}</span>
                <span className="text-xs font-medium text-primary tabular-nums">{Math.round(loadingProgress)}%</span>
              </div>
            </div>

            {/* Defaillance counter */}
            {defaillanceCount > 0 && (
              <div className="flex items-center gap-3 animate-fade-up">
                <span className="text-3xl font-black text-amber-500 tabular-nums">{defaillanceCount}</span>
                <span className="text-sm text-muted">défaillance{defaillanceCount > 1 ? "s" : ""} détectée{defaillanceCount > 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Rotating tips */}
            <p className="text-sm text-muted text-center h-5 transition-opacity duration-500" key={loadingTip}>
              {LOADING_TIPS[loadingTip]}
            </p>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {state === "error" && (
          <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-5 py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg text-danger">Analyse impossible</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">{error}</p>
            </div>
            <PrimaryButton onClick={reset}>Réessayer</PrimaryButton>
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {state === "results" && displayResult && (
          <div ref={resultsRef} className="max-w-4xl mx-auto px-4 flex flex-col gap-5 py-6">
            {/* Banners */}
            {(isDemo || isSharedView) && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 rounded-2xl p-4 flex items-center justify-between animate-fade-up">
                <p className="text-sm text-teal-700">
                  {isDemo ? "Ceci est un exemple. Déposez votre vrai CT pour obtenir votre analyse." : "Ce rapport a été partagé avec vous."}
                </p>
                <PrimaryButton onClick={reset} className="text-sm px-4 py-2 whitespace-nowrap ml-3">
                  Analyser mon CT
                </PrimaryButton>
              </div>
            )}

            {/* Vehicle */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm animate-fade-up">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="font-bold text-foreground text-xl">{displayResult.vehicule.marque} {displayResult.vehicule.modele}</span>
                {displayResult.vehicule.immatriculation && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-xs font-medium">{displayResult.vehicule.immatriculation}</span>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  {displayResult.vehicule.annee && <span>{displayResult.vehicule.annee}</span>}
                  {displayResult.vehicule.kilometrage > 0 && (
                    <><span className="text-slate-200">|</span><span>{displayResult.vehicule.kilometrage.toLocaleString("fr-FR")} km</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up-delay-1">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Score santé</span>
                <div className="mt-3"><ScoreGauge score={displayResult.score_sante} /></div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Coût estimé</span>
                <span className="text-2xl font-black mt-3 text-foreground tabular-nums">
                  ~{Math.round((displayResult.cout_total_min + displayResult.cout_total_max) / 2).toLocaleString("fr-FR")} &euro;
                </span>
                <span className="text-xs text-muted mt-1 tabular-nums">
                  ({displayResult.cout_total_min.toLocaleString("fr-FR")} - {displayResult.cout_total_max.toLocaleString("fr-FR")} &euro;)
                </span>
                <span className="text-xs text-slate-500 mt-1.5 font-medium">{displayResult.defaillances.length} défaillance{displayResult.defaillances.length > 1 ? "s" : ""}</span>
                {codePostal.length === 5 && (
                  <span className="text-[10px] text-primary mt-1 font-medium">{getRegionLabel(codePostal)}</span>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Code postal</span>
                <input type="text" inputMode="numeric" name="code_postal" placeholder="40100…" maxLength={5} value={codePostal}
                  onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  autoComplete="postal-code" aria-label="Code postal"
                  className="w-20 text-center text-2xl font-extrabold bg-transparent border-b-2 border-slate-200 focus:border-primary transition-colors placeholder:text-slate-400 placeholder:text-lg mt-3" />
                <p className="text-[11px] text-slate-400 mt-1.5">{result?.code_postal ? "Lu sur votre CT" : "Affine les prix par région"}</p>
                {codePostal.length === 5 && result && (
                  <span className="text-[10px] text-muted mt-1">{getVehicleLabel(result.vehicule.marque)}</span>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cote Argus</span>
                <div className="flex items-center gap-1 mt-3">
                  <input type="number" inputMode="numeric" name="cote_argus" placeholder="4 500…" value={coteArgus} onChange={(e) => setCoteArgus(e.target.value)} autoComplete="off" spellCheck={false} aria-label="Cote Argus en euros"
                    className="w-20 text-center text-2xl font-extrabold bg-transparent border-b-2 border-slate-200 focus:border-primary transition-colors placeholder:text-slate-400 placeholder:text-lg tabular-nums" />
                  <span className="text-2xl font-extrabold text-slate-400">&euro;</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Affine le verdict</p>
                <a href="https://www.lacentrale.fr/lacote_origine.php" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1.5 font-medium">
                  LaCentrale &rarr;
                </a>
              </div>
            </div>

            <div className="animate-fade-up-delay-2"><VerdictBanner result={displayResult} /></div>

            {/* Prochaine étape */}
            <NextSteps result={displayResult} />

            {/* Defaillances */}
            <div className="flex flex-col gap-2.5 animate-fade-up-delay-3">
              <h2 className="font-bold text-lg">Défaillances</h2>
              {[...displayResult.defaillances].sort((a, b) => a.priorite - b.priorite).map((d, idx) => (
                <DefaillanceCard key={`${d.code}-${d.localisation}-${idx}`} defaillance={d} expanded={expandedCode === `${d.code}-${idx}`} onToggle={() => setExpandedCode(expandedCode === `${d.code}-${idx}` ? null : `${d.code}-${idx}`)} />
              ))}
            </div>

            <div id="budget" className="scroll-mt-20">
              <BudgetSimulator result={displayResult} budget={budget} onBudgetChange={setBudget} />
            </div>

            {/* Conseils */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Conseils personnalisés</h2>
              <ul className="flex flex-col gap-3">
                {displayResult.conseils.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partage + Email — en dernier */}
            {!isDemo && (
              <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl border border-slate-200/60 p-5 sm:p-6">
                <h2 className="font-bold text-lg mb-2">Partager ce rapport</h2>
                <p className="text-sm text-slate-500 mb-4">Envoyez-le à votre garagiste ou à un proche pour un deuxième avis.</p>
                <div className="flex flex-wrap gap-2.5">
                  <button onClick={shareWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#1da851] transition-all hover:shadow-md cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                  <button onClick={shareSMS} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all hover:shadow-md cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    SMS
                  </button>
                  <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-white transition-all hover:shadow-sm cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {copied ? "Copié !" : "Copier le lien"}
                  </button>
                </div>
                {/* Lien permanent */}
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  {rapportUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-teal-700">Lien permanent créé et copié !</p>
                        <a href={rapportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{rapportUrl}</a>
                      </div>
                    </div>
                  ) : (
                    <button onClick={createRapport} disabled={creatingRapport}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all cursor-pointer disabled:opacity-50">
                      {creatingRapport ? (
                        <span>Création en cours...</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Créer un lien permanent (court et partageable)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isDemo && <EmailCapture result={displayResult} shareUrl={getShareUrl()} />}

            <p className="text-[11px] text-slate-400 text-center py-2 leading-relaxed">
              Estimations indicatives basées sur les tarifs moyens en France 2025-2026. Demandez des devis professionnels avant toute intervention.
            </p>

            <div className="flex justify-center gap-3 pb-8 no-print">
              <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-white hover:shadow-sm transition-all cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimer
              </button>
              <PrimaryButton onClick={reset} className="text-sm">Nouvelle analyse</PrimaryButton>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/60 mt-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="font-bold text-foreground">Vyrdict</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">Analyseur de contrôle technique par IA. Estimez vos coûts de réparation en quelques secondes.</p>
              <Link href="/" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary-dark hover:text-primary transition-colors">
                Analyser mon CT &rarr;
              </Link>
            </div>

            {/* Ressources */}
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-3">Ressources</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted">
                <li><Link href="/guide-controle-technique" className="hover:text-primary transition-colors">Guide du contrôle technique</Link></li>
                <li><Link href="/contre-visite" className="hover:text-primary transition-colors">Contre-visite : délais et coûts</Link></li>
                <li><Link href="/defaillance-critique-controle-technique" className="hover:text-primary transition-colors">Défaillance critique CT</Link></li>
                <li><Link href="/controle-technique-defavorable" className="hover:text-primary transition-colors">CT défavorable : que faire ?</Link></li>
                <li><Link href="/prix-reparation-controle-technique" className="hover:text-primary transition-colors">Prix des réparations CT</Link></li>
                <li><Link href="/comprendre-proces-verbal-controle-technique" className="hover:text-primary transition-colors">Comprendre son PV</Link></li>
                <li><Link href="/pollution-controle-technique" className="hover:text-primary transition-colors">Pollution et CT</Link></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">Questions fréquentes</a></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-3">Légal</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted">
                <li><Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/50 text-xs text-muted text-center sm:text-left">
            &copy; 2026 Vyrdict — Estimations indicatives, ne remplacent pas un diagnostic professionnel.
          </div>
        </div>
      </footer>
    </div>
  );
}
