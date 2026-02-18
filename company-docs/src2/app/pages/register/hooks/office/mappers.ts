import type { RepoEntity } from "@kernel/repo";
import type {
  OfficeDraft,
  OfficeHistoryLineItem,
  OfficeLine,
  OfficeLinkedReference,
  OfficeLinkOption,
  OfficeLinkType,
  OfficeRecord,
} from "./types";
import { sortLinkOptions, toOfficeLinkOption } from "./selectors";

export type OfficeMasterRow = RepoEntity & Record<string, unknown>;
export type LinkOptionsByType = Record<OfficeLinkType, OfficeLinkOption[]>;

type LegacyLinkedLineShape = Partial<OfficeLine> & {
  linkType?: OfficeLinkType;
  linkId?: string;
  linkLabel?: string;
};

export const EMPTY_LINK_OPTIONS: LinkOptionsByType = {
  partner: [],
  vehicle: [],
  consumable: [],
  equipment: [],
  agency: [],
  employee: [],
  vendor: [],
};

function toLinkedReferences(line: LegacyLinkedLineShape): OfficeLinkedReference[] {
  if (Array.isArray(line.linkedReferences)) {
    return line.linkedReferences
      .filter((item) => item && item.id && item.type)
      .map((item) => ({
        type: item.type,
        id: item.id,
        label: item.label || item.id,
      }));
  }

  const legacyType = line.linkType as OfficeLinkType | undefined;
  const legacyId = typeof line.linkId === "string" ? line.linkId : "";
  const legacyLabel = typeof line.linkLabel === "string" ? line.linkLabel : "";
  if (legacyType && legacyId) {
    return [{ type: legacyType, id: legacyId, label: legacyLabel || legacyId }];
  }
  return [];
}

export function normalizeLine(line: LegacyLinkedLineShape): OfficeLine {
  return {
    id: typeof line.id === "string" ? line.id : "",
    subtitle: typeof line.subtitle === "string" ? line.subtitle : "",
    details: typeof line.details === "string" ? line.details : "",
    linkedReferences: toLinkedReferences(line),
  };
}

export function normalizeLineDraft(
  draft: Partial<OfficeDraft["lineDraft"]>
): OfficeDraft["lineDraft"] {
  return {
    subtitle: typeof draft.subtitle === "string" ? draft.subtitle : "",
    details: typeof draft.details === "string" ? draft.details : "",
    linkType: draft.linkType || "partner",
    linkId: typeof draft.linkId === "string" ? draft.linkId : "",
    linkedReferences: toLinkedReferences(draft as LegacyLinkedLineShape),
  };
}

export function buildOfficeLinkOptionsByType(rows: {
  partners: OfficeMasterRow[];
  vehicles: OfficeMasterRow[];
  consumables: OfficeMasterRow[];
  equipments: OfficeMasterRow[];
  agencies: OfficeMasterRow[];
  employees: OfficeMasterRow[];
  vendors: OfficeMasterRow[];
}): LinkOptionsByType {
  return {
    partner: sortLinkOptions(
      rows.partners
        .map((row) => toOfficeLinkOption("partner", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    vehicle: sortLinkOptions(
      rows.vehicles
        .map((row) => toOfficeLinkOption("vehicle", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    consumable: sortLinkOptions(
      rows.consumables
        .map((row) => toOfficeLinkOption("consumable", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    equipment: sortLinkOptions(
      rows.equipments
        .map((row) => toOfficeLinkOption("equipment", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    agency: sortLinkOptions(
      rows.agencies
        .map((row) => toOfficeLinkOption("agency", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    employee: sortLinkOptions(
      rows.employees
        .map((row) => toOfficeLinkOption("employee", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
    vendor: sortLinkOptions(
      rows.vendors
        .map((row) => toOfficeLinkOption("vendor", row))
        .filter((row): row is OfficeLinkOption => Boolean(row))
    ),
  };
}

export function buildMergedHistoryLines(records: OfficeRecord[]): OfficeHistoryLineItem[] {
  const out: OfficeHistoryLineItem[] = [];
  for (const record of records) {
    for (const line of record.lines || []) {
      out.push({
        recordId: record.id,
        line,
        recordDate: record.recordDate,
        site: record.site,
        writerName: record.writerName,
        writerRole: record.writerRole,
      });
    }
  }
  return out;
}
