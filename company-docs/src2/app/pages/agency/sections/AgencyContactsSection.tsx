import { ContactsEditor } from "@kernel/components/contacts";
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
    <ContactsEditor
      contacts={contacts}
      onAdd={onAdd}
      onRemove={onRemove}
      onUpdate={onUpdate}
      onUpdatePhone={onUpdatePhone}
      namePlaceholder="담당자명"
      rolePlaceholder="역할"
      phonePlaceholder="전화(숫자만)"
      notePlaceholder="참고사항"
      showEmail
      emailPlaceholder="이메일(선택)"
      addLabel="연락처 추가"
    />
  );
}
