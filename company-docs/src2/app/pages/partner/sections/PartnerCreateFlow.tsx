import type { PartnerV2Draft, TradeProfileItem } from "@kernel/schema/partner";

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
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>1. 거래처 정보</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처명</label>
            <input
              className="input"
              value={base.partnerName}
              onChange={(e) => onUpdateBase({ partnerName: e.target.value })}
            />
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>대표자</label>
            <input
              className="input"
              value={base.ceoName}
              onChange={(e) => onUpdateBase({ ceoName: e.target.value })}
            />
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>연락처</label>
            <input
              className="input"
              placeholder="02-1234-5678 또는 010-1234-5678"
              value={base.phone}
              onChange={(e) => onUpdateBase({ phone: e.target.value })}
              onBlur={(e) => onUpdateBase({ phone: formatPhone(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>2. 주소/사업자</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>주소</label>
            <div style={{ display: "grid", gap: 8 }}>
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
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>사업자번호</label>
            <input
              className="input"
              value={base.businessNo}
              onChange={(e) => onUpdateBase({ businessNo: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>3. 담당자</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자명</label>
            <input
              className="input"
              value={base.contactName}
              onChange={(e) => onUpdateBase({ contactName: e.target.value })}
            />
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자 휴대폰</label>
            <input
              className="input"
              value={base.contactPhone}
              onChange={(e) => onUpdateBase({ contactPhone: e.target.value })}
              onBlur={(e) => onUpdateBase({ contactPhone: formatPhone(e.target.value) })}
            />
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자 참고사항</label>
            <textarea
              className="textarea"
              rows={2}
              value={extra.contactMemo}
              onChange={(e) => onUpdateExtra({ contactMemo: e.target.value })}
              placeholder="담당자 관련 메모"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>4. 메모/계좌</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처 메모</label>
            <textarea
              className="textarea"
              rows={4}
              value={extra.note}
              onChange={(e) => onUpdateExtra({ note: e.target.value })}
              placeholder="납품/품질 주의사항 등"
            />
          </div>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>계좌번호</label>
            <input
              className="input"
              placeholder="은행명 계좌번호 예금주"
              value={extra.bankAccount}
              onChange={(e) => onUpdateExtra({ bankAccount: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>5. 중요도/관계현황</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>중요도</label>
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
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>관계현황</label>
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
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>6. 거래 프로필</h3>
        {extra.tradeProfiles.length === 0 ? (
          <p className="p" style={{ fontSize: 12, opacity: 0.7 }}>프로필 없음</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {extra.tradeProfiles.map((profile, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 4,
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <select
                    className="input"
                    value={profile.direction}
                    onChange={(e) => onUpdateProfile(idx, { direction: e.target.value as "매입" | "매출" })}
                  >
                    <option value="매입">매입</option>
                    <option value="매출">매출</option>
                  </select>
                  <select
                    className="input"
                    value={profile.item}
                    onChange={(e) => onUpdateProfile(idx, { item: e.target.value as "PP" | "PE" })}
                  >
                    <option value="PP">PP</option>
                    <option value="PE">PE</option>
                  </select>
                  <select
                    className="input"
                    value={profile.kind}
                    onChange={(e) => onUpdateProfile(idx, { kind: e.target.value as "압축" | "분쇄" | "펠렛" })}
                  >
                    <option value="압축">압축</option>
                    <option value="분쇄">분쇄</option>
                    <option value="펠렛">펠렛</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="프로필 메모"
                    value={profile.memo || ""}
                    onChange={(e) => onUpdateProfile(idx, { memo: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn danger" onClick={() => onRemoveProfile(idx)}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="button" className="btn" onClick={onAddProfile} style={{ marginTop: 8 }}>
          + 프로필 추가
        </button>
      </div>
    </div>
  );
}
