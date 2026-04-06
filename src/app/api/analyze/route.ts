import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { AnalyseResultSchema } from "@/lib/types";
import { buildPriceReference } from "@/lib/repair-costs";

const anthropic = new Anthropic();

// Vercel serverless timeout (requires Pro plan for >10s)
export const maxDuration = 60;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

const SYSTEM_PROMPT = `Tu es un expert en contrôle technique automobile français. On te donne une photo ou un PDF d'un procès-verbal de contrôle technique.

Analyse le document et retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks, sans texte avant ou après) avec cette structure exacte :

{
  "vehicule": {
    "marque": "string",
    "modele": "string",
    "immatriculation": "string",
    "annee": "string",
    "kilometrage": number
  },
  "code_postal": "string (code postal du centre de contrôle technique, lu sur le PV, ex: '40100')",
  "puissance_fiscale": "string (puissance fiscale en CV, lue sur le PV, ex: '5')",
  "energie": "string (type d'énergie/carburant lu sur le PV, ex: 'essence', 'diesel', 'hybride', 'electrique')",
  "score_sante": number,
  "defaillances": [
    {
      "code": "string (code officiel CT ex: 1.1.13.a.2)",
      "libelle": "string (nom simple de la défaillance)",
      "description": "string (explication claire pour un non-mécanicien, 1-2 phrases)",
      "gravite": "critique" | "majeur" | "mineur",
      "localisation": "string (ex: AVG, AVD, ARG, ARD, AV, AR)",
      "cout_min": number,
      "cout_max": number,
      "cout_moyen": number,
      "cout_piece": "string (ex: 'Pièce : 30-80€')",
      "cout_main_oeuvre": "string (ex: 'Main-d œuvre : 50-100€')",
      "priorite": 1 | 2 | 3,
      "reparation": "string (action à faire, 1 phrase)",
      "peut_faire_soi_meme": boolean
    }
  ],
  "cout_total_min": number,
  "cout_total_max": number,
  "cote_argus_estimee": null,
  "verdict": "reparer" | "vendre" | "arbitrage",
  "conseil_verdict": "string",
  "contre_visite_deadline": "string (date JJ/MM/AAAA) ou null",
  "conseils": ["string", "string", "string"]
}

RÈGLES DE CALCUL :
- code_postal : lis le code postal du centre de contrôle technique sur le PV. Si illisible, retourne ""
- score_sante = 100 - (15 × nombre de critiques) - (8 × nombre de majeures) - (2 × nombre de mineures), minimum 0
- cote_argus_estimee : toujours null (l'utilisateur la saisira)
- verdict : sans cote Argus, base-toi uniquement sur le coût total. Si < 500€ → "reparer", si > 2000€ → "arbitrage", sinon → "reparer"
- priorite : 1 = bloque la contre-visite (défaillances majeures/critiques), 2 = sécurité, 3 = confort/esthétique (mineures)
- GRAVITÉ : utilise EXACTEMENT la gravité indiquée sur le procès-verbal (critique, majeur ou mineur). Ne la modifie JAMAIS. Le CT fait autorité. Si tu penses qu'une défaillance est sous-estimée, mentionne-le dans le champ "description" (ex: "Attention : cette défaillance pourrait présenter un risque important") mais garde la gravité officielle du PV
- Coûts : UTILISE IMPÉRATIVEMENT le référentiel de prix ci-dessous. Les prix sont en base CITADINE. Adapte selon le véhicule détecté sur le CT :
  - Citadine (Clio, 208, C3, Polo) : utilise les prix tels quels
  - Berline (308, Golf, Mégane) : multiplie par 1.2
  - SUV/Crossover (3008, Tiguan, Kadjar) : multiplie par 1.3
  - Premium (BMW, Audi, Mercedes, Volvo) : multiplie par 1.5
- cout_moyen : la MOYENNE de cout_min et cout_max (après ajustement véhicule)
- cout_piece : estimation du coût de la pièce seule (ex: "Pièce : 30-80€")
- cout_main_oeuvre : estimation de la main-d'œuvre (ex: "Main-d'œuvre : 50-100€")
- peut_faire_soi_meme : true uniquement pour ampoules, essuie-glaces, plaquettes simples, liquides, petits équipements
- conseils : 3 conseils pratiques et contextualisés

Si le document n'est PAS un contrôle technique, retourne :
{"error": "Ce document ne semble pas être un procès-verbal de contrôle technique."}

Si le document est illisible, retourne :
{"error": "Le document est illisible. Essayez avec une photo plus nette ou le PDF original."}

RÉFÉRENTIEL DE PRIX VÉRIFIÉS — BASE CITADINE (garage indépendant France 2025-2026) :
${buildPriceReference()}

UTILISE ce référentiel comme base. Adapte les prix au véhicule détecté (citadine/berline/SUV/premium). Si une défaillance ne correspond à aucune entrée, estime de manière réaliste en respectant le segment véhicule.

IMPORTANT : retourne UNIQUEMENT le JSON, rien d'autre.`;

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

    return NextResponse.json(validated.data);
  } catch (err: unknown) {
    console.error("Analyze error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Erreur de lecture de la réponse. Réessayez." }, { status: 500 });
    }

    return NextResponse.json({ error: "Une erreur est survenue. Réessayez dans quelques instants." }, { status: 500 });
  }
}
