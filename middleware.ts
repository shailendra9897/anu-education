import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_S,
  issueAdminSession,
  verifyAdminSession,
} from "@/lib/auth/admin-session";

function unauthorized(): NextResponse {
  return new NextResponse("Unauthorized", { status: 401 });
}

function authenticationRequired(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ANU Education Admin"',
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/test-db";

  if (!isProtected) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");

  // Path 1 — valid HTTP Basic credentials (existing behavior). On success
  // the server ALSO establishes a short-lived HttpOnly session cookie so
  // subsequent same-origin /api/admin/* fetches authenticate automatically
  // without the browser needing to forward Basic credentials.
  if (auth && auth.startsWith("Basic ")) {
    try {
      const encoded = auth.slice(6).trim();

      if (encoded) {
        const decoded = Buffer.from(encoded, "base64").toString("utf-8");

        const separatorIndex = decoded.indexOf(":");

        if (separatorIndex !== -1) {
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

          if (user === expectedUser && pass === expectedPass) {
            const response = NextResponse.next();

            try {
              const session = await issueAdminSession(user);
              response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
                httpOnly: true,
                secure: request.nextUrl.protocol === "https:",
                sameSite: "strict",
                path: "/",
                maxAge: ADMIN_SESSION_TTL_S,
              });
            } catch (error) {
              console.error("[ADMIN SESSION] Failed to issue session:", error);
            }

            return response;
          }
        }
      }
    } catch (error) {
      console.error("[ADMIN AUTH] Authentication error:", error);
    }

    return unauthorized();
  }

  // Path 2 — valid short-lived session cookie issued from a prior successful
  // Basic login. The browser sends this automatically on same-origin fetches.
  if (auth === null) {
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (sessionToken) {
      const sessionUser = await verifyAdminSession(sessionToken);

      if (sessionUser) {
        return NextResponse.next();
      }
    }
  }

  return authenticationRequired();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/test-db",
  ],
};