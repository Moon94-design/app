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
  scrapDetailOptions: string[];
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
};

export default function LogisticsFormSection(props: LogisticsFormSectionProps) {
  return (
    <>
      <div className="form-grid">
        <LogisticsIdentityFields
          draft={props.draft}
          siteOptions={props.siteOptions}
          partners={props.partners}
          vehicles={props.vehicles}
          writerLocked={props.writerLocked}
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
          scrapDetailOptions={props.scrapDetailOptions}
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

      <LogisticsFormActions onOpenIssueModal={props.onOpenIssueModal} onSubmit={props.onSubmit} />
    </>
  );
}
