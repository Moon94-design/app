export type ClassificationLevel1 = "매입" | "매출";

export type ClassificationLevel2 =
  | "PP"
  | "PE"
  | "운송료"
  | "서비스";

export type ClassificationLevel3 =
  | "스크랩"
  | "압축품"
  | "분쇄품"
  | "미세척분쇄품"
  | "압출펠렛";

export type RuleConfidence = "high" | "medium" | "low";

export interface RuleResult {
  level2?: ClassificationLevel2;
  level3?: ClassificationLevel3;
}

export interface BaseRule {
  id: string;
  level1: ClassificationLevel1;
  tokensAny: string[];
  result: RuleResult;
  confidence: RuleConfidence;
  enabled: boolean;
}

export interface LearnedRule {
  id: string;
  level1: ClassificationLevel1;
  normalizedText: string;
  result: RuleResult;
  confirmCount: number;
  enabled: boolean;
}

export interface PriceBandRule {
  id: string;
  level1: ClassificationLevel1;
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
  result: RuleResult;
  enabled: boolean;
}

export interface ExcelRuleDictionary {
  version: string;
  source: "excel-rule-dictionary-v1" | "custom";
  baseRules: BaseRule[];
  learnedRules: LearnedRule[];
  priceBandRules: PriceBandRule[];
}

