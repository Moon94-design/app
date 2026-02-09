/**
 * useAutoTitle - 제목 자동 생성 훅
 * 
 * 사용: 이슈기록, 조치기록 등에서 "날짜 작성자 직책 [분류] 기록" 형식 제목 자동완성
 */
import { useEffect, useRef, useState } from "react";

type AutoTitleConfig = {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  category?: string;
  suffix?: string;  // "이슈기록", "조치기록" 등
};

export function useAutoTitle(config: AutoTitleConfig) {
  const { recordDate, writerName, writerRole, category, suffix = "기록" } = config;
  
  const [title, setTitle] = useState("");
  const touchedRef = useRef(false);

  function generateTitle() {
    const parts = [recordDate];
    if (writerName) parts.push(writerName);
    if (writerRole) parts.push(writerRole);
    if (category) parts.push(`[${category}]`);
    parts.push(suffix);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  // 의존성 변경 시 자동 업데이트 (사용자가 수정하지 않은 경우에만)
  useEffect(() => {
    if (!touchedRef.current) {
      setTitle(generateTitle());
    }
  }, [recordDate, writerName, writerRole, category, suffix]);

  function onTitleChange(val: string) {
    touchedRef.current = true;
    setTitle(val);
  }

  function onTitleFocus() {
    if (!touchedRef.current && !title) {
      setTitle(generateTitle());
    }
  }

  function resetTitle() {
    touchedRef.current = false;
    setTitle(generateTitle());
  }

  return {
    title,
    setTitle: onTitleChange,
    onTitleFocus,
    resetTitle,
    isTouched: touchedRef.current,
  };
}
