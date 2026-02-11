import { StatusBadge } from "@kernel/components/status";
import { getVendorStatusBadge, type Vendor } from "@kernel/schema/vendor";

type ManageVendorListSectionProps = {
  vendors: Vendor[];
  onEdit: (id: string) => void;
  onDelete: (vendor: Vendor) => void;
};

export default function ManageVendorListSection({
  vendors,
  onEdit,
  onDelete,
}: ManageVendorListSectionProps) {
  if (vendors.length === 0) {
    return <p className="p">업체 데이터가 없습니다.</p>;
  }

  return (
    <>
      {vendors.map((vendor) => {
        const badge = getVendorStatusBadge(vendor.status);
        return (
          <div key={vendor.id} className="card manage-card manage-list-card">
            <div className="manage-list-row">
              <div>
                <div className="manage-list-title manage-list-title-row">
                  {vendor.name}
                  <StatusBadge label={badge.label} tone={badge.tone} />
                </div>
                <div className="p manage-list-meta">
                  {vendor.region || "-"} | {(vendor.scopes || []).join(", ") || "-"}
                </div>
                <div className="p manage-list-meta">
                  연락처: {(vendor.contacts || []).length}건
                </div>
              </div>
              <div className="manage-action-group">
                <button type="button" className="btn manage-action-btn" onClick={() => onEdit(vendor.id)}>
                  수정
                </button>
                <button
                  type="button"
                  className="btn manage-action-btn manage-action-btn--danger"
                  onClick={() => onDelete(vendor)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
