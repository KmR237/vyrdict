import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();

  // Récupérer le véhicule source avec son analyse
  const { data: source, error: srcError } = await supabase
    .from("vehicles")
    .select("*, analyses(*)")
    .eq("id", id)
    .single();
  if (srcError || !source) return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });

  // Dupliquer l'analyse (référence indépendante)
  const { id: _, created_at: __, ...analyseData } = source.analyses;
  const { data: newAnalyse, error: anaError } = await supabase
    .from("analyses")
    .insert(analyseData)
    .select("id")
    .single();
  if (anaError || !newAnalyse) return NextResponse.json({ error: "Erreur duplication analyse." }, { status: 500 });

  // Dupliquer le véhicule en réinitialisant les données spécifiques
  const { id: _vid, created_at: _vcreated, analyses: _va, prix_achat, prix_vente_reel, date_achat, date_vente, statut, photo_url, ct_file_url, timeline, reparations_faites, notes, notes_acheteur, ...vehicleData } = source;
  const { data: newVehicle, error: vehError } = await supabase
    .from("vehicles")
    .insert({
      ...vehicleData,
      analyse_id: newAnalyse.id,
      statut: "a_etudier",
      prix_achat: null,
      prix_vente_reel: null,
      date_achat: null,
      date_vente: null,
      timeline: [],
      reparations_faites: [],
      notes: "",
      notes_acheteur: "",
    })
    .select("id")
    .single();
  if (vehError || !newVehicle) return NextResponse.json({ error: "Erreur duplication véhicule." }, { status: 500 });

  return NextResponse.json({ id: newVehicle.id });
}
