// FILE: lib/data/faq/duolingo.ts
//
// FAQ data for the /duolingo route. Single source of truth —
// consumed by the server-rendered FAQPage JSON-LD (page.tsx)
// and the visible FAQ accordion (client component).

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the Duolingo English Test (DET)?",
    a: "The Duolingo English Test (DET) is an online English proficiency exam conducted by Duolingo, Inc. It is taken at home on a computer with a webcam and microphone. The test is approximately 1 hour long and includes an adaptive section (45 min) and a video interview (10 min). Scores range from 10 to 160 and are valid for 2 years. The exam fee is approximately ₹6,000 (~$70 USD) and results are available within 48 hours of completion.",
  },
  {
    q: "Is the Duolingo English Test accepted by universities?",
    a: "Yes. The Duolingo English Test is accepted by over 5,500 universities and programmes worldwide including top institutions in the USA, Canada, UK, Australia, Germany, Ireland, New Zealand, and UAE. Notable universities include MIT, Harvard, Columbia, Stanford, University of Toronto, University of British Columbia, University of Manchester, and hundreds of others. For Canada, DET is accepted for most Master's and undergraduate programmes, though it is not accepted for Canadian student visa (SDS route — use IELTS or PTE for SDS).",
  },
  {
    q: "What is a good Duolingo English Test score?",
    a: "A score of 115+ is generally considered a good Duolingo English Test score for most universities. Score requirements vary by institution: Most US universities — 105–120. Top 50 US universities — 120–135. Canada universities — 110–120. UK universities — 110–120. Australia — 90–115. Germany — 90–110. Your DET score report also includes four subscores: Literacy, Comprehension, Conversation, and Production — universities may require minimum scores in specific subscores.",
  },
  {
    q: "How is the Duolingo English Test format structured?",
    a: "The DET has 3 parts: Quick Setup (5 min) — introduction, rules, and ID verification. Adaptive Test (45 min) — 13 question types covering Reading, Writing, Listening, and Speaking. The test is computer-adaptive — question difficulty adjusts based on your performance. Video Interview (10 min) — not scored but submitted to universities alongside your score. Total: approximately 1 hour. The adaptive section includes question types like Read and Select, Listen and Type, Write About the Photo, Interactive Speaking, and more.",
  },
  {
    q: "How many times can I take the Duolingo English Test?",
    a: "You can take the Duolingo English Test up to 3 times within any 30-day period. There is no annual limit on attempts. Results are available within 48 hours, making DET one of the fastest-turnaround English proficiency exams available. If you are not satisfied with your score, you can quickly rebook and retake.",
  },
  {
    q: "Can I take the Duolingo English Test from home in India?",
    a: "Yes. The Duolingo English Test is 100% at-home and online. You need: A computer (laptop or desktop) with a front-facing webcam, a microphone, a stable internet connection, a valid government-issued ID (passport recommended), and a quiet, well-lit room. The test can be taken anytime — it is available on-demand, 24/7, from anywhere in India. This is one of the biggest advantages over IELTS and PTE, which require visiting a test centre.",
  },
  {
    q: "What is the Duolingo English Test fee in India?",
    a: "The Duolingo English Test fee is approximately $70 USD, which is around ₹6,000 at current exchange rates. This fee includes unlimited free score reporting to any number of institutions — unlike IELTS which charges per additional score report. The test can be taken at home, saving travel and test centre costs. ANU Education's Duolingo coaching fee starts at ₹1,999 (limited time offer; regular price ₹5,000) — separate from the exam registration fee.",
  },
  {
    q: "What does the ANU Education Duolingo coaching include?",
    a: "ANU Education's Duolingo Champion Course (₹1,999 offer) includes: 60 min/day live classes Monday–Friday (7:00–8:00 PM IST), 4-week live curriculum cycle (20 total live learning hours), Saturday grammar batch (11:00 AM–12:00 PM IST), 12 full-length timed mock tests, 300+ grammar, vocabulary and spelling videos, grammar and vocabulary quizzes, 60-day login access, and recordings for missed lectures. A free 5-day demo pack (1 mock test, 5 live hours) is also available.",
  },
  {
    q: "What batch timings are available for Duolingo coaching at ANU Education?",
    a: "Duolingo live class timings (IST): Main Batch — Monday to Friday, 7:00 PM to 8:00 PM. Grammar Batch — Only on Saturdays, 11:00 AM to 12:00 PM. All sessions are 60 minutes per day. The 4-week curriculum runs continuously with rolling batches — you can join any week and receive recordings for any missed lectures.",
  },
  {
    q: "Is Duolingo easier than IELTS or PTE?",
    a: "The Duolingo English Test is generally considered more flexible than IELTS or PTE for several reasons: At-home convenience (no test centre visit), faster results (48 hours vs 3–13 days for IELTS/PTE), lower exam fee (~₹6,000 vs ~₹18,000 for IELTS/PTE), available on-demand 24/7, and unlimited free score reporting. However, DET is not accepted for Canada SDS student visa (use IELTS or PTE for this). For university admissions, DET is widely accepted and many students find its shorter format easier to manage.",
  },
  {
    q: "How long does Duolingo English Test coaching take?",
    a: "ANU Education's Duolingo coaching is a 4-week intensive programme. Most students with intermediate English can achieve their target score in 4 weeks of focused preparation. Students starting from basic English may need 6–8 weeks. The free 5-day demo lets you experience the live class and take a mock test before committing to the full course.",
  },
  {
    q: "Why choose ANU Education for Duolingo coaching?",
    a: "ANU Education offers the most affordable comprehensive Duolingo coaching in India: ₹1,999 (offer price) vs ₹7,500–₹15,000 at major competitors. Includes 12 mock tests, 20 live hours, 300+ videos, and Saturday grammar sessions. Skill India certified counsellors provide free study abroad guidance alongside coaching. One-stop: Duolingo coaching + IELTS/PTE + French/German + study abroad consultancy under one roof. 1,100+ students guided. 98% success rate.",
  },
];
