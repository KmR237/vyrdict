import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const cookie = request.cookies.get("vyrdict-auth");
    // Le middleware vérifie juste que le cookie existe et a le bon format (32 chars hex)
    // La vérification HMAC complète est faite dans les routes API (Node.js runtime)
    if (!cookie || cookie.value.length !== 32) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
