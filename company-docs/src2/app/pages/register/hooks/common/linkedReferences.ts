export type LinkedReferenceCandidate<TType extends string = string> = {
  type: TType;
  typeLabel: string;
  id: string;
  label: string;
};

export function tokenizeSearchText(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .split(/[\s,./()[\]{}'"`~!@#$%^&*+=|\\:;<>?-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

export function buildLinkedReferenceSuggestions<TType extends string>(
  contentText: string,
  candidates: readonly LinkedReferenceCandidate<TType>[],
  limit = 8
): LinkedReferenceCandidate<TType>[] {
  const tokens = tokenizeSearchText(contentText);
  if (!tokens.length) return [];

  const scored = candidates
    .map((candidate) => {
      const haystack = `${candidate.label} ${candidate.typeLabel}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) score += token.length;
      }
      return { candidate, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.label.localeCompare(b.candidate.label, "ko"));

  const out: LinkedReferenceCandidate<TType>[] = [];
  const seen = new Set<string>();
  for (const row of scored) {
    const key = `${row.candidate.type}:${row.candidate.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row.candidate);
    if (out.length >= limit) break;
  }
  return out;
}
