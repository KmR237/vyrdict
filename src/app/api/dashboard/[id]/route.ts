import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

// GET — fiche véhicule
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(_)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      analyses (*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Véhicule non trouvé." }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH — mettre à jour un véhicule
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  // Champs autorisés
  const allowed = [
    "statut", "prix_achat", "prix_revente", "frais_annexes",
    "devis_garage", "reparations_selectionnees", "mode_reparation",
    "notes", "devis_reel", "estimation_vyrdict",
    "source_achat", "date_achat", "cout_stockage_jour", "prix_vente_reel", "photo_url", "custom_prices", "lien_annonce",
    "tva_sur_marge", "marge_minimum", "frais_enchere_pct", "frais_enchere_fixes", "mode_enchere",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Vehicle update error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — supprimer un véhicule
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(_)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();

  // Récupérer les URLs des fichiers avant suppression
  const { data: vehicle } = await supabase.from("vehicles").select("photo_url, ct_file_url, analyse_id").eq("id", id).single();

  // Supprimer les fichiers Storage
  if (vehicle?.photo_url && vehicle.photo_url.includes("/storage/")) await deleteFile(vehicle.photo_url);
  if (vehicle?.ct_file_url) await deleteFile(vehicle.ct_file_url);

  // Supprimer le véhicule (cascade supprime l'analyse)
  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  // Supprimer l'analyse orpheline
  if (vehicle?.analyse_id) {
    await supabase.from("analyses").delete().eq("id", vehicle.analyse_id);
  }

  if (error) {
    return NextResponse.json({ error: "Erreur de suppression." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
