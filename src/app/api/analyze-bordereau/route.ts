import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic();
export const maxDuration = 60;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

const SYSTEM_PROMPT = `Tu es un expert en documents d'enchères automobiles françaises. Analyse ce bordereau d'adjudication et retourne UNIQUEMENT un JSON valide :
{"immatriculation":"","vin":"","marque":"","modele":"","annee":"","kilometrage":0,"puissance_fiscale":"","energie":"","date_mise_circulation":"","prix_adjudication":0,"frais_adjudication_ht":0,"frais_adjudication_ttc":0,"frais_vente_ttc":0,"frais_live_ttc":0,"total_ttc":0,"date_vente":"","source":"","mode_vente":"","regime_tva":"","numero_lot":"","vendeur_nom":"","vendeur_adresse":""}

RÈGLES :
- Extraire TOUTES les données du bordereau d'adjudication
- prix_adjudication = montant adjugé (HT)
- frais_adjudication_ht = honoraires HT
- frais_adjudication_ttc = honoraires TTC
- total_ttc = total à payer TTC
- date_vente au format JJ/MM/AAAA
- source = nom de la plateforme (ex: "Alcopa Auction", "BCA", "VPAuto")
- mode_vente = "en_ligne" ou "salle" selon le document
- regime_tva = "tva_sur_marge" si mention art. 297A, "tva_normale" sinon, "sans_tva" si pas de TVA
- energie : lire sur le document. ES=Essence, GO=Diesel, EL=Électrique, EH=Hybride
- Si un champ est illisible ou absent, retourner "" ou 0
- Si ce n'est PAS un bordereau d'adjudication : {"error":"Ce document ne semble pas être un bordereau d'adjudication."}
JSON UNIQUEMENT.`;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });

    const formData = await request.formData();
    const raw = formData.get("file");
    if (!raw || typeof raw === "string") return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

    const file = raw;
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier > 10 Mo." }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Format non supporté." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const isPdf = file.type === "application/pdf";

    const contentBlock: Anthropic.Messages.ContentBlockParam = isPdf
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/webp", data: base64 } };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: "Analyse ce bordereau d'adjudication et retourne le JSON structuré." }] }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return NextResponse.json({ error: "Réponse vide." }, { status: 500 });

    const cleaned = textBlock.text.replace(/^```json?\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 422 });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analyze bordereau error:", err);
    if (err instanceof SyntaxError) return NextResponse.json({ error: "Erreur lecture réponse." }, { status: 500 });
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
