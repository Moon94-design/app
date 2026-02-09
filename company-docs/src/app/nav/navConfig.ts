import type { ComponentType } from "react";

// 홈 페이지
import HomeMain from "../pages/home/HomeMain";
import ExcelImportHub from "../pages/home/ExcelImportHub";

// 등록 페이지
import RegisterHome from "../pages/register/RegisterHome";
import RegisterMaster from "../pages/register/RegisterMaster";
import RegisterDaily from "../pages/register/RegisterDaily";
import RegisterPartner from "../pages/register/RegisterPartner";
import RegisterVehicle from "../pages/register/RegisterVehicle";
import RegisterVendor from "../pages/register/RegisterVendor";
import RegisterAgency from "../pages/register/RegisterAgency";
import RegisterEmployee from "../pages/register/RegisterEmployee";
import RegisterEquipment from "../pages/register/RegisterEquipment";
import RegisterConsumable from "../pages/register/RegisterConsumable";
import RegisterLogisticsDaily from "../pages/register/RegisterLogisticsDaily";
import RegisterOfficeDaily from "../pages/register/RegisterOfficeDaily";
import RegisterProductionDaily from "../pages/register/RegisterProductionDaily";
import RegisterIssue from "../pages/register/RegisterIssue";
import RegisterAction from "../pages/register/RegisterAction";

// 관리 페이지
import ManageHome from "../pages/manage/ManageHome";
import ManageMaster from "../pages/manage/ManageMaster";
import ManageDaily from "../pages/manage/ManageDaily";

// 조회 페이지
import BrowseHome from "../pages/browse/BrowseHome";
import BrowseMaster from "../pages/browse/BrowseMaster";
import BrowseDaily from "../pages/browse/BrowseDaily";
import BrowsePrice from "../pages/browse/BrowsePrice";
import BrowseWeighingMonthlyTrend from "../pages/browse/BrowseWeighingMonthlyTrend";
import BrowseWeighingUnitPrice from "../pages/browse/BrowseWeighingUnitPrice";

/**
 * 네비게이션 아이템 타입
 */
export interface NavItem {
  /** 메뉴 레이블 (breadcrumb, 탭 등에 표시) */
  label: string;
  /** 라우트 경로 (절대 경로) */
  path: string;
  /** React 컴포넌트 (없으면 placeholder) */
  component?: ComponentType;
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
 */
export const NAV_CONFIG: NavItem[] = [
  {
    label: "홈",
    path: "/",
    component: HomeMain,
  },
  {
    label: "엑셀등록",
    path: "/excel",
    component: ExcelImportHub,
  },
  {
    label: "등록",
    path: "/register",
    component: RegisterHome,
    children: [
      {
        label: "기준정보",
        path: "/register/master",
        component: RegisterMaster,
        children: [
          {
            label: "거래처",
            path: "/register/master/partner",
            component: RegisterPartner,
          },
          {
            label: "차량",
            path: "/register/master/vehicle",
            component: RegisterVehicle,
          },
          {
            label: "매입처",
            path: "/register/master/vendor",
            component: RegisterVendor,
          },
          {
            label: "중개업체",
            path: "/register/master/agency",
            component: RegisterAgency,
          },
          {
            label: "직원",
            path: "/register/master/employee",
            component: RegisterEmployee,
          },
          {
            label: "설비",
            path: "/register/master/equipment",
            component: RegisterEquipment,
          },
          {
            label: "소모품",
            path: "/register/master/consumable",
            component: RegisterConsumable,
          },
        ],
      },
      {
        label: "일일기록",
        path: "/register/daily",
        component: RegisterDaily,
        children: [
          {
            label: "물류",
            path: "/register/daily/logistics",
            component: RegisterLogisticsDaily,
          },
          {
            label: "사무",
            path: "/register/daily/office",
            component: RegisterOfficeDaily,
          },
          {
            label: "생산",
            path: "/register/daily/production",
            component: RegisterProductionDaily,
          },
          {
            label: "이슈",
            path: "/register/daily/issue",
            component: RegisterIssue,
          },
          {
            label: "조치",
            path: "/register/daily/action",
            component: RegisterAction,
          },
        ],
      },
    ],
  },
  {
    label: "관리",
    path: "/manage",
    component: ManageHome,
    children: [
      {
        label: "기준정보",
        path: "/manage/master",
        component: ManageMaster,
      },
      {
        label: "일일기록",
        path: "/manage/daily",
        component: ManageDaily,
      },
    ],
  },
  {
    label: "조회",
    path: "/browse",
    component: BrowseHome,
    children: [
      {
        label: "기준정보",
        path: "/browse/master",
        component: BrowseMaster,
      },
      {
        label: "일일기록",
        path: "/browse/daily",
        component: BrowseDaily,
      },
      {
        label: "단가",
        path: "/browse/price",
        component: BrowsePrice,
      },
      {
        label: "물량/자금 추세",
        path: "/browse/weighing-trend",
        component: BrowseWeighingMonthlyTrend,
      },
      {
        label: "계량 단가",
        path: "/browse/weighing-price",
        component: BrowseWeighingUnitPrice,
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
