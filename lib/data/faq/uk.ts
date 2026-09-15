// FILE: lib/data/faq/uk.ts
//
// FAQ data for the /uk route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does it cost to study in the UK?",
    a: "Tuition fees for international students range from £10,000–£20,000 per year for most postgraduate courses, with London universities and specialised programmes (medicine, MBA) often higher. Living costs are approximately £1,529/month in London or £1,171/month outside London for visa purposes — though many students manage on less outside London. Total visa-related costs add roughly £1,500–£2,500 (visa fee + Immigration Health Surcharge) for a one-year course.",
  },
  {
    q: "Is the UK good for a master's degree?",
    a: "Yes. The UK offers 1-year master's programmes (vs 2 years in most other countries), home to globally ranked universities including several Russell Group institutions, and the Graduate Route visa allowing 2 years of post-study work. The shorter duration means lower total cost and faster entry into the job market compared to longer master's programmes elsewhere.",
  },
  {
    q: "Can I work while studying in the UK?",
    a: "Yes. Most international students on a Student visa can work up to 20 hours per week during term time and full-time during official vacation periods, provided their university has a track record of visa compliance. This helps offset some living costs, though work income should never be relied upon to meet the visa's financial requirement — that must be proven separately through bank statements.",
  },
  {
    q: "What is the UK student visa success rate?",
    a: "Recent data shows approximately 98% of UK student visa applications are approved, with around 2% refused — provided documentation is accurate and complete. The most common refusal reasons are financial evidence errors (especially the 28-day fund-holding rule), CAS/application mismatches, and using the wrong English test type. ANU Education's visa support specifically targets these common error points.",
  },
  {
    q: "Which city is best for Indian students in the UK?",
    a: "It depends on budget and course. London offers the most university choice and career networking but has the highest living costs (£1,529/month visa requirement). Cities like Manchester, Birmingham, Sheffield, Leeds, and Glasgow offer strong universities with significantly lower living costs (£1,171/month visa requirement) and large existing Indian student communities, making them popular for value-conscious students.",
  },
  {
    q: "What is the Graduate Route (post-study work visa) in the UK?",
    a: "The Graduate Route allows international students to remain in the UK after completing their degree to work or look for work, without needing employer sponsorship. As of 2026, the duration is 2 years for bachelor's/master's graduates who apply by 31 December 2026, but is set to reduce to 18 months for those applying from January 2027 onward — PhD graduates retain 3 years. This makes 2026 a meaningfully better year to start a UK master's if maximising post-study work time matters to you. The application fee is £880 (rising to £937 from 8 April 2026) plus the Immigration Health Surcharge.",
  },
  {
    q: "What IELTS score is required for UK universities and the student visa?",
    a: "University admission requirements typically range from IELTS 6.0–7.0 for undergraduate and 6.5–7.5 for postgraduate courses, varying by university and course. Separately, as of 8 January 2026, the UK Student visa itself requires CEFR B2 level English (up from B1 previously) — and this must be proven through a Home Office-approved Secure English Language Test (SELT), most commonly 'IELTS for UKVI.' Important: standard IELTS Academic (the version used for most university applications) is NOT automatically accepted for the visa — you may need the specific UKVI version. ANU Education's counsellors clarify exactly which test version you need before you book.",
  },
];
