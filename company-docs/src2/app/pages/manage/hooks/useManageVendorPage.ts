import { useEffect, useMemo, useState } from "react";
import { createVendorRepo, type RepoContract } from "@kernel/repo";
import { createVendorContact, parseVendorTags, type Vendor, type VendorDraft, type VendorScope } from "@kernel/schema/vendor";
import { formatPhoneInput } from "@kernel/utils";

function toDraft(vendor: Vendor): VendorDraft {
  return {
    name: vendor.name,
    status: vendor.status,
    region: vendor.region,
    scopes: vendor.scopes,
    otherScopeText: vendor.otherScopeText,
    tagsText: (vendor.tags || []).join(", "),
    notes: vendor.notes,
    contacts: vendor.contacts.length > 0 ? vendor.contacts : [createVendorContact()],
  };
}

export function useManageVendorPage() {
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<Vendor>,
    []
  );
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VendorDraft | null>(null);

  useEffect(() => {
    let alive = true;
    vendorRepo.getAll().then((items) => {
      if (!alive) return;
      setVendors(items.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      alive = false;
    };
  }, [vendorRepo]);

  const editingVendor = useMemo(
    () => vendors.find((vendor) => vendor.id === editingId) ?? null,
    [vendors, editingId]
  );

  async function refresh() {
    const items = await vendorRepo.getAll();
    setVendors(items.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  function startEdit(id: string) {
    const target = vendors.find((vendor) => vendor.id === id);
    if (!target) return;
    setEditingId(id);
    setDraft(toDraft(target));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft(patch: Partial<VendorDraft>) {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
  }

  function toggleScope(scope: VendorScope) {
    if (!draft) return;
    const has = draft.scopes.includes(scope);
    const nextScopes = has ? draft.scopes.filter((item) => item !== scope) : [...draft.scopes, scope];
    const next: VendorDraft = { ...draft, scopes: nextScopes };
    if (!nextScopes.includes("기타")) {
      next.otherScopeText = "";
    }
    setDraft(next);
  }

  function addContact() {
    if (!draft) return;
    setDraft({ ...draft, contacts: [...draft.contacts, createVendorContact()] });
  }

  function removeContact(id: string) {
    if (!draft) return;
    const next = draft.contacts.filter((contact) => contact.id !== id);
    setDraft({ ...draft, contacts: next.length > 0 ? next : [createVendorContact()] });
  }

  function updateContact(id: string, patch: Record<string, unknown>) {
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
    if (!editingVendor || !draft) return;
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
        name: String(contact.name || "").trim(),
        role: String(contact.role || "").trim(),
        phone: String(contact.phone || "").trim(),
        note: String(contact.note || "").trim(),
      }))
      .filter((contact) => contact.name || contact.phone || contact.note);

    if (!cleanContacts.some((contact) => Boolean(contact.phone))) {
      alert("연락처를 입력하세요.");
      return;
    }

    await vendorRepo.upsert({
      ...editingVendor,
      name: draft.name.trim(),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      otherScopeText: draft.otherScopeText.trim(),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      tags: parseVendorTags(draft.tagsText),
      updatedAt: Date.now(),
    });

    await refresh();
    cancelEdit();
  }

  async function removeVendor(id: string) {
    await vendorRepo.remove(id);
    await refresh();
  }

  return {
    vendors,
    editingVendor,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    toggleScope,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    save,
    removeVendor,
  };
}
