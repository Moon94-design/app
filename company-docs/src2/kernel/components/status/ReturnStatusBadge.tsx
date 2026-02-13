import type { CSSProperties } from "react";
import StatusBadge from "./StatusBadge";
import type { ReturnStatusLabel, ReturnStatusRole } from "@kernel/schema/daily";

type ReturnStatusBadgeProps = {
  label: ReturnStatusLabel;
  role: ReturnStatusRole;
  style?: CSSProperties;
};

const ROLE_STYLE: Record<ReturnStatusRole, CSSProperties> = {
  "return-record": {
    background: "rgba(46, 160, 67, 0.18)",
    border: "1px solid rgba(46, 160, 67, 0.6)",
    color: "rgba(138, 255, 160, 1)",
  },
  "return-target": {
    background: "rgba(224, 49, 49, 0.18)",
    border: "1px solid rgba(224, 49, 49, 0.62)",
    color: "rgba(255, 142, 142, 1)",
  },
};

export default function ReturnStatusBadge({ label, role, style }: ReturnStatusBadgeProps) {
  return (
    <StatusBadge
      label={label}
      tone="neutral"
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        ...ROLE_STYLE[role],
        ...style,
      }}
    />
  );
}

