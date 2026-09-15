// FILE: lib/data/faq/visa.ts
//
// FAQ data for the /visa route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What documents are required for a student visa application?",
    a: "Most student visa applications require: a university acceptance/offer letter, a valid passport (6+ months validity beyond your stay), proof of financial capacity (bank statements, education loan sanction letter, or sponsor affidavit), academic transcripts and certificates, English proficiency test scores (IELTS/PTE/TOEFL/Duolingo), a Statement of Purpose (SOP), passport-size photographs meeting the destination country's specifications, and health insurance or medical examination results where required. Exact requirements vary significantly by country — ANU Education provides a country-specific checklist during your free consultation.",
  },
  {
    q: "Why do student visas get rejected, and how can I avoid it?",
    a: "The most common reasons for student visa rejection are: a weak or generic Statement of Purpose that fails to convince the visa officer of genuine study intent (around 32% of rejections), insufficient or unclear proof of financial capacity (27%), inconsistent documentation where names, dates, or figures don't match across documents (21%), poor performance in the visa interview (12%), and missing or incorrectly filled forms (8%). ANU Education's visa assistance addresses each of these specifically — through SOP review, financial document verification, document cross-checking, and mock interview preparation.",
  },
  {
    q: "How long does a student visa take to process?",
    a: "Processing times vary by country: Canada — 4 to 8 weeks for regular processing, or as fast as 20 days under the Student Direct Stream (SDS) for eligible applicants. UK — 3 to 8 weeks. Australia — 4 to 12 weeks depending on the visa subclass and source country. Germany — 6 to 12 weeks, among the longer processing times in Europe. France — 4 to 8 weeks. Dubai/UAE — 2 to 4 weeks once the university initiates sponsorship. We recommend starting your visa application as soon as you receive your unconditional offer letter — ideally 3 to 4 months before your intended travel date.",
  },
  {
    q: "What is a visa mock interview and how does it help?",
    a: "A mock interview is a simulated practice session that replicates the actual visa interview format and question style used by the destination country's immigration authority. At ANU Education, mock interviews cover: common questions about your study plans and choice of university, questions probing your ties to your home country and intent to return (or your genuine immigration plan, where applicable), financial questions about how you'll fund your education, and behavioural coaching on tone, confidence, and clarity. Students who complete mock interview sessions report significantly higher confidence and clarity on the actual interview day.",
  },
  {
    q: "Do I need to show proof of funds for a student visa?",
    a: "Yes, almost all countries require proof that you can financially support your studies and living expenses. Requirements vary: Canada requires either a GIC (Guaranteed Investment Certificate, currently around CAD 20,635) or proof of sufficient funds. Germany requires a blocked account with approximately €11,904 (2026 figures) or an equivalent scholarship/sponsor letter. The UK and Australia require bank statements showing funds held for a minimum period (typically 28 days for UK) covering tuition and living costs. ANU Education reviews your financial documentation in advance to identify gaps before you submit your application.",
  },
  {
    q: "Can ANU Education help if my visa was already rejected once?",
    a: "Yes. A prior visa rejection does not mean a permanent bar — many students successfully reapply with a stronger application. ANU Education reviews your previous rejection letter (if available) to identify the specific reason cited, rebuilds your SOP and documentation to directly address that concern, and prepares you thoroughly for any follow-up interview. Reapplication success rates improve significantly when the root cause of the first rejection is properly addressed rather than simply resubmitting similar documents.",
  },
  {
    q: "What is the difference between a student visa and a study permit?",
    a: "In most countries the terms are used interchangeably, but some countries distinguish them: in Canada, a 'Study Permit' is the document that allows you to study, while the 'visa' (or eTA) is what allows you to enter the country — you typically need both. In the UK, Australia, and most other countries, there is a single 'student visa' that serves both purposes. ANU Education clarifies the exact terminology and requirements for your specific destination country during counselling.",
  },
  {
    q: "What is SOP and why does it matter for visa approval?",
    a: "A Statement of Purpose (SOP) is a personal essay submitted with your visa and university applications that explains your academic background, reasons for choosing your course and country, career goals, and (where relevant) your intent to return to your home country after studies. A weak or generic SOP is one of the most common reasons for visa rejection. Visa officers read hundreds of SOPs and can quickly identify template-based or vague statements. ANU Education's SOP review service tailors your statement to address the specific concerns visa officers look for in your destination country.",
  },
  {
    q: "Does ANU Education provide visa assistance for all study destinations?",
    a: "Yes. ANU Education provides visa assistance for Canada, UK, USA, Australia, Germany, France, Dubai/UAE, Ireland, and New Zealand. Each country has different visa categories, document requirements, and processing timelines — our counsellors are trained on the specific requirements for each destination and update their knowledge regularly as embassy and immigration rules change.",
  },
  {
    q: "How much does visa assistance cost at ANU Education?",
    a: "Initial visa consultation and document checklist review at ANU Education is provided free as part of our study abroad counselling. Specific paid services like SOP writing, full documentation review, and structured mock interview sessions are priced transparently and discussed during your free consultation — there are no hidden charges or surprise add-on fees.",
  },
  {
    q: "What happens after my visa is approved?",
    a: "Once your visa is approved, ANU Education provides pre-departure orientation covering: travel and flight booking guidance, accommodation arrangements, banking and forex setup, what to pack and carry, and what to expect on arrival (airport procedures, initial registration requirements). We aim to support you not just until your visa is approved, but through your actual departure and settling-in period.",
  },
  {
    q: "Can I apply for a student visa without IELTS or PTE?",
    a: "It depends on the country and university. Many universities now accept Duolingo English Test scores or waive English proficiency requirements for students from English-medium educational backgrounds (with a Medium of Instruction certificate). However, for visa purposes specifically, some countries (like the UK for certain visa categories) require an approved Secure English Language Test. ANU Education's counsellors will confirm the exact English proficiency requirement for your specific visa category and country before you begin preparation.",
  },
];
