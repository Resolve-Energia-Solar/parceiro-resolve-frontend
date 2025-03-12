import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientInitializers from '../components/ClientInitializers'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resolve Energia Solar - Promoção iPhone 15',
  description: 'Participe da promoção e concorra a um iPhone 15. Indique seus amigos e aumente suas chances!',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientInitializers />
        {children}
      </body>
    </html>
  )
}
