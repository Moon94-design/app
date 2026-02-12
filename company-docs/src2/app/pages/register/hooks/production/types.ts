import type { RepoEntity } from "@kernel/repo";
import type { ProductionRecord } from "@kernel/schema/daily";

export type DailyRepoRecord = RepoEntity & Record<string, unknown>;
export type MasterRepoRecord = RepoEntity & Record<string, unknown>;

export type SuggestCandidate = {
  tag: string;
  source: "system" | "personal";
};

export type SubmitResult = {
  ok: boolean;
  message: string;
};

export type ProductionDocs = ProductionRecord[];
