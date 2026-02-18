import { useMemo } from "react";
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
  customScrapDetailOptions: string[];
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
  customScrapDetailOptions,
  customDetailInput,
  setCustomDetailInput,
  showCustomDetailInput,
  setShowCustomDetailInput,
  updateDraft,
  selectScrapDetail,
  applyCustomScrapDetail,
}: LogisticsTypeFieldsProps) {
  const trimmedDetailItem = draft.detailItem.trim();
  const isCustomDetailSelected = Boolean(trimmedDetailItem) && !scrapDetailOptions.includes(trimmedDetailItem);
  const canShowCustomDetailInput = showScrapDetailSelection && showCustomDetailInput;
  const itemLabel = hasCategorySelection ? "품목" : "종류";
  const normalizedCustomQuery = customDetailInput.trim().toLocaleLowerCase();
  const filteredCustomDetailOptions = useMemo(() => {
    if (!normalizedCustomQuery) return customScrapDetailOptions;
    return customScrapDetailOptions.filter((option) =>
      option.toLocaleLowerCase().includes(normalizedCustomQuery)
    );
  }, [customScrapDetailOptions, normalizedCustomQuery]);

  return (
    <>
      {lockCoreFields ? (
        <p className="p" style={{ marginTop: 0, marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
          반품 원본 기준으로 방향/품목/종류가 고정되어 있습니다.
        </p>
      ) : null}

      <div className="form-field">
        <p className="form-label">방향</p>
        <select
          className="input"
          value={draft.direction}
          disabled={lockCoreFields}
          onChange={(event) => updateDraft({ direction: event.target.value as Direction })}
        >
          {directionOptions.map((direction) => (
            <option key={direction} value={direction}>
              {direction}
            </option>
          ))}
        </select>
      </div>

      {hasCategorySelection ? (
        <div className="form-field">
          <p className="form-label">종류</p>
          <select
            className="input"
            value={draft.item}
            disabled={lockCoreFields}
            onChange={(event) => updateDraft({ item: event.target.value as Item })}
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="form-field">
        <p className="form-label">{itemLabel}</p>
        <select
          className="input"
          value={draft.kind}
          disabled={lockCoreFields}
          onChange={(event) => updateDraft({ kind: event.target.value as Kind })}
        >
          {kinds.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
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
                onClick={() => {
                  selectScrapDetail(option);
                  setCustomDetailInput("");
                  setShowCustomDetailInput(() => false);
                }}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              className={`selBtn ${showCustomDetailInput || isCustomDetailSelected ? "active" : ""}`}
              disabled={lockCoreFields}
              onClick={() => {
                if (showCustomDetailInput) {
                  setShowCustomDetailInput(() => false);
                  return;
                }
                if (isCustomDetailSelected) {
                  setCustomDetailInput(trimmedDetailItem);
                } else {
                  updateDraft({ detailItem: "" });
                  setCustomDetailInput("");
                }
                setShowCustomDetailInput(() => true);
              }}
            >
              기타
            </button>
          </div>

          {canShowCustomDetailInput ? (
            <div style={{ marginTop: 8 }}>
              <div className="row">
                <input
                  className="input"
                  placeholder="기타 품목 입력 또는 검색"
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
                  등록/적용
                </button>
              </div>

              <div
                style={{
                  marginTop: 6,
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  background: "rgba(10,12,16,0.45)",
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {filteredCustomDetailOptions.length > 0 ? (
                  filteredCustomDetailOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: trimmedDetailItem === option ? "rgba(255,255,255,0.12)" : "transparent",
                        color: "inherit",
                        padding: "8px 10px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        selectScrapDetail(option);
                        setCustomDetailInput(option);
                        setShowCustomDetailInput(() => false);
                      }}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <p className="p" style={{ margin: 0, padding: "8px 10px", fontSize: 12, opacity: 0.75 }}>
                    {normalizedCustomQuery
                      ? "일치하는 기타 품목이 없습니다. 입력 후 등록/적용을 눌러 주세요."
                      : "등록된 기타 품목이 아직 없습니다. 직접 입력 후 등록/적용을 눌러 주세요."}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
