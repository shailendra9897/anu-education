// FILE: lib/data/faq/gre.ts
//
// FAQ data for the /gre route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the GRE exam format in 2026?",
    a: "The GRE General Test follows the 'Shorter GRE' format introduced on 22 September 2023, which continues unchanged in 2026. Total duration is 1 hour 58 minutes with 55 questions across 3 sections: Analytical Writing (1 'Analyze an Issue' essay, 30 minutes), Verbal Reasoning (27 questions across 2 sections, 41 minutes total), and Quantitative Reasoning (27 questions across 2 sections, 47 minutes total). There are no unscored or experimental sections and no scheduled break — every question counts toward your final score.",
  },
  {
    q: "How is the new Shorter GRE different from the old GRE format?",
    a: "The old GRE (before September 2023) took nearly 3 hours 45 minutes, included an extra unscored or research section that didn't count toward your score, had a 10-minute break, and required two AWA essays ('Analyze an Issue' and 'Analyze an Argument'). The new Shorter GRE takes under 2 hours, has no unscored sections (every section is scored), has no scheduled break, and requires only the 'Analyze an Issue' essay. The score scale (130–170 per section, 260–340 composite) and the underlying skills tested have not changed.",
  },
  {
    q: "How many questions are on the GRE and how is it scored?",
    a: "The GRE has 55 questions total: 27 Verbal Reasoning questions (split across 2 sections), 27 Quantitative Reasoning questions (split across 2 sections), and 1 Analytical Writing essay. Verbal and Quantitative Reasoning are each scored on a 130–170 scale in 1-point increments, giving a composite score range of 260–340. Analytical Writing is scored separately on a 0–6 scale. There is no negative marking, so you should attempt every question.",
  },
  {
    q: "What does 'section-level adaptive' mean for the GRE?",
    a: "The GRE's Verbal and Quantitative Reasoning sections are each split into two parts. Your performance on the first Verbal section determines the difficulty level of your second Verbal section — and the same applies to Quant. Score well on the first section and you unlock a harder (and higher-scoring-potential) second section. This means the first section of each subject deserves your most careful, accurate attempt, since it directly shapes your scoring ceiling for the rest of that subject.",
  },
  {
    q: "How many times can I retake the GRE, and what is the gap between attempts?",
    a: "You can take the GRE General Test up to 5 times within any rolling 12-month period, with a minimum gap of 21 days between attempts. This applies whether you test at an official centre or via GRE at Home. You can use ETS's ScoreSelect feature to choose which of your scores from the last 5 years to send to universities — so a lower attempt never has to be reported if you don't want it to be.",
  },
  {
    q: "How long is a GRE score valid?",
    a: "GRE scores are valid for 5 years from your test date. This gives you flexibility to take the test well before you finalise your university list, and even to apply across multiple admission cycles using the same score if needed.",
  },
  {
    q: "What is the GRE exam fee in India in 2026?",
    a: "The GRE General Test fee is $220 USD, which is approximately ₹18,300 at current exchange rates (this fluctuates, so always check the live rate at ets.org before paying). This fee is the same whether you test at an official Prometric centre or take the GRE at Home. ANU Education's coaching fee is separate from this exam registration fee.",
  },
  {
    q: "Can I take the GRE from home in India?",
    a: "Yes. ETS continues to offer the GRE at Home option in 2026, allowing you to take the exact same exam remotely with secure online proctoring. The format, timing, and question types are identical to the test-centre version. One key difference: GRE at Home has no break option at all, whereas a test-centre attempt technically allows a short break (though the exam timer keeps running during it).",
  },
  {
    q: "Is the GRE required for MBA programmes, or only MS and PhD?",
    a: "The GRE is most strongly associated with MS and PhD admissions, but a growing number of MBA programmes now accept GRE scores as an alternative to the GMAT — including many top business schools. If you're unsure whether your target MBA programme prefers GRE or GMAT, ANU Education's counsellors can help you check the specific requirement and, where it's genuinely flexible, advise which test is likely to suit your strengths better.",
  },
  {
    q: "Which countries and universities accept the GRE?",
    a: "The GRE is accepted by graduate programmes across the USA, Canada, UK, Australia, Germany, and most other major study-abroad destinations, for MS, PhD, and an increasing number of MBA programmes. Acceptance and minimum score expectations vary significantly by university and specific programme, so it's important to check your target programme's published GRE expectations rather than relying on a generic 'good score' benchmark.",
  },
  {
    q: "What is a good GRE score in 2026?",
    a: "There's no single 'good' GRE score — it depends entirely on your target programme's typical accepted range. As a general reference point, scores above 320 (combined Verbal + Quant) are considered strong for competitive programmes, while many programmes admit students with scores in the 300–315 range alongside a strong overall profile. Quant-heavy programmes (engineering, data science) often weight the Quantitative score more heavily; humanities and social science programmes often weight Verbal more heavily.",
  },
  {
    q: "What does ANU Education's GRE coaching include?",
    a: "ANU Education's GRE course includes: 230+ vocabulary videos (medium and hard difficulty), 500+ vocabulary quiz questions, 45+ hours of Verbal video lessons, 45+ hours of Quantitative video lessons, 10 full-length timed mock tests on an adaptive test engine that mirrors the real GRE's section-adaptive scoring, instant results with detailed performance analysis, and a live Saturday doubt-solving session. A free demo class is available before you enrol.",
  },
];
