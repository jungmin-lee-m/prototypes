// 엑셀(CSV) 다운로드 헬퍼 — UTF-8 BOM 포함, Excel 한글 호환.
// 출처: nextemr-docs chart-prototype/_components/today-report/excel-export.ts 이식.
// (mock import 경로만 현 prototype 구조에 맞춰 수정)

import type { ColId, ColDef } from "./table-columns";
import { ALL_COLUMNS } from "./table-columns";
import { deriveSettledTime, deriveRrn, derivePhone } from "./helpers";
import type { SettledPatient } from "../EndOfDayReport";

/** CSV 필드 1개 안전 직렬화 — 콤마/큰따옴표/개행 포함 시 큰따옴표 wrapping + 내부 이스케이프. */
function csvField(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** 한 환자 + 한 컬럼 → CSV 셀 값. */
function cellValue(c: ColDef, p: SettledPatient): string | number {
  switch (c.id) {
    case "chartNo":     return p.chartNo;
    case "name":        return p.name;
    case "rrn":         return deriveRrn(p);
    case "phone":       return derivePhone(p);
    case "gender":      return p.gender;
    case "age":         return p.age;
    case "insType":     return p.insType;
    case "visitorType": return p.isNew ? "신환" : "";
    case "visitTime":   return p.visitTime;
    case "visitOrder":  return p.isFirstVisit ? "초진" : "재진";
    case "doctor":      return p.doctor;
    case "total":       return p.total;
    case "nhis":        return p.nhis;
    case "selfPay":     return p.selfPay;
    case "noPay":       return p.noPay;
    case "settledTime": return deriveSettledTime(p) ?? "";
    case "card":        return p.card;
    case "cash":        return p.cash;
    case "unpaid":      return p.unpaid;
  }
}

export interface ExportOptions {
  columnIds: ColId[];
  includeSum: boolean;
  filename: string;
}

export function generateCsv(rows: SettledPatient[], options: ExportOptions): string {
  const cols = options.columnIds.length
    ? options.columnIds
        .map((id) => ALL_COLUMNS.find((c) => c.id === id))
        .filter((c): c is ColDef => !!c)
    : ALL_COLUMNS;

  const lines: string[] = [];
  lines.push(cols.map((c) => csvField(c.label)).join(","));
  for (const p of rows) {
    lines.push(cols.map((c) => csvField(cellValue(c, p))).join(","));
  }

  if (options.includeSum && rows.length > 0) {
    const sumIds: ColId[] = ["total", "nhis", "selfPay", "noPay", "card", "cash", "unpaid"];
    const sums: Partial<Record<ColId, number>> = {};
    for (const id of sumIds) sums[id] = 0;
    for (const p of rows) {
      sums.total!   += p.total;
      sums.nhis!    += p.nhis;
      sums.selfPay! += p.selfPay;
      sums.noPay!   += p.noPay;
      sums.card!    += p.card;
      sums.cash!    += p.cash;
      sums.unpaid!  += p.unpaid;
    }
    const sumCells = cols.map((c, i) => {
      if (i === 0) return csvField(`합계 (${rows.length}건)`);
      if (sumIds.includes(c.id)) return csvField(sums[c.id] ?? 0);
      return "";
    });
    lines.push(sumCells.join(","));
  }

  return lines.join("\r\n");
}

export function downloadCsv(csv: string, filename: string): void {
  if (typeof window === "undefined") return;
  const fname = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function defaultFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `오늘내원현황_${yyyy}-${mm}-${dd}`;
}
