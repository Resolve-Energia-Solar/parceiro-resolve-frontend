'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useUser } from "../../hooks/useUser";
import { Bell, LogOut, User, ShieldCheck } from "lucide-react";
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

  const isAdminOrSDR = user && (user.user_type === 'Admin' || user.user_type === 'Super admin');

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
            {isAdminOrSDR && (
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

            {/* <div className="relative" ref={notificationsRef}>
              <Bell
                className="w-6 h-6 cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <h2 className="px-4 py-2 text-sm font-semibold text-gray-300 border-b border-gray-700">Notificações</h2>
                  <ul>
                    <li className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Nova indicação recebida</li>
                    <li className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Recompensa disponível</li>
                    <li className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Atualização do sistema</li>
                  </ul>
                </div>
              )}
            </div>
 */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="w-6 h-6 text-black" />
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <p className="px-4 py-2 text-sm text-gray-300">
                    Olá, {user ? user.name : 'Visitante'}
                  </p>
                  {isAdminOrSDR && (
                    <Link 
                      href="/admin" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <ShieldCheck className="w-4 h-4 inline mr-2" />
                      Painel Administrativo
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
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
