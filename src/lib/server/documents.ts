import "server-only";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { ACCEPTED_EXTENSIONS, LIMITS } from "@/config/limits";
import { extractedSubjectsResponseSchema, extractedTopicsResponseSchema, type EvaluationSubject } from "@/domain/schemas";
import { GeminiFailoverClient } from "@/lib/server/gemini";

export class DocumentError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "DocumentError";
    this.code = code;
  }
}

export type ParsedDocument = { name: string; extension: string; text: string };

function extensionOf(name: string): string {
  return name.toLowerCase().split(".").pop() ?? "";
}

export async function validateFile(file: File): Promise<{ extension: string; buffer: Buffer }> {
  const extension = extensionOf(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number])) {
    throw new DocumentError("UNSUPPORTED_FILE", "지원하지 않는 파일 형식입니다.");
  }
  if (file.size > LIMITS.maxFileBytes) throw new DocumentError("FILE_TOO_LARGE", "파일 용량이 제한을 초과했습니다.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const isOfficeZip = ["docx", "pptx", "xlsx"].includes(extension) && buffer.subarray(0, 2).toString() === "PK";
  const matches = extension === "pdf" ? detected?.mime === "application/pdf" : extension.startsWith("jp") ? detected?.mime === "image/jpeg" : extension === "png" ? detected?.mime === "image/png" : extension === "webp" ? detected?.mime === "image/webp" : isOfficeZip;
  if (!matches) throw new DocumentError("INVALID_FILE", "파일 형식과 내용이 일치하지 않습니다.");
  return { extension, buffer };
}

async function parseDocx(buffer: Buffer): Promise<string> {
  return (await mammoth.extractRawText({ buffer })).value;
}

async function parsePptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true });
  const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/u.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const texts: string[] = [];
  for (const name of names) {
    const xml = await zip.files[name].async("text");
    const parsed = parser.parse(xml) as Record<string, unknown>;
    const raw = JSON.stringify(parsed).match(/"t":"([^"\\]*(?:\\.[^"\\]*)*)"/gu) ?? [];
    texts.push(raw.map((value) => value.replace(/^"t":"|"$/gu, "")).join(" "));
  }
  return texts.join("\n");
}

async function parseXlsx(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const rows: string[] = [];
  workbook.eachSheet((sheet) => {
    rows.push(`[시트: ${sheet.name}]`);
    sheet.eachRow((row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => cells.push(String(cell.value ?? "")));
      rows.push(cells.join(" | "));
    });
  });
  return rows.join("\n");
}

export async function parseTextDocument(file: File): Promise<ParsedDocument> {
  const { extension, buffer } = await validateFile(file);
  let text = "";
  if (extension === "docx") text = await parseDocx(buffer);
  else if (extension === "pptx") text = await parsePptx(buffer);
  else if (extension === "xlsx") text = await parseXlsx(buffer);
  else if (extension === "pdf" || ["png", "jpg", "jpeg", "webp"].includes(extension)) {
    text = "";
  }
  return { name: file.name, extension, text: text.slice(0, 100_000) };
}

function normalizeSubjects(value: unknown): EvaluationSubject[] {
  const parsed = extractedSubjectsResponseSchema.safeParse(value);
  if (!parsed.success) throw new DocumentError("INVALID_MODEL_RESPONSE", "평가계획서에서 교과 구조를 읽지 못했습니다.");
  return parsed.data.subjects;
}

function normalizeTopics(value: unknown): string[] {
  const parsed = extractedTopicsResponseSchema.safeParse(value);
  if (!parsed.success) throw new DocumentError("INVALID_MODEL_RESPONSE", "문서에서 활동 주제 목록을 읽지 못했습니다.");
  return parsed.data.topics;
}

export async function extractEvaluationSubjects(files: File[]): Promise<EvaluationSubject[]> {
  if (files.length === 0 || files.length > LIMITS.maxFiles) throw new DocumentError("FILE_COUNT", "파일 개수를 확인해 주세요.");
  const parsed = await Promise.all(files.map(parseTextDocument));
  const textual = parsed.filter((item) => item.text).map((item) => `파일: ${item.name}\n${item.text}`).join("\n\n");
  const prompt = `다음 평가계획서에서 교과별 구조를 JSON으로 추출하세요. JSON 형식은 {"subjects":[{"subject":"국어","grade":"","semester":"","area":"","criteria":[""],"elements":[""],"upperDescriptor":""}]} 입니다. 최고 단계인 상 기준만 upperDescriptor에 넣고 중·하 수준은 넣지 마세요. 입력에 없는 사실은 만들지 마세요.\n${textual}`;
  const client = new GeminiFailoverClient();
  const mediaParts = await Promise.all(files.map(async (file) => {
    const { extension, buffer } = await validateFile(file);
    if (!(["pdf", "png", "jpg", "jpeg", "webp"].includes(extension))) return null;
    const mimeType = extension === "pdf" ? "application/pdf" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`;
    return { inlineData: { data: buffer.toString("base64"), mimeType } };
  }));
  const validMediaParts = mediaParts.filter((part): part is { inlineData: { data: string; mimeType: string } } => part !== null);
  const response = validMediaParts.length === 0
    ? await client.generateJson<unknown>(prompt)
    : await client.generateJson<unknown>([{ text: prompt }, ...validMediaParts]);
  return normalizeSubjects(response);
}

export async function extractActivityTopics(file: File): Promise<string[]> {
  const parsed = await parseTextDocument(file);
  const client = new GeminiFailoverClient();
  const prompt = `활동 주제 목록을 JSON {"topics":["주제"]}으로 추출하세요. 입력 밖의 주제는 만들지 마세요.\n${parsed.text}`;
  if (parsed.text) return normalizeTopics(await client.generateJson<unknown>({ text: prompt }));
  const { extension, buffer } = await validateFile(file);
  const mimeType = extension === "pdf" ? "application/pdf" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`;
  return normalizeTopics(await client.generateJson<unknown>([{ text: prompt }, { inlineData: { data: buffer.toString("base64"), mimeType } }]));
}
