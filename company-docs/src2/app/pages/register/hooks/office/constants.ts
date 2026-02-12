import { DAILY_BRANCH_OPTIONS, type DailyBranch } from "@kernel/schema/daily";
import { todayYmd } from "@kernel/utils";
import type { OfficeDraft } from "./types";

export const OFFICE_BRANCH_OPTIONS: readonly DailyBranch[] = DAILY_BRANCH_OPTIONS;

export function parseTags(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function defaultDraft(): OfficeDraft {
  return {
    recordDate: todayYmd(),
    site: OFFICE_BRANCH_OPTIONS[0],
    writerName: "",
    writerRole: "",
    title: "",
    details: "",
    tagsText: "",
    extraAgencies: [],
    extraEtc: [],
  };
}
