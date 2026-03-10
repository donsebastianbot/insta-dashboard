import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InstaPilot Dashboard',
  description: 'Gestión de cuentas Instagram + planificación diaria con IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const noFlash = `
    (function(){
      try {
        var t = localStorage.getItem('instapilot_theme');
        var dark = t ? t === 'dark' : false;
        document.documentElement.classList.toggle('dark', dark);
      } catch(e) {}
    })();
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        {children}
      </body>
    </html>
  );
}
