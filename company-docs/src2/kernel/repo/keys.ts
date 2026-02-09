export const STORAGE_KEYS = {
  partner: "local_partners_v2_extended",
  vehicle: "repo:vehicle",
  vendor: "local_vendors_v1",
  agency: "local_agencies_v1",
  employee: "local_employees_v1",
  equipment: "local_equipments_v1",
  consumable: "local_consumables_v1",
  partnerBulkSnapshot: "snapshot:partner:bulk",
  daily: "repo:daily",
  issue: "repo:issue",
  action: "repo:action",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
