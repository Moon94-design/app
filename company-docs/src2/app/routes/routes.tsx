import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "../shell/Shell";
import { NAV_CONFIG, type NavItem } from "../nav/navConfig";

/**
 * NavItem 계층 구조를 flat한 Route 배열로 변환 (재귀)
 * 이 함수는 수정하지 않는다(로직 고정).
 */
function flattenRoutes(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) {
      result.push(...flattenRoutes(item.children));
    }
  }
  return result;
}

/**
 * AppRoutes — navConfig → flattenRoutes → React.lazy(loader) → <Routes>
 * Suspense는 여기에 없음 (App.tsx 전역에서 처리).
 */
const ROUTE_ENTRIES = flattenRoutes(NAV_CONFIG)
  .filter((item) => !!item.loader)
  .map((item) => ({
    path: item.path,
    Component: lazy(item.loader!),
  }));

export default function AppRoutes() {
  return (
    <Shell>
      <Routes>
        {ROUTE_ENTRIES.map((item) => {
          return (
            <Route
              key={item.path}
              path={item.path}
              element={<item.Component />}
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
