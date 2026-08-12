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

  for (const pattern of namePatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      name = cleanName(match[1]);
      break;
    }
  }

  return {
    name,
    phone: phoneMatch?.[0]
      ? normalizePhone(phoneMatch[0])
      : undefined,
    email: emailMatch?.[0]?.toLowerCase(),
  };
}

function cleanName(value: string): string {
  return value
    .replace(/[,.!?]+$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
}

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