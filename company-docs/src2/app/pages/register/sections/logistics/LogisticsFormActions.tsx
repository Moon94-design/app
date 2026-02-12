type LogisticsFormActionsProps = {
  onOpenIssueModal: () => void;
  onSubmit: () => void;
};

export default function LogisticsFormActions({ onOpenIssueModal, onSubmit }: LogisticsFormActionsProps) {
  return (
    <div className="row">
      <button type="button" className="btn" onClick={onOpenIssueModal}>
        이슈 등록
      </button>
      <button type="button" className="btn primary" onClick={onSubmit}>
        저장
      </button>
    </div>
  );
}
