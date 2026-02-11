import { useEffect, useMemo, useState } from "react";
import { createActionRepo, type ActionDocRecord, type RepoContract } from "@kernel/repo";

function sortByRecent(docs: ActionDocRecord[]): ActionDocRecord[] {
  return docs
    .slice()
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export function useManageActionPage() {
  const actionRepo = useMemo(
    () => createActionRepo() as unknown as RepoContract<ActionDocRecord>,
    []
  );
  const [docs, setDocs] = useState<ActionDocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const all = await actionRepo.getAll();
    setDocs(sortByRecent(all));
  }

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);
      const all = await actionRepo.getAll();
      if (!alive) return;
      setDocs(sortByRecent(all));
      setLoading(false);
    }
    bootstrap();
    return () => {
      alive = false;
    };
  }, [actionRepo]);

  async function removeDoc(id: string) {
    await actionRepo.remove(id);
    await refresh();
  }

  return {
    loading,
    docs,
    removeDoc,
  };
}
