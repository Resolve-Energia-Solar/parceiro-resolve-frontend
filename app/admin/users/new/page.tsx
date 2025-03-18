'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { generateReferralCode } from '@/services/auth/authService';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userType, setUserType] = useState('User');
  const [unitId, setUnitId] = useState('');
  const [isResolveCustomer, setIsResolveCustomer] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setUnits(data || []);
      if (data && data.length > 0) {
        setUnitId(data[0].id);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar unidades: ' + error.message);
      console.error('Erro ao carregar unidades:', error);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .substring(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .substring(0, 14);
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .substring(0, 15);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !cpf || !birthDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      const { data: currentSession } = await supabase.auth.getSession();
      
      const formattedCpf = cpf.replace(/\D/g, "");
      const formattedBirthDate = formatDateForDB(birthDate);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: birthDate,
        options: {
          data: {
            name: name,
            cpf: formattedCpf,
            birthdate: formattedBirthDate,
            telefone: telefone.replace(/\D/g, ''),
          },
        }
      });
      
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Erro ao criar usuário na autenticação");

      const referralCode = generateReferralCode();

      const newUser = {
        id: authData.user.id,
        name,
        email,
        cpf: formattedCpf,
        birthdate: formattedBirthDate,
        telefone: telefone.replace(/\D/g, ''),
        referral_code: referralCode,
        referral_count: 0,
        total_referral_earnings: 0,
        user_type: userType,
        unit_id: unitId,
        is_resolve_customer: isResolveCustomer,
      };

      const { error: userError } = await supabase
        .from("users")
        .insert([newUser]);
      
      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(userError.message);
      }
      
      if (currentSession?.session) {
        await supabase.auth.setSession(currentSession.session);
      } else {
        await supabase.auth.signOut();
      }
      
      toast.success('Usuário criado com sucesso!');
      router.push('/admin/users');
    } catch (error: any) {
      toast.error('Erro ao criar usuário: ' + error.message);
      console.error('Erro ao criar usuário:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDateForDB = (date: string): string => {
    try {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Data inválida");
      }
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      throw error;
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Cadastrar Novo Usuário</h1>
          
          <Link href="/admin/users">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </motion.button>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="name">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="cpf">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    maxLength={14}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="telefone">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefone"
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="birthDate">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A data de nascimento será usada como senha inicial
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="userType">
                    Tipo de Usuário <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="userType"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    required
                  >
                    <option value="User">Usuário</option>
                    <option value="SDR">SDR</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Contratos">Contratos</option>
                    <option value="Admin">Admin</option>
                    <option value="Super admin">Super Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1" htmlFor="unit">
                    Unidade <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unit"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    required
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center mt-4">
                  <input
                    id="isResolveCustomer"
                    type="checkbox"
                    checked={isResolveCustomer}
                    onChange={(e) => setIsResolveCustomer(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="isResolveCustomer" className="ml-2 text-gray-300">
                    Cliente Resolve
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="font-medium">Salvar Usuário</span>
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
