/**
 * 네비게이션 아이템 타입 (SSOT)
 * - component 필드 금지. loader만 사용.
 * - loader: () => Promise<{ default: React.ComponentType }>
 * - React.lazy(loader)는 routes.tsx에서만 수행.
 */
export interface NavItem {
  /** 메뉴 레이블 (breadcrumb, 탭 등에 표시) */
  label: string;
  /** 라우트 경로 (절대 경로) */
  path: string;
  /** 페이지 로더 — routes.tsx에서 React.lazy(loader)로 변환 */
  loader?: () => Promise<{ default: React.ComponentType }>;
  /** 하위 메뉴 (계층 구조) */
  children?: NavItem[];
  /** 네비에서 숨김 여부 (라우트는 생성됨) */
  hidden?: boolean;
  /** 준비 중 (클릭 시 알림만 표시) */
  comingSoon?: boolean;
}

/**
 * 전역 네비게이션 설정 (SSOT)
 * - 라우트 자동 생성: routes.tsx에서 사용
 * - breadcrumb 자동 생성: navModel.ts에서 사용
 * - quickTabs 자동 생성: navModel.ts에서 사용
 *
 * 이관 시 loader import 경로만 교체:
 *   @legacy/app/pages/... → @app2/pages/...
 * routes 생성기(routes.tsx)는 수정하지 않는다(로직 고정).
 */
export const NAV_CONFIG: NavItem[] = [
  {
    label: "홈",
    path: "/",
    loader: () => import("@app2/pages/home/HomeMainPage"),
  },
  {
    label: "엑셀등록",
    path: "/excel",
    loader: () => import("@app2/pages/excel/ExcelImportHubPage"),
  },
  {
    label: "등록",
    path: "/register",
    loader: () => import("@app2/pages/register/RegisterHomePage"),
    children: [
      {
        label: "기준정보",
        path: "/register/master",
        loader: () => import("@app2/pages/register/RegisterMasterPage"),
        children: [
          {
            label: "거래처",
            path: "/register/master/partner",
            loader: () => import("@app2/pages/partner/PartnerRegisterPage"),
          },
          {
            label: "차량",
            path: "/register/master/vehicle",
            loader: () => import("@app2/pages/vehicle/VehicleRegisterPage"),
          },
          {
            label: "서비스 업체",
            path: "/register/master/vendor",
            loader: () => import("@app2/pages/vendor/VendorRegisterPage"),
          },
          {
            label: "관계 기관",
            path: "/register/master/agency",
            loader: () => import("@app2/pages/agency/AgencyRegisterPage"),
          },
          {
            label: "직원",
            path: "/register/master/employee",
            loader: () => import("@app2/pages/employee/EmployeeRegisterPage"),
          },
          {
            label: "설비",
            path: "/register/master/equipment",
            loader: () => import("@app2/pages/equipment/EquipmentRegisterPage"),
          },
          {
            label: "소모품",
            path: "/register/master/consumable",
            loader: () => import("@app2/pages/consumable/ConsumableRegisterPage"),
          },
        ],
      },
      {
        label: "일일기록",
        path: "/register/daily",
        loader: () => import("@app2/pages/register/RegisterDailyPage"),
        children: [
          {
            label: "물류",
            path: "/register/daily/logistics",
            loader: () => import("@legacy/app/pages/register/RegisterLogisticsDaily"),
          },
          {
            label: "사무",
            path: "/register/daily/office",
            loader: () => import("@legacy/app/pages/register/RegisterOfficeDaily"),
          },
          {
            label: "생산",
            path: "/register/daily/production",
            loader: () => import("@legacy/app/pages/register/RegisterProductionDaily"),
          },
          {
            label: "이슈",
            path: "/register/daily/issue",
            loader: () => import("@app2/pages/register/RegisterIssuePage"),
          },
          {
            label: "조치",
            path: "/register/daily/action",
            loader: () => import("@legacy/app/pages/register/RegisterAction"),
          },
        ],
      },
    ],
  },
  {
    label: "관리",
    path: "/manage",
    loader: () => import("@app2/pages/manage/ManageHomePage"),
    children: [
      {
        label: "기준정보",
        path: "/manage/master",
        loader: () => import("@app2/pages/manage/ManageMasterPage"),
        children: [
          {
            label: "거래처",
            path: "/manage/master/partner",
            loader: () => import("@app2/pages/partner/PartnerManagePage"),
          },
          {
            label: "차량",
            path: "/manage/master/vehicle",
            loader: () => import("@app2/pages/manage/ManageVehiclePage"),
          },
          {
            label: "서비스 업체",
            path: "/manage/master/vendor",
            loader: () => import("@app2/pages/manage/ManageVendorPage"),
          },
          {
            label: "관계 기관",
            path: "/manage/master/agency",
            loader: () => import("@app2/pages/manage/ManageAgencyPage"),
          },
          {
            label: "직원",
            path: "/manage/master/employee",
            loader: () => import("@app2/pages/manage/ManageEmployeePage"),
          },
          {
            label: "설비",
            path: "/manage/master/equipment",
            loader: () => import("@app2/pages/manage/ManageEquipmentPage"),
          },
          {
            label: "소모품",
            path: "/manage/master/consumable",
            loader: () => import("@app2/pages/manage/ManageConsumablePage"),
          },
        ],
      },
      {
        label: "일일기록",
        path: "/manage/daily",
        loader: () => import("@app2/pages/manage/ManageDailyPage"),
        children: [
          {
            label: "유통",
            path: "/manage/daily/logistics",
            loader: () => import("@app2/pages/manage/ManageLogisticsPage"),
          },
          {
            label: "생산",
            path: "/manage/daily/production",
            loader: () => import("@app2/pages/manage/ManageProductionPage"),
          },
          {
            label: "이슈",
            path: "/manage/daily/issue",
            loader: () => import("@app2/pages/manage/ManageIssuePage"),
          },
          {
            label: "조치",
            path: "/manage/daily/action",
            loader: () => import("@app2/pages/manage/ManageActionPage"),
          },
        ],
      },
    ],
  },
  {
    label: "조회",
    path: "/browse",
    loader: () => import("@app2/pages/browse/BrowseHomePage"),
    children: [
      {
        label: "기준정보",
        path: "/browse/master",
        loader: () => import("@legacy/app/pages/browse/BrowseMaster"),
      },
      {
        label: "일일기록",
        path: "/browse/daily",
        loader: () => import("@legacy/app/pages/browse/BrowseDaily"),
      },
      {
        label: "단가",
        path: "/browse/price",
        loader: () => import("@legacy/app/pages/browse/BrowsePrice"),
      },
      {
        label: "물량/자금 추세",
        path: "/browse/weighing-trend",
        loader: () => import("@legacy/app/pages/browse/BrowseWeighingMonthlyTrend"),
      },
      {
        label: "계량 단가",
        path: "/browse/weighing-price",
        loader: () => import("@legacy/app/pages/browse/BrowseWeighingUnitPrice"),
      },
    ],
  },
];

/**
 * 경로에서 NavItem 찾기 (재귀)
 */
export function findNavItem(path: string, items: NavItem[] = NAV_CONFIG): NavItem | null {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findNavItem(path, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 경로의 모든 상위 NavItem 찾기 (breadcrumb용)
 */
export function getNavItemPath(path: string): NavItem[] {
  const result: NavItem[] = [];
  const segments = path.split("/").filter(Boolean);

  let currentPath = "";
  for (const seg of segments) {
    currentPath += `/${seg}`;
    const item = findNavItem(currentPath);
    if (item) result.push(item);
  }

  return result;
}

/**
 * 특정 경로의 형제(sibling) NavItem 찾기 (quickTabs용)
 */
export function getNavItemSiblings(path: string): NavItem[] {
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) return []; // 최상위는 sibling 없음

  const parentPath = "/" + segments.slice(0, -1).join("/");
  const parent = findNavItem(parentPath);

  return parent?.children ?? [];
}
