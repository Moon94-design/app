/**
 * useTagSuggestion - 태그 추천/선택/중복방지 훅
 * 
 * 기능:
 * - 입력 중 태그 추천
 * - 시스템 태그 vs 개인 태그 구분
 * - 중복 방지 (시스템태그를 엔터로 입력해도 개인태그로 안 들어감)
 * - 자동 커밋 (띄어쓰기/구두점 후 태그 확정)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { repo } from "../../data/repo";
import { 
  bumpSystemTag, 
  bumpPersonalTag, 
  listSystemTags, 
  listPersonalTags,
  normTag,
} from "../utils/tagIndex";

type Sug = { tag: string; source: "system" | "personal" };

// 시스템 태그 셋 빌드 (기준정보 기반)
function buildSystemTagSet(): Set<string> {
  const set = new Set<string>();
  
  // 태그 인덱스의 시스템 태그
  listSystemTags().forEach((t) => set.add(t));
  
  // 기준정보들
  const equipments = repo.equipments<any>().getAll();
  const employees = repo.employees<any>().getAll();
  const agencies = repo.agencies<any>().getAll();
  const partners = repo.partners<any>().getAll();
  const vehicles = repo.vehicles<any>().getAll();
  const vendors = repo.vendors<any>().getAll();
  const consumables = repo.consumables<any>().getAll();

  equipments.forEach((e: any) => e?.name && set.add(e.name.trim()));
  employees.forEach((e: any) => e?.name && set.add(e.name.trim()));
  agencies.forEach((x: any) => {
    const n = (x?.name || x?.baseName || "").trim();
    if (n) set.add(n);
  });
  partners.forEach((x: any) => x?.name && set.add(x.name.trim()));
  vehicles.forEach((x: any) => x?.vehicleNo && set.add(x.vehicleNo.trim()));
  vendors.forEach((x: any) => x?.name && set.add(x.name.trim()));
  consumables.forEach((x: any) => x?.name && set.add(x.name.trim()));

  return set;
}

// 후보 태그 풀 빌드
function buildCandidatePool(): Sug[] {
  const out: Sug[] = [];
  const seen = new Set<string>();

  const push = (tag: string, source: "system" | "personal") => {
    const t = (tag || "").trim();
    if (!t) return;
    const key = `${source}:${t}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ tag: t, source });
  };

  // 시스템 태그
  listSystemTags().forEach((t) => push(t, "system"));
  
  // 개인 태그
  listPersonalTags().forEach((t) => push(t, "personal"));

  // 기준정보
  const equipments = repo.equipments<any>().getAll();
  const employees = repo.employees<any>().getAll();
  const agencies = repo.agencies<any>().getAll();
  const partners = repo.partners<any>().getAll();
  const vehicles = repo.vehicles<any>().getAll();
  const vendors = repo.vendors<any>().getAll();
  const consumables = repo.consumables<any>().getAll();

  equipments.forEach((e: any) => e?.name && push(e.name.trim(), "system"));
  employees.forEach((e: any) => e?.name && push(e.name.trim(), "system"));
  agencies.forEach((x: any) => {
    const n = (x?.name || x?.baseName || "").trim();
    if (n) push(n, "system");
  });
  partners.forEach((x: any) => x?.name && push(x.name.trim(), "system"));
  vehicles.forEach((x: any) => x?.vehicleNo && push(x.vehicleNo.trim(), "system"));
  vendors.forEach((x: any) => x?.name && push(x.name.trim(), "system"));
  consumables.forEach((x: any) => x?.name && push(x.name.trim(), "system"));

  return out;
}

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

type UseTagSuggestionConfig = {
  scope: string;
  tagsText: string;
  onTagsChange: (newTagsText: string) => void;
  contentText?: string;  // 상세 내용 (자동 태그 추출용)
};

export function useTagSuggestion(config: UseTagSuggestionConfig) {
  const { scope, tagsText, onTagsChange, contentText = "" } = config;

  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const lastCommittedRef = useRef<string>("");
  const prevLenRef = useRef<number>(contentText.length);

  // 시스템 태그 셋 (캐시)
  const systemTagSet = useMemo(() => buildSystemTagSet(), []);
  
  // 후보 풀 (캐시)
  const candidatePool = useMemo(() => buildCandidatePool(), []);

  // 선택된 태그 Set
  const selectedTags = useMemo(() => {
    const set = new Set<string>();
    (tagsText || "")
      .split(",")
      .map((x) => normTag(x))
      .filter(Boolean)
      .forEach((t) => set.add(t));
    return set;
  }, [tagsText]);

  // 현재 입력 중인 토큰 (contentText 끝부분)
  const currentToken = useMemo(() => {
    const m = contentText.match(/([0-9A-Za-z가-힣-]{1,})$/);
    return m ? m[1] : "";
  }, [contentText]);

  // 내용 축소 시 dismissed 초기화
  useEffect(() => {
    const len = contentText.length;
    if (len < prevLenRef.current) {
      setDismissed(new Set());
      setShowAll(false);
    }
    prevLenRef.current = len;
  }, [contentText]);

  // 태그 색상 결정 함수
  const getTone = useCallback((tag: string): "system" | "personal" => {
    return systemTagSet.has(tag) ? "system" : "personal";
  }, [systemTagSet]);

  // 태그 추천 로직
  function getTypingSuggestions(tokenRaw: string): Sug[] {
    const token = (tokenRaw || "").trim();
    if (token.length < 2) return [];

    const q = token.toLowerCase();
    const qLoose = normLoose(token);

    const grams3: string[] = [];
    if (qLoose.length >= 3) {
      for (let i = 0; i <= qLoose.length - 3; i++) grams3.push(qLoose.slice(i, i + 3));
    }

    const scored: Array<{ s: Sug; score: number; len: number }> = [];

    for (const c of candidatePool) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (selectedTags.has(tag)) continue;
      if (dismissed.has(tag)) continue;

      const a = tag.toLowerCase();
      const aLoose = normLoose(tag);

      let score = 0;
      if (a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose))) score += 40;
      if (a.includes(q) || (qLoose && aLoose.includes(qLoose))) score += 20;
      if (a.endsWith(q) || (qLoose && aLoose.endsWith(qLoose))) score += 25;

      if (score === 0 && grams3.length) {
        const hit3 = grams3.some((g) => aLoose.includes(g));
        if (hit3) score += 10;
      }

      if (score === 0) continue;
      scored.push({ s: c, score, len: tag.length });
    }

    scored.sort((x, y) => y.score - x.score || y.len - x.len);
    return scored.slice(0, 30).map((x) => x.s);
  }

  const allSuggestions = useMemo(
    () => getTypingSuggestions(currentToken),
    [currentToken, candidatePool, selectedTags, dismissed]
  );

  const visibleSuggestions = useMemo(() => {
    if (showAll) return allSuggestions;
    return allSuggestions.slice(0, 5);
  }, [allSuggestions, showAll]);

  // 토큰에서 매칭되는 태그 추출
  function pickTagsFromToken(tokenRaw: string): string[] {
    const token = (tokenRaw || "").trim();
    if (!token) return [];

    const tokenLower = token.toLowerCase();
    const tokenLoose = normLoose(token);

    const hits: string[] = [];
    for (const c of candidatePool) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (selectedTags.has(tag)) continue;

      const tagLower = tag.toLowerCase();
      const tagLoose = normLoose(tag);

      const ok = tokenLower.includes(tagLower) || (tagLoose && tokenLoose.includes(tagLoose));
      if (ok) hits.push(tag);
    }

    hits.sort((a, b) => b.length - a.length);
    const kept: string[] = [];
    for (const t of hits) {
      const tl = t.toLowerCase();
      const shadowed = kept.some((k) => k.toLowerCase().includes(tl));
      if (!shadowed) kept.push(t);
    }
    return kept;
  }

  // 태그 추가 (중복 방지 로직 포함)
  function addTag(tag: string, source?: "system" | "personal") {
    const t = normTag(tag);
    if (!t || selectedTags.has(t)) return;

    // 시스템 태그면 시스템에 bump, 아니면 개인에 bump
    const isSystem = source === "system" || systemTagSet.has(t);
    if (isSystem) {
      bumpSystemTag(scope, t);
    } else {
      bumpPersonalTag(scope, t);
    }

    const next = tagsText.trim();
    const merged = next ? `${next}, ${t}` : t;
    onTagsChange(merged);
  }

  // 태그 제거
  function removeTag(tag: string) {
    const t = normTag(tag);
    const arr = (tagsText || "")
      .split(",")
      .map((x) => normTag(x))
      .filter(Boolean)
      .filter((x) => x !== t);
    onTagsChange(arr.join(", "));
  }

  // 추천 태그 적용
  function applySuggestion(s: Sug) {
    addTag(s.tag, s.source);
  }

  // 추천 태그 무시
  function dismissSuggestion(tag: string) {
    const t = normTag(tag);
    if (!t) return;
    setDismissed((prev) => {
      const n = new Set(prev);
      n.add(t);
      return n;
    });
  }

  // 자동 태그 커밋 (contentText가 구두점/공백으로 끝날 때)
  useEffect(() => {
    if (!contentText) return;

    const lastChar = contentText.slice(-1);
    const isBoundary = /[\s\n\r\t.,!?;:(){}\[\]"'""'']/.test(lastChar);
    if (!isBoundary) return;

    const trimmed = contentText.replace(/[\s\n\r\t.,!?;:(){}\[\]"'""'']+$/, "");
    const m = trimmed.match(/([0-9A-Za-z가-힣-]{1,})$/);
    const token = m ? m[1] : "";
    if (!token) return;

    if (lastCommittedRef.current === token) return;
    lastCommittedRef.current = token;

    const tags = pickTagsFromToken(token);
    tags.forEach((t) => addTag(t));
  }, [contentText, candidatePool, selectedTags]);

  // 저장 시 모든 태그 bump (시스템/개인 구분)
  function bumpAllTags() {
    const tags = (tagsText || "")
      .split(",")
      .map((x) => normTag(x))
      .filter(Boolean);

    for (const t of tags) {
      const isSystem = candidatePool.some((c) => c.tag === t && c.source === "system") || systemTagSet.has(t);
      if (isSystem) {
        bumpSystemTag(scope, t);
      } else {
        bumpPersonalTag(scope, t);
      }
    }
  }

  return {
    // 상태
    selectedTags,
    allSuggestions,
    visibleSuggestions,
    showAll,
    setShowAll,
    
    // 함수
    getTone,
    addTag,
    removeTag,
    applySuggestion,
    dismissSuggestion,
    bumpAllTags,
    
    // 유틸
    systemTagSet,
    candidatePool,
  };
}

export type { Sug };
