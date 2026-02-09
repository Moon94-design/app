import type { ValidationResult, Ref } from "./_common";
import { requireText, ensureString, ensureArray, newId, nowIso, todayYMD } from "./_common";

export type IssueCategory = "quality" | "equipment" | "safety";
export type IssueStatus = "진행중" | "완료";

// 이슈 수정 이력
export type IssueHistoryEntry = {
  timestamp: string;
  action: "created" | "updated" | "status_changed" | "action_linked";
  by: string;              // 작성자
  details?: string;        // 변경 상세
  snapshot?: Partial<IssueItem>; // 변경 전 스냅샷
  linkedActionId?: string; // 연계된 조치 ID
};

export type IssueQuality = {
  severity: "낮음" | "보통" | "높음";
  product?: Ref; // (선택) 품목/제품 참조
  item?: "PP" | "PE"; // (선택) 항목 종류
  kind?: "압축품" | "분쇄품" | "펠렛"; // (선택) 생산품 종류
  cause: string;
  action: string;
  prevent: string;
};

export type IssueEquipment = {
  equipment?: Ref; // (선택) 설비 참조
  severity: "낮음" | "보통" | "높음"; // 심각도
  symptom: string;
  action: string;
  prevent: string;
  status: IssueStatus;
};

export type IssueSafety = {
  risk: "낮음" | "보통" | "높음";
  employee?: Ref; // (선택) 직원 참조
  location: string;
  action: string;
  prevent: string;
};

export type IssueItem = {
  id: string;
  recordDate: string;   // 어떤 날의 이슈인지 (사용자 선택)
  actualCreatedAt: string; // 실제 작성 시점 (시스템 자동 기록)
  site?: "대구" | "성주"; // (선택) 지부
  createdAt: string;
  updatedAt: string;

  writerName: string;   // 로컬 단계: 작성자명
  title: string;
  details: string;

  category: IssueCategory;
  categoryLabel: string; // 필터용: 품질/설비/안전
  
  // 최상위 상태 (모든 카테고리 공통)
  status: IssueStatus;  // "진행중" | "완료"
  severity: "낮음" | "보통" | "높음"; // 심각도 (모든 카테고리 공통)
  
  // 수정 이력 (관리자 조회용)
  history?: IssueHistoryEntry[];
  
  // 연계된 조치 ID
  linkedActionId?: string;

  quality?: IssueQuality;
  equipment?: IssueEquipment;
  safety?: IssueSafety;

  // 연계 ID 로그 (필터링용)
  equipmentId?: string;
  equipmentLabel?: string;
  employeeId?: string;
  employeeLabel?: string;

  tags: string[];       // 이슈 자체 태그(선택)
  tagIds: string[];     // 태그 목록 (검색용 정규화)
};

export type IssueDoc = {
  // ✅ 1계정×1일 = 1문서(그 안에 items 여러 개)
  id: string;           // stable id: ISSUE_YYYY-MM-DD_writer
  recordDate: string;
  writerName: string;
  items: IssueItem[];
  updatedAt: string;
};

export type IssueDraft = {
  recordDate: string;
  writerName: string;
  site?: "대구" | "성주";
  tagsText: string;

  // 새 이슈 입력 폼
  category: IssueCategory;
  title: string;
  details: string;

  // category 별 필드
  q_severity: "낮음" | "보통" | "높음";
  q_item?: "PP" | "PE";
  q_kind?: "압축품" | "분쇄품" | "펠렛";
  q_status: IssueStatus;
  q_cause: string;
  q_action: string;
  q_prevent: string;

  e_equipmentId: string;
  e_equipmentLabel: string;
  e_severity: "낮음" | "보통" | "높음";
  e_symptom: string;
  e_action: string;
  e_prevent: string;
  e_status: IssueStatus;

  s_employeeId: string;
  s_employeeLabel: string;
  s_risk: "낮음" | "보통" | "높음";
  s_location: string;
  s_action: string;
  s_prevent: string;
};

export function defaultIssueDraft(): IssueDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    site: undefined,
    tagsText: "",
    category: "quality",
    title: "",
    details: "",

    q_severity: "보통",
    q_item: undefined,
    q_kind: undefined,
    q_status: "진행중",
    q_cause: "",
    q_action: "",
    q_prevent: "",

    e_equipmentId: "",
    e_equipmentLabel: "",
    e_severity: "보통",
    e_symptom: "",
    e_action: "",
    e_prevent: "",
    e_status: "진행중",

    s_employeeId: "",
    s_employeeLabel: "",
    s_risk: "보통",
    s_location: "",
    s_action: "",
    s_prevent: "",
  };
}

export function normalizeIssueDraft(raw: any): IssueDraft {
  const b = defaultIssueDraft();
  const cat: IssueCategory =
    raw?.category === "equipment" ? "equipment" : raw?.category === "safety" ? "safety" : "quality";
  const site: "대구" | "성주" | undefined = raw?.site === "성주" ? "성주" : raw?.site === "대구" ? "대구" : undefined;

  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    site,
    tagsText: ensureString(raw?.tagsText, ""),
    category: cat,
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),

    q_severity: raw?.q_severity === "낮음" || raw?.q_severity === "보통" || raw?.q_severity === "높음" ? raw.q_severity : "보통",
    q_item: raw?.q_item === "PP" || raw?.q_item === "PE" ? raw.q_item : undefined,
    q_kind: raw?.q_kind === "압축품" || raw?.q_kind === "분쇄품" || raw?.q_kind === "펠렛" ? raw.q_kind : undefined,
    q_status: raw?.q_status === "완료" ? "완료" : "진행중",
    q_cause: ensureString(raw?.q_cause, ""),
    q_action: ensureString(raw?.q_action, ""),
    q_prevent: ensureString(raw?.q_prevent, ""),

    e_equipmentId: ensureString(raw?.e_equipmentId, ""),
    e_equipmentLabel: ensureString(raw?.e_equipmentLabel, ""),
    e_severity: raw?.e_severity === "낮음" || raw?.e_severity === "보통" || raw?.e_severity === "높음" ? raw.e_severity : "보통",
    e_symptom: ensureString(raw?.e_symptom, ""),
    e_action: ensureString(raw?.e_action, ""),
    e_prevent: ensureString(raw?.e_prevent, ""),
    e_status: raw?.e_status === "완료" ? "완료" : "진행중",

    s_employeeId: ensureString(raw?.s_employeeId, ""),
    s_employeeLabel: ensureString(raw?.s_employeeLabel, ""),
    s_risk: raw?.s_risk === "낮음" || raw?.s_risk === "보통" || raw?.s_risk === "높음" ? raw.s_risk : "보통",
    s_location: ensureString(raw?.s_location, ""),
    s_action: ensureString(raw?.s_action, ""),
    s_prevent: ensureString(raw?.s_prevent, ""),
  };
}

export function validateIssueDraft(d: IssueDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "이슈 날짜를 선택하세요.", errors);
  requireText("title", d.title, "이슈 제목을 입력하세요.", errors);

  if (d.category === "quality") {
    requireText("q_item", d.q_item || "", "항목(PP/PE)을 선택하세요.", errors);
    requireText("q_kind", d.q_kind || "", "생산품 종류를 선택하세요.", errors);
    // 해결완료 시에만 조치/재발방지 필수
    if (d.q_status === "완료") {
      requireText("q_action", d.q_action, "조치 내용을 입력하세요.", errors);
      requireText("q_prevent", d.q_prevent, "재발방지를 입력하세요.", errors);
    }
  }
  if (d.category === "equipment") {
    const eq = d.e_equipmentId || "";
    if (!eq || eq === "__none__") {
      // "해당없음" 허용
    } else {
      requireText("e_equipmentId", eq, "설비를 선택하세요.", errors);
    }
    requireText("e_symptom", d.e_symptom, "증상을 입력하세요.", errors);
    requireText("e_action", d.e_action, "조치를 입력하세요.", errors);
  }
  if (d.category === "safety") {
    const emp = d.s_employeeId || "";
    if (!emp || emp === "__none__") {
      // "해당없음" 허용
    } else {
      requireText("s_employeeId", emp, "직원을 선택하세요.", errors);
    }
    requireText("s_location", d.s_location, "장소를 입력하세요.", errors);
    requireText("s_action", d.s_action, "조치를 입력하세요.", errors);
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export function makeIssueDocId(recordDate: string, writerName: string) {
  const w = (writerName || "").trim() || "user";
  const safeW = w.replace(/[^a-zA-Z0-9가-힣_-]/g, "_").slice(0, 32);
  return `ISSUE_${recordDate}_${safeW}`;
}

export function toIssueItem(d: IssueDraft): IssueItem {
  const now = nowIso();
  const tags = (d.tagsText || "")
    .split(",")
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .map((x) => (x.startsWith("#") ? x.slice(1).trim() : x));

  // 태그 ID 정규화 (검색용)
  const tagIds = tags.map((t) => t.toLowerCase().replace(/[\s-]/g, ""));

  // 카테고리 레이블
  const categoryLabel = d.category === "quality" ? "품질" : d.category === "equipment" ? "설비" : "안전";

  // 연계 ID 추출
  let equipmentId: string | undefined;
  let equipmentLabel: string | undefined;
  let employeeId: string | undefined;
  let employeeLabel: string | undefined;

  if (d.category === "equipment" && d.e_equipmentId && d.e_equipmentId !== "__none__") {
    equipmentId = d.e_equipmentId;
    equipmentLabel = d.e_equipmentLabel || "";
  }
  if (d.category === "safety" && d.s_employeeId && d.s_employeeId !== "__none__") {
    employeeId = d.s_employeeId;
    employeeLabel = d.s_employeeLabel || "";
  }

  // 최상위 상태 및 심각도 결정
  let status: IssueStatus = "진행중";
  let severity: "낮음" | "보통" | "높음" = "보통";
  
  if (d.category === "quality") {
    severity = d.q_severity;
    status = d.q_status; // 품질 이슈도 진행중/완료 선택
  } else if (d.category === "equipment") {
    severity = d.e_severity;
    status = d.e_status;
  } else if (d.category === "safety") {
    severity = d.s_risk;
    status = "완료"; // 안전 이슈는 기본 완료
  }

  const base: IssueItem = {
    id: newId("ISS"),
    recordDate: d.recordDate,
    actualCreatedAt: now, // 실제 작성 시점
    site: d.site,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim(),
    title: d.title.trim(),
    details: d.details.trim(),
    category: d.category,
    categoryLabel,
    status,
    severity,
    history: [{
      timestamp: now,
      action: "created",
      by: d.writerName.trim(),
      details: "이슈 생성",
    }],
    equipmentId,
    equipmentLabel,
    employeeId,
    employeeLabel,
    tags,
    tagIds,
  };

  if (d.category === "quality") {
    base.quality = {
      severity: d.q_severity,
      item: d.q_item,
      kind: d.q_kind,
      cause: d.q_cause.trim(),
      action: d.q_action.trim(),
      prevent: d.q_prevent.trim(),
    };
  }
  if (d.category === "equipment") {
    base.equipment = {
      equipment: d.e_equipmentId && d.e_equipmentId !== "__none__" ? { id: d.e_equipmentId, label: d.e_equipmentLabel || "" } : undefined,
      severity: d.e_severity,
      symptom: d.e_symptom.trim(),
      action: d.e_action.trim(),
      prevent: d.e_prevent.trim(),
      status: d.e_status,
    };
  }
  if (d.category === "safety") {
    base.safety = {
      risk: d.s_risk,
      employee: d.s_employeeId && d.s_employeeId !== "__none__" ? { id: d.s_employeeId, label: d.s_employeeLabel || "" } : undefined,
      location: d.s_location.trim(),
      action: d.s_action.trim(),
      prevent: d.s_prevent.trim(),
    };
  }

  return base;
}

export function normalizeIssueDoc(raw: any): IssueDoc | null {
  if (!raw || typeof raw !== "object") return null;
  const recordDate = ensureString(raw.recordDate, "");
  const writerName = ensureString(raw.writerName, "");
  if (!recordDate || !writerName) return null;

  const items = ensureArray(raw.items, []);
  return {
    id: ensureString(raw.id, makeIssueDocId(recordDate, writerName)),
    recordDate,
    writerName,
    items: items as IssueItem[],
    updatedAt: ensureString(raw.updatedAt, nowIso()),
  };
}
