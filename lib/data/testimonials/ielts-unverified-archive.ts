// FILE: lib/data/testimonials/ielts-unverified-archive.ts
//
// ARCHIVE ONLY — NOT FOR RENDERING.
//
// These testimonials were published on the IELTS landing pages before the
// November 2026 trust-content review. No consent record, score report or
// other evidence was available in the repository, so they were removed from
// the rendered pages rather than presented as verified student outcomes.
//
// They are retained here so the business can review them, confirm consent
// and evidence, and then move any confirmed entry into
// ./ielts-approved.ts. Nothing in this file is imported by a page or
// component, and no code may render it directly.

export type ArchivedIeltsTestimonial = {
  /** Page the copy was previously published on. */
  sourcePage: string;
  name: string;
  city?: string;
  course?: string;
  bandScore?: string;
  destination?: string;
  quote: string;
};

export const IELTS_UNVERIFIED_TESTIMONIALS: readonly ArchivedIeltsTestimonial[] =
  Object.freeze([
    {
      sourcePage: "/test-prep/ielts-coaching-india",
      name: "Priya Sharma",
      bandScore: "Band 8.0",
      destination: "Canada",
      quote:
        "ANU Education's mock test portal was a game-changer. The daily doubt clearing sessions helped me improve quickly.",
    },
    {
      sourcePage: "/test-prep/ielts-coaching-india",
      name: "Rahul Mehta",
      bandScore: "Band 7.5",
      destination: "Germany",
      quote:
        "Best IELTS coaching online! The live classes and study abroad counseling helped me get admission in Germany.",
    },
    {
      sourcePage: "/test-prep/ielts-coaching-india",
      name: "Anjali Patel",
      bandScore: "Band 8.5",
      destination: "UK",
      quote:
        "The writing evaluation and speaking practice sessions were exceptional. Highly recommended!",
    },
    {
      sourcePage: "/test-prep/ielts-coaching-modasa",
      name: "Ravi Patel",
      city: "Modasa",
      course: "IELTS Academic",
      bandScore: "Band 7.0",
      destination: "Canada",
      quote:
        "Scored 7.0 in my first attempt after just 6 weeks with ANU Education. The Saturday mock analysis sessions and Sunday doubt-solving made the real difference. Now studying at University of Saskatchewan.",
    },
    {
      sourcePage: "/test-prep/ielts-coaching-modasa",
      name: "Hetal Solanki",
      city: "Himmatnagar",
      course: "IELTS Academic",
      bandScore: "Band 7.5",
      destination: "UK",
      quote:
        "I was at Band 5.5 when I joined the Advanced batch. Reached 7.5 in 8 weeks. The speaking practice recordings and trainer feedback completely transformed my speaking score.",
    },
    {
      sourcePage: "/test-prep/ielts-coaching-modasa",
      name: "Jayesh Thakor",
      city: "Idar",
      course: "IELTS General",
      bandScore: "Band 6.5",
      destination: "Australia PR",
      quote:
        "Online classes from Idar — no need to travel to Ahmedabad. ANU Education's counsellors also helped me understand the Australia immigration process step by step. Got my PR invitation.",
    },
    {
      sourcePage: "/test-prep/ielts/ielts-coaching-ahmedabad",
      name: "Suhani Patel",
      city: "Satellite, Ahmedabad",
      course: "IELTS Academic",
      bandScore: "Band 7",
      quote:
        "I joined ANU Education's online IELTS coaching from Satellite, Ahmedabad and achieved Band 7 in my first attempt. The speaking feedback was the most valuable part.",
    },
  ]);
