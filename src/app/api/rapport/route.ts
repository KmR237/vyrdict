import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { AnalyseResultSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resultat, prix_demande } = body;

    if (!resultat) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    const validated = AnalyseResultSchema.safeParse(resultat);
    if (!validated.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("rapports")
      .insert({
        resultat: validated.data,
        prix_demande: prix_demande ? parseInt(prix_demande) : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Rapport insert error:", error);
      return NextResponse.json({ error: "Erreur de sauvegarde." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Rapport error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
