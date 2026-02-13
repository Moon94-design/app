import { MasterFormHeader } from "@kernel/components/master";
import { AutoTitleField, DailyMetaFields } from "@kernel/components/record";
import { TagBlock } from "@kernel/components/tag";
import { useRegisterProductionPage } from "./hooks/useRegisterProductionPage";
import FilterableSelect from "./sections/common/FilterableSelect";

export default function RegisterProductionDailyPage() {
  const {
    draft,
    docs,
    lineDraft,
    setLineDraft,
    shiftOptions,
    productOptions,
    itemOptions,
    siteOptions,
    tagCandidates,
    writerLocked,
    updateDraft,
    addLine,
    removeLine,
    resetDraft,
    submit,
    removeDoc,
  } = useRegisterProductionPage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="생산 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <div className="form-grid">
        <DailyMetaFields
          recordDate={draft.recordDate}
          site={draft.site}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          siteOptions={siteOptions}
          onChangeRecordDate={(next) => updateDraft({ recordDate: next })}
          onChangeSite={(next) => updateDraft({ site: next })}
          onChangeWriterName={(next) => updateDraft({ writerName: next })}
          onChangeWriterRole={(next) => updateDraft({ writerRole: next })}
          lockSite={writerLocked}
          lockWriterName={writerLocked}
          lockWriterRole={writerLocked}
        />

        <AutoTitleField
          recordDate={draft.recordDate}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          suffix="생산일지"
          value={draft.title}
          onChange={(next) => updateDraft({ title: next })}
          placeholder="비워두면 자동 입력"
        />

        <div className="form-field">
          <p className="form-label">내용</p>
          <textarea
            className="textarea"
            rows={3}
            value={draft.details}
            onChange={(e) => updateDraft({ details: e.target.value })}
          />
        </div>

        <div className="form-field">
          <p className="form-label">태그</p>
          <TagBlock
            scope="production"
            tagsText={draft.tagsText}
            onChangeTagsText={(next) => updateDraft({ tagsText: next })}
            detailsText={draft.details}
            candidates={tagCandidates}
            placeholder="태그 입력 후 Enter"
            showChips={true}
          />
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h2 className="h1" style={{ fontSize: 16 }}>
          생산 항목 추가
        </h2>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <div className="form-two-col">
            <div className="form-field">
              <p className="form-label">근무조</p>
              <select
                className="input"
                value={lineDraft.shift}
                onChange={(e) =>
                  setLineDraft((prev) => ({ ...prev, shift: e.target.value as (typeof shiftOptions)[number] }))
                }
              >
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <p className="form-label">생산품</p>
              <FilterableSelect
                value={lineDraft.product}
                options={productOptions.map((product) => ({ id: product, label: product }))}
                onChange={(next) =>
                  setLineDraft((prev) => ({
                    ...prev,
                    product: next as (typeof productOptions)[number],
                  }))
                }
                searchPlaceholder="생산품 포함 검색"
                noResultText="검색 결과가 없습니다. 아래 목록에서 기존 생산품을 선택해 주세요."
                allowEmpty={false}
              />
            </div>
          </div>

          <div className="form-two-col">
            <div className="form-field">
              <p className="form-label">품목</p>
              <FilterableSelect
                value={lineDraft.item}
                options={itemOptions.map((item) => ({ id: item, label: item }))}
                onChange={(next) => setLineDraft((prev) => ({ ...prev, item: next as (typeof itemOptions)[number] }))}
                searchPlaceholder="품목 포함 검색"
                noResultText="검색 결과가 없습니다. 아래 목록에서 기존 품목을 선택해 주세요."
                allowEmpty={false}
              />
            </div>
            <div className="form-field">
              <p className="form-label">생산량(kg)</p>
              <input
                className="input"
                inputMode="numeric"
                value={String(lineDraft.kg)}
                onChange={(e) => setLineDraft((prev) => ({ ...prev, kg: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="form-two-col">
            <div className="form-field">
              <p className="form-label">생산수량(포대)</p>
              <input
                className="input"
                inputMode="numeric"
                value={String(lineDraft.bags)}
                onChange={(e) => setLineDraft((prev) => ({ ...prev, bags: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="form-field">
              <p className="form-label">비고</p>
              <input
                className="input"
                value={lineDraft.memo}
                onChange={(e) => setLineDraft((prev) => ({ ...prev, memo: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn" onClick={addLine}>
            생산 항목 추가
          </button>
        </div>

        {(draft.lines || []).map((line) => (
          <div key={line.id} className="card" style={{ marginTop: 8, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontWeight: 900 }}>
              {line.shift} · {line.product} · {line.item}
            </div>
            <div className="p" style={{ marginTop: 6 }}>
              {line.kg.toLocaleString()} kg / {line.bags.toLocaleString()} 포대
            </div>
            {line.memo ? <div className="p" style={{ marginTop: 6 }}>{line.memo}</div> : null}
            <div className="row">
              <button type="button" className="btn danger" onClick={() => removeLine(line.id)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장
        </button>
      </div>

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        최근 문서
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장한 문서가 없다.</p> : null}

      {docs.slice(0, 30).map((doc) => (
        <div key={doc.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>
                {doc.recordDate} · {doc.site || "-"} · {doc.title}
              </div>
              <div className="p" style={{ marginTop: 6 }}>
                작성자: {(doc.writerName || "-").trim()} {(doc.writerRole || "").trim()}
              </div>
              <div className="p" style={{ marginTop: 6 }}>항목 {(doc.lines || []).length}건</div>
            </div>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (!confirm(`생산기록 "${doc.title}"를 삭제할까?`)) return;
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
