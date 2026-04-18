import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_CATEGORIES = ["transport", "remise_en_etat", "controle_technique", "carte_grise", "autre"] as const;

// GET — liste des frais d'un véhicule
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(_)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("vehicle_expenses")
    .select("*")
    .eq("vehicle_id", id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Expenses list error:", error);
    return NextResponse.json({ error: "Erreur de chargement des frais." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — ajouter un frais
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  const { category, amount, description } = body;
  const date = body.date || new Date().toISOString().slice(0, 10);

  if (!category || amount == null) {
    return NextResponse.json({ error: "Champs requis : category, amount." }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Catégorie invalide. Autorisées : ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("vehicle_expenses")
    .insert({
      vehicle_id: id,
      date,
      category,
      amount: Number(amount),
      description: description || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Expense insert error:", error);
    return NextResponse.json({ error: "Erreur d'ajout du frais." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — supprimer un frais
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  await params; // consume params
  const supabase = createServerClient();
  const body = await request.json();

  const { expense_id } = body;
  if (!expense_id) {
    return NextResponse.json({ error: "expense_id requis." }, { status: 400 });
  }

  const { error } = await supabase
    .from("vehicle_expenses")
    .delete()
    .eq("id", expense_id);

  if (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: "Erreur de suppression." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
