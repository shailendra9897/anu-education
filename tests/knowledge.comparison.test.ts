// FILE: tests/knowledge.comparison.test.ts
//
// ─────────────────────────────────────────────────────────────────
// OLD JSON vs NEW MARKDOWN RETRIEVAL COMPARISON
//
// Compares the production JSON knowledge retrieval
// (knowledge.loader.ts + knowledge.service.ts) with the new
// Markdown knowledge retrieval (md-loader.ts + md-retriever.ts).
//
// NO external API calls. Pure local comparison.
//
// Run: npx tsx tests/knowledge.comparison.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// ── OLD SYSTEM IMPORTS ─────────────────────────────────────────
import { loadKnowledge, getKnowledgeForPrompt } from "../lib/knowledge/knowledge.loader";
import { searchKnowledge } from "../lib/knowledge/knowledge.service";

// ── NEW SYSTEM IMPORTS ─────────────────────────────────────────
import { loadMarkdownKnowledge } from "../lib/knowledge/md-loader";
import { retrieveKnowledge } from "../lib/knowledge/md-retriever";
import type { KnowledgeDoc, KnowledgeRetrievalResult } from "../lib/knowledge/types";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

// ── Types ──────────────────────────────────────────────────────

type ComparisonResult = {
  query: string;
  oldDocs: Array<{ id: string; collection: string; fileName: string; score: number }>;
  newDocs: Array<{ title: string; relPath: string; score: number; status: string }>;
  oldTopTitle: string | null;
  newTopTitle: string | null;
  missingFromNew: string[];
  missingFromOld: string[];
  statusDiff: string[];
  pricingDiff: string[];
  timingDiff: string[];
  verdict: "PASS" | "REVIEW";
  notes: string[];
};

// ── Helper: Extract key facts from old system JSON ─────────────

function extractOldFacts(data: Record<string, unknown>): string[] {
  const facts: string[] = [];
  const str = JSON.stringify(data);

  // Extract pricing info
  const priceMatch = str.match(/"(?:price|fee|cost|amount)":\s*"?(\d+[\d,]*)"?/gi);
  if (priceMatch) {
    facts.push(`pricing: ${priceMatch.slice(0, 3).join(", ")}`);
  }

  // Extract timing info
  const timingKeys = ["timings", "schedule", "batch", "demo", "morning", "evening", "slot"];
  for (const key of timingKeys) {
    const regex = new RegExp(`"${key}"[^}]{0,100}`, "gi");
    const matches = str.match(regex);
    if (matches) {
      facts.push(`${key}: ${matches[0].slice(0, 80)}`);
    }
  }

  // Extract status
  const statusMatch = str.match(/"status":\s*"([^"]+)"/);
  if (statusMatch) {
    facts.push(`status: ${statusMatch[1]}`);
  }

  // Extract demo availability
  const demoMatch = str.match(/"demo[^"]*":\s*(true|false|"[^"]*")/i);
  if (demoMatch) {
    facts.push(`demo: ${demoMatch[0]}`);
  }

  return facts;
}

// ── Helper: Extract key facts from new system Markdown ─────────

function extractNewFacts(doc: KnowledgeDoc): string[] {
  const facts: string[] = [];

  // Structured pricing
  if (doc.meta.pricing && doc.meta.pricing.length > 0) {
    const packs = doc.meta.pricing
      .filter(p => p.price !== null)
      .map(p => `${p.name}: ₹${p.price}`)
      .slice(0, 3);
    if (packs.length > 0) {
      facts.push(`pricing: ${packs.join(", ")}`);
    }
  }

  // Structured batch schedule
  if (doc.meta.batch_schedule && doc.meta.batch_schedule.length > 0) {
    const slots = doc.meta.batch_schedule
      .map(s => `${s.label || s.day}: ${s.start}-${s.end}`)
      .slice(0, 3);
    facts.push(`batch_schedule: ${slots.join(", ")}`);
  }

  // Structured demo schedule
  if (doc.meta.demo_schedule && doc.meta.demo_schedule.length > 0) {
    const slots = doc.meta.demo_schedule
      .map(s => `${s.label || s.day}: ${s.start}-${s.end}`)
      .slice(0, 2);
    facts.push(`demo_schedule: ${slots.join(", ")}`);
  }

  // Legacy scalar timings
  if (doc.meta.batch_timings) {
    facts.push(`batch_timings: ${doc.meta.batch_timings.slice(0, 80)}`);
  }
  if (doc.meta.demo_timings) {
    facts.push(`demo_timings: ${doc.meta.demo_timings.slice(0, 80)}`);
  }

  // Status and availability
  facts.push(`status: ${doc.meta.status}`);
  if (doc.meta.availability) {
    facts.push(`availability: ${doc.meta.availability}`);
  }
  if (doc.meta.demo_available !== null && doc.meta.demo_available !== undefined) {
    facts.push(`demo_available: ${doc.meta.demo_available}`);
  }

  // Extract key facts from body text (visa fees, amounts, etc.)
  const bodyText = doc.normalizedBody;

  // Look for fee/amount patterns
  const feeMatches = bodyText.match(/(?:fee|cost|amount|price|usd|inr|₹|\$)\s*[:=]?\s*[\d,]+/gi);
  if (feeMatches) {
    facts.push(`body_fees: ${feeMatches.slice(0, 3).join(", ")}`);
  }

  // Look for timing patterns
  const timingMatches = bodyText.match(/\d{1,2}:\d{2}\s*(?:am|pm)\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)/gi);
  if (timingMatches) {
    facts.push(`body_timings: ${timingMatches.slice(0, 3).join(", ")}`);
  }

  // Look for visa-related info
  if (bodyText.includes("visa")) {
    const visaSnippet = bodyText.slice(
      Math.max(0, bodyText.indexOf("visa") - 30),
      bodyText.indexOf("visa") + 50
    );
    facts.push(`visa_info: ...${visaSnippet.trim()}...`);
  }

  return facts;
}

// ── Compare two arrays for overlap ─────────────────────────────

function findMissing(oldItems: string[], newItems: string[]): string[] {
  const missing: string[] = [];
  for (const item of oldItems) {
    // Check if any new item contains key parts of old item
    const keyPart = item.split(":")[0]?.trim();
    if (keyPart && !newItems.some(ni => ni.toLowerCase().includes(keyPart.toLowerCase()))) {
      missing.push(item);
    }
  }
  return missing;
}

// ── THE 28 REPRESENTATIVE QUERIES ──────────────────────────────

const QUERIES = [
  "IELTS fees",
  "IELTS batch timings",
  "PTE fees",
  "PTE demo class",
  "GRE fees and batches",
  "French classes",
  "German classes",
  "Spoken English classes",
  "Duolingo English Test",
  "USA study visa",
  "Canada study visa",
  "UK study visa",
  "Australia study visa",
  "France study visa",
  "Germany study visa",
  "Ireland study visa",
  "New Zealand study visa",
  "Dubai study visa",
  "MBBS abroad",
  "ANU Education pricing",
  "demo class",
  "IELTS course",
  "PTE course",
  "GMAT",
  "SAT",
  "TOEFL",
  "visa fees",
  "contact ANU Education",
];

// ── MAIN COMPARISON TEST ───────────────────────────────────────

test("OLD vs NEW knowledge retrieval comparison", async () => {
  // Load both systems
  const oldKnowledge = await loadKnowledge({ refresh: true });
  const newKnowledge = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  console.log("\n" + "═".repeat(80));
  console.log("KNOWLEDGE RETRIEVAL COMPARISON REPORT");
  console.log("═".repeat(80));
  console.log(`Old system: ${oldKnowledge.documents.length} documents`);
  console.log(`New system: ${newKnowledge.docs.length} documents`);
  console.log("═".repeat(80) + "\n");

  const results: ComparisonResult[] = [];

  for (const query of QUERIES) {
    const result: ComparisonResult = {
      query,
      oldDocs: [],
      newDocs: [],
      oldTopTitle: null,
      newTopTitle: null,
      missingFromNew: [],
      missingFromOld: [],
      statusDiff: [],
      pricingDiff: [],
      timingDiff: [],
      verdict: "PASS",
      notes: [],
    };

    // ── OLD SYSTEM RETRIEVAL ──────────────────────────────────
    const oldResults = await searchKnowledge(query, { limit: 6 });
    result.oldDocs = oldResults.map(r => ({
      id: r.id,
      collection: r.collection,
      fileName: r.fileName,
      score: r.score,
    }));

    if (oldResults.length > 0) {
      result.oldTopTitle = oldResults[0].id;
    }

    // Extract facts from old top result
    const oldFacts = oldResults.length > 0
      ? extractOldFacts(oldResults[0].data as Record<string, unknown>)
      : [];

    // ── NEW SYSTEM RETRIEVAL ──────────────────────────────────
    const newResults = await retrieveKnowledge(query, {
      knowledgeDir: KNOWLEDGE_DIR,
      limit: 5,
    });

    if ("kind" in newResults) {
      // No match
      result.newTopTitle = null;
    } else {
      result.newDocs = newResults.map(r => ({
        title: r.doc.meta.title,
        relPath: r.doc.relPath,
        score: r.score,
        status: r.doc.meta.status,
      }));

      if (newResults.length > 0) {
        result.newTopTitle = newResults[0].doc.meta.title;
      }
    }

    // Extract facts from new top result
    const newFacts = (!("kind" in newResults) && newResults.length > 0)
      ? extractNewFacts(newResults[0].doc)
      : [];

    // ── COMPARE TOP TITLES ────────────────────────────────────
    const oldTopNorm = result.oldTopTitle?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
    const newTopNorm = result.newTopTitle?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

    if (oldTopNorm && newTopNorm && oldTopNorm === newTopNorm) {
      result.notes.push("Same top document");
    } else if (oldTopNorm && newTopNorm) {
      // Check for partial match
      const oldWords = oldTopNorm.split("").filter(w => w.length > 3);
      const newWords = newTopNorm.split("").filter(w => w.length > 3);
      const overlap = oldWords.filter(w => newWords.includes(w));
      if (overlap.length > 0) {
        result.notes.push(`Different top docs but related: "${result.oldTopTitle}" vs "${result.newTopTitle}"`);
      } else {
        // Check if new system's top doc is more specific (better)
        const newTopIsSpecific = newResults && !("kind" in newResults) &&
          newResults.length > 0 &&
          (newResults[0].doc.relPath.includes("courses/") ||
           newResults[0].doc.relPath.includes("admissions/"));
        if (newTopIsSpecific) {
          result.notes.push(`New system prefers specific doc: "${result.newTopTitle}" (better ranking)`);
        } else {
          result.notes.push(`DIFFERENT top docs: "${result.oldTopTitle}" vs "${result.newTopTitle}"`);
          result.verdict = "REVIEW";
        }
      }
    }

    // ── COMPARE FACTS ─────────────────────────────────────────
    result.missingFromNew = findMissing(oldFacts, newFacts);
    result.missingFromOld = findMissing(newFacts, oldFacts);

    // Check for critical missing info
    if (result.missingFromNew.length > 0) {
      const criticalMissing = result.missingFromNew.filter(f =>
        f.includes("pricing") || f.includes("fee") || f.includes("batch") || f.includes("demo")
      );
      if (criticalMissing.length > 0) {
        result.notes.push(`CRITICAL: New system missing: ${criticalMissing.join("; ")}`);
        result.verdict = "REVIEW";
      }
    }

    // Check status differences
    const oldStatus = oldResults.length > 0
      ? (oldResults[0].data as Record<string, unknown>).status
      : null;
    const newStatus = (!("kind" in newResults) && newResults.length > 0)
      ? newResults[0].doc.meta.status
      : null;

    if (oldStatus && newStatus && oldStatus !== newStatus) {
      result.statusDiff.push(`Old: ${oldStatus}, New: ${newStatus}`);
      result.verdict = "REVIEW";
    }

    results.push(result);
  }

  // ── PRINT DETAILED REPORT ─────────────────────────────────────

  for (const r of results) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`QUERY: "${r.query}"`);
    console.log(`${"─".repeat(70)}`);

    console.log("\n  OLD SYSTEM (JSON):");
    if (r.oldDocs.length === 0) {
      console.log("    (no results)");
    } else {
      for (const d of r.oldDocs.slice(0, 3)) {
        console.log(`    [${d.collection}/${d.fileName}] score=${d.score}`);
      }
    }

    console.log("\n  NEW SYSTEM (Markdown):");
    if (r.newDocs.length === 0) {
      console.log("    (no results)");
    } else {
      for (const d of r.newDocs.slice(0, 3)) {
        console.log(`    [${d.title}] (${d.relPath}) score=${d.score} status=${d.status}`);
      }
    }

    console.log(`\n  VERDICT: ${r.verdict}`);

    if (r.notes.length > 0) {
      console.log("  NOTES:");
      for (const n of r.notes) {
        console.log(`    - ${n}`);
      }
    }

    if (r.missingFromNew.length > 0) {
      console.log("  MISSING FROM NEW (present in old):");
      for (const m of r.missingFromNew.slice(0, 3)) {
        console.log(`    - ${m}`);
      }
    }

    if (r.missingFromOld.length > 0) {
      console.log("  MISSING FROM OLD (present in new):");
      for (const m of r.missingFromOld.slice(0, 3)) {
        console.log(`    - ${m}`);
      }
    }

    if (r.statusDiff.length > 0) {
      console.log("  STATUS DIFF:");
      for (const s of r.statusDiff) {
        console.log(`    - ${s}`);
      }
    }
  }

  // ── PRINT SUMMARY ──────────────────────────────────────────────

  const passed = results.filter(r => r.verdict === "PASS").length;
  const reviewed = results.filter(r => r.verdict === "REVIEW").length;

  console.log("\n\n" + "═".repeat(80));
  console.log("SUMMARY");
  console.log("═".repeat(80));
  console.log(`Queries tested: ${results.length}`);
  console.log(`PASS: ${passed}`);
  console.log(`REVIEW: ${reviewed}`);
  console.log("═".repeat(80));

  // ── CRITICAL DISCREPANCIES ────────────────────────────────────

  const critical = results.filter(r =>
    r.notes.some(n => n.includes("CRITICAL"))
  );

  if (critical.length > 0) {
    console.log("\n⚠️  CRITICAL DISCREPANCIES:");
    for (const r of critical) {
      console.log(`  - "${r.query}": ${r.notes.filter(n => n.includes("CRITICAL")).join("; ")}`);
    }
  }

  // ── NEW SYSTEM ADVANTAGES ──────────────────────────────────────

  const newAdvantages = results.filter(r =>
    r.missingFromOld.length > 0 && r.missingFromOld.some(m =>
      m.includes("structured") || m.includes("schedule") || m.includes("pricing")
    )
  );

  if (newAdvantages.length > 0) {
    console.log("\n✅ NEW SYSTEM HAS MORE DATA:");
    for (const r of newAdvantages) {
      console.log(`  - "${r.query}": ${r.missingFromOld.join("; ")}`);
    }
  }

  // ── VERDICT ON PRODUCTION READINESS ────────────────────────────

  console.log("\n" + "═".repeat(80));
  console.log("PRODUCTION READINESS ASSESSMENT");
  console.log("═".repeat(80));

  if (reviewed === 0) {
    console.log("✅ New system is equivalent to old system for all queries.");
    console.log("   Safe to connect to prompt.service.ts");
  } else if (reviewed <= 3) {
    console.log("⚠️  New system has minor gaps in " + reviewed + " queries.");
    console.log("   Review the flagged queries before connecting to production.");
  } else {
    console.log("❌ New system has significant gaps in " + reviewed + " queries.");
    console.log("   DO NOT connect to production until gaps are addressed.");
  }

  console.log("═".repeat(80) + "\n");

  // The test always passes — this is an audit, not a gate
  assert.ok(true, "Comparison audit completed");
});
