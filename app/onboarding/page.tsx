"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import {
  signInWithCpfAndBirthDate,
  resendConfirmationEmail,
  signUpAsPartner,
  getUnits
} from "../../services/auth/authService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, FileText, User, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import InputMask from 'react-input-mask';
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<"start" | "login" | "register" | "confirmation">("start");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    email: "",
    telefone: "",
    unit: ""
  });

  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchUnits();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const fetchUnits = async () => {
    try {
      const unitsData = await getUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  };

  if (!isClient) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cpf'
        ? value.replace(/\D/g, '')
        : value
    }));
  };

  const validateForm = () => {
    const { name, cpf, birthDate, email, telefone, unit } = formData;

    if (step === "register") {
      if (!name.trim()) {
        toast.error("Nome é obrigatório");
        return false;
      }

      if (cpf.length !== 11) {
        toast.error("CPF inválido");
        return false;
      }

      if (!birthDate) {
        toast.error("Data de nascimento é obrigatória");
        return false;
      }

      if (!email.trim() || !email.includes('@')) {
        toast.error("E-mail inválido");
        return false;
      }

      if (telefone.length < 10) {
        toast.error("Telefone inválido");
        return false;
      }

      if (!unit) {
        toast.error("Unidade é obrigatória");
        return false;
      }
    }

    if (step === "login") {
      if (!cpf || !birthDate) {
        toast.error("CPF e data de nascimento são obrigatórios");
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (!validateForm()) return;

      if (step === "login") {
        const authUser = await signInWithCpfAndBirthDate(formData.cpf, formData.birthDate);

        if (authUser) {
          const userId = authUser.id;

          const { data: userData, error } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', userId)
            .single();

          if (error) {
            throw new Error('Erro ao obter informações do usuário');
          }

          if (userData && userData.user_type === "Cliente") {
            await supabase.auth.signOut();
            throw new Error('Acesso não autorizado. Clientes não podem acessar o sistema administrativo.');
          }

          toast.success("Login realizado com sucesso!");

          if (userData && userData.user_type === "SDR") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        }
      } else if (step === "register") {
        const newUser = await signUpAsPartner({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          birthDate: formData.birthDate,
          telefone: formData.telefone,
          unit: formData.unit,
        });

        if (newUser) {
          setStep("confirmation");
        }
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast.error("Erro: " + (error.message || "Ocorreu um problema durante a autenticação"));
    } finally {
      setIsLoading(false);
    }
  };



  const handleResendConfirmation = async () => {
    setIsLoading(true);
    try {
      await resendConfirmationEmail(formData.email);
      toast.success("E-mail de confirmação reenviado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao reenviar e-mail: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <Image
        src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
        alt="Logo"
        width={150}
        height={50}
        className="mb-6"
      />
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
              <Button
                onClick={() => setStep("login")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <User size={20} /> Sim, já sou cliente
              </Button>
              <Button
                onClick={() => setStep("register")}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <User size={20} />quero me cadastrar
              </Button>
            </div>
          </>
        )}
        {(step === "login" || step === "register") && (
          <>
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mb-6 text-yellow-400"
            >
              {step === "login" ? "Faça seu Login" : "Crie sua Conta"}
            </motion.h2>
            <div className="flex flex-col gap-4">
              {step === "login" && (
                <>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <FileText size={20} className="mr-2 text-yellow-400" />
                    <InputMask
                      mask="999.999.999-99"
                      maskChar=""
                      type="text"
                      name="cpf"
                      placeholder="CPF"
                      className="w-full bg-transparent text-white outline-none"
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Calendar size={20} className="mr-2 text-yellow-400" />
                    <InputMask
                      mask="99/99/9999"
                      maskChar=""
                      type="text"
                      name="birthDate"
                      id="birthDate"
                      placeholder="dd/mm/aaaa"
                      className="w-full h-10 bg-transparent text-white outline-none"
                      value={formData.birthDate}
                      onChange={handleChange}
                      style={{
                        fontSize: '16px',
                        caretColor: 'white',
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  </div>
                </>
              )}
              {step === "register" && (
                <>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <User size={20} className="mr-2 text-yellow-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Seu nome"
                      className="w-full bg-transparent text-white outline-none"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <FileText size={20} className="mr-2 text-yellow-400" />
                    <InputMask
                      mask="999.999.999-99"
                      maskChar=""
                      type="text"
                      name="cpf"
                      placeholder="CPF"
                      className="w-full bg-transparent text-white outline-none"
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Mail size={20} className="mr-2 text-yellow-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="E-mail"
                      className="w-full bg-transparent text-white outline-none"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Phone size={20} className="mr-2 text-yellow-400" />
                    <InputMask
                      mask="(99) 99999-9999"
                      maskChar=""
                      type="text"
                      name="telefone"
                      placeholder="Telefone"
                      className="w-full bg-transparent text-white outline-none"
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <Calendar size={24} className="mr-3 text-yellow-400 flex-shrink-0" />
                    <InputMask
                      mask="99/99/9999"
                      maskChar=""
                      type="text"
                      name="birthDate"
                      placeholder="dd/mm/aaaa"
                      className="w-full bg-transparent text-white outline-none text-lg py-2 px-1 touch-manipulation"
                      value={formData.birthDate}
                      onChange={handleChange}
                      style={{
                        fontSize: '16px',
                        WebkitAppearance: 'none',
                        borderRadius: '4px',
                        touchAction: 'manipulation'
                      }}
                    />
                  </div>


                  <div className="flex items-center bg-gray-800 border border-yellow-400 p-3 rounded-md">
                    <MapPin size={20} className="mr-2 text-yellow-400" />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full bg-transparent text-white outline-none"
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-4"
            >
              {isLoading ? "Processando..." : (step === "login" ? "Entrar" : "Cadastrar")}
            </Button>
          </>
        )}
        {step === "confirmation" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Confirmação de Conta</h2>
            <p className="mb-4">
              Um e-mail de confirmação foi enviado para {formData.email}.
              Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
            </p>
            <p className="mb-4">
              Não recebeu o e-mail? Verifique sua pasta de spam ou clique abaixo para reenviar.
            </p>
            <Button
              onClick={handleResendConfirmation}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg"
            >
              {isLoading ? "Reenviando..." : "Reenviar E-mail de Confirmação"}
            </Button>
          </motion.div>
        )}
      </motion.div>
      <ToastContainer />
    </div>
  );
}
