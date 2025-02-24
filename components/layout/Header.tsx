"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        <div className="flex flex-wrap justify-between items-center py-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Image
                src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
                alt="Logo Resolve Energia Solar"
                width={200}
                height={54}
                priority
                className="h-12 w-auto"
              />
            </Link>
          </motion.div>

          {user && (
            <motion.div
              className="text-right flex flex-col items-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-lg font-medium text-white">Olá, {user.name}</h2>
              <p className="text-sm text-gray-400">Bem-vindo ao seu painel</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
