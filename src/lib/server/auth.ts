import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { getServerConfig, hasAccessGate } from "@/lib/server/env";

const COOKIE_NAME = "evaluator-session";

function secretKey(): Uint8Array {
  const secret = getServerConfig().sessionSecret;
  if (!secret) throw new Error("session secret missing");
  return new TextEncoder().encode(secret);
}

function hashAccessCode(code: string): Buffer {
  return createHash("sha256").update(code, "utf8").digest();
}

export async function issueSession(code: string): Promise<string> {
  const config = getServerConfig();
  if (!config.accessCodeHash) throw new Error("access gate disabled");
  const expected = Buffer.from(config.accessCodeHash, "hex");
  const actual = hashAccessCode(code);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("invalid access code");
  return new SignJWT({ scope: "app" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secretKey());
}

export async function hasValidSession(request: Request): Promise<boolean> {
  if (!hasAccessGate()) return true;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieName = COOKIE_NAME;
