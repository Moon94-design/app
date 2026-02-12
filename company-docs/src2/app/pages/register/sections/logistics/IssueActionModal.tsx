import ActionRegisterForm from "@app2/pages/register/components/ActionRegisterForm";
import IssueRegisterForm from "@app2/pages/register/components/IssueRegisterForm";
import type { ActionRegisterDraft, PendingIssue, VendorOption } from "@app2/pages/register/hooks/useRegisterActionPage";
import type { IssueRegisterDraft } from "@app2/pages/register/hooks/useRegisterIssuePage";
import LayerModal from "./LayerModal";

type IssueActionModalProps = {
  open: boolean;
  onClose: () => void;
  issueDraft: IssueRegisterDraft;
  issueSiteOptions: readonly IssueRegisterDraft["site"][];
  updateIssueDraft: (patch: Partial<IssueRegisterDraft>) => void;
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
  updateIssueDraft,
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
        onChange={updateIssueDraft}
        onSubmit={onIssueSubmit}
        submitLabel="이슈 저장"
        lockRecordDate={true}
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
            showIssueLinkField={false}
          />
        </>
      ) : null}
    </LayerModal>
  );
}
