import type { RepoContract } from "@kernel/repo";
import { resolveVehicleStatus, type Vehicle, type VehicleDraft } from "@kernel/schema/vehicle";
import { createLocalId, findDuplicateByVehicleNo } from "@kernel/utils";
import type { CreateResult } from "./types";

type CreateVehicleQuickCommandArgs = {
  vehicleRepo: RepoContract<Vehicle>;
  refreshMasters: () => Promise<void>;
  input: VehicleDraft;
};

export async function createVehicleQuickCommand({
  vehicleRepo,
  refreshMasters,
  input,
}: CreateVehicleQuickCommandArgs): Promise<CreateResult> {
  const vehicleNo = input.vehicleNo.trim();
  if (!vehicleNo) {
    return { ok: false, message: "차량번호를 입력해 주세요." };
  }

  const allVehicles = await vehicleRepo.getAll();
  const duplicate = findDuplicateByVehicleNo(allVehicles, (row) => row.vehicleNo || "", vehicleNo);
  if (duplicate) {
    return {
      ok: false,
      message: "동일한 차량번호가 이미 있어 기존 차량을 선택했습니다. 필요하면 기존 항목을 수정해 주세요.",
      id: duplicate.id,
      selectedText: duplicate.vehicleNo,
    };
  }

  const now = Date.now();
  const nextVehicle: Vehicle = {
    id: createLocalId("V"),
    vehicleNo,
    tonClass: input.tonClass,
    bodyType: input.bodyType,
    carrierName: input.carrierName.trim(),
    driverName: input.driverName.trim(),
    driverPhone: input.driverPhone.trim(),
    tagsText: input.tagsText.trim(),
    memo: input.memo.trim(),
    source: "manual",
    status: resolveVehicleStatus(input),
    createdAt: now,
    updatedAt: now,
  };

  await vehicleRepo.upsert(nextVehicle);
  await refreshMasters();

  return {
    ok: true,
    message: `차량 '${vehicleNo}'가 등록되었습니다.`,
    id: nextVehicle.id,
    selectedText: nextVehicle.vehicleNo,
  };
}
