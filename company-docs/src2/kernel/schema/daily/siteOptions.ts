export const DAILY_BRANCH_OPTIONS = ["대구", "성주"] as const;

export type DailyBranch = (typeof DAILY_BRANCH_OPTIONS)[number];

export type LogisticsSiteCode = "daegu" | "seongju" | "";

// Legacy value "경주" is normalized to "성주".
export function normalizeDailyBranch(value: unknown): DailyBranch | undefined {
  if (value === "대구") return "대구";
  if (value === "성주" || value === "경주") return "성주";
  return undefined;
}

export function toLogisticsSiteCode(branch: DailyBranch | ""): LogisticsSiteCode {
  if (branch === "대구") return "daegu";
  if (branch === "성주") return "seongju";
  return "";
}

export function fromLogisticsSiteCode(code: LogisticsSiteCode): DailyBranch {
  if (code === "seongju") return "성주";
  return "대구";
}
