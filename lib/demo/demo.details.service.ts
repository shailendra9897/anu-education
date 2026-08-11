import {
  extractStudentDetails,
  type ExtractedStudentDetails,
} from "./student-details.extractor";

import {
  updateDemoStudentDetails,
  type DemoStudentDetailsUpdate,
} from "./demo.service";

export type CaptureDemoDetailsInput = {
  bookingId: string;
  message: string;
};

export async function captureDemoStudentDetails(
  input: CaptureDemoDetailsInput,
): Promise<ExtractedStudentDetails> {
  const extracted = extractStudentDetails(input.message);

  const details: DemoStudentDetailsUpdate = {};

  if (extracted.name) {
    details.name = extracted.name;
  }

  if (extracted.phone) {
    details.phone = extracted.phone;
  }

  if (extracted.email) {
    details.email = extracted.email;
  }

  // Nothing useful was extracted.
  if (Object.keys(details).length === 0) {
    return extracted;
  }

  await updateDemoStudentDetails(
    input.bookingId,
    details,
  );

  return extracted;
}