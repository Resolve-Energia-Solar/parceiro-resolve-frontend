import { supabase } from "@/lib/supabase";

const formatCpf = (cpf: string) => cpf.replace(/\D/g, "");

const formatBirthDate = (birthDate: string) => {
  try {
    if (birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
        throw new Error("Data inválida");
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } 
    else {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida");
      }
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    throw new Error("Formato de data inválido");
  }
};

const formatBirthDateForDB = (birthDate: string): string => {
  if (birthDate.includes('/')) {
    const [day, month, year] = birthDate.split('/');
    return `${year}-${month}-${day}`;
  }
  try {
    const date = new Date(birthDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
  }
  
  return birthDate;
};

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
    
    let formattedBirthDate = formatBirthDateForDB(birthDate);
    
    console.log('Tentando login com:', { cpf: formattedCpf, birthDate: formattedBirthDate });

    const { data: user, error } = await supabase
      .from("users")
      .select("email, id, birthdate")
      .eq("cpf", formattedCpf)
      .single();

    if (error || !user) {
      console.error('Usuário não encontrado:', error);
      throw new Error("CPF inválido ou usuário não encontrado");
    }

    console.log('Usuário encontrado:', user);

    const inputDate = new Date(birthDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    const dbDate = new Date(user.birthdate);
    
    if (inputDate.getTime() !== dbDate.getTime()) {
      console.error('Data de nascimento não corresponde:', {
        input: inputDate,
        db: dbDate
      });
      throw new Error("Data de nascimento incorreta");
    }

    console.log('Tentando autenticar com email:', user.email);

    const possiblePasswords = [
      birthDate,                                           
      user.birthdate,                                       
      inputDate.toISOString().split('T')[0],               
      `${inputDate.getDate()}/${inputDate.getMonth()+1}/${inputDate.getFullYear()}`, 
      `${inputDate.getDate().toString().padStart(2, '0')}/${(inputDate.getMonth()+1).toString().padStart(2, '0')}/${inputDate.getFullYear()}`, // DD/MM/YYYY padded
    ];
    
    let authData;
    let lastError;
    
    for (const password of possiblePasswords) {
      try {
        console.log(`Tentando senha: ${password}`);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: password,
        });
        
        if (!signInError && data.user) {
          authData = data;
          break; 
        }
        
        lastError = signInError;
      } catch (e) {
        lastError = e;
      }
    }
    
    if (!authData) {
      console.error('Todos os formatos de senha falharam:', lastError);
      
      const { error: updateError } = await supabase.auth.updateUser({
        email: user.email,
        password: user.birthdate
      });
      
      if (updateError) {
        console.error('Erro ao redefinir senha:', updateError);
        throw new Error("Falha na autenticação. Entre em contato com o suporte.");
      }
      const { data: newData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.birthdate,
      });
      
      if (newSignInError) {
        throw new Error("Falha na autenticação após redefinir senha. Verifique suas credenciais.");
      }
      
      authData = newData;
    }

    console.log('Login bem-sucedido:', authData.user);

    await logUserActivity(user.id, 'login', 'User logged in');

    return { ...authData.user, ...user };
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
    const { error: checkError } = await supabase
      .from('users_log')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.warn('Tabela users_log não existe. Ignorando o registro de atividade.');
      return;
    }
    
    const { error } = await supabase
      .from('users_log')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.warn(`Aviso: Não foi possível registrar atividade do usuário: ${error.message}`);
    }
  } catch (error) {
    console.warn(`Aviso: Erro ao registrar atividade do usuário: ${error}`);
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
