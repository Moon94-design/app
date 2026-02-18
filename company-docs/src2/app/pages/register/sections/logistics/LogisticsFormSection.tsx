import { DailyMetaFields } from "@kernel/components/record";
import type { Direction, Kind } from "@kernel/schema/daily";
import type { LogisticsDraft, PartnerOption, ProductCategory, VehicleOption } from "@app2/pages/register/hooks/logistics/types";
import LogisticsFormActions from "./LogisticsFormActions";
import LogisticsIdentityFields from "./LogisticsIdentityFields";
import LogisticsTypeFields from "./LogisticsTypeFields";
import LogisticsWeightFields from "./LogisticsWeightFields";

type LogisticsFormSectionProps = {
  draft: LogisticsDraft;
  siteOptions: readonly LogisticsDraft["site"][];
  partners: PartnerOption[];
  vehicles: VehicleOption[];
  kinds: Kind[];
  directionOptions: Direction[];
  categoryOptions: ProductCategory[];
  hasCategorySelection: boolean;
  hasPriceSelection: boolean;
  showScrapDetailSelection: boolean;
  isReturnSourceLocked: boolean;
  scrapDetailOptions: string[];
  customScrapDetailOptions: string[];
  customDetailInput: string;
  setCustomDetailInput: (value: string) => void;
  showCustomDetailInput: boolean;
  setShowCustomDetailInput: (updater: (prev: boolean) => boolean) => void;
  vehicleSuggestions: string[];
  writerLocked: boolean;
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
  selectScrapDetail: (detailItem: string) => void;
  applyCustomScrapDetail: () => { ok: boolean; message: string };
  onOpenPartnerModal: () => void;
  onOpenVehicleModal: () => void;
  onOpenIssueModal: () => void;
  onSubmit: () => void;
  submitLabel?: string;
};

export default function LogisticsFormSection(props: LogisticsFormSectionProps) {
  return (
    <>
      <div className="form-grid">
        <DailyMetaFields
          recordDate={props.draft.recordDate}
          site={props.draft.site}
          writerName={props.draft.writerName}
          writerRole={props.draft.writerRole}
          siteOptions={props.siteOptions}
          onChangeRecordDate={(next) => props.updateDraft({ recordDate: next })}
          onChangeSite={(next) => props.updateDraft({ site: next })}
          onChangeWriterName={(next) => props.updateDraft({ writerName: next })}
          onChangeWriterRole={(next) => props.updateDraft({ writerRole: next })}
          lockSite={false}
          lockWriterName={props.writerLocked}
          lockWriterRole={props.writerLocked}
        />
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h2 className="h1" style={{ fontSize: 16 }}>
          유통 항목 추가
        </h2>

        <div className="form-grid" style={{ marginTop: 10 }}>
          <LogisticsIdentityFields
            draft={props.draft}
            partners={props.partners}
            vehicles={props.vehicles}
            vehicleSuggestions={props.vehicleSuggestions}
            updateDraft={props.updateDraft}
            onOpenPartnerModal={props.onOpenPartnerModal}
            onOpenVehicleModal={props.onOpenVehicleModal}
          />

          <LogisticsTypeFields
            draft={props.draft}
            kinds={props.kinds}
            directionOptions={props.directionOptions}
            categoryOptions={props.categoryOptions}
            hasCategorySelection={props.hasCategorySelection}
            showScrapDetailSelection={props.showScrapDetailSelection}
            lockCoreFields={props.isReturnSourceLocked}
            scrapDetailOptions={props.scrapDetailOptions}
            customScrapDetailOptions={props.customScrapDetailOptions}
            customDetailInput={props.customDetailInput}
            setCustomDetailInput={props.setCustomDetailInput}
            showCustomDetailInput={props.showCustomDetailInput}
            setShowCustomDetailInput={props.setShowCustomDetailInput}
            updateDraft={props.updateDraft}
            selectScrapDetail={props.selectScrapDetail}
            applyCustomScrapDetail={props.applyCustomScrapDetail}
          />

          <LogisticsWeightFields
            draft={props.draft}
            hasPriceSelection={props.hasPriceSelection}
            updateDraft={props.updateDraft}
          />
        </div>

        <LogisticsFormActions
          onOpenIssueModal={props.onOpenIssueModal}
          onSubmit={props.onSubmit}
          submitLabel={props.submitLabel}
        />
      </div>
    </>
  );
}
