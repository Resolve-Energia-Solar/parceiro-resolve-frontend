import { useState } from "react";
import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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

interface ReferralFormProps {
  onSuccess: () => void;
  referralCode: string;
}

export default function ReferralForm({ onSuccess, referralCode }: ReferralFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: referrerData, error: referrerError } = await supabase
        .from("users")
        .select("id, referral_count")
        .eq("referral_code", referralCode)
        .single();

      if (referrerError) throw referrerError;

      const now = new Date().toISOString();
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([{
          ...data,
          reference_id: referrerData.id,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (userError) throw userError;

      await supabase
        .from("referrals")
        .insert([{
          referrer_id: referrerData.id,
          referred_user_id: newUser.id,
          status: 'pending',
          created_at: now,
        }]);

      await supabase
        .from("users")
        .update({ referral_count: referrerData.referral_count + 1 })
        .eq("id", referrerData.id);

      toast.success("Indicação realizada com sucesso!");
      reset();
      onSuccess();
    } catch (error) {
      console.error("Erro ao enviar indicação:", error);
      toast.error("Erro ao enviar indicação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("name")}
        placeholder="Nome completo"
        className="bg-gray-800 border-yellow-500/20 text-white"
      />
      {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}

      <Input
        {...register("email")}
        type="email"
        placeholder="Email"
        className="bg-gray-800 border-yellow-500/20 text-white"
      />
      {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}

      <Input
        {...register("birthdate")}
        type="date"
        placeholder="Data de Nascimento"
        className="bg-gray-800 border-yellow-500/20 text-white"
      />
      {errors.birthdate && <span className="text-red-500 text-sm">{errors.birthdate.message}</span>}

      <Input
        {...register("telefone")}
        placeholder="Telefone (apenas números)"
        className="bg-gray-800 border-yellow-500/20 text-white"
      />
      {errors.telefone && <span className="text-red-500 text-sm">{errors.telefone.message}</span>}

      <Button
        type="submit"
        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition-all"
        disabled={loading}
      >
        {loading ? (
          <>
            <Sun className="w-4 h-4 animate-spin mr-2" />
            Enviando...
          </>
        ) : (
          "Enviar Indicação"
        )}
      </Button>
    </form>
  );
}
