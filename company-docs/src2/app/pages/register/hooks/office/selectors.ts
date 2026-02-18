import type { RepoEntity } from "@kernel/repo";
import type { OfficeLinkOption, OfficeLinkType } from "./types";

type MasterRow = RepoEntity & Record<string, unknown>;

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getBase(row: MasterRow): Record<string, unknown> {
  return row.base && typeof row.base === "object" ? (row.base as Record<string, unknown>) : {};
}

function pickText(row: MasterRow, keys: string[]): string {
  const base = getBase(row);
  for (const key of keys) {
    const direct = getText(row[key]);
    if (direct) return direct;
    const nested = getText(base[key]);
    if (nested) return nested;
  }
  return "";
}

function buildFallbackLabel(linkType: OfficeLinkType, row: MasterRow): string {
  const id = getText(row.id) || "(id없음)";
  return `${linkType}:${id}`;
}

export function toOfficeLinkOption(linkType: OfficeLinkType, row: MasterRow): OfficeLinkOption | null {
  const id = getText(row.id);
  if (!id) return null;

  let label = "";
  switch (linkType) {
    case "partner": {
      const baseName = pickText(row, ["partnerName", "name", "baseName"]);
      const detailTag = pickText(row, ["partnerDetailTag", "detailTag"]);
      label = detailTag ? `${baseName} · ${detailTag}` : baseName;
      break;
    }
    case "vehicle":
      label = pickText(row, ["vehicleNo", "name"]);
      break;
    case "consumable":
      label = pickText(row, ["name", "consumableName"]);
      break;
    case "equipment":
      label = pickText(row, ["name", "equipmentName"]);
      break;
    case "agency": {
      const baseName = pickText(row, ["baseName", "name"]);
      const detailTag = pickText(row, ["detailTag"]);
      label = detailTag ? `${baseName} · ${detailTag}` : baseName;
      break;
    }
    case "employee": {
      const name = pickText(row, ["name", "employeeName"]);
      const role = pickText(row, ["role", "position", "jobTitle"]);
      label = role ? `${name} · ${role}` : name;
      break;
    }
    case "vendor":
      label = pickText(row, ["name", "vendorName"]);
      break;
  }

  const safeLabel = label || buildFallbackLabel(linkType, row);
  return { id, label: safeLabel };
}

export function sortLinkOptions(options: OfficeLinkOption[]): OfficeLinkOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label, "ko"));
}
