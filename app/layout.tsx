import './globals.css';
import { Footer } from '@/components/Footer';
import ClientWrapper from '@/components/ClientWrapper'; // 👈 Wrapper for LeadModal & Header

export const metadata = {
  title: "Study Abroad & IELTS Coaching | Germany, UK, Canada – ANU Education",
  description:
    "Book free demo classes for IELTS & German language. Expert counselling for Study in Germany, UK, Canada & Europe. Start your international education journey with ANU Education.",
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