import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/server/auth";
import { ServiceConfigError } from "@/lib/server/env";
import { DocumentError } from "@/lib/server/documents";
import { GeminiServiceError } from "@/lib/server/gemini";

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

export function noStore<T>(body: T, init?: ResponseInit): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

export async function requireSession(request: Request): Promise<NextResponse | null> {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) requestWindows.set(key, { startedAt: now, count: 1 });
  else if (current.count >= MAX_REQUESTS_PER_WINDOW) return noStore({ error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.", code: "RATE_LIMITED" }, { status: 429 });
  else current.count += 1;
  if (await hasValidSession(request)) return null;
  return noStore({ error: "접근 권한이 필요합니다.", code: "UNAUTHORIZED" }, { status: 401 });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ServiceConfigError) return noStore({ error: "서비스 설정 오류로 생성 기능을 사용할 수 없습니다.", code: error.code }, { status: 503 });
  if (error instanceof DocumentError) return noStore({ error: error.message, code: error.code }, { status: 400 });
  if (error instanceof GeminiServiceError) return noStore({ error: "현재 생성 서비스를 사용할 수 없습니다. 잠시 후 다시 시도하세요.", code: error.code }, { status: 502 });
  return noStore({ error: "요청을 처리하지 못했습니다.", code: "REQUEST_FAILED" }, { status: 500 });
}
