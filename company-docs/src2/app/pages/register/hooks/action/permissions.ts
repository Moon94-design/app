export type ActionPermissions = {
  canRead: () => boolean;
  canWrite: () => boolean;
  canDelete: () => boolean;
};

export function createDefaultActionPermissions(): ActionPermissions {
  return {
    canRead: () => true,
    canWrite: () => true,
    canDelete: () => true,
  };
}
