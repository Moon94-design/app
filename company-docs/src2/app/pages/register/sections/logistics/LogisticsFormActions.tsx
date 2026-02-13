type LogisticsFormActionsProps = {
  onOpenIssueModal: () => void;
  onSubmit: () => void;
  submitLabel?: string;
};

export default function LogisticsFormActions({
  onOpenIssueModal,
  onSubmit,
  submitLabel = "저장",
}: LogisticsFormActionsProps) {
  return (
    <div className="row">
      <button type="button" className="btn" onClick={onOpenIssueModal}>
        이슈 등록
      </button>
      <button type="button" className="btn primary" onClick={onSubmit}>
        {submitLabel}
      </button>
    </div>
  );
}
