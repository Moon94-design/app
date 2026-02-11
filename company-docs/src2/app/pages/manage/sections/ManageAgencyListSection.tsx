import { BaseRecentList } from "@kernel/components/recent";
import { StatusBadge } from "@kernel/components/status";
import type { Agency } from "@kernel/schema/agency";

type ManageAgencyListSectionProps = {
  agencies: Agency[];
  onEdit: (id: string) => void;
  onDelete: (agency: Agency) => void;
};

export default function ManageAgencyListSection({
  agencies,
  onEdit,
  onDelete,
}: ManageAgencyListSectionProps) {
  return (
    <BaseRecentList
      title="저장된 기관"
      items={agencies}
      getKey={(agency) => agency.id}
      renderPrimary={(agency) => (
        <>
          {agency.baseName}
          {agency.detailTag ? (
            <span className="manage-inline-gap manage-inline-muted">
              · {agency.detailTag}
            </span>
          ) : null}
          <span className="manage-inline-gap">
            <StatusBadge
              label={agency.status}
              tone={agency.status === "거래중" ? "positive" : agency.status === "보류" ? "warning" : "danger"}
            />
          </span>
        </>
      )}
      renderSecondary={(agency) => `${agency.region} · ${agency.scopes.join(", ")}`}
      renderAction={(agency) => (
        <div className="manage-action-group">
          <button type="button" className="btn manage-action-btn" onClick={() => onEdit(agency.id)}>
            수정
          </button>
          <button
            type="button"
            className="btn manage-action-btn manage-action-btn--danger"
            onClick={() => onDelete(agency)}
          >
            삭제
          </button>
        </div>
      )}
    />
  );
}
