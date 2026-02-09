export const DRAFT_KEYS = {
	partnerV2: "draft:partner:v2",
	logisticsDaily: "draft:daily:logistics",
} as const;

export type DraftKey = (typeof DRAFT_KEYS)[keyof typeof DRAFT_KEYS];
