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
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WBZTN4ZV');
          `}
        </Script>

        {/* Google Analytics 4 (KEEP THIS – NOT DELETED) */}
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
        {/* GTM NoScript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WBZTN4ZV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <ClientWrapper />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}