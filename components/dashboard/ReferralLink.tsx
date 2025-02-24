"use client";

import { useState, useEffect } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useUser } from "../../hooks/useUser";

export function ReferralLink() {
  const { user } = useUser();
  const [copying, setCopying] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/onboarding?ref=${user.referral_code}`);
    }
  }, [user]);

  const handleCopyReferralLink = async () => {
    if (!user || !mounted) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link copiado com sucesso!");
    } catch (err) {
      toast.error("Erro ao copiar o link");
    } finally {
      setCopying(false);
    }
  };

  if (!mounted) {
    return (
      <Card className="p-6 bg-white shadow-sm mb-8">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white shadow-sm mb-8">
      <h3 className="text-lg font-semibold mb-4">Divulgue seu link de vendas</h3>
      <p className="text-sm text-gray-500 mb-4">
        Aqui está seu link pessoal para os seus clientes
      </p>
      <div className="flex gap-4">
        <Input
          value={referralLink}
          readOnly
          className="bg-gray-50 font-mono"
        />
        <Button
          onClick={handleCopyReferralLink}
          disabled={copying || !referralLink}
          className="bg-primary text-black hover:bg-primary/90"
        >
          {copying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Copiar Link
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}