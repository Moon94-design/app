import { formatDailyProductionTitle as formatDailyProductionTitleTemplate } from "@kernel/schema/daily";

export function formatDailyProductionTitle(input: {
  writerName: string;
  writerRole: string;
  recordDate: string;
}) {
  return formatDailyProductionTitleTemplate({
    writerName: input.writerName,
    writerRole: input.writerRole,
    recordDate: input.recordDate,
  });
}
