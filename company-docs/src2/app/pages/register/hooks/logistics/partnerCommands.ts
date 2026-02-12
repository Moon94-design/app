import type { RepoContract } from "@kernel/repo";
import {
  defaultPartnerV2Draft,
  mergeTradeProfiles,
  resolvePartnerStatus,
  type PartnerV2,
  type PartnerV2Draft,
} from "@kernel/schema/partner";
import { createLocalId, findDuplicateByName, findDuplicateByNamePair } from "@kernel/utils";
import type { CreateResult, UpdatePartnerNameInput, UpdatePartnerNameResult } from "./types";

type UpdatePartnerQuickNameCommandArgs = {
  partnerRepo: RepoContract<PartnerV2>;
  refreshMasters: () => Promise<void>;
  input: UpdatePartnerNameInput;
};

export async function updatePartnerQuickNameCommand({
  partnerRepo,
  refreshMasters,
  input,
}: UpdatePartnerQuickNameCommandArgs): Promise<UpdatePartnerNameResult> {
  const partner = await partnerRepo.getById(input.id);
  if (!partner) {
    return { ok: false, message: "대상 거래처를 찾지 못했습니다." };
  }

  const partnerName = input.partnerName.trim();
  const partnerDetailTag = input.partnerDetailTag.trim();
  if (!partnerName) {
    return { ok: false, message: "거래처명을 입력해 주세요." };
  }

  const allPartners = await partnerRepo.getAll();
  const duplicate = findDuplicateByNamePair(
    allPartners,
    (row) => row.base.partnerName || "",
    (row) => row.base.partnerDetailTag || "",
    partnerName,
    partnerDetailTag,
    input.id
  );
  if (duplicate) {
    return { ok: false, message: "동일한 거래처명/세부 조합이 이미 있습니다." };
  }

  const nextBase = {
    ...partner.base,
    partnerName,
    partnerDetailTag,
  };
  const nextExtra = {
    ...partner.extra,
  };
  nextExtra.status = resolvePartnerStatus(nextBase, nextExtra);

  await partnerRepo.upsert({
    ...partner,
    base: nextBase,
    extra: nextExtra,
    updatedAt: Date.now(),
  });
  await refreshMasters();

  return { ok: true, message: "기존 거래처명을 수정했습니다." };
}

type CreatePartnerQuickCommandArgs = {
  partnerRepo: RepoContract<PartnerV2>;
  refreshMasters: () => Promise<void>;
  input: PartnerV2Draft;
};

export async function createPartnerQuickCommand({
  partnerRepo,
  refreshMasters,
  input,
}: CreatePartnerQuickCommandArgs): Promise<CreateResult> {
  const name = input.base.partnerName.trim();
  if (!name) {
    return { ok: false, message: "거래처명을 입력해 주세요." };
  }
  const detailTag = (input.base.partnerDetailTag || "").trim();

  const allPartners = await partnerRepo.getAll();
  const exactDuplicate = findDuplicateByNamePair(
    allPartners,
    (row) => row.base.partnerName || "",
    (row) => row.base.partnerDetailTag || "",
    name,
    detailTag
  );
  if (exactDuplicate) {
    return {
      ok: false,
      message:
        "동일한 거래처명/세부 조합이 이미 있어 기존 거래처를 선택했습니다. 필요하면 기존 항목을 수정해 주세요.",
      id: exactDuplicate.id,
    };
  }

  const sameBase = findDuplicateByName(allPartners, (row) => row.base.partnerName || "", name);
  if (sameBase && !detailTag) {
    return {
      ok: false,
      message: "동일한 거래처명이 이미 있습니다. 거래처명 세부를 입력해서 구분해 주세요.",
      id: sameBase.id,
    };
  }

  const now = Date.now();
  const defaultPartner = defaultPartnerV2Draft();
  const nextBase = {
    ...defaultPartner.base,
    ...input.base,
    partnerName: name,
    partnerDetailTag: detailTag,
    partnerCode: input.base.partnerCode.trim() || `PC_${now}`,
  };
  const nextExtra = {
    ...defaultPartner.extra,
    ...input.extra,
    tradeProfiles: mergeTradeProfiles(
      defaultPartner.extra.tradeProfiles,
      input.extra.tradeProfiles ?? [],
      "overwrite"
    ),
  };
  nextExtra.status = resolvePartnerStatus(nextBase, nextExtra);

  const nextDoc: PartnerV2 = {
    id: createLocalId("PV2"),
    base: nextBase,
    extra: nextExtra,
    createdAt: now,
    updatedAt: now,
  };

  await partnerRepo.upsert(nextDoc);
  await refreshMasters();

  return {
    ok: true,
    message: `거래처 '${name}'가 등록되었습니다.`,
    id: nextDoc.id,
  };
}
