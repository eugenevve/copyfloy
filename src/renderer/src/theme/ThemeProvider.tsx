import { useEffect, useState, type FC, type PropsWithChildren } from "react";

import { getSystemTheme, THEME_KEY, ThemeKind, type Theme } from "./Theme.types";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) ?? ThemeKind.SYSTEM;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ThemeKind.LIGHT | ThemeKind.DARK>(ThemeKind.LIGHT);

  useEffect(() => {
    const update = () => {
      const resolved = theme === ThemeKind.SYSTEM ? getSystemTheme() : theme;

      setResolvedTheme(resolved);

      document.documentElement.dataset.theme = resolved;
    };

    update();

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    if (theme === ThemeKind.SYSTEM) media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [theme]);

  const changeTheme = (value: Theme) => {
    localStorage.setItem(THEME_KEY, value);

    setTheme(value);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme: changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
