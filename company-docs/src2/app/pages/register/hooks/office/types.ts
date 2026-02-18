import type { DailyBranch } from "@kernel/schema/daily";
import type { RepoEntity } from "@kernel/repo";

export type DailyRepoRecord = RepoEntity & Record<string, unknown>;

export type OfficeLinkType =
  | "partner"
  | "vehicle"
  | "consumable"
  | "equipment"
  | "agency"
  | "employee"
  | "vendor";

export type OfficeLinkTypeOption = {
  id: OfficeLinkType;
  label: string;
};

export type OfficeLinkOption = {
  id: string;
  label: string;
};

export type OfficeLinkedReference = {
  type: OfficeLinkType;
  id: string;
  label: string;
};

export type OfficeLine = {
  id: string;
  subtitle: string;
  details: string;
  linkedReferences: OfficeLinkedReference[];
};

export type OfficeHistoryLineItem = {
  recordId: string;
  line: OfficeLine;
  recordDate: string;
  site: string;
  writerName: string;
  writerRole: string;
};

export type OfficeLineDraft = {
  subtitle: string;
  details: string;
  linkType: OfficeLinkType;
  linkId: string;
  linkedReferences: OfficeLinkedReference[];
};

export type OfficeRecord = {
  id: string;
  kind: "office";
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  title: string;
  details: string;
  tags: string[];
  lines: OfficeLine[];
  createdAt: string;
  updatedAt: number;
};

export type OfficeDraft = {
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  lineDraft: OfficeLineDraft;
  lines: OfficeLine[];
};

export type SubmitResult = {
  ok: boolean;
  message: string;
};
