/**
 * useFormValidation - 폼 필수 필드 검증 훅
 * 
 * 사용: 제목, 작성자, 직책, 상세내용 등 필수 필드 검증
 */
import { useCallback } from "react";

export type FieldRule = {
  name: string;        // 필드 키
  label: string;       // 에러 메시지용 라벨
  required?: boolean;  // 필수 여부
  minLength?: number;  // 최소 길이
  custom?: (value: any) => { ok: boolean; message?: string };  // 커스텀 검증
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  errors: ValidationError[];
  firstError?: string;
};

export function useFormValidation(rules: FieldRule[]) {
  
  const validate = useCallback((values: Record<string, any>): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const value = values[rule.name];
      const strValue = typeof value === "string" ? value.trim() : "";

      // 필수 체크
      if (rule.required) {
        if (typeof value === "string" && !strValue) {
          errors.push({ field: rule.name, message: `${rule.label}을(를) 입력해주세요.` });
          continue;
        }
        if (value === undefined || value === null) {
          errors.push({ field: rule.name, message: `${rule.label}을(를) 입력해주세요.` });
          continue;
        }
      }

      // 최소 길이 체크
      if (rule.minLength && strValue && strValue.length < rule.minLength) {
        errors.push({ field: rule.name, message: `${rule.label}은(는) ${rule.minLength}자 이상 입력해주세요.` });
        continue;
      }

      // 커스텀 검증
      if (rule.custom) {
        const result = rule.custom(value);
        if (!result.ok) {
          errors.push({ field: rule.name, message: result.message || `${rule.label}이(가) 유효하지 않습니다.` });
        }
      }
    }

    return {
      ok: errors.length === 0,
      errors,
      firstError: errors[0]?.message,
    };
  }, [rules]);

  return { validate };
}

/**
 * 기본 필수 필드 규칙 (이슈/조치기록 공통)
 */
export const commonRequiredFields: FieldRule[] = [
  { name: "recordDate", label: "기록일", required: true },
  { name: "writerName", label: "작성자", required: true },
  { name: "writerRole", label: "직책", required: true },
  { name: "title", label: "제목", required: true },
  { name: "details", label: "상세내용", required: true },
];

/**
 * 간단한 유효성 검사 유틸 (훅 없이 사용)
 */
export function validateRequired(
  value: any, 
  label: string
): { ok: boolean; message?: string } {
  if (typeof value === "string") {
    if (!value.trim()) {
      return { ok: false, message: `${label}을(를) 입력해주세요.` };
    }
  } else if (value === undefined || value === null) {
    return { ok: false, message: `${label}을(를) 입력해주세요.` };
  }
  return { ok: true };
}

/**
 * 여러 필드 한번에 검증
 */
export function validateFields(
  values: Record<string, any>,
  rules: Array<{ name: string; label: string; required?: boolean }>
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    if (!rule.required) continue;
    
    const value = values[rule.name];
    const result = validateRequired(value, rule.label);
    if (!result.ok) {
      errors.push({ field: rule.name, message: result.message! });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    firstError: errors[0]?.message,
  };
}
