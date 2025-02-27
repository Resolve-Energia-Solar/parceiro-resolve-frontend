"use client";

import { AdminReferralList } from "@/components/admin/AdminReferralList";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.is_admin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <AdminReferralList />
      </div>
    </div>
  );
}