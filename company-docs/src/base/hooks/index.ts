/**
 * 공통 Hooks 모음
 * 
 * 각 페이지에서 import { useAutoTitle, useTagSuggestion, ... } from "@/base/hooks" 로 사용
 */

export { useAutoTitle } from "./useAutoTitle";
export { useTagSuggestion, type Sug } from "./useTagSuggestion";
export { 
  useLinkedEntity, 
  validateLinkedEntity, 
  NONE_VALUE, 
  type EntityOption 
} from "./useLinkedEntity";
export { 
  useFormValidation, 
  validateRequired, 
  validateFields,
  commonRequiredFields,
  type FieldRule,
  type ValidationError,
  type ValidationResult,
} from "./useFormValidation";
export { useWriterInfo } from "./useWriterInfo";
