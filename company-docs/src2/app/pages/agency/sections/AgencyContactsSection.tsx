import type { AgencyContact } from "@kernel/schema/agency";

type Props = {
  contacts: AgencyContact[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<AgencyContact>) => void;
  onUpdatePhone: (id: string, raw: string) => void;
};

export default function AgencyContactsSection({
  contacts,
  onAdd,
  onRemove,
  onUpdate,
  onUpdatePhone,
}: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        연락처
      </div>

      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="card"
          style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              value={contact.name}
              onChange={(e) => onUpdate(contact.id, { name: e.target.value })}
              placeholder="담당자명"
            />
            <input
              className="input"
              value={contact.role}
              onChange={(e) => onUpdate(contact.id, { role: e.target.value })}
              placeholder="역할"
            />
            <input
              className="input"
              inputMode="numeric"
              value={contact.phone}
              onChange={(e) => onUpdatePhone(contact.id, e.target.value)}
              placeholder="전화(숫자만)"
            />
            <input
              className="input"
              value={contact.email}
              onChange={(e) => onUpdate(contact.id, { email: e.target.value })}
              placeholder="이메일(선택)"
            />
            <input
              className="input"
              value={contact.note}
              onChange={(e) => onUpdate(contact.id, { note: e.target.value })}
              placeholder="참고사항"
            />
          </div>

          <div className="row">
            <button
              type="button"
              className="btn danger"
              onClick={() => onRemove(contact.id)}
              disabled={contacts.length <= 1}
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <div className="row">
        <button type="button" className="btn" onClick={onAdd}>
          연락처 추가
        </button>
      </div>
    </div>
  );
}
