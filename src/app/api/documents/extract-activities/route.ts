import { extractActivityTopics } from "@/lib/server/documents";
import { errorResponse, noStore, requireSession } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const fileValue = form.get("file");
    if (!(fileValue instanceof File)) return noStore({ error: "파일을 선택해 주세요.", code: "FILE_REQUIRED" }, { status: 400 });
    const topics = await extractActivityTopics(fileValue);
    return noStore({ topics });
  } catch (error) {
    return errorResponse(error);
  }
}
