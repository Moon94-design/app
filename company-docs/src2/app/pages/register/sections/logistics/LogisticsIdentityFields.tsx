import type { LogisticsDraft, PartnerOption, VehicleOption } from "@app2/pages/register/hooks/logistics/types";
import FilterableSelect from "@app2/pages/register/sections/common/FilterableSelect";

type LogisticsIdentityFieldsProps = {
  draft: LogisticsDraft;
  partners: PartnerOption[];
  vehicles: VehicleOption[];
  vehicleSuggestions: string[];
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
  onOpenPartnerModal: () => void;
  onOpenVehicleModal: () => void;
};

export default function LogisticsIdentityFields({
  draft,
  partners,
  vehicles,
  vehicleSuggestions,
  updateDraft,
  onOpenPartnerModal,
  onOpenVehicleModal,
}: LogisticsIdentityFieldsProps) {
  return (
    <div className="form-two-col" style={{ alignItems: "start" }}>
      <div className="form-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <p className="form-label" style={{ margin: 0 }}>
            거래처 선택
          </p>
          <button type="button" className="btn" onClick={onOpenPartnerModal}>
            + 추가
          </button>
        </div>
        <FilterableSelect
          value={draft.partnerId}
          options={partners.map((partner) => ({ id: partner.id, label: partner.label }))}
          onChange={(nextId) => updateDraft({ partnerId: nextId })}
          searchPlaceholder="거래처 포함 검색"
          noResultText="검색 결과가 없습니다. 아래 목록에서 기존 거래처를 선택해 주세요."
        />
      </div>

      <div className="form-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <p className="form-label" style={{ margin: 0 }}>
            차량 선택
          </p>
          <button type="button" className="btn" onClick={onOpenVehicleModal}>
            + 추가
          </button>
        </div>
        <FilterableSelect
          value={draft.vehicleId}
          options={vehicles.map((vehicle) => ({ id: vehicle.id, label: vehicle.vehicleNo }))}
          onChange={(nextId) => updateDraft({ vehicleId: nextId })}
          searchPlaceholder="차량번호 포함 검색"
          noResultText="검색 결과가 없습니다. 아래 목록에서 기존 차량을 선택해 주세요."
        />

        {vehicleSuggestions.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <p className="p" style={{ marginTop: 0, marginBottom: 6, fontSize: 12, opacity: 0.75 }}>
              거래처 최근 선택 차량번호 추천
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {vehicleSuggestions.map((vehicleNo) => (
                <button
                  key={vehicleNo}
                  type="button"
                  className="btn"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                  onClick={() => updateDraft({ vehicleNo })}
                >
                  {vehicleNo}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
