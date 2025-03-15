import { useState, useEffect } from "react";
import { Sun, CheckCircle } from "lucide-react";
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
    telefone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter entre 10 e 11 dígitos"),
    telefoneFormatado: z.string().optional(),
    energy_bill: z.string().min(1, "Informe o valor da conta de energia"),
});

type FormData = z.infer<typeof formSchema>;

interface ReferralFormProps {
    onSuccess: (newReferral?: any) => void;
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

const unformatValue = (value: string) => {
    return value.replace(/\D/g, '');
};

export default function ReferralForm({ onSuccess }: ReferralFormProps) {
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [newReferralData, setNewReferralData] = useState<any>(null);

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
            energy_bill: ""
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
                setLoading(false);
                return;
            }

            const now = new Date().toISOString();
            
            const { data: newUser, error: userError } = await supabase
                .from("users")
                .insert([{
                    name: submitData.name,
                    email: submitData.email,
                    telefone: submitData.telefone,
                    energy_bill: `Valor da conta de energia: R$ ${submitData.energy_bill}`,
                    reference_id: currentUser.id, 
                    created_at: now,
                    updated_at: now,
                    user_type: "Cliente", 
                    referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    referral_count: 0,
                    total_referral_earnings: 0,
                    unit_id: currentUser.unit_id,
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
                    unit_id: currentUser.unit_id,
                }])
                .select()
                .single();

            if (referralError) {
                throw referralError;
            }

            const { data: userData } = await supabase
                .from("users")
                .select("referral_count")
                .eq("id", currentUser.id)
                .single();

            if (userData) {
                const newCount = (userData.referral_count || 0) + 1;
                
                await supabase
                    .from("users")
                    .update({ referral_count: newCount })
                    .eq("id", currentUser.id);
            }

            const newReferral = {
                id: referralData.id,
                name: newUser.name,
                date: now,
                status: 'Indicação',
                isNew: true 
            };
            
            setNewReferralData(newReferral);
            setSubmissionSuccess(true);
            
            toast.success("Indicação realizada com sucesso!");
            reset();
            
            setTimeout(() => {
                onSuccess(newReferral);
            }, 1500);
            
        } catch (error: any) {
            console.error("Erro ao enviar indicação:", error);
            if (error.code === '23505') {
                toast.error("Este usuário já está cadastrado.");
            } else if (error.message) {
                toast.error(`Erro ao enviar indicação: ${error.message}`);
            } else {
                toast.error("Erro ao enviar indicação. Por favor, tente novamente.");
            }
            setLoading(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-green-500/20 p-4 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Indicação Enviada!</h3>
                <p className="text-gray-400 mb-4">
                    {newReferralData?.name} foi indicado(a) com sucesso.
                </p>
                <p className="text-gray-500 text-sm">
                    Você será redirecionado em instantes...
                </p>
            </div>
        );
    }

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

            <Input
                {...register("energy_bill")}
                type="number"
                placeholder="Quanto paga de energia (R$)"
                className="bg-gray-800 border-yellow-500/20 text-white"
            />
            {errors.energy_bill && <span className="text-red-500 text-sm">{errors.energy_bill.message}</span>}

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
