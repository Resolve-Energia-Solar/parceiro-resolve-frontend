"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { signUpWithCpfAndBirthDate, signInWithCpfAndBirthDate } from "../../services/auth/authService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, FileText, Lock, User, Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<"start" | "login" | "register">("start");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!isClient) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (step === "login") {
        if (!formData.cpf || !formData.birthDate) {
          toast.error("Por favor, preencha CPF e data de nascimento.");
          return;
        }
        const user = await signInWithCpfAndBirthDate(formData.cpf, formData.birthDate);
        if (user) {
          toast.success("Login realizado com sucesso!");
          router.replace("/dashboard");
        }
      } else {
        if (!formData.name || !formData.cpf || !formData.birthDate || !formData.email || !formData.telefone || !formData.password || !formData.confirmPassword) {
          toast.error("Todos os campos são obrigatórios.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("As senhas não coincidem.");
          return;
        }
        const newUser = await signUpWithCpfAndBirthDate({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          birthDate: formData.birthDate,
          password: formData.password,
          telefone: formData.telefone,
        });
        if (newUser) {
          toast.success("Cadastro realizado com sucesso! Faça login.");
          setStep("login");
        }
      }
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <Image src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
        alt="Logo" width={150} height={50} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md text-center bg-gray-900 p-8 rounded-xl shadow-lg border border-yellow-500"
      >
        {step === "start" && (
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
              <Button onClick={() => setStep("login")} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <User size={20} /> Sim, já sou cliente
              </Button>
              <Button onClick={() => setStep("register")} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <User size={20} /> Não, quero me cadastrar
              </Button>
            </div>
          </>
        )}
        {(step === "login" || step === "register") && (
          <>
            <motion.h2 initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="text-3xl font-bold mb-6 text-yellow-400">
              {step === "login" ? "Faça seu Login" : "Crie sua Conta"}
            </motion.h2>
            <div className="flex flex-col gap-4">
              {step === "login" && (
                <>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <FileText size={20} className="mr-2 text-yellow-400" />
                    <input type="text" name="cpf" placeholder="CPF" className="w-full bg-transparent text-white outline-none" value={formData.cpf} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Calendar size={20} className="mr-2 text-yellow-400" />
                    <input type="date" name="birthDate" className="w-full bg-transparent text-white outline-none" value={formData.birthDate} onChange={handleChange} />
                  </div>
                </>
              )}
              {step === "register" && (
                <>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <User size={20} className="mr-2 text-yellow-400" />
                    <input type="text" name="name" placeholder="Seu nome" className="w-full bg-transparent text-white outline-none" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <FileText size={20} className="mr-2 text-yellow-400" />
                    <input type="text" name="cpf" placeholder="CPF" className="w-full bg-transparent text-white outline-none" value={formData.cpf} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Mail size={20} className="mr-2 text-yellow-400" />
                    <input type="email" name="email" placeholder="E-mail" className="w-full bg-transparent text-white outline-none" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Phone size={20} className="mr-2 text-yellow-400" />
                    <input type="text" name="telefone" placeholder="Telefone" className="w-full bg-transparent text-white outline-none" value={formData.telefone} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Calendar size={20} className="mr-2 text-yellow-400" />
                    <input type="date" name="birthDate" className="w-full bg-transparent text-white outline-none" value={formData.birthDate} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Lock size={20} className="mr-2 text-yellow-400" />
                    <input type="password" name="password" placeholder="Senha" className="w-full bg-transparent text-white outline-none" value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Lock size={20} className="mr-2 text-yellow-400" />
                    <input type="password" name="confirmPassword" placeholder="Confirmar Senha" className="w-full bg-transparent text-white outline-none" value={formData.confirmPassword} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>
            <Button onClick={handleAuth} disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-4">
              {isLoading ? "Processando..." : (step === "login" ? "Entrar" : "Cadastrar")}
            </Button>
          </>
        )}
      </motion.div>
      <ToastContainer />
    </div>
  );
}
