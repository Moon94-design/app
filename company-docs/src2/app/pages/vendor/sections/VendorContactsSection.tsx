import { ContactsEditor } from "@kernel/components/contacts";
import type { VendorContact } from "@kernel/schema/vendor";

type Props = {
  contacts: VendorContact[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<VendorContact>) => void;
  onUpdatePhone: (id: string, raw: string) => void;
};

export default function VendorContactsSection({
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
      namePlaceholder="이름"
      rolePlaceholder="역할"
      phonePlaceholder="숫자만 입력 가능"
      notePlaceholder="참고사항"
      addLabel="연락처 추가"
    />
  );
}
