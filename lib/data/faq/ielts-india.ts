// FILE: lib/data/faq/ielts-india.ts
//
// FAQ data for the India-wide IELTS overview page.
// Single source of truth — consumed by the server-rendered FAQPage JSON-LD
// (page.tsx) and the visible FAQ list in the client component.

import {
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY,
  IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY,
} from "@/lib/data/ielts-pricing";

export const faqs: { q: string; a: string }[] = [
  {
    q: "Do you provide online IELTS coaching with live classes?",
    a: "Yes. The Champion pack includes daily live online classes in morning, afternoon and evening batches. The Self Preparation pack is self-paced and includes live Saturday test analysis and Sunday doubt-solving sessions. Both packs are delivered online, so students anywhere in India can join.",
  },
  {
    q: "How many mock tests are included?",
    a: "Both paid packs include 15 full-length timed mock tests and 60 sectional practice tests, with mentor feedback and section-wise analysis.",
  },
  {
    q: "Is there any doubt clearing support?",
    a: "Yes. A live Sunday doubt-solving session runs every week, and students in the Champion live batches can raise questions during their daily classes.",
  },
  {
    q: "How much does IELTS coaching cost in India?",
    a: `The Self Preparation pack is ${IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY} and the Champion pack starts from ${IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY}. Prices include GST, and the amount shown is the amount payable.`,
  },
  {
    q: "Do you provide free study abroad counseling?",
    a: "Yes. IELTS students can access study abroad counselling for destinations including Germany, the UK, Canada and Australia. Counselling covers university shortlisting, applications and visa documentation guidance.",
  },
  {
    q: "Can I get a free demo before enrolling?",
    a: "Yes. A 5-day free demo is available, including access to a mock test. You can book it from the free demo page without making a payment.",
  },
  {
    q: "Can I join from any city in India?",
    a: "Yes. All classes, mock tests and doubt sessions are delivered online, so your location in India does not limit access. You can join from any city or town with an internet connection.",
  },
  {
    q: "Are the classes live or recorded?",
    a: "The Champion pack includes daily live online classes. The Self Preparation pack is self-paced and uses video lessons, practice tests and mock tests. Both packs include the live Saturday test analysis and Sunday doubt-solving sessions.",
  },
  {
    q: "How do I choose between Self Preparation and Champion?",
    a: "Choose Self Preparation if you can study independently with video lessons, practice tests and mock tests. Choose Champion if you want daily live teaching, a structured batch and the free 4-week French course. The 5-day demo helps you decide before paying.",
  },
];
