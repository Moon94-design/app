export function normalizeNameKey(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function normalizeVehicleNoKey(value: string): string {
  return value.trim().replace(/[\s-]+/g, "").toLocaleUpperCase();
}

export function findDuplicateByName<T extends { id: string }>(
  rows: T[],
  getName: (row: T) => string,
  targetName: string,
  excludeId?: string
): T | null {
  const target = normalizeNameKey(targetName);
  if (!target) return null;
  return (
    rows.find((row) => {
      if (excludeId && row.id === excludeId) return false;
      return normalizeNameKey(getName(row)) === target;
    }) ?? null
  );
}

export function findDuplicateByNamePair<T extends { id: string }>(
  rows: T[],
  getBaseName: (row: T) => string,
  getDetailTag: (row: T) => string,
  targetBaseName: string,
  targetDetailTag: string,
  excludeId?: string
): T | null {
  const baseName = normalizeNameKey(targetBaseName);
  const detailTag = normalizeNameKey(targetDetailTag);
  if (!baseName) return null;
  return (
    rows.find((row) => {
      if (excludeId && row.id === excludeId) return false;
      return (
        normalizeNameKey(getBaseName(row)) === baseName &&
        normalizeNameKey(getDetailTag(row)) === detailTag
      );
    }) ?? null
  );
}

export function findSameBaseNameRows<T extends { id: string }>(
  rows: T[],
  getBaseName: (row: T) => string,
  targetBaseName: string,
  excludeId?: string
): T[] {
  const baseName = normalizeNameKey(targetBaseName);
  if (!baseName) return [];
  return rows.filter((row) => {
    if (excludeId && row.id === excludeId) return false;
    return normalizeNameKey(getBaseName(row)) === baseName;
  });
}

export function findDuplicateByVehicleNo<T extends { id: string }>(
  rows: T[],
  getVehicleNo: (row: T) => string,
  targetVehicleNo: string,
  excludeId?: string
): T | null {
  const target = normalizeVehicleNoKey(targetVehicleNo);
  if (!target) return null;
  return (
    rows.find((row) => {
      if (excludeId && row.id === excludeId) return false;
      return normalizeVehicleNoKey(getVehicleNo(row)) === target;
    }) ?? null
  );
}
