import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

// POST — générer le prochain numéro de facture
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();

  // Récupérer le compteur actuel
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("invoice_counter")
    .eq("id", 1)
    .single();

  if (settingsError || !settings) {
    console.error("Invoice counter fetch error:", settingsError);
    return NextResponse.json({ error: "Erreur de lecture du compteur." }, { status: 500 });
  }

  const nextCounter = (settings.invoice_counter || 0) + 1;
  const year = new Date().getFullYear();
  const invoiceNumber = `FAC-${year}-${String(nextCounter).padStart(3, "0")}`;

  // Incrémenter le compteur
  const { error: updateError } = await supabase
    .from("settings")
    .update({ invoice_counter: nextCounter })
    .eq("id", 1);

  if (updateError) {
    console.error("Invoice counter update error:", updateError);
    return NextResponse.json({ error: "Erreur de mise à jour du compteur." }, { status: 500 });
  }

  // Sauvegarder le numéro de facture sur le véhicule
  const { error: vehicleError } = await supabase
    .from("vehicles")
    .update({ invoice_number: invoiceNumber })
    .eq("id", id);

  if (vehicleError) {
    console.error("Vehicle invoice update error:", vehicleError);
    return NextResponse.json({ error: "Erreur de sauvegarde sur le véhicule." }, { status: 500 });
  }

  return NextResponse.json({ invoice_number: invoiceNumber });
}
