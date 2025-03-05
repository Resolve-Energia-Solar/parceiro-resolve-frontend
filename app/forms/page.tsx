"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  birthdate: z.string().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "Você deve ter pelo menos 18 anos"),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter entre 10 e 11 dígitos"),
});

type FormData = z.infer<typeof formSchema>;

// Variantes de animação
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
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function fetchReferrerName() {
      if (referralCode) {
        const { data, error } = await supabase
          .from("users")
          .select("name")
          .eq("referral_code", referralCode)
          .single();

        if (!error && data) {
          setReferrerName(data.name);
        }
      }
    }

    fetchReferrerName();
  }, [referralCode]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let referenceId = null;
      if (referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from("users")
          .select("id, referral_count")
          .eq("referral_code", referralCode)
          .single();

        if (!referrerError && referrerData) {
          referenceId = referrerData.id;
          
          await supabase
            .from("users")
            .update({ referral_count: (referrerData.referral_count || 0) + 1 })
            .eq("id", referenceId);
        }
      }

      const now = new Date().toISOString();
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([{
          ...data,
          reference_id: referenceId,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (userError) throw userError;

      if (newUser && referenceId) {
        await supabase
          .from("referrals")
          .insert([{
            referrer_id: referenceId,
            referred_user_id: newUser.id,
            status: 'pending',
            created_at: now,
          }]);
      }

      setSuccess(true);
      toast.success("Cadastro realizado com sucesso!");
      reset();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar formulário");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: "name", placeholder: "Nome completo", type: "text" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "cpf", placeholder: "CPF (apenas números)", type: "text" },
    { name: "birthdate", placeholder: "Data de Nascimento", type: "date" },
    { name: "telefone", placeholder: "Telefone (apenas números)", type: "text" }
  ];

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
                      src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
                      alt="Resolve Logo"
                      width={400}
                      height={109}
                      priority
                      className="h-16 w-auto mx-auto"
                    />
                  </motion.div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <motion.div variants={containerVariants}>
                      {formFields.map((field, index) => (
                        <motion.div
                          key={field.name}
                          variants={itemVariants}
                          className="mb-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                            className="relative"
                          >
                            <Input
                              {...register(field.name as keyof FormData)}
                              type={field.type}
                              placeholder={field.placeholder}
                              className={`
                                bg-gray-800 border-yellow-500/20 text-white 
                                placeholder:text-gray-400 transition-all
                                ${focusedField === field.name ? 'border-yellow-500' : ''}
                              `}
                              onFocus={() => setFocusedField(field.name)}
                              onBlur={() => setFocusedField(null)}
                            />
                            {errors[field.name as keyof FormData] && (
                              <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1 block"
                              >
                                {errors[field.name as keyof FormData]?.message}
                              </motion.span>
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={pulseVariants}
                      whileHover="pulse"
                      className="mt-6"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition-all"
                        disabled={loading}
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
