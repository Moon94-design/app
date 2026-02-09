import { getNavItemPath, getNavItemSiblings } from "./navConfig";

export type Crumb = { label: string; to: string };
export type QuickTab = { label: string; to: string };

/**
 * 경로에서 breadcrumb 자동 생성 (navConfig 기반)
 */
export function getBreadcrumb(pathname: string): Crumb[] {
  const navPath = getNavItemPath(pathname);
  if (navPath.length === 0) {
    return [{ label: "홈", to: "/" }];
  }
  return navPath.map((item) => ({
    label: item.label,
    to: item.path,
  }));
}

/**
 * 경로에서 quickTabs 자동 생성 (형제 메뉴, navConfig 기반)
 */
export function getQuickTabs(pathname: string): QuickTab[] {
  const siblings = getNavItemSiblings(pathname);
  return siblings
    .filter((item) => !item.hidden && !item.comingSoon)
    .map((item) => ({
      label: item.label,
      to: item.path,
    }));
}
