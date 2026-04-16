import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim()).filter(Boolean);

// Endpoint appelé par Vercel Cron (configuré dans vercel.json)
// Vérifie chaque jour les enchères des prochaines 24h et envoie un rappel
export async function GET(request: NextRequest) {
  // Sécurité : vérifier le secret Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (ADMIN_EMAILS.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const supabase = createServerClient();
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;

  // Tous les véhicules pré-achat avec une enchère dans les 24h
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, date_enchere, source_achat, mode_enchere, lien_annonce, analyses(marque, modele, annee, immatriculation)")
    .in("statut", ["a_etudier", "a_negocier", "offre_faite"])
    .not("date_enchere", "is", null);

  if (!vehicles || vehicles.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const upcoming = vehicles.filter(v => {
    const t = new Date(v.date_enchere!).getTime();
    return t >= now && t <= in24h;
  });

  if (upcoming.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // Construire l'email
  const rows = upcoming.map(v => {
    const a = v.analyses as unknown as { marque: string; modele: string; annee: string; immatriculation: string };
    const date = new Date(v.date_enchere!);
    const heure = `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
    const isToday = date.toDateString() === new Date().toDateString();
    return `
      <tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:12px 0">
          <strong>${a?.marque || ""} ${a?.modele || ""}</strong>
          ${a?.annee ? ` <span style="color:#64748b">${a.annee}</span>` : ""}
          ${a?.immatriculation ? `<br><span style="color:#64748b;font-family:monospace;font-size:12px">${a.immatriculation}</span>` : ""}
        </td>
        <td style="padding:12px 0;text-align:right">
          <span style="background:${isToday ? "#fee2e2" : "#fef3c7"};color:${isToday ? "#991b1b" : "#92400e"};padding:4px 10px;border-radius:9999px;font-weight:600;font-size:13px">
            ${isToday ? "Aujourd'hui" : "Demain"} ${heure}
          </span>
          ${v.source_achat ? `<br><span style="color:#64748b;font-size:11px;text-transform:uppercase">${v.source_achat}${v.mode_enchere === "salle" ? " (salle)" : ""}</span>` : ""}
        </td>
      </tr>`;
  }).join("");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#0d9488;margin:0 0 8px">Vyrdict — Vos enchères des prochaines 24h</h2>
      <p style="color:#64748b;margin:0 0 24px">Vous avez ${upcoming.length} enchère${upcoming.length > 1 ? "s" : ""} prévue${upcoming.length > 1 ? "s" : ""}.</p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p style="margin-top:32px;text-align:center">
        <a href="https://vyrdict-one.vercel.app/dashboard" style="background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Ouvrir le dashboard
        </a>
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;text-align:center">Vyrdict — Rappel automatique d&apos;enchères</p>
    </div>`;

  let sent = 0;
  for (const email of ADMIN_EMAILS) {
    try {
      await resend.emails.send({
        from: "Vyrdict <noreply@vyrdict-one.vercel.app>",
        to: email,
        subject: `${upcoming.length} enchère${upcoming.length > 1 ? "s" : ""} dans les prochaines 24h`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Erreur envoi à ${email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, vehicles: upcoming.length });
}
