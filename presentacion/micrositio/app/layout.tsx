import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fe + Datos | Micrositio',
  description: 'Micrositio narrativo para presentación en escenario y lectura móvil.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
