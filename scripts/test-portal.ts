import { registerStudentOnPortal } from "../lib/demo/portal/portal.registration";

async function main() {
  const result = await registerStudentOnPortal({
    name: "ANU Test Student",
    email: "skr989798@gmail.com",
    phone: "9999999999",
    password: "TestPassword@123",
    course: "german", // 👈 Valid mapped course ("ielts" | "pte" | "german" | "french")
  });

  console.log("[TEST PORTAL RESULT]", result);
}

main().catch((error) => {
  console.error("[TEST PORTAL ERROR]", error);
  process.exit(1);
});