import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InstaPilot Dashboard',
  description: 'Gestión de cuentas Instagram + planificación diaria con IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
