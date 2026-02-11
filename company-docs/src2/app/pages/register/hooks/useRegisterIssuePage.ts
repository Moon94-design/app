import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createIssueRepo, type IssueDocRecord, type IssueItemRecord, type RepoContract } from "@kernel/repo";
import { createLocalId } from "@kernel/utils";

type IssueCategory = "품질" | "설비" | "안전";
type IssueStatus = "진행중" | "완료";

export type IssueRegisterDraft = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  category: IssueCategory;
  title: string;
  details: string;
  status: IssueStatus;
};

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function defaultIssueDraft(): IssueRegisterDraft {
  return {
    recordDate: todayYmd(),
    writerName: "",
    writerRole: "",
    category: "품질",
    title: "",
    details: "",
    status: "진행중",
  };
}

function makeIssueDocId(recordDate: string, writerName: string): string {
  return `ISSUE_${recordDate}_${writerName.trim()}`;
}

function sortByRecent(docs: IssueDocRecord[]): IssueDocRecord[] {
  return docs
    .slice()
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export function useRegisterIssuePage() {
  const issueRepo = useMemo(
    () => createIssueRepo() as unknown as RepoContract<IssueDocRecord>,
    []
  );
  const [docs, setDocs] = useState<IssueDocRecord[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<IssueRegisterDraft>({
    key: DRAFT_KEYS.issueRegister,
    initial: defaultIssueDraft(),
  });

  const refresh = useCallback(async () => {
    const all = await issueRepo.getAll();
    setDocs(sortByRecent(all));
  }, [issueRepo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  function updateDraft(patch: Partial<IssueRegisterDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    saveDraft(next);
  }

  function resetDraft() {
    discardDraft();
  }

  async function submit() {
    if (!draft.writerName.trim()) {
      alert("작성자를 입력하세요.");
      return;
    }
    if (!draft.writerRole.trim()) {
      alert("직책을 입력하세요.");
      return;
    }
    if (!draft.title.trim()) {
      alert("이슈 제목을 입력하세요.");
      return;
    }

    const now = Date.now();
    const item: IssueItemRecord = {
      id: createLocalId("ISSUE_ITEM"),
      title: draft.title.trim(),
      details: draft.details.trim(),
      status: draft.status,
      category: draft.category,
      recordDate: draft.recordDate,
      writerName: draft.writerName.trim(),
      updatedAt: now,
    };

    const docId = makeIssueDocId(draft.recordDate, draft.writerName);
    const existing = await issueRepo.getById(docId);

    const nextDoc: IssueDocRecord = existing
      ? {
          ...existing,
          writerRole: draft.writerRole.trim(),
          items: [item, ...(existing.items || [])],
          updatedAt: now,
        }
      : {
          id: docId,
          recordDate: draft.recordDate,
          writerName: draft.writerName.trim(),
          writerRole: draft.writerRole.trim(),
          items: [item],
          createdAt: new Date(now).toISOString(),
          updatedAt: now,
        };

    await issueRepo.upsert(nextDoc);
    await refresh();
    discardDraft();
    alert("이슈가 저장되었습니다.");
  }

  async function removeDoc(id: string) {
    await issueRepo.remove(id);
    await refresh();
  }

  return {
    draft,
    docs,
    updateDraft,
    resetDraft,
    submit,
    removeDoc,
  };
}
