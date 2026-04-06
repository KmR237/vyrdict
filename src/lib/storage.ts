import { createServerClient } from "./supabase";

const BUCKET = "documents";

export async function uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string | null> {
  const supabase = createServerClient();
  const path = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url) return;
  const supabase = createServerClient();

  // Extract path from public URL
  const match = url.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
  if (!match) return;

  const { error } = await supabase.storage.from(BUCKET).remove([match[1]]);
  if (error) console.error("Storage delete error:", error);
}
