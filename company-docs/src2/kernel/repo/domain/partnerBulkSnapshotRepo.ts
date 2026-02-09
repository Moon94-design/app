import { STORAGE_KEYS } from "../keys";
import { createJsonStorage } from "../storage/jsonStorage";
import type { PartnerV2 } from "@kernel/schema/partner";

export type PartnerBulkSnapshot = {
  savedAt: number;
  items: PartnerV2[];
};

export function createPartnerBulkSnapshotRepo() {
  const storage = createJsonStorage();

  return {
    load(): PartnerBulkSnapshot | null {
      return storage.getItem<PartnerBulkSnapshot>(STORAGE_KEYS.partnerBulkSnapshot);
    },
    save(snapshot: PartnerBulkSnapshot): void {
      storage.setItem(STORAGE_KEYS.partnerBulkSnapshot, snapshot);
    },
    clear(): void {
      storage.removeItem(STORAGE_KEYS.partnerBulkSnapshot);
    },
  };
}
