import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/open", label: "Experience" },
  { to: "/story", label: "Story" }
];

function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `site-nav-link ${isActive ? "site-nav-link--active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default SiteNav;
