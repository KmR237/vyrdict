import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;

  const formData = await request.formData();
  const photo = formData.get("photo") as File | null;
  if (!photo) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

  const bytes = await photo.arrayBuffer();
  const photoUrl = await uploadFile(Buffer.from(bytes), `photo-${id}-${photo.name}`, photo.type);
  if (!photoUrl) return NextResponse.json({ error: "Erreur upload." }, { status: 500 });

  const supabase = createServerClient();
  await supabase.from("vehicles").update({ photo_url: photoUrl }).eq("id", id);

  return NextResponse.json({ photo_url: photoUrl });
}
