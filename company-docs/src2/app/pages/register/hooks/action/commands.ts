import { type IssueDocRecord, type IssueItemRecord, type RepoContract } from "@kernel/repo";
import { formatActionDailyLogisticsTitle } from "@kernel/schema/daily";
import { createLocalId, parseTagsText } from "@kernel/utils";
import { makeActionDocId } from "./constants";
import type {
  ActionDocExt,
  ActionItemExt,
  ActionRegisterDraft,
  ActionSubmitOptions,
  SubmitResult,
} from "./types";

type SubmitActionCommandArgs = {
  actionRepo: RepoContract<ActionDocExt>;
  issueRepo: RepoContract<IssueDocRecord>;
  draft: ActionRegisterDraft;
  refresh: () => Promise<void>;
  discardDraft: () => void;
  options?: ActionSubmitOptions;
};

type RemoveActionItemCommandArgs = {
  actionRepo: RepoContract<ActionDocExt>;
  docId: string;
  itemId: string;
  refresh: () => Promise<void>;
};

async function markIssueDone(issueRepo: RepoContract<IssueDocRecord>, issueId: string) {
  if (!issueId) return;
  const all = await issueRepo.getAll();
  const target = all.find((doc) => (doc.items || []).some((item) => item.id === issueId));
  if (!target) return;

  const now = Date.now();
  const nextItems = (target.items || []).map((item) => {
    if (item.id !== issueId) return item;
    const nextItem: IssueItemRecord = {
      ...item,
      status: "완료",
      updatedAt: now,
    };
    return nextItem;
  });

  await issueRepo.upsert({
    ...target,
    items: nextItems,
    updatedAt: now,
  });
}

function buildItemTitle(
  issueTitle: string,
  writerName: string,
  writerRole: string,
  recordDate: string,
  options?: ActionSubmitOptions
) {
  if (!options?.titleTemplate || options.titleTemplate === "action-daily-logistics") {
    return formatActionDailyLogisticsTitle({
      issueTitle,
      writerName,
      writerRole,
      recordDate,
    });
  }
  return issueTitle;
}

export async function submitActionCommand({
  actionRepo,
  issueRepo,
  draft,
  refresh,
  discardDraft,
  options,
}: SubmitActionCommandArgs): Promise<SubmitResult> {
  const recordDate = options?.enforceRecordDate || draft.recordDate;
  if (!recordDate) {
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
  if (!draft.title.trim()) {
    return { ok: false, message: "제목을 입력해 주세요." };
  }
  if (!draft.details.trim()) {
    return { ok: false, message: "내용을 입력해 주세요." };
  }

  const issueTitleSource = (draft.issueLabel || draft.title).trim();
  if (!issueTitleSource) {
    return { ok: false, message: "이슈 제목 또는 조치 제목을 입력해 주세요." };
  }

  const now = Date.now();
  const writerName = draft.writerName.trim();
  const writerRole = draft.writerRole.trim();
  const docId = makeActionDocId(recordDate, draft.site, writerName);
  const existing = await actionRepo.getById(docId);

  const nextItem: ActionItemExt = {
    id: createLocalId("ACT"),
    title: buildItemTitle(issueTitleSource, writerName, writerRole, recordDate, options),
    details: draft.details.trim(),
    issueId: draft.issueId,
    issueLabel: draft.issueLabel,
    vendorId: draft.vendorId || undefined,
    vendorLabel: draft.vendorLabel,
    vendorCost: draft.vendorId ? Number(draft.vendorCost) || 0 : undefined,
    recordDate,
    writerName,
    writerRole,
    site: draft.site,
    tags: parseTagsText(draft.tagsText),
    updatedAt: now,
  };

  const nextDoc: ActionDocExt = existing
    ? {
        ...existing,
        writerName,
        writerRole,
        site: draft.site,
        items: [nextItem, ...(existing.items || [])],
        updatedAt: now,
      }
    : {
        id: docId,
        recordDate,
        writerName,
        writerRole,
        site: draft.site,
        items: [nextItem],
        createdAt: new Date(now).toISOString(),
        updatedAt: now,
      };

  await actionRepo.upsert(nextDoc);
  await markIssueDone(issueRepo, draft.issueId);
  await refresh();
  discardDraft();

  return { ok: true, message: "조치 기록이 저장되었습니다." };
}

export async function removeActionItemCommand({ actionRepo, docId, itemId, refresh }: RemoveActionItemCommandArgs) {
  const doc = await actionRepo.getById(docId);
  if (!doc) return;

  const nextItems = (doc.items || []).filter((item) => item.id !== itemId);
  if (nextItems.length === 0) {
    await actionRepo.remove(docId);
  } else {
    await actionRepo.upsert({
      ...doc,
      items: nextItems,
      updatedAt: Date.now(),
    });
  }
  await refresh();
}
