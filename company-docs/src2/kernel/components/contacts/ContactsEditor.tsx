import type { CSSProperties } from "react";

type ContactLike = {
  id: string;
  name: string;
  role: string;
  phone: string;
  note: string;
  email?: string;
};

type ContactsEditorProps<T extends ContactLike> = {
  title?: string;
  contacts: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<T>) => void;
  onUpdatePhone: (id: string, raw: string) => void;
  namePlaceholder?: string;
  rolePlaceholder?: string;
  phonePlaceholder?: string;
  notePlaceholder?: string;
  showEmail?: boolean;
  emailPlaceholder?: string;
  addLabel?: string;
  cardStyle?: CSSProperties;
};

export default function ContactsEditor<T extends ContactLike>({
  title = "연락처",
  contacts,
  onAdd,
  onRemove,
  onUpdate,
  onUpdatePhone,
  namePlaceholder = "이름",
  rolePlaceholder = "역할",
  phonePlaceholder = "숫자만 입력 가능",
  notePlaceholder = "참고사항",
  showEmail = false,
  emailPlaceholder = "이메일(선택)",
  addLabel = "연락처 추가",
  cardStyle,
}: ContactsEditorProps<T>) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)", ...cardStyle }}>
      <div className="h1" style={{ fontSize: 15 }}>
        {title}
      </div>

      {contacts.map((contact) => (
        <div key={contact.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              value={contact.name}
              onChange={(e) => onUpdate(contact.id, { name: e.target.value } as Partial<T>)}
              placeholder={namePlaceholder}
            />
            <input
              className="input"
              value={contact.role}
              onChange={(e) => onUpdate(contact.id, { role: e.target.value } as Partial<T>)}
              placeholder={rolePlaceholder}
            />
            <input
              className="input"
              inputMode="numeric"
              value={contact.phone}
              onChange={(e) => onUpdatePhone(contact.id, e.target.value)}
              placeholder={phonePlaceholder}
            />
            {showEmail ? (
              <input
                className="input"
                value={contact.email || ""}
                onChange={(e) => onUpdate(contact.id, { email: e.target.value } as Partial<T>)}
                placeholder={emailPlaceholder}
              />
            ) : null}
            <input
              className="input"
              value={contact.note}
              onChange={(e) => onUpdate(contact.id, { note: e.target.value } as Partial<T>)}
              placeholder={notePlaceholder}
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
          {addLabel}
        </button>
      </div>
    </div>
  );
}
