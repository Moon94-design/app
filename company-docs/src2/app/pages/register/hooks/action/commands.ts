import { type IssueDocRecord, type IssueItemRecord, type RepoContract } from "@kernel/repo";
import { formatActionDailyLogisticsTitle, formatActionDailyProductionTitle } from "@kernel/schema/daily";
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
  canWrite?: () => boolean;
};

type RemoveActionItemCommandArgs = {
  actionRepo: RepoContract<ActionDocExt>;
  docId: string;
  itemId: string;
  refresh: () => Promise<void>;
  canDelete?: () => boolean;
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
  if (options.titleTemplate === "action-daily-production") {
    return formatActionDailyProductionTitle({
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
  canWrite,
}: SubmitActionCommandArgs): Promise<SubmitResult> {
  if (canWrite && !canWrite()) {
    return { ok: false, message: "저장 권한이 없습니다." };
  }
  const recordDate = options?.enforceRecordDate || draft.recordDate;
  const site = options?.enforceSite || draft.site;
  const writerName = (options?.enforceWriterName || draft.writerName).trim();
  const writerRole = (options?.enforceWriterRole || draft.writerRole).trim();
  if (!recordDate) {
    return { ok: false, message: "기록일을 입력해 주세요." };
  }
  if (!site) {
    return { ok: false, message: "지부를 선택해 주세요." };
  }
  if (!writerName) {
    return { ok: false, message: "작성자를 입력해 주세요." };
  }
  if (!writerRole) {
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
  const docId = makeActionDocId(recordDate, site, writerName);
  const existing = await actionRepo.getById(docId);
  if (existing) {
    const latest = await actionRepo.getById(docId);
    const expectedUpdatedAt = Number(existing.updatedAt || 0);
    const latestUpdatedAt = Number(latest?.updatedAt || 0);
    if (latestUpdatedAt !== expectedUpdatedAt) {
      return { ok: false, message: "다른 사용자가 먼저 수정했습니다. 새로고침 후 다시 시도해 주세요." };
    }
  }

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
    site,
    tags: parseTagsText(draft.tagsText),
    updatedAt: now,
  };

  const nextDoc: ActionDocExt = existing
    ? {
        ...existing,
        writerName,
        writerRole,
        site,
        items: [nextItem, ...(existing.items || [])],
        updatedAt: now,
      }
    : {
        id: docId,
        recordDate,
        writerName,
        writerRole,
        site,
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

export async function removeActionItemCommand({
  actionRepo,
  docId,
  itemId,
  refresh,
  canDelete,
}: RemoveActionItemCommandArgs): Promise<SubmitResult> {
  if (canDelete && !canDelete()) {
    return { ok: false, message: "삭제 권한이 없습니다." };
  }
  const doc = await actionRepo.getById(docId);
  if (!doc) return { ok: false, message: "삭제할 조치 문서를 찾을 수 없습니다." };

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
  return { ok: true, message: "조치 항목을 삭제했습니다." };
}
