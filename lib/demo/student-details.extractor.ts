export type ExtractedStudentDetails = {
  name?: string;
  phone?: string;
  email?: string;
};

export function extractStudentDetails(
  message: string,
): ExtractedStudentDetails {
  const text = message.trim();

  // ── Email ──────────────────────────────────────────────────────
  const emailMatch = text.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  );

  // ── Indian mobile number ───────────────────────────────────────
  const phoneMatch = text.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/,
  );

  // ── Name ────────────────────────────────────────────────────────
  const namePatterns = [
    // Name: Rahul Patel
    /\bname\s*[:=-]\s*([A-Za-z][A-Za-z .'-]{1,50}?)(?=\s+(?:phone|mobile|whatsapp|email)\s*[:=-]|\s*$)/i,

    // My name is Rahul Patel
    /\bmy name is\s+([A-Za-z][A-Za-z .'-]{1,50}?)(?=\s+(?:phone|mobile|whatsapp|email)\s*[:=-]|\s*$)/i,

    // I am Rahul Patel
    /\bi am\s+([A-Za-z][A-Za-z .'-]{1,50}?)(?=\s+(?:phone|mobile|whatsapp|email)\s*[:=-]|\s*$)/i,

    // This is Rahul Patel
    /\bthis is\s+([A-Za-z][A-Za-z .'-]{1,50}?)(?=\s+(?:phone|mobile|whatsapp|email)\s*[:=-]|\s*$)/i,
  ];

  let name: string | undefined;

  // ── Pattern-based name extraction ──────────────────────────────
  for (const pattern of namePatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      name = cleanName(match[1]);
      break;
    }
  }

  // ── Plain-name fallback ────────────────────────────────────────
  //
  // Example:
  // "Lakhan Rathod"
  //
  // Only use this when the entire message looks like a person's
  // name. This prevents normal chat such as:
  // "I want German demo"
  // from becoming a name.
  if (!name && looksLikePlainName(text)) {
    name = cleanName(text);
  }

  return {
    name,
    phone: phoneMatch?.[0]
      ? normalizePhone(phoneMatch[0])
      : undefined,
    email: emailMatch?.[0]?.toLowerCase(),
  };
}

// ── Plain-name safety check ───────────────────────────────────────

function looksLikePlainName(value: string): boolean {
  const text = value.trim();

  if (!text) {
    return false;
  }

  // Don't treat messages containing contact information as names.
  if (
    text.includes("@") ||
    /\d/.test(text)
  ) {
    return false;
  }

  // Names should normally contain 2–5 words.
  const words = text.split(/\s+/);

  if (words.length < 2 || words.length > 5) {
    return false;
  }

  // Reject common chat / booking / course words.
  const blockedWords = [
    "i",
    "my",
    "me",
    "want",
    "need",
    "please",
    "book",
    "booking",
    "demo",
    "class",
    "course",
    "join",
    "interested",
    "yes",
    "no",
    "german",
    "french",
    "ielts",
    "pte",
    "toefl",
    "gre",
    "gmat",
    "sat",
    "duolingo",
    "english",
    "study",
    "abroad",
    "country",
    "email",
    "phone",
    "mobile",
    "whatsapp",
  ];

  const lowerWords = words.map((word) => word.toLowerCase());

  if (
    lowerWords.some((word) => blockedWords.includes(word))
  ) {
    return false;
  }

  // Only alphabetic name-style words.
  return words.every((word) =>
    /^[A-Za-z][A-Za-z.'-]*$/.test(word),
  );
}

// ── Clean name ────────────────────────────────────────────────────

function cleanName(value: string): string {
  return value
    .replace(/[,.!?]+$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join(" ");
}

// ── Normalize Indian phone ────────────────────────────────────────

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return value.trim();
}