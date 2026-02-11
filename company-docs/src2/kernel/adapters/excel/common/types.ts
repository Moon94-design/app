export type ExcelSourceId = string;

export interface ExcelSourceMeta {
  sourceId: ExcelSourceId;
  importedAt: string;
  fileName?: string;
  sheetName?: string;
}

export interface ExcelRowError {
  rowIndex: number;
  message: string;
  code?: string;
}

export interface ExcelNormalizedRecord {
  sourceRowId: string;
  matchKey?: string;
  fields: Record<string, unknown>;
}

export interface ExcelParseResult<TRecord = ExcelNormalizedRecord> {
  meta: ExcelSourceMeta;
  total: number;
  ok: number;
  fail: number;
  records: TRecord[];
  errors: ExcelRowError[];
}

