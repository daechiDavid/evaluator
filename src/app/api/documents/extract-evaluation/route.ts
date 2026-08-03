import { extractEvaluationSubjects } from "@/lib/server/documents";
import { errorResponse, noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    const subjects = await extractEvaluationSubjects(files);
    return noStore({ subjects });
  } catch (error) {
    return errorResponse(error);
  }
}
