import type { Metadata } from 'next';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: 'Resolve Energia Solar - Autenticação',
  description: 'Sistema de autenticação para parceiros e clientes da Resolve Energia Solar',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
      <ToastContainer />
    </div>
  );
}
