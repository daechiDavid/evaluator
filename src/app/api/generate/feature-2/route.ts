import { feature2RequestSchema } from "@/domain/schemas";
import { generateFeature2Student } from "@/lib/server/generation";
import { errorResponse, noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const body = feature2RequestSchema.parse(await request.json());
    const results = [];
    for (const student of body.students) results.push(await generateFeature2Student(student.studentIndex, student.keywords, body.targetLength, body.commonOptions));
    return noStore({ results });
  } catch (error) {
    return errorResponse(error);
  }
}
