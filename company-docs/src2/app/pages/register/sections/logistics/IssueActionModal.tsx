import ActionRegisterForm from "@app2/pages/register/components/ActionRegisterForm";
import IssueRegisterForm from "@app2/pages/register/components/IssueRegisterForm";
import type { ActionRegisterDraft, PendingIssue, VendorOption } from "@app2/pages/register/hooks/useRegisterActionPage";
import type { LinkedReferenceCandidate } from "@app2/pages/register/hooks/common/linkedReferences";
import type { OfficeLinkType, OfficeLinkTypeOption } from "@app2/pages/register/hooks/office/types";
import type { IssueRegisterDraft } from "@app2/pages/register/hooks/useRegisterIssuePage";
import LayerModal from "../common/LayerModal";

type IssueActionModalProps = {
  open: boolean;
  onClose: () => void;
  issueDraft: IssueRegisterDraft;
  issueSiteOptions: readonly IssueRegisterDraft["site"][];
  issueLinkTypeOptions: readonly OfficeLinkTypeOption[];
  issueLineOptions: Array<{ id: string; label: string }>;
  issueSuggestionCandidates: LinkedReferenceCandidate<OfficeLinkType>[];
  updateIssueDraft: (patch: Partial<IssueRegisterDraft>) => void;
  selectIssueLinkedReference: (id: string) => void;
  addIssueSuggestionCandidate: (candidate: LinkedReferenceCandidate<OfficeLinkType>) => void;
  removeIssueLinkedReference: (type: OfficeLinkType, id: string) => void;
  onIssueSubmit: () => void;
  actionDraft: ActionRegisterDraft;
  actionSiteOptions: readonly ActionRegisterDraft["site"][];
  pendingIssues: PendingIssue[];
  vendors: VendorOption[];
  updateActionDraft: (patch: Partial<ActionRegisterDraft>) => void;
  onActionSubmit: () => void;
};

export default function IssueActionModal({
  open,
  onClose,
  issueDraft,
  issueSiteOptions,
  issueLinkTypeOptions,
  issueLineOptions,
  issueSuggestionCandidates,
  updateIssueDraft,
  selectIssueLinkedReference,
  addIssueSuggestionCandidate,
  removeIssueLinkedReference,
  onIssueSubmit,
  actionDraft,
  actionSiteOptions,
  pendingIssues,
  vendors,
  updateActionDraft,
  onActionSubmit,
}: IssueActionModalProps) {
  if (!open) return null;

  return (
    <LayerModal title="이슈 등록" onClose={onClose}>
      <IssueRegisterForm
        draft={issueDraft}
        siteOptions={issueSiteOptions}
        linkTypeOptions={issueLinkTypeOptions}
        lineOptions={issueLineOptions}
        suggestionCandidates={issueSuggestionCandidates}
        onChange={updateIssueDraft}
        onSelectLinkedReference={selectIssueLinkedReference}
        onAddSuggestionCandidate={addIssueSuggestionCandidate}
        onRemoveLinkedReference={removeIssueLinkedReference}
        onSubmit={onIssueSubmit}
        submitLabel="이슈 저장"
        lockRecordDate={true}
        lockSite={true}
        lockWriterName={true}
        lockWriterRole={true}
      />

      {issueDraft.status === "완료" ? (
        <>
          <div className="divider" />
          <h4 className="h1" style={{ fontSize: 15 }}>
            조치기록 입력
          </h4>
          <ActionRegisterForm
            draft={actionDraft}
            pendingIssues={pendingIssues}
            vendors={vendors}
            siteOptions={actionSiteOptions}
            onChange={updateActionDraft}
            onSubmit={onActionSubmit}
            submitLabel="조치 저장"
            lockRecordDate={true}
            lockSite={true}
            lockWriterName={true}
            lockWriterRole={true}
            showIssueLinkField={false}
          />
        </>
      ) : null}
    </LayerModal>
  );
}
