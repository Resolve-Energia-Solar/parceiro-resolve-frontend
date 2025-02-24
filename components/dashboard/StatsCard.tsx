"use client";

import { useEffect, useState } from "react";
import { DivideIcon as LucideIcon } from "lucide-react";
import { Card } from "../../components/ui/card";
import { motion } from "framer-motion";

interface StatsCardProps {
  icon: typeof LucideIcon;
  value: number | string;
  label: string;
  iconClassName?: string;
}

export function StatsCard({ icon: Icon, value, label, iconClassName }: StatsCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="p-6 bg-white shadow-none animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg" />
          <div>
            <div className="h-7 w-16 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white shadow-none hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <Icon className={`w-6 h-6 ${iconClassName}`} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}