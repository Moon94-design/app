import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getBreadcrumb, getQuickTabs } from "../nav/navModel";
import "./shell.css";

export default function Shell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();

  const crumbs = getBreadcrumb(loc.pathname);
  const tabs = getQuickTabs(loc.pathname);

  const isHome = loc.pathname === "/";

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [loc.pathname]);

  function handleBack() {
    nav(-1);
    // Browser back can restore old scroll; force top again after navigation.
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="topbar">
          <div className="brand">
            <div className="logoBox" aria-hidden="true" />
            <div className="brandText">
              <div className="brandTitle">달구벌 산업 (주)</div>
            </div>
          </div>
          <div />
          <div className="topActions">
            {!isHome ? (
              <Link to="/" className="homeBtn">
                홈
              </Link>
            ) : (
              <span className="homeBtnPlaceholder" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="navline">
          <div className="navlineInner">
            <div className="crumbs" aria-label="breadcrumb">
              {crumbs.map((c, idx) => (
                <span key={c.to} className="crumbItem">
                  <Link to={c.to} className="crumbLink">
                    {c.label}
                  </Link>
                  {idx < crumbs.length - 1 ? <span className="crumbSep">›</span> : null}
                </span>
              ))}
            </div>
          </div>

          <div className="tabRow" aria-label="quick-tabs">
            {tabs.length > 0
              ? tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) => `tabBtn ${isActive ? "active" : ""}`}
                >
                  {t.label}
                </NavLink>
              ))
              : <span className="tabPlaceholder" aria-hidden="true" />}
          </div>
        </div>
      </header>

      <main className="content">
        <div className="contentTopActions">
          {!isHome ? (
            <button type="button" className="btn" onClick={handleBack}>
              뒤로
            </button>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
