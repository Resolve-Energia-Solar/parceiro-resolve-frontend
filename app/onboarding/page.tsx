"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { signUpWithCpfAndBirthDate, signInWithCpfAndBirthDate } from "../../lib/auth/authService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<"start" | "login" | "register">("start");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    setIsLoading(true);

    try {
      if (step === "login") {
        if (!formData.cpf || !formData.birthDate) {
          alert("Por favor, preencha CPF e data de nascimento.");
          return;
        }

        const user = await signInWithCpfAndBirthDate(formData.cpf, formData.birthDate);

        if (user) {
          alert("Login realizado com sucesso!");
          router.replace("/dashboard");
        }
      } else {
        if (!formData.name || !formData.cpf || !formData.birthDate || !formData.email || !formData.password) {
          alert("Todos os campos são obrigatórios.");
          return;
        }

        const newUser = await signUpWithCpfAndBirthDate(formData);
        if (newUser) {
          alert("Cadastro realizado com sucesso! Faça login.");
          setStep("login");
        }
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {step === "start" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">Você já é cliente?</h2>
          <Button onClick={() => setStep("login")} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg mb-4">
            Sim, já sou cliente
          </Button>
          <Button onClick={() => setStep("register")} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 rounded-lg">
            Não, quero me cadastrar
          </Button>
        </motion.div>
      )}

      {(step === "login" || step === "register") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">{step === "login" ? "Faça seu Login" : "Crie sua Conta"}</h2>

          {step === "register" && (
            <>
              <p className="text-xl">Nome</p>
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={formData.name}
                onChange={handleChange}
              />

              <p className="text-xl mt-4">E-mail</p>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </>
          )}

          <p className="text-xl mt-4">CPF</p>
          <input
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            value={formData.cpf}
            onChange={handleChange}
          />

          <p className="text-xl mt-4">Data de Nascimento</p>
          <input
            type="date"
            name="birthDate"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            value={formData.birthDate}
            onChange={handleChange}
          />

          {step === "register" && (
            <>
              <p className="text-xl mt-4">Senha</p>
              <input
                type="password"
                name="password"
                placeholder="Sua senha"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                value={formData.password}
                onChange={handleChange}
              />
            </>
          )}

          <Button onClick={handleAuth} disabled={isLoading} className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg">
            {isLoading ? "Carregando..." : step === "login" ? "Entrar" : "Cadastrar"}
          </Button>

          <Button onClick={() => setStep("start")} className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 rounded-lg">
            Voltar
          </Button>
        </motion.div>
      )}
    </div>
  );
}
