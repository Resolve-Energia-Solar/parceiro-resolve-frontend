"use client";

import { Header } from "@/components/layout/Header";
import { Suspense } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="container mx-auto p-4">Carregando...</div>}>
          {children}
        </Suspense>
      </main>
      
      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Resolve Solar. Todos os direitos reservados.
        </div>
      </footer>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
