import { DAILY_BRANCH_OPTIONS, type DailyBranch } from "@kernel/schema/daily";
import { todayYmd } from "@kernel/utils";
import type { ActionRegisterDraft } from "./types";

export const ACTION_BRANCH_OPTIONS: readonly DailyBranch[] = DAILY_BRANCH_OPTIONS;

export function makeActionDocId(recordDate: string, site: DailyBranch, writerName: string) {
  return `ACTION_${recordDate}_${site}_${writerName.trim()}`;
}

export function defaultDraft(): ActionRegisterDraft {
  return {
    recordDate: todayYmd(),
    writerName: "",
    writerRole: "",
    site: ACTION_BRANCH_OPTIONS[0],
    title: "",
    details: "",
    tagsText: "",
    issueId: "",
    issueLabel: "",
    vendorId: "",
    vendorLabel: "",
    vendorCost: 0,
  };
}
