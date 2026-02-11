export const DRAFT_KEYS = {
	partnerV2: "draft:partner:v2",
	vehicleRegister: "draft:vehicle:register",
	vendorRegister: "draft:vendor:register",
	agencyRegister: "draft:agency:register",
	employeeRegister: "draft:employee:register",
	equipmentRegister: "draft:equipment:register",
	consumableRegister: "draft:consumable:register",
	logisticsDaily: "draft:daily:logistics",
	issueRegister: "draft:daily:issue:register",
} as const;

export type DraftKey = (typeof DRAFT_KEYS)[keyof typeof DRAFT_KEYS];
