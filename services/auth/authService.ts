import { supabase } from "@/lib/supabase";

const formatCpf = (cpf: string) => cpf.replace(/\D/g, "");
const formatBirthDate = (birthDate: string) => new Date(birthDate).toISOString().split("T")[0];

export async function signUpAsPartner({
  name,
  email,
  cpf,
  birthDate,
  telefone,
  unit,
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  unit: string;
  telefone: string;
  isSuperAdmin?: boolean;
}) {
  return signUp({
    name,
    email,
    cpf,
    birthDate,
    telefone,
    unit,
    userType: 'Parceiro'
  });
}

export async function signUpAsClient({
  name,
  email,
  cpf,
  birthDate,
  telefone,
  unit,
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  unit: string;
  telefone: string;
}) {
  return signUp({
    name,
    email,
    cpf,
    birthDate,
    telefone,
    unit,
    userType: 'Cliente',
    statusIndication: 'Lead'
  });
}

async function signUp({
  name,
  email,
  cpf,
  birthDate,
  telefone,
  unit,
  userType,
  statusIndication
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  telefone: string;
  unit: string;
  userType: 'Parceiro' | 'Cliente' | 'Admin';
  statusIndication?: 'Lead' | 'Negociação' | 'Venda';
}) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: birthDate,
      options: {
        data: {
          name: name,
          cpf: formattedCpf,
          birthdate: formattedBirthDate,
          telefone: telefone,
        },
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Erro ao criar usuário na autenticação");

    const referralCode = generateReferralCode();

    const newUser: {
      id: string;
      name: string;
      email: string;
      cpf: string;
      birthdate: string;
      telefone: string;
      referral_code: string;
      referral_count: number;
      total_referral_earnings: number;
      user_type: 'Parceiro' | 'Cliente' | 'Admin';
      unit_id: string;
      status_indication?: 'Lead' | 'Negociação' | 'Venda';
    } = {
      id: authData.user.id,
      name,
      email,
      cpf: formattedCpf,
      birthdate: formattedBirthDate,
      telefone,
      referral_code: referralCode,
      referral_count: 0,
      total_referral_earnings: 0,
      user_type: userType,
      unit_id: unit
    };

    if (statusIndication) {
      newUser['status_indication'] = statusIndication;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([newUser])
      .select()
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    await logUserActivity(authData.user.id, 'signup', 'New user registration');

    return { authUser: authData.user, userData };
  } catch (error) {
    throw new Error(`Erro no cadastro: ${error}`);
  }
}

export async function signInWithCpfAndBirthDate(cpf: string, birthDate: string) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    console.log('Tentando login com:', { cpf: formattedCpf, birthDate: formattedBirthDate });

    const { data: user, error } = await supabase
      .from("users")
      .select("email, id")
      .eq("cpf", formattedCpf)
      .eq("birthdate", formattedBirthDate)
      .single();

    if (error || !user) {
      console.error('Usuário não encontrado:', error);
      throw new Error("CPF ou data de nascimento inválidos");
    }

    console.log('Usuário encontrado:', user);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: birthDate,
    });

    if (signInError) {
      console.error('Erro de login:', signInError);
      throw new Error("Falha na autenticação. Verifique suas credenciais.");
    }

    if (!data.user) {
      throw new Error("Usuário não encontrado após autenticação");
    }

    console.log('Login bem-sucedido:', data.user);

    await logUserActivity(user.id, 'login', 'User logged in');

    return { ...data.user, ...user };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('user');
    
    sessionStorage.removeItem('sb-access-token');
    sessionStorage.removeItem('sb-refresh-token');
    sessionStorage.removeItem('user');
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    if (error) throw new Error(error.message);

    return null;
  } catch (error) {
    console.error('Erro ao sair:', error);
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

export async function resendConfirmationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Erro ao reenviar e-mail de confirmação:', error);
    throw error;
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

export async function getUnits() {
  const { data, error } = await supabase
    .from('units')
    .select('id, name');
  
  if (error) throw new Error('Erro ao buscar unidades');
  return data;
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
