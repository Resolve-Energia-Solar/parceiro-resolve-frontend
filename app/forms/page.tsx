"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputMask from 'react-input-mask';

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(14, "Telefone inválido"),
  energy_bill: z.string().min(1, "Informe o valor da sua conta de energia"),
});

type FormData = z.infer<typeof formSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3
    }
  }
};

const sparkleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: [0, 1, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 2
    }
  }
};

export default function FormsPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [referrerUnitId, setReferrerUnitId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const emailValue = watch('email');
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (emailValue && emailValue.includes('@')) {
        setCheckingEmail(true);
        try {
          const { data, error, count } = await supabase
            .from("users")
            .select("email", { count: 'exact' })
            .eq("email", emailValue.trim().toLowerCase())
            .limit(1);
            
          if (count && count > 0) {
            setEmailExists(true);
          } else {
            setEmailExists(false);
          }
        } catch (error) {
          console.error("Erro ao verificar email:", error);
        } finally {
          setCheckingEmail(false);
        }
      }
    }, 500); 
    
    return () => clearTimeout(timer);
  }, [emailValue]);

  useEffect(() => {
    async function fetchReferrerInfo() {
      if (referralCode) {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, unit_id")
          .eq("referral_code", referralCode)
          .single();

        if (!error && data) {
          setReferrerName(data.name);
          setReferrerId(data.id);
          setReferrerUnitId(data.unit_id);
          console.log("Referrer encontrado:", data);
        } else {
          console.error("Erro ao buscar referência:", error);
        }
      }
    }

    fetchReferrerInfo();
  }, [referralCode]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      const { count } = await supabase
        .from("users")
        .select("*", { count: 'exact' })
        .eq("email", data.email.trim().toLowerCase())
        .limit(1);
        
      if (count && count > 0) {
        toast.error("Este email já está cadastrado no sistema.");
        setEmailExists(true);
        setLoading(false);
        return;
      }
      
      if (referralCode && !referrerId) {
        console.warn("Código de referência fornecido, mas referrerId não foi encontrado");
      }
  
      const cleanTelefone = data.telefone.replace(/\D/g, '');
  
      const now = new Date().toISOString();
      
      const userData = {
        name: data.name,
        email: data.email.trim().toLowerCase(), 
        telefone: cleanTelefone,
        energy_bill: `Valor da conta de energia: R$ ${data.energy_bill}`,
        reference_id: referrerId || null,
        created_at: now,
        updated_at: now,
        user_type: "Cliente", 
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(), 
        referral_count: 0,
        total_referral_earnings: 0,
        unit_id: referrerUnitId,
      };
  
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();
  
      if (userError) {
        console.error("Erro ao criar usuário:", userError);
        throw new Error(`Erro ao criar usuário: ${userError.message}`);
      }
  
      console.log("Novo usuário criado:", newUser);
  
      if (newUser && referrerId) {
        try {
          const { data: referralData, error: referralError } = await supabase
            .from("referrals")
            .insert([{
              referrer_id: referrerId,
              referred_user_id: newUser.id,
              status: 'Indicação', 
              created_at: now,
              unit_id: referrerUnitId,
            }])
            .select();
  
          if (referralError) {
            console.error("Erro ao salvar referência:", referralError);
            throw new Error(`Erro ao salvar referência: ${referralError.message}`);
          }
  
          console.log("Referência salva com sucesso:", referralData);
  
          // CORREÇÃO: Atualizar o contador de referências corretamente
          // Opção 1: Obter o contador atual e incrementar
          const { data: userData } = await supabase
            .from("users")
            .select("referral_count")
            .eq("id", referrerId)
            .single();
  
          if (userData) {
            const newCount = (userData.referral_count || 0) + 1;
            
            const { error: updateError } = await supabase
              .from("users")
              .update({ referral_count: newCount })
              .eq("id", referrerId);
              
            if (updateError) {
              console.error("Erro ao atualizar contador de referências:", updateError);
            }
          }
  
        } catch (referralSaveError) {
          console.error("Falha ao salvar na tabela de referências:", referralSaveError);
          toast.warning("Seu cadastro foi salvo, mas houve um problema com a referência");
        }
      }
  
      setSuccess(true);
      toast.success("Cadastro realizado com sucesso!");
      reset();
    } catch (error: any) {
      console.error("Erro ao enviar formulário:", error);
      toast.error(`Erro ao enviar formulário: ${error.message || "Tente novamente mais tarde"}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        className="max-w-md w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="mb-8 text-center relative">
                <motion.div
                  className="absolute -top-4 -right-4"
                  variants={sparkleVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
                
                <motion.h1 
                  className="text-3xl font-bold text-yellow-500 mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  Economize na conta de luz com energia solar!
                </motion.h1>
                
                {referrerName && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 text-lg mb-2"
                  >
                    Você foi indicado por {referrerName}
                  </motion.p>
                )}
                
                <p className="text-gray-400">
                  Com nossa solução, você paga menos na conta, valoriza seu imóvel e se protege contra aumentos de tarifa.
                </p>
              </motion.div>

              <Card 
                className="bg-gray-900 border-yellow-500/20 overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div className="p-6" variants={containerVariants}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-6"
                  >
                    <Image
                      src="https://supabase.resolvenergiasolar.com/storage/v1/object/public/parceiros//Logo-resolve-1024x279.webp"
                      alt="Resolve Logo"
                      width={400}
                      height={109}
                      priority
                      className="h-16 w-auto mx-auto"
                    />
                  </motion.div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <motion.div variants={containerVariants}>
                      <motion.div variants={itemVariants} className="mb-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileFocus={{ scale: 1.02 }}
                          className="relative"
                        >
                          <Input
                            {...register("name")}
                            type="text"
                            placeholder="Nome completo"
                            className={`
                              bg-gray-800 border-yellow-500/20 text-white 
                              placeholder:text-gray-400 transition-all
                              ${focusedField === "name" ? 'border-yellow-500' : ''}
                            `}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                          />
                          {errors.name && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 block"
                            >
                              {errors.name.message}
                            </motion.span>
                          )}
                        </motion.div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mb-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileFocus={{ scale: 1.02 }}
                          className="relative"
                        >
                          <div className="relative">
                            <Input
                              {...register("email")}
                              type="email"
                              placeholder="Email"
                              className={`
                                bg-gray-800 border-yellow-500/20 text-white 
                                placeholder:text-gray-400 transition-all
                                ${focusedField === "email" ? 'border-yellow-500' : ''}
                                ${emailExists ? 'border-red-500' : ''}
                              `}
                              onFocus={() => setFocusedField("email")}
                              onBlur={() => {
                                setFocusedField(null);
                                trigger("email"); 
                              }}
                            />
                            {checkingEmail && (
                              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                Verificando...
                              </span>
                            )}
                          </div>
                          
                          {emailExists && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center text-red-500 text-sm mt-1"
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Este email já está cadastrado
                            </motion.div>
                          )}
                          
                          {errors.email && !emailExists && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 block"
                            >
                              {errors.email.message}
                            </motion.span>
                          )}
                        </motion.div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mb-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileFocus={{ scale: 1.02 }}
                          className="relative"
                        >
                          <InputMask
                            mask="(99) 99999-9999"
                            maskChar=""
                            {...register("telefone")}
                            placeholder="Telefone"
                            className={`
                              w-full bg-gray-800 border border-yellow-500/20 text-white 
                              placeholder:text-gray-400 transition-all rounded-md p-2
                              ${focusedField === "telefone" ? 'border-yellow-500' : ''}
                            `}
                            onFocus={() => setFocusedField("telefone")}
                            onBlur={() => setFocusedField(null)}
                          />
                          {errors.telefone && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 block"
                            >
                              {errors.telefone.message}
                            </motion.span>
                          )}
                        </motion.div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mb-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileFocus={{ scale: 1.02 }}
                          className="relative"
                        >
                          <Input
                            {...register("energy_bill")}
                            type="number"
                            placeholder="Quanto você paga de energia (R$)"
                            className={`
                              bg-gray-800 border-yellow-500/20 text-white 
                              placeholder:text-gray-400 transition-all
                              ${focusedField === "energy_bill" ? 'border-yellow-500' : ''}
                            `}
                            onFocus={() => setFocusedField("energy_bill")}
                            onBlur={() => setFocusedField(null)}
                          />
                          {errors.energy_bill && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 block"
                            >
                              {errors.energy_bill.message}
                            </motion.span>
                          )}
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      variants={pulseVariants}
                      whileHover="pulse"
                      className="mt-6"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition-all"
                        disabled={loading || emailExists}
                      >
                        <motion.div
                          className="flex items-center justify-center"
                          animate={loading ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          {loading ? (
                            <>
                              <Sun className="w-4 h-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            "Começar a economizar"
                          )}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-gray-900 p-8 rounded-lg border border-yellow-500/20"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1 }}
              >
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-yellow-500 mb-2"
              >
                Excelente escolha!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400"
              >
                Nossa equipe entrará em contato em breve para iniciar sua jornada rumo à economia de energia.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
