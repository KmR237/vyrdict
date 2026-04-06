import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac } from "crypto";

function verifyAuthCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get("vyrdict-auth");
  if (!cookie) return false;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const email = process.env.ADMIN_EMAIL || "";
  const expected = createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 32);
  return cookie.value === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!verifyAuthCookie(request)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
