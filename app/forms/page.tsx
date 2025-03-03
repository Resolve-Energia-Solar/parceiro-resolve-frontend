"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface FormData {
  name: string;
  email: string;
  cpf: string;
  birthdate: string;
  telefone: string;
}

export default function FormsPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    cpf: "",
    birthdate: "",
    telefone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.cpf || !formData.birthdate || !formData.telefone) {
        throw new Error("Por favor, preencha todos os campos.");
      }

      if (formData.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error("CPF deve ter 11 dígitos.");
      }
      if (formData.telefone.replace(/\D/g, '').length < 10 || formData.telefone.replace(/\D/g, '').length > 11) {
        throw new Error("Telefone deve ter entre 10 e 11 dígitos.");
      }

      let referenceId = null;
      if (referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", referralCode)
          .single();

        if (referrerError) {
          console.error("Erro ao encontrar o usuário que fez a indicação:", referrerError);
        } else {
          referenceId = referrerData?.id;
        }
      }

      const now = new Date().toISOString();
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name.substring(0, 255),
            email: formData.email.substring(0, 255),
            cpf: formData.cpf.replace(/\D/g, ''),
            birthdate: formData.birthdate,
            telefone: formData.telefone.replace(/\D/g, ''),
            reference_id: referenceId,
            created_at: now,
            updated_at: now,
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error("Erro ao salvar os dados do usuário:", userError);
        throw new Error(userError.message || "Erro ao salvar os dados do usuário");
      }

      console.log("Novo usuário inserido:", newUser);

      if (newUser && referenceId) {
        const { error: referralError } = await supabase
          .from("referrals")
          .insert([
            {
              referrer_id: referenceId,
              referred_user_id: newUser.id,
              status: 'pending',
              created_at: now,
            }
          ]);

        if (referralError) {
          console.error("Erro ao salvar referência:", referralError);
        }
      }

      setSuccess(true);
      toast.success("Cadastro realizado com sucesso!");
      setFormData({
        name: "",
        email: "",
        cpf: "",
        birthdate: "",
        telefone: "",
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar formulário");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <AnimatePresence>
          {!success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 bg-gray-900 shadow-lg border-yellow-500 border-2">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 text-center"
                >
                  <Image
                    src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
                    alt="Resolve Logo"
                    width={400}
                    height={109}
                    priority
                    className="h-20 w-auto mx-auto mb-4"
                  />
                  <h1 className="text-2xl font-bold text-yellow-500 mb-2">
                    Cadastro Resolve Energia Solar
                  </h1>
                  <p className="text-gray-400">
                    Preencha seus dados para receber uma proposta personalizada
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {["name", "email", "cpf", "birthdate", "telefone"].map((field) => (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * ["name", "email", "cpf", "birthdate", "telefone"].indexOf(field) }}
                    >
                      <Label htmlFor={field} className="text-yellow-500">{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      <Input
                        id={field}
                        name={field}
                        type={field === "email" ? "email" : field === "birthdate" ? "date" : "text"}
                        value={formData[field as keyof FormData]}
                        onChange={handleInputChange}
                        required
                        maxLength={field === "cpf" ? 14 : field === "telefone" ? 15 : undefined}
                        placeholder={field === "cpf" ? "000.000.000-00" : field === "telefone" ? "(00) 00000-0000" : undefined}
                        className="mt-1 bg-gray-800 border-yellow-500 text-white"
                      />
                    </motion.div>
                  ))}

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Sun className="w-4 h-4 animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar cadastro"
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Sun className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-yellow-500 mb-2">Cadastro Realizado com Sucesso!</h2>
              <p className="text-gray-400">Entraremos em contato em breve com sua proposta personalizada.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
