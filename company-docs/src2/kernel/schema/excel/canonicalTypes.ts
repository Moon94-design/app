export interface CanonicalFieldOrigin {
  sourceId: string;
  sourceRowId: string;
  importedAt: string;
}

export interface CanonicalExcelEntity {
  canonicalId: string;
  matchKey?: string;
  fields: Record<string, unknown>;
  origins: Record<string, CanonicalFieldOrigin[]>;
  updatedAt: number;
}

