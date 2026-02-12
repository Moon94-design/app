import type { AgencyOption } from "./types";

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildStableFallbackId(baseName: string, detailTag: string): string {
  const seed = `${baseName}|${detailTag}`.trim();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `AGENCY_FALLBACK_${hash.toString(16).padStart(8, "0")}`;
}

export function mapAgency(record: Record<string, unknown>): AgencyOption {
  const baseName = getText(record.baseName) || getText(record.name) || "(기관명 없음)";
  const detailTag = getText(record.detailTag);
  const id = getText(record.id) || buildStableFallbackId(baseName, detailTag);

  return {
    id,
    label: detailTag ? `${baseName} · ${detailTag}` : baseName,
  };
}
