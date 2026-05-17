// FILE: app/language/french/page.tsx
// Save this as the server component (metadata + renders client)

import FrenchClient from "./FrenchClient";

export const metadata = {
  title: "French Language Course Online India 2026 – TEF, TCF, A1 to B2 | ANU Education",
  description:
    "Best online French language classes in India. Learn French for Canada PR, study abroad, TEF & TCF exam prep. Levels A1, A2, B1, B2 · C1 certified trainers · Free demo class · Rolling batches. Join ANU Education.",
  keywords: [
    "French classes online India",
    "French language course India 2026",
    "French language classes",
    "learn French online India",
    "TEF coaching India",
    "TCF coaching India",
    "French for Canada PR",
    "French coaching Gujarat",
    "French classes A1 A2 B1 B2",
    "online French course",
  ],
  openGraph: {
    title: "French Language Course Online – TEF, TCF, A1–B2 | ANU Education",
    description:
      "Live online French classes · C1 certified trainers · TEF & TCF prep · Canada PR advantage · Free 5-day trial. Enrol at ANU Education.",
    url: "https://www.anuedu.in/language/french",
    type: "website",
  },
};

export default function FrenchPage() {
  return <FrenchClient />;
}
