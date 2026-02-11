import { Link } from "react-router-dom";
import "./menu-page.css";

export type MenuPageItem = {
  title: string;
  lines: string[];
  to?: string;
  disabled?: boolean;
};

type MenuPageProps = {
  title: string;
  description?: string;
  items: MenuPageItem[];
};

export default function MenuPage({ title, description, items }: MenuPageProps) {
  const showDescription = false;

  return (
    <div className="card menu-page">
      <h1 className="h1">{title}</h1>
      {showDescription && description ? <p className="p">{description}</p> : null}

      <div className="divider" />

      <div className="menu-page__grid">
        {items.map((item) => {
          const content = (
            <>
              <div className="menu-page__item-title">{item.title}</div>
              <ul className="menu-page__item-list">
                {item.lines.map((line) => (
                  <li key={`${item.title}:${line}`}>{line}</li>
                ))}
              </ul>
            </>
          );

          if (item.to && !item.disabled) {
            return (
              <Link key={item.title} to={item.to} className="menu-page__item">
                {content}
              </Link>
            );
          }

          return (
            <div key={item.title} className="menu-page__item menu-page__item--disabled">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
