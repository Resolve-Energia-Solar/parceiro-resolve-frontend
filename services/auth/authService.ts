import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

const formatCpf = (cpf: string) => cpf.replace(/\D/g, "");
const formatBirthDate = (birthDate: string) => new Date(birthDate).toISOString().split("T")[0];

export async function signUpWithCpfAndBirthDate({
  name,
  email,
  cpf,
  birthDate,
  password,
  telefone,
  isSuperAdmin = false,
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
  telefone: string;
  isSuperAdmin?: boolean;
}) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Erro ao criar usuário na autenticação");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          cpf: formattedCpf,
          birthdate: formattedBirthDate,
          telefone,
          is_super_admin: isSuperAdmin,
          sharing_code: uuidv4(),
          referral_code: generateReferralCode(),
          referral_count: 0,
          total_referral_earnings: 0,
        },
      ])
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    return { authUser: authData.user, userData };
  } catch (error) {
    throw new Error(`Erro no cadastro: ${error}`);
  }
}



export async function signInWithCpfAndBirthDate(cpf: string, birthDate: string) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("cpf", formattedCpf)
      .eq("birthdate", formattedBirthDate)
      .single();

    if (error || !user) throw new Error("CPF ou data de nascimento inválidos");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (authError) throw new Error(authError.message);

    await logUserActivity(user.id, 'login', 'User logged in');

    return user;
  } catch (error) {
    throw new Error(`Erro no login: ${error}`);
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return null;
  } catch (error) {
    throw new Error(`Erro ao sair: ${error}`);
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Nenhum usuário logado");

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) throw new Error("Erro ao buscar dados do usuário");

    return { ...user, ...userData };
  } catch (error) {
    throw new Error(`Erro ao obter usuário: ${error}`);
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    throw new Error(`Erro ao redefinir senha: ${error}`);
  }
}

export async function updateProfile(userId: string, updates: Partial<{
  email: string;
  password: string;
  name: string;
  telefone: string;
}>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logUserActivity(userId, 'profile_update', 'User updated profile');

    return data;
  } catch (error) {
    throw new Error(`Erro ao atualizar perfil: ${error}`);
  }
}

async function createReferral(referrerId: string, referredUserId: string) {
  try {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        status: 'pending'
      });

    if (error) throw new Error(error.message);

    await updateReferralCount(referrerId);
  } catch (error) {
    throw new Error(`Erro ao criar referência: ${error}`);
  }
}

async function updateReferralCount(userId: string) {
  try {
    const { error } = await supabase.rpc('increment_referral_count', { user_id: userId });
    if (error) throw new Error(error.message);
  } catch (error) {
    throw new Error(`Erro ao atualizar contagem de referências: ${error}`);
  }
}

async function logUserActivity(userId: string, action: string, details: string) {
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error(`Erro ao registrar atividade do usuário: ${error}`);
  }
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function processReferralReward(referrerId: string) {
  try {
    const { error } = await supabase
      .from('rewards')
      .insert({
        user_id: referrerId,
        reward_type: 'referral',
        status: 'pending'
      });

    if (error) throw new Error(error.message);

    await logUserActivity(referrerId, 'reward_created', 'Referral reward created');
  } catch (error) {
    throw new Error(`Erro ao processar recompensa de referência: ${error}`);
  }
}
