import { useEffect, useMemo, useState } from "react";
import {
  getTagIndexUpdatedEventName,
  listPersonalTags,
  listSystemTags,
  parseTagsText,
} from "@kernel/utils";
import type { SuggestCandidate } from "../TagBlock";

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

function extractTokens(text: string): string[] {
  const matches = (text || "").match(/[0-9A-Za-z가-힣]{1,}/g) || [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const token = matches[i].trim();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
    if (out.length >= 12) break;
  }
  return out;
}

function mergeCandidates(defaultCandidates: SuggestCandidate[], injected: SuggestCandidate[]) {
  const merged = new Map<string, SuggestCandidate>();

  function upsert(item: SuggestCandidate) {
    const tag = item.tag.trim();
    if (!tag) return;
    const prev = merged.get(tag);
    if (!prev) {
      merged.set(tag, { tag, source: item.source });
      return;
    }
    if (prev.source === "personal" && item.source === "system") {
      merged.set(tag, { tag, source: "system" });
    }
  }

  for (const item of defaultCandidates) upsert(item);
  for (const item of injected) upsert(item);
  return Array.from(merged.values());
}

function scoreToken(
  tokenRaw: string,
  candidates: SuggestCandidate[],
  selectedTags: Set<string>,
  dismissed: Set<string>
): SuggestCandidate[] {
  const token = tokenRaw.trim();
  if (!token) return [];

  const q = token.toLowerCase();
  const qLoose = normLoose(token);
  const grams3: string[] = [];
  if (qLoose.length >= 3) {
    for (let i = 0; i <= qLoose.length - 3; i += 1) grams3.push(qLoose.slice(i, i + 3));
  }

  const scored: Array<{ s: SuggestCandidate; score: number; len: number }> = [];
  for (const c of candidates) {
    const tag = c.tag.trim();
    if (!tag || selectedTags.has(tag) || dismissed.has(tag)) continue;

    const a = tag.toLowerCase();
    const aLoose = normLoose(tag);
    let score = 0;

    if (a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose))) score += 40;
    if (a.includes(q) || (qLoose && aLoose.includes(qLoose))) score += 20;
    if (a.endsWith(q) || (qLoose && aLoose.endsWith(qLoose))) score += 25;
    if (score === 0 && (q.includes(a) || (qLoose && qLoose.includes(aLoose)))) score += 8;
    if (score === 0 && grams3.length && grams3.some((g) => aLoose.includes(g))) score += 10;
    if (score === 0) continue;

    scored.push({ s: c, score, len: tag.length });
  }

  scored.sort((x, y) => y.score - x.score || y.len - x.len);
  return scored.slice(0, 30).map((x) => x.s);
}

type UseTagBlockSuggestionsArgs = {
  tagsText: string;
  detailsText?: string;
  candidates?: SuggestCandidate[];
  userKey?: string;
};

export function useTagBlockSuggestions({
  tagsText,
  detailsText,
  candidates,
  userKey,
}: UseTagBlockSuggestionsArgs) {
  const [indexTick, setIndexTick] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eventName = getTagIndexUpdatedEventName();
    const handler = () => setIndexTick((v) => v + 1);
    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);

  const defaultCandidates = useMemo(() => {
    void indexTick;
    const systemTags = listSystemTags().filter((t) => t.trim().length >= 2);
    const personalTags = listPersonalTags(userKey).filter((t) => t.trim().length >= 2);

    const out: SuggestCandidate[] = [];
    const seen = new Set<string>();
    for (const t of personalTags) {
      if (!seen.has(t)) {
        out.push({ tag: t, source: "personal" });
        seen.add(t);
      }
    }
    for (const t of systemTags) {
      if (!seen.has(t)) {
        out.push({ tag: t, source: "system" });
        seen.add(t);
      }
    }
    return out;
  }, [indexTick, userKey]);

  const finalCandidates = useMemo(
    () => mergeCandidates(defaultCandidates, candidates || []),
    [candidates, defaultCandidates]
  );
  const selectedTags = useMemo(() => new Set(parseTagsText(tagsText)), [tagsText]);
  const currentTokens = useMemo(() => extractTokens(detailsText || ""), [detailsText]);

  const allSuggestions = useMemo(() => {
    const merged = new Map<string, SuggestCandidate>();
    for (const token of currentTokens) {
      for (const item of scoreToken(token, finalCandidates, selectedTags, dismissed)) {
        if (!merged.has(item.tag)) merged.set(item.tag, item);
      }
    }
    return Array.from(merged.values());
  }, [currentTokens, dismissed, finalCandidates, selectedTags]);

  const visibleSuggestions = useMemo(
    () => (showAll ? allSuggestions : allSuggestions.slice(0, 5)),
    [allSuggestions, showAll]
  );

  return {
    finalCandidates,
    currentTokens,
    allSuggestions,
    visibleSuggestions,
    showAll,
    setShowAll,
    dismissTag: (tag: string) => setDismissed((prev) => new Set(prev).add(tag)),
  };
}
