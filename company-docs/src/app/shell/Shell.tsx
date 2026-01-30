import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getBreadcrumb, getQuickTabs } from "../nav/navModel";
import "./shell.css";

export default function Shell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();

  const crumbs = getBreadcrumb(loc.pathname);
  const tabs = getQuickTabs(loc.pathname);

  const isHome = loc.pathname === "/";

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

          <div className="topActions">
            <button type="button" className="iconBtn" onClick={() => nav(-1)} aria-label="뒤로">
              ‹
            </button>
            <button type="button" className="iconBtn" onClick={() => nav(1)} aria-label="앞으로">
              ›
            </button>

            {!isHome ? (
              <Link to="/" className="homeBtn">
                홈
              </Link>
            ) : null}
          </div>
        </div>

        {tabs.length ? (
          <div className="subbar" aria-label="quick-tabs">
            <div className="tabRow">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) => `tabBtn ${isActive ? "active" : ""}`}
                >
                  {t.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
