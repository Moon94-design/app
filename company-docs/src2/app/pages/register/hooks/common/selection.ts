type ResolveSelectionValueArgs<TOption> = {
  options: readonly TOption[];
  selectedId: string;
  currentValue: string;
  fallbackValue?: string;
  getId: (option: TOption) => string;
  getValue: (option: TOption) => string;
};

function toCleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveSelectionValue<TOption>({
  options,
  selectedId,
  currentValue,
  fallbackValue,
  getId,
  getValue,
}: ResolveSelectionValueArgs<TOption>): string {
  const cleanSelectedId = toCleanText(selectedId);
  if (!cleanSelectedId) return "";

  const selected = options.find((option) => toCleanText(getId(option)) === cleanSelectedId);
  if (selected) {
    const fromOption = toCleanText(getValue(selected));
    if (fromOption) return fromOption;
  }

  const fromFallback = toCleanText(fallbackValue);
  if (fromFallback) return fromFallback;

  const fromCurrent = toCleanText(currentValue);
  if (fromCurrent) return fromCurrent;

  return "";
}
