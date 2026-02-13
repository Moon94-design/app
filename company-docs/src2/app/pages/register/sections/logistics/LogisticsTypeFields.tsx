import type { Direction, Item, Kind } from "@kernel/schema/daily";
import type { LogisticsDraft, ProductCategory } from "@app2/pages/register/hooks/logistics/types";

type LogisticsTypeFieldsProps = {
  draft: LogisticsDraft;
  kinds: Kind[];
  directionOptions: Direction[];
  categoryOptions: ProductCategory[];
  hasCategorySelection: boolean;
  showScrapDetailSelection: boolean;
  lockCoreFields: boolean;
  scrapDetailOptions: string[];
  customDetailInput: string;
  setCustomDetailInput: (value: string) => void;
  showCustomDetailInput: boolean;
  setShowCustomDetailInput: (updater: (prev: boolean) => boolean) => void;
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
  selectScrapDetail: (detailItem: string) => void;
  applyCustomScrapDetail: () => { ok: boolean; message: string };
};

export default function LogisticsTypeFields({
  draft,
  kinds,
  directionOptions,
  categoryOptions,
  hasCategorySelection,
  showScrapDetailSelection,
  lockCoreFields,
  scrapDetailOptions,
  customDetailInput,
  setCustomDetailInput,
  showCustomDetailInput,
  setShowCustomDetailInput,
  updateDraft,
  selectScrapDetail,
  applyCustomScrapDetail,
}: LogisticsTypeFieldsProps) {
  const canShowCustomDetailInput = showScrapDetailSelection && showCustomDetailInput;
  const itemLabel = hasCategorySelection ? "품목" : "종류";

  return (
    <>
      {lockCoreFields ? (
        <p className="p" style={{ marginTop: 0, marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
          반품 원본 기준으로 방향/품목/종류가 고정되어 있어.
        </p>
      ) : null}

      <div className="form-field">
        <p className="form-label">방향</p>
        <div className="row" style={{ marginTop: 0 }}>
          {directionOptions.map((direction) => (
            <button
              key={direction}
              type="button"
              className={`selBtn ${draft.direction === direction ? "active" : ""}`}
              disabled={lockCoreFields}
              onClick={() => updateDraft({ direction })}
            >
              {direction}
            </button>
          ))}
        </div>
      </div>

      {hasCategorySelection ? (
        <div className="form-field">
          <p className="form-label">종류</p>
          <div className="row" style={{ marginTop: 0 }}>
            {categoryOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`selBtn ${draft.item === item ? "active" : ""}`}
                disabled={lockCoreFields}
                onClick={() => updateDraft({ item: item as Item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="form-field">
        <p className="form-label">{itemLabel}</p>
        <div className="row" style={{ marginTop: 0 }}>
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className={`selBtn ${draft.kind === kind ? "active" : ""}`}
              disabled={lockCoreFields}
              onClick={() => updateDraft({ kind })}
            >
              {kind}
            </button>
          ))}
        </div>
      </div>

      {showScrapDetailSelection ? (
        <div className="form-field">
          <p className="form-label">세부 품목</p>
          <div className="row" style={{ marginTop: 0 }}>
            {scrapDetailOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`selBtn ${draft.detailItem === option ? "active" : ""}`}
                disabled={lockCoreFields}
                onClick={() => selectScrapDetail(option)}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              className={`selBtn ${canShowCustomDetailInput ? "active" : ""}`}
              disabled={lockCoreFields}
              onClick={() => setShowCustomDetailInput((prev) => !prev)}
            >
              기타
            </button>
          </div>

          {canShowCustomDetailInput ? (
            <div className="row" style={{ marginTop: 8 }}>
              <input
                className="input"
                placeholder="기타 품목 입력"
                value={customDetailInput}
                disabled={lockCoreFields}
                onChange={(event) => setCustomDetailInput(event.target.value)}
              />
              <button
                type="button"
                className="btn"
                disabled={lockCoreFields}
                onClick={() => {
                  const result = applyCustomScrapDetail();
                  if (!result.ok) {
                    alert(result.message);
                    return;
                  }
                  setShowCustomDetailInput(() => false);
                }}
              >
                적용
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
