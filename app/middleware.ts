import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Protect both:
  // /admin/*
  // /api/admin/*
  if (!isAdminRoute && !isAdminApiRoute) {
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
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const decoded = Buffer.from(encoded, "base64").toString("utf-8");

    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASS;

    if (!expectedUser || !expectedPass) {
      console.error(
        "[ADMIN AUTH] ADMIN_USER or ADMIN_PASS is not configured.",
      );

      return new NextResponse("Admin authentication is not configured.", {
        status: 500,
      });
    }

    if (user !== expectedUser || pass !== expectedPass) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[ADMIN AUTH] Authentication error:", error);

    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};