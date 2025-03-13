import { useState, useEffect } from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useForm, Controller } from "react-hook-form";
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
    telefoneFormatado: z.string().optional(),
    cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ReferralFormProps {
    onSuccess: () => void;
    referralCode: string;

}

const formatPhoneNumber = (value: string) => {
    if (!value) return "";
    
    const cleaned = value.replace(/\D/g, '');
    
    const limited = cleaned.slice(0, 11);
    
    if (limited.length <= 2) {
        return limited;
    } else if (limited.length <= 6) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
};

const formatCPF = (value: string) => {
    if (!value) return "";
    
    const cleaned = value.replace(/\D/g, '');
    
    const limited = cleaned.slice(0, 11);
    
    if (limited.length <= 3) {
        return limited;
    } else if (limited.length <= 6) {
        return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
        return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
        return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
    }
};

const unformatValue = (value: string) => {
    return value.replace(/\D/g, '');
};

export default function ReferralForm({ onSuccess }: ReferralFormProps) {
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            telefone: "",
            telefoneFormatado: "",
            cpf: ""
        }
    });

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                    
                setCurrentUser(userData);
            }
        };
        
        getUser();
    }, []);

    const telefoneFormatado = watch("telefoneFormatado");
    
    useEffect(() => {
        if (telefoneFormatado !== undefined) {
            setValue("telefone", unformatValue(telefoneFormatado));
        }
    }, [telefoneFormatado, setValue]);

    const onSubmit = async (data: FormData) => {
        if (!currentUser) {
            toast.error("Você precisa estar logado para criar indicações.");
            return;
        }

        setLoading(true);
        try {
            const { telefoneFormatado, ...submitData } = data;
            
            const { data: existingUser, error: existingUserError } = await supabase
                .from("users")
                .select("email")
                .eq("email", submitData.email)
                .single();

            if (existingUser) {
                toast.error("Este e-mail já está cadastrado.");
                return;
            }

            const now = new Date().toISOString();
            
            const { data: newUser, error: userError } = await supabase
                .from("users")
                .insert([{
                    ...submitData,
                    reference_id: currentUser.id, 
                    created_at: now,
                    updated_at: now,
                }])
                .select()
                .single();

            if (userError) {
                if (userError.code === '23505') {
                    toast.error("Este usuário já está cadastrado.");
                } else {
                    throw userError;
                }
                return;
            }

            const { data: referralData, error: referralError } = await supabase
                .from("referrals")
                .insert([{
                    referrer_id: currentUser.id, 
                    referred_user_id: newUser.id, 
                    status: 'Indicação', 
                    created_at: now,
                }])
                .select()
                .single();

            if (referralError) {
                throw referralError;
            }

            await supabase
                .from("users")
                .update({ 
                    referral_count: (currentUser.referral_count || 0) + 1 
                })
                .eq("id", currentUser.id);

            toast.success("Indicação realizada com sucesso!");
            reset();
            onSuccess();
        } catch (error: any) {
            console.error("Erro ao enviar indicação:", error);
            if (error.code === '23505') {
                toast.error("Este usuário já está cadastrado.");
            } else if (error.message) {
                toast.error(`Erro ao enviar indicação: ${error.message}`);
            } else {
                toast.error("Erro ao enviar indicação. Por favor, tente novamente.");
            }
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

            <Controller
                control={control}
                name="telefoneFormatado"
                render={({ field }) => (
                    <Input
                        {...field}
                        placeholder="Telefone com DDD"
                        className="bg-gray-800 border-yellow-500/20 text-white"
                        value={field.value || ""}
                        onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                        }}
                    />
                )}
            />
            <input type="hidden" {...register("telefone")} />
            {errors.telefone && <span className="text-red-500 text-sm">{errors.telefone.message}</span>}

            <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                    <Input
                        {...field}
                        placeholder="CPF"
                        className="bg-gray-800 border-yellow-500/20 text-white"
                        value={field.value || ""}
                        onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                            setValue("cpf", unformatValue(formatted));
                        }}
                    />
                )}
            />
            {errors.cpf && <span className="text-red-500 text-sm">{errors.cpf.message}</span>}

            <Button
                type="submit"
                className="w-full bg-yellow-500 text-black hover:bg-yellow-600 transition-all"
                disabled={loading || !currentUser}
            >
                {loading ? (
                    <>
                        <Sun className="w-4 h-4 animate-spin mr-2" />
                        Enviando...
                    </>
                ) : !currentUser ? (
                    "Faça login para enviar indicação"
                ) : (
                    "Enviar Indicação"
                )}
            </Button>
        </form>
    );
}
