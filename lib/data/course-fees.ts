// FILE: lib/data/course-fees.ts
//
// Payment-facing course fees for the pay-course page.
// Derived ONLY from the authoritative price master at lib/data/course-prices.ts.
// Do not hardcode prices here.

import { findCoursePrice, getCoursePrices } from '@/lib/data/course-prices';

export const COURSE_FEES: Record<string, number> = {
  IELTS: Math.min(...getCoursePrices('IELTS Academic').map((p) => p.price)),
  PTE: Math.min(...getCoursePrices('PTE Academic').map((p) => p.price)),
  'German A1': findCoursePrice('German', 'Basic & A1')!.price,
  'French A1': findCoursePrice('French', 'Basic & A1 (Morning / Evening)')!.price,
};