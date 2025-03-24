"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<"initial" | "client_options" | "non_client_options">("initial");
  const [isResolveCustomer, setIsResolveCustomer] = useState<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!isClient) return null;

  const handleCustomerChoice = (isCustomer: boolean) => {
    setIsResolveCustomer(isCustomer);
    if (isCustomer) {
      setStep("client_options");
    } else {
      setStep("non_client_options");
    }
  };

  const handleLoginNavigation = () => {
    router.push(`/login?isCustomer=${isResolveCustomer ? 'true' : 'false'}`);
  };

  const handleRegisterNavigation = () => {
    router.push(`/register?isCustomer=${isResolveCustomer ? 'true' : 'false'}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {step !== "initial" && (
        <Button
          onClick={() => setStep("initial")}
          className="absolute top-4 left-4 bg-transparent hover:bg-gray-800 text-yellow-400 border border-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Voltar
        </Button>
      )}
      
      <Image
        src="https://supabase.resolvenergiasolar.com/storage/v1/object/public/parceiros//Logo-resolve-1024x279.webp"
        alt="Logo"
        width={150}
        height={50}
        className="mb-6"
      />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md text-center bg-gray-900 p-8 rounded-xl shadow-lg border border-yellow-500 relative"
      >
        {step === "initial" && (
          <>
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mb-6 text-yellow-400"
            >
              Você já é cliente?
            </motion.h2>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => handleCustomerChoice(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <User size={20} /> Sim, já sou cliente
              </Button>
              <Button
                onClick={() => handleCustomerChoice(false)}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <User size={20} /> Não sou cliente ainda
              </Button>
            </div>
          </>
        )}

        {step === "client_options" && (
          <>
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mb-6 text-yellow-400"
            >
              Bem-vindo de volta!
            </motion.h2>
            <p className="text-gray-300 mb-6">O que você deseja fazer?</p>
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleLoginNavigation}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> Entrar na minha conta
              </Button>
              <Button
                onClick={handleRegisterNavigation}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <UserPlus size={20} /> Criar nova conta
              </Button>
            </div>
          </>
        )}

        {step === "non_client_options" && (
          <>
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mb-6 text-yellow-400"
            >
              Vamos começar!
            </motion.h2>
            <p className="text-gray-300 mb-6">O que você deseja fazer?</p>
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleLoginNavigation}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> Já tenho cadastro
              </Button>
              <Button
                onClick={handleRegisterNavigation}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <UserPlus size={20} /> Quero me cadastrar
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
