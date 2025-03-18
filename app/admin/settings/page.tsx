'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../lib/supabase';
import { Settings, Save, Database, Shield, Megaphone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface SystemSettings {
  id: string;
  site_name: string;
  contact_email: string;
  notification_email: string;
  allow_user_registration: boolean;
  maintenance_mode: boolean;
  approval_required: boolean;
}

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [siteName, setSiteName] = useState('Resolve');
  const [contactEmail, setContactEmail] = useState('contato@resolve.com.br');
  const [notificationEmail, setNotificationEmail] = useState('notificacoes@resolve.com.br');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(true);

  useEffect(() => {
    setMounted(true);

    if (user && user.user_type !== 'Super admin') {
      router.push('/admin');
      return;
    }

    fetchSettings();
  }, [user, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', '1')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          await initializeSettings();
        } else {
          throw error;
        }
      } else if (data) {
        setSiteName(data.site_name || 'Resolve');
        setContactEmail(data.contact_email || 'contato@resolve.com.br');
        setNotificationEmail(data.notification_email || 'notificacoes@resolve.com.br');
        setAllowRegistration(data.allow_user_registration);
        setMaintenanceMode(data.maintenance_mode);
        setApprovalRequired(data.approval_required);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar configurações: ' + error.message);
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .insert({
          id: '1',
          site_name: 'Resolve',
          contact_email: 'contato@resolve.com.br',
          notification_email: 'notificacoes@resolve.com.br',
          allow_user_registration: true,
          maintenance_mode: false,
          approval_required: true,
        });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Erro ao inicializar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName || !contactEmail || !notificationEmail) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('settings')
        .update({
          site_name: siteName,
          contact_email: contactEmail,
          notification_email: notificationEmail,
          allow_user_registration: allowRegistration,
          maintenance_mode: maintenanceMode,
          approval_required: approvalRequired,
        })
        .eq('id', '1');
      
      if (error) throw error;
      
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar configurações: ' + error.message);
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        <Settings className="mr-2 h-8 w-8" />
        Configurações do Sistema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Configurações Gerais */}
                  <div className="border-b border-gray-700 pb-5">
                    <h2 className="text-lg font-semibold text-white flex items-center mb-4">
                      <Database className="mr-2 h-5 w-5" />
                      Configurações Gerais
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-1" htmlFor="siteName">
                          Nome do Site <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="siteName"
                          type="text"
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-5">
                    <h2 className="text-lg font-semibold text-white flex items-center mb-4">
                      <Mail className="mr-2 h-5 w-5" />
                      Configurações de Email
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-1" htmlFor="contactEmail">
                          Email de Contato <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactEmail"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-1" htmlFor="notificationEmail">
                          Email para Notificações <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="notificationEmail"
                          type="email"
                          value={notificationEmail}
                          onChange={(e) => setNotificationEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-400">Este email receberá notificações do sistema</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-5">
                    <h2 className="text-lg font-semibold text-white flex items-center mb-4">
                      <Shield className="mr-2 h-5 w-5" />
                      Segurança
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="allowRegistration"
                          type="checkbox"
                          checked={allowRegistration}
                          onChange={(e) => setAllowRegistration(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                        <label htmlFor="allowRegistration" className="ml-2 text-gray-300">
                          Permitir registro de novos usuários
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="approvalRequired"
                          type="checkbox"
                          checked={approvalRequired}
                          onChange={(e) => setApprovalRequired(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                        <label htmlFor="approvalRequired" className="ml-2 text-gray-300">
                          Exigir aprovação para novas indicações
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center mb-4">
                      <Megaphone className="mr-2 h-5 w-5" />
                      Manutenção
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="maintenanceMode"
                          type="checkbox"
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                        <label htmlFor="maintenanceMode" className="ml-2 text-gray-300">
                          Ativar modo de manutenção
                        </label>
                      </div>
                      
                      {maintenanceMode && (
                        <div className="px-4 py-3 bg-yellow-900/30 border border-yellow-800 rounded-md">
                          <p className="text-yellow-200 text-sm">
                            <strong>Atenção:</strong> Ao ativar o modo de manutenção, apenas administradores poderão acessar o sistema.
                          </p>
                        </div>
                      )}
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
                    <span className="font-medium">Salvar Configurações</span>
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-800 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Versão do Sistema</p>
                <p className="text-white">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Última Atualização</p>
                <p className="text-white">18/03/2025</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Ambiente</p>
                <p className="text-white">Produção</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
