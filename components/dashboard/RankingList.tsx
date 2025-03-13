'use client';

import { useRanking } from "@/hooks/useRanking";
import { useUser } from "@/hooks/useUser";
import { motion } from "framer-motion";
import { Trophy, Medal, Sun } from "lucide-react";
import { useState } from "react";

const iphoneVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      yoyo: Infinity,
      repeatDelay: 1
    }
  }
};

const highlightVariants = {
  initial: { backgroundColor: "rgba(234, 179, 8, 0.3)" },
  animate: { 
    backgroundColor: ["rgba(234, 179, 8, 0.3)", "rgba(234, 179, 8, 0.7)", "rgba(234, 179, 8, 0.3)"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};

export function RankingList() {
  const { user } = useUser();
  const { ranking, loading, error } = useRanking();
  const [showAllUsers, setShowAllUsers] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Erro: {error}</div>;
  }

  const userRank = ranking.findIndex(rankUser => rankUser.id === user?.id) + 1;
  const displayedRanking = showAllUsers ? ranking : ranking.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-black rounded-lg shadow-xl"
    >
      <h2 className="text-3xl font-bold mb-8 text-yellow-400 text-center">Ranking de vendas convertidas</h2>
      {userRank > 0 && (
        <motion.div
          variants={highlightVariants}
          initial="initial"
          animate="animate"
          className="mb-4 p-3 rounded-lg text-center font-bold text-yellow-400"
        >
          Sua posição atual: {userRank}º lugar
        </motion.div>
      )}
      <div className="space-y-4">
        {displayedRanking.map((rankUser, index) => (
          <motion.div
            key={rankUser.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg shadow-md ${
              rankUser.id === user?.id
                ? "bg-yellow-400 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg 
                  ${index === 0 ? "bg-yellow-400 text-black" : 
                    index === 1 ? "bg-gray-300 text-black" : 
                    index === 2 ? "bg-yellow-600 text-white" : "bg-gray-600 text-white"}`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{rankUser.name}</p>
                  <p className="text-sm opacity-75">
                    {rankUser.approved_referrals} vendas convertidas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {index < 3 && (
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index === 0 && <Trophy className="w-8 h-8 text-yellow-400" />}
                    {index === 1 && <Medal className="w-8 h-8 text-gray-300" />}
                    {index === 2 && <Medal className="w-8 h-8 text-yellow-600" />}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {!showAllUsers && ranking.length > 10 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAllUsers(true)}
          className="mt-8 w-full py-3 bg-yellow-400 text-black font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-colors duration-300"
        >
          Ver todos os usuários
        </motion.button>
      )}
    </motion.div>
  );
}
