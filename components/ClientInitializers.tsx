"use client";

import { useEffect } from 'react';
import { initOneSignal } from '@/lib/oneSignal';

export default function ClientInitializers() {
  useEffect(() => {
    initOneSignal();
  }, []);

  return null;
}
