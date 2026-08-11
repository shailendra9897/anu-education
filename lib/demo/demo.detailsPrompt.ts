import {
  getMissingDemoDetails,
  type DemoStudentDetails,
} from "./demo.details";

export function buildMissingDetailsPrompt(
  details: DemoStudentDetails,
): string | null {
  const missing = getMissingDemoDetails(details);

  const missingFields: string[] = [];

  if (missing.name) missingFields.push("name");
  if (missing.phone) missingFields.push("WhatsApp number");
  if (missing.email) missingFields.push("email address");

  if (missingFields.length === 0) {
    return null;
  }

  if (missingFields.length === 1) {
    return `To complete your demo booking and create your ANU Education portal access, please share your ${missingFields[0]}.`;
  }

  const last = missingFields.pop();

  return `To complete your demo booking and create your ANU Education portal access, please share your ${missingFields.join(
    ", ",
  )} and ${last}.`;
}