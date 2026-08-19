import { extractDemoIntent } from "../demo/demo.extractor";

export type ChatIntent =
  | "DEMO"
  | "COACHING_LEAD"
  | "LEAD_QUALIFICATION"
  | "HUMAN_HANDOFF"
  | "GENERAL";

export type IntentRouteResult = {
  intent: ChatIntent;
  confidence: number;
  reason: string;
};

export type RouteIntentInput = {
  message: string;
  awaitingDemoConfirmation?: boolean;
};

const STUDY_COUNTRY_KEYWORDS = [
  "germany",
  "canada",
  "uk",
  "usa",
  "australia",
  "france",
  "ireland",
  "new zealand",
  "dubai",
  "uae",
];

const COURSE_INTEREST_KEYWORDS = [
  "ielts",
  "pte",
  "german",
  "french",
];

const COACHING_COURSE_KEYWORDS = [
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
  "dmat",
  "d-mat",
  "exam prep",
  "test prep",
  "coaching",
];

const COACHING_ACTION_KEYWORDS = [
  "want",
  "need",
  "looking for",
  "interested in",
  "join",
  "enroll",
  "enrol",
  "coaching",
  "classes",
  "class",
  "training",
  "batch",
  "prepare",
  "preparing",
  "preparation",
];

export function routeIntent(input: RouteIntentInput): IntentRouteResult {
  const message = input.message.trim();
  const normalized = normalize(message);

  if (
    input.awaitingDemoConfirmation &&
    isBookingConfirmation(normalized)
  ) {
    return {
      intent: "DEMO",
      confidence: 0.99,
      reason: "Conversation is awaiting demo confirmation and the user confirmed booking",
    };
  }

  if (isExplicitHumanHandoffRequest(normalized)) {
    return {
      intent: "HUMAN_HANDOFF",
      confidence: 0.98,
      reason: "User explicitly asked to speak with a human representative",
    };
  }

  if (input.awaitingDemoConfirmation) {
    return {
      intent: "DEMO",
      confidence: 0.9,
      reason: "Conversation is already in the existing demo confirmation flow",
    };
  }

  const demoIntent = extractDemoIntent(message);
  if (demoIntent.wantsDemo) {
    return {
      intent: "DEMO",
      confidence: Math.max(demoIntent.confidence, 0.95),
      reason: demoIntent.course
        ? `User explicitly requested a ${demoIntent.course} demo class`
        : "User explicitly requested a demo or trial class",
    };
  }

  if (isCoachingLeadMessage(normalized)) {
    return {
      intent: "COACHING_LEAD",
      confidence: 0.92,
      reason: "User expressed coaching/class enrollment intent for a specific course",
    };
  }

  if (isLeadQualificationMessage(normalized)) {
    return {
      intent: "LEAD_QUALIFICATION",
      confidence: 0.9,
      reason: "User shared or requested study-abroad qualification details",
    };
  }

  return {
    intent: "GENERAL",
    confidence: 0.85,
    reason: "Message does not match a narrow demo, handoff, coaching-lead, or lead-qualification pattern",
  };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBookingConfirmation(normalized: string): boolean {
  const confirmations = [
    "yes",
    "yes please",
    "book it",
    "book",
    "confirm",
    "confirm it",
    "please book",
    "i want to book",
    "book my demo",
    "reserve it",
    "reserve my seat",
  ];

  return confirmations.some(
    (phrase) => normalized === phrase || normalized.includes(phrase),
  );
}

function isExplicitHumanHandoffRequest(normalized: string): boolean {
  const patterns = [
    /\b(?:speak|talk|chat|connect|transfer)\s+(?:me\s+)?(?:to|with)\s+(?:a\s+)?(?:human|agent|counsellor|staff|person|representative)\b/,
    /\b(?:i|we)\s+(?:want|need|would like)\s+to\s+(?:speak|talk|chat|connect)\s+(?:to|with)\s+(?:a\s+)?(?:human|agent|counsellor|staff|person|representative)\b/,
    /\b(?:i|we)\s+(?:want|need)\s+(?:a\s+)?(?:human|agent|counsellor|staff|person|representative)\b/,
    /\b(?:human|agent|counsellor|representative)\s+please\b/,
    /\breal person\b/,
    /\blive agent\b/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
}

function isCoachingLeadMessage(normalized: string): boolean {
  if (isPureInformationalCourseQuestion(normalized)) {
    return false;
  }

  if (isInformationalIntent(normalized)) {
    return false;
  }

  const hasCoachingCourse = containsAnyKeyword(normalized, COACHING_COURSE_KEYWORDS);
  const hasCoachingAction = COACHING_ACTION_KEYWORDS.some(
    (keyword) =>
      new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(normalized),
  );

  if (hasCoachingCourse && hasCoachingAction) {
    return true;
  }

  if (
    hasCoachingCourse &&
    /\b(?:for|to improve|to get|to score|target|goal)\b/.test(normalized)
  ) {
    return true;
  }

  return false;
}

function isInformationalIntent(normalized: string): boolean {
  return /\b(?:just want to know|just curious|just asking|tell me|explain|can you tell|what (?:is|are|does|do)|how (?:does|do|is|are|many|much|long)|define|meaning)\b/.test(normalized);
}

function isLeadQualificationMessage(normalized: string): boolean {
  if (isPureInformationalCourseQuestion(normalized)) {
    return false;
  }

  if (isInformationalIntent(normalized)) {
    return false;
  }

  const hasStudyAbroadIntent = /\b(?:study abroad|study in|want to study|planning to study|plan to study|looking to study|apply to study)\b/.test(normalized);
  const hasCountry = containsAnyKeyword(normalized, STUDY_COUNTRY_KEYWORDS);
  const hasCourseInterest =
    containsAnyKeyword(normalized, COURSE_INTEREST_KEYWORDS) &&
    /\b(?:want|need|looking for|interested in|join|enroll|enrol|course|coaching|class|classes|training)\b/.test(normalized);
  const hasIntake = /\b(?:intake|fall\s+20\d{2}|autumn\s+20\d{2}|spring\s+20\d{2}|summer\s+20\d{2}|winter\s+20\d{2}|january intake|september intake)\b/.test(normalized);
  const hasBudget = /\bbudget\b/.test(normalized) || /(?:₹|rs\.?|\b\d+(?:\.\d+)?\s*lakhs?\b)/.test(normalized);
  const hasEducation = /\b(?:education|study|studies|btech|b\.?tech|be|b\.?e|bsc|b\.?sc|bcom|b\.?com|bba|mba|mtech|m\.?tech|graduation|graduate|undergraduate|postgraduate|masters|master s|bachelors|bachelor s|university|college|ielts|pte)\b/.test(normalized);

  if (hasStudyAbroadIntent && (hasCountry || hasIntake || hasBudget || hasEducation)) {
    return true;
  }

  if (hasCountry && /\b(?:study|university|admission|masters|bachelors|mba|intake|budget)\b/.test(normalized)) {
    return true;
  }

  if ((hasIntake || hasBudget) && (hasCountry || hasStudyAbroadIntent || hasEducation)) {
    return true;
  }

  if (hasCourseInterest) {
    return true;
  }

  return false;
}

function isPureInformationalCourseQuestion(normalized: string): boolean {
  return /^(?:what is|what s|what are|tell me about|define|meaning of|how (?:many|long|much)|explain)\s+(?:ielts|pte|german|french|gre|gmat|sat|toefl|duolingo|spoken english)\b/.test(normalized);
}

function containsAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) =>
    new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(text),
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
