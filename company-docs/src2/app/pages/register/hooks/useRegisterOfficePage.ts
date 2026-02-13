import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createAgencyRepo, createDailyRepo, type RepoContract, type RepoEntity } from "@kernel/repo";
import { sortByRecordDateUpdated } from "@kernel/utils";
import { defaultDraft, OFFICE_BRANCH_OPTIONS } from "./office/constants";
import {
  addAgencyExtraCommand,
  addEtcExtraCommand,
  removeAgencyExtraCommand,
  removeEtcExtraCommand,
  submitOfficeCommand,
} from "./office/commands";
import { mapAgency } from "./office/selectors";
import type { AgencyOption, DailyRepoRecord, OfficeDraft, OfficeRecord } from "./office/types";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";

export type { OfficeDraft } from "./office/types";

export function useRegisterOfficePage() {
  const dailyRepo = useMemo(
    () => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>,
    []
  );
  const agencyRepo = useMemo(
    () => createAgencyRepo() as unknown as RepoContract<RepoEntity & Record<string, unknown>>,
    []
  );

  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [records, setRecords] = useState<OfficeRecord[]>([]);

  const [agencyPick, setAgencyPick] = useState("");
  const [agencyTitle, setAgencyTitle] = useState("");
  const [agencyDetails, setAgencyDetails] = useState("");
  const [etcTitle, setEtcTitle] = useState("");
  const [etcDetails, setEtcDetails] = useState("");

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<OfficeDraft>({
    key: DRAFT_KEYS.officeDaily,
    initial: defaultDraft(),
  });
  const { writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });

  const refreshRecords = useCallback(async () => {
    const all = await dailyRepo.getAll();
    const office = all.filter((item) => item.kind === "office") as OfficeRecord[];
    setRecords(sortByRecordDateUpdated(office));
  }, [dailyRepo]);

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      const agencyRows = await agencyRepo.getAll();
      if (!alive) return;
      setAgencies(agencyRows.map((row) => mapAgency(row as Record<string, unknown>)));
      await refreshRecords();
    }
    bootstrap();
    return () => {
      alive = false;
    };
  }, [agencyRepo, refreshRecords]);

  const updateDraft = useCallback(
    (patch: Partial<OfficeDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
    setAgencyPick("");
    setAgencyTitle("");
    setAgencyDetails("");
    setEtcTitle("");
    setEtcDetails("");
  }, [discardDraft]);

  const addAgencyExtra = useCallback(() => {
    const result = addAgencyExtraCommand({
      draft,
      agencies,
      agencyPick,
      agencyTitle,
      agencyDetails,
    });
    if (!result.ok) {
      alert(result.message);
      return;
    }

    setDraft(result.nextDraft);
    saveDraft(result.nextDraft);
    setAgencyTitle("");
    setAgencyDetails("");
  }, [agencies, agencyDetails, agencyPick, agencyTitle, draft, saveDraft, setDraft]);

  const removeAgencyExtra = useCallback(
    (id: string) => {
      const next = removeAgencyExtraCommand(draft, id);
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const addEtcExtra = useCallback(() => {
    const result = addEtcExtraCommand({
      draft,
      etcTitle,
      etcDetails,
    });
    if (!result.ok) {
      alert(result.message);
      return;
    }

    setDraft(result.nextDraft);
    saveDraft(result.nextDraft);
    setEtcTitle("");
    setEtcDetails("");
  }, [draft, etcDetails, etcTitle, saveDraft, setDraft]);

  const removeEtcExtra = useCallback(
    (id: string) => {
      const next = removeEtcExtraCommand(draft, id);
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const submit = useCallback(async () => {
    const result = await submitOfficeCommand({
      dailyRepo,
      draft,
      refreshRecords,
      resetDraft,
    });
    alert(result.message);
  }, [dailyRepo, draft, refreshRecords, resetDraft]);

  const removeRecord = useCallback(
    async (id: string) => {
      await dailyRepo.remove(id);
      await refreshRecords();
    },
    [dailyRepo, refreshRecords]
  );

  return {
    draft,
    siteOptions: OFFICE_BRANCH_OPTIONS,
    records,
    agencies,
    agencyPick,
    setAgencyPick,
    agencyTitle,
    setAgencyTitle,
    agencyDetails,
    setAgencyDetails,
    etcTitle,
    setEtcTitle,
    etcDetails,
    setEtcDetails,
    writerLocked,
    updateDraft,
    addAgencyExtra,
    removeAgencyExtra,
    addEtcExtra,
    removeEtcExtra,
    resetDraft,
    submit,
    removeRecord,
  };
}
