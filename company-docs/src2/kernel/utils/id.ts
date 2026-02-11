export function createLocalId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return `${prefix}_${uuid}`;
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
