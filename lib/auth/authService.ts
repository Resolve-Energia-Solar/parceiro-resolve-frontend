import { Supabase } from "../supabase";
import bcrypt from "bcryptjs";

const formatCpf = (cpf: string) => {
  return cpf.replace(/\D/g, ""); 
};

const formatBirthDate = (birthDate: string) => {
  const date = new Date(birthDate);
  return date.toISOString().split("T")[0];
};

export async function signUpWithCpfAndBirthDate({
  name,
  email,
  cpf,
  birthDate,
  password,
}: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
}) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await Supabase
      .from("users")
      .insert([{ name, email, cpf: formattedCpf, birthDate: formattedBirthDate, password: hashedPassword }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error(`Erro no cadastro: ${error}`);
  }
}

export async function signInWithCpfAndBirthDate(cpf: string, birthDate: string) {
  try {
    const formattedCpf = formatCpf(cpf);
    const formattedBirthDate = formatBirthDate(birthDate);

    const { data, error } = await Supabase
      .from("users")
      .select("id, name, email, cpf, birthDate")
      .eq("cpf", formattedCpf)  
      .eq("birthDate", formattedBirthDate)  
      .single();

    if (error || !data) throw new Error("CPF ou data de nascimento inválidos");

    return data; 
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
    return user;
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
