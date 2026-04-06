import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;

  try {
    const formData = await request.formData();
    const ctFile = formData.get("ctFile") as File | null;
    if (!ctFile) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

    const bytes = await ctFile.arrayBuffer();
    const ctFileUrl = await uploadFile(Buffer.from(bytes), ctFile.name, ctFile.type);

    if (ctFileUrl) {
      const supabase = createServerClient();
      await supabase.from("vehicles").update({ ct_file_url: ctFileUrl }).eq("id", id);
    }

    return NextResponse.json({ ok: true, ct_file_url: ctFileUrl });
  } catch (err) {
    console.error("Upload CT error:", err);
    return NextResponse.json({ error: "Erreur upload." }, { status: 500 });
  }
}
