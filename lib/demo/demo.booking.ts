// FILE: lib/demo/demo.booking.ts
//
// ─────────────────────────────────────────────────────────────────
// FIXED vs submitted version — root cause of "stuck at booking":
//
//   ❌ OLD: the confirmation block ("yes") created the DemoBooking
//      row and returned `success: true` with a "booking created!"
//      message REGARDLESS of whether name/phone/email were known
//      yet. Since the student usually hasn't given those at the
//      "yes" moment, this told them "you're booked" while the
//      booking was actually empty — then route.ts's SEPARATE
//      missing-details loop started asking for the same info on
//      the next turn, contradicting the message just sent.
//
//   ✅ NEW: the booking row is still created immediately on "yes"
//      (so route.ts's existing missing-details loop has something
//      to attach captured details to) — but `success: true` is
//      ONLY returned once name, phone, AND email are all present.
//      Otherwise it returns `needsConfirmation: true` with a
//      details-request message, so the student never receives a
//      false "you're done" message.
//
//   ✅ Removed dead code: the old bottom fallback block
//      ("Student has explicitly confirmed") could never execute —
//      its guard condition is always true by the time execution
//      reaches it (the top confirmation block already returns
//      whenever that same condition would be false). Deleted.
//
// ⚠️ STILL NEEDS VERIFICATION against files not yet shared:
//   - lib/demo/demo.service.ts       (createDemoBooking, getDemoBookingByConversation)
//   - lib/demo/demo.details.service.ts (captureDemoStudentDetails)
//   - lib/demo/demo.details.ts       (getMissingDemoDetails)
//   This file assumes createDemoBooking accepts partial/undefined
//   name/phone/email (creating an incomplete row is intentional now,
//   not a bug) — please confirm that's safe on the DB/service side.
// ─────────────────────────────────────────────────────────────────

import { createDemoBooking } from "./demo.service";
import { extractDemoIntent } from "./demo.extractor";
import { getAvailableDemoSlots } from "./demo.availability";

export type BookDemoInput = {
  conversationId: string;
  message: string;
  name?: string;
  phone?: string;
  email?: string;

  // True only when the previous AI message asked
  // the student to confirm a demo booking.
  awaitingConfirmation?: boolean;
  pendingCourse?: string | null;
};

export type DemoBookingResult = {
  success: boolean;
  needsConfirmation: boolean;
  message: string;
  bookingId?: string;
  slots?: Awaited<ReturnType<typeof getAvailableDemoSlots>>;
};

function hasAllContactDetails(input: Pick<BookDemoInput, "name" | "phone" | "email">): boolean {
  return Boolean(input.name && input.phone && input.email);
}

export async function processDemoRequest(
  input: BookDemoInput,
): Promise<DemoBookingResult> {
  const extracted = extractDemoIntent(input.message);

  // ── CONFIRMATION FLOW ──────────────────────────────────────────
  // Student said "yes" to a previously-asked "would you like me to
  // book this?" question.
  if (
    input.awaitingConfirmation &&
    isBookingConfirmation(input.message)
  ) {
    const slots = await getAvailableDemoSlots(
      input.pendingCourse ?? undefined,
    );

    if (slots.length === 0) {
      return {
        success: false,
        needsConfirmation: false,
        message:
          "I couldn't find an available demo slot. Please confirm the latest timing with an ANU Education counsellor.",
      };
    }

    const selectedSlot = slots.find(
      (slot) => slot.batch.toLowerCase().includes("demo"),
    );

    if (!selectedSlot) {
      return {
        success: false,
        needsConfirmation: false,
        message:
          "I couldn't find the approved demo slot. Please contact an ANU Education counsellor.",
      };
    }

    // Create the booking row now — even if contact details are
    // incomplete. This gives route.ts's existing missing-details
    // loop (existingDemoBooking / getMissingDemoDetails) a row to
    // attach captured details to on the student's next message(s).
    // What we DON'T do anymore is tell the student it's "created"
    // (success: true) until it's actually complete — see below.
    const booking = await createDemoBooking({
      conversationId: input.conversationId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      course: selectedSlot.course,
      preferredBatch: selectedSlot.batch,
      notes: `Faculty-approved demo timing: ${selectedSlot.time}`,
    });

    // ✅ FIX: only claim success once contact details are complete.
    if (hasAllContactDetails(input)) {
      return {
        success: true,
        needsConfirmation: false,
        bookingId: booking.id,
        message:
          `Your free ${selectedSlot.course} demo booking has been created ` +
          `for the ${selectedSlot.batch} (${selectedSlot.time}). ` +
          `Our counsellor will confirm your seat.`,
      };
    }

    // Details incomplete — say so honestly instead of a false "done".
    const missing: string[] = [];
    if (!input.name)  missing.push("your name");
    if (!input.phone) missing.push("your WhatsApp number");
    if (!input.email) missing.push("your email address");
    const last = missing.pop();
    const missingText =
      missing.length > 0 ? `${missing.join(", ")} and ${last}` : last;

    return {
      success: false,
      needsConfirmation: true,
      bookingId: booking.id,
      message:
        `Great, your ${selectedSlot.course} demo slot (${selectedSlot.batch}, ${selectedSlot.time}) is reserved! ` +
        `To confirm your seat, please share ${missingText}.`,
    };
  }

  // ── NORMAL DEMO REQUEST ─────────────────────────────────────────
  if (!extracted.wantsDemo) {
    return {
      success: false,
      needsConfirmation: false,
      message: "No demo booking request detected.",
    };
  }

  // ── PENDING DEMO + STUDENT DETAILS ──────────────────────────────
  // The student may provide their name, phone or email after the
  // demo has already been selected. The current message may not
  // contain the word "German", "IELTS", etc., so use pendingCourse.
  if (
    input.pendingCourse &&
    input.name &&
    input.phone &&
    input.email
  ) {
    const slots = await getAvailableDemoSlots(input.pendingCourse);

    if (slots.length === 0) {
      return {
        success: false,
        needsConfirmation: false,
        message:
          "I couldn't find the approved demo slot for this course. Please confirm the latest timing with an ANU Education counsellor.",
      };
    }

    const selectedSlot = slots.find(
      (slot) => slot.batch.toLowerCase().includes("demo"),
    );

    if (!selectedSlot) {
      return {
        success: false,
        needsConfirmation: false,
        message:
          "I couldn't find the approved demo slot. Please contact an ANU Education counsellor.",
      };
    }

    return {
      success: false,
      needsConfirmation: true,
      message:
        `Thanks ${input.name}! I have your details. ` +
        `The ${selectedSlot.course} demo is ${selectedSlot.time}. ` +
        `Would you like me to book it for you?`,
      slots,
    };
  }

  // Get actual faculty-approved demo slots.
  const slots = await getAvailableDemoSlots(extracted.course);

  if (slots.length === 0) {
    return {
      success: false,
      needsConfirmation: false,
      message:
        "I couldn't find an available demo slot for that course. Please confirm the latest timing with an ANU Education counsellor.",
    };
  }

  // We have a demo request, but the student has not explicitly
  // selected/confirmed a slot yet.
  //
  // IMPORTANT: we do NOT create a booking merely because someone
  // asks "What is the demo timing?" — only ask for confirmation.
  //
  // (The old code had an unreachable "fallback confirmed" branch
  // after this block — removed. By the time we reach this point,
  // we are guaranteed NOT in the awaitingConfirmation+confirmed
  // case, since that's handled entirely by the top block above.
  // So this function always ends by asking for confirmation here;
  // it never falls through to a second booking-creation path.)
  const slotText = slots
    .map((slot) => `${slot.batch}: ${slot.time}`)
    .join(", ");

  return {
    success: false,
    needsConfirmation: true,
    message:
      `Our available ${extracted.course ?? ""} demo slot is ${slotText}. ` +
      `Would you like me to book this free demo for you?`,
    slots,
  };
}

function isBookingConfirmation(message: string): boolean {
  const text = message.trim().toLowerCase();

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
    (phrase) =>
      text === phrase ||
      text.includes(phrase),
  );
}
