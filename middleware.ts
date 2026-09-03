import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("Unauthorized", { status: 401 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/test-db";

  if (!isProtected) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="ANU Education Admin"',
      },
    });
  }

  try {
    const encoded = auth.slice(6).trim();

    if (!encoded) {
      return unauthorized();
    }

    const decoded = Buffer.from(encoded, "base64").toString("utf-8");

    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return unauthorized();
    }

    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASS;

    if (expectedUser === undefined || expectedPass === undefined) {
      console.error(
        "[ADMIN AUTH] ADMIN_USER or ADMIN_PASS is not configured.",
      );

      return new NextResponse("Admin authentication is not configured.", {
        status: 500,
      });
    }

    if (user !== expectedUser || pass !== expectedPass) {
      return unauthorized();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[ADMIN AUTH] Authentication error:", error);

    return unauthorized();
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/test-db",
  ],
};