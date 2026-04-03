"use client";

import { useState, useCallback } from "react";
import type { AnalyseResult } from "@/lib/types";

export function EmailCapture({ result, shareUrl }: { result: AnalyseResult; shareUrl: string }) {
  const [email, setEmail] = useState("");
  const [rappel, setRappel] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const hasDeadline = !!result.contre_visite_deadline;
  const isDefavorable = result.verdict !== "reparer" || result.defaillances.some((d) => d.gravite === "majeur" || d.gravite === "critique");

  const send = useCallback(async () => {
    if (!email || !email.includes("@")) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          vehicule: `${result.vehicule.marque} ${result.vehicule.modele}`,
          score: result.score_sante,
          cout_min: result.cout_total_min,
          cout_max: result.cout_total_max,
          verdict: result.verdict,
          defaillances_count: result.defaillances.length,
          contre_visite_deadline: result.contre_visite_deadline,
          rappel: rappel && hasDeadline,
          report_url: shareUrl,
        }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [email, rappel, result, hasDeadline, shareUrl]);

  if (status === "sent") {
    return (
      <div className="bg-teal-50 rounded-2xl border border-teal-200/50 p-5 text-center">
        <p className="text-sm font-semibold text-primary-dark">Rapport envoyé !</p>
        <p className="text-xs text-muted mt-1">
          Vérifiez votre boîte mail ({email}).
          {rappel && hasDeadline && " Vous recevrez un rappel avant votre contre-visite."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-card-border p-5 sm:p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-1">Recevoir ce rapport par email</h2>
      <p className="text-sm text-muted mb-4">
        {isDefavorable
          ? "Gardez une trace de votre analyse pour le garagiste."
          : "Conservez votre rapport pour vos dossiers."}
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          inputMode="email"
          name="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          autoComplete="email"
          aria-label="Adresse email"
          className="flex-1 px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:border-primary transition-colors outline-none"
        />
        <button
          onClick={send}
          disabled={status === "sending" || !email.includes("@")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-[transform,box-shadow] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "sending" ? "Envoi..." : "Envoyer"}
        </button>
      </div>

      {hasDeadline && (
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rappel}
            onChange={(e) => setRappel(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary accent-primary"
          />
          <span className="text-xs text-muted">
            Me rappeler 2 semaines avant la contre-visite du {result.contre_visite_deadline}
          </span>
        </label>
      )}

      {status === "error" && (
        <p className="text-xs text-danger mt-2">L&apos;envoi a échoué. Réessayez.</p>
      )}

      <p className="text-[10px] text-subtle mt-3">Votre email ne sera utilisé que pour ce rapport. Pas de spam.</p>
    </div>
  );
}
