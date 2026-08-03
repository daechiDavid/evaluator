import { z } from "zod";
import { similarityScore } from "@/domain/validators";
import { noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const body = z.object({ sentences: z.array(z.string()).min(1).max(300) }).parse(await request.json());
    const comparisons = [];
    for (let index = 0; index < body.sentences.length; index += 1) {
      for (let other = index + 1; other < body.sentences.length; other += 1) {
        comparisons.push({ left: index, right: other, score: similarityScore(body.sentences[index], body.sentences[other]) });
      }
    }
    return noStore({ comparisons });
  } catch {
    return noStore({ error: "중복 검수 요청을 확인해 주세요.", code: "INVALID_REVIEW_REQUEST" }, { status: 400 });
  }
}
