import './globals.css';
import { Footer } from '@/components/Footer';
import ClientWrapper from '@/components/ClientWrapper';
import Script from 'next/script';
import CookieConsent from '@/components/CookieConsent';

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
        {/* ✅ Consent Mode Default */}
        <Script
          id="consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;

              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
            `,
          }}
        />

        {/* ✅ GOOGLE TAG MANAGER */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WBZTN4ZV');
            `,
          }}
        />
      </head>

      <body className="bg-white text-gray-900">
        {/* ✅ GTM NOSCRIPT */}
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

        {/* ✅ Cookie Consent (CORRECT PLACE) */}
        <CookieConsent />
      </body>
    </html>
  );
}