/**
 * ActionForm - 조치 기록 폼 컴포넌트 (범용)
 * 
 * 사용처:
 * - RegisterAction 페이지 (embedded=false): 전체 폼
 * - IssueForm에서 해결완료 시 인라인 (embedded=true): 간소화된 폼 (내용/업체/금액만)
 * 
 * Props:
 * - recordDate, writerName, writerRole: 기본 정보 (embedded 시 숨김)
 * - linkedIssue: 연계된 이슈 (embedded 시 고정)
 * - category: 이슈 분류 (품질/설비/안전)
 * - onSubmit, onCancel: 콜백
 * - embedded: 인라인 모드
 * - pendingIssues: 진행중 이슈 목록
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { repo } from "../../../data/repo";
import { TagBlock, AutoTitleBlock, MainContentBlock } from "../../../ssot";
import { formatPhoneInput } from "../../utils/phone";
import { validateFields } from "../../hooks";
import { defaultActionDraft, toActionItem, type ActionDraft, type ActionItem } from "../../../domain/schema/daily/action";
import type { IssueCategory } from "../../../domain/schema/daily/issue";
import LinkedSelector, { NONE_VALUE } from "./LinkedSelector";

type VendorRow = {
  id: string;
  name: string;
  status: "거래중" | "보류" | "중단";
  region: string;
  scopes: string[];
  otherScopeText: string;
  contacts: Array<{ id: string; name: string; role: string; phone: string; note: string }>;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

function newId(prefix: string) {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

const SCOPE_OPTIONS = ["기계", "전기", "통신", "소모품", "정비", "기타"] as const;
type Scope = (typeof SCOPE_OPTIONS)[number];

export type ActionFormProps = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site?: "대구" | "성주";
  onSubmit: (item: ActionItem, draft: ActionDraft) => void;
  onCancel?: () => void;
  embedded?: boolean;
  linkedIssue?: { id: string; title: string };
  category?: IssueCategory;
  pendingIssues?: Array<{ id: string; title: string; category: string; date: string }>;
};

export default function ActionForm({
  recordDate,
  writerName,
  writerRole,
  site,
  onSubmit,
  onCancel,
  embedded = false,
  linkedIssue,
  category,
  pendingIssues = [],
}: ActionFormProps) {
  const [draft, setDraft] = useState<ActionDraft>(() => ({
    ...defaultActionDraft(),
    recordDate,
    writerName,
    writerRole,
    site,
    issueId: linkedIssue?.id || "",
    issueLabel: linkedIssue?.title || "",
  }));

  // ref for focus return after tag add
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  // 선택 상태
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedVendorLabel, setSelectedVendorLabel] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState(linkedIssue?.id || "");
  const [selectedIssueLabel, setSelectedIssueLabel] = useState(linkedIssue?.title || "");

  // 카테고리 라벨
  const categoryLabel = category === "quality" ? "품질" : category === "equipment" ? "설비" : category === "safety" ? "안전" : "";

  // 기준정보 로드
  const [vendors, setVendors] = useState<VendorRow[]>(() => repo.vendors<VendorRow>().getAll());

  // 이슈 옵션
  const issueOptions = useMemo(
    () => pendingIssues.map((i) => ({ id: i.id, label: i.title, subLabel: `${i.date} · ${i.category}` })),
    [pendingIssues]
  );

  // 업체 옵션
  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ id: v.id, label: v.name, subLabel: `${v.region} · ${v.scopes.join(", ")}` })),
    [vendors]
  );

  // 외부 props 변경 시 동기화
  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      recordDate,
      writerName,
      writerRole,
      site,
    }));
  }, [recordDate, writerName, writerRole, site]);

  // 업체 인라인 추가 폼
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorDraft, setVendorDraft] = useState({
    name: "",
    status: "거래중" as "거래중" | "보류" | "중단",
    region: "",
    scopes: ["정비"] as Scope[],
    otherScopeText: "",
    contacts: [{ id: newId("C"), name: "", role: "담당", phone: "", note: "" }],
    notes: "",
    tagsText: "",
  });

  function resetVendorDraft() {
    setVendorDraft({
      name: "",
      status: "거래중",
      region: "",
      scopes: ["정비"],
      otherScopeText: "",
      contacts: [{ id: newId("C"), name: "", role: "담당", phone: "", note: "" }],
      notes: "",
      tagsText: "",
    });
  }

  function toggleScope(s: Scope) {
    const has = vendorDraft.scopes.includes(s);
    const nextScopes = has ? vendorDraft.scopes.filter((x) => x !== s) : [...vendorDraft.scopes, s];
    const next = { ...vendorDraft, scopes: nextScopes };
    if (!nextScopes.includes("기타")) next.otherScopeText = "";
    setVendorDraft(next);
  }

  function addContact() {
    setVendorDraft({
      ...vendorDraft,
      contacts: [...vendorDraft.contacts, { id: newId("C"), name: "", role: "담당", phone: "", note: "" }],
    });
  }

  function removeContact(id: string) {
    const next = vendorDraft.contacts.filter((c) => c.id !== id);
    if (next.length === 0) next.push({ id: newId("C"), name: "", role: "담당", phone: "", note: "" });
    setVendorDraft({ ...vendorDraft, contacts: next });
  }

  function updateContact(id: string, patch: Partial<{ name: string; role: string; phone: string; note: string }>) {
    setVendorDraft({
      ...vendorDraft,
      contacts: vendorDraft.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function submitVendor() {
    if (!vendorDraft.name.trim()) return alert("업체명을 입력하세요.");
    if (!vendorDraft.region.trim()) return alert("지역을 입력하세요.");
    if (vendorDraft.scopes.length === 0) return alert("서비스 범위를 최소 1개 선택하세요.");
    if (vendorDraft.scopes.includes("기타") && !vendorDraft.otherScopeText.trim()) return alert("기타 내용을 입력하세요.");

    const cleanContacts = vendorDraft.contacts
      .filter((c) => c.name.trim() || c.phone.trim())
      .map((c) => ({ ...c, name: c.name.trim(), phone: c.phone.trim(), role: c.role.trim(), note: c.note.trim() }));

    const now = new Date().toISOString();
    const tags = (vendorDraft.tagsText || "").split(",").map((t) => t.trim()).filter(Boolean);

    const row: VendorRow = {
      id: newId("V"),
      name: vendorDraft.name.trim(),
      status: vendorDraft.status,
      region: vendorDraft.region.trim(),
      scopes: vendorDraft.scopes,
      otherScopeText: vendorDraft.otherScopeText.trim(),
      contacts: cleanContacts.length ? cleanContacts : [{ id: newId("C"), name: "", role: "담당", phone: "", note: "" }],
      notes: vendorDraft.notes.trim(),
      tags,
      createdAt: now,
      updatedAt: now,
    };

    const next = [row, ...vendors];
    setVendors(next);
    repo.vendors<VendorRow>().setAll(next);

    // 자동 선택
    setSelectedVendorId(row.id);
    setSelectedVendorLabel(row.name);
    resetVendorDraft();
    setShowVendorForm(false);
    alert("업체가 추가되었습니다.");
  }

  // 저장
  function handleSubmit() {
    // embedded 모드에서는 내용만 필수
    if (embedded) {
      if (!draft.details.trim()) {
        return alert("내용을 입력하세요.");
      }
    } else {
      // 전체 폼 검증
      const validation = validateFields(
        {
          writerName,
          writerRole,
          title: draft.title,
          details: draft.details,
        },
        [
          { name: "writerName", label: "작성자", required: true },
          { name: "writerRole", label: "직책", required: true },
          { name: "title", label: "제목", required: true },
          { name: "details", label: "내용", required: true },
        ]
      );

      if (!validation.ok) {
        return alert(validation.firstError);
      }
    }

    // 최종 Draft 구성
    const finalDraft: ActionDraft = {
      ...draft,
      recordDate,
      writerName,
      writerRole,
      title: draft.title,
      site,
      issueId: linkedIssue?.id || selectedIssueId || "",
      issueLabel: linkedIssue?.title || selectedIssueLabel || "",
      vendorId: selectedVendorId || "",
      vendorLabel: selectedVendorLabel || "",
    };

    const item = toActionItem(finalDraft);
    onSubmit(item, finalDraft);

    // 리셋
    setDraft({
      ...defaultActionDraft(),
      recordDate,
      writerName,
      writerRole,
      site,
    });
    setSelectedVendorId("");
    setSelectedVendorLabel("");
    if (!linkedIssue) {
      setSelectedIssueId("");
      setSelectedIssueLabel("");
    }
  }

  // 리셋
  function handleReset() {
    setDraft({
      ...defaultActionDraft(),
      recordDate,
      writerName,
      writerRole,
      site,
    });
    setSelectedVendorId("");
    setSelectedVendorLabel("");
    setSelectedIssueId("");
    setSelectedIssueLabel("");
    onCancel?.();
  }

  // 해당없음 선택 시 금액 숨김
  const showCostField = selectedVendorId && selectedVendorId !== NONE_VALUE;

  // ========== embedded 모드: 간소화된 폼 ==========
  if (embedded) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {/* 연계 이슈 표시 (고정) */}
        {linkedIssue && (
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
            <div className="p" style={{ opacity: 0.7 }}>연계 이슈</div>
            <div style={{ padding: "8px 12px", background: "rgba(70,130,255,0.15)", borderRadius: 8, fontSize: 13 }}>
              {linkedIssue.title}
            </div>
          </div>
        )}

        {/* 내용 (MainContentBlock) */}
        <MainContentBlock
          ref={detailsRef}
          label="내용"
          value={draft.details}
          onChange={(details) => setDraft((p) => ({ ...p, details }))}
          rows={3}
          placeholder="조치 내용을 입력하세요"
          required={true}
        />

        {/* 업체 선택 */}
        <LinkedSelector
          label="업체명"
          options={vendorOptions}
          selectedId={selectedVendorId}
          onSelect={(id, label) => {
            setSelectedVendorId(id);
            setSelectedVendorLabel(label);
            if (id === NONE_VALUE) {
              setDraft((p) => ({ ...p, vendorCost: 0 }));
            }
          }}
          placeholder="업체 검색..."
          showAddButton
          onAddClick={() => setShowVendorForm(!showVendorForm)}
        />

        {/* 업체 인라인 추가 폼 */}
        {showVendorForm && (
          <div style={{ marginLeft: 108, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <input className="input" value={vendorDraft.name} onChange={(e) => setVendorDraft({ ...vendorDraft, name: e.target.value })} placeholder="업체명 *" />
              <input className="input" value={vendorDraft.region} onChange={(e) => setVendorDraft({ ...vendorDraft, region: e.target.value })} placeholder="지역 *" />
              <div className="row" style={{ marginTop: 0 }}>
                <button type="button" className="btn primary" onClick={submitVendor}>저장</button>
                <button type="button" className="btn" onClick={() => { resetVendorDraft(); setShowVendorForm(false); }}>취소</button>
              </div>
            </div>
          </div>
        )}

        {/* 금액 (업체 선택 시에만) */}
        {showCostField && (
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
            <div className="p">금액</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input"
                inputMode="numeric"
                value={draft.vendorCost || ""}
                onChange={(e) => setDraft((p) => ({ ...p, vendorCost: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 }))}
                placeholder="0"
                style={{ width: 120 }}
              />
              <span style={{ opacity: 0.7 }}>원</span>
            </div>
          </div>
        )}

        {/* 태그 (간소화) */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">태그</div>
          <TagBlock
            scope="action"
            tagsText={draft.tagsText || ""}
            onChangeTagsText={(text) => setDraft((p) => ({ ...p, tagsText: text }))}
            detailsText={draft.details}
            placeholder="태그 입력"
            showChips={true}
            onAfterAdd={() => detailsRef.current?.focus()}
          />
        </div>

        {/* 버튼 */}
        <div className="row">
          <button type="button" className="btn primary" onClick={handleSubmit}>조치 저장</button>
          <button type="button" className="btn" onClick={handleReset}>취소</button>
        </div>
      </div>
    );
  }

  // ========== 전체 폼 (RegisterAction 페이지용) ==========
  return (
    <div className="card">
      <div style={{ display: "grid", gap: 8 }}>
        {/* 제목 (AutoTitleBlock) */}
        <AutoTitleBlock
          recordDate={recordDate}
          writerName={writerName}
          writerRole={writerRole}
          category={categoryLabel}
          suffix="조치기록"
          title={draft.title || ""}
          onTitleChange={(title) => setDraft((p) => ({ ...p, title }))}
          placeholder="클릭하면 자동완성"
        />

        {/* 이슈 연계 */}
        <LinkedSelector
          label="이슈 연계"
          options={issueOptions}
          selectedId={selectedIssueId}
          onSelect={(id, label) => {
            setSelectedIssueId(id);
            setSelectedIssueLabel(label);
          }}
          placeholder="진행중 이슈 검색..."
        />
        {pendingIssues.length === 0 && (
          <div style={{ marginLeft: 108, fontSize: 12, opacity: 0.5 }}>진행중인 이슈가 없습니다</div>
        )}

        {/* 내용 (MainContentBlock) */}
        <MainContentBlock
          ref={detailsRef}
          label="내용"
          value={draft.details}
          onChange={(details) => setDraft((p) => ({ ...p, details }))}
          rows={4}
          required={true}
        />

        {/* 태그 (TagBlock) */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
          <div className="p">태그</div>
          <TagBlock
            scope="action"
            tagsText={draft.tagsText || ""}
            onChangeTagsText={(text) => setDraft((p) => ({ ...p, tagsText: text }))}
            detailsText={draft.details}
            placeholder="태그 입력"
            showChips={true}
            onAfterAdd={() => detailsRef.current?.focus()}
          />
        </div>

        {/* 업체 선택 */}
        <LinkedSelector
          label="업체명"
          options={vendorOptions}
          selectedId={selectedVendorId}
          onSelect={(id, label) => {
            setSelectedVendorId(id);
            setSelectedVendorLabel(label);
            if (id === NONE_VALUE) {
              setDraft((p) => ({ ...p, vendorCost: 0 }));
            }
          }}
          placeholder="업체 검색..."
          showAddButton
          onAddClick={() => setShowVendorForm(!showVendorForm)}
        />

        {/* 업체 인라인 추가 폼 */}
        {showVendorForm && (
          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div>
                <div className="p" style={{ marginTop: 0 }}>업체명 *</div>
                <input className="input" value={vendorDraft.name} onChange={(e) => setVendorDraft({ ...vendorDraft, name: e.target.value })} />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>상태</div>
                <div className="row" style={{ marginTop: 8 }}>
                  {(["거래중", "보류", "중단"] as const).map((st) => (
                    <button key={st} type="button" className={`selBtn ${vendorDraft.status === st ? "active" : ""}`} onClick={() => setVendorDraft({ ...vendorDraft, status: st })}>{st}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>지역 *</div>
                <input className="input" value={vendorDraft.region} onChange={(e) => setVendorDraft({ ...vendorDraft, region: e.target.value })} placeholder="예: 대구, 경북" />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>서비스 범위</div>
                <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
                  {SCOPE_OPTIONS.map((sc) => (
                    <button key={sc} type="button" className={`selBtn ${vendorDraft.scopes.includes(sc) ? "active" : ""}`} onClick={() => toggleScope(sc)}>{sc}</button>
                  ))}
                </div>
                {vendorDraft.scopes.includes("기타") && (
                  <input className="input" style={{ marginTop: 8 }} value={vendorDraft.otherScopeText} onChange={(e) => setVendorDraft({ ...vendorDraft, otherScopeText: e.target.value })} placeholder="기타 내용" />
                )}
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>담당자</div>
                {vendorDraft.contacts.map((c, idx) => (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginTop: idx === 0 ? 8 : 4 }}>
                    <input className="input" value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="이름" />
                    <input className="input" value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} placeholder="역할" />
                    <input className="input" value={c.phone} onChange={(e) => updateContact(c.id, { phone: formatPhoneInput(e.target.value) })} placeholder="연락처" />
                    <button type="button" className="btn danger" onClick={() => removeContact(c.id)}>삭제</button>
                  </div>
                ))}
                <button type="button" className="btn" style={{ marginTop: 8 }} onClick={addContact}>담당자 추가</button>
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>비고</div>
                <textarea className="textarea" rows={2} value={vendorDraft.notes} onChange={(e) => setVendorDraft({ ...vendorDraft, notes: e.target.value })} />
              </div>

              <div className="row">
                <button type="button" className="btn primary" onClick={submitVendor}>저장</button>
                <button type="button" className="btn" onClick={() => { resetVendorDraft(); setShowVendorForm(false); }}>취소</button>
              </div>
            </div>
          </div>
        )}

        {/* 금액 */}
        {showCostField && (
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
            <div className="p">금액</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input"
                inputMode="numeric"
                value={draft.vendorCost || ""}
                onChange={(e) => setDraft((p) => ({ ...p, vendorCost: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 }))}
                placeholder="0"
                style={{ width: 150 }}
              />
              <span style={{ opacity: 0.7 }}>원</span>
            </div>
          </div>
        )}

        <div className="row">
          <button type="button" className="btn primary" onClick={handleSubmit}>저장</button>
          <button type="button" className="btn" onClick={handleReset}>초기화</button>
        </div>
      </div>
    </div>
  );
}
