'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useUser } from "../../hooks/useUser";
import { LogOut, User, ShieldCheck, Users, Settings } from "lucide-react";
import { signOut } from "../../services/auth/authService";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/onboarding');
  };

  const isAdmin = user && user.user_type === 'Admin';
  const isContract = user && user.user_type === 'Contratos';
  const isSuperAdmin = user && user.user_type === 'Super admin';
  const isSuperSDR = user && user.user_type === 'SDR';
  const isAdminOrSuperAdmin = isAdmin || isSuperAdmin || isContract || isSuperSDR;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-black text-white border-b border-white/10",
        className
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Image
                src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
                alt="Resolve Logo"
                width={80}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </motion.div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {isAdminOrSuperAdmin && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/admin"
                  className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-3 py-2 rounded-full hover:bg-indigo-600/30 transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">Painel</span>
                </Link>
              </motion.div>
            )}

            {isSuperAdmin && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-2 rounded-full hover:bg-purple-600/30 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Usuários</span>
                </Link>
              </motion.div>
            )}

            <div className="relative" ref={dropdownRef}>
              <div
                className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="w-6 h-6 text-black" />
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <p className="px-4 py-2 text-sm text-gray-300">
                    Olá, {user ? user.name : 'Visitante'}
                  </p>
                  <p className="px-4 py-1 text-xs text-gray-500">
                    {user?.user_type || 'Convidado'}
                  </p>

                  <div className="border-t border-gray-700 my-2"></div>

                  {isAdminOrSuperAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <ShieldCheck className="w-4 h-4 inline mr-2" />
                      Painel Administrativo
                    </Link>
                  )}
                  {isAdminOrSuperAdmin && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <ShieldCheck className="w-4 h-4 inline mr-2" />
                      Painel de indicação
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <>
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Gerenciar Usuários
                      </Link>
                      <Link
                        href="/admin/users/new"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Cadastrar Novo Usuário
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Configurações do Sistema
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-700 my-2"></div>

                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
