// src/ssot/index.ts — 정본(SSOT) 진입점
// 파일 이동 없이 기존 위치에서 re-export (1단계: 기능 변경 0)

// ==================== Hooks ====================
export { useAutoTitle } from "../base/hooks/useAutoTitle";
export { useTagSuggestion } from "../base/hooks/useTagSuggestion";
export { useLinkedEntity, NONE_VALUE } from "../base/hooks/useLinkedEntity";
export { useWriterInfo } from "../base/hooks/useWriterInfo";
export { default as usePreserveSelection } from "../base/hooks/usePreserveSelection";

// ==================== Tags ====================
// tagIndex 유틸 주요 함수들
export {
  bumpSystemTag,
  bumpPersonalTag,
  listSystemTags,
  listPersonalTags,
  parseTagsText,
  buildTagsText,
  getSuggestions,
  deleteFromIndex,
  loadIndex,
  normTag,
  getUserKey,
  SYSTEM_KEY,
  PERSONAL_PREFIX,
} from "../base/utils/tagIndex";

// tagIndex 타입들
export type { TagIndexRow, StorageAdapter } from "../base/utils/tagIndex";

// TagInputText 컴포넌트 (default export)
export { default as TagInputText } from "../base/components/TagInputText";

// Tag Widgets
export { ConfirmedTagChips } from "../base/components/TagWidgets";

// ==================== Utils ====================
export { useDraftState } from "../base/utils/useDraftState";

// ==================== Forms ====================
export { default as IssueForm } from "../base/components/form/IssueForm";
export { default as ActionForm } from "../base/components/form/ActionForm";

// Form Blocks
export { RecordHeaderBlock } from "./forms/blocks";
export type { RecordHeaderBlockProps } from "./forms/blocks";

export { AutoTitleBlock } from "./forms/blocks";
export type { AutoTitleBlockProps } from "./forms/blocks";

export { TagBlock } from "./forms/blocks";
export type { TagBlockProps } from "./forms/blocks";

export { MainContentBlock } from "./forms/blocks";
export type { MainContentBlockProps } from "./forms/blocks";

// ==================== Types (type-only) ====================
export type { Ref, BaseRecord } from "../domain/schema/daily/_common";
export type { IssueItem, IssueDraft, IssueCategory } from "../domain/schema/daily/issue";
export type { ActionItem, ActionDraft } from "../domain/schema/daily/action";
export type { ProductionDraft, ProductionLine, ProductionRecord, Shift, Product, Item } from "../domain/schema/daily/production";
