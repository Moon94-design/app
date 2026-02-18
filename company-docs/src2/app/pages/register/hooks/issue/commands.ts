import {
  formatIssueDailyLogisticsTitle,
  formatIssueDailyProductionTitle,
  type DailyBranch,
} from "@kernel/schema/daily";
import { type IssueDocRecord, type IssueItemRecord, type RepoContract } from "@kernel/repo";
import { createLocalId } from "@kernel/utils";
import type { IssueRegisterDraft, IssueSubmitOptions, IssueSubmitResult } from "./types";

type SubmitIssueCommandArgs = {
  issueRepo: RepoContract<IssueDocRecord>;
  draft: IssueRegisterDraft;
  refresh: () => Promise<void>;
  discardDraft: () => void;
  options?: IssueSubmitOptions;
  canWrite?: () => boolean;
};

type RemoveIssueDocCommandArgs = {
  issueRepo: RepoContract<IssueDocRecord>;
  id: string;
  refresh: () => Promise<void>;
  canDelete?: () => boolean;
};

function makeIssueDocId(recordDate: string, site: DailyBranch, writerName: string): string {
  return `ISSUE_${recordDate}_${site}_${writerName.trim()}`;
}

function buildIssueTitle(
  draft: IssueRegisterDraft,
  writerName: string,
  writerRole: string,
  recordDate: string,
  options?: IssueSubmitOptions
): string {
  const baseTitle = draft.title.trim();
  if (options?.titleTemplate === "issue-daily-logistics") {
    return formatIssueDailyLogisticsTitle({
      title: baseTitle,
      writerName,
      writerRole,
      recordDate,
    });
  }
  if (options?.titleTemplate === "issue-daily-production") {
    return formatIssueDailyProductionTitle({
      title: baseTitle,
      writerName,
      writerRole,
      recordDate,
    });
  }
  if (options?.formatTitleWithWriter) {
    return `${options?.contextLabel ? `[${options.contextLabel}] ` : ""}${baseTitle} ${writerName} ${writerRole} 이슈 기록`;
  }
  return `${options?.contextLabel ? `[${options.contextLabel}] ` : ""}${baseTitle}`;
}

export async function submitIssueCommand({
  issueRepo,
  draft,
  refresh,
  discardDraft,
  options,
  canWrite,
}: SubmitIssueCommandArgs): Promise<IssueSubmitResult> {
  if (canWrite && !canWrite()) {
    return { ok: false, message: "저장 권한이 없습니다." };
  }

  const recordDate = options?.enforceRecordDate || draft.recordDate;
  const site = options?.enforceSite || draft.site;
  const writerName = (options?.enforceWriterName || draft.writerName).trim();
  const writerRole = (options?.enforceWriterRole || draft.writerRole).trim();

  if (!writerName) {
    return { ok: false, message: "작성자를 입력해 주세요." };
  }
  if (!writerRole) {
    return { ok: false, message: "직책을 입력해 주세요." };
  }
  if (!site) {
    return { ok: false, message: "지부를 선택해 주세요." };
  }
  if (!draft.title.trim()) {
    return { ok: false, message: "이슈 제목을 입력해 주세요." };
  }

  const now = Date.now();
  const item: IssueItemRecord = {
    id: createLocalId("ISSUE_ITEM"),
    title: buildIssueTitle(draft, writerName, writerRole, recordDate, options),
    details: draft.details.trim(),
    linkedReferences: (draft.linkedReferences || []).map((item) => ({ ...item })),
    status: draft.status,
    category: draft.category,
    recordDate,
    writerName,
    writerRole,
    site,
    updatedAt: now,
  };

  const docId = makeIssueDocId(recordDate, site, writerName);
  const existing = await issueRepo.getById(docId);
  if (existing) {
    const latest = await issueRepo.getById(docId);
    const expectedUpdatedAt = Number(existing.updatedAt || 0);
    const latestUpdatedAt = Number(latest?.updatedAt || 0);
    if (latestUpdatedAt !== expectedUpdatedAt) {
      return { ok: false, message: "다른 사용자가 먼저 수정했습니다. 새로고침 후 다시 시도해 주세요." };
    }
  }

  const nextDoc: IssueDocRecord = existing
    ? {
        ...existing,
        writerRole,
        site,
        items: [item, ...(existing.items || [])],
        updatedAt: now,
      }
    : {
        id: docId,
        recordDate,
        writerName,
        writerRole,
        site,
        items: [item],
        createdAt: new Date(now).toISOString(),
        updatedAt: now,
      };

  await issueRepo.upsert(nextDoc);
  await refresh();
  discardDraft();

  return {
    ok: true,
    message: "이슈가 저장되었습니다.",
    itemId: item.id,
    itemTitle: item.title,
    status: draft.status,
  };
}

export async function removeIssueDocCommand({
  issueRepo,
  id,
  refresh,
  canDelete,
}: RemoveIssueDocCommandArgs): Promise<IssueSubmitResult> {
  if (canDelete && !canDelete()) {
    return { ok: false, message: "삭제 권한이 없습니다." };
  }
  await issueRepo.remove(id);
  await refresh();
  return { ok: true, message: "이슈 문서를 삭제했습니다." };
}
