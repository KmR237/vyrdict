import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get("doc") as File | null;
  const docType = (formData.get("type") as string | null) || "autre";
  if (!file) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const url = await uploadFile(Buffer.from(bytes), `doc-${id}-${docType}-${file.name}`, file.type);
  if (!url) return NextResponse.json({ error: "Erreur upload." }, { status: 500 });

  const supabase = createServerClient();
  const { data: vehicle } = await supabase.from("vehicles").select("documents").eq("id", id).single();
  const docs = (vehicle?.documents || []) as { name: string; url: string; type: string; uploaded_at: string }[];
  docs.push({ name: file.name, url, type: docType, uploaded_at: new Date().toISOString() });
  await supabase.from("vehicles").update({ documents: docs }).eq("id", id);

  return NextResponse.json({ documents: docs });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL manquante." }, { status: 400 });

  const supabase = createServerClient();
  const { data: vehicle } = await supabase.from("vehicles").select("documents").eq("id", id).single();
  const docs = ((vehicle?.documents || []) as { url: string }[]).filter(d => d.url !== url);
  await supabase.from("vehicles").update({ documents: docs }).eq("id", id);

  return NextResponse.json({ documents: docs });
}
