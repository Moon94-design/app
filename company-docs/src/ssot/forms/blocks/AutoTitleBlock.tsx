/**
 * AutoTitleBlock — 제목 자동완성 입력 블록 (SSOT 정본)
 * 
 * 역할:
 * - 제목 자동완성 (useAutoTitle 훅 기반)
 * - 포커스 시 자동완성, 타이핑 시 auto off
 * - 의존성 변경 시 자동 갱신 (auto 모드일 때만)
 * 
 * 사용처: IssueForm, ActionForm
 */

import { useEffect, useRef } from "react";
import { useAutoTitle } from "../../../base/hooks/useAutoTitle";

export type AutoTitleBlockProps = {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  category?: string;
  suffix?: string;  // "이슈기록", "조치기록" 등
  title: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
  showLabel?: boolean;  // default: true
  editable?: boolean;   // default: true
};

export default function AutoTitleBlock(props: AutoTitleBlockProps) {
  const {
    recordDate,
    writerName,
    writerRole,
    category,
    suffix = "기록",
    title,
    onTitleChange,
    placeholder = "클릭하면 자동완성",
    showLabel = true,
    editable = true,
  } = props;

  // useAutoTitle 훅 사용
  const autoTitle = useAutoTitle({
    recordDate,
    writerName,
    writerRole,
    category,
    suffix,
  });

  // 마지막으로 부모에 전달한 title 기록 (중복 호출 방지)
  const lastSentTitleRef = useRef<string>(title);

  // auto 모드일 때만 부모 title 갱신 (무한 루프 방지)
  useEffect(() => {
    // auto 모드가 아니면 스킨
    if (autoTitle.isTouched) return;
    
    // 제목이 변경되지 않았으면 스킨
    const nextTitle = (autoTitle.title || "").trim();
    const currentTitle = (title || "").trim();
    if (nextTitle === currentTitle) return;
    
    // 이미 동일한 제목을 전달했으면 스킨
    if (lastSentTitleRef.current === nextTitle) return;
    
    lastSentTitleRef.current = nextTitle;
    onTitleChange(nextTitle);
  }, [autoTitle.title, autoTitle.isTouched, title, onTitleChange]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: showLabel ? "100px 1fr" : "1fr", gap: 8, alignItems: "center" }}>
      {showLabel && <div className="p">제목 *</div>}
      <input
        className="input"
        value={title}
        onFocus={autoTitle.onTitleFocus}
        onChange={(e) => {
          autoTitle.setTitle(e.target.value);
          onTitleChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={!editable}
      />
    </div>
  );
}
