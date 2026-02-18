export type OfficePermissions = {
  canRead: () => boolean;
  canWrite: () => boolean;
  canDelete: () => boolean;
};

export function createDefaultOfficePermissions(): OfficePermissions {
  return {
    canRead: () => true,
    canWrite: () => true,
    canDelete: () => true,
  };
}
