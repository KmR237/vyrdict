import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

// GET — récupérer les paramètres
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Erreur de chargement des paramètres." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH — mettre à jour les paramètres
export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const supabase = createServerClient();
  const body = await request.json();

  const allowed = [
    "tva_rate", "default_tva_regime", "stock_alert_days",
    "target_margin", "company_info", "invoice_counter", "seller_status",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour." }, { status: 500 });
  }

  return NextResponse.json(data);
}
