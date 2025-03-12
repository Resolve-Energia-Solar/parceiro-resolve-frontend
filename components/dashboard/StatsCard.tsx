"use client";

import { useEffect, useState } from "react";
import { DivideIcon as LucideIcon } from "lucide-react";
import { Card } from "../../components/ui/card";
import { motion } from "framer-motion";
import { Tooltip } from "../../components/ui/Tooltip";

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
      <Card className="p-3 bg-white shadow-none animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="flex-1">
            <div className="h-5 w-12 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
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
      <Tooltip content={label}>
        <Card className="p-3 bg-white shadow-none hover:bg-gray-50 transition-colors cursor-help">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-50">
              <Icon className={`w-5 h-5 ${iconClassName}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{value}</h3>
              <p className="text-xs text-gray-500 truncate">{label}</p>
            </div>
          </div>
        </Card>
      </Tooltip>
    </motion.div>
  );
}
