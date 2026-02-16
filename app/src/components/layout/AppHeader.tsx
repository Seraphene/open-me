import { useUiPreferences, type AppTheme } from "../../lib/uiPreferences";

type AppHeaderProps = {
  title: string;
  subtitle: string;
};

function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme, setTheme, motionEnabled, setMotionEnabled, reducedMotionPreferred } = useUiPreferences();

  const themeOptions: Array<{ value: AppTheme; label: string }> = [
    { value: "blush", label: "Blush" },
    { value: "lavender", label: "Lavender" },
    { value: "cream", label: "Cream" }
  ];

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="header-controls" aria-label="Display preferences">
        <label>
          Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value as AppTheme)}>
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Motion
          <input
            type="checkbox"
            checked={motionEnabled}
            onChange={(event) => setMotionEnabled(event.target.checked)}
            disabled={reducedMotionPreferred}
          />
        </label>
      </div>
    </header>
  );
}

export default AppHeader;
