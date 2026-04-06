import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("vyrdict-auth");
  if (!cookie) return false;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
  const email = process.env.ADMIN_EMAIL || "";
  const expected = createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 32);
  return cookie.value === expected;
}
