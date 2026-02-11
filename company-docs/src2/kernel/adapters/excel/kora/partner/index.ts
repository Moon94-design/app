import { createEmptyParseResult, type ExcelParseResult } from "../../common";

const KORA_PARTNER_SOURCE_ID = "kora.partner";

export function parseKoraPartnerWorkbook(): ExcelParseResult {
  // 2차 이관에서 실제 파서를 연결한다.
  return createEmptyParseResult({
    sourceId: KORA_PARTNER_SOURCE_ID,
    importedAt: new Date().toISOString(),
  });
}

