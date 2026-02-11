import type { ExcelParseResult, ExcelSourceMeta } from "./types";

export function createEmptyParseResult(meta: ExcelSourceMeta): ExcelParseResult {
  return {
    meta,
    total: 0,
    ok: 0,
    fail: 0,
    records: [],
    errors: [],
  };
}

