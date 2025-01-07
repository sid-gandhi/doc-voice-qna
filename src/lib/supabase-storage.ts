import { supabase } from "@/lib/supabase-client";

export async function getPublicUrl(file: string) {
  const { data } = supabase.storage.from("rag-ai-docs").getPublicUrl(file);

  return data.publicUrl;
}
