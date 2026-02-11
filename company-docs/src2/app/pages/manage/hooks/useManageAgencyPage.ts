import { useEffect, useMemo, useState } from "react";
import { createAgencyRepo, type RepoContract } from "@kernel/repo";
import {
  createAgencyContact,
  displayAgencyName,
  type Agency,
  type AgencyContact,
  type AgencyDraft,
  type AgencyScope,
} from "@kernel/schema/agency";
import { formatPhoneInput } from "@kernel/utils";

function toDraft(agency: Agency): AgencyDraft {
  return {
    baseName: agency.baseName,
    detailTag: agency.detailTag,
    status: agency.status,
    region: agency.region,
    scopes: agency.scopes,
    scopeNotes: agency.scopeNotes || {},
    contacts: agency.contacts.length > 0 ? agency.contacts : [createAgencyContact()],
    notes: agency.notes,
  };
}

export function useManageAgencyPage() {
  const agencyRepo = useMemo(
    () => createAgencyRepo() as unknown as RepoContract<Agency>,
    []
  );
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AgencyDraft | null>(null);

  useEffect(() => {
    let alive = true;
    agencyRepo.getAll().then((items) => {
      if (!alive) return;
      setAgencies(items.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      alive = false;
    };
  }, [agencyRepo]);

  const editingAgency = useMemo(
    () => agencies.find((agency) => agency.id === editingId) ?? null,
    [agencies, editingId]
  );

  async function refresh() {
    const items = await agencyRepo.getAll();
    setAgencies(items.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  function startEdit(id: string) {
    const target = agencies.find((agency) => agency.id === id);
    if (!target) return;
    setEditingId(id);
    setDraft(toDraft(target));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft(patch: Partial<AgencyDraft>) {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
  }

  function toggleScope(scope: AgencyScope) {
    if (!draft) return;
    const has = draft.scopes.includes(scope);
    const nextScopes = has ? draft.scopes.filter((item) => item !== scope) : [...draft.scopes, scope];
    const nextScopeNotes = { ...draft.scopeNotes };
    if (!has) {
      nextScopeNotes[scope] = nextScopeNotes[scope] || "";
    } else {
      delete nextScopeNotes[scope];
    }
    setDraft({
      ...draft,
      scopes: nextScopes.length > 0 ? nextScopes : ["관계기관"],
      scopeNotes: nextScopeNotes,
    });
  }

  function updateScopeNote(scope: AgencyScope, text: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      scopeNotes: { ...draft.scopeNotes, [scope]: text },
    });
  }

  function addContact() {
    if (!draft) return;
    setDraft({ ...draft, contacts: [...draft.contacts, createAgencyContact()] });
  }

  function removeContact(id: string) {
    if (!draft) return;
    const next = draft.contacts.filter((contact) => contact.id !== id);
    setDraft({ ...draft, contacts: next.length > 0 ? next : [createAgencyContact()] });
  }

  function updateContact(id: string, patch: Partial<AgencyContact>) {
    if (!draft) return;
    setDraft({
      ...draft,
      contacts: draft.contacts.map((contact) => (contact.id === id ? { ...contact, ...patch } : contact)),
    });
  }

  function updateContactPhone(id: string, raw: string) {
    updateContact(id, { phone: formatPhoneInput(raw) });
  }

  async function save() {
    if (!editingAgency || !draft) return;
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
    const duplicate = agencies.some(
      (agency) =>
        agency.id !== editingAgency.id &&
        agency.baseName.trim() === baseName &&
        (agency.detailTag || "").trim() === detailTag
    );
    if (duplicate) {
      alert("동일한 기관명이 이미 존재합니다.");
      return;
    }

    await agencyRepo.upsert({
      ...editingAgency,
      baseName,
      detailTag,
      name: displayAgencyName(baseName, detailTag),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      scopeNotes: Object.fromEntries(draft.scopes.map((scope) => [scope, (draft.scopeNotes[scope] || "").trim()])),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      updatedAt: Date.now(),
    });

    await refresh();
    cancelEdit();
  }

  async function removeAgency(id: string) {
    await agencyRepo.remove(id);
    await refresh();
  }

  return {
    agencies,
    editingAgency,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    toggleScope,
    updateScopeNote,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    save,
    removeAgency,
  };
}
