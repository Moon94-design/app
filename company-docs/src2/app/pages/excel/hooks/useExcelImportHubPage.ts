import { useCallback, useEffect, useMemo, useState } from "react";
import { createPartnerRepo, createVehicleRepo, createWeighingRepo, STORAGE_KEYS } from "@kernel/repo";
import { createJsonStorage } from "@kernel/repo/storage/jsonStorage";
import { createLocalId } from "@kernel/utils/id";
import type {
  ExcelSite,
  PartnerParseResult,
  VehicleParseResult,
  WeighingParseResult,
} from "../types/excelUploadTypes";

type ExcelTab = "partner" | "weighing" | "vehicle" | "other";

export function useExcelImportHubPage() {
  const settingsStorage = useMemo(() => createJsonStorage(), []);
  const [activeTab, setActiveTab] = useState<ExcelTab>("partner");
  const [selectedSite, setSelectedSite] = useState<ExcelSite>(() => {
    const saved = settingsStorage.getItem<ExcelSite>(STORAGE_KEYS.excelSelectedSite);
    return saved === "seongju" ? "seongju" : "daegu";
  });
  const [partnerCodes, setPartnerCodes] = useState<string[]>([]);
  const [ticketKeys, setTicketKeys] = useState<string[]>([]);
  const [vehicleNos, setVehicleNos] = useState<string[]>([]);

  const partnerRepo = useMemo(() => createPartnerRepo(), []);
  const weighingRepo = useMemo(() => createWeighingRepo(), []);
  const vehicleRepo = useMemo(() => createVehicleRepo(), []);

  const refreshLookupKeys = useCallback(async () => {
    const [partners, weighings, vehicles] = await Promise.all([
      partnerRepo.getAll(),
      weighingRepo.getAll(),
      vehicleRepo.getAll(),
    ]);

    setPartnerCodes(
      partners
        .map((item) => (typeof item?.base === "object" && item.base && "partnerCode" in item.base ? String((item.base as Record<string, unknown>).partnerCode || "") : ""))
        .filter(Boolean),
    );
    setTicketKeys(
      weighings
        .map((item) => {
          const ticketNo = String(item.ticketNo || "").trim();
          if (!ticketNo) return "";
          const site = String(item.site || "").trim().toLowerCase();
          return site ? `${site}:${ticketNo}` : `unknown:${ticketNo}`;
        })
        .filter(Boolean),
    );
    setVehicleNos(
      vehicles.map((item) => String(item.vehicleNo || "")).filter(Boolean),
    );
  }, [partnerRepo, vehicleRepo, weighingRepo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshLookupKeys();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshLookupKeys]);

  useEffect(() => {
    settingsStorage.setItem(STORAGE_KEYS.excelSelectedSite, selectedSite);
  }, [selectedSite, settingsStorage]);

  function applyPartner(result: PartnerParseResult) {
    void (async () => {
      const now = Date.now();
      const incoming = result.rows
        .filter((row) => row.status === "OK" && row.data)
        .map((row) => ({
          id: createLocalId("partner"),
          base: row.data!,
          extra: {
            status: "incomplete",
            note: "",
            contactMemo: "",
            bankAccount: "",
            importance: "중",
            relationshipStatus: "중",
            tradeProfiles: [],
            custom: {},
          },
          createdAt: now,
          updatedAt: now,
        }));

      if (incoming.length === 0) return;
      await partnerRepo.upsertMany(incoming);
      await refreshLookupKeys();
      alert(`✅ 거래처 ${incoming.length}건 등록 완료`);
    })();
  }

  function applyWeighing(result: WeighingParseResult) {
    void (async () => {
      const now = Date.now();
      const incoming = result.rows
        .filter((row) => (row.status === "OK" || row.status === "INCOMPLETE") && row.data)
        .map((row) => {
          const data = row.data ?? {};
          return {
            id: createLocalId("weighing"),
            ticketNo: String(data.ticketNo || ""),
            dateRaw: String(data.dateRaw || ""),
            date: String(data.date || ""),
            seq: Number(data.seq || 0),
            directionRaw: String(data.directionRaw || ""),
            direction: (data.direction as "BUY" | "SELL" | "") || "",
            inOut: (data.inOut as "입고" | "출고" | "") || "",
            site: data.site ? String(data.site) : "",
            partnerCode: String(data.partnerCode || ""),
            partnerId: data.partnerId ? String(data.partnerId) : undefined,
            partnerName: String(data.partnerName || ""),
            vehicleNo: String(data.vehicleNo || ""),
            itemCode: String(data.itemCode || ""),
            itemName: String(data.itemName || ""),
            gross: Number(data.gross || 0),
            tare: Number(data.tare || 0),
            net: Number(data.net || 0),
            handover: Number(data.handover || 0),
            unitPrice: Number(data.unitPrice || 0),
            amount: Number(data.amount || 0),
            note: String(data.note || ""),
            isIncomplete: Boolean(data.isIncomplete),
            isPriceIncomplete: Boolean(data.isPriceIncomplete),
            createdAt: now,
            updatedAt: now,
          };
        });

      if (incoming.length === 0) return;
      await weighingRepo.upsertMany(incoming);
      await refreshLookupKeys();
      alert(`✅ 계량현황 ${incoming.length}건 적용 완료`);
    })();
  }

  function applyVehicle(result: VehicleParseResult) {
    void (async () => {
      const now = Date.now();
      const incoming = result.rows
        .filter((row) => (row.status === "OK" || row.status === "INCOMPLETE") && row.data)
        .map((row) => ({
          id: createLocalId("vehicle"),
          vehicleNo: String(row.data.vehicleNo || ""),
          tonClass: (row.data.tonClass as "" | "1t" | "5t" | "25t") || "",
          bodyType: (row.data.bodyType as "" | "카고" | "윙" | "방통") || "",
          carrierName: "",
          driverName: "",
          driverPhone: "",
          tagsText: "",
          memo: "",
          source: "excel" as const,
          status: "incomplete" as const,
          createdAt: now,
          updatedAt: now,
        }));

      if (incoming.length === 0) return;
      await vehicleRepo.upsertMany(incoming);
      await refreshLookupKeys();
      alert(`✅ 차량 ${incoming.length}건 적용 완료`);
    })();
  }

  return {
    migrationStage: "src2-hub",
    activeTab,
    setActiveTab,
    selectedSite,
    setSelectedSite,
    existingKeys: {
      partnerCodes,
      ticketKeys,
      vehicleNos,
    },
    applyPartner,
    applyWeighing,
    applyVehicle,
  } as const;
}
