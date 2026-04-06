import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET — fiche véhicule
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const { id } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  // Champs autorisés
  const allowed = [
    "statut", "prix_achat", "prix_revente", "frais_annexes",
    "devis_garage", "reparations_selectionnees", "mode_reparation",
    "notes", "devis_reel", "estimation_vyrdict",
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
  const { id } = await params;
  const supabase = createServerClient();

  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erreur de suppression." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
