import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
const COOKIE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";

function signToken(email: string): string {
  return createHmac("sha256", COOKIE_SECRET).update(email.toLowerCase()).digest("hex").slice(0, 32);
}

export function verifyAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get("vyrdict-auth");
  if (!cookie) return false;
  return ADMIN_EMAILS.some(email => cookie.value === signToken(email));
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
    }

    const PIN = process.env.ADMIN_PIN || "1234";
    if (code !== PIN) {
      return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
    }

    const token = signToken(email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("vyrdict-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("vyrdict-auth");
  return response;
}
