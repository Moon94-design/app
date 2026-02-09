/**
 * RegisterIssue - 이슈 기록 페이지
 * 
 * IssueForm 컴포넌트를 사용하여 이슈 입력
 * - 폼은 공통 컴포넌트 사용
 * - 저장/목록 관리만 이 페이지에서 담당
 */
import { useEffect, useState } from "react";
import { IssueForm, ActionForm, useWriterInfo, RecordHeaderBlock } from "../../../ssot";
import { addIssueItem, listIssueItems, removeIssueItem, updateIssueStatus } from "../../../data/issueRepo";
import { addActionItem } from "../../../data/actionRepo";
import type { IssueItem, IssueDraft, IssueCategory, ActionItem, ActionDraft } from "../../../ssot";

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const categoryLabels: Record<string, string> = {
  quality: "품질",
  equipment: "설비",
  safety: "안전",
};

export default function RegisterIssue() {
  const [recordDate, setRecordDate] = useState(todayYMD);
  const [savedItems, setSavedItems] = useState<IssueItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 해결완료 시 조치 입력용
  const [showActionForm, setShowActionForm] = useState(false);
  const [linkedIssueForAction, setLinkedIssueForAction] = useState<{ id: string; title: string; category: IssueCategory } | null>(null);

  // 공통 훅
  const { writerName, writerRole, setWriterName, setWriterRole } = useWriterInfo({
    writerKey: "issue_writer_name",
    roleKey: "issue_writer_role",
  });

  // 저장된 이슈 목록 로드
  useEffect(() => {
    if (writerName) {
      const items = listIssueItems(recordDate, writerName);
      setSavedItems(items);
    } else {
      setSavedItems([]);
    }
  }, [recordDate, writerName, refreshKey]);

  // 이슈 저장
  function handleIssueSubmit(item: IssueItem, draft: IssueDraft) {
    addIssueItem(recordDate, writerName, item);
    setRefreshKey((k) => k + 1);
    
    // 품질/설비 이슈이고 해결완료인 경우 조치 입력 폼 표시
    const isQualityComplete = draft.category === "quality" && draft.q_status === "완료";
    const isEquipmentComplete = draft.category === "equipment" && draft.e_status === "완료";
    
    if (isQualityComplete || isEquipmentComplete) {
      setLinkedIssueForAction({ id: item.id, title: item.title, category: draft.category });
      setShowActionForm(true);
    } else {
      alert("이슈가 저장되었습니다.");
    }
  }

  // 조치 저장 (해결완료 시)
  function handleActionSubmit(item: ActionItem, _draft: ActionDraft) {
    addActionItem(recordDate, writerName, item);
    
    // 이슈 상태 완료로 변경 + 조치 연계
    if (linkedIssueForAction) {
      updateIssueStatus(linkedIssueForAction.id, "완료", writerName, item.id);
    }
    
    setShowActionForm(false);
    setLinkedIssueForAction(null);
    setRefreshKey((k) => k + 1);
    alert("이슈와 조치가 저장되었습니다.");
  }

  // 이슈 삭제
  function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    removeIssueItem(recordDate, writerName, id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="pageWrap">
      <div className="pageHeader">
        <div className="pageTitle">이슈 기록</div>
      </div>

      {/* 기본 정보 입력 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <RecordHeaderBlock
          recordDate={recordDate}
          onChangeRecordDate={setRecordDate}
          writerName={writerName}
          setWriterName={setWriterName}
          writerRole={writerRole}
          setWriterRole={setWriterRole}
          showSite={false}
        />
      </div>

      {/* 이슈 입력 폼 */}
      {writerName && writerRole ? (
        <IssueForm
          recordDate={recordDate}
          writerName={writerName}
          writerRole={writerRole}
          onSubmit={handleIssueSubmit}
          embedded={false}
        />
      ) : (
        <div className="card">
          <div style={{ opacity: 0.6, textAlign: "center", padding: 20 }}>
            작성자와 직책을 입력하면 이슈를 등록할 수 있습니다.
          </div>
        </div>
      )}

      {/* 해결완료 시 조치 입력 폼 */}
      {showActionForm && linkedIssueForAction && (
        <div className="card" style={{ marginTop: 16, border: "1px solid rgba(70, 130, 255, 0.3)" }}>
          <div className="p" style={{ marginTop: 0, marginBottom: 8, fontWeight: 600, color: "var(--accent)" }}>
            🔧 해결완료 - 조치 내용 입력
          </div>
          <ActionForm
            recordDate={recordDate}
            writerName={writerName}
            writerRole={writerRole}
            linkedIssue={{ id: linkedIssueForAction.id, title: linkedIssueForAction.title }}
            category={linkedIssueForAction.category}
            onSubmit={handleActionSubmit}
            onCancel={() => {
              setShowActionForm(false);
              setLinkedIssueForAction(null);
              alert("이슈가 저장되었습니다. (조치 미입력)");
            }}
            embedded
          />
        </div>
      )}

      {/* 저장된 이슈 목록 */}
      {savedItems.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="p" style={{ marginTop: 0, marginBottom: 8, fontWeight: 600 }}>
            오늘 등록한 이슈 ({savedItems.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {savedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: item.status === "완료" ? "rgba(0,200,100,0.2)" : "rgba(255,180,0,0.2)",
                        color: item.status === "완료" ? "#0c8" : "#fb0",
                      }}
                    >
                      {item.status || "진행중"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    [{categoryLabels[item.category]}] {item.details?.slice(0, 50)}
                    {item.details && item.details.length > 50 ? "..." : ""}
                  </div>
                  {item.linkedActionId && (
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4, color: "var(--accent)" }}>
                      ✓ 조치 연계됨
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                  onClick={() => handleDelete(item.id)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
