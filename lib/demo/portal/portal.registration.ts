import { chromium } from "playwright";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

import type {
  PortalRegistrationInput,
  PortalRegistrationResult,
} from "@/lib/portal/portal.types";

import {
  getPortalCourse,
} from "@/lib/portal/portal.course-map";

import {
  getPortalPassword,
  getPortalRegistrationDebugEnabled,
} from "@/lib/portal/portal.config";

const PORTAL_URL = "https://study.anuedu.in/register";

// ── CONFIG-DERIVED, TESTABLE PURE HELPERS ─────────────────────────

/**
 * resolvePortalPassword
 * ────────────────────────
 * Deterministic password resolution. An explicitly supplied password
 * wins; otherwise the environment-configured PORTAL_PASSWORD is used;
 * otherwise null (safe-fail). Calling code must abort the registration
 * when this returns null — never fall back to a hardcoded secret.
 */
export function resolvePortalPassword(
  explicit?: string | null,
): string | null {
  const direct = explicit?.trim();
  if (direct) return direct;
  return getPortalPassword();
}

/**
 * Whether OPT-IN diagnostic screenshots are captured for a run. Default
 * is OFF so routine production registration writes zero artifacts.
 */
export function portalScreenshotsEnabled(): boolean {
  return getPortalRegistrationDebugEnabled();
}

/**
 * Safe diagnostic destination for opt-in screenshots. Uses the OS temp
 * directory (never the repository) and a per-process subfolder so any
 * captured artifact is clearly transient and outside the repo.
 */
export function resolveScreenshotDir(): string {
  return join(tmpdir(), "anu-portal-debug");
}

/**
 * Deterministic, PII-free persisted error message for an error code.
 * Never includes raw portal body text, student fields, or credentials.
 */
export function buildRegistrationErrorMessage(
  errorCode: PortalRegistrationResult["errorCode"],
): string {
  switch (errorCode) {
    case "EMAIL_EXISTS":
      return "The portal reports that this email address already exists.";
    case "COURSE_NOT_FOUND":
      return "The requested course was not found on the portal.";
    case "INVALID_INPUT":
      return "Required registration input is missing or invalid.";
    case "PORTAL_TIMEOUT":
      return "The portal registration request timed out.";
    case "CONFIGURATION":
      return "Portal registration is not configured.";
    case "REGISTRATION_FAILED":
      return "Portal registration failed. Please inspect the portal response.";
    case "UNKNOWN_ERROR":
    default:
      return "Portal registration failed with an unknown error.";
  }
}

/**
 * classifyPortalError
 * ────────────────────
 * Maps a caught exception into a deterministic, non-PII error category.
 * Preserves the timeouts / registration-failure distinction.
 */
export function classifyPortalError(
  message: string,
): "PORTAL_TIMEOUT" | "REGISTRATION_FAILED" | "UNKNOWN_ERROR" {
  const lower = message.toLowerCase();
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "PORTAL_TIMEOUT";
  }
  if (lower.includes("register") || lower.includes("registration")) {
    return "REGISTRATION_FAILED";
  }
  return "UNKNOWN_ERROR";
}

// ── MAIN FLOW ─────────────────────────────────────────────────────

export async function registerStudentOnPortal(
  input: PortalRegistrationInput,
): Promise<PortalRegistrationResult> {
  // Safe-fail: without an explicit password or configured PORTAL_PASSWORD
  // we refuse to run, before launching a browser or touching the portal.
  const password = resolvePortalPassword(input.password);
  if (password === null) {
    return {
      success: false,
      message: "Portal registration is not configured (missing password).",
      errorCode: "CONFIGURATION",
      errorMessage: buildRegistrationErrorMessage("CONFIGURATION"),
    };
  }

  const screenshotsEnabled = portalScreenshotsEnabled();
  const screenshotDir = screenshotsEnabled ? resolveScreenshotDir() : null;
  if (screenshotsEnabled) mkdirSync(screenshotDir!, { recursive: true });

  // Diagnostic screenshots are captured via exception-safe helper that
  // never includes password/auth/session content; it only runs when
  // PORTAL_REGISTRATION_DEBUG is enabled.
  async function capture(page: import("playwright").Page, name: string) {
    if (!screenshotsEnabled || !screenshotDir) return;
    try {
      await page.screenshot({
        path: join(screenshotDir, name),
        fullPage: true,
      });
    } catch {
      // Diagnostics must never break registration.
    }
  }

  const browser = await chromium.launch({
    headless: process.env.NODE_ENV === "production",
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900,
      },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    console.log("[PORTAL] Registration attempt started");

    // ============================================================
    // OPEN REGISTRATION
    // ============================================================

    await page.goto(PORTAL_URL, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(3000);

    // ============================================================
    // VALIDATE INPUT
    // ============================================================

    if (!input.name.trim()) {
      return {
        success: false,
        message: "Student name is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: buildRegistrationErrorMessage("INVALID_INPUT"),
        url: page.url(),
        title: await page.title(),
      };
    }

    if (!input.email.trim()) {
      return {
        success: false,
        message: "Student email is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: buildRegistrationErrorMessage("INVALID_INPUT"),
        url: page.url(),
        title: await page.title(),
      };
    }

    if (!input.phone.trim()) {
      return {
        success: false,
        message: "Student phone is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: buildRegistrationErrorMessage("INVALID_INPUT"),
        url: page.url(),
        title: await page.title(),
      };
    }

    // ============================================================
    // COURSE MAPPING
    // ============================================================

    let portalCourse: string;

    try {
      portalCourse = getPortalCourse(input.course);
    } catch {
      return {
        success: false,
        message: "Cancelled: the requested course is not available.",
        errorCode: "COURSE_NOT_FOUND",
        errorMessage: buildRegistrationErrorMessage("COURSE_NOT_FOUND"),
        url: page.url(),
        title: await page.title(),
      };
    }

    console.log("[PORTAL] Requested course:", input.course);

    // ============================================================
    // FILL REGISTRATION FORM
    // ============================================================

    await page.locator('input[name="name"]').fill(input.name);
    await page.locator('input[name="emailId"]').fill(input.email);
    await page.locator('input[name="mobileNumber"]').fill(input.phone);
    await page.locator('input[name="password"]').fill(password);

    // ============================================================
    // CONTINUE
    // ============================================================

    console.log("[PORTAL] Submitting registration form...");

    await page
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    await page.waitForTimeout(3000);

    const afterContinueBody = await page.locator("body").innerText();
    await capture(page, "portal-after-continue.png");

    // ============================================================
    // CHECK FOR REGISTRATION ERROR AFTER CONTINUE
    // ============================================================

    if (
      /already exists|email.*exist|already registered/i.test(
        afterContinueBody,
      )
    ) {
      return {
        success: false,
        message: "Cancelled: email address already exists on the portal.",
        errorCode: "EMAIL_EXISTS",
        errorMessage: buildRegistrationErrorMessage("EMAIL_EXISTS"),
        url: page.url(),
        title: await page.title(),
      };
    }

    // ============================================================
    // COURSE SELECTION
    // ============================================================

    const courseChip = page
      .locator(".course-chip")
      .filter({ hasText: portalCourse });

    if ((await courseChip.count()) === 0) {
      return {
        success: false,
        message: "Cancelled: the requested course was not found on the portal.",
        errorCode: "COURSE_NOT_FOUND",
        errorMessage: buildRegistrationErrorMessage("COURSE_NOT_FOUND"),
        url: page.url(),
        title: await page.title(),
      };
    }

    await courseChip.first().click();
    await page.waitForTimeout(500);

    const selectedProduct = page.locator('input[name="selectedProduct"]');
    const selectedValue = await selectedProduct.inputValue();

    if (!selectedValue) {
      return {
        success: false,
        message: "Cancelled: the portal did not accept the course selection.",
        errorCode: "COURSE_NOT_FOUND",
        errorMessage: buildRegistrationErrorMessage("COURSE_NOT_FOUND"),
        url: page.url(),
        title: await page.title(),
      };
    }

    await capture(page, "portal-course-selection.png");

    // ============================================================
    // REGISTER
    // ============================================================

    console.log("[PORTAL] Submitting registration...");

    const registerButton = page.getByRole("button", {
      name: "Register",
      exact: true,
    });

    if ((await registerButton.count()) !== 1) {
      return {
        success: false,
        message: "Portal registration failed.",
        errorCode: "REGISTRATION_FAILED",
        errorMessage: buildRegistrationErrorMessage("REGISTRATION_FAILED"),
        url: page.url(),
        title: await page.title(),
      };
    }

    await registerButton.click();
    await page.waitForTimeout(5000);

    const bodyText = await page.locator("body").innerText();
    const currentUrl = page.url();
    const title = await page.title();

    await capture(page, "portal-after-register.png");

    // ============================================================
    // EMAIL EXISTS
    // ============================================================

    if (
      /already exists|email.*exist|already registered/i.test(bodyText)
    ) {
      return {
        success: false,
        message: "Cancelled: email address already exists on the portal.",
        errorCode: "EMAIL_EXISTS",
        errorMessage: buildRegistrationErrorMessage("EMAIL_EXISTS"),
        url: currentUrl,
        title,
      };
    }

    // ============================================================
    // GENERIC REGISTRATION FAILURE
    // ============================================================

    if (
      /error|failed|invalid|unable to register|registration failed/i.test(
        bodyText,
      )
    ) {
      return {
        success: false,
        message: "Portal registration failed. Please inspect the portal response.",
        errorCode: "REGISTRATION_FAILED",
        errorMessage: buildRegistrationErrorMessage("REGISTRATION_FAILED"),
        url: currentUrl,
        title,
      };
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    console.log("[PORTAL] Registration completed");

    return {
      success: true,
      message:
        `Registration completed successfully for course "${portalCourse}".`,
      portalLogin: input.email,
      // We deliberately do NOT invent a portalStudentId or a login/
      // activation status. "Awaiting Approval" describes the portal's
      // registration disposition only — never a login signal.
      portalStatus: "Awaiting Approval",
      selectedCourse: portalCourse,
      url: currentUrl,
      title,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown portal registration error.";
    const errorCode = classifyPortalError(message);

    let diag = "";
    try {
      const { execFileSync } = await import("child_process");
      const bin =
        "/var/task/node_modules/playwright-core/.local-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell";
      diag =
        "\n\n[LDD]\n" +
        execFileSync("ldd", [bin], {
          encoding: "utf8",
          timeout: 30000,
          stdio: ["ignore", "pipe", "pipe"],
        })
          .toString()
          .slice(0, 2500);
    } catch (e) {
      diag =
        "\n\n[LDD-ERR]\n" +
        (e instanceof Error ? e.message : String(e)).slice(0, 1000);
      diag += e instanceof Error && "stdout" in (e as any) ? "\n" + (e as any).stdout : "";
    }

    console.error(
      `[PORTAL] Registration diagnostic error (${errorCode})`,
    );

    return {
      success: false,
      message: `Portal registration failed (${errorCode}).`,
      errorCode,
      errorMessage: buildRegistrationErrorMessage(errorCode) + diag,
    };
  } finally {
    await browser.close();
  }
}
