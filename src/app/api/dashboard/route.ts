import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

// GET — liste des véhicules
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      analyses (
        marque, modele, immatriculation, annee, kilometrage,
        score_sante, cout_total_min, cout_total_max, verdict,
        defaillances_count, code_postal, resultat
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard list error:", error);
    return NextResponse.json({ error: "Erreur de chargement." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — sauvegarder une analyse + créer un véhicule
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { resultat, fileHash } = body;

    // Sauvegarder l'analyse
    const { data: analyse, error: analyseError } = await supabase
      .from("analyses")
      .insert({
        marque: resultat.vehicule.marque,
        modele: resultat.vehicule.modele,
        immatriculation: resultat.vehicule.immatriculation,
        annee: resultat.vehicule.annee,
        kilometrage: resultat.vehicule.kilometrage,
        code_postal: resultat.code_postal || "",
        score_sante: resultat.score_sante,
        cout_total_min: resultat.cout_total_min,
        cout_total_max: resultat.cout_total_max,
        verdict: resultat.verdict,
        defaillances_count: resultat.defaillances.length,
        puissance_fiscale: resultat.puissance_fiscale || "",
        energie: resultat.energie || "",
        resultat,
        file_hash: fileHash || null,
      })
      .select()
      .single();

    if (analyseError) {
      console.error("Analyse insert error:", analyseError);
      return NextResponse.json({ error: "Erreur de sauvegarde." }, { status: 500 });
    }

    // Créer le véhicule dans le dashboard
    const coutMoyen = Math.round((resultat.cout_total_min + resultat.cout_total_max) / 2);
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        analyse_id: analyse.id,
        estimation_vyrdict: coutMoyen,
        frais_annexes: 350,
      })
      .select()
      .single();

    if (vehicleError) {
      console.error("Vehicle insert error:", vehicleError);
      return NextResponse.json({ error: "Erreur de sauvegarde véhicule." }, { status: 500 });
    }

    return NextResponse.json({ analyse_id: analyse.id, vehicle_id: vehicle.id });
  } catch (err) {
    console.error("Dashboard save error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
