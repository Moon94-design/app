export interface ExcelSourceRecord {
  sourceId: string;
  sourceRowId: string;
  matchKey?: string;
  fields: Record<string, unknown>;
  importedAt: string;
}

