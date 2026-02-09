import type { PartnerBase } from "@kernel/schema/partner";

type PartnerBaseSectionProps = {
  base: PartnerBase;
  onUpdate: (patch: Partial<PartnerBase>) => void;
  formatPhone: (value: string) => string;
};

export default function PartnerBaseSection({ base, onUpdate, formatPhone }: PartnerBaseSectionProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 16, marginBottom: 12, color: "#1976d2" }}>📋 기본 정보</h3>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처명</label>
          <input
            className="input"
            value={base.partnerName}
            onChange={(e) => onUpdate({ partnerName: e.target.value })}
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>대표자</label>
          <input
            className="input"
            value={base.ceoName}
            onChange={(e) => onUpdate({ ceoName: e.target.value })}
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>연락처</label>
          <input
            className="input"
            placeholder="02-1234-5678 또는 010-1234-5678"
            value={base.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            onBlur={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>주소</label>
          <div style={{ display: "grid", gap: 8 }}>
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

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>사업자번호</label>
          <input
            className="input"
            value={base.businessNo}
            onChange={(e) => onUpdate({ businessNo: e.target.value })}
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              className="input"
              placeholder="담당자명"
              value={base.contactName}
              onChange={(e) => onUpdate({ contactName: e.target.value })}
            />
            <input
              className="input"
              placeholder="담당자 휴대폰"
              value={base.contactPhone}
              onChange={(e) => onUpdate({ contactPhone: e.target.value })}
              onBlur={(e) => onUpdate({ contactPhone: formatPhone(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
