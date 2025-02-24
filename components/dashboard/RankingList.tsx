import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useUser } from "../../hooks/useUser";
import { useEffect, useState } from "react";
import { Supabase } from "../../lib/supabase";

interface RankingUser {
  id: string;
  name: string;
  referral_count: number;
}

export function RankingList() {
  const { user } = useUser();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await Supabase
          .from("users")
          .select("id, name, referral_count")
          .order("referral_count", { ascending: false });

        if (error) throw error;
        setRankings(data);
      } catch (error) {
        console.error("Erro ao buscar rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        Carregando ranking...
      </div>
    );
  }

  return (
    <Card className="p-6 bg-gray-900 shadow-md rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-6">Acompanhe sua posição no ranking</h3>
      <div className="space-y-4">
        {rankings.map((rankUser, index) => {
          const isLoggedUser = rankUser.id === user?.id;

          return (
            <motion.div
              key={rankUser.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border border-gray-700 ${
                isLoggedUser
                  ? "bg-primary/20 border-primary scale-105 shadow-lg"
                  : "bg-gray-800"
              } ${index < 3 ? "scale-105 shadow-lg" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-yellow-500 text-gray-900"
                        : index === 1
                        ? "bg-gray-300 text-gray-900"
                        : index === 2
                        ? "bg-amber-400 text-gray-900"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{rankUser.name}</p>
                    <p className="text-sm text-gray-400">
                      {rankUser.referral_count} indicações
                    </p>
                    {isLoggedUser && (
                      <p className="text-sm text-yellow-400 mt-2">Você está em {index + 1}º lugar!</p>
                    )}
                  </div>
                </div>
                {index < 3 && (
                  <div className="flex items-center gap-2">
                    {getPositionIcon(index + 1)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
