// FILE: app/test-prep/dmat/page.tsx

import DMATClient from "./DMATClient";

export const metadata = {
  title: "dMAT Coaching 2026 – Digital Master Test for Germany | ANU Education",
  description:
    "dMAT (Digital Master Test) coaching for Germany-bound Engineering, Commerce & Business graduates. Core Module live classes, 2026 test dates (26 Sept), test centres, APS documentation guide. First India administration — free demo class.",
  keywords: [
    "dMAT coaching",
    "dMAT coaching India",
    "Digital Master Test Germany",
    "dMAT Core Module course",
    "dMAT test date 2026",
    "dMAT APS Germany",
    "dMAT exam preparation",
    "dMAT registration India",
    "dMAT test centres India",
    "Digital Master Admission Test coaching",
  ],
  openGraph: {
    title: "dMAT Coaching 2026 – Digital Master Test for Germany | ANU Education",
    description:
      "First dMAT administration in India: 26 September 2026. Live Core Module coaching, test date timeline, APS documentation guide. Free demo class.",
    url: "https://www.anuedu.in/test-prep/dmat",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/dmat",
  },
};

export default function DMATPage() {
  return <DMATClient />;
}