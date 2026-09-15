// FILE: lib/data/faq/dmat.ts
//
// FAQ data for the /dmat route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the dMAT (Digital Master Test)?",
    a: "The dMAT — also referred to as the Digital Master Admission Test — is a standardised computer-based aptitude test introduced by APS India in collaboration with ITB Consulting, designed to evaluate the academic aptitude of students applying for Master's programmes in Germany. It assesses logical reasoning, mathematical aptitude, and analytical thinking, helping German universities identify applicants with the required academic potential. The official certificate is issued by g.a.s.t. and must be enclosed with your APS application documents.",
  },
  {
    q: "Who needs to take the dMAT in 2026?",
    a: "In its introductory phase in 2026, the dMAT requirement applies exclusively to applicants whose undergraduate degree is in Engineering, Commerce/Accounting/Finance/Economics, or Business/Management. If your degree falls within one of these fields and you're aiming to start a graduate programme in Germany in summer semester 2027 or thereafter, you are required to take the dMAT with the General Academic (Subject) Module as part of your APS documentation process. Students outside these three degree categories are not currently required to take it.",
  },
  {
    q: "What is the difference between the dMAT Core Module and Subject Module?",
    a: "The dMAT has two modules. The Core Module measures general cognitive and analytical skills through three subtests — this is the foundational, general-reasoning portion of the exam. The Subject Module (General Academic Module) tests your ability to apply those cognitive and analytical skills to academic problem-solving — tasks combine a typical academic problem with related questions, requiring developed transfer and application skills rather than memorised factual knowledge. Both modules together make up your complete dMAT result for APS purposes.",
  },
  {
    q: "Does ANU Education's dMAT course cover both the Core and Subject Modules?",
    a: "Currently, ANU Education's dMAT course covers the Core Module only. The Subject (General Academic) Module is not yet taught as part of this programme — we will announce Subject Module coaching sessions once they launch. This is worth knowing upfront: if your APS documentation requires the full dMAT result (both modules), you will need Subject Module preparation from another source until we launch our own, or self-study using official g.a.s.t. materials.",
  },
  {
    q: "When is the first dMAT test date in India?",
    a: "The first dMAT administration in India follows this timeline: registration opens 29 June 2026, the registration deadline is 15 September 2026, the test date is 26 September 2026, and results are published with certificates issued via the g.a.s.t. portal on 12 October 2026. These are the confirmed dates for the inaugural India administration — future test cycles may follow a similar or different schedule, so always verify current dates on the official g.a.s.t. site before planning.",
  },
  {
    q: "Where can I take the dMAT in India?",
    a: "The dMAT is currently planned to be offered at selected g.a.s.t. test centres including Ahmedabad, Bengaluru, Bhopal, Chandigarh, Chennai, Kolkata, Mananthavady, Mumbai, New Delhi, and Pune, as well as Kathmandu in Nepal. The final confirmed list of test centres becomes available during the official registration process on the g.a.s.t. platform.",
  },
  {
    q: "Who registers me for the dMAT — ANU Education or someone else?",
    a: "Registration, test centre booking, technical support, certificate issuance, and payment for the dMAT exam itself are all managed directly by g.a.s.t. — not by ANU Education or any coaching provider. ANU Education's role is exam preparation and coaching only. You register for the actual exam yourself at www.d-mat.de/en/registration. We're transparent about this distinction so there's no confusion about who handles what.",
  },
  {
    q: "What does ANU Education's dMAT Core course include?",
    a: "The dMAT Core course includes: a 4-week live curriculum, 20 hours of total live learning (60 minutes/day, Monday to Friday, 9:30–10:30 PM IST), 5 in-class tests, and 60 days of portal access. A free trial pack is also available: 5 days of access, 60 minutes/day, 1 in-class test, for students who want to experience the teaching style before enrolling. Sessions are live, instructor-led, and delivered online — recordings are available for any missed lectures.",
  },
  {
    q: "Is there a free demo class for dMAT coaching?",
    a: "Yes. ANU Education offers a Demo Orientation session on Tuesdays, Thursdays, and Saturdays from 9:00–10:00 AM IST, alongside a 5-day free trial pack that includes 60 minutes of live daily instruction and 1 in-class test — giving you a genuine sense of the course before committing.",
  },
  {
    q: "How is the dMAT certificate used in my Germany application?",
    a: "The official dMAT certificate is issued by g.a.s.t. and must be enclosed with your APS application documents. It will also be referenced directly on your APS certificate, which German universities require as part of your application for graduate programmes. Without a valid dMAT certificate (where applicable to your degree background), your APS documentation may be considered incomplete.",
  },
  {
    q: "Is the dMAT the same as the GMAT or GRE?",
    a: "No. The dMAT is a distinct exam specifically created for the German APS documentation process, administered by g.a.s.t. in collaboration with ITB Consulting, and currently required only for Engineering, Commerce, and Business/Management graduates applying to German Master's programmes starting summer semester 2027 onward. GMAT and GRE are separate, globally-used graduate admissions tests not tied to the APS process. Some German universities may still request GMAT/GRE independently of dMAT requirements — always check your specific target university's admission criteria.",
  },
  {
    q: "What score do I need on the dMAT?",
    a: "As of the exam's introductory phase in 2026, official minimum score thresholds for German universities are still being established, since this is the first administration in India. We recommend checking directly with your target German university's admissions office for their specific dMAT score expectations, and monitoring official g.a.s.t. communications as the programme matures.",
  },
  {
    q: "How long should I prepare for the dMAT Core Module?",
    a: "ANU Education's dMAT Core course is structured as a 4-week programme with 20 hours of live instruction — designed to build the general cognitive and analytical skills tested in the Core Module's three subtests within that window. Students with strong existing quantitative and logical reasoning skills may need less time; those building these skills from scratch should allow the full 4 weeks plus additional self-practice using the 60-day portal access.",
  },
];
