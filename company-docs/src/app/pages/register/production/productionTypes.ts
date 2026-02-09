/**
 * productionTypes.ts
 * ANCHOR: PRODUCTION_TYPES_CENTRAL
 * DESC: Production 도메인 공통 타입 정의 (EquipmentRow, EmployeeRow 중앙화)
 */

export type EquipmentRow = {
  id: string;
  name: string;
  location: string;
  equipType: string;
  equipTypeNote: string;
  importance: string;
  makerModel: string;
  installedAt: string;
  inspectCycle: string;
  inspectNote: string;
  consumableIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRow = {
  id: string;
  name: string;
  branch: "대구" | "성주";
  phone: string;
  job: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};
