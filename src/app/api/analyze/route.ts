import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { AnalyseResultSchema } from "@/lib/types";
import { buildPriceReference, REPAIR_COSTS } from "@/lib/repair-costs";

const anthropic = new Anthropic();

// Vercel serverless timeout (requires Pro plan for >10s)
export const maxDuration = 60;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

const SYSTEM_PROMPT = `Expert CT automobile français. Analyse le PV et retourne UNIQUEMENT un JSON valide :
{"vehicule":{"marque":"","modele":"","immatriculation":"","annee":"","kilometrage":0},"code_postal":"","puissance_fiscale":"","energie":"","score_sante":0,"defaillances":[{"code":"","libelle":"","description":"","gravite":"","localisation":"","cout_min":0,"cout_max":0,"priorite":1,"reparation":"","peut_faire_soi_meme":false}],"cout_total_min":0,"cout_total_max":0,"cote_argus_estimee":null,"verdict":"","conseil_verdict":"","contre_visite_deadline":null,"conseils":[]}

RÈGLES :
- gravite : EXACTEMENT celle du PV (critique/majeur/mineur). Ne JAMAIS modifier.
- score_sante = 100-(15×critiques)-(8×majeures)-(2×mineures), min 0
- verdict : cout<500→reparer, cout>2000→arbitrage, sinon→reparer
- priorite : 1=bloque contre-visite, 2=sécurité, 3=confort
- description : 1 phrase courte, max 15 mots
- reparation : action courte, max 8 mots
- peut_faire_soi_meme : true pour ampoules, essuie-glaces, plaquettes, liquides
- conseils : 3 phrases courtes
- Coûts base CITADINE, adapte : berline×1.2, SUV×1.3, premium×1.5
- code_postal, puissance_fiscale, energie : lire sur le PV

PRIX CITADINE (label:min-max€) : ${buildPriceReference()}

Si PAS un CT : {"error":"Ce document ne semble pas être un procès-verbal de contrôle technique."}
Si illisible : {"error":"Le document est illisible. Essayez avec une photo plus nette."}
JSON UNIQUEMENT.`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    // File validation
    const formData = await request.formData();
    const raw = formData.get("file");

    if (!raw || typeof raw === "string") {
      return NextResponse.json({ error: "Aucun fichier envoyé." }, { status: 400 });
    }

    const file = raw;

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Le fichier dépasse 10 Mo." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez PDF, JPG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    // Call Anthropic
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const isPdf = file.type === "application/pdf";

    const contentBlock: Anthropic.Messages.ContentBlockParam = isPdf
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/webp", data: base64 } };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: "Analyse ce procès-verbal de contrôle technique et retourne le JSON structuré.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Réponse IA vide." }, { status: 500 });
    }

    // Parse and validate
    // Clean potential markdown wrapping from AI response
    const cleanedText = textBlock.text.replace(/^```json?\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    const validated = AnalyseResultSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("Validation error:", validated.error.issues);
      return NextResponse.json(
        { error: "L'IA n'a pas pu analyser ce document correctement. Réessayez avec une photo plus nette." },
        { status: 500 }
      );
    }

    // Enrichir avec cout_moyen + pièce/MO depuis notre base
    const enriched = {
      ...validated.data,
      defaillances: validated.data.defaillances.map((d) => {
        const moyen = Math.round((d.cout_min + d.cout_max) / 2);
        // Chercher dans notre base pour le détail pièce/MO
        const lower = d.libelle.toLowerCase();
        const match = REPAIR_COSTS.find((r) =>
          r.keywords.some((kw) => lower.includes(kw.toLowerCase()))
        );
        return {
          ...d,
          cout_moyen: d.cout_moyen || moyen,
          cout_piece: d.cout_piece || (match ? `Pièce : ${match.cout_piece_min}-${match.cout_piece_max}€` : undefined),
          cout_main_oeuvre: d.cout_main_oeuvre || (match ? `Main-d'œuvre : ${match.cout_mo_min}-${match.cout_mo_max}€` : undefined),
        };
      }),
    };

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    console.error("Analyze error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Erreur de lecture de la réponse. Réessayez." }, { status: 500 });
    }

    return NextResponse.json({ error: "Une erreur est survenue. Réessayez dans quelques instants." }, { status: 500 });
  }
}
