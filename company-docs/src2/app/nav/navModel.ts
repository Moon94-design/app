import { NAV_CONFIG, getNavItemPath, getNavItemSiblings } from "./navConfig";
import type { NavItem } from "./navConfig";

export interface Crumb {
  label: string;
  to: string;
}

export interface QuickTab {
  label: string;
  to: string;
}

/**
 * pathname으로부터 breadcrumb 배열 생성
 */
export function getBreadcrumb(pathname: string): Crumb[] {
  const pathItems = getNavItemPath(pathname).map((item) => ({
    label: item.label,
    to: item.path,
  }));

  if (pathname === "/") return pathItems;
  if (pathItems.length > 0 && pathItems[0].to === "/") return pathItems;

  return [{ label: "홈", to: "/" }, ...pathItems];
}

/**
 * pathname의 형제(sibling) 탭 목록 생성 (hidden/comingSoon 제외)
 */
export function getQuickTabs(pathname: string): QuickTab[] {
  const segments = pathname.split("/").filter(Boolean);

  // 최상위 섹션(/register, /manage, /browse, /excel)에서는
  // 상위 네비 탭(엑셀등록/등록/관리/조회)을 보여준다.
  if (segments.length === 1) {
    return NAV_CONFIG
      .filter((item: NavItem) => item.path !== "/" && item.path !== pathname && !item.hidden && !item.comingSoon)
      .map((item: NavItem) => ({
        label: item.label,
        to: item.path,
      }));
  }

  return getNavItemSiblings(pathname)
    .filter((item: NavItem) => !item.hidden && !item.comingSoon)
    .map((item: NavItem) => ({
      label: item.label,
      to: item.path,
    }));
}
