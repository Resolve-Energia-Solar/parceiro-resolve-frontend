"use client";

import { useEffect, useRef } from 'react';
import { initOneSignal } from '@/lib/oneSignal';

export default function ClientInitializers() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      const initialize = async () => {
        try {
          await initOneSignal();
        } catch (error) {
          console.error("Erro ao inicializar OneSignal no ClientInitializers:", error);
        }
      };
      
      initialize();
    }
    
    
  }, []);

  return null; 
}
