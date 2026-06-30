// FILE: app/test-prep/ielts-coaching-ahmedabad/page.tsx

import IELTSAhmedabadClient from "./IELTSAhmedabadClient";

export const metadata = {
  title: "Best IELTS Coaching in Ahmedabad (Free 4-Day Demo) | ANU Education",
  description:
    "Best online IELTS coaching in Ahmedabad. Live classes, daily speaking practice, AI mock tests, free 4-day demo. Students from Satellite, Maninagar, Navrangpura, Bopal, Gota & all Ahmedabad areas. Band 7+ training. Skill India certified.",
  keywords: [
    "IELTS coaching Ahmedabad",
    "best IELTS classes Ahmedabad",
    "online IELTS preparation Ahmedabad",
    "IELTS mock tests Ahmedabad",
    "IELTS coaching Satellite Ahmedabad",
    "IELTS coaching Maninagar",
    "IELTS coaching Navrangpura",
    "IELTS coaching Bopal",
    "IELTS Canada PR Ahmedabad",
    "IELTS coaching for nurses Ahmedabad",
  ],
  openGraph: {
    title: "Best IELTS Coaching in Ahmedabad – Online Classes with Free 4-Day Demo",
    description:
      "Expert online IELTS training for Ahmedabad students. Live classes, speaking practice, AI mock tests, free 4-day demo. Achieve Band 7+.",
    url: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
    type: "website",
    images: [{ url: "https://www.anuedu.in/images/ielts-ahmedabad.jpg", width: 1200, height: 630, alt: "IELTS Coaching in Ahmedabad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coaching in Ahmedabad – Free 4-Day Demo",
    description: "Live online IELTS classes, speaking practice, AI mock tests. Free demo. Enroll now.",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
  },
};

export default function IELTSAhmedabadPage() {
  return <IELTSAhmedabadClient />;
}