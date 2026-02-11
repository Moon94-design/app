export interface NormalizedDate {
  value: string | null;
  error: "empty" | "parse_failed" | null;
}

function pad2(v: number): string {
  return String(v).padStart(2, "0");
}

function fromExcelSerial(serial: number): string | null {
  if (!Number.isFinite(serial) || serial <= 0) return null;
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = Math.round(serial * 86400 * 1000);
  const dt = new Date(excelEpoch.getTime() + ms);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export function normalizeDate(input: unknown): NormalizedDate {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      return { value: null, error: "parse_failed" };
    }
    return {
      value: `${input.getFullYear()}-${pad2(input.getMonth() + 1)}-${pad2(input.getDate())}`,
      error: null,
    };
  }

  if (input === null || input === undefined || String(input).trim() === "") {
    return { value: null, error: "empty" };
  }

  const raw = String(input).trim();

  // YYYY-MM-DD / YYYY.MM.DD / YYYY/MM/DD
  const ymd = raw.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { value: `${y}-${pad2(m)}-${pad2(d)}`, error: null };
    }
  }

  // YYYY-MM-DD HH:mm[:ss] / YYYY.MM.DD HH:mm[:ss] / YYYY/MM/DD HH:mm[:ss]
  const ymdWithTime = raw.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})\s+\d{1,2}:\d{1,2}(?::\d{1,2})?$/);
  if (ymdWithTime) {
    const y = Number(ymdWithTime[1]);
    const m = Number(ymdWithTime[2]);
    const d = Number(ymdWithTime[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { value: `${y}-${pad2(m)}-${pad2(d)}`, error: null };
    }
  }

  // YYYYMMDD
  const compact = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    const y = Number(compact[1]);
    const m = Number(compact[2]);
    const d = Number(compact[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { value: `${y}-${pad2(m)}-${pad2(d)}`, error: null };
    }
  }

  // M/D/YY (matrix-defined)
  const mdyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (mdyy) {
    const mm = Number(mdyy[1]);
    const dd = Number(mdyy[2]);
    const yy = Number(mdyy[3]);
    const yyyy = yy >= 70 ? 1900 + yy : 2000 + yy;
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return { value: `${yyyy}-${pad2(mm)}-${pad2(dd)}`, error: null };
    }
  }

  // M/D/YYYY
  const mdyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyyyy) {
    const mm = Number(mdyyyy[1]);
    const dd = Number(mdyyyy[2]);
    const yyyy = Number(mdyyyy[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return { value: `${yyyy}-${pad2(mm)}-${pad2(dd)}`, error: null };
    }
  }

  // Excel serial date
  const asNumber = Number(raw.replace(/,/g, ""));
  if (Number.isFinite(asNumber)) {
    const serialDate = fromExcelSerial(asNumber);
    if (serialDate) return { value: serialDate, error: null };
  }

  return { value: null, error: "parse_failed" };
}

export function normalizeNumber(input: unknown): number | null {
  if (input === null || input === undefined || String(input).trim() === "") {
    return null;
  }
  const parsed = Number(String(input).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeBizNo(input: unknown): { raw: string; normalized: string } {
  const raw = String(input ?? "").trim();
  const normalized = raw.replace(/[^\d]/g, "");
  return { raw, normalized };
}
