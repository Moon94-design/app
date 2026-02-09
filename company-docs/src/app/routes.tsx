import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./shell/Shell";
import { NAV_CONFIG, type NavItem } from "./nav/navConfig";

/**
 * NavItem 계층 구조를 flat한 Route 배열로 변환 (재귀)
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

export default function AppRoutes() {
  const allRoutes = flattenRoutes(NAV_CONFIG);

  return (
    <Shell>
      <Routes>
        {allRoutes.map((item) => {
          const Component = item.component;
          return Component ? (
            <Route key={item.path} path={item.path} element={<Component />} />
          ) : null;
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
