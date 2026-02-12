export type DailyLogisticsTitleInput = {
  writerName: string;
  writerRole: string;
  recordDate: string;
};

export type IssueDailyLogisticsTitleInput = {
  title: string;
  writerName: string;
  writerRole: string;
  recordDate: string;
};

export type ActionDailyLogisticsTitleInput = {
  issueTitle: string;
  writerName: string;
  writerRole: string;
  recordDate: string;
};

function clean(value: string) {
  return (value || "").trim();
}

function compact(value: string) {
  return clean(value).replace(/\s+/g, " ");
}

function fallback(value: string, empty = "-") {
  const next = compact(value);
  return next || empty;
}

function makeTagPrefix(tags: string[]) {
  return tags.map((tag) => `[${tag}]`).join("");
}

function withLabel(value: string, label: string) {
  return `${fallback(value)}(${label})`;
}

export function buildAutoTitle(
  recordDate: string,
  writerName: string,
  writerRole?: string,
  category?: string,
  suffix = "기록"
) {
  const parts = [recordDate, writerName, writerRole, category ? `[${category}]` : "", suffix]
    .map((item) => clean(item || ""))
    .filter(Boolean);
  return compact(parts.join(" "));
}

export function formatDailyLogisticsTitle(input: DailyLogisticsTitleInput) {
  const writer = fallback(input.writerName);
  const role = fallback(input.writerRole);
  return `${makeTagPrefix(["일일", "유통"])} ${writer} ${role} 작성. ${input.recordDate}`;
}

export function formatIssueDailyLogisticsTitle(input: IssueDailyLogisticsTitleInput) {
  const title = withLabel(input.title, "이슈제목");
  const writer = fallback(input.writerName);
  const role = fallback(input.writerRole);
  return `${makeTagPrefix(["이슈", "일일", "유통"])} ${title} ${writer} ${role} 작성. ${input.recordDate}`;
}

export function formatActionDailyLogisticsTitle(input: ActionDailyLogisticsTitleInput) {
  const issueTitle = withLabel(input.issueTitle, "이슈제목");
  const writer = fallback(input.writerName);
  const role = fallback(input.writerRole);
  return `${makeTagPrefix(["조치", "일일", "유통"])} ${issueTitle} ${writer} ${role} 작성. ${input.recordDate}`;
}
