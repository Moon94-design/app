import { MasterFormHeader } from "@kernel/components/master";
import { useRegisterIssuePage } from "./hooks/useRegisterIssuePage";

const CATEGORY_OPTIONS = ["품질", "설비", "안전"] as const;
const STATUS_OPTIONS = ["진행중", "완료"] as const;

export default function RegisterIssuePage() {
  const { draft, docs, updateDraft, resetDraft, submit, removeDoc } = useRegisterIssuePage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="이슈 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <div className="form-grid">
        <div className="form-field">
          <p className="form-label">기록일</p>
          <input
            className="input"
            type="date"
            value={draft.recordDate}
            onChange={(e) => updateDraft({ recordDate: e.target.value })}
          />
        </div>

        <div className="form-two-col">
          <div className="form-field">
            <p className="form-label">작성자</p>
            <input
              className="input"
              value={draft.writerName}
              onChange={(e) => updateDraft({ writerName: e.target.value })}
              placeholder="이름"
            />
          </div>
          <div className="form-field">
            <p className="form-label">직책</p>
            <input
              className="input"
              value={draft.writerRole}
              onChange={(e) => updateDraft({ writerRole: e.target.value })}
              placeholder="직책"
            />
          </div>
        </div>

        <div className="form-two-col">
          <div className="form-field">
            <p className="form-label">분류</p>
            <div className="row" style={{ marginTop: 0 }}>
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`selBtn ${draft.category === category ? "active" : ""}`}
                  onClick={() => updateDraft({ category })}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <p className="form-label">상태</p>
            <div className="row" style={{ marginTop: 0 }}>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`selBtn ${draft.status === status ? "active" : ""}`}
                  onClick={() => updateDraft({ status })}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-field">
          <p className="form-label">이슈 제목</p>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="예: 라인 2 모터 이상 소음"
          />
        </div>

        <div className="form-field">
          <p className="form-label">상세 내용</p>
          <textarea
            className="textarea"
            rows={4}
            value={draft.details}
            onChange={(e) => updateDraft({ details: e.target.value })}
            placeholder="상세 내용 입력"
          />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장
        </button>
      </div>

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>저장된 이슈 문서</h2>
      {docs.length === 0 ? <p className="p">아직 저장된 문서가 없다.</p> : null}

      {docs.map((doc) => (
        <div key={doc.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>{doc.recordDate} · {doc.writerName}</div>
              <div className="p" style={{ marginTop: 6 }}>직책: {doc.writerRole || "-"}</div>
              <div className="p" style={{ marginTop: 6 }}>이슈 항목 {doc.items.length}건</div>
            </div>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (!confirm(`이슈 문서(${doc.recordDate})를 삭제하시겠습니까?`)) return;
                removeDoc(doc.id);
              }}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
