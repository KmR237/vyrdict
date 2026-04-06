import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

const COOKIE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

// Vérification HMAC complète — uniquement utilisable en Node.js runtime (routes API)
export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("vyrdict-auth");
  if (!cookie) return false;
  const expected = createHmac("sha256", COOKIE_SECRET)
    .update(ADMIN_EMAIL.toLowerCase())
    .digest("hex")
    .slice(0, 32);
  return cookie.value === expected;
}
