import { formatDailyOfficeTitle } from "@kernel/schema/daily";
import type { RepoContract } from "@kernel/repo";
import { createLocalId } from "@kernel/utils";
import { createOfficeLineId } from "./constants";
import type {
  DailyRepoRecord,
  OfficeDraft,
  OfficeLinkedReference,
  OfficeLine,
  OfficeRecord,
  SubmitResult,
} from "./types";

type SubmitOfficeCommandArgs = {
  dailyRepo: RepoContract<DailyRepoRecord>;
  draft: OfficeDraft;
  refreshRecords: () => Promise<void>;
  resetDraft: () => void;
  canWrite?: () => boolean;
  editingRecordId?: string | null;
  editingCreatedAt?: string | null;
};

export function normalizeOfficeDocIdToken(value: string, fallback: string): string {
  const token = value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9가-힣_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return token || fallback;
}

export function makeOfficeJournalId(recordDate: string, site: string, writerName: string): string {
  const siteToken = normalizeOfficeDocIdToken(site, "site");
  const writerToken = normalizeOfficeDocIdToken(writerName, "writer");
  return `OFFICE_DOC_${recordDate}_${siteToken}_${writerToken}`;
}

export function addOfficeLineCommand(
  draft: OfficeDraft
): { ok: true; nextDraft: OfficeDraft } | { ok: false; message: string } {
  const lineDraft = draft.lineDraft;
  if (!lineDraft.subtitle.trim()) {
    return { ok: false, message: "세부 제목을 입력해 주세요." };
  }
  if (!lineDraft.details.trim()) {
    return { ok: false, message: "내용을 입력해 주세요." };
  }
  const nextLine: OfficeLine = {
    id: createOfficeLineId(),
    subtitle: lineDraft.subtitle.trim(),
    details: lineDraft.details.trim(),
    linkedReferences: (lineDraft.linkedReferences || []).map((item) => ({ ...item })),
  };

  return {
    ok: true,
    nextDraft: {
      ...draft,
      lineDraft: {
        ...draft.lineDraft,
        subtitle: "",
        details: "",
        linkId: "",
        linkedReferences: [],
      },
      lines: [nextLine, ...(draft.lines || [])],
    },
  };
}

export function addLineDraftLinkedReferenceCommand(
  draft: OfficeDraft,
  reference: OfficeLinkedReference
): OfficeDraft {
  const alreadyExists = (draft.lineDraft.linkedReferences || []).some(
    (item) => item.type === reference.type && item.id === reference.id
  );
  if (alreadyExists) return draft;

  return {
    ...draft,
    lineDraft: {
      ...draft.lineDraft,
      linkId: "",
      linkedReferences: [...(draft.lineDraft.linkedReferences || []), reference],
    },
  };
}

export function removeLineDraftLinkedReferenceCommand(
  draft: OfficeDraft,
  reference: OfficeLinkedReference
): OfficeDraft {
  return {
    ...draft,
    lineDraft: {
      ...draft.lineDraft,
      linkedReferences: (draft.lineDraft.linkedReferences || []).filter(
        (item) => !(item.type === reference.type && item.id === reference.id)
      ),
    },
  };
}

export function removeOfficeLineCommand(draft: OfficeDraft, id: string): OfficeDraft {
  return {
    ...draft,
    lines: (draft.lines || []).filter((line) => line.id !== id),
  };
}

export async function submitOfficeCommand({
  dailyRepo,
  draft,
  refreshRecords,
  resetDraft,
  canWrite,
  editingRecordId,
  editingCreatedAt,
}: SubmitOfficeCommandArgs): Promise<SubmitResult> {
  if (canWrite && !canWrite()) {
    return { ok: false, message: "저장 권한이 없습니다." };
  }
  if (!draft.recordDate) {
    return { ok: false, message: "기록일을 입력해 주세요." };
  }
  if (!draft.site) {
    return { ok: false, message: "지부를 선택해 주세요." };
  }
  if (!draft.writerName.trim()) {
    return { ok: false, message: "작성자를 입력해 주세요." };
  }
  if (!draft.writerRole.trim()) {
    return { ok: false, message: "직책을 입력해 주세요." };
  }
  if (!(draft.lines || []).length) {
    return { ok: false, message: "사무 항목을 1개 이상 추가해 주세요." };
  }

  const nowMs = Date.now();
  const isEditing = Boolean(editingRecordId);
  const record: OfficeRecord = {
    id: editingRecordId || createLocalId("OFFICE"),
    kind: "office",
    recordDate: draft.recordDate,
    site: draft.site,
    writerName: draft.writerName.trim(),
    writerRole: draft.writerRole.trim(),
    title: formatDailyOfficeTitle({
      writerName: draft.writerName,
      writerRole: draft.writerRole,
      recordDate: draft.recordDate,
    }),
    details: "",
    tags: [],
    lines: (draft.lines || []).map((line) => ({
      ...line,
      subtitle: line.subtitle.trim(),
      details: line.details.trim(),
      linkedReferences: (line.linkedReferences || []).map((item) => ({ ...item })),
    })),
    createdAt: editingCreatedAt || new Date(nowMs).toISOString(),
    updatedAt: nowMs,
  };

  await dailyRepo.upsert(record as DailyRepoRecord);
  await refreshRecords();
  resetDraft();

  return { ok: true, message: isEditing ? "사무 기록을 수정 저장했습니다." : "사무 기록을 저장했습니다." };
}

