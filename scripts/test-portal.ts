import { registerStudentOnPortal } from "../lib/demo/portal/portal.registration";
import { hasPortalPassword } from "../lib/portal/portal.config";

async function main() {
  // Diagnostic-only manual script. Uses the environment-configured
  // portal password (PORTAL_PASSWORD) — never a hardcoded credential.
  // Runs only when configuration is present.
  if (!hasPortalPassword()) {
    console.error(
      "[TEST PORTAL] PORTAL_PASSWORD is not configured. Aborting.",
    );
    process.exit(1);
  }

  const result = await registerStudentOnPortal({
    name: "ANU Test Student",
    email: "test-student@example.test",
    phone: "9999999999",
    course: "german",
  });

  console.log("[TEST PORTAL RESULT]", {
    success: result.success,
    message: result.message,
    errorCode: result.errorCode,
    portalStatus: result.portalStatus,
    selectedCourse: result.selectedCourse,
  });
}

main().catch((error) => {
  console.error("[TEST PORTAL ERROR]", error);
  process.exit(1);
});
