"use client";

import { useState, useEffect } from "react";
import { getUser } from "../services/userService";

interface User {
  id: string;
  name: string;
  email?: string;
  referral_code: string;
  referral_count: number;
  is_admin: boolean;
  cpf?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  const loadUser = async () => {
    setLoading(true);
    setError(null); 
    try {
      const fetchedUser = await getUser();
      if (fetchedUser) {
        const { id, email, user_metadata } = fetchedUser;

        const {
          name = "Usuário",
          referral_code = "",
          referral_count = 0,
          is_admin = false,
          cpf,
        } = user_metadata || {};

        setUser({
          id,
          name,
          email,
          referral_code,
          referral_count,
          is_admin,
          cpf,
        });
      }
    } catch (err) {
      setError("Erro ao carregar o usuário. Tente novamente.");
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return { user, loading, error, refreshUser: loadUser };
}
