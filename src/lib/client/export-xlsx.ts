"use client";

import type { StudentResult } from "@/domain/schemas";

type ExportSheet = { name: string; results: StudentResult[]; evidenceLabel: string };

function addResultSheet(workbook: import("exceljs").Workbook, sheetName: string, results: StudentResult[], evidenceLabel: string): void {
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));
  sheet.columns = [
    { header: "학생 순번", key: "studentIndex", width: 14 },
    { header: "최종 문단", key: "paragraph", width: 90 },
    { header: "확정 상태", key: "status", width: 16 },
    { header: "근거", key: "evidence", width: 70 },
  ];
  for (const result of results.filter((item) => item.status === "confirmed")) {
    sheet.addRow({ studentIndex: `학생 ${result.studentIndex}`, paragraph: result.paragraph, status: "확정", evidence: `${evidenceLabel}: ${result.evidence.join(", ")}` });
  }
  sheet.getRow(1).font = { bold: true };
}

async function saveWorkbook(workbook: import("exceljs").Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadResultsXlsx(sheetName: string, results: StudentResult[], evidenceLabel: string): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  addResultSheet(workbook, sheetName, results, evidenceLabel);
  await saveWorkbook(workbook, sheetName);
}

export async function downloadWorkspaceXlsx(sheets: ExportSheet[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  for (const sheet of sheets) if (sheet.results.some((result) => result.status === "confirmed")) addResultSheet(workbook, sheet.name, sheet.results, sheet.evidenceLabel);
  if (workbook.worksheets.length === 0) addResultSheet(workbook, "확정 결과 없음", [], "");
  await saveWorkbook(workbook, "evaluator-확정-결과");
}
