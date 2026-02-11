import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createAgencyRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, formatPhoneInput } from "@kernel/utils";
import {
  createAgencyContact,
  defaultAgencyDraft,
  displayAgencyName,
  type Agency,
  type AgencyContact,
  type AgencyDraft,
  type AgencyScope,
} from "@kernel/schema/agency";

function newId() {
  return createLocalId("A");
}

export function useAgencyRegisterPage() {
  const agencyRepo = useMemo(
    () => createAgencyRepo() as unknown as RepoContract<Agency>,
    []
  );

  const [agencies, setAgencies] = useState<Agency[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<AgencyDraft>({
    key: DRAFT_KEYS.agencyRegister,
    initial: defaultAgencyDraft(),
  });

  useEffect(() => {
    let alive = true;
    agencyRepo.getAll().then((items) => {
      if (alive) setAgencies(items);
    });
    return () => {
      alive = false;
    };
  }, [agencyRepo]);

  const updateDraft = useCallback(
    (patch: Partial<AgencyDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const toggleScope = useCallback(
    (scope: AgencyScope) => {
      const has = draft.scopes.includes(scope);
      const nextScopes = has ? draft.scopes.filter((item) => item !== scope) : [...draft.scopes, scope];
      const nextScopeNotes = { ...draft.scopeNotes };
      if (!has) {
        nextScopeNotes[scope] = nextScopeNotes[scope] || "";
      } else {
        delete nextScopeNotes[scope];
      }
      const next: AgencyDraft = {
        ...draft,
        scopes: nextScopes.length > 0 ? nextScopes : ["관계기관"],
        scopeNotes: nextScopeNotes,
      };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const updateScopeNote = useCallback(
    (scope: AgencyScope, text: string) => {
      updateDraft({ scopeNotes: { ...draft.scopeNotes, [scope]: text } });
    },
    [draft.scopeNotes, updateDraft]
  );

  const addContact = useCallback(() => {
    updateDraft({ contacts: [...draft.contacts, createAgencyContact()] });
  }, [draft.contacts, updateDraft]);

  const removeContact = useCallback(
    (id: string) => {
      const next = draft.contacts.filter((contact) => contact.id !== id);
      updateDraft({ contacts: next.length > 0 ? next : [createAgencyContact()] });
    },
    [draft.contacts, updateDraft]
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<AgencyContact>) => {
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
    const baseName = draft.baseName.trim();
    if (!baseName) {
      alert("기관명을 입력하세요.");
      return;
    }
    if (!draft.region.trim()) {
      alert("지역을 입력하세요.");
      return;
    }
    if (draft.scopes.length === 0) {
      alert("업무범위를 선택하세요.");
      return;
    }
    for (const scope of draft.scopes) {
      if (!(draft.scopeNotes[scope] || "").trim()) {
        alert(`업무범위 "${scope}" 설명을 입력하세요.`);
        return;
      }
    }

    const cleanContacts = draft.contacts
      .map((contact) => ({
        ...contact,
        name: contact.name.trim(),
        role: contact.role.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        note: contact.note.trim(),
      }))
      .filter((contact) => contact.name || contact.phone || contact.email || contact.note);

    if (!cleanContacts.some((contact) => contact.phone || contact.email)) {
      alert("연락처를 입력하세요.");
      return;
    }

    const detailTag = draft.detailTag.trim();
    const exists = agencies.some(
      (agency) =>
        agency.baseName.trim() === baseName && (agency.detailTag || "").trim() === detailTag
    );
    if (exists) {
      alert("동일한 기관명이 이미 존재합니다.");
      return;
    }

    const now = Date.now();
    const nextAgency: Agency = {
      id: newId(),
      baseName,
      detailTag,
      name: displayAgencyName(baseName, detailTag),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      scopeNotes: Object.fromEntries(
        draft.scopes.map((scope) => [scope, (draft.scopeNotes[scope] || "").trim()])
      ),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await agencyRepo.upsert(nextAgency);
    setAgencies(await agencyRepo.getAll());
    discardDraft();
    alert("저장되었습니다.");
  }, [agencies, agencyRepo, discardDraft, draft]);

  const removeAgency = useCallback(
    async (id: string) => {
      await agencyRepo.remove(id);
      setAgencies(await agencyRepo.getAll());
    },
    [agencyRepo]
  );

  return {
    draft,
    agencies,
    updateDraft,
    toggleScope,
    updateScopeNote,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    resetDraft,
    submit,
    removeAgency,
  };
}
