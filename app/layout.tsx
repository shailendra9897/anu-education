import './globals.css';
import { Footer } from '@/components/Footer';
import ClientWrapper from '@/components/ClientWrapper';
import Script from 'next/script';

export const metadata = {
  title: "Study Abroad & IELTS Coaching | Germany, UK, Canada – ANU Education",
  description:
    "Book free demo classes for IELTS & German language. Expert counselling for Study in Germany, UK, Canada & Europe. Start your international education journey with ANU Education.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YQWGP9339T"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YQWGP9339T', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body className="bg-white text-gray-900">
        <ClientWrapper /> {/* Contains LeadModal + Header */}
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}