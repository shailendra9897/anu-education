import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const adminPath = request.nextUrl.pathname.startsWith("/admin");

  if (adminPath) {
    const validAuth = "Basic " + Buffer.from("anuadmin:secure123").toString("base64");
    if (auth !== validAuth) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};