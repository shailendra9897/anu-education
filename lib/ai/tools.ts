// lib/ai/tools.ts
export const agentTools = [
  {
    type: "function" as const,
    function: {
      name: "check_available_slots",
      description: "Check available demo class slots for a given course.",
      parameters: {
        type: "object",
        properties: {
          course: { type: "string", description: "Course name, e.g., IELTS, GRE, German A1" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
        },
        required: ["course"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "book_demo_slot",
      description: "Book a demo slot once the student provides their name, phone, course, and preferred time.",
      parameters: {
        type: "object",
        properties: {
          studentName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          course: { type: "string" },
          preferredSlot: { type: "string", description: "Selected date and time" },
        },
        required: ["studentName", "phone", "course"],
      },
    },
  },
];