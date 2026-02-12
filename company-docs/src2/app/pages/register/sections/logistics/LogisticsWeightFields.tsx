import type { LogisticsDraft } from "@app2/pages/register/hooks/logistics/types";

type LogisticsWeightFieldsProps = {
  draft: LogisticsDraft;
  hasPriceSelection: boolean;
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
};

export default function LogisticsWeightFields({
  draft,
  hasPriceSelection,
  updateDraft,
}: LogisticsWeightFieldsProps) {
  return (
    <>
      <div className="form-two-col">
        <div className="form-field">
          <p className="form-label">총중량 (Kg)</p>
          <input
            className="input"
            inputMode="numeric"
            value={String(draft.grossKg)}
            onChange={(e) => updateDraft({ grossKg: Number(e.target.value || 0) })}
          />
        </div>
        <div className="form-field">
          <p className="form-label">공차중량 (Kg)</p>
          <input
            className="input"
            inputMode="numeric"
            value={String(draft.tareKg)}
            onChange={(e) => updateDraft({ tareKg: Number(e.target.value || 0) })}
          />
        </div>
      </div>

      <div className="form-two-col">
        <div className="form-field">
          <p className="form-label">실중량 (Kg)</p>
          <input className="input" value={String(draft.kg)} readOnly />
        </div>
        <div className="form-field">
          <p className="form-label">단가 (원/Kg)</p>
          <input
            className="input"
            inputMode="numeric"
            value={String(draft.unitPricePerKg)}
            onChange={(e) => updateDraft({ unitPricePerKg: Number(e.target.value || 0) })}
            disabled={!hasPriceSelection}
          />
        </div>
      </div>
    </>
  );
}
