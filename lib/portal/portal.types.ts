// FILE: lib/portal/portal.types.ts
// ─────────────────────────────────────────────────────────────────
// Standardized type definitions for ANU Education Portal Provisioning
// ─────────────────────────────────────────────────────────────────

export type PortalCourseKey =
  | "ielts"
  | "pte"
  | "german"
  | "french"
  | "toefl"
  | "gre"
  | "gmat"
  | "sat"
  | "duolingo"
  | "spoken_english";

export type PortalRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  course: PortalCourseKey;
};

export type PortalErrorCode =
  | "EMAIL_EXISTS"
  | "COURSE_NOT_FOUND"
  | "INVALID_INPUT"
  | "PORTAL_TIMEOUT"
  | "REGISTRATION_FAILED"
  | "UNKNOWN_ERROR";

export type PortalRegistrationResult = {
  success: boolean;
  message: string;
  portalLogin?: string;
  portalStudentId?: string;
  portalStatus?: string;
  selectedCourse?: string;
  errorCode?: PortalErrorCode;
  errorMessage?: string;
  url?: string;
  title?: string;
};