import type { LogisticsTone } from "@kernel/schema/daily";

export const LOGISTICS_AMOUNT_TONE_COLOR: Record<LogisticsTone, string> = {
  inbound: "rgba(255,168,168,1)",
  outbound: "rgba(147,255,173,1)",
  neutral: "rgba(240,240,240,0.95)",
};
