import { useEffect, useMemo, useState } from "react";
import { createActionRepo, type ActionDocRecord, type RepoContract } from "@kernel/repo";
import { sortByRecordDateUpdated } from "@kernel/utils";

export function useManageActionPage() {
  const actionRepo = useMemo(
    () => createActionRepo() as unknown as RepoContract<ActionDocRecord>,
    []
  );
  const [docs, setDocs] = useState<ActionDocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const all = await actionRepo.getAll();
    setDocs(sortByRecordDateUpdated(all));
  }

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);
      const all = await actionRepo.getAll();
      if (!alive) return;
      setDocs(sortByRecordDateUpdated(all));
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
