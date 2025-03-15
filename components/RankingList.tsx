'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Users, Award, UserCheck, Info } from "lucide-react";
import { useUser } from "@/hooks/useUser";


const getPositionIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />;
    default:
      return <Award className="w-6 h-6 md:w-8 md:h-8 text-primary" />;
  }
};


const mockClients = [
  { id: 'client-1', name: 'Maria Silva', referrals: 42, position: 1 },
  { id: 'client-2', name: 'João Oliveira', referrals: 38, position: 2 },
  { id: 'client-3', name: 'Ana Santos', referrals: 29, position: 3 },
  { id: 'client-4', name: 'Carlos Mendes', referrals: 23, position: 4 }
];


const mockPartners = [
  { id: 'partner-1', name: 'Giovanne Souza', referrals: 56, position: 1 },
  { id: 'partner-2', name: 'Luigi Profeti', referrals: 48, position: 2 },
  { id: 'partner-3', name: 'Erick Silva', referrals: 37, position: 3 },
  { id: 'partner-4', name: 'Andreina Santos', referrals: 29, position: 4 }
];


export function RankingList() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'partners'>('clients');


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (user?.is_resolve_customer) {
      setActiveTab('clients');
    } else {
      setActiveTab('partners');
    }
  }, [user]);


  const topParticipants = activeTab === 'clients' ? mockClients : mockPartners;
  
  const tabTitle = activeTab === 'clients' ? "Ranking de Clientes" : "Ranking de Parceiros";
  const subtitle = activeTab === 'clients' 
    ? "Os clientes com mais vendas convertidas"
    : "Os parceiros com mais vendas convertidas";


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Award className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }


  return (
    <div className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start md:items-center gap-3"
        >
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 md:mt-0" />
          <p className="text-sm text-blue-100">
            <span className="font-semibold">Aviso:</span> Este ranking é meramente ilustrativo, contendo dados fictícios para demonstração. Não representa dados reais de desempenho.
          </p>
        </motion.div>
        
        <div className="flex rounded-lg overflow-hidden mb-6 max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 px-4 font-medium text-sm flex items-center justify-center transition-all ${
              activeTab === 'clients' 
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex-1 py-2 px-4 font-medium text-sm flex items-center justify-center transition-all ${
              activeTab === 'partners' 
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Parceiros
          </button>
        </div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeTab} 
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-white">
            {tabTitle}
          </h2>
          <p className="text-base md:text-xl text-gray-400">
            {subtitle}
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">Dados meramente ilustrativos</p>
        </motion.div>


        <div className="mb-10 md:mb-20">
          <div className="hidden md:flex relative h-[300px] md:h-[400px] items-end justify-center gap-2 md:gap-4">
            {topParticipants.slice(0, 3).map((participant, index) => (
              <motion.div
                key={`${activeTab}-${participant.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: index === 1 ? "300px" : index === 0 ? "250px" : "200px",
                  opacity: 1
                }}
                transition={{ delay: index * 0.2, duration: 0.5, ease: "backOut" }}
                className="w-full max-w-[180px] md:max-w-[240px] relative"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-t ${
                    activeTab === 'clients' 
                      ? index === 0 
                        ? "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30"
                        : index === 1 
                          ? "from-gray-500/20 to-gray-600/20 border-gray-500/30"
                          : "from-amber-500/20 to-amber-600/20 border-amber-500/30"
                      : index === 0 
                        ? "from-blue-500/20 to-blue-600/20 border-blue-500/30" 
                        : index === 1 
                          ? "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30" 
                          : "from-purple-500/20 to-purple-600/20 border-purple-500/30"
                  } border rounded-t-lg backdrop-blur-sm`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2"
                  >
                    <div className="relative">
                      {index === 0 && (
                        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border ${
                          activeTab === 'clients' ? "border-yellow-400/50" : "border-blue-400/50"
                        }`}>
                          {getPositionIcon(participant.position)}
                        </div>
                      )}


                      {index > 0 && (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-gray-400/50">
                          {getPositionIcon(participant.position)}
                        </div>
                      )}


                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.2 }}
                        className={`absolute -top-2 -right-2 ${
                          activeTab === 'clients'
                            ? index === 0 
                              ? "bg-yellow-500 text-black" 
                              : index === 1 
                                ? "bg-gray-400 text-black" 
                                : "bg-amber-600 text-black"
                            : index === 0 
                              ? "bg-blue-500 text-white" 
                              : index === 1 
                                ? "bg-indigo-400 text-white" 
                                : "bg-purple-600 text-white"
                        } w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-base font-bold`}
                      >
                        {participant.position}
                      </motion.div>
                    </div>
                    <div className="mt-2 text-center">
                      <h3 className={`text-white font-bold text-sm md:text-base ${index === 0 ? 'md:text-xl' : ''}`}>
                        {participant.name.length > 12
                          ? `${participant.name.substring(0, 12)}...`
                          : participant.name}
                      </h3>
                      <p className={`text-xs md:text-sm ${
                        activeTab === 'clients'
                          ? index === 0 
                            ? "text-yellow-400 font-semibold" 
                            : index === 1 
                              ? "text-gray-400" 
                              : "text-amber-400"
                          : index === 0 
                            ? "text-blue-400 font-semibold" 
                            : index === 1 
                              ? "text-indigo-400" 
                              : "text-purple-400"
                      }`}>{participant.referrals} vendas convertidas</p>
                    </div>
                  </motion.div>
                </div>
                <div className={`absolute bottom-0 w-full text-center py-1 md:py-2 text-xs md:text-sm ${
                  activeTab === 'clients'
                    ? index === 0 
                      ? "bg-yellow-500/20 border-yellow-400/30" 
                      : index === 1 
                        ? "bg-gray-500/20 border-gray-400/30" 
                        : "bg-amber-500/20 border-amber-400/30"
                    : index === 0 
                      ? "bg-blue-500/20 border-blue-400/30" 
                      : index === 1 
                        ? "bg-indigo-500/20 border-indigo-400/30" 
                        : "bg-purple-500/20 border-purple-400/30"
                } backdrop-blur-sm rounded-t-lg border-t`}>
                  {participant.position}º Lugar
                </div>
              </motion.div>
            ))}
          </div>


          <div className="md:hidden space-y-3">
            {topParticipants.slice(0, 3).map((participant, index) => (
              <motion.div
                key={`${activeTab}-mobile-${participant.id}`}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                className={`relative overflow-hidden rounded-xl p-3 ${
                  activeTab === 'clients'
                    ? index === 0
                      ? "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-500/10 to-gray-500/5 border border-gray-500/20"
                        : "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20"
                    : index === 0
                      ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                      : index === 1
                        ? "bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20"
                        : "bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeTab === 'clients'
                        ? index === 0 
                          ? "bg-yellow-500/20 border border-yellow-400" 
                          : index === 1 
                            ? "bg-gray-500/20 border border-gray-400" 
                            : "bg-amber-500/20 border border-amber-400"
                        : index === 0 
                          ? "bg-blue-500/20 border border-blue-400" 
                          : index === 1 
                            ? "bg-indigo-500/20 border border-indigo-400" 
                            : "bg-purple-500/20 border border-purple-400"
                    }`}>
                      {getPositionIcon(participant.position)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {participant.name.length > 15
                          ? `${participant.name.substring(0, 15)}...`
                          : participant.name}
                      </h3>
                      <p className="text-xs text-gray-400">{participant.referrals} vendas convertidas</p>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${
                    activeTab === 'clients'
                      ? index === 0 
                        ? "text-yellow-400" 
                        : index === 1 
                          ? "text-gray-400" 
                          : "text-amber-400"
                      : index === 0 
                        ? "text-blue-400" 
                        : index === 1 
                          ? "text-indigo-400" 
                          : "text-purple-400"
                  }`}>
                    #{participant.position}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


          <h1 className="text-center my-4 md:my-10 text-white text-xs md:text-sm font-semibold">
            Os melhores em vendas convertidas 
            <span className="ml-1 text-gray-500 italic">(Ranking meramente ilustrativo)</span>
          </h1>
        </div>


        {topParticipants.length > 3 && (
          <motion.div
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            initial="initial"
            animate="animate"
            className="grid gap-4"
          >
            {topParticipants.slice(3, 4).map((participant, index) => (
              <motion.div
                key={`${activeTab}-fourth-${participant.id}`}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01, x: 5 }}
                className={`relative overflow-hidden rounded-xl p-3 md:p-6 bg-gradient-to-r ${
                  activeTab === 'clients'
                    ? "from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
                    : "from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: topParticipants[0]?.referrals
                      ? `${(participant.referrals / topParticipants[0].referrals) * 100}%`
                      : "0%"
                  }}
                  className="absolute inset-0 bg-white/5"
                  style={{ originX: 0 }}
                  transition={{ duration: 1 }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-6">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/50 backdrop-blur-sm"
                    >
                      {getPositionIcon(participant.position)}
                    </motion.div>
                    <div>
                      <h3 className="text-base md:text-2xl font-bold text-white">
                        {participant.name.length > 15 && typeof window !== 'undefined' && window.innerWidth < 768
                          ? `${participant.name.substring(0, 15)}...`
                          : participant.name}
                      </h3>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                        {activeTab === 'clients' ? (
                          <UserCheck className="w-3 h-3 md:w-4 md:h-4" />
                        ) : (
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                        <span>{participant.referrals} vendas convertidas</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-right"
                  >
                    <div className={`text-lg md:text-3xl font-bold ${
                      activeTab === 'clients' ? "text-yellow-400" : "text-blue-400"
                    }`}>
                      #{participant.position}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400">posição</div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-8 border-t border-gray-800 pt-4">
          <p className="text-center text-gray-500 text-xs">
            * Todos os participantes e dados de desempenho apresentados neste ranking são fictícios e meramente ilustrativos.
          </p>
        </div>
      </div>
    </div>
  );
}
