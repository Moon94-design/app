export type IssuePermissions = {
  canRead: () => boolean;
  canWrite: () => boolean;
  canDelete: () => boolean;
};

export function createDefaultIssuePermissions(): IssuePermissions {
  return {
    canRead: () => true,
    canWrite: () => true,
    canDelete: () => true,
  };
}
