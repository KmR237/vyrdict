import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
    }

    // Simple PIN-based auth (code = 4 digits stored in env)
    const PIN = process.env.ADMIN_PIN || "1234";
    if (code !== PIN) {
      return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("vyrdict-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
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
