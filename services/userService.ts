import { Supabase } from "@/lib/supabase";

export async function getUser() {
  const { data, error } = await Supabase.auth.getUser();

  if (error) {
    console.error("Erro ao buscar usuário:", error.message);
    throw new Error(`Erro ao buscar usuário: ${error.message}`);
  }

  return data?.user || null;
}
