// ORIGIN: copied from src/app/pages/register/RegisterEquipment.tsx (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

export type EquipmentType = "생산설비" | "유통설비" | "공용설비" | "기타";
export type EquipmentImportance = "상" | "중" | "하";
export type EquipmentInspectCycle = "주간" | "월간" | "분기" | "반기" | "연간" | "비정기";

export type Equipment = {
  id: string;
  name: string;
  location: string;
  equipType: EquipmentType;
  equipTypeNote: string;
  importance: EquipmentImportance;
  makerModel: string;
  installedAt: string;
  inspectCycle: EquipmentInspectCycle;
  inspectNote: string;
  consumableIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type Consumable = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  name: string;
  spec: string;
  replaceRule: string;
  minStock: number;
  vendorId: string;
  vendorName: string;
  createdAt: number;
  updatedAt: number;
};

export type EquipmentDraft = {
  name: string;
  location: string;
  equipType: EquipmentType;
  equipTypeNote: string;
  importance: EquipmentImportance;
  makerModel: string;
  installedAt: string;
  inspectCycle: EquipmentInspectCycle;
  inspectNote: string;
  activeEquipmentId: string;
  cName: string;
  cSpec: string;
  cRule: string;
  cMin: number;
  cVendorId: string;
};

export function defaultEquipmentDraft(): EquipmentDraft {
  return {
    name: "",
    location: "",
    equipType: "생산설비",
    equipTypeNote: "",
    importance: "중",
    makerModel: "",
    installedAt: "",
    inspectCycle: "월간",
    inspectNote: "",
    activeEquipmentId: "",
    cName: "",
    cSpec: "",
    cRule: "",
    cMin: 0,
    cVendorId: "",
  };
}

export function defaultConsumableFields(): Pick<EquipmentDraft, "cName" | "cSpec" | "cRule" | "cMin" | "cVendorId"> {
  return {
    cName: "",
    cSpec: "",
    cRule: "",
    cMin: 0,
    cVendorId: "",
  };
}
