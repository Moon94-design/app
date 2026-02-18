export type DailyLogisticsTitleInput = {
  writerName: string;
  writerRole: string;
  recordDate: string;
};

export type DailyProductionTitleInput = {
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

export type IssueDailyProductionTitleInput = {
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

export type ActionDailyProductionTitleInput = {
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

function sanitizeWriterToken(value: string) {
  return compact(value)
    .replace(/\(\s*(작성자|직책|이름)\s*\)/g, "")
    .trim();
}

function makeTagPrefix(tags: string[]) {
  return tags.map((tag) => `[${tag}]`).join("");
}

function withLabel(value: string, label: string) {
  return `${fallback(value)}(${label})`;
}

function formatTaggedDailyTitle(tags: string[], writerName: string, writerRole: string, recordDate: string) {
  const writer = fallback(sanitizeWriterToken(writerName));
  const role = fallback(sanitizeWriterToken(writerRole));
  return `${makeTagPrefix(tags)} ${writer} ${role} 작성. ${recordDate}`;
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
  return formatTaggedDailyTitle(["일일", "유통"], input.writerName, input.writerRole, input.recordDate);
}

export function formatDailyProductionTitle(input: DailyProductionTitleInput) {
  return formatTaggedDailyTitle(["일일", "생산"], input.writerName, input.writerRole, input.recordDate);
}

export function formatIssueDailyLogisticsTitle(input: IssueDailyLogisticsTitleInput) {
  const title = withLabel(input.title, "이슈제목");
  const writer = fallback(sanitizeWriterToken(input.writerName));
  const role = fallback(sanitizeWriterToken(input.writerRole));
  return `${makeTagPrefix(["이슈", "일일", "유통"])} ${title} ${writer} ${role} 작성. ${input.recordDate}`;
}

export function formatIssueDailyProductionTitle(input: IssueDailyProductionTitleInput) {
  const title = withLabel(input.title, "이슈제목");
  const writer = fallback(sanitizeWriterToken(input.writerName));
  const role = fallback(sanitizeWriterToken(input.writerRole));
  return `${makeTagPrefix(["이슈", "일일", "생산"])} ${title} ${writer} ${role} 작성. ${input.recordDate}`;
}

export function formatActionDailyLogisticsTitle(input: ActionDailyLogisticsTitleInput) {
  const issueTitle = withLabel(input.issueTitle, "이슈제목");
  const writer = fallback(sanitizeWriterToken(input.writerName));
  const role = fallback(sanitizeWriterToken(input.writerRole));
  return `${makeTagPrefix(["조치", "일일", "유통"])} ${issueTitle} ${writer} ${role} 작성. ${input.recordDate}`;
}

export function formatActionDailyProductionTitle(input: ActionDailyProductionTitleInput) {
  const issueTitle = withLabel(input.issueTitle, "이슈제목");
  const writer = fallback(sanitizeWriterToken(input.writerName));
  const role = fallback(sanitizeWriterToken(input.writerRole));
  return `${makeTagPrefix(["조치", "일일", "생산"])} ${issueTitle} ${writer} ${role} 작성. ${input.recordDate}`;
}

export type DailyOfficeTitleInput = {
  writerName: string;
  writerRole: string;
  recordDate: string;
};

export function formatDailyOfficeTitle(input: DailyOfficeTitleInput) {
  return formatTaggedDailyTitle(["일일", "사무"], input.writerName, input.writerRole, input.recordDate);
}
