import type { DailyBranch } from "@kernel/schema/daily";
import type { RepoEntity } from "@kernel/repo";

export type DailyRepoRecord = RepoEntity & Record<string, unknown>;

export type AgencyOption = {
  id: string;
  label: string;
};

export type OfficeExtraAgency = {
  id: string;
  agencyId: string;
  agencyLabel: string;
  title: string;
  details: string;
};

export type OfficeExtraEtc = {
  id: string;
  title: string;
  details: string;
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
  extraAgencies: OfficeExtraAgency[];
  extraEtc: OfficeExtraEtc[];
  createdAt: string;
  updatedAt: number;
};

export type OfficeDraft = {
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  title: string;
  details: string;
  tagsText: string;
  extraAgencies: OfficeExtraAgency[];
  extraEtc: OfficeExtraEtc[];
};

export type SubmitResult = {
  ok: boolean;
  message: string;
};
