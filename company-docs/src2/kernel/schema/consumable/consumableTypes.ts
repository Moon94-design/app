// ORIGIN: copied from src/app/pages/register/RegisterConsumable.tsx (2026-02-10)
// SSOT: This file is the source of truth. Use via @kernel only.

export type ConsumableDraft = {
  equipmentId: string;
  name: string;
  spec: string;
  rule: string;
  minStock: number;
  vendorId: string;
};

export function defaultConsumableDraft(): ConsumableDraft {
  return {
    equipmentId: "",
    name: "",
    spec: "",
    rule: "",
    minStock: 0,
    vendorId: "",
  };
}
