import type { RepoEntity } from "@kernel/repo";
import type { DailyBranch } from "@kernel/schema/daily";

export type Site = DailyBranch;

export type ActionItemExt = RepoEntity & {
  title: string;
  details: string;
  issueId: string;
  issueLabel: string;
  vendorId?: string;
  vendorLabel: string;
  vendorCost?: number;
  recordDate: string;
  writerName: string;
  writerRole?: string;
  site?: Site;
  tags?: string[];
};

export type ActionDocExt = RepoEntity & {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  site?: Site;
  items: ActionItemExt[];
  createdAt: string;
};

export type PendingIssue = {
  id: string;
  title: string;
  category: string;
  date: string;
  writerName: string;
};

export type VendorOption = {
  id: string;
  name: string;
};

export type ActionRegisterDraft = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site: Site;
  title: string;
  details: string;
  tagsText: string;
  issueId: string;
  issueLabel: string;
  vendorId: string;
  vendorLabel: string;
  vendorCost: number;
};

export type ActionSubmitOptions = {
  enforceRecordDate?: string;
  enforceSite?: Site;
  enforceWriterName?: string;
  enforceWriterRole?: string;
  titleTemplate?: "action-daily-logistics" | "action-daily-production";
};

export type SubmitResult = {
  ok: boolean;
  message: string;
};
