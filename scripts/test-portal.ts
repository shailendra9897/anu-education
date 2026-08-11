import { registerStudentOnPortal } from "../lib/demo/portal/portal.registration";

async function main() {
  const result = await registerStudentOnPortal({
    name: "ANU Test Student",
    email: "YOUR_TEST_EMAIL@example.com",
    phone: "9999999999",
  });

  console.log(result);
}

main().catch((error) => {
  console.error("[TEST PORTAL ERROR]", error);
  process.exit(1);
});