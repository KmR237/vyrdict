import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const RequestSchema = z.object({
  email: z.string().email(),
  vehicule: z.string(),
  score: z.number(),
  cout_min: z.number(),
  cout_max: z.number(),
  verdict: z.enum(["reparer", "vendre", "arbitrage"]),
  defaillances_count: z.number(),
  contre_visite_deadline: z.string().nullable(),
  rappel: z.boolean().optional(),
  report_url: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const d = validated.data;
    const verdictLabel = d.verdict === "reparer" ? "Réparer" : d.verdict === "vendre" ? "Envisager la vente" : "À arbitrer";
    const verdictEmoji = d.verdict === "reparer" ? "✅" : d.verdict === "vendre" ? "❌" : "⚠️";

    const subject = d.rappel
      ? `Rappel contre-visite — ${d.vehicule}`
      : `Votre analyse CT — ${d.vehicule} | Vyrdict`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; background: #f1f5f9; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">

    <div style="background: #0d9488; padding: 24px 32px;">
      <h1 style="color: white; font-size: 20px; margin: 0;">
        <span style="font-weight: 800;">V</span>yrdict — Analyse CT
      </h1>
    </div>

    <div style="padding: 32px;">
      <h2 style="font-size: 22px; margin: 0 0 4px;">${d.vehicule}</h2>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">Score de santé : <strong style="color: #0f172a;">${d.score}/100</strong></p>

      <div style="background: ${d.verdict === "reparer" ? "#f0fdf4" : d.verdict === "vendre" ? "#fef2f2" : "#fffbeb"}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 18px; font-weight: 700; margin: 0;">
          ${verdictEmoji} Verdict : ${verdictLabel}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Coût estimé</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${d.cout_min.toLocaleString("fr-FR")} - ${d.cout_max.toLocaleString("fr-FR")} €</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Défaillances</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${d.defaillances_count}</td>
        </tr>
        ${d.contre_visite_deadline ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Contre-visite avant le</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #dc2626;">${d.contre_visite_deadline}</td>
        </tr>` : ""}
      </table>

      <div style="text-align: center; margin-top: 32px;">
        <a href="${d.report_url}" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">
          Voir le rapport complet
        </a>
      </div>

      ${d.rappel && d.contre_visite_deadline ? `
      <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 24px;">
        <p style="font-size: 13px; color: #92400e; margin: 0;">
          ⏰ Nous vous enverrons un rappel 2 semaines avant votre contre-visite du ${d.contre_visite_deadline}.
        </p>
      </div>` : ""}
    </div>

    <div style="padding: 20px 32px; background: #f8fafc; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        Vyrdict — Analyse de contrôle technique par IA<br>
        Estimations indicatives. Demandez des devis professionnels avant intervention.
      </p>
    </div>
  </div>
</body>
</html>`;

    const resend = getResend();
    await resend.emails.send({
      from: "Vyrdict <noreply@vyrdict.fr>",
      to: d.email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Send report error:", err);
    return NextResponse.json({ error: "Impossible d'envoyer l'email." }, { status: 500 });
  }
}
