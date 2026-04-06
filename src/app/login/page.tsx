"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch {
      setError("Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Vyrdict Pro</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr" autoComplete="email" required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div>
            <label htmlFor="code" className="text-sm font-medium text-foreground">Code PIN</label>
            <input id="code" type="password" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="****" inputMode="numeric" maxLength={4} autoComplete="off" required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none transition-colors text-center text-lg tracking-[0.5em]" />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-[transform,box-shadow] cursor-pointer disabled:opacity-50">
            {loading ? "Connexion..." : "Accéder au dashboard"}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-4">Accès réservé.</p>
      </div>
    </div>
  );
}
