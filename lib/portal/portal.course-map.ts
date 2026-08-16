// FILE: lib/portal/portal.course-map.ts

import type { PortalCourseKey } from "./portal.types";

const PORTAL_COURSE_MAP: Record<PortalCourseKey, string> = {
  ielts: "IELTS Academic Champion - Trial",
  pte: "PTE Academic - Trial",
  german: "German Basic to B1 - Trial",
  french: "French Basic to TEF - Trial",
  toefl: "TOEFL - iBT - Trial",
  gre: "Shorter GRE - Trial",
  gmat: "GMAT - Trial",
  sat: "Digital SAT - Trial",
  duolingo: "Duolingo English Test - Trial",
  spoken_english: "Spoken English Champion - Trial",
};

export function getPortalCourse(
  course: PortalCourseKey,
): string {
  const portalCourse = PORTAL_COURSE_MAP[course];

  if (!portalCourse) {
    throw new Error(
      `No portal course mapping found for "${course}".`,
    );
  }

  return portalCourse;
}