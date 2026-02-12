import type { PartnerBase } from "@kernel/schema/partner";

type PartnerBaseSectionProps = {
  base: PartnerBase;
  onUpdate: (patch: Partial<PartnerBase>) => void;
  formatPhone: (value: string) => string;
};

export default function PartnerBaseSection({ base, onUpdate, formatPhone }: PartnerBaseSectionProps) {
  return (
    <div className="form-grid">
      <div className="form-field">
        <label className="form-label">거래처명</label>
        <input
          className="input"
          value={base.partnerName}
          onChange={(e) => onUpdate({ partnerName: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">거래처명 세부</label>
        <input
          className="input"
          value={base.partnerDetailTag || ""}
          onChange={(e) => onUpdate({ partnerDetailTag: e.target.value })}
          placeholder="예: 본사, 제1창고, 고정단가"
        />
      </div>

      <div className="form-field">
        <label className="form-label">대표자</label>
        <input
          className="input"
          value={base.ceoName}
          onChange={(e) => onUpdate({ ceoName: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">연락처</label>
        <input
          className="input"
          placeholder="02-1234-5678 또는 010-1234-5678"
          value={base.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          onBlur={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">주소</label>
        <div className="form-subgrid">
          <input
            className="input"
            placeholder="우편번호"
            value={base.zip}
            onChange={(e) => onUpdate({ zip: e.target.value })}
          />
          <input
            className="input"
            placeholder="주소"
            value={base.addr1}
            onChange={(e) => onUpdate({ addr1: e.target.value })}
          />
          <input
            className="input"
            placeholder="상세주소"
            value={base.addr2}
            onChange={(e) => onUpdate({ addr2: e.target.value })}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">사업자번호</label>
        <input
          className="input"
          value={base.businessNo}
          onChange={(e) => onUpdate({ businessNo: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">담당자</label>
        <div className="form-two-col">
          <input
            className="input"
            placeholder="담당자명"
            value={base.contactName}
            onChange={(e) => onUpdate({ contactName: e.target.value })}
          />
          <input
            className="input"
            placeholder="담당자 연락처"
            value={base.contactPhone}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            onBlur={(e) => onUpdate({ contactPhone: formatPhone(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
