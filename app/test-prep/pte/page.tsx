import PTEClient from './PTEClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'), // 👈 Add this line
  title: "PTE Online Coaching in India | AI Mock Tests & 7‑Week Plan – ANU Education",
  description:
    "Join expert PTE online coaching with AI‑scored mock tests, live classes, and 7‑week study plan. Score 79+ with Pearson‑certified trainers. Free demo available.",
  keywords:
    "PTE coaching, PTE online classes, PTE mock tests, PTE preparation, best PTE coaching India",
  openGraph: {
    title: "PTE Online Coaching – AI Mock Tests & 7‑Week Plan | ANU Education",
    description:
      "Crack PTE in your first attempt with live classes, AI‑scored tests, and proven strategies. Enroll now for ₹7,999.",
    url: "https://www.anuedu.in/test-prep/pte",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/pte-coaching.jpg",
        width: 1200,
        height: 630,
        alt: "PTE Online Coaching",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PTE Online Coaching – Score 79+ with AI Mock Tests",
    description: "7‑week plan, live classes, expert mentors. Free demo available.",
    images: ["/images/pte-coaching.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte",
  },
};

export default function Page() {
  return <PTEClient />;
}