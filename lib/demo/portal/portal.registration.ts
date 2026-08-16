import { chromium } from "playwright";

import type {
  PortalRegistrationInput,
  PortalRegistrationResult,
} from "@/lib/portal/portal.types";

import {
  getPortalCourse,
} from "@/lib/portal/portal.course-map";

const PORTAL_URL = "https://study.anuedu.in/register";

const DEFAULT_DEMO_PASSWORD = "Demo@123";

export async function registerStudentOnPortal(
  input: PortalRegistrationInput,
): Promise<PortalRegistrationResult> {
  const password =
    input.password?.trim() || DEFAULT_DEMO_PASSWORD;

  const browser = await chromium.launch({
    headless: false,
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

    // ============================================================
    // OPEN REGISTRATION
    // ============================================================

    await page.goto(PORTAL_URL, {
      waitUntil: "domcontentloaded",
    });

    console.log("[PORTAL] Initial URL:", page.url());
    console.log("[PORTAL] Title:", await page.title());

    await page.waitForTimeout(3000);

    // ============================================================
    // VALIDATE INPUT
    // ============================================================

    if (!input.name.trim()) {
      return {
        success: false,
        message: "Student name is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: "Student name is empty.",
        url: page.url(),
        title: await page.title(),
      };
    }

    if (!input.email.trim()) {
      return {
        success: false,
        message: "Student email is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: "Student email is empty.",
        url: page.url(),
        title: await page.title(),
      };
    }

    if (!input.phone.trim()) {
      return {
        success: false,
        message: "Student phone is required.",
        errorCode: "INVALID_INPUT",
        errorMessage: "Student phone is empty.",
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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `No portal course mapping found for "${input.course}".`;

      return {
        success: false,
        message,
        errorCode: "COURSE_NOT_FOUND",
        errorMessage: message,
        url: page.url(),
        title: await page.title(),
      };
    }

    console.log("[PORTAL] Requested course:", input.course);
    console.log("[PORTAL] Portal course:", portalCourse);

    // ============================================================
    // FILL REGISTRATION FORM
    // ============================================================

    await page.locator('input[name="name"]').fill(
      input.name,
    );

    await page.locator('input[name="emailId"]').fill(
      input.email,
    );

    await page
      .locator('input[name="mobileNumber"]')
      .fill(input.phone);

    await page
      .locator('input[name="password"]')
      .fill(password);

    console.log(
      "[PORTAL] Registration form filled successfully.",
    );

    await page.screenshot({
      path: "portal-registration-filled.png",
      fullPage: true,
    });

    // ============================================================
    // CONTINUE
    // ============================================================

    console.log(
      "[PORTAL] About to submit registration form...",
    );

    await page
      .getByRole("button", {
        name: "Continue",
        exact: true,
      })
      .click();

    await page.waitForTimeout(3000);

    console.log(
      "[PORTAL] After Continue URL:",
      page.url(),
    );

    const afterContinueBody =
      await page.locator("body").innerText();

    console.log(
      "[PORTAL] After Continue body:",
      afterContinueBody.slice(0, 5000),
    );

    await page.screenshot({
      path: "portal-after-continue.png",
      fullPage: true,
    });

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
        message:
          "Portal registration failed: email address already exists.",
        errorCode: "EMAIL_EXISTS",
        errorMessage:
          "The portal reports that this email address already exists.",
        url: page.url(),
        title: await page.title(),
      };
    }

    // ============================================================
    // COURSE SELECTION
    // ============================================================

    console.log(
      "[PORTAL] ===== COURSE SELECTION STEP =====",
    );

    const courseChip = page
      .locator(".course-chip")
      .filter({
        hasText: portalCourse,
      });

    if ((await courseChip.count()) === 0) {
      return {
        success: false,
        message:
          `Portal course "${portalCourse}" was not found.`,
        errorCode: "COURSE_NOT_FOUND",
        errorMessage:
          `Course chip "${portalCourse}" was not found on the portal.`,
        url: page.url(),
        title: await page.title(),
      };
    }

    await courseChip.first().click();

    await page.waitForTimeout(500);

    // ============================================================
    // VERIFY SELECTED PRODUCT
    // ============================================================

    const selectedProduct =
      page.locator(
        'input[name="selectedProduct"]',
      );

    const selectedValue =
      await selectedProduct.inputValue();

    console.log(
      "[PORTAL] selectedProduct:",
      selectedValue,
    );

    if (!selectedValue) {
      return {
        success: false,
        message:
          `Course selection failed for "${portalCourse}".`,
        errorCode: "COURSE_NOT_FOUND",
        errorMessage:
          "Portal did not provide a selectedProduct value.",
        url: page.url(),
        title: await page.title(),
      };
    }

    console.log(
      "[PORTAL] Course selection verified:",
      portalCourse,
    );

    console.log(
      "[PORTAL] Selected chip class:",
      await courseChip.first().getAttribute("class"),
    );

    await page.screenshot({
      path: "portal-course-selection.png",
      fullPage: true,
    });

    // ============================================================
    // REGISTER
    // ============================================================

    console.log(
      "[PORTAL] About to click Register...",
    );

    const registerButton =
      page.getByRole("button", {
        name: "Register",
        exact: true,
      });

    if ((await registerButton.count()) !== 1) {
      return {
        success: false,
        message:
          "Portal Register button could not be identified.",
        errorCode: "REGISTRATION_FAILED",
        errorMessage:
          `Expected exactly one Register button, found ${await registerButton.count()}.`,
        url: page.url(),
        title: await page.title(),
      };
    }

    await registerButton.click();

    await page.waitForTimeout(5000);

    const bodyText =
      await page.locator("body").innerText();

    const currentUrl = page.url();
    const title = await page.title();

    console.log(
      "[PORTAL] After Register URL:",
      currentUrl,
    );

    console.log(
      "[PORTAL] After Register body:",
      bodyText,
    );

    await page.screenshot({
      path: "portal-after-register.png",
      fullPage: true,
    });

    // ============================================================
    // EMAIL EXISTS
    // ============================================================

    if (
      /already exists|email.*exist|already registered/i.test(
        bodyText,
      )
    ) {
      return {
        success: false,
        message:
          "Portal registration failed: email address already exists.",
        errorCode: "EMAIL_EXISTS",
        errorMessage:
          "The portal reports that this email address already exists.",
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
        message:
          "Portal registration failed. Please inspect the portal response.",
        errorCode: "REGISTRATION_FAILED",
        errorMessage:
          bodyText.slice(0, 2000),
        url: currentUrl,
        title,
      };
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    console.log(
      "[PORTAL] Registration appears successful.",
    );

    return {
      success: true,

      message:
        `Registration completed successfully for course "${portalCourse}".`,

      portalLogin: input.email,

      // We deliberately do NOT invent a portalStudentId.
      portalStatus: "Awaiting Approval",

      selectedCourse: portalCourse,

      url: currentUrl,

      title,
    };
  } catch (error) {
    console.error(
      "[PORTAL] Registration diagnostic error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown portal registration error.";

    const lower = message.toLowerCase();

    let errorCode:
      | "PORTAL_TIMEOUT"
      | "REGISTRATION_FAILED"
      | "UNKNOWN_ERROR";

    if (
      lower.includes("timeout") ||
      lower.includes("timed out")
    ) {
      errorCode = "PORTAL_TIMEOUT";
    } else if (
      lower.includes("register") ||
      lower.includes("registration")
    ) {
      errorCode = "REGISTRATION_FAILED";
    } else {
      errorCode = "UNKNOWN_ERROR";
    }

    return {
      success: false,
      message,
      errorCode,
      errorMessage: message,
    };
  } finally {
    await browser.close();
  }
}