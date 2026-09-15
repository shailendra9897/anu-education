// FILE: lib/data/faq/gmat.ts
//
// FAQ data for the /gmat route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the GMAT Focus Edition the same as the GMAT?",
    a: "Yes — as of July 2024, GMAC (the test maker) dropped the name 'Focus Edition' and simply calls it 'the GMAT,' since the older classic format was fully retired on 31 January 2024. If you register for the GMAT in 2026, you are taking what was previously called the Focus Edition. There is no other version available. Any study materials referring to Integrated Reasoning (IR) or the Analytical Writing Assessment (AWA) are outdated — both were removed.",
  },
  {
    q: "What is the GMAT exam format in 2026?",
    a: "The current GMAT has 3 equally-weighted sections, each 45 minutes: Quantitative Reasoning (21 questions — arithmetic, algebra, word problems, number properties, statistics; geometry was removed), Verbal Reasoning (23 questions — Reading Comprehension and Critical Reasoning; Sentence Correction was removed), and Data Insights (20 questions — Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, Two-Part Analysis, with an on-screen calculator). Total exam time is 2 hours 15 minutes for 64 questions. There is no Analytical Writing Assessment (AWA) or separate Integrated Reasoning section — Data Insights replaced and absorbed those skills.",
  },
  {
    q: "What is the GMAT score scale in 2026?",
    a: "The GMAT total score ranges from 205 to 805, in 10-point increments — this replaced the older 200–800 scale used before February 2024. Each of the three sections (Quant, Verbal, Data Insights) is individually scored from 60 to 90. All three sections contribute equally to your total score. Important: a 705 on the current GMAT is not equivalent to a 705 on the old scale — the two scales are not directly comparable, and admissions committees evaluate current scores on their own terms.",
  },
  {
    q: "What is a good GMAT score for top business schools?",
    a: "A score of 705+ places you in approximately the 98th percentile of all test-takers — considered excellent for top-tier MBA programs. A score of 715+ corresponds to roughly the 99th percentile. Scoring 655 or above already puts you in the top 10% of candidates globally. Target scores vary by school: top-10 global MBA programs typically expect 700+, while many strong regional and mid-tier programs accept 600–650+.",
  },
  {
    q: "What is the GMAT exam fee in 2026?",
    a: "The GMAT exam fee is approximately $275 USD (subject to change — verify the current fee on mba.com before registering). This includes your official score report. Within 48 hours of receiving your score, you can send it free to up to 5 programs of your choice. Additional score reports beyond the first 5, or requests for reports older than 5 years, incur extra fees and may require special GMAC approval.",
  },
  {
    q: "Is the GMAT computer-adaptive?",
    a: "Yes. The GMAT is a Computer Adaptive Test (CAT) — question difficulty adjusts in real time based on your performance within each section. The current format also introduces Section-Adaptive scoring (each of the 3 sections adapts independently), a Question Review & Edit Tool (allowing limited review and answer changes within a section — a feature the old GMAT did not have), and Flexible Section Order (you choose which of the 3 sections to attempt first, second, and third on test day).",
  },
  {
    q: "How is the GMAT different from CAT (for Indian B-schools)?",
    a: "The GMAT is more structured and predictable, with a clearly defined syllabus and consistent question patterns each year — useful for students who prefer a stable target to prepare against. CAT (used for IIMs and Indian B-schools) has tougher, less predictable quantitative sections and no official published syllabus, with difficulty varying year to year. Students planning both Indian and international MBA applications often start with GMAT preparation since its structure transfers well, then adapt separately for CAT's specific quant intensity.",
  },
  {
    q: "How long should I prepare for the GMAT?",
    a: "Most students need 2 to 4 months of consistent preparation to reach a competitive score, depending on their starting math and verbal proficiency. Since Geometry, Sentence Correction, and AWA were removed from the syllabus, students transitioning from older study materials should specifically re-focus on Data Insights, which is entirely new and often underprepared for. A free diagnostic test helps identify your actual starting point before committing to a timeline.",
  },
  {
    q: "Does ANU Education's GMAT coaching cover Data Insights?",
    a: "Yes. Since Data Insights is the newest and most unfamiliar section for most students (it replaced the old Integrated Reasoning section and absorbed some Data Sufficiency content), our coaching gives it dedicated focus — covering Multi-Source Reasoning, Table Analysis, Graphics Interpretation, Two-Part Analysis, and Data Sufficiency with the on-screen calculator tool students will actually use on test day.",
  },
  {
    q: "Can I retake the GMAT if I don't get my target score?",
    a: "Yes. You can retake the GMAT, though GMAC enforces a waiting period between attempts and a maximum number of attempts within a rolling 12-month period and lifetime cap (verify current limits on mba.com, as GMAC updates these periodically). Many students improve their score by 30–50+ points on a second attempt after targeted section-specific practice, particularly in Data Insights where familiarity with question formats matters significantly.",
  },
  {
    q: "What GMAT score do I need for an MBA in Canada, UK, or Australia?",
    a: "Typical competitive GMAT ranges: Canada — 550–650+ for most programs, 650+ for top schools (Rotman, Ivey). UK — 600–650+ for most programs, 680+ for London Business School and Oxford Saïd. Australia — 550–600+ for most programs, higher for AGSM and Melbourne Business School. USA — varies widely, from 550 for many state programs to 720+ for top-10 schools. ANU Education's counsellors help match your target score to realistic university shortlists based on your profile.",
  },
  {
    q: "Does ANU Education provide MBA university counselling along with GMAT coaching?",
    a: "Yes. ANU Education is a Skill India certified study abroad consultancy — GMAT coaching is paired with free MBA university shortlisting, SOP writing support, and visa guidance for Canada, UK, USA, Australia, and other destinations, so your GMAT preparation is directly connected to your actual application strategy rather than studied in isolation.",
  },
];
