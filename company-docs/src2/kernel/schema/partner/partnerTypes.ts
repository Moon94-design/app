// ORIGIN: copied from src/app/pages/register/partner/partnerV2Types.ts (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

// Base 정보 (엑셀에서 들어오는 필드, 읽기 전용)
export type PartnerBase = {
  partnerCode: string; // 내부키
  partnerName: string; // 거래처명
  ceoName: string; // 대표자명
  phone: string; // 연락처
  zip: string; // 우편번호
  addr1: string; // 주소1
  addr2: string; // 주소2
  contactName: string; // 담당자명
  contactPhone: string; // 담당자 휴대폰
  businessNo: string; // 사업자번호 (권장)
  email: string; // 이메일 (권장)
  fax: string; // 팩스 (권장)
  businessType: string; // 업태 (선택)
  businessItem: string; // 종목 (선택)
  corporateNo: string; // 법인번호 (선택)
};

// 거래 프로필 아이템 (조합 단위)
export type TradeProfileItem = {
  direction: "매입" | "매출";
  item: "PP" | "PE";
  kind: "압축" | "분쇄" | "펠렛";
  memo?: string; // 프로필별 메모 (선택)
};

// 거래처 상태
export type PartnerStatus = "incomplete" | "pending" | "complete";

// Extra 정보 (웹앱 추가 필드, 편집 가능)
export type PartnerExtra = {
  status: PartnerStatus; // 상태 (미입력/보류/완료)
  note: string; // 거래처 전체 메모 (완료 기준)
  contactMemo: string; // 담당자 참고사항 메모
  bankAccount: string; // 계좌번호
  importance: "상" | "중" | "하"; // 중요도 (기본: 중)
  relationshipStatus: "상" | "중" | "하"; // 관계현황 (기본: 중)
  tradeProfiles: TradeProfileItem[]; // 거래 프로필 조합 리스트
  custom?: Record<string, unknown>; // 향후 확장용 (선택)
};

// 거래처 V2 (Base + Extra)
export type PartnerV2 = {
  id: string;
  base: PartnerBase;
  extra: PartnerExtra;
  createdAt: number;
  updatedAt: number;
};

// Draft (편집용)
export type PartnerV2Draft = {
  base: PartnerBase;
  extra: PartnerExtra;
};

// 상태 체크 함수들
export function isCompleted(extra: PartnerExtra): boolean {
  return extra.status === "complete";
}

export function isPending(extra: PartnerExtra): boolean {
  return extra.status === "pending";
}

export function isIncomplete(extra: PartnerExtra): boolean {
  return extra.status === "incomplete";
}

export function isPartnerComplete(base: PartnerBase, extra: PartnerExtra): boolean {
  const baseFields = [
    base.partnerName,
    base.ceoName,
    base.phone,
    base.zip,
    base.addr1,
    base.addr2,
    base.businessNo,
    base.contactName,
    base.contactPhone,
  ];
  const extraFields = [
    extra.note,
    extra.contactMemo,
    extra.bankAccount,
    extra.importance,
    extra.relationshipStatus,
  ];
  const baseOk = baseFields.every((value) => value.trim().length > 0);
  const extraOk = extraFields.every((value) => value.trim().length > 0);
  const profilesOk = (extra.tradeProfiles?.length ?? 0) > 0;

  return baseOk && extraOk && profilesOk;
}

export function resolvePartnerStatus(base: PartnerBase, extra: PartnerExtra): PartnerStatus {
  if (extra.status === "pending") return "pending";
  return isPartnerComplete(base, extra) ? "complete" : "incomplete";
}

// 기본값
export function defaultPartnerV2Draft(): PartnerV2Draft {
  return {
    base: {
      partnerCode: "",
      partnerName: "",
      ceoName: "",
      phone: "",
      zip: "",
      addr1: "",
      addr2: "",
      contactName: "",
      contactPhone: "",
      businessNo: "",
      email: "",
      fax: "",
      businessType: "",
      businessItem: "",
      corporateNo: "",
    },
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
  };
}
