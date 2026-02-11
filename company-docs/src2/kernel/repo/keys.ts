export const STORAGE_KEYS = {
  partner: "local_partners_v2_extended",
  vehicle: "repo:vehicle",
  vehicleLegacyV1: "local_vehicles_v1",
  vehicleLegacyMigratedMeta: "meta:vehicle:legacy-v1:migrated",
  vendor: "local_vendors_v1",
  agency: "local_agencies_v1",
  employee: "local_employees_v1",
  equipment: "local_equipments_v1",
  consumable: "local_consumables_v1",
  partnerBulkSnapshot: "snapshot:partner:bulk",
  daily: "repo:daily",
  dailyProductionLegacyV1: "daily_production_v1",
  dailyProductionLegacyMigratedMeta: "meta:daily:production:legacy-v1:migrated",
  issue: "repo:issue",
  issueDocsLegacyV1: "issue_docs_v1",
  issueLegacyMigratedMeta: "meta:issue:legacy-v1:migrated",
  action: "repo:action",
  actionDocsLegacyV1: "local_action_docs_v1",
  actionLegacyMigratedMeta: "meta:action:legacy-v1:migrated",
  weighingTransactionsLegacyV1: "weighing_transactions_v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
