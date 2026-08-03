import "server-only";
import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";
import { getServerConfig, ServiceConfigError } from "@/lib/server/env";

export class GeminiServiceError extends Error {
  readonly code: string;
  constructor(code = "GENERATION_FAILED", message = "생성 서비스가 응답하지 않았습니다.") {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
  }
}

type GeminiPayload = GenerateContentParameters["contents"];

function statusFrom(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const value = (error as Record<string, unknown>)["status"];
  return typeof value === "number" ? value : undefined;
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
}

function isFailoverError(error: unknown): boolean {
  const status = statusFrom(error);
  const message = messageFrom(error);
  return status === 401 || status === 403 || status === 429 || /resource_exhausted|quota|permission|unauthoriz|rate.?limit/u.test(message);
}

function isServerError(error: unknown): boolean {
  const status = statusFrom(error);
  return typeof status === "number" && status >= 500 && status <= 599;
}

function parseJson<T>(text: string): T {
  const normalized = text.trim().replace(/^```json\s*/u, "").replace(/```$/u, "").trim();
  try {
    return JSON.parse(normalized) as T;
  } catch {
    throw new GeminiServiceError("INVALID_MODEL_RESPONSE");
  }
}

export class GeminiFailoverClient {
  private readonly model: string;
  private readonly keys: string[];

  constructor() {
    const config = getServerConfig();
    this.model = config.model;
    this.keys = config.keys;
  }

  async generateJson<T>(contents: GeminiPayload): Promise<T> {
    let lastError: unknown;
    for (let index = 0; index < this.keys.length; index += 1) {
      const key = this.keys[index];
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const ai = new GoogleGenAI({ apiKey: key });
          const response = await ai.models.generateContent({
            model: this.model,
            contents,
            config: { responseMimeType: "application/json" },
          });
          if (!response.text) throw new GeminiServiceError("EMPTY_MODEL_RESPONSE");
          return parseJson<T>(response.text);
        } catch (error) {
          lastError = error;
          if (isServerError(error) && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 180));
            continue;
          }
          if (isFailoverError(error) && index < this.keys.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, Math.min(250 * (index + 1), 500)));
          }
          break;
        }
      }
    }
    if (lastError instanceof ServiceConfigError) throw lastError;
    if (lastError instanceof GeminiServiceError) throw lastError;
    throw new GeminiServiceError("GENERATION_FAILED");
  }
}
