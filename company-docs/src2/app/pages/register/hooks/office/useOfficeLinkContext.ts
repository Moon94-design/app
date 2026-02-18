import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAgencyRepo,
  createConsumableRepo,
  createEmployeeRepo,
  createEquipmentRepo,
  createPartnerRepo,
  createVehicleRepo,
  createVendorRepo,
  type RepoContract,
} from "@kernel/repo";
import { OFFICE_LINK_TYPE_OPTIONS } from "./constants";
import { buildOfficeLinkOptionsByType, EMPTY_LINK_OPTIONS, type LinkOptionsByType, type OfficeMasterRow } from "./mappers";
import { buildLinkedReferenceSuggestions, type LinkedReferenceCandidate } from "../common/linkedReferences";
import type { OfficeLinkOption, OfficeLinkType } from "./types";

type UseOfficeLinkContextArgs = {
  currentLinkType: OfficeLinkType;
  detailsText: string;
};

export function useOfficeLinkContext({
  currentLinkType,
  detailsText,
}: UseOfficeLinkContextArgs): {
  lineOptions: OfficeLinkOption[];
  suggestionCandidates: LinkedReferenceCandidate<OfficeLinkType>[];
} {
  const partnerRepo = useMemo(
    () => createPartnerRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const vehicleRepo = useMemo(
    () => createVehicleRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const consumableRepo = useMemo(
    () => createConsumableRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const equipmentRepo = useMemo(
    () => createEquipmentRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const agencyRepo = useMemo(
    () => createAgencyRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const employeeRepo = useMemo(
    () => createEmployeeRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<OfficeMasterRow>,
    []
  );

  const [linkOptionsByType, setLinkOptionsByType] = useState<LinkOptionsByType>(EMPTY_LINK_OPTIONS);

  const refreshLinkOptions = useCallback(async () => {
    const [partners, vehicles, consumables, equipments, agencies, employees, vendors] = await Promise.all([
      partnerRepo.getAll(),
      vehicleRepo.getAll(),
      consumableRepo.getAll(),
      equipmentRepo.getAll(),
      agencyRepo.getAll(),
      employeeRepo.getAll(),
      vendorRepo.getAll(),
    ]);

    setLinkOptionsByType(
      buildOfficeLinkOptionsByType({
        partners,
        vehicles,
        consumables,
        equipments,
        agencies,
        employees,
        vendors,
      })
    );
  }, [agencyRepo, consumableRepo, employeeRepo, equipmentRepo, partnerRepo, vehicleRepo, vendorRepo]);

  useEffect(() => {
    void refreshLinkOptions();
  }, [refreshLinkOptions]);

  const lineOptions = linkOptionsByType[currentLinkType] || [];
  const allReferenceCandidates = useMemo(() => {
    const out: LinkedReferenceCandidate<OfficeLinkType>[] = [];
    for (const typeOption of OFFICE_LINK_TYPE_OPTIONS) {
      const options = linkOptionsByType[typeOption.id] || [];
      for (const option of options) {
        out.push({
          type: typeOption.id,
          typeLabel: typeOption.label,
          id: option.id,
          label: option.label,
        });
      }
    }
    return out;
  }, [linkOptionsByType]);

  const suggestionCandidates = useMemo(
    () => buildLinkedReferenceSuggestions(detailsText, allReferenceCandidates, 8),
    [allReferenceCandidates, detailsText]
  );

  return {
    lineOptions,
    suggestionCandidates,
  };
}
