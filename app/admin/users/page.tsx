'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import {
    UserPlus, Edit, Trash2, Search,
    ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface User {
    id: string;
    email: string;
    name: string;
    telefone: string;
    user_type: string;
    is_active: boolean;
    created_at: string;
}

export default function UsersPage() {
    const { user } = useUser();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setMounted(true);

        if (user && user.user_type !== 'Super admin') {
            router.push('/admin');
            return;
        }

        fetchUsers();
    }, [user, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order(sortField, { ascending: sortOrder === 'asc' });

            if (error) throw error;

            setUsers(data || []);
        } catch (error: any) {
            toast.error('Erro ao carregar usuários: ' + error.message);
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                const { error } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', userId);

                if (error) throw error;

                toast.success('Usuário excluído com sucesso!');
                fetchUsers();
            } catch (error: any) {
                toast.error('Erro ao excluir usuário: ' + error.message);
                console.error('Erro ao excluir usuário:', error);
            }
        }
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_active: !isActive })
                .eq('id', userId);

            if (error) throw error;

            toast.success(`Usuário ${!isActive ? 'ativado' : 'desativado'} com sucesso!`);
            fetchUsers();
        } catch (error: any) {
            toast.error('Erro ao alterar status do usuário: ' + error.message);
            console.error('Erro ao alterar status do usuário:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!mounted) return null;

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>

                    <Link href="/admin/users/new">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span className="font-medium">Novo Usuário</span>
                        </motion.button>
                    </Link>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-30"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                <span>Nome</span>
                                                <ArrowUpDown className="ml-1 h-4 w-4" />
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center">
                                                <span>Email</span>
                                                <ArrowUpDown className="ml-1 h-4 w-4" />
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('user_type')}
                                        >
                                            <div className="flex items-center">
                                                <span>Tipo</span>
                                                <ArrowUpDown className="ml-1 h-4 w-4" />
                                            </div>
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-750">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.user_type === 'Super admin' ? 'bg-purple-900 text-purple-200' :
                                                        user.user_type === 'Admin' ? 'bg-indigo-900 text-indigo-200' :
                                                            'bg-blue-900 text-blue-200'}`
                                                }>
                                                    {user.user_type}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/users/${user.id}`}
                                                        className="p-1 rounded-md text-blue-400 hover:bg-blue-900/20"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1 rounded-md text-red-400 hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-lg">Nenhum usuário encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
