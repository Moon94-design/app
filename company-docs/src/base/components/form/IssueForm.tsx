/**
 * IssueForm - 이슈 기록 폼 컴포넌트 (범용)
 * 
 * 사용처:
 * - RegisterIssue 페이지
 * - RegisterProductionDaily 페이지 (이슈 추가 패널)
 * 
 * Props:
 * - recordDate: 기록일 (일지에서 불러올 때는 해당 일지 날짜)
 * - writerName, writerRole: 작성자 정보
 * - onSubmit: 저장 콜백
 * - onCancel: 취소 콜백
 * - embedded: 다른 페이지에 삽입된 경우 true (헤더 숨김)
 */
import { useEffect, useRef, useState } from "react";
import { TagBlock, RecordHeaderBlock, AutoTitleBlock, MainContentBlock } from "../../../ssot";
import { validateFields } from "../../hooks";
import { defaultIssueDraft, toIssueItem, type IssueDraft, type IssueCategory, type IssueItem } from "../../../domain/schema/daily/issue";
import IssueQualityFields from "./IssueQualityFields";
import IssueEquipmentFields from "./IssueEquipmentFields";
import IssueSafetyFields from "./IssueSafetyFields";

const categoryLabels: Record<IssueCategory, string> = {
  quality: "품질",
  equipment: "설비",
  safety: "안전",
};

export type IssueFormProps = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site?: "대구" | "성주";
  onSubmit: (item: IssueItem, draft: IssueDraft) => void;
  onCancel?: () => void;
  embedded?: boolean;  // 다른 페이지에 삽입된 경우
  initialDraft?: Partial<IssueDraft>;
};

export default function IssueForm({
  recordDate,
  writerName,
  writerRole,
  site,
  onSubmit,
  onCancel,
  embedded = false,
  initialDraft,
}: IssueFormProps) {
  const [draft, setDraft] = useState<IssueDraft>(() => ({
    ...defaultIssueDraft(),
    recordDate,
    writerName,
    site,
    ...initialDraft,
  }));

  // ref for focus return after tag add
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  // 카테고리 라벨
  const catLabel = categoryLabels[draft.category] || "이슈";

  // 외부 props 변경 시 동기화
  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      recordDate,
      writerName,
      site,
    }));
  }, [recordDate, writerName, site]);

  // 필드 업데이트
  function updateField<K extends keyof IssueDraft>(k: K, v: IssueDraft[K]) {
    setDraft((p) => ({ ...p, [k]: v }));
  }

  // 저장
  function handleSubmit() {
    // 필수 필드 검증
    const validation = validateFields(
      {
        writerName,
        writerRole,
        title: draft.title,
        details: draft.details,
      },
      [
        { name: "writerName", label: "작성자", required: true },
        { name: "writerRole", label: "직책", required: true },
        { name: "title", label: "제목", required: true },
        { name: "details", label: "상세내용", required: true },
      ]
    );

    if (!validation.ok) {
      return alert(validation.firstError);
    }

    // 연계 필드 검증: 선택하지 않으면 저장 불가 (해당없음 또는 선택 필수)
    // 설비 이슈: e_equipmentId 필수 (빈 문자열이면 에러)
    if (draft.category === "equipment") {
      if (!draft.e_equipmentId) {
        return alert("설비를 선택하거나 '해당없음'을 선택해주세요.");
      }
    }

    // 안전 이슈: s_employeeId 필수 (빈 문자열이면 에러)
    if (draft.category === "safety") {
      if (!draft.s_employeeId) {
        return alert("직원을 선택하거나 '해당없음'을 선택해주세요.");
      }
    }

    // 최종 Draft 구성
    const finalDraft: IssueDraft = {
      ...draft,
      recordDate,
      writerName,
      title: draft.title,
    };

    const item = toIssueItem(finalDraft);
    onSubmit(item, finalDraft);

    // 리셋
    setDraft({
      ...defaultIssueDraft(),
      recordDate,
      writerName,
      site,
    });
  }

  // 리셋
  function handleReset() {
    setDraft({
      ...defaultIssueDraft(),
      recordDate,
      writerName,
      site,
    });
    onCancel?.();
  }

  return (
    <div className={embedded ? "" : "card"}>
      <div style={{ display: "grid", gap: 8 }}>
        {/* 기록일 + 지부 (embedded가 아닐 때만 표시) */}
        {!embedded && (
          <RecordHeaderBlock
            recordDate={recordDate}
            showDate={true}
            dateEditable={false}
            showWriter={false}
            site={draft.site}
            onChangeSite={(newSite) => updateField("site", newSite as "대구" | "성주" | undefined)}
            siteOptions={["대구", "성주"]}
            showSite={true}
          />
        )}

        {/* 분류 */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
          <div className="p">분류</div>
          <div className="row" style={{ marginTop: 0 }}>
            {(["quality", "equipment", "safety"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`selBtn ${draft.category === cat ? "active" : ""}`}
                onClick={() => updateField("category", cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 (AutoTitleBlock) */}
        <AutoTitleBlock
          recordDate={recordDate}
          writerName={writerName}
          writerRole={writerRole}
          category={catLabel}
          suffix="이슈기록"
          title={draft.title || ""}
          onTitleChange={(title) => updateField("title", title)}
          placeholder="클릭하면 자동완성"
        />

        {/* 상세 (MainContentBlock) */}
        <MainContentBlock
          ref={detailsRef}
          label="상세"
          value={draft.details}
          onChange={(details) => updateField("details", details)}
          rows={3}
          required={true}
        />

        {/* 태그 (TagBlock) */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">태그</div>
          <TagBlock
            scope="issue"
            tagsText={draft.tagsText || ""}
            onChangeTagsText={(text) => updateField("tagsText", text)}
            detailsText={draft.details}
            placeholder="태그 입력"
            showChips={true}
            onAfterAdd={() => detailsRef.current?.focus()}
          />
        </div>

        {/* 카테고리별 필드 */}
        {draft.category === "quality" && (
          <IssueQualityFields draft={draft} onUpdate={updateField} />
        )}

        {draft.category === "equipment" && (
          <IssueEquipmentFields draft={draft} onUpdate={updateField} />
        )}

        {draft.category === "safety" && (
          <IssueSafetyFields draft={draft} onUpdate={updateField} />
        )}

        {/* 버튼 */}
        <div className="row">
          <button type="button" className="btn primary" onClick={handleSubmit}>
            저장
          </button>
          <button type="button" className="btn" onClick={handleReset}>
            {onCancel ? "취소" : "초기화"}
          </button>
        </div>
      </div>
    </div>
  );
}
