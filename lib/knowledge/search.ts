// FILE: lib/knowledge/search.ts
//
// ─────────────────────────────────────────────────────────────────
// Knowledge-base search for the AI Assistant.
//
//   searchCourses()
//   searchCountries()
//   searchFAQ()
//   searchAll()
//
// THIS FILE DOES NOT REIMPLEMENT MATCHING LOGIC. All fuzzy-matching,
// scoring, and ranking already exists in lib/assessment/SearchEngine.ts
// — that file was explicitly built to be reused here (see its header
// comment: "Reusable for: ... AI Counsellor intent matching"). This
// file's only job is:
//
//   1. Load data/courses/*.json, data/countries/*.json, and
//      data/shared/faq.json from disk into the Searchable* shapes
//      SearchEngine.ts expects.
//   2. Cache that data in module scope (loaded once per server
//      process, not once per request — matches the TODO left in
//      app/api/chat/route.ts's searchKnowledge() stub).
//   3. Re-export four functions under the exact names requested,
//      wired to the cached data.
//
// EXPECTED JSON SHAPE (per lib/assessment/types.ts):
//
//   data/courses/*.json   — ONE course object per file:
//     { "id": "ielts", "title": "IELTS Academic", "desc": "...",
//       "tags": ["English test", "study abroad"], "url": "/test-prep/ielts-online",
//       "price": "..." }
//     If "id" is omitted, the filename (minus .json) is used.
//
//   data/countries/*.json — ONE country object per file:
//     { "id": "uk", "name": "United Kingdom", "aliases": ["UK", "Britain"],
//       "tags": ["masters", "graduate route"], "url": "/study-in/uk" }
//
//   data/shared/faq.json  — ONE array of FAQ objects:
//     [ { "id": "visa-fee-uk", "question": "...", "answer": "...",
//         "tags": ["visa", "uk"] }, ... ]
//
// This is an ASSUMPTION, not a confirmed schema — three open questions
// from an earlier turn (visa.json placement, scholarships shape,
// fill-now vs fill-later) are still unanswered. If the final shape
// differs, only the three load*() functions below need updating —
// searchCourses/searchCountries/searchFAQ/searchAll and everything
// that calls them stay the same.
//
// GRACEFUL DEGRADATION: if data/ doesn't exist yet, or individual
// files are missing/malformed, loaders return an empty array and log
// a single warning at load time — the chat pipeline keeps working,
// it just has nothing to search yet.
// ─────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

import {
  searchCourses as engineSearchCourses,
  searchCountries as engineSearchCountries,
  searchFAQs as engineSearchFAQs,
  searchAll as engineSearchAll,
  type SearchableCourse,
  type SearchableCountry,
  type SearchableFAQ,
  type SearchOptions,
  type CourseSearchResult,
  type CountrySearchResult,
  type FAQSearchResult,
  type UniversalSearchResult,
} from "@/lib/assessment/SearchEngine";

// ── DATA DIRECTORY ──────────────────────────────────────────────
// data/ lives at the project root, alongside app/, lib/, prisma/ —
// per the folder structure agreed earlier in this project.
const DATA_ROOT     = path.join(process.cwd(), "data");
const COURSES_DIR    = path.join(DATA_ROOT, "courses");
const COUNTRIES_DIR  = path.join(DATA_ROOT, "countries");
const FAQ_FILE       = path.join(DATA_ROOT, "shared", "faq.json");

// ── SAFE FILE HELPERS ────────────────────────────────────────────

function safeReadJSON<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeListJSONFiles(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

function idFromFilename(filePath: string): string {
  return path.basename(filePath, ".json");
}

// ── LOADERS (run once, cached below) ─────────────────────────────

function loadCoursesFromDisk(): SearchableCourse[] {
  const files = safeListJSONFiles(COURSES_DIR);
  if (files.length === 0) {
    console.warn(
      `[knowledge/search] No course files found in ${COURSES_DIR} — searchCourses() will return empty results until data/courses/*.json exist.`
    );
    return [];
  }

  const courses: SearchableCourse[] = [];
  for (const file of files) {
    const data = safeReadJSON<Partial<SearchableCourse>>(file);
    if (!data || !data.title) {
      console.warn(`[knowledge/search] Skipped malformed course file: ${file}`);
      continue;
    }
    courses.push({
      id:    data.id ?? idFromFilename(file),
      title: data.title,
      desc:  data.desc ?? "",
      tags:  data.tags ?? [],
      url:   data.url ?? "#",
      price: data.price,
    });
  }
  return courses;
}

function loadCountriesFromDisk(): SearchableCountry[] {
  const files = safeListJSONFiles(COUNTRIES_DIR);
  if (files.length === 0) {
    console.warn(
      `[knowledge/search] No country files found in ${COUNTRIES_DIR} — searchCountries() will return empty results until data/countries/*.json exist.`
    );
    return [];
  }

  const countries: SearchableCountry[] = [];
  for (const file of files) {
    const data = safeReadJSON<Partial<SearchableCountry>>(file);
    if (!data || !data.name) {
      console.warn(`[knowledge/search] Skipped malformed country file: ${file}`);
      continue;
    }
    countries.push({
      id:      data.id ?? idFromFilename(file),
      name:    data.name,
      aliases: data.aliases ?? [],
      tags:    data.tags ?? [],
      url:     data.url ?? "#",
    });
  }
  return countries;
}

function loadFAQsFromDisk(): SearchableFAQ[] {
  const data = safeReadJSON<Partial<SearchableFAQ>[]>(FAQ_FILE);
  if (!data) {
    console.warn(
      `[knowledge/search] ${FAQ_FILE} not found or invalid — searchFAQ() will return empty results until data/shared/faq.json exists.`
    );
    return [];
  }

  return data
    .filter((f): f is Partial<SearchableFAQ> & { question: string; answer: string } =>
      !!f.question && !!f.answer
    )
    .map((f, i) => ({
      id:       f.id ?? `faq-${i}`,
      question: f.question,
      answer:   f.answer,
      tags:     f.tags ?? [],
    }));
}

// ── MODULE-SCOPE CACHE ────────────────────────────────────────────
// Loaded once per server process (not per-request). In Next.js dev,
// file edits trigger a module re-evaluation on next request — that's
// desired, not a bug, since it means editing a JSON file is picked
// up without a full server restart during local development.
let coursesCache:   SearchableCourse[]  | null = null;
let countriesCache: SearchableCountry[] | null = null;
let faqsCache:       SearchableFAQ[]     | null = null;

function getCourses(): SearchableCourse[] {
  if (coursesCache === null) coursesCache = loadCoursesFromDisk();
  return coursesCache;
}

function getCountries(): SearchableCountry[] {
  if (countriesCache === null) countriesCache = loadCountriesFromDisk();
  return countriesCache;
}

function getFAQs(): SearchableFAQ[] {
  if (faqsCache === null) faqsCache = loadFAQsFromDisk();
  return faqsCache;
}

// ── PUBLIC API — the four requested functions ────────────────────

/**
 * searchCourses
 * ─────────────
 * Search ANU Education's course catalogue (IELTS, PTE, GRE, GMAT,
 * Duolingo, French, German, Spoken English, etc.) loaded from
 * data/courses/*.json.
 */
export function searchCourses(
  query:   string,
  options?: SearchOptions
): CourseSearchResult[] {
  return engineSearchCourses(query, getCourses(), options);
}

/**
 * searchCountries
 * ───────────────
 * Search the 9 study-abroad destinations loaded from
 * data/countries/*.json.
 */
export function searchCountries(
  query:   string,
  options?: SearchOptions
): CountrySearchResult[] {
  return engineSearchCountries(query, getCountries(), options);
}

/**
 * searchFAQ
 * ─────────
 * Search cross-cutting FAQ content loaded from data/shared/faq.json.
 * Named singular ("FAQ" not "FAQs") to match the requested API —
 * internally still calls the engine's searchFAQs() over the FAQ list.
 */
export function searchFAQ(
  query:   string,
  options?: SearchOptions
): FAQSearchResult[] {
  return engineSearchFAQs(query, getFAQs(), options);
}

/**
 * searchAll
 * ─────────
 * Universal search across courses, countries, and FAQs in one
 * ranked, interleaved list. This is what app/api/chat/route.ts's
 * searchKnowledge() step should call once data/ files exist —
 * replacing the current EMPTY_INDEX stub is then a two-line change:
 * import searchAll from here instead of lib/assessment/SearchEngine,
 * and drop the empty-index argument since this version already
 * knows where its data comes from.
 */
export function searchAll(
  query:   string,
  options?: SearchOptions
): UniversalSearchResult[] {
  return engineSearchAll(
    query,
    { courses: getCourses(), countries: getCountries(), faqs: getFAQs() },
    options
  );
}

// ── DEBUG / HEALTH-CHECK HELPER ───────────────────────────────────
// Not part of the requested four, but low-cost and useful for an
// Admin health-check view — confirms at a glance whether the
// knowledge base actually loaded anything.
export function getKnowledgeStats() {
  return {
    courses:   getCourses().length,
    countries: getCountries().length,
    faqs:      getFAQs().length,
  };
}
