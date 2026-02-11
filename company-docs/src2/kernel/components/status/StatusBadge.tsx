import type { CSSProperties } from "react";

export type StatusBadgeTone = "neutral" | "positive" | "warning" | "danger";

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  style?: CSSProperties;
};

const TONE_STYLE: Record<StatusBadgeTone, CSSProperties> = {
  neutral: { background: "#495057", color: "#fff" },
  positive: { background: "#4c6ef5", color: "#fff" },
  warning: { background: "#f08c00", color: "#fff" },
  danger: { background: "#e03131", color: "#fff" },
};

export default function StatusBadge({ label, tone = "neutral", style }: StatusBadgeProps) {
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 900,
        ...TONE_STYLE[tone],
        ...style,
      }}
    >
      {label}
    </span>
  );
}
