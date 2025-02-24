import { Supabase } from "../supabase";
import bcrypt from "bcryptjs";

const formatCpf = (cpf: string) => cpf.replace(/\D/g, "");
const formatBirthDate = (birthDate: string) => new Date(birthDate).toISOString().split("T")[0];

export async function signUpWithCpfAndBirthDate({
  name,
  email,
  cpf,
  birthDate,
  password,
  isSuperAdmin = false,  
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
  isSuperAdmin?: boolean;  
}) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const { data: authData, error: authError } = await Supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Erro ao criar usuário no Auth");

    const { data: userData, error: userError } = await Supabase
      .from("users")
      .insert([
        {
          id: authData.user.id, 
          name,
          email,
          cpf: formattedCpf,
          is_super_admin: isSuperAdmin,  
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

    const { data: user, error } = await Supabase
      .from("users")
      .select("id, email, is_super_admin, password") 
      .eq("cpf", formattedCpf)
      .eq("birthdate", formattedBirthDate)
      .single();

    if (error || !user) throw new Error("CPF ou data de nascimento inválidos");

    const { error: authError } = await Supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password, 
    });

    if (authError) throw new Error(authError.message);

    if (user.is_super_admin) {
      console.log("O usuário é um super admin");
    } else {
      console.log("O usuário não é um super admin");
    }

    return user;
  } catch (error) {
    throw new Error(`Erro no login: ${error}`);
  }
}

export async function signOut() {
  try {
    const { error } = await Supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return null;
  } catch (error) {
    throw new Error(`Erro ao sair: ${error}`);
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await Supabase.auth.getUser();
    if (error || !user) throw new Error("Nenhum usuário logado");

    const { data: userData, error: userError } = await Supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) throw new Error("Erro ao buscar dados do usuário");

    if (userData.is_super_admin) {
      console.log("O usuário logado é super admin");
    }

    return { ...user, ...userData };
  } catch (error) {
    throw new Error(`Erro ao obter usuário: ${error}`);
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await Supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    throw new Error(`Erro ao redefinir senha: ${error}`);
  }
}

export async function updateProfile({
  email,
  password,
  name,
}: {
  email?: string;
  password?: string;
  name?: string;
}) {
  try {
    const updates: any = { email, data: {} };
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (name) updates.data.name = name;

    const { error } = await Supabase.auth.updateUser(updates);
    if (error) throw new Error(error.message);

    return true;
  } catch (error) {
    throw new Error(`Erro ao atualizar perfil: ${error}`);
  }
}
