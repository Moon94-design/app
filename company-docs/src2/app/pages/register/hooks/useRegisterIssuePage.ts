import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { DAILY_BRANCH_OPTIONS, formatIssueDailyLogisticsTitle, type DailyBranch } from "@kernel/schema/daily";
import { createIssueRepo, type IssueDocRecord, type IssueItemRecord, type RepoContract } from "@kernel/repo";
import { createLocalId, sortByRecordDateUpdated, todayYmd } from "@kernel/utils";

export type IssueCategory = "현장" | "설비" | "안전";
export type IssueStatus = "진행중" | "완료";

export type IssueRegisterDraft = {
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  category: IssueCategory;
  title: string;
  details: string;
  status: IssueStatus;
};

type IssueSubmitOptions = {
  contextLabel?: string;
  enforceRecordDate?: string;
  formatTitleWithWriter?: boolean;
  titleTemplate?: "issue-daily-logistics";
};

function defaultIssueDraft(): IssueRegisterDraft {
  return {
    recordDate: todayYmd(),
    site: DAILY_BRANCH_OPTIONS[0],
    writerName: "",
    writerRole: "",
    category: "현장",
    title: "",
    details: "",
    status: "진행중",
  };
}

function makeIssueDocId(recordDate: string, site: DailyBranch, writerName: string): string {
  return `ISSUE_${recordDate}_${site}_${writerName.trim()}`;
}

export function useRegisterIssuePage() {
  const issueRepo = useMemo(() => createIssueRepo() as unknown as RepoContract<IssueDocRecord>, []);
  const [docs, setDocs] = useState<IssueDocRecord[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<IssueRegisterDraft>({
    key: DRAFT_KEYS.issueRegister,
    initial: defaultIssueDraft(),
  });

  const refresh = useCallback(async () => {
    const all = await issueRepo.getAll();
    setDocs(sortByRecordDateUpdated(all));
  }, [issueRepo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const updateDraft = useCallback(
    (patch: Partial<IssueRegisterDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const applyPreset = useCallback(
    (patch: Partial<IssueRegisterDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next, { dirty: true });
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(
    async (options?: IssueSubmitOptions) => {
      if (!draft.writerName.trim()) {
        return { ok: false, message: "작성자를 입력해 주세요." };
      }
      if (!draft.writerRole.trim()) {
        return { ok: false, message: "직책을 입력해 주세요." };
      }
      if (!draft.site) {
        return { ok: false, message: "지부를 선택해 주세요." };
      }
      if (!draft.title.trim()) {
        return { ok: false, message: "이슈 제목을 입력해 주세요." };
      }

      const recordDate = options?.enforceRecordDate || draft.recordDate;
      const baseTitle = draft.title.trim();
      const formattedTitle =
        options?.titleTemplate === "issue-daily-logistics"
          ? formatIssueDailyLogisticsTitle({
              title: baseTitle,
              writerName: draft.writerName.trim(),
              writerRole: draft.writerRole.trim(),
              recordDate,
            })
          : options?.formatTitleWithWriter
            ? `${options?.contextLabel ? `[${options.contextLabel}] ` : ""}${baseTitle} ${draft.writerName.trim()}(이름) ${draft.writerRole.trim()}(직책) 이슈 기록`
            : `${options?.contextLabel ? `[${options.contextLabel}] ` : ""}${baseTitle}`;

      const now = Date.now();
      const item: IssueItemRecord = {
        id: createLocalId("ISSUE_ITEM"),
        title: formattedTitle,
        details: draft.details.trim(),
        status: draft.status,
        category: draft.category,
        recordDate,
        writerName: draft.writerName.trim(),
        writerRole: draft.writerRole.trim(),
        site: draft.site,
        updatedAt: now,
      };

      const docId = makeIssueDocId(recordDate, draft.site, draft.writerName);
      const existing = await issueRepo.getById(docId);

      const nextDoc: IssueDocRecord = existing
        ? {
            ...existing,
            writerRole: draft.writerRole.trim(),
            site: draft.site,
            items: [item, ...(existing.items || [])],
            updatedAt: now,
          }
        : {
            id: docId,
            recordDate,
            writerName: draft.writerName.trim(),
            writerRole: draft.writerRole.trim(),
            site: draft.site,
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
        status: item.status,
      };
    },
    [discardDraft, draft, issueRepo, refresh]
  );

  const removeDoc = useCallback(
    async (id: string) => {
      await issueRepo.remove(id);
      await refresh();
    },
    [issueRepo, refresh]
  );

  return {
    draft,
    docs,
    siteOptions: DAILY_BRANCH_OPTIONS,
    updateDraft,
    applyPreset,
    resetDraft,
    submit,
    removeDoc,
  };
}
