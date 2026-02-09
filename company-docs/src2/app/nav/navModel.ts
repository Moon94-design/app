import { getNavItemPath, getNavItemSiblings } from "./navConfig";
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
  return getNavItemPath(pathname).map((item) => ({
    label: item.label,
    to: item.path,
  }));
}

/**
 * pathname의 형제(sibling) 탭 목록 생성 (hidden/comingSoon 제외)
 */
export function getQuickTabs(pathname: string): QuickTab[] {
  return getNavItemSiblings(pathname)
    .filter((item: NavItem) => !item.hidden && !item.comingSoon)
    .map((item: NavItem) => ({
      label: item.label,
      to: item.path,
    }));
}
