import type { Direction, Item, Kind } from "@kernel/schema/daily";
import type { PartnerOption, PartnerPriceRow, VehicleOption } from "./types";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function mapPartner(record: Record<string, unknown>): PartnerOption {
  const base = (record.base ?? {}) as Record<string, unknown>;
  const baseName = getText(base.partnerName) || getText(record.partnerName) || getText(record.name) || "(이름없음)";
  const detailTag = getText(base.partnerDetailTag);
  const label = detailTag ? `${baseName} · ${detailTag}` : baseName;
  const id =
    getText(record.id) ||
    getText(base.partnerCode) ||
    getText(record.partnerCode) ||
    `PARTNER_${label}`;
  const prices = asArray<PartnerPriceRow>(record.prices);
  return { id, label, prices };
}

export function mapVehicle(record: Record<string, unknown>): VehicleOption | null {
  const id = getText(record.id);
  const vehicleNo = getText(record.vehicleNo);
  if (!id || !vehicleNo) return null;
  return { id, vehicleNo };
}

export function resolvePartnerPrice(
  partner: PartnerOption | undefined,
  direction: Direction,
  kind: Kind,
  item: Item,
  hasPriceSelection: (direction: Direction) => boolean
): number {
  if (!partner || !item || !hasPriceSelection(direction)) return 0;
  const matched = partner.prices.find(
    (row) => row.direction === direction && row.kind === kind && row.item === item
  );
  return Number(matched?.pricePerKg) || 0;
}

