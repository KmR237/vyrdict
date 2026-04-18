import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

// GET — liste des véhicules
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id, created_at, statut, prix_achat, prix_revente, devis_garage,
      frais_annexes, estimation_vyrdict, devis_reel, date_achat,
      cout_stockage_jour, source_achat, notes,
      date_enchere, tva_sur_marge, marge_minimum, lien_annonce,
      frais_enchere_pct, frais_enchere_fixes, mode_enchere, usage_perso,
      vin, seller_name, buyer_name, tva_regime, date_vente,
      analyses (
        marque, modele, immatriculation, annee, kilometrage,
        score_sante, cout_total_min, cout_total_max, verdict,
        defaillances_count, code_postal, energie, puissance_fiscale
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
    // Support both JSON and FormData
    let resultat;
    let ctFileUrl: string | null = null;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      resultat = JSON.parse(formData.get("resultat") as string);

      // Upload CT file to Supabase Storage
      const ctFile = formData.get("ctFile") as File | null;
      if (ctFile) {
        const bytes = await ctFile.arrayBuffer();
        ctFileUrl = await uploadFile(Buffer.from(bytes), ctFile.name, ctFile.type);
      }
    } else {
      const body = await request.json();
      resultat = body.resultat;
    }

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
        file_hash: null,
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
        ct_file_url: ctFileUrl,
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
