// FILE: tests/course-prices.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PRICE MASTER TESTS (Phase 8 data foundation)
//
// Verifies lib/data/course-prices.ts preserves every supplied
// course/program exactly, uses only the authoritative price master,
// contains no duplicates, and exposes working lookup helpers.
//
// Run: npx tsx tests/course-prices.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  COURSE_PRICES,
  CURRENCY,
  findCoursePrice,
  getCourseNames,
  getCoursePriceGroups,
  getCoursePrices,
} from "../lib/data/course-prices";

// ── Supplied price master (authoritative, do not infer/invent) ────

type SuppliedProgram = { program: string; price: number };

const SUPPLIED: Record<string, SuppliedProgram[]> = {
  "IELTS Academic": [
    { program: "Self Prep", price: 1875 },
    { program: "Champion (Morning)", price: 5250 },
    { program: "Champion (Afternoon)", price: 5250 },
    { program: "Champion (Evening)", price: 5250 },
    { program: "Champion (All Timings)", price: 6375 },
    { program: "Reading Marathon", price: 3000 },
    { program: "Writing Marathon", price: 3000 },
    { program: "Speaking Marathon", price: 3000 },
  ],
  "IELTS General": [
    { program: "Self Preparation", price: 1875 },
    { program: "Champion", price: 4125 },
    { program: "Reading Marathon", price: 3000 },
    { program: "Writing Marathon", price: 3000 },
    { program: "Speaking Marathon", price: 3000 },
  ],
  "My Career Mentor": [{ program: "Online", price: 5250 }],
  "PTE Academic": [
    { program: "Live Class", price: 1313 },
    { program: "Self Prep", price: 1875 },
    { program: "Champion", price: 3000 },
  ],
  "PTE Core": [{ program: "Mock Tests", price: 1875 }],
  "Duolingo English Test": [{ program: "Champion", price: 1875 }],
  "TOEFL iBT": [{ program: "Live Class", price: 1875 }],
  CELPIP: [
    { program: "Self Prep", price: 3000 },
    { program: "Champion", price: 5250 },
  ],
  French: [
    { program: "Basic & A1 (Morning / Evening)", price: 7500 },
    { program: "Basic & A1 (All Timings)", price: 9750 },
    { program: "Basic, A1 & A2 (Morning / Evening)", price: 12000 },
    { program: "Basic, A1 & A2 (All Timings)", price: 14250 },
    { program: "Basic, A1-B2", price: 28750 },
    { program: "A2 / B1 / B2", price: 9750 },
  ],
  German: [
    { program: "Basic & A1", price: 7500 },
    { program: "Basic, A1 & A2", price: 12000 },
    { program: "A2", price: 9750 },
  ],
  "Spoken English": [{ program: "Champion", price: 3000 }],
  "Digital SAT": [
    { program: "Live Class / Self Prep", price: 7500 },
    { program: "Champion", price: 13125 },
  ],
  "Shorter GRE": [
    { program: "Live Class / Self Prep", price: 7500 },
    { program: "Champion", price: 13125 },
  ],
  GMAT: [{ program: "Standard", price: 13125 }],
};

const EXPECTED_TOTAL = Object.values(SUPPLIED).reduce(
  (sum, programs) => sum + programs.length,
  0,
);

// ── Every supplied course/program exists ───────────────────────────

test("every supplied course/program exists in the price master", () => {
  for (const [course, programs] of Object.entries(SUPPLIED)) {
    const coursePrices = getCoursePrices(course);
    assert.equal(
      coursePrices.length,
      programs.length,
      `${course}: expected ${programs.length} programs, got ${coursePrices.length}`,
    );
    for (const { program, price } of programs) {
      const entry = findCoursePrice(course, program);
      assert.ok(entry, `${course} -> ${program} should exist`);
      assert.equal(entry!.price, price, `${course} -> ${program} price`);
    }
  }
});

test("total price entry count matches the supplied master", () => {
  assert.equal(COURSE_PRICES.length, EXPECTED_TOTAL);
  assert.equal(EXPECTED_TOTAL, 37);
  assert.equal(CURRENCY, "INR");
});

// ── Per-course price exactness ─────────────────────────────────────

test("IELTS Academic prices are correct", () => {
  const prices = getCoursePrices("IELTS Academic");
  assert.equal(prices.length, 8);
  const byProgram = new Map(prices.map((p) => [p.program, p.price]));
  assert.equal(byProgram.get("Self Prep"), 1875);
  assert.equal(byProgram.get("Champion (Morning)"), 5250);
  assert.equal(byProgram.get("Champion (Afternoon)"), 5250);
  assert.equal(byProgram.get("Champion (Evening)"), 5250);
  assert.equal(byProgram.get("Champion (All Timings)"), 6375);
  assert.equal(byProgram.get("Reading Marathon"), 3000);
  assert.equal(byProgram.get("Writing Marathon"), 3000);
  assert.equal(byProgram.get("Speaking Marathon"), 3000);
});

test("IELTS General prices are correct", () => {
  const prices = getCoursePrices("IELTS General");
  assert.equal(prices.length, 5);
  const byProgram = new Map(prices.map((p) => [p.program, p.price]));
  assert.equal(byProgram.get("Self Preparation"), 1875);
  assert.equal(byProgram.get("Champion"), 4125);
  assert.equal(byProgram.get("Reading Marathon"), 3000);
  assert.equal(byProgram.get("Writing Marathon"), 3000);
  assert.equal(byProgram.get("Speaking Marathon"), 3000);
});

test("PTE prices are correct", () => {
  const academic = getCoursePrices("PTE Academic");
  assert.equal(academic.length, 3);
  const academicMap = new Map(academic.map((p) => [p.program, p.price]));
  assert.equal(academicMap.get("Live Class"), 1313);
  assert.equal(academicMap.get("Self Prep"), 1875);
  assert.equal(academicMap.get("Champion"), 3000);

  const core = getCoursePrices("PTE Core");
  assert.equal(core.length, 1);
  assert.equal(core[0].program, "Mock Tests");
  assert.equal(core[0].price, 1875);
});

test("French prices are correct", () => {
  const prices = getCoursePrices("French");
  assert.equal(prices.length, 6);
  const byProgram = new Map(prices.map((p) => [p.program, p.price]));
  assert.equal(byProgram.get("Basic & A1 (Morning / Evening)"), 7500);
  assert.equal(byProgram.get("Basic & A1 (All Timings)"), 9750);
  assert.equal(byProgram.get("Basic, A1 & A2 (Morning / Evening)"), 12000);
  assert.equal(byProgram.get("Basic, A1 & A2 (All Timings)"), 14250);
  assert.equal(byProgram.get("Basic, A1-B2"), 28750);
  assert.equal(byProgram.get("A2 / B1 / B2"), 9750);
});

test("German prices are correct", () => {
  const prices = getCoursePrices("German");
  assert.equal(prices.length, 3);
  const byProgram = new Map(prices.map((p) => [p.program, p.price]));
  assert.equal(byProgram.get("Basic & A1"), 7500);
  assert.equal(byProgram.get("Basic, A1 & A2"), 12000);
  assert.equal(byProgram.get("A2"), 9750);
});

test("GMAT price is correct", () => {
  const prices = getCoursePrices("GMAT");
  assert.equal(prices.length, 1);
  assert.equal(prices[0].price, 13125);
  assert.equal(prices[0].validity, "8 Weeks / 90 Days");
});

// ── Integrity ──────────────────────────────────────────────────────

test("no duplicate course/program entries", () => {
  const keys = COURSE_PRICES.map((p) => `${p.course}\u0000${p.program}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("every id is unique and stable", () => {
  const ids = COURSE_PRICES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of COURSE_PRICES) {
    assert.equal(p.id, `${p.courseId}-${p.programId}`);
  }
});

test("prices are numeric and greater than 0", () => {
  for (const p of COURSE_PRICES) {
    assert.equal(typeof p.price, "number", `${p.id}: price must be a number`);
    assert.ok(Number.isFinite(p.price), `${p.id}: price must be finite`);
    assert.ok(p.price > 0, `${p.id}: price must be > 0`);
  }
});

test("validity and program are non-empty, curriculum is null or present", () => {
  for (const p of COURSE_PRICES) {
    assert.ok(p.course.length > 0, `${p.id}: course name must be non-empty`);
    assert.ok(p.program.length > 0, `${p.id}: program must be non-empty`);
    assert.ok(p.validity.length > 0, `${p.id}: validity must be non-empty`);
    assert.ok(
      p.curriculum === null || p.curriculum.length > 0,
      `${p.id}: curriculum must be null or non-empty`,
    );
  }
});

// ── Helpers ────────────────────────────────────────────────────────

test("findCoursePrice returns undefined for unknown course/program", () => {
  assert.equal(findCoursePrice("Unknown Course", "Whatever"), undefined);
  assert.equal(findCoursePrice("IELTS Academic", "Unknown Program"), undefined);
});

test("lookup helpers are case-insensitive", () => {
  const entry = findCoursePrice("ielts academic", "champion (morning)");
  assert.ok(entry);
  assert.equal(entry!.course, "IELTS Academic");
  assert.equal(getCoursePrices("french ").length, 6);
});

test("getCourseNames returns each course exactly once", () => {
  const names = getCourseNames();
  assert.equal(new Set(names).size, names.length);
  const expectedNames = Object.keys(SUPPLIED);
  assert.equal(names.length, expectedNames.length);
  for (const name of expectedNames) {
    assert.ok(names.includes(name), `should include ${name}`);
  }
});

test("getCoursePriceGroups groups entries by course", () => {
  const groups = getCoursePriceGroups();
  assert.equal(Object.keys(groups).length, getCourseNames().length);
  const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
  assert.equal(total, COURSE_PRICES.length);
  for (const [course, list] of Object.entries(groups)) {
    assert.equal(list.length, SUPPLIED[course].length, `${course} group size`);
  }
});

test("My Career Mentor, CELPIP, Digital SAT, IELTS General and PTE Core exist once each", () => {
  for (const course of ["My Career Mentor", "CELPIP", "Digital SAT", "IELTS General", "PTE Core"]) {
    assert.equal(getCoursePrices(course).length, SUPPLIED[course].length, `${course} count`);
  }
});