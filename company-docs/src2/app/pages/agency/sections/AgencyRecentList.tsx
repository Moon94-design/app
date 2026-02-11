import { BaseRecentList } from "@kernel/components/recent";
import type { Agency } from "@kernel/schema/agency";

type Props = {
  agencies: Agency[];
  onRemove: (id: string) => void;
};

export default function AgencyRecentList({ agencies, onRemove }: Props) {
  return (
    <BaseRecentList
      title="저장된 기관"
      items={agencies}
      getKey={(agency) => agency.id}
      renderPrimary={(agency) => (
        <>
          {agency.baseName}
          {agency.detailTag ? <span style={{ marginLeft: 8, opacity: 0.7 }}>· {agency.detailTag}</span> : null}
        </>
      )}
      renderSecondary={(agency) => `${agency.status} · ${agency.region}`}
      renderAction={(agency) => (
        <button type="button" className="btn danger" onClick={() => onRemove(agency.id)}>
          삭제
        </button>
      )}
    />
  );
}
