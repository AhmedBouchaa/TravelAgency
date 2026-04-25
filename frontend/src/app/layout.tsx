import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Wanderly · Travel Agency',
  description: 'Book curated trips around the world.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
