export type DemoExtraction = {
  wantsDemo: boolean;
  name?: string;
  phone?: string;
  email?: string;
  course?: string;
  preferredBatch?: string;
  preferredDate?: string;
  confidence: number;
};

const DEMO_KEYWORDS = [
  "demo",
  "free demo",
  "free class",
  "trial class",
  "book a class",
  "book demo",
  "join demo",
  "demo class",
];

const COURSE_KEYWORDS = [
  "ielts",
  "pte",
  "german",
  "french",
  "spoken english",
  "gre",
  "gmat",
  "sat",
  "toefl",
  "duolingo",
];

export function extractDemoIntent(message: string): DemoExtraction {
  const text = message.trim();
  const normalized = text.toLowerCase();

  const wantsDemo = DEMO_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );

  const course = COURSE_KEYWORDS.find((keyword) =>
    normalized.includes(keyword),
  );

  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/);

  const emailMatch = text.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  );

  return {
    wantsDemo,
    course: course ? normalizeCourse(course) : undefined,
    phone: phoneMatch?.[0]?.replace(/[\s-]/g, ""),
    email: emailMatch?.[0],
    confidence: wantsDemo ? (course ? 0.95 : 0.8) : 0,
  };
}

function normalizeCourse(course: string): string {
  const map: Record<string, string> = {
    ielts: "IELTS",
    pte: "PTE",
    german: "German",
    french: "French",
    "spoken english": "Spoken English",
    gre: "GRE",
    gmat: "GMAT",
    sat: "SAT",
    toefl: "TOEFL",
    duolingo: "Duolingo",
  };

  return map[course] ?? course;
}