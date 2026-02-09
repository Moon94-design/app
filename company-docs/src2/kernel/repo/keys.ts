export const STORAGE_KEYS = {
  partner: "local_partners_v2_extended",
  partnerBulkSnapshot: "snapshot:partner:bulk",
  daily: "repo:daily",
  issue: "repo:issue",
  action: "repo:action",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
