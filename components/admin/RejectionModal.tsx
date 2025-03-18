'use client';

import { useState, SetStateAction } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectionModal = ({ isOpen, onClose, onConfirm }: RejectionModalProps) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Motivo da Rejeição</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">
            Por favor, informe o motivo da rejeição desta indicação:
          </p>
          <Textarea
            value={reason}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setReason(e.target.value)}
            placeholder="Descreva o motivo da rejeição..."
            className="w-full bg-gray-700 border-gray-600 text-white"
            rows={4}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
                setReason('');
              } else {
                toast.error("Por favor, informe o motivo da rejeição");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};
