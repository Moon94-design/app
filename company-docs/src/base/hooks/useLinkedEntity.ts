/**
 * useLinkedEntity - 연계 엔티티 선택/검증 훅
 * 
 * 사용: 설비, 직원, 이슈, 거래처 등 기준정보 연계 필드
 * 특징:
 * - 자유기입은 검색용, 실제 선택은 등록된 항목/해당없음만 가능
 * - 유효성 검사 내장
 */
import { useCallback, useMemo, useState } from "react";

export type EntityOption = {
  id: string;
  label: string;
  subLabel?: string;
};

export const NONE_VALUE = "__none__";

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

type UseLinkedEntityConfig = {
  options: EntityOption[];
  initialId?: string;
  initialLabel?: string;
  required?: boolean;
  fieldName?: string;  // 에러 메시지용
};

export function useLinkedEntity(config: UseLinkedEntityConfig) {
  const { options, initialId = "", initialLabel = "", required = false, fieldName = "항목" } = config;

  const [selectedId, setSelectedId] = useState(initialId);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const [searchInput, setSearchInput] = useState(initialLabel);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 검색 필터된 옵션
  const filteredOptions = useMemo(() => {
    const q = normLoose(searchInput);
    if (!q || q.length < 1) return [];
    return options.filter((o) =>
      normLoose(o.label).includes(q) ||
      (o.subLabel && normLoose(o.subLabel).includes(q))
    ).slice(0, 10);
  }, [searchInput, options]);

  // 선택
  const select = useCallback((id: string, label: string) => {
    setSelectedId(id);
    setSelectedLabel(label);
    if (id && id !== NONE_VALUE) {
      setSearchInput(label);
    } else if (id === NONE_VALUE) {
      setSearchInput("");
    }
  }, []);

  // 드롭다운에서 선택
  const selectFromDropdown = useCallback((id: string) => {
    if (id === NONE_VALUE) {
      select(NONE_VALUE, "");
      return;
    }
    if (!id) {
      select("", "");
      return;
    }
    const found = options.find((o) => o.id === id);
    if (found) {
      select(found.id, found.label);
    }
  }, [options, select]);

  // 자동완성에서 선택
  const selectFromSuggestion = useCallback((opt: EntityOption) => {
    select(opt.id, opt.label);
    setShowSuggestions(false);
  }, [select]);

  // 검색 입력 변경
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    setShowSuggestions(true);
    // 검색어 변경해도 기존 선택은 유지 (검색만 수행)
  }, []);

  // 포커스/블러
  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  // 유효성 검사 - 자유입력 방지 (선택 OR 해당없음 OR 빈값만 허용)
  const validate = useCallback((): { ok: boolean; message?: string } => {
    // 필수가 아니고 빈 값이면 OK
    if (!required && !selectedId && !searchInput.trim()) {
      return { ok: true };
    }

    // 필수인데 빈 값이면 에러
    if (required && !selectedId) {
      return { ok: false, message: `${fieldName}을(를) 선택해주세요.` };
    }

    // 해당없음은 OK
    if (selectedId === NONE_VALUE) {
      return { ok: true };
    }

    // 검색어가 있는데 선택된 항목이 없으면 에러 (자유입력 방지)
    if (searchInput.trim() && !selectedId) {
      return { ok: false, message: `${fieldName}은(는) 목록에서 선택하거나 '해당없음'을 선택해주세요. 자유입력은 불가합니다.` };
    }

    // 등록된 항목인지 확인
    if (selectedId) {
      const found = options.find((o) => o.id === selectedId);
      if (!found) {
        return { ok: false, message: `${fieldName}은(는) 등록된 항목에서 선택하거나 '해당없음'을 선택해주세요.` };
      }
    }

    return { ok: true };
  }, [selectedId, searchInput, options, required, fieldName]);

  // 리셋
  const reset = useCallback(() => {
    setSelectedId("");
    setSelectedLabel("");
    setSearchInput("");
    setShowSuggestions(false);
  }, []);

  // 옵션 리프레시 후 기존 선택 유지
  const refreshOptions = useCallback((newOptions: EntityOption[]) => {
    if (selectedId && selectedId !== NONE_VALUE) {
      const found = newOptions.find((o) => o.id === selectedId);
      if (found) {
        setSelectedLabel(found.label);
        setSearchInput(found.label);
      }
    }
  }, [selectedId]);

  return {
    // 상태
    selectedId,
    selectedLabel,
    searchInput,
    showSuggestions,
    filteredOptions,
    
    // 핸들러
    select,
    selectFromDropdown,
    selectFromSuggestion,
    handleSearchChange,
    handleFocus,
    handleBlur,
    
    // 유틸
    validate,
    reset,
    refreshOptions,
    
    // 상수
    NONE_VALUE,
  };
}

/**
 * 간단한 유효성 검사 유틸 (훅 없이 사용)
 */
export function validateLinkedEntity(
  id: string,
  options: EntityOption[],
  fieldName: string,
  required: boolean = false
): { ok: boolean; message?: string } {
  if (!required && !id) return { ok: true };
  if (required && !id) return { ok: false, message: `${fieldName}을(를) 선택해주세요.` };
  if (id === NONE_VALUE) return { ok: true };
  
  const found = options.find((o) => o.id === id);
  if (!found) {
    return { ok: false, message: `${fieldName}은(는) 등록된 항목에서 선택하거나 '해당없음'을 선택해주세요.` };
  }
  return { ok: true };
}
