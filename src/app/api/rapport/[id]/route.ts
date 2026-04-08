import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("rapports")
    .select("id, created_at, resultat, prix_demande, views")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Rapport introuvable." }, { status: 404 });
  }

  // Increment views (fire and forget)
  supabase.from("rapports").update({ views: (data.views || 0) + 1 }).eq("id", id).then();

  return NextResponse.json(data);
}
