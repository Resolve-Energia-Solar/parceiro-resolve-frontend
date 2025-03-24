"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import { signInWithCpfAndBirthDate } from "../../services/auth/authService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Calendar, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InputMask from 'react-input-mask';
import { supabase } from "@/lib/supabase";


export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();


  const [formData, setFormData] = useState({
    cpf: "",
    birthDate: "",
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cpf' ? value.replace(/\D/g, '') : value
    }));
  };


  const validateForm = () => {
    if (!formData.cpf || !formData.birthDate) {
      toast.error("CPF e data de nascimento são obrigatórios");
      return false;
    }
    return true;
  };


  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }


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


        if (userData && (userData.user_type === "Contratos")) {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }        
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast.error("Erro: " + (error.message || "Ocorreu um problema durante a autenticação"));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <Link href="/onboarding" className="absolute top-4 left-4">
        <Button
          className="bg-transparent hover:bg-gray-800 text-yellow-400 border border-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Voltar
        </Button>
      </Link>


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
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold mb-6 text-yellow-400"
        >
          Faça seu Login
        </motion.h2>
        <div className="flex flex-col gap-4">
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
              placeholder="Data de Nascimento"
              className="w-full bg-transparent text-white outline-none"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mt-4"
        >
          {isLoading ? "Processando..." : "Entrar"}
        </Button>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 mb-4">Ainda não é cliente?</p>
          <Link href="/register">
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-yellow-400 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={20} /> Criar uma conta
            </Button>
          </Link>
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
}
