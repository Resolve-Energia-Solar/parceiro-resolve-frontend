"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { signUpAsClient } from "@/services/auth/authService";
import { toast } from "react-toastify";

export function AddIndicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    telefone: '',
    unit: '' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cpf || !formData.birthDate || !formData.telefone || !formData.unit) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    try {
      const result = await signUpAsClient({
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        telefone: formData.telefone,
        unit: formData.unit
      });

      console.log(result);

      toast.success("Indicação cadastrada com sucesso!");
      setIsOpen(false);
      
      setFormData({
        name: '',
        email: '',
        cpf: '',
        birthDate: '',
        telefone: '',
        unit: ''
      });
    } catch (error: any) {
      console.log(error);
      toast.error(`Erro ao cadastrar indicação: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar Indicação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Indicação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Nome Completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
          <Input
            name="birthDate"
            type="date"
            placeholder="Data de Nascimento"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
          <Input
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
          />
          <Input
            name="unit"
            placeholder="Unidade"
            value={formData.unit}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full">
            Cadastrar Indicação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
