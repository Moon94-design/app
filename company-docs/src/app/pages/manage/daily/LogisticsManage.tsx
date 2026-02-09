/**
 * LogisticsManage.tsx
 * 유통기록 관리 (계량현황에서 자동 생성)
 */

import { useState, useEffect } from "react";
import { repo } from "../../../../data/repo";
import type { WeighingTransaction } from "../../home/excel/weighing/weighingTypes";
import type { LogisticsRecord, LogisticsLine, Direction, Kind, Item } from "../../../../domain/schema/daily/logistics";
import { convertAllWeighingToLogistics } from "./weighingToLogistics";
import TagInputText from "../../../../base/components/TagInputText";
import { parseTags } from "../../../../domain/schema/daily/_common";
import { buildTagsText } from "../../../../base/utils/tagIndex";

export default function LogisticsManage() {
  const [records, setRecords] = useState<LogisticsRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  // 초기 로드: 계량현황 → 유통기록 변환
  useEffect(() => {
    const weighing = repo.weighingTransactions<WeighingTransaction>().getAll();
    const converted = convertAllWeighingToLogistics(weighing);
    setRecords(converted.reverse()); // 최신순
  }, []);

  // 펼치기/접기
  function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  }

  // 수정 모드 진입
  function startEdit(id: string) {
    setEditingId(id);
  }

  // 수정 취소
  function cancelEdit() {
    setEditingId(null);
  }

  // 저장 (레코드 전체 업데이트)
  function saveRecord(updated: LogisticsRecord) {
    setRecords(records.map((r) => (r.id === updated.id ? updated : r)));
    setEditingId(null);
  }

  // 수정 중인 레코드
  if (editingId) {
    const record = records.find((r) => r.id === editingId);
    if (!record) {
      setEditingId(null);
      return null;
    }
    return (
      <div className="card">
        <h1 className="h1">유통기록 수정</h1>
        <LogisticsEditForm
          record={record}
          onSave={saveRecord}
          onCancel={cancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="h1">유통기록 관리</h1>

      {/* 안내 */}
      <div style={{
        padding: 16,
        background: "rgba(25, 118, 210, 0.08)",
        borderRadius: 4,
        marginBottom: 20,
        border: "1px solid rgba(25, 118, 210, 0.3)",
      }}>
        <p className="p" style={{ margin: 0, marginBottom: 4, fontSize: 14 }}>
          💡 계량현황 엑셀 데이터를 일자별로 자동 변환한 리스트입니다.
        </p>
        <p className="p" style={{ margin: 0, fontSize: 14 }}>
          💡 품목 분류(압축품/분쇄품)는 추정값입니다. 필요 시 [수정]하여 정확한 정보를 입력하세요.
        </p>
      </div>

      <div className="divider" />

      {/* 리스트 */}
      {records.length === 0 ? (
        <p className="p">계량현황 데이터가 없습니다.</p>
      ) : (
        records.map((record) => {
          const expanded = expandedIds.has(record.id);
          const totalKg = record.lines.reduce((sum, line) => sum + line.kg, 0);
          const totalAmount = record.lines.reduce((sum, line) => sum + (line.kg * line.unitPricePerKg), 0);

          return (
            <div
              key={record.id}
              className="card"
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {/* 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>
                    {record.recordDate} ({record.lines.length}건)
                  </div>
                  <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                    총 중량: {totalKg.toLocaleString()}kg | 총 금액: {totalAmount.toLocaleString()}원
                  </div>
                  {/* 태그 */}
                  {record.tags && record.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {record.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(70,130,255,0.2)",
                            border: "1px solid rgba(70,130,255,0.4)",
                            color: "rgba(70,130,255,1)",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn"
                    onClick={() => toggleExpand(record.id)}
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    {expanded ? "접기" : "펼치기"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => startEdit(record.id)}
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    수정
                  </button>
                </div>
              </div>

              {/* 상세 (펼침) */}
              {expanded && (
                <div style={{ marginTop: 16, overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: "8px 4px", textAlign: "left" }}>방향</th>
                        <th style={{ padding: "8px 4px", textAlign: "left" }}>분류</th>
                        <th style={{ padding: "8px 4px", textAlign: "left" }}>품목</th>
                        <th style={{ padding: "8px 4px", textAlign: "left" }}>거래처</th>
                        <th style={{ padding: "8px 4px", textAlign: "left" }}>차량</th>
                        <th style={{ padding: "8px 4px", textAlign: "right" }}>중량(kg)</th>
                        <th style={{ padding: "8px 4px", textAlign: "right" }}>단가</th>
                        <th style={{ padding: "8px 4px", textAlign: "right" }}>금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.lines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px 4px" }}>{line.direction}</td>
                          <td style={{ padding: "8px 4px" }}>{line.kind || "-"}</td>
                          <td style={{ padding: "8px 4px" }}>{line.item || "-"}</td>
                          <td style={{ padding: "8px 4px" }}>{line.partner.label}</td>
                          <td style={{ padding: "8px 4px" }}>{line.vehicle?.label || "-"}</td>
                          <td style={{ padding: "8px 4px", textAlign: "right" }}>{line.kg.toLocaleString()}</td>
                          <td style={{ padding: "8px 4px", textAlign: "right" }}>{line.unitPricePerKg.toLocaleString()}</td>
                          <td style={{ padding: "8px 4px", textAlign: "right" }}>
                            {(line.kg * line.unitPricePerKg).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ---------- 수정 폼 ----------
interface LogisticsEditFormProps {
  record: LogisticsRecord;
  onSave: (updated: LogisticsRecord) => void;
  onCancel: () => void;
}

function LogisticsEditForm({ record, onSave, onCancel }: LogisticsEditFormProps) {
  const [form, setForm] = useState<LogisticsRecord>({ ...record, lines: [...record.lines] });
  const [tagsText, setTagsText] = useState<string>(buildTagsText(record.tags || []));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      tags: parseTags(tagsText),
      updatedAt: new Date().toISOString(),
    });
  }

  function updateLine(index: number, field: keyof LogisticsLine, value: any) {
    const next = [...form.lines];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, lines: next });
  }

  function removeLine(index: number) {
    if (!confirm("이 라인을 삭제하시겠습니까?")) return;
    const next = form.lines.filter((_, i) => i !== index);
    setForm({ ...form, lines: next });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 기본 정보 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">날짜</label>
        <input
          type="date"
          className="input"
          value={form.recordDate}
          onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
          required
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label">제목</label>
        <input
          type="text"
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="label">상세 내용</label>
        <textarea
          className="input"
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          rows={3}
        />
      </div>

      {/* 태그 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">태그</label>
        <TagInputText
          value={tagsText}
          onChange={setTagsText}
          scope="logistics"
          placeholder="태그 입력 (쉼표 또는 Enter로 구분)"
        />
      </div>

      <div className="divider" />

      {/* 라인 편집 */}
      <h3 style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>거래 내역</h3>
      {form.lines.length === 0 ? (
        <p className="p">내역이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {form.lines.map((line, idx) => (
            <div
              key={idx}
              className="card"
              style={{ background: "rgba(255,255,255,0.02)", padding: 12 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {/* 방향 */}
                <div>
                  <label className="label" style={{ fontSize: 12 }}>방향</label>
                  <select
                    className="input"
                    value={line.direction}
                    onChange={(e) => updateLine(idx, "direction", e.target.value as Direction)}
                    style={{ fontSize: 13, padding: "6px 8px" }}
                  >
                    <option value="매입">매입</option>
                    <option value="출고">출고</option>
                  </select>
                </div>

                {/* 분류 */}
                <div>
                  <label className="label" style={{ fontSize: 12 }}>분류</label>
                  <select
                    className="input"
                    value={line.kind}
                    onChange={(e) => updateLine(idx, "kind", e.target.value as Kind)}
                    style={{ fontSize: 13, padding: "6px 8px" }}
                  >
                    <option value="압축품">압축품</option>
                    <option value="분쇄품">분쇄품</option>
                    <option value="펠렛">펠렛</option>
                  </select>
                </div>

                {/* 품목 */}
                <div>
                  <label className="label" style={{ fontSize: 12 }}>품목</label>
                  <select
                    className="input"
                    value={line.item}
                    onChange={(e) => updateLine(idx, "item", e.target.value as Item)}
                    style={{ fontSize: 13, padding: "6px 8px" }}
                  >
                    <option value="PP">PP</option>
                    <option value="PE">PE</option>
                  </select>
                </div>

                {/* 중량 */}
                <div>
                  <label className="label" style={{ fontSize: 12 }}>중량(kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={line.kg}
                    onChange={(e) => updateLine(idx, "kg", Number(e.target.value))}
                    style={{ fontSize: 13, padding: "6px 8px" }}
                    required
                  />
                </div>

                {/* 단가 */}
                <div>
                  <label className="label" style={{ fontSize: 12 }}>단가</label>
                  <input
                    type="number"
                    className="input"
                    value={line.unitPricePerKg}
                    onChange={(e) => updateLine(idx, "unitPricePerKg", Number(e.target.value))}
                    style={{ fontSize: 13, padding: "6px 8px" }}
                    required
                  />
                </div>
              </div>

              {/* 거래처/차량 (읽기 전용) */}
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                거래처: {line.partner.label} | 차량: {line.vehicle?.label || "-"}
              </div>

              {/* 삭제 버튼 */}
              <button
                type="button"
                className="btn"
                onClick={() => removeLine(idx)}
                style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  marginTop: 8,
                  background: "rgba(255,100,100,0.2)",
                }}
              >
                이 라인 삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn primary">저장</button>
        <button type="button" className="btn" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}
