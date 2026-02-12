import { createLocalId } from "@kernel/utils";
import type { RepoContract } from "@kernel/repo";
import { parseTags } from "./constants";
import type {
  AgencyOption,
  DailyRepoRecord,
  OfficeDraft,
  OfficeExtraAgency,
  OfficeExtraEtc,
  OfficeRecord,
  SubmitResult,
} from "./types";

type AddAgencyExtraArgs = {
  draft: OfficeDraft;
  agencies: AgencyOption[];
  agencyPick: string;
  agencyTitle: string;
  agencyDetails: string;
};

type AddEtcExtraArgs = {
  draft: OfficeDraft;
  etcTitle: string;
  etcDetails: string;
};

type SubmitOfficeCommandArgs = {
  dailyRepo: RepoContract<DailyRepoRecord>;
  draft: OfficeDraft;
  refreshRecords: () => Promise<void>;
  resetDraft: () => void;
};

export function addAgencyExtraCommand({
  draft,
  agencies,
  agencyPick,
  agencyTitle,
  agencyDetails,
}: AddAgencyExtraArgs): { ok: true; nextDraft: OfficeDraft } | { ok: false; message: string } {
  if (!agencyPick) {
    return { ok: false, message: "관공기관을 선택해 주세요." };
  }
  const target = agencies.find((item) => item.id === agencyPick);
  if (!target) {
    return { ok: false, message: "선택한 관공기관을 찾을 수 없습니다." };
  }

  const extra: OfficeExtraAgency = {
    id: createLocalId("OFFICE_AGENCY"),
    agencyId: target.id,
    agencyLabel: target.label,
    title: agencyTitle.trim(),
    details: agencyDetails.trim(),
  };

  return {
    ok: true,
    nextDraft: {
      ...draft,
      extraAgencies: [extra, ...(draft.extraAgencies || [])],
    },
  };
}

export function removeAgencyExtraCommand(draft: OfficeDraft, id: string): OfficeDraft {
  return {
    ...draft,
    extraAgencies: (draft.extraAgencies || []).filter((item) => item.id !== id),
  };
}

export function addEtcExtraCommand({
  draft,
  etcTitle,
  etcDetails,
}: AddEtcExtraArgs): { ok: true; nextDraft: OfficeDraft } | { ok: false; message: string } {
  if (!etcTitle.trim() && !etcDetails.trim()) {
    return { ok: false, message: "기타 제목 또는 내용을 입력해 주세요." };
  }

  const extra: OfficeExtraEtc = {
    id: createLocalId("OFFICE_ETC"),
    title: etcTitle.trim(),
    details: etcDetails.trim(),
  };

  return {
    ok: true,
    nextDraft: {
      ...draft,
      extraEtc: [extra, ...(draft.extraEtc || [])],
    },
  };
}

export function removeEtcExtraCommand(draft: OfficeDraft, id: string): OfficeDraft {
  return {
    ...draft,
    extraEtc: (draft.extraEtc || []).filter((item) => item.id !== id),
  };
}

export async function submitOfficeCommand({
  dailyRepo,
  draft,
  refreshRecords,
  resetDraft,
}: SubmitOfficeCommandArgs): Promise<SubmitResult> {
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
  if (!draft.title.trim()) {
    return { ok: false, message: "제목을 입력해 주세요." };
  }

  const nowMs = Date.now();
  const record: OfficeRecord = {
    id: createLocalId("OFFICE"),
    kind: "office",
    recordDate: draft.recordDate,
    site: draft.site,
    writerName: draft.writerName.trim(),
    writerRole: draft.writerRole.trim(),
    title: draft.title.trim(),
    details: draft.details.trim(),
    tags: parseTags(draft.tagsText),
    extraAgencies: draft.extraAgencies || [],
    extraEtc: draft.extraEtc || [],
    createdAt: new Date(nowMs).toISOString(),
    updatedAt: nowMs,
  };

  await dailyRepo.upsert(record as DailyRepoRecord);
  await refreshRecords();
  resetDraft();

  return { ok: true, message: "사무 기록이 저장되었습니다." };
}
