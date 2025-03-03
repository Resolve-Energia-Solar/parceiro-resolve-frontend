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
        
        const { data: userData, error } = await supabase
          .from("users")
          .select("id, name")
          .eq("id", params.code)
          .single();

        if (error) {
          throw new Error("Código de referência inválido");
        }

        if (!userData) {
          throw new Error("Usuário não encontrado");
        }

        localStorage.setItem("referrerId", userData.id);

        router.push("/register");
      } catch (err) {
        console.error("Erro:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      checkReferralCode();
    }
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

