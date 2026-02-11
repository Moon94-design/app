import type { CanonicalExcelEntity } from "./canonicalTypes";
import type { ExcelSourceRecord } from "./sourceTypes";

export interface ExcelMergePolicy {
  name: string;
  merge(base: CanonicalExcelEntity | null, incoming: ExcelSourceRecord): CanonicalExcelEntity;
}

