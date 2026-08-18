import { createContext } from "react";

import type { Theme, ThemeKind } from "./Theme.types";

export type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ThemeKind.LIGHT | ThemeKind.DARK;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
