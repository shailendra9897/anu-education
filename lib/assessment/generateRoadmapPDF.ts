import { jsPDF } from "jspdf";
import type { AssessmentResult } from "./scoreEngine";

interface RoadmapStudent {
  name: string;
  phone?: string;
  email?: string;
}

export function generateRoadmapPDF(
  student: RoadmapStudent,
  result: AssessmentResult
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  const checkPage = (needed = 20) => {
    if (y + needed > 275) {
      pdf.addPage();
      y = 20;
    }
  };

  const heading = (text: string) => {
    checkPage(18);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(15, 27, 76);

    pdf.text(text, margin, y);

    y += 9;
  };

  const paragraph = (text: string) => {
    if (!text) return;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(70, 70, 70);

    const lines = pdf.splitTextToSize(text, contentWidth);

    checkPage(lines.length * 5 + 5);

    pdf.text(lines, margin, y);

    y += lines.length * 5 + 4;
  };

  const item = (text: string) => {
    if (!text) return;

    checkPage(10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);

    const lines = pdf.splitTextToSize(
      `• ${text}`,
      contentWidth
    );

    pdf.text(lines, margin, y);

    y += lines.length * 5 + 2;
  };

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────

  pdf.setFillColor(15, 27, 76);

  pdf.rect(
    0,
    0,
    pageWidth,
    58,
    "F"
  );

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);

  pdf.text(
    "ANU EDUCATION",
    pageWidth / 2,
    19,
    { align: "center" }
  );

  pdf.setFontSize(17);

  pdf.text(
    "Study Abroad Readiness Roadmap",
    pageWidth / 2,
    30,
    { align: "center" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Personalised Assessment Report",
    pageWidth / 2,
    39,
    { align: "center" }
  );

  pdf.setTextColor(110, 231, 183);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text(
    "Study Beyond Borders",
    pageWidth / 2,
    48,
    { align: "center" }
  );

  y = 70;

  // ─────────────────────────────────────────────
  // STUDENT
  // ─────────────────────────────────────────────

  heading("Student Profile");

  paragraph(`Name: ${student.name}`);

  if (student.email) {
    paragraph(`Email: ${student.email}`);
  }

  if (student.phone) {
    paragraph(`Phone: ${student.phone}`);
  }

  // ─────────────────────────────────────────────
  // SCORE
  // ─────────────────────────────────────────────

  y += 3;

  heading("Your Study Abroad Readiness Score");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(22, 163, 74);

  pdf.text(
    `${result.score}/100`,
    margin,
    y
  );

  y += 10;

  pdf.setFontSize(12);
  pdf.setTextColor(15, 27, 76);

  pdf.text(
    `Readiness Level: ${result.tier}`,
    margin,
    y
  );

  y += 12;

  // ─────────────────────────────────────────────
  // BREAKDOWN
  // ─────────────────────────────────────────────

  heading("Readiness Breakdown");

  const breakdown = result.breakdown;

  item(`Academic Profile: ${breakdown.academic}/30`);
  item(`English Readiness: ${breakdown.english}/25`);
  item(`Financial Readiness: ${breakdown.budget}/15`);
  item(`Application Timeline: ${breakdown.timeline}/15`);
  item(`Document Readiness: ${breakdown.documents}/10`);
  item(`Destination Clarity: ${breakdown.destination}/5`);

  if (breakdown.penalty > 0) {
    item(`Backlog adjustment: -${breakdown.penalty}`);
  }

  y += 4;

  // ─────────────────────────────────────────────
// COUNTRIES
// ─────────────────────────────────────────────

heading("Your Recommended Countries");

const recommendedCountries = Array.isArray(result.topCountries)
  ? result.topCountries
  : [];

if (recommendedCountries.length > 0) {
  recommendedCountries.slice(0, 3).forEach((country, index) => {
    checkPage(20);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 27, 76);

    pdf.text(
      `${index + 1}. ${country}`,
      margin,
      y
    );

    y += 8;
  });
} else {
  paragraph(
    "Your personalised country recommendations will be discussed during your free counselling session."
  );
}

y += 4;
  // ─────────────────────────────────────────────
// STRENGTHS
// ─────────────────────────────────────────────

heading("Your Strengths");

const strengthItems: string[] = [];

if (result.breakdown.academic >= 20) {
  strengthItems.push("Strong academic readiness");
}

if (result.breakdown.english >= 15) {
  strengthItems.push("Good English language readiness");
}

if (result.breakdown.budget >= 10) {
  strengthItems.push("Good financial preparation");
}

if (result.breakdown.timeline >= 10) {
  strengthItems.push("Good application timeline planning");
}

if (result.breakdown.documents >= 7) {
  strengthItems.push("Good document readiness");
}

if (result.breakdown.destination >= 3) {
  strengthItems.push("Clear study destination planning");
}

if (strengthItems.length > 0) {
  strengthItems.forEach((strength) => {
    item(strength);
  });
} else {
  item("You have started building your study abroad profile.");
}

y += 4;

  // ─────────────────────────────────────────────
// AREAS TO IMPROVE
// ─────────────────────────────────────────────

heading("Areas to Improve");

const improvementItems: string[] = [];

if (result.breakdown.academic < 20) {
  improvementItems.push(
    "Strengthen your academic profile and shortlist universities that match your eligibility."
  );
}

if (result.breakdown.english < 15) {
  improvementItems.push(
    "Improve your English proficiency through IELTS, PTE, TOEFL or Duolingo preparation."
  );
}

if (result.breakdown.budget < 10) {
  improvementItems.push(
    "Review your study budget, scholarship opportunities and education loan options."
  );
}

if (result.breakdown.timeline < 10) {
  improvementItems.push(
    "Start your application preparation earlier to avoid missing important intake deadlines."
  );
}

if (result.breakdown.documents < 7) {
  improvementItems.push(
    "Complete your academic, financial and application documents as early as possible."
  );
}

if (result.breakdown.destination < 3) {
  improvementItems.push(
    "Shortlist suitable study destinations based on your academics, budget and career goals."
  );
}

if (improvementItems.length > 0) {
  improvementItems.forEach((improvement) => {
    item(improvement);
  });
} else {
  item(
    "Your overall profile is well prepared. Focus on maintaining your readiness and starting your applications."
  );
}

y += 4;

  // ─────────────────────────────────────────────
// ACTION PLAN
// ─────────────────────────────────────────────

heading("Your Personalised Action Plan");

const actionSteps: string[] = [];

// English preparation
if (result.breakdown.english < 15) {
  actionSteps.push(
    "Prepare for IELTS, PTE, TOEFL or Duolingo and achieve the required English score."
  );
}

// Country shortlisting
if (result.topCountries?.length) {
  actionSteps.push(
    `Shortlist universities in ${result.topCountries
      .slice(0, 3)
      .join(", ")} based on your profile and budget.`
  );
} else {
  actionSteps.push(
    "Shortlist suitable study destinations based on your academic profile, budget and career goals."
  );
}

// Documents
if (result.breakdown.documents < 7) {
  actionSteps.push(
    "Prepare academic transcripts, passport, SOP, LORs and other required application documents."
  );
}

// Financial planning
if (result.breakdown.budget < 10) {
  actionSteps.push(
    "Create a financial plan and explore scholarships, education loans and funding options."
  );
}

// Timeline
if (result.breakdown.timeline < 10) {
  actionSteps.push(
    "Create an application timeline for university deadlines, visa processing and your preferred intake."
  );
}

// Always include application step
actionSteps.push(
  "Finalise your university shortlist and begin applications with expert guidance."
);

// Use engine-generated next step if available
if (result.nextStep) {
  actionSteps.push(result.nextStep);
}

// Render
actionSteps.slice(0, 6).forEach((action, index) => {
  item(`Step ${index + 1}: ${action}`);
});

y += 4;

  // ─────────────────────────────────────────────
  // NEXT STEP
  // ─────────────────────────────────────────────

  if (result.nextStep) {
    y += 4;

    heading("Recommended Next Step");

    paragraph(result.nextStep);
  }

  // ─────────────────────────────────────────────
  // CTA
  // ─────────────────────────────────────────────

  checkPage(45);

  y += 5;

  pdf.setFillColor(240, 253, 250);

  pdf.roundedRect(
    margin,
    y,
    contentWidth,
    37,
    4,
    4,
    "F"
  );

  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(15, 27, 76);

  pdf.text(
    "Ready to Start Your Study Abroad Journey?",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Book your FREE counselling session with ANU Education.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 7;

  pdf.setTextColor(37, 99, 235);

  pdf.text(
    "www.anuedu.in",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // ─────────────────────────────────────────────
  // FOOTERS
  // ─────────────────────────────────────────────

  const pages = pdf.getNumberOfPages();

  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);

    pdf.text(
      `ANU Education • Personalised Study Abroad Roadmap • Page ${page}/${pages}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  // Safe filename
  const safeName =
    student.name
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "Student";

  pdf.save(
    `${safeName}-ANU-Study-Abroad-Roadmap.pdf`
  );
}