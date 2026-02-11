import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import { createJsonStorage } from "../storage/jsonStorage";
import type { RepoContract, RepoEntity } from "../types";

export type VehicleRecord = RepoEntity & Record<string, unknown>;

export function createVehicleRepo(): RepoContract<VehicleRecord> {
  const storage = createJsonStorage();
  const primaryRepo = createLocalRepo<VehicleRecord>({
    storageKey: STORAGE_KEYS.vehicle,
    storage,
  });

  let migrated = false;

  async function ensureLegacyMigration() {
    if (migrated) return;

    const migratedMeta = storage.getItem<boolean>(STORAGE_KEYS.vehicleLegacyMigratedMeta);
    if (migratedMeta) {
      migrated = true;
      return;
    }

    const primary = storage.getItem<VehicleRecord[]>(STORAGE_KEYS.vehicle) ?? [];
    const legacy = storage.getItem<VehicleRecord[]>(STORAGE_KEYS.vehicleLegacyV1) ?? [];

    if (legacy.length > 0) {
      const merged = new Map<string, VehicleRecord>();

      // primary 우선: 이미 src2에서 생성/수정된 데이터는 보존
      for (const item of primary) {
        if (!item?.id) continue;
        merged.set(item.id, item);
      }

      // legacy는 없는 id만 보강(부분 이관 케이스 대응)
      for (const item of legacy) {
        if (!item?.id) continue;
        if (!merged.has(item.id)) {
          merged.set(item.id, item);
        }
      }

      storage.setItem(STORAGE_KEYS.vehicle, Array.from(merged.values()));
    }

    storage.setItem(STORAGE_KEYS.vehicleLegacyMigratedMeta, true);
    migrated = true;
  }

  return {
    async getAll() {
      await ensureLegacyMigration();
      return primaryRepo.getAll();
    },
    async getById(id) {
      await ensureLegacyMigration();
      return primaryRepo.getById(id);
    },
    async upsert(item) {
      await ensureLegacyMigration();
      return primaryRepo.upsert(item);
    },
    async upsertMany(items) {
      await ensureLegacyMigration();
      return primaryRepo.upsertMany(items);
    },
    async remove(id) {
      await ensureLegacyMigration();
      return primaryRepo.remove(id);
    },
    async removeMany(ids) {
      await ensureLegacyMigration();
      return primaryRepo.removeMany(ids);
    },
  };
}
