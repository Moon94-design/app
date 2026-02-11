import type { StatusBadgeTone } from "@kernel/components/status";
import type { VendorStatus } from "./vendorTypes";

export function resolveVendorStatus(status: VendorStatus): VendorStatus {
  return status;
}

export function getVendorStatusBadge(status: VendorStatus): { label: string; tone: StatusBadgeTone } {
  if (status === "거래중") return { label: "거래중", tone: "positive" };
  if (status === "보류") return { label: "보류", tone: "warning" };
  return { label: "중단", tone: "danger" };
}
