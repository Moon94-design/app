import type { StatusBadgeTone } from "@kernel/components/status";
import type { PartnerStatus } from "./partnerTypes";

export function getPartnerStatusBadge(status: PartnerStatus): { label: string; tone: StatusBadgeTone } {
  if (status === "complete") return { label: "완료", tone: "positive" };
  if (status === "pending") return { label: "보류", tone: "warning" };
  return { label: "미완료", tone: "danger" };
}
