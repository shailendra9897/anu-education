"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem("cookie_consent");

    if (!consent) {
      setVisible(true);
    } else {
      updateConsent(consent === "accepted" ? "granted" : "denied");
    }
  }, []);

  const updateConsent = (status: "granted" | "denied") => {
    if (typeof window === "undefined") return;

    try {
      // ✅ Ensure dataLayer exists
      (window as any).dataLayer = (window as any).dataLayer || [];

      // ✅ Safe push
      (window as any).dataLayer.push({
        event: "consent_update",
        ad_storage: status,
        analytics_storage: status,
        ad_user_data: status,
        ad_personalization: status,
      });

      // ✅ Try gtag if available
      if ((window as any).gtag) {
        (window as any).gtag("consent", "update", {
          ad_storage: status,
          analytics_storage: status,
          ad_user_data: status,
          ad_personalization: status,
        });
      }
    } catch (err) {
      console.warn("Consent update error:", err);
    }
  };

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    updateConsent("granted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    updateConsent("denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
  <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50 shadow-lg">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

      {/* TEXT */}
      <p className="text-sm text-center md:text-left leading-relaxed">
        We use cookies to improve your experience and analyze traffic.
      </p>

      {/* BUTTONS */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={accept}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm whitespace-nowrap"
        >
          Accept
        </button>

        <button
          onClick={reject}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm whitespace-nowrap"
        >
          Reject
        </button>
      </div>

    </div>
  </div>
);
}