import { DailyMetaFields } from "@kernel/components/record";
import type { LogisticsDraft, PartnerOption, VehicleOption } from "@app2/pages/register/hooks/logistics/types";

type LogisticsIdentityFieldsProps = {
  draft: LogisticsDraft;
  siteOptions: readonly LogisticsDraft["site"][];
  partners: PartnerOption[];
  vehicles: VehicleOption[];
  writerLocked: boolean;
  vehicleSuggestions: string[];
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
  onOpenPartnerModal: () => void;
  onOpenVehicleModal: () => void;
};

export default function LogisticsIdentityFields({
  draft,
  siteOptions,
  partners,
  vehicles,
  writerLocked,
  vehicleSuggestions,
  updateDraft,
  onOpenPartnerModal,
  onOpenVehicleModal,
}: LogisticsIdentityFieldsProps) {
  return (
    <>
      <DailyMetaFields
        recordDate={draft.recordDate}
        site={draft.site}
        writerName={draft.writerName}
        writerRole={draft.writerRole}
        siteOptions={siteOptions}
        onChangeRecordDate={(next) => updateDraft({ recordDate: next })}
        onChangeSite={(next) => updateDraft({ site: next })}
        onChangeWriterName={(next) => updateDraft({ writerName: next })}
        onChangeWriterRole={(next) => updateDraft({ writerRole: next })}
        lockWriterName={writerLocked}
      />

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
          <select className="input" value={draft.partnerId} onChange={(e) => updateDraft({ partnerId: e.target.value })}>
            <option value="">선택 안함</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.label}
              </option>
            ))}
          </select>
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
          <select className="input" value={draft.vehicleId} onChange={(e) => updateDraft({ vehicleId: e.target.value })}>
            <option value="">선택 안함</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicleNo}
              </option>
            ))}
          </select>

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
    </>
  );
}
