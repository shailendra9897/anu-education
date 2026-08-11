import { chromium } from "playwright";

export type PortalRegistrationInput = {
  name: string;
  email: string;
  phone: string;
};

export async function registerStudentOnPortal(
  input: PortalRegistrationInput,
) {
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();

    await page.goto("https://anuedu.in", {
      waitUntil: "domcontentloaded",
    });

    console.log("[PORTAL] Registration page opened");

    // --- DIAGNOSTIC LOGS START ---
    console.log("[PORTAL] URL:", page.url());

    console.log(
      "[PORTAL] Visible text:",
      await page.locator("body").innerText(),
    );

    console.log(
      "[PORTAL] Links:",
      await page.locator("a").evaluateAll((links) =>
        links.map((link) => ({
          text: link.textContent?.trim() ?? "",
          href: link.getAttribute("href"),
        })),
      ),
    );

    console.log(
      "[PORTAL] All elements:",
      await page.locator("body *").count(),
    );

    await page.screenshot({
      path: "portal-register-debug.png",
      fullPage: true,
    });

    await page.waitForTimeout(30000);
    // --- DIAGNOSTIC LOGS END ---

    return {
      success: true,
      message: "Portal registration page opened successfully.",
    };
  } finally {
    await browser.close();
  }
}
