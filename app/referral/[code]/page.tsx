"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkReferralCode = async () => {
      try {
        setLoading(true);
        
        const code = params.code as string;
        console.log("Referral code:", code);

        if (!code) {
          throw new Error("Código de referência não fornecido");
        }

        const { data: userData, error: supabaseError } = await supabase
          .from("users")
          .select("id, name")
          .eq("referral_code", code)
          .single();

        console.log("User data:", userData);

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw new Error("Código de referência inválido");
        }

        if (!userData) {
          throw new Error("Usuário não encontrado");
        }

        // Redirecionar para a página de formulário com o código de referência
        router.push(`/forms?ref=${code}`);
      } catch (err) {
        console.error("Erro:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setLoading(false);
      }
    };

    checkReferralCode();
  }, [params.code, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
        <p className="text-white">Verificando link de indicação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-[#121212] p-6 rounded-lg max-w-md w-full mx-4">
          <h1 className="text-red-500 text-xl font-bold mb-4">Erro</h1>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  return null;
}
