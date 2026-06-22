// FILE: app/services/visa-assistance/page.tsx

import VisaAssistanceClient from "./VisaAssistanceClient";

export const metadata = {
  title: "Student Visa Assistance 2026 – Documentation, Mock Interview & Embassy Support | ANU Education",
  description:
    "Expert student visa assistance for Canada, UK, USA, Australia, Germany, France, Dubai, Ireland & New Zealand. Document checklist, SOP review, mock visa interviews, embassy tracking. Skill India certified counsellors. Free consultation.",
  keywords: [
    "student visa assistance",
    "visa assistance Gujarat",
    "study visa consultant India",
    "visa interview preparation",
    "student visa documentation",
    "visa rejection reasons",
    "Canada student visa assistance",
    "UK student visa help",
    "visa assistance Modasa",
    "study abroad visa consultant",
  ],
  openGraph: {
    title: "Student Visa Assistance – Documentation, Mock Interview & Embassy Tracking | ANU Education",
    description:
      "Complete visa support: document review, SOP help, mock interviews, embassy updates. 98% visa success rate. Skill India certified. Free consultation.",
    url: "https://www.anuedu.in/services/visa-assistance",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/services/visa-assistance",
  },
};

export default function VisaAssistancePage() {
  return <VisaAssistanceClient />;
}