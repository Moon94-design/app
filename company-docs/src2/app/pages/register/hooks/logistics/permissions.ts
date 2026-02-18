export type LogisticsPermissions = {
  canRead: () => boolean;
  canWrite: () => boolean;
  canDelete: () => boolean;
};

export function createDefaultLogisticsPermissions(): LogisticsPermissions {
  return {
    canRead: () => true,
    canWrite: () => true,
    canDelete: () => true,
  };
}

