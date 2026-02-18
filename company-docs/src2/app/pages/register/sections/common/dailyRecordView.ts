import type { CSSProperties } from "react";

export function buildDailyRecordTitle(tag: string, writerName: string, writerRole: string, recordDate: string) {
  const writer = (writerName || "-").trim() || "-";
  const role = (writerRole || "-").trim() || "-";
  const date = (recordDate || "-").trim() || "-";
  return `[일일][${tag}] ${writer} ${role} ${date}`;
}

export const compactGhostButtonStyle: CSSProperties = {
  padding: "2px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "inherit",
  fontSize: 12,
  cursor: "pointer",
};

export const compactDangerButtonStyle: CSSProperties = {
  padding: "2px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,77,79,0.6)",
  background: "transparent",
  color: "#ff4d4f",
  fontSize: 12,
  cursor: "pointer",
};

export const compactPrimaryButtonStyle: CSSProperties = {
  padding: "2px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.28)",
  background: "rgba(255,255,255,0.08)",
  color: "inherit",
  fontSize: 12,
  cursor: "pointer",
};

export const compactCardStyle: CSSProperties = {
  marginTop: 8,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.02)",
};

export const compactSubCardStyle: CSSProperties = {
  marginTop: 6,
  padding: "6px 8px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
};
