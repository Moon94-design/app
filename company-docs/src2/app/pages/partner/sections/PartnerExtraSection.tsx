import type { PartnerExtra } from "@kernel/schema/partner";

type PartnerExtraSectionProps = {
  extra: PartnerExtra;
  onUpdate: (patch: Partial<PartnerExtra>) => void;
};

export default function PartnerExtraSection({ extra, onUpdate }: PartnerExtraSectionProps) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처 메모</label>
          <textarea
            className="textarea"
            rows={4}
            value={extra.note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="납품/품질 주의사항 등"
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자 참고사항</label>
          <textarea
            className="textarea"
            rows={2}
            value={extra.contactMemo}
            onChange={(e) => onUpdate({ contactMemo: e.target.value })}
            placeholder="담당자 관련 메모"
          />
        </div>

        <div>
          <label className="p" style={{ display: "block", marginBottom: 6 }}>계좌번호</label>
          <input
            className="input"
            placeholder="은행명 계좌번호 예금주"
            value={extra.bankAccount}
            onChange={(e) => onUpdate({ bankAccount: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>중요도</label>
            <select
              className="input"
              value={extra.importance}
              onChange={(e) => onUpdate({ importance: e.target.value as "상" | "중" | "하" })}
            >
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>관계현황</label>
            <select
              className="input"
              value={extra.relationshipStatus}
              onChange={(e) => onUpdate({ relationshipStatus: e.target.value as "상" | "중" | "하" })}
            >
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
          </div>
        </div>
    </div>
  );
}
