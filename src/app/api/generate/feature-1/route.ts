import { feature1RequestSchema } from "@/domain/schemas";
import { generateFeature1Student } from "@/lib/server/generation";
import { errorResponse, noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const body = feature1RequestSchema.parse(await request.json());
    const indexes = body.regenerateStudentIndex ? [body.regenerateStudentIndex] : body.studentIndices ?? Array.from({ length: body.studentsCount }, (_, index) => index + 1);
    const results = [];
    for (const studentIndex of indexes) results.push(...await generateFeature1Student(studentIndex, body.subjects, body.targetLength, body.commonOptions));
    return noStore({ results });
  } catch (error) {
    return errorResponse(error);
  }
}
