"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, MessageCircle, Facebook, Twitter, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";

export function SalesLinkShare() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [salesLink, setSalesLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && typeof window !== 'undefined') {
      setSalesLink(`${window.location.origin}/forms?ref=${user.referral_code}`);
    }
  }, [user]);

  if (!mounted) {
    return (
      <Card className="p-6 bg-white shadow-none animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
        <div className="h-4 w-64 bg-gray-100 rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-10 bg-gray-100 rounded flex-1" />
          <div className="h-10 w-32 bg-gray-100 rounded" />
        </div>
      </Card>
    );
  }

  const handleCopy = async () => {
    try {
      setLoading(true);
      await navigator.clipboard.writeText(salesLink);
      setCopied(true);
      toast.success("Link copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar o link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-none mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Compartilhe seu link</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Compartilhe este link com seus clientes para que eles possam se cadastrar.
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              value={salesLink}
              readOnly
              className="bg-gray-50 font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="min-w-[120px]"
              disabled={loading}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Instale energia solar com a Resolve e ganhe descontos especiais! Clique no link para se cadastrar: ${salesLink}`)}`, '_blank')}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(salesLink)}`, '_blank')}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Instale energia solar com a Resolve e ganhe descontos especiais! Clique no link para se cadastrar: ${salesLink}`)}`, '_blank')}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}