import { Link } from "react-router-dom";

export type ManageInfoNoticeItem = {
  label: string;
  to?: string;
  text: string;
  enabled?: boolean;
};

type ManageInfoNoticeProps = {
  items: ManageInfoNoticeItem[];
};

export default function ManageInfoNotice({ items }: ManageInfoNoticeProps) {
  const visibleItems = items.filter((item) => item.enabled !== false);
  if (visibleItems.length === 0) return null;

  return (
    <div className="manage-info-notice">
      {visibleItems.map((item) => (
        <p key={`${item.label}:${item.to ?? item.text}`} className="manage-info-notice__line">
          <strong>{item.label}</strong>{" "}
          {item.to ? (
            <>
              <Link to={item.to} className="manage-info-notice__link">
                {item.text}
              </Link>
              에서 진행할 수 있다.
            </>
          ) : (
            item.text
          )}
        </p>
      ))}
    </div>
  );
}
