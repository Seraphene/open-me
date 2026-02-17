import { Grid2x2, Home, Settings } from "lucide-react";

type SidebarNavProps = {
  active: "home" | "categories" | "settings";
  onSelect: (key: "home" | "categories" | "settings") => void;
};

const items: Array<{
  key: "home" | "categories" | "settings";
  label: string;
  Icon: typeof Home;
}> = [
  { key: "home", label: "Home", Icon: Home },
  { key: "categories", label: "Categories", Icon: Grid2x2 },
  { key: "settings", label: "Settings", Icon: Settings }
];

function SidebarNav({ active, onSelect }: SidebarNavProps) {
  return (
    <nav className="gift-sidebar" aria-label="Primary">
      <div className="gift-sidebar__brand" aria-hidden="true">
        G
      </div>
      <ul className="gift-sidebar__list">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`gift-sidebar__button ${active === item.key ? "is-active" : ""}`}
              onClick={() => onSelect(item.key)}
              aria-pressed={active === item.key}
              aria-label={item.label}
            >
              <item.Icon size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;
