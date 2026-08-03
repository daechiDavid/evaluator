import "server-only";
import { z } from "zod";

const rawEnvironmentSchema = z.object({
  GEMINI_API_KEY_1: z.string().trim().min(1).optional(),
  GEMINI_API_KEY_2: z.string().trim().min(1).optional(),
  GEMINI_API_KEY_3: z.string().trim().min(1).optional(),
  GEMINI_MODEL: z.string().trim().min(1).optional(),
  APP_ACCESS_CODE_HASH: z.string().trim().min(1).optional(),
  APP_SESSION_SECRET: z.string().trim().min(16).optional(),
});

export class ServiceConfigError extends Error {
  readonly code = "SERVICE_CONFIG_MISSING";
  constructor(message = "서버 환경 설정이 준비되지 않았습니다.") {
    super(message);
    this.name = "ServiceConfigError";
  }
}

export type ServerConfig = {
  model: string;
  keys: string[];
  accessCodeHash?: string;
  sessionSecret?: string;
};

export function getServerConfig(): ServerConfig {
  const parsed = rawEnvironmentSchema.parse({
    GEMINI_API_KEY_1: process.env.GEMINI_API_KEY_1,
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2,
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    APP_ACCESS_CODE_HASH: process.env.APP_ACCESS_CODE_HASH,
    APP_SESSION_SECRET: process.env.APP_SESSION_SECRET,
  });
  if (!parsed.GEMINI_API_KEY_1 || !parsed.GEMINI_MODEL) throw new ServiceConfigError();
  if (parsed.APP_ACCESS_CODE_HASH && !parsed.APP_SESSION_SECRET) {
    throw new ServiceConfigError("접근 제어 환경 설정이 준비되지 않았습니다.");
  }
  const keys = [parsed.GEMINI_API_KEY_1, parsed.GEMINI_API_KEY_2, parsed.GEMINI_API_KEY_3]
    .filter((key): key is string => Boolean(key));
  return {
    model: parsed.GEMINI_MODEL,
    keys: [...new Set(keys)],
    accessCodeHash: parsed.APP_ACCESS_CODE_HASH,
    sessionSecret: parsed.APP_SESSION_SECRET,
  };
}

export function hasAccessGate(): boolean {
  return Boolean(process.env.APP_ACCESS_CODE_HASH);
}
