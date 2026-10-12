import { AuthProvider } from '@/lib/auth';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Confia Financeiro',
  description: 'Gestão financeira simples e eficiente',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body className='min-h-screen bg-gray-50'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
