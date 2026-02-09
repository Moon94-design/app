// src/ssot/forms/blocks/index.ts — 공통 폼 블록 정본 진입점
// 2단계에서 RecordHeaderBlock, AutoTitleBlock, TagBlock, MainContentBlock 구현 후 re-export

export { default as RecordHeaderBlock } from "./RecordHeaderBlock";
export type { RecordHeaderBlockProps } from "./RecordHeaderBlock";

export { default as AutoTitleBlock } from "./AutoTitleBlock";
export type { AutoTitleBlockProps } from "./AutoTitleBlock";

export { default as TagBlock } from "./TagBlock";
export type { TagBlockProps } from "./TagBlock";

export { default as MainContentBlock } from "./MainContentBlock";
export type { MainContentBlockProps } from "./MainContentBlock";
