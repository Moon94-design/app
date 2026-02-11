import { BaseRecentList } from "@kernel/components/recent";
import type { Vendor } from "@kernel/schema/vendor";

type Props = {
  vendors: Vendor[];
  onRemove: (id: string) => void;
};

export default function VendorRecentList({ vendors, onRemove }: Props) {
  return (
    <BaseRecentList
      title="저장된 업체"
      items={vendors}
      getKey={(vendor) => vendor.id}
      renderPrimary={(vendor) => vendor.name}
      renderSecondary={(vendor) => `${vendor.region} · ${vendor.status}`}
      renderAction={(vendor) => (
        <button type="button" className="btn danger" onClick={() => onRemove(vendor.id)}>
          삭제
        </button>
      )}
    />
  );
}
