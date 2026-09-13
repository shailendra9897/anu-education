// FILE: lib/portal/portal.course-map.ts

import type { PortalCourseKey } from "./portal.types";

/**
 * normalizePortalCourse — tolerant fuzzy course → canonical portal
 * course key. Exact canonical / recognized-language matches fold to a
 * single PortalCourseKey (German ↔ Goethe, French ↔ TEF/TCF). Throws
 * when the input matches no known course ("German A1", garbage).
 */
export function normalizePortalCourse(
  course?: string | null,
): PortalCourseKey {
  const value = (course ?? "").trim().toLowerCase();

  if (value.includes("ielts")) return "ielts";
  if (value.includes("pte")) return "pte";
  if (value.includes("german")) return "german";
  if (value.includes("french")) return "french";
  if (value.includes("toefl")) return "toefl";
  if (value.includes("gre")) return "gre";
  if (value.includes("gmat")) return "gmat";
  if (value.includes("sat")) return "sat";
  if (value.includes("duolingo")) return "duolingo";
  if (value.includes("spoken english") || value.includes("spoken")) {
    return "spoken_english";
  }

  throw new Error(`No portal course mapping found for "${course ?? ""}".`);
}

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