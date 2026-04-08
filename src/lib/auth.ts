import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

const COOKIE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

// Vérification HMAC complète — uniquement utilisable en Node.js runtime (routes API)
export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("vyrdict-auth");
  if (!cookie) return false;
  return ADMIN_EMAILS.some(email => {
    const expected = createHmac("sha256", COOKIE_SECRET).update(email).digest("hex").slice(0, 32);
    return cookie.value === expected;
  });
}
