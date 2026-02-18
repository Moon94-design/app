import IssueRegisterForm from "@app2/pages/register/components/IssueRegisterForm";
import type { IssueRegisterDraft } from "@app2/pages/register/hooks/useRegisterIssuePage";
import LayerModal from "../common/LayerModal";

type ProductionIssueModalProps = {
  open: boolean;
  onClose: () => void;
  issueDraft: IssueRegisterDraft;
  issueSiteOptions: readonly IssueRegisterDraft["site"][];
  updateIssueDraft: (patch: Partial<IssueRegisterDraft>) => void;
  onIssueSubmit: () => void;
};

export default function ProductionIssueModal({
  open,
  onClose,
  issueDraft,
  issueSiteOptions,
  updateIssueDraft,
  onIssueSubmit,
}: ProductionIssueModalProps) {
  if (!open) return null;

  return (
    <LayerModal title="생산 이슈 등록" onClose={onClose}>
      <IssueRegisterForm
        draft={issueDraft}
        siteOptions={issueSiteOptions}
        onChange={updateIssueDraft}
        onSubmit={onIssueSubmit}
        submitLabel="이슈 저장"
        lockRecordDate={true}
        lockSite={true}
        lockWriterName={true}
        lockWriterRole={true}
      />
    </LayerModal>
  );
}
