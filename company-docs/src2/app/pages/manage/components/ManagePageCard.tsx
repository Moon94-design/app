import type { ReactNode } from "react";
import "../manage-page-layout.css";

type ManagePageCardProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
};

export default function ManagePageCard({
  title,
  actionLabel,
  onAction,
  children,
  className,
}: ManagePageCardProps) {
  return (
    <div className={`card manage-page${className ? ` ${className}` : ""}`}>
      <div className="manage-page__header">
        <h1 className="h1">{title}</h1>
        {onAction ? (
          <button type="button" className="btn" onClick={onAction}>
            {actionLabel ?? "뒤로"}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
