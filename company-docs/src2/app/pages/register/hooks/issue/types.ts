import type { DailyBranch } from "@kernel/schema/daily";
import type { OfficeLinkedReference, OfficeLinkType } from "../office/types";

export type IssueCategory = "현장" | "설비" | "안전";
export type IssueStatus = "진행중" | "완료";

export type IssueRegisterDraft = {
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  category: IssueCategory;
  title: string;
  details: string;
  linkType: OfficeLinkType;
  linkId: string;
  linkedReferences: OfficeLinkedReference[];
  status: IssueStatus;
};

export type IssueSubmitOptions = {
  contextLabel?: string;
  enforceRecordDate?: string;
  enforceSite?: DailyBranch;
  enforceWriterName?: string;
  enforceWriterRole?: string;
  formatTitleWithWriter?: boolean;
  titleTemplate?: "issue-daily-logistics" | "issue-daily-production";
};

export type IssueSubmitResult = {
  ok: boolean;
  message: string;
  itemId?: string;
  itemTitle?: string;
  status?: IssueStatus;
};
