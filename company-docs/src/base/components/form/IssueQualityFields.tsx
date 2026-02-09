/**
 * IssueQualityFields - 품질 이슈 카테고리 필드
 * 
 * 진행중/해결완료 상태 포함
 * - 해결완료 시: 원인/조치/재발방지 입력 가능
 * - 진행중 시: 조치 필드 숨김
 */
import type { IssueDraft } from "../../../domain/schema/daily/issue";

type Props = {
  draft: IssueDraft;
  onUpdate: <K extends keyof IssueDraft>(key: K, value: IssueDraft[K]) => void;
};

export default function IssueQualityFields({ draft, onUpdate }: Props) {
  const isCompleted = draft.q_status === "완료";

  return (
    <>
      {/* 종류 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">종류</div>
        <div className="row" style={{ marginTop: 0 }}>
          {(["압축품", "분쇄품", "펠렛"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`selBtn ${draft.q_kind === k ? "active" : ""}`}
              onClick={() => onUpdate("q_kind", draft.q_kind === k ? undefined : k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* 품목 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">품목</div>
        <div className="row" style={{ marginTop: 0 }}>
          {(["PP", "PE"] as const).map((it) => (
            <button
              key={it}
              type="button"
              className={`selBtn ${draft.q_item === it ? "active" : ""}`}
              onClick={() => onUpdate("q_item", draft.q_item === it ? undefined : it)}
            >
              {it}
            </button>
          ))}
        </div>
      </div>

      {/* 심각도 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">심각도</div>
        <div className="row" style={{ marginTop: 0 }}>
          {(["낮음", "보통", "높음"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              className={`selBtn ${draft.q_severity === sev ? "active" : ""}`}
              onClick={() => onUpdate("q_severity", sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 상태 - 진행중/해결완료 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">상태</div>
        <div className="row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className={`selBtn ${draft.q_status === "진행중" ? "active" : ""}`}
            onClick={() => onUpdate("q_status", "진행중")}
            style={draft.q_status === "진행중" ? { background: "rgba(255,180,0,0.3)", borderColor: "rgba(255,180,0,0.5)" } : {}}
          >
            진행중
          </button>
          <button
            type="button"
            className={`selBtn ${draft.q_status === "완료" ? "active" : ""}`}
            onClick={() => onUpdate("q_status", "완료")}
            style={draft.q_status === "완료" ? { background: "rgba(0,200,100,0.3)", borderColor: "rgba(0,200,100,0.5)" } : {}}
          >
            해결완료
          </button>
        </div>
      </div>

      {/* 원인 - 해결완료 시에만 표시 */}
      {isCompleted && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">원인</div>
          <textarea
            className="textarea"
            rows={2}
            value={draft.q_cause}
            onChange={(e) => onUpdate("q_cause", e.target.value)}
          />
        </div>
      )}

      {/* 조치 - 해결완료 시에만 표시 */}
      {isCompleted && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">조치</div>
          <textarea
            className="textarea"
            rows={2}
            value={draft.q_action}
            onChange={(e) => onUpdate("q_action", e.target.value)}
          />
        </div>
      )}

      {/* 재발방지 - 해결완료 시에만 표시 */}
      {isCompleted && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">재발방지</div>
          <textarea
            className="textarea"
            rows={2}
            value={draft.q_prevent}
            onChange={(e) => onUpdate("q_prevent", e.target.value)}
          />
        </div>
      )}
    </>
  );
}
