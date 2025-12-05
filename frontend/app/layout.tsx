import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const interMain = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Data Analytics Dashboard',
  description:
    'A powerful dashboard for data analytics built with Next.js, Spring Boot and PostgreSQL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-dvh w-dvw'>
      <body
        className={`${interMain.className} h-full w-full antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
