import type { Direction, Item, Kind } from "@kernel/schema/daily";
import type { LogisticsDraft, ProductCategory } from "@app2/pages/register/hooks/logistics/types";

type LogisticsTypeFieldsProps = {
  draft: LogisticsDraft;
  kinds: Kind[];
  directionOptions: Direction[];
  categoryOptions: ProductCategory[];
  hasCategorySelection: boolean;
  showScrapDetailSelection: boolean;
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
      <div className="form-field">
        <p className="form-label">방향</p>
        <div className="row" style={{ marginTop: 0 }}>
          {directionOptions.map((direction) => (
            <button
              key={direction}
              type="button"
              className={`selBtn ${draft.direction === direction ? "active" : ""}`}
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
                onClick={() => selectScrapDetail(option)}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              className={`selBtn ${canShowCustomDetailInput ? "active" : ""}`}
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
                onChange={(event) => setCustomDetailInput(event.target.value)}
              />
              <button
                type="button"
                className="btn"
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
