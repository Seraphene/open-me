import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppTheme = "blush" | "lavender" | "cream";

type UiPreferencesContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  motionEnabled: boolean;
  setMotionEnabled: (enabled: boolean) => void;
  reducedMotionPreferred: boolean;
  effectiveMotionEnabled: boolean;
};

const themeStorageKey = "openme.theme";
const motionStorageKey = "openme.motionEnabled";

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

function readSavedTheme(): AppTheme {
  const stored = window.localStorage.getItem(themeStorageKey);
  if (stored === "blush" || stored === "lavender" || stored === "cream") {
    return stored;
  }

  return "blush";
}

function readSavedMotionEnabled() {
  const stored = window.localStorage.getItem(motionStorageKey);
  if (stored === null) {
    return true;
  }

  return stored === "true";
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(() =>
    typeof window === "undefined" ? "blush" : readSavedTheme()
  );
  const [motionEnabled, setMotionEnabled] = useState<boolean>(() =>
    typeof window === "undefined" ? true : readSavedMotionEnabled()
  );
  const [reducedMotionPreferred, setReducedMotionPreferred] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setReducedMotionPreferred(query.matches);
    };

    handleChange();
    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(motionStorageKey, String(motionEnabled));
  }, [motionEnabled]);

  const value = useMemo<UiPreferencesContextValue>(
    () => ({
      theme,
      setTheme,
      motionEnabled,
      setMotionEnabled,
      reducedMotionPreferred,
      effectiveMotionEnabled: motionEnabled && !reducedMotionPreferred
    }),
    [motionEnabled, reducedMotionPreferred, theme]
  );

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUiPreferences() {
  const context = useContext(UiPreferencesContext);
  if (!context) {
    throw new Error("useUiPreferences must be used within UiPreferencesProvider");
  }

  return context;
}
