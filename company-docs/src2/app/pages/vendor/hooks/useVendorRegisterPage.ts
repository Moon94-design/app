import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createVendorRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, formatPhoneInput } from "@kernel/utils";
import {
  createVendorContact,
  defaultVendorDraft,
  parseVendorTags,
  type Vendor,
  type VendorContact,
  type VendorDraft,
  type VendorScope,
} from "@kernel/schema/vendor";

function newId() {
  return createLocalId("V");
}

export function useVendorRegisterPage() {
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<Vendor>,
    []
  );

  const [vendors, setVendors] = useState<Vendor[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<VendorDraft>({
    key: DRAFT_KEYS.vendorRegister,
    initial: defaultVendorDraft(),
  });

  useEffect(() => {
    let alive = true;
    vendorRepo.getAll().then((items) => {
      if (alive) setVendors(items);
    });
    return () => {
      alive = false;
    };
  }, [vendorRepo]);

  const updateDraft = useCallback(
    (patch: Partial<VendorDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const toggleScope = useCallback(
    (scope: VendorScope) => {
      const has = draft.scopes.includes(scope);
      const nextScopes = has ? draft.scopes.filter((item) => item !== scope) : [...draft.scopes, scope];
      const next: VendorDraft = { ...draft, scopes: nextScopes };
      if (!nextScopes.includes("기타")) {
        next.otherScopeText = "";
      }
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const addContact = useCallback(() => {
    updateDraft({ contacts: [...draft.contacts, createVendorContact()] });
  }, [draft.contacts, updateDraft]);

  const removeContact = useCallback(
    (id: string) => {
      const next = draft.contacts.filter((contact) => contact.id !== id);
      updateDraft({ contacts: next.length > 0 ? next : [createVendorContact()] });
    },
    [draft.contacts, updateDraft]
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<VendorContact>) => {
      updateDraft({
        contacts: draft.contacts.map((contact) => (contact.id === id ? { ...contact, ...patch } : contact)),
      });
    },
    [draft.contacts, updateDraft]
  );

  const updateContactPhone = useCallback(
    (id: string, raw: string) => {
      updateContact(id, { phone: formatPhoneInput(raw) });
    },
    [updateContact]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(async () => {
    if (!draft.name.trim()) {
      alert("업체명을 입력하세요.");
      return;
    }
    if (!draft.region.trim()) {
      alert("지역을 입력하세요.");
      return;
    }
    if (draft.scopes.length === 0) {
      alert("서비스 범위를 최소 1개 선택하세요.");
      return;
    }
    if (draft.scopes.includes("기타") && !draft.otherScopeText.trim()) {
      alert("기타 내용을 입력하세요.");
      return;
    }

    const cleanContacts = draft.contacts
      .map((contact) => ({
        ...contact,
        name: contact.name.trim(),
        role: contact.role.trim(),
        phone: contact.phone.trim(),
        note: contact.note.trim(),
      }))
      .filter((contact) => contact.name || contact.phone || contact.note);

    if (!cleanContacts.some((contact) => Boolean(contact.phone))) {
      alert("연락처를 입력하세요.");
      return;
    }

    const now = Date.now();
    const nextVendor: Vendor = {
      id: newId(),
      name: draft.name.trim(),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      otherScopeText: draft.otherScopeText.trim(),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      tags: parseVendorTags(draft.tagsText),
      createdAt: now,
      updatedAt: now,
    };

    await vendorRepo.upsert(nextVendor);
    setVendors(await vendorRepo.getAll());
    discardDraft();
    alert("저장되었습니다.(로컬)");
  }, [discardDraft, draft, vendorRepo]);

  const removeVendor = useCallback(
    async (id: string) => {
      await vendorRepo.remove(id);
      setVendors(await vendorRepo.getAll());
    },
    [vendorRepo]
  );

  return {
    draft,
    vendors,
    updateDraft,
    toggleScope,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    resetDraft,
    submit,
    removeVendor,
  };
}
