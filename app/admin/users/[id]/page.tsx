'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  telefone: string;
  cpf: string;
  birth_date: string;
  user_type: string;
  unit_id: string;
  is_resolve_customer: boolean;
  is_active: boolean;
  energy_bill?: string;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userType, setUserType] = useState('');
  const [unitId, setUnitId] = useState('');
  const [isResolveCustomer, setIsResolveCustomer] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [energyBill, setEnergyBill] = useState('');

  useEffect(() => {
    fetchUnits();
    fetchUserProfile(params.id);
  }, [params.id]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setUnits(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar unidades: ' + error.message);
      console.error('Erro ao carregar unidades:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setUserProfile(data);
      
      const formattedCpf = data.cpf ? formatCPF(data.cpf) : '';
      
      const formattedPhone = data.telefone ? formatPhone(data.telefone) : '';
      
      setName(data.name || '');
      setEmail(data.email || '');
      setTelefone(formattedPhone);
      setCpf(formattedCpf);
      setBirthDate(data.birthdate || '');
      setUserType(data.user_type || 'User');
      setUnitId(data.unit_id || '');
      setIsResolveCustomer(data.is_resolve_customer || false);
      setIsActive(data.is_active || false);
      setEnergyBill(data.energy_bill || '');
    } catch (error: any) {
      toast.error('Erro ao carregar perfil do usuário: ' + error.message);
      console.error('Erro ao carregar perfil do usuário:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
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

    if (!name || !email || !userType || !unitId || !cpf) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          name,
          telefone: telefone.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''),
          birthdate: birthDate,
          user_type: userType,
          unit_id: unitId,
          is_resolve_customer: isResolveCustomer,
          energy_bill: energyBill
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      toast.success('Usuário atualizado com sucesso!');
      router.push('/admin/users');
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário: ' + error.message);
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Editar Usuário</h1>
          
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1" htmlFor="name">
                      Nome <span className="text-red-500">*</span>
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
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-400">O email não pode ser alterado</p>
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
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                      maxLength={15}
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
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1" htmlFor="birthDate">
                      Data de Nascimento
                    </label>
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
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
                      <option value="Cliente">Cliente</option>
                      <option value="Vendedor">Vendedor</option>
                      <option value="SDR">SDR</option>
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
                  
                  <div>
                    <label className="block text-gray-300 mb-1" htmlFor="energyBill">
                      Valor da Fatura de Energia
                    </label>
                    <input
                      id="energyBill"
                      type="text"
                      value={energyBill}
                      onChange={(e) => setEnergyBill(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                      placeholder="Ex: 350.00"
                    />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center">
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
              </div>

              <div className="mt-8 flex justify-end">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span className="font-medium">Salvar Alterações</span>
                </motion.button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
