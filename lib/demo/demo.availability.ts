import { loadKnowledge } from "@/lib/knowledge/knowledge.loader";

export type AvailableDemoSlot = {
  course: string;
  batch: string;
  session: "morning" | "evening";
  time: string;
};

type CourseData = {
  id?: string;
  name?: string;
  timings_ist?: Array<{
    batch?: string;
    morning?: string | null;
    evening?: string | null;
  }>;
};

export async function getAvailableDemoSlots(
  course?: string,
): Promise<AvailableDemoSlot[]> {
  const knowledge = await loadKnowledge();

  const courses = Object.values(knowledge.courses) as CourseData[];

  const selectedCourses = course
    ? courses.filter(
        (item) =>
          item.id?.toLowerCase() === course.toLowerCase() ||
          item.name?.toLowerCase().includes(course.toLowerCase()),
      )
    : courses;

  const slots: AvailableDemoSlot[] = [];

  for (const item of selectedCourses) {
    for (const timing of item.timings_ist ?? []) {
      if (!timing.batch?.toLowerCase().includes("demo")) {
        continue;
      }

      if (timing.morning) {
        slots.push({
          course: item.name ?? item.id ?? course ?? "Course",
          batch: timing.batch,
          session: "morning",
          time: timing.morning,
        });
      }

      if (timing.evening) {
        slots.push({
          course: item.name ?? item.id ?? course ?? "Course",
          batch: timing.batch,
          session: "evening",
          time: timing.evening,
        });
      }
    }
  }

  return slots;
}