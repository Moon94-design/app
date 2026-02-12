import { useState } from "react";
import type { PartnerV2Draft, TradeProfileItem } from "@kernel/schema/partner";
import PartnerProfilesSection from "./PartnerProfilesSection";

type DuplicatePartnerOption = {
  id: string;
  label: string;
};

type SaveDuplicateInput = {
  id: string;
  partnerName: string;
  partnerDetailTag: string;
};

type SaveDuplicateResult = {
  ok: boolean;
  message: string;
};

type PartnerCreateFlowProps = {
  draft: PartnerV2Draft;
  onUpdateBase: (patch: Partial<PartnerV2Draft["base"]>) => void;
  onUpdateExtra: (patch: Partial<PartnerV2Draft["extra"]>) => void;
  onAddProfile: () => void;
  onUpdateProfile: (index: number, patch: Partial<TradeProfileItem>) => void;
  onRemoveProfile: (index: number) => void;
  formatPhone: (value: string) => string;
  duplicatePartners?: DuplicatePartnerOption[];
  onSaveDuplicate?: (input: SaveDuplicateInput) => Promise<SaveDuplicateResult>;
};

export default function PartnerCreateFlow({
  draft,
  onUpdateBase,
  onUpdateExtra,
  onAddProfile,
  onUpdateProfile,
  onRemoveProfile,
  formatPhone,
  duplicatePartners = [],
  onSaveDuplicate,
}: PartnerCreateFlowProps) {
  const { base, extra } = draft;
  const [editingDuplicateId, setEditingDuplicateId] = useState<string>("");
  const [editingName, setEditingName] = useState<string>("");
  const [editingDetail, setEditingDetail] = useState<string>("");

  function startDuplicateEdit(item: DuplicatePartnerOption) {
    const [namePart, detailPart] = item.label.split("·");
    setEditingDuplicateId(item.id);
    setEditingName((namePart || "").trim());
    setEditingDetail((detailPart || "").trim());
  }

  function cancelDuplicateEdit() {
    setEditingDuplicateId("");
    setEditingName("");
    setEditingDetail("");
  }

  async function saveDuplicateEdit() {
    if (!onSaveDuplicate || !editingDuplicateId) return;
    const result = await onSaveDuplicate({
      id: editingDuplicateId,
      partnerName: editingName,
      partnerDetailTag: editingDetail,
    });
    if (!result.ok) {
      alert(result.message);
      return;
    }
    alert(result.message);
    cancelDuplicateEdit();
  }

  return (
    <div className="form-grid">
      <div className="form-field">
        <label className="form-label">거래처명</label>
        <input
          className="input"
          value={base.partnerName}
          onChange={(e) => onUpdateBase({ partnerName: e.target.value })}
        />

        {duplicatePartners.length > 0 ? (
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <p className="p" style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
              동일 이름 거래처가 이미 있습니다. 아래에서 바로 수정해 세부를 구분해 주세요.
            </p>
            {duplicatePartners.slice(0, 5).map((row) => (
              <div key={row.id} className="card" style={{ background: "rgba(255,255,255,0.03)", padding: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="p" style={{ margin: 0 }}>{row.label}</span>
                  {onSaveDuplicate ? (
                    <button type="button" className="btn" onClick={() => startDuplicateEdit(row)}>
                      수정
                    </button>
                  ) : null}
                </div>

                {editingDuplicateId === row.id ? (
                  <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                    <input
                      className="input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="거래처명"
                    />
                    <input
                      className="input"
                      value={editingDetail}
                      onChange={(e) => setEditingDetail(e.target.value)}
                      placeholder="예: 본사, OO지점"
                    />
                    <div className="row" style={{ marginTop: 0 }}>
                      <button type="button" className="btn primary" onClick={saveDuplicateEdit}>
                        수정 저장
                      </button>
                      <button type="button" className="btn" onClick={cancelDuplicateEdit}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="form-field">
        <label className="form-label">거래처명 세부</label>
        <input
          className="input"
          value={base.partnerDetailTag || ""}
          onChange={(e) => onUpdateBase({ partnerDetailTag: e.target.value })}
          placeholder="예: 본사, OO지점"
        />
      </div>

      <div className="form-field">
        <label className="form-label">대표자</label>
        <input
          className="input"
          value={base.ceoName}
          onChange={(e) => onUpdateBase({ ceoName: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">연락처</label>
        <input
          className="input"
          placeholder="02-1234-5678 또는 010-1234-5678"
          value={base.phone}
          onChange={(e) => onUpdateBase({ phone: e.target.value })}
          onBlur={(e) => onUpdateBase({ phone: formatPhone(e.target.value) })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">주소</label>
        <div className="form-subgrid">
          <input
            className="input"
            placeholder="우편번호"
            value={base.zip}
            onChange={(e) => onUpdateBase({ zip: e.target.value })}
          />
          <input
            className="input"
            placeholder="주소"
            value={base.addr1}
            onChange={(e) => onUpdateBase({ addr1: e.target.value })}
          />
          <input
            className="input"
            placeholder="상세주소"
            value={base.addr2}
            onChange={(e) => onUpdateBase({ addr2: e.target.value })}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">사업자번호</label>
        <input
          className="input"
          value={base.businessNo}
          onChange={(e) => onUpdateBase({ businessNo: e.target.value })}
        />
      </div>

      <div className="form-two-col">
        <div className="form-field">
          <label className="form-label">담당자명</label>
          <input
            className="input"
            value={base.contactName}
            onChange={(e) => onUpdateBase({ contactName: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label className="form-label">담당자 연락처</label>
          <input
            className="input"
            value={base.contactPhone}
            onChange={(e) => onUpdateBase({ contactPhone: e.target.value })}
            onBlur={(e) => onUpdateBase({ contactPhone: formatPhone(e.target.value) })}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">담당자 참고사항</label>
        <textarea
          className="textarea"
          rows={2}
          value={extra.contactMemo}
          onChange={(e) => onUpdateExtra({ contactMemo: e.target.value })}
          placeholder="담당자 관련 메모"
        />
      </div>

      <div className="form-field">
        <label className="form-label">거래처 메모</label>
        <textarea
          className="textarea"
          rows={4}
          value={extra.note}
          onChange={(e) => onUpdateExtra({ note: e.target.value })}
          placeholder="납품/정산 주의사항 등"
        />
      </div>

      <div className="form-field">
        <label className="form-label">계좌번호</label>
        <input
          className="input"
          placeholder="은행명 계좌번호 예금주"
          value={extra.bankAccount}
          onChange={(e) => onUpdateExtra({ bankAccount: e.target.value })}
        />
      </div>

      <div className="form-two-col">
        <div className="form-field">
          <label className="form-label">중요도</label>
          <select
            className="input"
            value={extra.importance}
            onChange={(e) => onUpdateExtra({ importance: e.target.value as "상" | "중" | "하" })}
          >
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">관계현황</label>
          <select
            className="input"
            value={extra.relationshipStatus}
            onChange={(e) => onUpdateExtra({ relationshipStatus: e.target.value as "상" | "중" | "하" })}
          >
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </select>
        </div>
      </div>

      <PartnerProfilesSection
        profiles={extra.tradeProfiles}
        onAdd={onAddProfile}
        onUpdate={onUpdateProfile}
        onRemove={onRemoveProfile}
      />
    </div>
  );
}
