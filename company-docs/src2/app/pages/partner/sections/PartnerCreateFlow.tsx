import type { PartnerV2Draft, TradeProfileItem } from "@kernel/schema/partner";
import PartnerProfilesSection from "./PartnerProfilesSection";

type PartnerCreateFlowProps = {
  draft: PartnerV2Draft;
  onUpdateBase: (patch: Partial<PartnerV2Draft["base"]>) => void;
  onUpdateExtra: (patch: Partial<PartnerV2Draft["extra"]>) => void;
  onAddProfile: () => void;
  onUpdateProfile: (index: number, patch: Partial<TradeProfileItem>) => void;
  onRemoveProfile: (index: number) => void;
  formatPhone: (value: string) => string;
};

export default function PartnerCreateFlow({
  draft,
  onUpdateBase,
  onUpdateExtra,
  onAddProfile,
  onUpdateProfile,
  onRemoveProfile,
  formatPhone,
}: PartnerCreateFlowProps) {
  const { base, extra } = draft;

  return (
    <div className="form-grid">
      <div className="form-field">
        <label className="form-label">거래처명</label>
        <input
          className="input"
          value={base.partnerName}
          onChange={(e) => onUpdateBase({ partnerName: e.target.value })}
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
          <label className="form-label">담당자 휴대폰</label>
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
          placeholder="납품/품질 주의사항 등"
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
