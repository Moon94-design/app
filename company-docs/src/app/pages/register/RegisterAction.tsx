/**
 * RegisterAction - 조치 기록 페이지
 * 
 * ActionForm 컴포넌트를 사용하여 조치 입력
 * - 폼은 공통 컴포넌트 사용
 * - 저장/목록 관리만 이 페이지에서 담당
 * - 진행중인 이슈만 연계 가능
 */
import { useEffect, useMemo, useState } from "react";
import { ActionForm, useWriterInfo, NONE_VALUE, RecordHeaderBlock } from "../../../ssot";
import { addActionItem, listActionItems, removeActionItem } from "../../../data/actionRepo";
import { listPendingIssues, updateIssueStatus } from "../../../data/issueRepo";
import type { ActionDraft, ActionItem } from "../../../ssot";

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RegisterAction() {
  // 기본 상태
  const [recordDate, setRecordDate] = useState(todayYMD);
  const [site, setSite] = useState<"대구" | "성주" | "">("");
  const [savedItems, setSavedItems] = useState<ActionItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 공통 훅
  const { writerName, writerRole, setWriterName, setWriterRole } = useWriterInfo({
    writerKey: "action_writer_name",
    roleKey: "action_writer_role",
  });

  // 진행중인 이슈 목록 (조치 연계용)
  const pendingIssues = useMemo(() => listPendingIssues(), [refreshKey]);

  // 저장된 조치 목록 로드
  useEffect(() => {
    if (writerName) {
      const items = listActionItems(recordDate, writerName);
      setSavedItems(items);
    } else {
      setSavedItems([]);
    }
  }, [recordDate, writerName, refreshKey]);

  // 조치 저장
  function handleActionSubmit(item: ActionItem, draft: ActionDraft) {
    addActionItem(recordDate, writerName, item);
    
    // 이슈와 연계되어 있으면 이슈 상태를 완료로 변경
    if (draft.issueId && draft.issueId !== NONE_VALUE) {
      updateIssueStatus(draft.issueId, "완료", writerName, item.id);
    }
    
    setRefreshKey((k) => k + 1);
    alert("조치기록이 저장되었습니다.");
  }

  // 조치 삭제
  function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    removeActionItem(recordDate, writerName, id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="pageWrap">
      <div className="pageHeader">
        <div className="pageTitle">조치 기록</div>
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
          site={site}
          onChangeSite={(newSite) => setSite((newSite as "" | "대구" | "성주") || "")}
          siteOptions={["대구", "성주"]}
          showSite={true}
        />
      </div>

      {/* 조치 입력 폼 */}
      {writerName && writerRole ? (
        <ActionForm
          recordDate={recordDate}
          writerName={writerName}
          writerRole={writerRole}
          site={site || undefined}
          onSubmit={handleActionSubmit}
          embedded={false}
          pendingIssues={pendingIssues}
        />
      ) : (
        <div className="card">
          <div style={{ opacity: 0.6, textAlign: "center", padding: 20 }}>
            작성자와 직책을 입력하면 조치를 등록할 수 있습니다.
          </div>
        </div>
      )}

      {/* 저장된 조치 목록 */}
      {savedItems.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="p" style={{ marginTop: 0, marginBottom: 8, fontWeight: 600 }}>오늘 등록한 조치 ({savedItems.length})</div>
          <div style={{ display: "grid", gap: 8 }}>
            {savedItems.map((item) => (
              <div key={item.id} style={{
                padding: "12px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 8,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                alignItems: "start",
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    {item.details?.slice(0, 50)}{item.details && item.details.length > 50 ? "..." : ""}
                  </div>
                  {item.issueLabel && (
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>이슈: {item.issueLabel}</div>
                  )}
                  {item.vendorLabel && (
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>업체: {item.vendorLabel}</div>
                  )}
                  {item.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {item.tags.slice(0, 5).map((t) => (
                        <span key={t} style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.06)",
                        }}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="btn" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => handleDelete(item.id)}>삭제</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
