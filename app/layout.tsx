import './globals.css';
import { Footer } from '@/components/Footer';
import ClientWrapper from '@/components/ClientWrapper'; // 👈 Wrapper for LeadModal & Header

export const metadata = {
  title: 'ANU Education – Study Abroad & Test Prep',
  description: 'Your trusted partner for studying abroad and test preparation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <ClientWrapper /> {/* Contains LeadModal + Header */}
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}