import { formatDailyLogisticsTitle as formatDailyLogisticsTitleTemplate } from "@kernel/schema/daily";

export function formatDailyLogisticsTitle(input: {
  writerName: string;
  writerRole: string;
  recordDate: string;
}) {
  return formatDailyLogisticsTitleTemplate({
    writerName: input.writerName,
    writerRole: input.writerRole,
    recordDate: input.recordDate,
  });
}
