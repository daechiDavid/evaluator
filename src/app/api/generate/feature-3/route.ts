import { feature3RequestSchema } from "@/domain/schemas";
import { generateFeature3Student } from "@/lib/server/generation";
import { errorResponse, noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const body = feature3RequestSchema.parse(await request.json());
    const results = [];
    for (const assignment of body.assignments) results.push(await generateFeature3Student(assignment.studentIndex, assignment.topics, body.targetLength, body.commonOptions));
    return noStore({ results });
  } catch (error) {
    return errorResponse(error);
  }
}
