import { NextResponse } from "next/server";
import { z } from "zod";
import { issueSession, sessionCookieName } from "@/lib/server/auth";
import { hasAccessGate } from "@/lib/server/env";
import { noStore } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasAccessGate()) return noStore({ ok: true, gated: false });
  try {
    const body = z.object({ code: z.string().min(1).max(200) }).parse(await request.json());
    const token = await issueSession(body.code);
    const response = NextResponse.json({ ok: true, gated: true });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(sessionCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 12, path: "/" });
    return response;
  } catch {
    return noStore({ error: "접근 코드를 확인해 주세요.", code: "ACCESS_DENIED" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = noStore({ ok: true });
  response.cookies.set(sessionCookieName, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
