import { useEffect, useMemo, useState } from "react";
import { createIssueRepo, type IssueDocRecord, type RepoContract } from "@kernel/repo";

function sortByRecent(docs: IssueDocRecord[]): IssueDocRecord[] {
  return docs
    .slice()
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export function useManageIssuePage() {
  const issueRepo = useMemo(
    () => createIssueRepo() as unknown as RepoContract<IssueDocRecord>,
    []
  );
  const [docs, setDocs] = useState<IssueDocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const all = await issueRepo.getAll();
    setDocs(sortByRecent(all));
  }

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);
      const all = await issueRepo.getAll();
      if (!alive) return;
      setDocs(sortByRecent(all));
      setLoading(false);
    }
    bootstrap();
    return () => {
      alive = false;
    };
  }, [issueRepo]);

  async function removeDoc(id: string) {
    await issueRepo.remove(id);
    await refresh();
  }

  return {
    loading,
    docs,
    removeDoc,
  };
}
