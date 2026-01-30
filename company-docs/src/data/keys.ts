/**
 * 로컬 저장 키 모음
 * - 서버 이식할 때도 테이블/컬렉션 이름의 기준점으로 사용 가능
 */
export const KEYS = {
  // master
  partners: "local_partners_v2",
  vehicles: "local_vehicles_v1",
  vendors: "local_vendors_v1",
  agencies: "local_agencies_v1",
  employees: "local_employees_v1",
  equipments: "local_equipments_v1",
  consumables: "local_consumables_v1",

  // daily
  dailyLogisticsLines: "daily_logistics_lines_v1",
  dailyOffice: "daily_office_v1",
  dailyProduction: "daily_production_v1",

  // events
  priceEvents: "price_events_v1",
  equipmentEvents: "equipment_events_v1",

  // user/local settings (개인 로컬 유지)
  author: "local_author_name_v1",
  shiftMemProduction: "shift_mem_production_v1",

  // drafts (개인 로컬 유지)
  draftPartner: "draft_partner_v1",
  draftAgency: "draft_agency_v1",
  draftLogistics: "draft_logistics_v1",
  draftOffice: "draft_office_v1",
  draftProduction: "draft_production_v1",
  draftVehicle: "draft_vehicle_v1",
  draftEmployee: "draft_employee_v1",
  draftVendor: "draft_vendor_v1",
  draftConsumable: "draft_consumable_v1",
  draftEquipment: "draft_equipment_v1",
} as const;

export type KeyName = keyof typeof KEYS;
