import { supabase } from "@/lib/supabase";

export async function getRanking() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, referral_code, referral_count, total_referral_earnings')
    .order('referral_count', { ascending: false })
    .order('total_referral_earnings', { ascending: false });

  if (error) {
    console.error("Erro ao buscar ranking:", error.message);
    throw new Error(`Erro ao buscar ranking: ${error.message}`);
  }

  return data;
}
