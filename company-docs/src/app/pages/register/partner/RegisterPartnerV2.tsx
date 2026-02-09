/**
 * RegisterPartnerV2.tsx
 * 거래처 V2 등록/수정 화면 (Base + Extra)
 * 
 * 역할:
 * - mode="create": 신규 등록 (입력 순서=조회 순서, Base/Extra 구분 최소화)
 * - mode="edit": 관리 수정 (Base 위 / Extra 아래 섹션 분리)
 * - partnerCode는 UI에 노출하지 않음 (내부키)
 */

import { useEffect, useMemo, useState } from "react";
import { repo } from "../../../../data/repo";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import type { PartnerV2, PartnerV2Draft, TradeProfileItem } from "./partnerV2Types";
import { defaultPartnerV2Draft, isCompleted } from "./partnerV2Types";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `PV2_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}


// 전화번호 자동 포맷팅 (010-1234-5678, 02-123-4567 등)
function formatPhone(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, "");
  if (cleaned.length === 0) return "";
  
  // 010-xxxx-xxxx (11자리)
  if (cleaned.startsWith("010") && cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  // 02-xxx-xxxx (10자리, 서울)
  if (cleaned.startsWith("02") && cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("02") && cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  // 0xx-xxxx-xxxx (11자리, 지역번호)
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  
  return cleaned; // 패턴 미일치 시 숫자만 반환
}

function normalizeDraft(input: PartnerV2Draft): PartnerV2Draft {
  const next: PartnerV2Draft = {
    base: { ...input.base },
    extra: { ...input.extra },
  };

  if (!next.extra.tradeProfiles) {
    next.extra.tradeProfiles = [];
  }
  if (!next.extra.importance) {
    next.extra.importance = "중";
  }
  if (!next.extra.relationshipStatus) {
    next.extra.relationshipStatus = "중";
  }
  if (next.base.email === undefined) {
    next.base.email = "";
  }
  if (next.base.fax === undefined) {
    next.base.fax = "";
  }
  if (next.base.businessType === undefined) {
    next.base.businessType = "";
  }
  if (next.base.businessItem === undefined) {
    next.base.businessItem = "";
  }
  if (next.base.corporateNo === undefined) {
    next.base.corporateNo = "";
  }
  if (next.extra.bankAccount === undefined) {
    next.extra.bankAccount = "";
  }

  return next;
}

export type RegisterPartnerV2Props = {
  mode?: "create" | "edit"; // 모드 (기본: create)
  partnerId?: string; // 수정 모드용 ID
  onClose?: () => void;
};

export default function RegisterPartnerV2(props: RegisterPartnerV2Props) {
  const { mode = "create", partnerId, onClose } = props;

  const editMode = mode === "edit" && !!partnerId;
  const [docs, setDocs] = useState<PartnerV2[]>(() => repo.partners_v2<PartnerV2>().getAll());
  const {
    draft,
    setDraft,
    saveDraft,
    discardDraft,
  } = useDraft<PartnerV2Draft>({
    key: DRAFT_KEYS.partnerV2,
    initial: defaultPartnerV2Draft(),
    migrate: normalizeDraft,
    enabled: !editMode,
  });

  useEffect(() => {
    if (!editMode || !partnerId) return;
    const found = repo.partners_v2<PartnerV2>().getAll().find((x) => x.id === partnerId);
    if (found) {
      setDraft({ base: found.base, extra: found.extra }, { dirty: false });
    }
  }, [editMode, partnerId, setDraft]);
  const completed = useMemo(() => isCompleted(draft.extra), [draft.extra]);

  function persist(next: PartnerV2Draft) {
    setDraft(next);
    if (!editMode) {
      saveDraft(next);
    }
  }

  function save() {
    // 검증 (필수 제거, 경고만)
    if (!draft.base.partnerName.trim()) {
      return alert("거래처명을 입력하세요.");
    }

    const now = new Date().toISOString();
    const allDocs = repo.partners_v2<PartnerV2>().getAll();

    // partnerCode 자동 생성 (신규 시)
    if (!draft.base.partnerCode.trim() && mode === "create") {
      draft.base.partnerCode = `PC_${Date.now()}`;
    }

    if (editMode && partnerId) {
      // 수정
      const existing = allDocs.find(x => x.id === partnerId);
      const updated: PartnerV2 = {
        id: partnerId,
        base: draft.base,
        extra: draft.extra,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      const nextDocs = allDocs.map(x => x.id === partnerId ? updated : x);
      repo.partners_v2<PartnerV2>().setAll(nextDocs);
      alert("수정 완료");
    } else {
      // 신규
      const newDoc: PartnerV2 = {
        id: newId(),
        base: draft.base,
        extra: draft.extra,
        createdAt: now,
        updatedAt: now,
      };
      repo.partners_v2<PartnerV2>().setAll([newDoc, ...allDocs]);
      alert("저장 완료");
      clearDraft();
    }
    setDocs(repo.partners_v2<PartnerV2>().getAll());
  }

  function clearDraft() {
    if (!editMode) {
      discardDraft();
    } else {
      setDraft(defaultPartnerV2Draft(), { dirty: false });
    }
  }

  function addProfile() {
    persist({
      ...draft,
      extra: {
        ...draft.extra,
        tradeProfiles: [
          ...draft.extra.tradeProfiles,
          { direction: "매입", item: "PP", kind: "압축", memo: "" },
        ],
      },
    });
  }

  function updateProfile(idx: number, patch: Partial<TradeProfileItem>) {
    const next = draft.extra.tradeProfiles.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    persist({
      ...draft,
      extra: { ...draft.extra, tradeProfiles: next },
    });
  }

  function removeProfile(idx: number) {
    const next = draft.extra.tradeProfiles.filter((_, i) => i !== idx);
    persist({
      ...draft,
      extra: { ...draft.extra, tradeProfiles: next },
    });
  }

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>
          거래처 {mode === "edit" ? "수정" : "등록"}
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* 완료 배지 */}
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 900,
              background: completed ? "#339af0" : "#ff6b6b",
              color: "#fff",
            }}
          >
            {completed ? "✅ 완료" : "⚠️ 미완료"}
          </span>
          {onClose && (
            <button type="button" className="btn" onClick={onClose}>
              ← 돌아가기
            </button>
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      {mode === "edit" && (
        <div style={{ marginBottom: 20, padding: 12, background: "rgba(76, 175, 80, 0.1)", borderRadius: 4 }}>
          <p className="p" style={{ fontSize: 13, color: "#4caf50" }}>
            ✏️ 수정 모드: 모든 정보 변경 가능
          </p>
        </div>
      )}

      {/* ===== Base 정보 (위쪽) ===== */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: "#1976d2" }}>📋 기본 정보</h3>
        <div style={{ display: "grid", gap: 14 }}>
          {/* 거래처명 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처명</label>
            <input
              className="input"
              value={draft.base.partnerName}
              onChange={(e) => persist({ ...draft, base: { ...draft.base, partnerName: e.target.value } })}
            />
          </div>

          {/* 대표자 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>대표자</label>
            <input
              className="input"
              value={draft.base.ceoName}
              onChange={(e) => persist({ ...draft, base: { ...draft.base, ceoName: e.target.value } })}
            />
          </div>

          {/* 연락처 (전화번호 자동 포맷팅) */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>연락처</label>
            <input
              className="input"
              placeholder="02-1234-5678 또는 010-1234-5678"
              value={draft.base.phone}
              onChange={(e) => persist({ ...draft, base: { ...draft.base, phone: e.target.value } })}
              onBlur={(e) => persist({ ...draft, base: { ...draft.base, phone: formatPhone(e.target.value) } })}
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>주소</label>
            <div style={{ display: "grid", gap: 8 }}>
              <input
                className="input"
                placeholder="우편번호"
                value={draft.base.zip}
                onChange={(e) => persist({ ...draft, base: { ...draft.base, zip: e.target.value } })}
              />
              <input
                className="input"
                placeholder="주소"
                value={draft.base.addr1}
                onChange={(e) => persist({ ...draft, base: { ...draft.base, addr1: e.target.value } })}
              />
              <input
                className="input"
                placeholder="상세주소"
                value={draft.base.addr2}
                onChange={(e) => persist({ ...draft, base: { ...draft.base, addr2: e.target.value } })}
              />
            </div>
          </div>

          {/* 사업자번호 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>사업자번호</label>
            <input
              className="input"
              value={draft.base.businessNo || ""}
              onChange={(e) => persist({ ...draft, base: { ...draft.base, businessNo: e.target.value } })}
            />
          </div>

          {/* 담당자 (담당자명 + 담당자 휴대폰) */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                className="input"
                placeholder="담당자명"
                value={draft.base.contactName}
                onChange={(e) => persist({ ...draft, base: { ...draft.base, contactName: e.target.value } })}
              />
              <input
                className="input"
                placeholder="담당자 휴대폰"
                value={draft.base.contactPhone}
                onChange={(e) => persist({ ...draft, base: { ...draft.base, contactPhone: e.target.value } })}
                onBlur={(e) => persist({ ...draft, base: { ...draft.base, contactPhone: formatPhone(e.target.value) } })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ===== Extra 정보 (아래쪽) ===== */}
      <div>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: "#e67e22" }}>📝 추가 정보</h3>
        <div style={{ display: "grid", gap: 14 }}>
          {/* 거래처 메모 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>거래처 메모</label>
            <textarea
              className="textarea"
              rows={4}
              value={draft.extra.note}
              onChange={(e) => persist({ ...draft, extra: { ...draft.extra, note: e.target.value } })}
              placeholder="납품/품질 주의사항 등"
            />
          </div>

          {/* 담당자 참고사항 */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>담당자 참고사항</label>
            <textarea
              className="textarea"
              rows={2}
              value={draft.extra.contactMemo || ""}
              onChange={(e) => persist({ ...draft, extra: { ...draft.extra, contactMemo: e.target.value } })}
              placeholder="담당자 관련 메모"
            />
          </div>

          {/* 계좌번호 (NEW) */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>계좌번호</label>
            <input
              className="input"
              placeholder="은행명 계좌번호 예금주"
              value={draft.extra.bankAccount || ""}
              onChange={(e) => persist({ ...draft, extra: { ...draft.extra, bankAccount: e.target.value } })}
            />
          </div>

          {/* 거래 프로필 (tradeProfiles 리스트) */}
          <div>
            <label className="p" style={{ display: "block", marginBottom: 6 }}>거래 프로필</label>
            {draft.extra.tradeProfiles.length === 0 ? (
              <p className="p" style={{ fontSize: 12, opacity: 0.7 }}>프로필 없음</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {draft.extra.tradeProfiles.map((profile, idx) => (
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
                        onChange={(e) =>
                          updateProfile(idx, { direction: e.target.value as "매입" | "매출" })
                        }
                      >
                        <option value="매입">매입</option>
                        <option value="매출">매출</option>
                      </select>
                      <select
                        className="input"
                        value={profile.item}
                        onChange={(e) => updateProfile(idx, { item: e.target.value as "PP" | "PE" })}
                      >
                        <option value="PP">PP</option>
                        <option value="PE">PE</option>
                      </select>
                      <select
                        className="input"
                        value={profile.kind}
                        onChange={(e) =>
                          updateProfile(idx, { kind: e.target.value as "압축" | "분쇄" | "펠렛" })
                        }
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
                        onChange={(e) => updateProfile(idx, { memo: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button type="button" className="btn danger" onClick={() => removeProfile(idx)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="btn" onClick={addProfile} style={{ marginTop: 8 }}>
              + 프로필 추가
            </button>
          </div>

          {/* 중요도 / 관계현황 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label className="p" style={{ display: "block", marginBottom: 6 }}>중요도</label>
              <select
                className="input"
                value={draft.extra.importance}
                onChange={(e) =>
                  persist({ ...draft, extra: { ...draft.extra, importance: e.target.value as "상" | "중" | "하" } })
                }
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
                value={draft.extra.relationshipStatus}
                onChange={(e) =>
                  persist({
                    ...draft,
                    extra: { ...draft.extra, relationshipStatus: e.target.value as "상" | "중" | "하" },
                  })
                }
              >
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="row" style={{ gap: 8, marginTop: 20 }}>
        <button type="button" className="btn primary" onClick={save}>
          {editMode ? "수정" : "저장"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (editMode && onClose) {
              onClose();
            } else {
              clearDraft();
            }
          }}
        >
          {editMode ? "취소" : "초기화"}
        </button>
      </div>

      {/* 최근 문서 (신규 등록 모드만) */}
      {mode === "create" && docs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>최근 등록</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {docs.slice(0, 5).map((doc) => {
              const comp = isCompleted(doc.extra);
              return (
                <div
                  key={doc.id}
                  className="card"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>
                      {doc.base.partnerName}{" "}
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          background: comp ? "#339af0" : "#ff6b6b",
                          color: "#fff",
                        }}
                      >
                        {comp ? "완료" : "미완료"}
                      </span>
                    </div>
                    <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                      대표: {doc.base.ceoName}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setDraft({
                        base: doc.base,
                        extra: doc.extra,
                      });
                    }}
                  >
                    불러오기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
